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
import { AppState, AuthSession, LoginLog, MaintenanceNote, ServiceRecord, UserAccount, UserRole, VehicleDetails } from '../types';
import { SEED_STATE, getSeedStateForBike } from '../data/seed';
import { fetchClientNetworkInfo } from '../utils/ipTracker';

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

// Helper to strip undefined values so Firestore does not throw "Unsupported field value: undefined"
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        result[key] = sanitizeForFirestore(val);
      } else {
        result[key] = val;
      }
    }
  }
  return result;
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
          owner: data.owner ?? seedTemplate.vehicle.owner,
          model: data.model ?? seedTemplate.vehicle.model,
          colour: data.colour ?? seedTemplate.vehicle.colour,
          regNo: data.regNo ?? seedTemplate.vehicle.regNo,
          chassisNo: data.chassisNo ?? seedTemplate.vehicle.chassisNo,
          engineNo: data.engineNo ?? seedTemplate.vehicle.engineNo,
          bookNo: data.bookNo ?? seedTemplate.vehicle.bookNo,
          absSystem: data.absSystem ?? seedTemplate.vehicle.absSystem,
          oilSpec: data.oilSpec ?? seedTemplate.vehicle.oilSpec,
          fuelType: data.fuelType ?? seedTemplate.vehicle.fuelType,
          tyrePressures: data.tyrePressures ?? seedTemplate.vehicle.tyrePressures,
          authority: data.authority ?? seedTemplate.vehicle.authority,
          district: data.district ?? seedTemplate.vehicle.district,
          province: data.province ?? seedTemplate.vehicle.province,
          photoUrl: data.photoUrl !== undefined ? data.photoUrl : seedTemplate.vehicle.photoUrl,
          ownerPhotoUrl: data.ownerPhotoUrl !== undefined ? data.ownerPhotoUrl : seedTemplate.vehicle.ownerPhotoUrl,
        };
        currentOdo = typeof data.odometer === 'number' ? data.odometer : seedTemplate.odometer;
        currentTargets = Array.isArray(data.targets) && data.targets.length ? data.targets : [...seedTemplate.targets];
        currentInterval = typeof data.serviceInterval === 'number' ? data.serviceInterval : seedTemplate.serviceInterval;
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
          label: item.label || '',
          date: item.date || '',
          km: Number(item.km) || 0,
          dealer: item.dealer || '',
          note: item.note || '',
          cost: typeof item.cost === 'number' ? item.cost : undefined,
          partsReplaced: Array.isArray(item.partsReplaced) ? item.partsReplaced : undefined,
          locked: Boolean(item.locked),
        });
      });
      // Sort services by date desc / km desc
      currentServices = list.sort((a, b) => b.km - a.km);
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
          text: item.text || '',
          date: item.date || '',
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
      await setDoc(
        bikeDocRef,
        sanitizeForFirestore({
          ...seed.vehicle,
          odometer: seed.odometer,
          targets: seed.targets,
          serviceInterval: seed.serviceInterval,
          updatedAt: new Date().toISOString(),
        })
      );

      // Seed services if any
      for (const svc of seed.services) {
        const svcRef = doc(db, 'bikes', bikeId, 'services', svc.id);
        await setDoc(
          svcRef,
          sanitizeForFirestore({
            ...svc,
            createdAt: new Date().toISOString(),
          })
        );
      }

      // Seed notes if any
      for (const note of seed.notes) {
        const noteRef = doc(db, 'bikes', bikeId, 'notes', note.id);
        await setDoc(
          noteRef,
          sanitizeForFirestore({
            ...note,
            createdAt: new Date().toISOString(),
          })
        );
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
    const sanitized = sanitizeForFirestore({
      ...vehicle,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(bikeDocRef, sanitized, { merge: true });
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
    await setDoc(bikeDocRef, sanitizeForFirestore(payload), { merge: true });
  } catch (err) {
    console.warn('Firestore odometer sync notice (cached locally):', err);
  }
}

export async function saveTargetToCloud(targets: number[], bikeId: string = DEFAULT_BIKE_ID): Promise<void> {
  try {
    const bikeDocRef = doc(db, 'bikes', bikeId);
    await setDoc(
      bikeDocRef,
      sanitizeForFirestore({
        targets,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore target sync notice (cached locally):', err);
  }
}

export async function addServiceToCloud(service: ServiceRecord, bikeId: string = DEFAULT_BIKE_ID): Promise<void> {
  try {
    const svcDocRef = doc(db, 'bikes', bikeId, 'services', service.id);
    await setDoc(
      svcDocRef,
      sanitizeForFirestore({
        ...service,
        createdAt: new Date().toISOString(),
      })
    );

    // Also update bike odometer if service km is higher
    const seedTemplate = getSeedStateForBike(bikeId);
    const bikeDocRef = doc(db, 'bikes', bikeId);
    const snap = await getDoc(bikeDocRef);
    if (snap.exists()) {
      const current = snap.data();
      const curOdo = typeof current.odometer === 'number' ? current.odometer : seedTemplate.odometer;
      const curTargets = Array.isArray(current.targets) && current.targets.length ? current.targets : seedTemplate.targets;
      const newOdo = Math.max(curOdo, service.km);
      const newTargets = [...curTargets];
      if (service.km >= (newTargets[0] || Infinity)) {
        newTargets[0] = service.km + (current.serviceInterval || seedTemplate.serviceInterval || 2500);
      }
      await setDoc(
        bikeDocRef,
        sanitizeForFirestore({
          odometer: newOdo,
          targets: newTargets,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
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
    await setDoc(
      noteDocRef,
      sanitizeForFirestore({
        ...note,
        createdAt: new Date().toISOString(),
      })
    );
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

// ==========================================
// USER ACCOUNTS & SIGN UP / AUTHENTICATION
// ==========================================

const USERS_STORAGE_KEY = 'bajaj_user_accounts_v1';

export function getLocalAccounts(): Record<string, UserAccount> {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalAccount(account: UserAccount): void {
  try {
    const current = getLocalAccounts();
    current[account.username.toLowerCase()] = account;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Could not save local account:', e);
  }
}

export async function registerAdminUser(data: {
  username: string;
  password: string;
  ownerName: string;
  bikeNumber: string;
  district: string;
  province: string;
  email?: string;
}): Promise<{ session: AuthSession; userAccount: UserAccount }> {
  const normUser = data.username.trim().toLowerCase();
  if (!normUser) throw new Error('Username is required.');
  if (normUser === 'sachi' || normUser === 'chathura') {
    throw new Error('This username is reserved. Please choose another username.');
  }

  // Generate clean bike ID
  const cleanPlate = data.bikeNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
  const bikeId = `bike_${normUser}_${cleanPlate || 'REG'}`;

  const userAccount: UserAccount = {
    username: normUser,
    password: data.password.trim(),
    ownerName: data.ownerName.trim(),
    bikeNumber: data.bikeNumber.trim().toUpperCase(),
    district: data.district.trim(),
    province: data.province.trim(),
    role: 'admin',
    bikeId: bikeId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    email: data.email?.trim(),
  };

  // 1. Check if user already exists in Firestore
  try {
    const userDocRef = doc(db, 'users', normUser);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      throw new Error('Username already exists. Please choose a different username.');
    }

    // Save user to Firestore
    await setDoc(userDocRef, sanitizeForFirestore(userAccount));
  } catch (err: any) {
    if (err.message && err.message.includes('already exists')) {
      throw err;
    }
    console.warn('Firestore user registration notice:', err);
  }

  // 2. Initialize bike document in Firestore
  try {
    const bikeDocRef = doc(db, 'bikes', bikeId);
    const bikeVehicle: VehicleDetails = {
      owner: userAccount.ownerName,
      regNo: userAccount.bikeNumber,
      district: userAccount.district,
      province: userAccount.province,
      model: 'Bajaj Pulsar N160 Dual Channel ABS',
      colour: 'Brooklyn Black',
      chassisNo: `MD2B54DX-${normUser.toUpperCase()}-01`,
      engineNo: `PDXCSH-${normUser.toUpperCase()}-01`,
      bookNo: `POR0022026-${normUser.toUpperCase()}`,
      absSystem: 'Dual-Channel ABS',
      oilSpec: '20W50 (1150 ml)',
      fuelType: 'Octane 95 Euro-4',
      tyrePressures: 'F: 25 PSI / R: 28-32',
      authority: 'Dept. of Motor Traffic (Sri Lanka)',
    };

    await setDoc(
      bikeDocRef,
      sanitizeForFirestore({
        ...bikeVehicle,
        odometer: 0,
        targets: [2500],
        serviceInterval: 2500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.warn('Firestore bike init notice:', err);
  }

  // 3. Save to localStorage
  saveLocalAccount(userAccount);

  // Capture and log registration login IP
  try {
    const netInfo = await fetchClientNetworkInfo();
    const loc = [netInfo.city, netInfo.region, netInfo.country].filter(Boolean).join(', ') || 'Sri Lanka';
    await recordLoginLog({
      username: normUser,
      role: 'admin',
      ip: netInfo.ip,
      location: loc,
      device: netInfo.device,
      userAgent: netInfo.userAgent,
      status: 'success',
      timestamp: new Date().toISOString(),
      bikeId,
      bikeNumber: userAccount.bikeNumber,
      ownerName: userAccount.ownerName,
    });
  } catch (e) {
    console.warn('Register login log notice:', e);
  }

  const session: AuthSession = {
    role: 'admin',
    username: userAccount.ownerName || userAccount.username,
    bikeId: bikeId,
    district: userAccount.district,
    province: userAccount.province,
    bikeNumber: userAccount.bikeNumber,
    signedInAt: new Date().toISOString(),
  };

  return { session, userAccount };
}

// ==========================================
// LOGIN AUDIT LOGS & IP TRACKING
// ==========================================

export async function recordLoginLog(logData: Omit<LoginLog, 'id'>): Promise<string> {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const logDoc: LoginLog = {
    id: logId,
    ...logData,
  };

  try {
    const logRef = doc(db, 'login_logs', logId);
    await setDoc(logRef, sanitizeForFirestore(logDoc));

    // Also update last login info on the user's account in Firestore if exists
    if (logData.status === 'success' && logData.username) {
      const userDocRef = doc(db, 'users', logData.username.toLowerCase());
      await setDoc(
        userDocRef,
        sanitizeForFirestore({
          lastLoginIp: logData.ip,
          lastLoginAt: logData.timestamp,
          lastLoginLocation: logData.location,
          lastLoginDevice: logData.device,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('Firestore login log record notice (cached locally):', err);
  }

  // Store in local storage fallback
  try {
    const logsRaw = localStorage.getItem('bajaj_login_logs_cache');
    const existing: LoginLog[] = logsRaw ? JSON.parse(logsRaw) : [];
    const updated = [logDoc, ...existing].slice(0, 100);
    localStorage.setItem('bajaj_login_logs_cache', JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not cache login log locally:', e);
  }

  return logId;
}

export function subscribeToLoginLogs(
  onData: (logs: LoginLog[]) => void,
  onError?: (err: Error) => void
): () => void {
  const logsColRef = collection(db, 'login_logs');

  const unsub = onSnapshot(
    logsColRef,
    (snapshot) => {
      const list: LoginLog[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        list.push({
          id: docSnap.id,
          username: item.username || 'unknown',
          role: item.role || 'client',
          ip: item.ip || 'Unknown IP',
          location: item.location,
          device: item.device,
          userAgent: item.userAgent,
          status: item.status || 'success',
          timestamp: item.timestamp || new Date().toISOString(),
          bikeId: item.bikeId,
          bikeNumber: item.bikeNumber,
          ownerName: item.ownerName,
        });
      });

      // Sort newest first
      const sorted = list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      onData(sorted);
    },
    (err) => {
      console.warn('Error subscribing to login_logs collection:', err);
      // Fallback to local storage cache
      try {
        const raw = localStorage.getItem('bajaj_login_logs_cache');
        if (raw) onData(JSON.parse(raw));
      } catch {}
      if (onError) onError(err);
    }
  );

  return unsub;
}

export async function clearAllLoginLogsFromCloud(): Promise<void> {
  try {
    const logsColRef = collection(db, 'login_logs');
    const snap = await getDocs(logsColRef);
    const batch = writeBatch(db);
    snap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
    localStorage.removeItem('bajaj_login_logs_cache');
  } catch (err) {
    console.warn('Clear login logs notice:', err);
  }
}

// ==========================================
// ALL USERS REALTIME SUBSCRIPTION & MGMT
// ==========================================

export function subscribeToUsers(
  onData: (users: UserAccount[]) => void,
  onError?: (err: Error) => void
): () => void {
  const usersColRef = collection(db, 'users');

  const unsub = onSnapshot(
    usersColRef,
    (snapshot) => {
      const list: UserAccount[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as UserAccount;
        list.push({
          ...item,
          username: docSnap.id,
        });
      });

      // Also ensure standard default accounts (Sachi & Chathura) are present in the list if not stored in firestore
      const hasSachi = list.some((u) => u.username.toLowerCase() === 'sachi');
      if (!hasSachi) {
        list.unshift({
          username: 'sachi',
          password: '•••••• (988800)',
          ownerName: 'Pathum Sachintha',
          bikeNumber: 'BKT-1374',
          district: 'Kurunegala',
          province: 'North Western Province',
          role: 'admin',
          bikeId: 'BKT-1374',
          createdAt: '2024-01-01T00:00:00.000Z',
          status: 'active',
        });
      }

      const hasChathura = list.some((u) => u.username.toLowerCase() === 'chathura');
      if (!hasChathura) {
        list.push({
          username: 'chathura',
          password: 'password-200135',
          ownerName: 'Chathura (Admin)',
          bikeNumber: 'WP BKT-2001',
          district: 'Western Province',
          province: 'Western Province',
          role: 'admin',
          bikeId: 'chathura_bike',
          createdAt: '2024-02-01T00:00:00.000Z',
          status: 'active',
        });
      }

      onData(list);
    },
    (err) => {
      console.warn('Error subscribing to users collection:', err);
      // Fallback to local accounts
      const local = Object.values(getLocalAccounts());
      onData(local);
      if (onError) onError(err);
    }
  );

  return unsub;
}

// Create new Manager or Client account by Owner Sachi
export async function createUserByOwnerOrManager(data: {
  username: string;
  password: string;
  ownerName: string;
  bikeNumber: string;
  district: string;
  province: string;
  role: UserRole;
  email?: string;
  phone?: string;
  createdBy?: string;
}): Promise<{ userAccount: UserAccount }> {
  const normUser = data.username.trim().toLowerCase();
  if (!normUser) throw new Error('Username is required.');
  if (normUser === 'sachi') {
    throw new Error('Username "sachi" is reserved for the primary owner.');
  }

  // Generate clean bike ID
  const cleanPlate = data.bikeNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
  const bikeId = `bike_${normUser}_${cleanPlate || 'REG'}`;

  const userAccount: UserAccount = {
    username: normUser,
    password: data.password.trim(),
    ownerName: data.ownerName.trim(),
    bikeNumber: data.bikeNumber.trim().toUpperCase(),
    district: data.district.trim(),
    province: data.province.trim(),
    role: data.role,
    bikeId: bikeId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    email: data.email?.trim(),
    phone: data.phone?.trim(),
    status: 'active',
    createdBy: data.createdBy || 'sachi',
  };

  // 1. Save user in Firestore
  const userDocRef = doc(db, 'users', normUser);
  await setDoc(userDocRef, sanitizeForFirestore(userAccount));

  // 2. Initialize corresponding bike document in Firestore
  try {
    const bikeDocRef = doc(db, 'bikes', bikeId);
    const snap = await getDoc(bikeDocRef);
    if (!snap.exists()) {
      const bikeVehicle: VehicleDetails = {
        owner: userAccount.ownerName,
        regNo: userAccount.bikeNumber,
        district: userAccount.district,
        province: userAccount.province,
        model: 'Bajaj Pulsar N160 Dual Channel ABS',
        colour: 'Brooklyn Black',
        chassisNo: `MD2B54DX-${normUser.toUpperCase()}-01`,
        engineNo: `PDXCSH-${normUser.toUpperCase()}-01`,
        bookNo: `POR0022026-${normUser.toUpperCase()}`,
        absSystem: 'Dual-Channel ABS',
        oilSpec: '20W50 (1150 ml)',
        fuelType: 'Octane 95 Euro-4',
        tyrePressures: 'F: 25 PSI / R: 28-32',
        authority: 'Dept. of Motor Traffic (Sri Lanka)',
      };

      await setDoc(
        bikeDocRef,
        sanitizeForFirestore({
          ...bikeVehicle,
          odometer: 0,
          targets: [2500],
          serviceInterval: 2500,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
    }
  } catch (err) {
    console.warn('Firestore bike document init notice:', err);
  }

  // 3. Save to localStorage
  saveLocalAccount(userAccount);

  return { userAccount };
}

// Delete user account
export async function deleteUserAccountFromCloud(username: string): Promise<void> {
  const normUser = username.trim().toLowerCase();
  if (normUser === 'sachi') {
    throw new Error('Cannot delete the primary owner account.');
  }

  try {
    const userDocRef = doc(db, 'users', normUser);
    await deleteDoc(userDocRef);
  } catch (err) {
    console.warn('Firestore delete user notice:', err);
  }

  // Remove from local cache
  const current = getLocalAccounts();
  delete current[normUser];
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(current));
}

// Change user password by Owner
export async function changeUserPasswordByOwner(username: string, newPass: string): Promise<void> {
  const normUser = username.trim().toLowerCase();
  if (!newPass.trim() || newPass.trim().length < 3) {
    throw new Error('Password must be at least 3 characters long.');
  }

  try {
    const userDocRef = doc(db, 'users', normUser);
    await setDoc(
      userDocRef,
      sanitizeForFirestore({
        password: newPass.trim(),
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore change password notice:', err);
  }

  // Update local cache
  const localAccounts = getLocalAccounts();
  if (localAccounts[normUser]) {
    localAccounts[normUser].password = newPass.trim();
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(localAccounts));
  }
}

// Toggle user status (Active / Suspended)
export async function toggleUserStatus(username: string, currentStatus: 'active' | 'suspended'): Promise<'active' | 'suspended'> {
  const normUser = username.trim().toLowerCase();
  const nextStatus: 'active' | 'suspended' = currentStatus === 'active' ? 'suspended' : 'active';

  try {
    const userDocRef = doc(db, 'users', normUser);
    await setDoc(
      userDocRef,
      sanitizeForFirestore({
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore toggle user status notice:', err);
  }

  const localAccounts = getLocalAccounts();
  if (localAccounts[normUser]) {
    localAccounts[normUser].status = nextStatus;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(localAccounts));
  }

  return nextStatus;
}

export async function loginUser(username: string, password: string): Promise<{ session: AuthSession; userAccount?: UserAccount }> {
  const trimmedUser = username.trim().toLowerCase();
  const trimmedPass = password.trim();

  // Detect client IP and network information for audit tracking
  let netInfo = {
    ip: '127.0.0.1 (Local)',
    city: 'Kurunegala',
    region: 'North Western',
    country: 'Sri Lanka',
    device: 'Desktop/Mobile Browser',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };

  try {
    const fetched = await fetchClientNetworkInfo();
    netInfo = {
      ...netInfo,
      ...fetched,
    };
  } catch {
    // Continue with default network info
  }

  const locationStr = [netInfo.city, netInfo.region, netInfo.country].filter(Boolean).join(', ') || 'Sri Lanka';

  // 1. Sachi Master Admin
  if (trimmedUser === 'sachi' && trimmedPass === '988800') {
    // Record login audit log
    await recordLoginLog({
      username: 'sachi',
      role: 'admin',
      ip: netInfo.ip,
      location: locationStr,
      device: netInfo.device,
      userAgent: netInfo.userAgent,
      status: 'success',
      timestamp: new Date().toISOString(),
      bikeId: 'BKT-1374',
      bikeNumber: 'BKT-1374',
      ownerName: 'Pathum Sachintha',
    });

    return {
      session: {
        role: 'admin',
        username: 'Pathum Sachintha',
        bikeId: 'BKT-1374',
        district: 'Kurunegala',
        province: 'North Western Province',
        bikeNumber: 'BKT-1374',
        loginIp: netInfo.ip,
        signedInAt: new Date().toISOString(),
      },
    };
  }

  // 2. Chathura Admin
  if (
    trimmedUser === 'chathura' &&
    (trimmedPass === 'password-200135' || trimmedPass === '200135')
  ) {
    await recordLoginLog({
      username: 'chathura',
      role: 'admin',
      ip: netInfo.ip,
      location: locationStr,
      device: netInfo.device,
      userAgent: netInfo.userAgent,
      status: 'success',
      timestamp: new Date().toISOString(),
      bikeId: 'chathura_bike',
      bikeNumber: 'WP Bxx-xxxx',
      ownerName: 'Chathura',
    });

    return {
      session: {
        role: 'admin',
        username: 'Chathura',
        bikeId: 'chathura_bike',
        district: 'Western Province',
        province: 'Western Province',
        bikeNumber: 'WP Bxx-xxxx',
        loginIp: netInfo.ip,
        signedInAt: new Date().toISOString(),
      },
    };
  }

  // 3. Check Firestore users collection
  try {
    const userDocRef = doc(db, 'users', trimmedUser);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as UserAccount;
      if (data.status === 'suspended') {
        throw new Error('This account has been suspended by the administrator.');
      }

      if (data.password === trimmedPass) {
        saveLocalAccount(data);

        // Record successful login
        await recordLoginLog({
          username: trimmedUser,
          role: data.role || 'client',
          ip: netInfo.ip,
          location: locationStr,
          device: netInfo.device,
          userAgent: netInfo.userAgent,
          status: 'success',
          timestamp: new Date().toISOString(),
          bikeId: data.bikeId || `bike_${trimmedUser}`,
          bikeNumber: data.bikeNumber,
          ownerName: data.ownerName,
        });

        return {
          session: {
            role: data.role || 'client',
            username: data.ownerName || data.username,
            bikeId: data.bikeId || `bike_${trimmedUser}`,
            district: data.district,
            province: data.province,
            bikeNumber: data.bikeNumber,
            loginIp: netInfo.ip,
            signedInAt: new Date().toISOString(),
          },
          userAccount: data,
        };
      } else {
        // Record failed login attempt
        await recordLoginLog({
          username: trimmedUser,
          role: data.role || 'client',
          ip: netInfo.ip,
          location: locationStr,
          device: netInfo.device,
          userAgent: netInfo.userAgent,
          status: 'failed',
          timestamp: new Date().toISOString(),
          bikeId: data.bikeId,
          bikeNumber: data.bikeNumber,
          ownerName: data.ownerName,
        });
        throw new Error('Incorrect password. Please verify and try again.');
      }
    }
  } catch (err: any) {
    if (err.message && (err.message.includes('Incorrect password') || err.message.includes('suspended'))) {
      throw err;
    }
    console.warn('Firestore user lookup notice, checking local cache:', err);
  }

  // 4. Check LocalStorage registered accounts
  const localAccounts = getLocalAccounts();
  const localAcc = localAccounts[trimmedUser];
  if (localAcc) {
    if (localAcc.status === 'suspended') {
      throw new Error('This account has been suspended by the administrator.');
    }

    if (localAcc.password === trimmedPass) {
      await recordLoginLog({
        username: trimmedUser,
        role: localAcc.role || 'client',
        ip: netInfo.ip,
        location: locationStr,
        device: netInfo.device,
        userAgent: netInfo.userAgent,
        status: 'success',
        timestamp: new Date().toISOString(),
        bikeId: localAcc.bikeId,
        bikeNumber: localAcc.bikeNumber,
        ownerName: localAcc.ownerName,
      });

      return {
        session: {
          role: localAcc.role || 'client',
          username: localAcc.ownerName || localAcc.username,
          bikeId: localAcc.bikeId || `bike_${trimmedUser}`,
          district: localAcc.district,
          province: localAcc.province,
          bikeNumber: localAcc.bikeNumber,
          loginIp: netInfo.ip,
          signedInAt: new Date().toISOString(),
        },
        userAccount: localAcc,
      };
    } else {
      await recordLoginLog({
        username: trimmedUser,
        role: localAcc.role || 'client',
        ip: netInfo.ip,
        location: locationStr,
        device: netInfo.device,
        userAgent: netInfo.userAgent,
        status: 'failed',
        timestamp: new Date().toISOString(),
        bikeId: localAcc.bikeId,
        bikeNumber: localAcc.bikeNumber,
        ownerName: localAcc.ownerName,
      });
      throw new Error('Incorrect password. Please verify and try again.');
    }
  }

  // Log unknown user attempt
  try {
    await recordLoginLog({
      username: trimmedUser,
      role: 'client',
      ip: netInfo.ip,
      location: locationStr,
      device: netInfo.device,
      userAgent: netInfo.userAgent,
      status: 'failed',
      timestamp: new Date().toISOString(),
    });
  } catch {}

  throw new Error('User not found. Please check your username or contact Admin Sachintha.');
}

export async function updateUserAccount(
  username: string,
  bikeId: string,
  details: {
    ownerName?: string;
    bikeNumber?: string;
    district?: string;
    province?: string;
    password?: string;
    email?: string;
  }
): Promise<void> {
  const normUser = username.trim().toLowerCase();
  const cleanUpdates = sanitizeForFirestore({
    ...details,
    updatedAt: new Date().toISOString(),
  });

  // Update local accounts
  const localAccounts = getLocalAccounts();
  if (localAccounts[normUser]) {
    localAccounts[normUser] = {
      ...localAccounts[normUser],
      ...cleanUpdates,
      ...(details.ownerName ? { ownerName: details.ownerName } : {}),
      ...(details.bikeNumber ? { bikeNumber: details.bikeNumber } : {}),
      ...(details.district ? { district: details.district } : {}),
      ...(details.province ? { province: details.province } : {}),
    };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(localAccounts));
  }

  // Update in Firestore
  try {
    const userDocRef = doc(db, 'users', normUser);
    await setDoc(userDocRef, cleanUpdates, { merge: true });
  } catch (err) {
    console.warn('Firestore update user account notice:', err);
  }

  // Update vehicle in Firestore
  try {
    const bikeDocRef = doc(db, 'bikes', bikeId);
    const vehicleUpdates: Partial<VehicleDetails> = {};
    if (details.ownerName) vehicleUpdates.owner = details.ownerName;
    if (details.bikeNumber) vehicleUpdates.regNo = details.bikeNumber;
    if (details.district) vehicleUpdates.district = details.district;
    if (details.province) vehicleUpdates.province = details.province;

    await setDoc(
      bikeDocRef,
      sanitizeForFirestore({
        ...vehicleUpdates,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore update bike from user account notice:', err);
  }
}

