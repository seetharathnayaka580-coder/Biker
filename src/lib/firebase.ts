import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  doc,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  Auth,
  User,
} from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { AppState, MaintenanceNote, ServiceRecord, VehicleDetails } from '../types';
import { SEED_STATE, getSeedStateForBike } from '../data/seed';

// Suppress Firestore internal connection retry warnings
setLogLevel('silent');

export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db: Firestore = (() => {
  try {
    const databaseId = firebaseConfigJson.firestoreDatabaseId;
    if (databaseId) {
      return initializeFirestore(
        app,
        {
          experimentalAutoDetectLongPolling: true,
        },
        databaseId
      );
    }
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    return firebaseConfigJson.firestoreDatabaseId
      ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
      : getFirestore(app);
  }
})();

export const auth: Auth = getAuth(app);

export const DEFAULT_BIKE_ID = 'BKT-1374';

// Initialize anonymous auth session safely
export function initAuth(): Promise<User | null> {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch (err) {
          console.warn('Anonymous auth failed, continuing in guest mode:', err);
          resolve(null);
        }
      }
    });
  });
}

// Google Sign-In with popup
export async function signInWithGooglePopup(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Sign out function
export async function signOutFromFirebase(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.warn('Firebase sign out notice:', err);
  }
}

// Subscribe to real-time bike document and its services / notes subcollections
export function subscribeToBike(
  bikeId: string = DEFAULT_BIKE_ID,
  onData: (state: AppState) => void,
  onError?: (error: Error) => void
) {
  const bikeDocRef = doc(db, 'bikes', bikeId);
  const servicesColRef = collection(db, 'bikes', bikeId, 'services');
  const notesColRef = collection(db, 'bikes', bikeId, 'notes');

  const seedTemplate = getSeedStateForBike(bikeId);
  const isPrimarySachiBike = bikeId === 'BKT-1374';

  let currentVehicle: VehicleDetails = { ...seedTemplate.vehicle };
  let currentOdo: number = seedTemplate.odometer;
  let currentTargets: number[] = [...seedTemplate.targets];
  let currentInterval: number = seedTemplate.serviceInterval;
  let currentServices: ServiceRecord[] = [];
  let currentNotes: MaintenanceNote[] = [];
  let hasReceivedMainDoc = false;

  const emit = () => {
    let finalServices = [...currentServices];

    // Only for the primary BKT-1374 bike, ensure initial locked seed services exist if empty
    if (isPrimarySachiBike) {
      const mergedServices = finalServices.length > 0 ? finalServices : [...SEED_STATE.services];
      SEED_STATE.services.forEach((seedSvc) => {
        const idx = mergedServices.findIndex((s) => s.id === seedSvc.id);
        if (idx === -1) {
          mergedServices.push({ ...seedSvc });
        } else {
          mergedServices[idx] = { ...mergedServices[idx], locked: true };
        }
      });
      finalServices = mergedServices;
    }

    onData({
      bikeId,
      vehicle: currentVehicle,
      odometer: currentOdo,
      targets: currentTargets,
      serviceInterval: currentInterval,
      services: finalServices,
      notes: currentNotes,
    });
  };

  // 1. Listen to bike main doc
  const unsubDoc = onSnapshot(
    bikeDocRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        currentVehicle = {
          owner: data.owner ?? SEED_STATE.vehicle.owner,
          model: data.model ?? SEED_STATE.vehicle.model,
          colour: data.colour ?? SEED_STATE.vehicle.colour,
          regNo: data.regNo ?? SEED_STATE.vehicle.regNo,
          chassisNo: data.chassisNo ?? SEED_STATE.vehicle.chassisNo,
          engineNo: data.engineNo ?? SEED_STATE.vehicle.engineNo,
          bookNo: data.bookNo ?? SEED_STATE.vehicle.bookNo,
          photoUrl: data.photoUrl ?? SEED_STATE.vehicle.photoUrl,
          ownerPhotoUrl: data.ownerPhotoUrl ?? SEED_STATE.vehicle.ownerPhotoUrl,
        };
        currentOdo = typeof data.odometer === 'number' ? data.odometer : SEED_STATE.odometer;
        currentTargets = Array.isArray(data.targets) && data.targets.length ? data.targets : [...SEED_STATE.targets];
        currentInterval = typeof data.serviceInterval === 'number' ? data.serviceInterval : SEED_STATE.serviceInterval;
        hasReceivedMainDoc = true;
        emit();
      } else {
        // Document does not exist yet -> bootstrap with seed state
        hasReceivedMainDoc = true;
        try {
          await initializeFirestoreSeed(bikeId);
        } catch (e) {
          console.warn('Initial Firestore seed initialization:', e);
        }
        emit();
      }
    },
    (err) => {
      console.error('Error listening to bike document:', err);
      if (onError) onError(err);
    }
  );

  // 2. Listen to services subcollection
  const unsubServices = onSnapshot(
    servicesColRef,
    (snapshot) => {
      const list: ServiceRecord[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        list.push({
          id: docSnap.id,
          label: item.label,
          date: item.date,
          km: Number(item.km),
          dealer: item.dealer,
          note: item.note,
          cost: item.cost,
          partsReplaced: item.partsReplaced,
          locked: item.locked,
        });
      });
      currentServices = list;
      if (hasReceivedMainDoc) emit();
    },
    (err) => {
      console.error('Error listening to services subcollection:', err);
      if (onError) onError(err);
    }
  );

  // 3. Listen to notes subcollection
  const unsubNotes = onSnapshot(
    notesColRef,
    (snapshot) => {
      const list: MaintenanceNote[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        list.push({
          id: docSnap.id,
          text: item.text,
          date: item.date,
          km: item.km !== undefined && item.km !== null ? Number(item.km) : null,
          category: item.category,
        });
      });
      // Sort notes by date desc
      currentNotes = list.sort((a, b) => b.date.localeCompare(a.date));
      if (hasReceivedMainDoc) emit();
    },
    (err) => {
      console.error('Error listening to notes subcollection:', err);
      if (onError) onError(err);
    }
  );

  return () => {
    unsubDoc();
    unsubServices();
    unsubNotes();
  };
}

// Bootstrap Firestore database with seed data if empty
export async function initializeFirestoreSeed(bikeId: string = DEFAULT_BIKE_ID): Promise<void> {
  try {
    const seed = getSeedStateForBike(bikeId);
    const bikeDocRef = doc(db, 'bikes', bikeId);
    const snap = await getDoc(bikeDocRef);
    if (!snap.exists()) {
      await setDoc(bikeDocRef, {
        ...seed.vehicle,
        odometer: seed.odometer,
        targets: seed.targets,
        serviceInterval: seed.serviceInterval,
        updatedAt: new Date().toISOString(),
      });

      // Seed services if any
      for (const svc of seed.services) {
        const svcRef = doc(db, 'bikes', bikeId, 'services', svc.id);
        await setDoc(svcRef, {
          ...svc,
          createdAt: new Date().toISOString(),
        });
      }

      // Seed notes if any
      for (const note of seed.notes) {
        const noteRef = doc(db, 'bikes', bikeId, 'notes', note.id);
        await setDoc(noteRef, {
          ...note,
          createdAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn('Firestore seed notice (offline/transient):', err);
  }
}

// Clear all service history and garage notes from Cloud Firestore for a given bike
export async function clearAllBikeDataFromCloud(bikeId: string = DEFAULT_BIKE_ID): Promise<void> {
  try {
    const batch = writeBatch(db);

    // 1. Delete all service records in subcollection
    const servicesColRef = collection(db, 'bikes', bikeId, 'services');
    const servicesSnap = await getDocs(servicesColRef);
    servicesSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    // 2. Delete all notes in subcollection
    const notesColRef = collection(db, 'bikes', bikeId, 'notes');
    const notesSnap = await getDocs(notesColRef);
    notesSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    // 3. Reset main bike document odometer to 0 and targets to 2500
    const bikeDocRef = doc(db, 'bikes', bikeId);
    batch.update(bikeDocRef, {
      odometer: 0,
      targets: [2500],
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();
  } catch (err) {
    console.warn('Firestore clear all data notice (cached locally):', err);
  }
}

// Cloud Mutation Operations
export async function saveVehicleToCloud(vehicle: VehicleDetails, bikeId: string = DEFAULT_BIKE_ID): Promise<void> {
  try {
    const bikeDocRef = doc(db, 'bikes', bikeId);
    await setDoc(
      bikeDocRef,
      {
        ...vehicle,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore vehicle sync notice (cached locally):', err);
  }
}

export async function saveOdometerToCloud(odometer: number, targets?: number[], bikeId: string = DEFAULT_BIKE_ID): Promise<void> {
  try {
    const bikeDocRef = doc(db, 'bikes', bikeId);
    const payload: Record<string, unknown> = {
      odometer,
      updatedAt: new Date().toISOString(),
    };
    if (targets) {
      payload.targets = targets;
    }
    await updateDoc(bikeDocRef, payload);
  } catch (err) {
    console.warn('Firestore odometer sync notice (cached locally):', err);
  }
}

export async function saveTargetToCloud(targets: number[], bikeId: string = DEFAULT_BIKE_ID): Promise<void> {
  try {
    const bikeDocRef = doc(db, 'bikes', bikeId);
    await updateDoc(bikeDocRef, {
      targets,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firestore target sync notice (cached locally):', err);
  }
}

export async function addServiceToCloud(service: ServiceRecord, bikeId: string = DEFAULT_BIKE_ID): Promise<void> {
  try {
    const svcDocRef = doc(db, 'bikes', bikeId, 'services', service.id);
    await setDoc(svcDocRef, {
      ...service,
      createdAt: new Date().toISOString(),
    });

    // Also update bike odometer if service km is higher
    const bikeDocRef = doc(db, 'bikes', bikeId);
    const snap = await getDoc(bikeDocRef);
    if (snap.exists()) {
      const current = snap.data();
      const curOdo = current.odometer || 0;
      const curTargets = current.targets || [7688];
      const newOdo = Math.max(curOdo, service.km);
      const newTargets = [...curTargets];
      if (service.km >= (newTargets[0] || Infinity)) {
        newTargets[0] = service.km + (current.serviceInterval || 2500);
      }
      await updateDoc(bikeDocRef, {
        odometer: newOdo,
        targets: newTargets,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Firestore service log sync notice (cached locally):', err);
  }
}

export async function deleteServiceFromCloud(serviceId: string, bikeId: string = DEFAULT_BIKE_ID): Promise<void> {
  try {
    const svcDocRef = doc(db, 'bikes', bikeId, 'services', serviceId);
    await deleteDoc(svcDocRef);
  } catch (err) {
    console.warn('Firestore delete service notice (cached locally):', err);
  }
}

export async function addNoteToCloud(note: MaintenanceNote, bikeId: string = DEFAULT_BIKE_ID): Promise<void> {
  try {
    const noteDocRef = doc(db, 'bikes', bikeId, 'notes', note.id);
    await setDoc(noteDocRef, {
      ...note,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firestore add note notice (cached locally):', err);
  }
}

export async function deleteNoteFromCloud(noteId: string, bikeId: string = DEFAULT_BIKE_ID): Promise<void> {
  try {
    const noteDocRef = doc(db, 'bikes', bikeId, 'notes', noteId);
    await deleteDoc(noteDocRef);
  } catch (err) {
    console.warn('Firestore delete note notice (cached locally):', err);
  }
}
