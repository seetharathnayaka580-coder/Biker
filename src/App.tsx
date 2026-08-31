import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { HomeTab } from './components/HomeTab';
import { VehicleRegistrationTab } from './components/VehicleRegistrationTab';
import { ServiceTab } from './components/ServiceTab';
import { MaintenanceNotesTab } from './components/MaintenanceNotesTab';
import { GoogleMapsServiceLocator } from './components/GoogleMapsServiceLocator';
import { PrintBookletModal } from './components/PrintBookletModal';
import { ScheduleGuideModal } from './components/ScheduleGuideModal';
import { LoginPage } from './components/LoginPage';
import { AppSplashScreen } from './components/AppSplashScreen';
import { InstallAppModal } from './components/InstallAppModal';
import { ClearDataModal } from './components/ClearDataModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AppState, AuthSession, MaintenanceNote, ServiceRecord, VehicleDetails } from './types';
import { loadState, saveState, calculateServiceStats } from './utils/formatters';
import { SEED_STATE, getSeedStateForBike } from './data/seed';
import {
  initAuth,
  subscribeToBike,
  saveVehicleToCloud,
  saveOdometerToCloud,
  saveTargetToCloud,
  addServiceToCloud,
  deleteServiceFromCloud,
  addNoteToCloud,
  deleteNoteFromCloud,
  clearAllBikeDataFromCloud,
  initializeFirestoreSeed,
  signOutFromFirebase,
} from './lib/firebase';

const AUTH_STORAGE_KEY = 'n160_auth_session';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function App() {
  // Auth Session State
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const activeBikeId = authSession?.bikeId || 'BKT-1374';

  const [state, setState] = useState<AppState>(() => loadState(activeBikeId));
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('syncing');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // App Opening Loading Splash Screen state
  const [showSplash, setShowSplash] = useState(true);

  // Chrome PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Capture Chrome PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleLoginSuccess = (session: AuthSession) => {
    const targetBikeId = session.bikeId || 'BKT-1374';
    const bikeState = loadState(targetBikeId);
    setState(bikeState);
    setAuthSession(session);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Could not save auth session:', e);
    }
  };

  const handleSignOut = async () => {
    await signOutFromFirebase();
    const defaultState = loadState('BKT-1374');
    setState(defaultState);
    setAuthSession(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear auth session:', e);
    }
  };

  // Initialize Firebase and Subscribe to Firestore in real-time for active bike
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function setupFirebaseSync() {
      try {
        setSyncStatus('syncing');
        await initAuth();
        unsubscribe = subscribeToBike(
          activeBikeId,
          (cloudState) => {
            setState(cloudState);
            saveState(cloudState, activeBikeId);
            setSyncStatus('synced');
          },
          (error) => {
            console.warn('Firestore subscription notice, fallback active:', error);
            setSyncStatus('offline');
          }
        );
      } catch (err) {
        console.error('Firebase setup error:', err);
        setSyncStatus('offline');
      }
    }

    setupFirebaseSync();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeBikeId]);

  // Sync state to localStorage whenever it changes as offline backup
  useEffect(() => {
    if (!state.bikeId || state.bikeId === activeBikeId) {
      saveState(state, activeBikeId);
    }
  }, [state, activeBikeId]);

  // If opening splash screen is active, show the animated motorcycle boot screen
  if (showSplash) {
    return (
      <AppSplashScreen
        onComplete={() => setShowSplash(false)}
        regNo={state.vehicle.regNo}
        modelName={state.vehicle.model}
      />
    );
  }

  // If not logged in, render the Motorcycle-themed Login Page
  if (!authSession) {
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          vehicle={state.vehicle}
          onOpenInstall={() => setShowInstallModal(true)}
        />
        <InstallAppModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
          deferredPrompt={deferredPrompt}
        />
      </>
    );
  }

  const isAdmin = authSession.role === 'admin';
  const currentTarget = state.targets[0] || 7688;
  const stats = calculateServiceStats(state.services, state.odometer, currentTarget);

  // Handlers with Optimistic UI + Cloud Firestore Persistence
  const handleUpdateVehicle = async (vehicle: VehicleDetails) => {
    if (!isAdmin) return;
    try {
      setState((prev) => ({ ...prev, vehicle }));
      setSyncStatus('syncing');
      await saveVehicleToCloud(vehicle, activeBikeId);
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Could not persist vehicle to Firestore:', e);
      setSyncStatus('offline');
    }
  };

  const handleUpdateOdometer = async (newOdo: number) => {
    if (!isAdmin) return;
    try {
      setState((prev) => ({ ...prev, odometer: newOdo }));
      setSyncStatus('syncing');
      await saveOdometerToCloud(newOdo, undefined, activeBikeId);
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Could not persist odometer to Firestore:', e);
      setSyncStatus('offline');
    }
  };

  const handleUpdateTarget = async (newTarget: number) => {
    if (!isAdmin) return;
    const newTargets = [newTarget, ...(state.targets.slice(1) || [])];
    try {
      setState((prev) => ({ ...prev, targets: newTargets }));
      setSyncStatus('syncing');
      await saveTargetToCloud(newTargets, activeBikeId);
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Could not persist target to Firestore:', e);
      setSyncStatus('offline');
    }
  };

  const handleAddService = async (newService: ServiceRecord) => {
    if (!isAdmin) return;
    try {
      setState((prev) => ({
        ...prev,
        odometer: Math.max(prev.odometer, newService.km),
        services: [newService, ...prev.services],
      }));
      setSyncStatus('syncing');
      await addServiceToCloud(newService, activeBikeId);
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Could not persist service to Firestore:', e);
      setSyncStatus('offline');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!isAdmin) return;
    try {
      setState((prev) => ({
        ...prev,
        services: prev.services.filter((s) => s.id !== id),
      }));
      setSyncStatus('syncing');
      await deleteServiceFromCloud(id, activeBikeId);
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Could not delete service from Firestore:', e);
      setSyncStatus('offline');
    }
  };

  const handleAddNote = async (newNote: MaintenanceNote) => {
    if (!isAdmin) return;
    try {
      setState((prev) => ({
        ...prev,
        notes: [newNote, ...prev.notes],
      }));
      setSyncStatus('syncing');
      await addNoteToCloud(newNote, activeBikeId);
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Could not persist note to Firestore:', e);
      setSyncStatus('offline');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!isAdmin) return;
    try {
      setState((prev) => ({
        ...prev,
        notes: prev.notes.filter((n) => n.id !== id),
      }));
      setSyncStatus('syncing');
      await deleteNoteFromCloud(id, activeBikeId);
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Could not delete note from Firestore:', e);
      setSyncStatus('offline');
    }
  };

  // Clear all data for current bike (reset to 0 km, empty services and notes)
  const handleExecuteClear = async () => {
    if (!isAdmin) return;
    try {
      setSyncStatus('syncing');
      await clearAllBikeDataFromCloud(activeBikeId);
      const cleared: AppState = {
        vehicle: {
          ...state.vehicle,
        },
        odometer: 0,
        services: [],
        notes: [],
        targets: [2500],
        serviceInterval: 2500,
      };
      setState(cleared);
      saveState(cleared, activeBikeId);
      setSyncStatus('synced');
    } catch (err) {
      console.error('Clear all data error:', err);
      setSyncStatus('offline');
    }
  };

  const handleExportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(state, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `ServiceLog_${state.vehicle.regNo}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.vehicle && parsed.services) {
            setState(parsed);
            saveState(parsed, activeBikeId);
            // Sync imported records to Firestore
            setSyncStatus('syncing');
            await saveVehicleToCloud(parsed.vehicle, activeBikeId);
            await saveOdometerToCloud(parsed.odometer, parsed.targets, activeBikeId);
            if (Array.isArray(parsed.services)) {
              for (const s of parsed.services) {
                await addServiceToCloud(s, activeBikeId);
              }
            }
            if (Array.isArray(parsed.notes)) {
              for (const n of parsed.notes) {
                await addNoteToCloud(n, activeBikeId);
              }
            }
            setSyncStatus('synced');
            alert('Service log book backup successfully restored & synced to Firebase cloud!');
          }
        } catch {
          alert('Invalid backup file format.');
        }
      };
    }
  };

  const handleResetToDefaults = async () => {
    if (!isAdmin) return;
    if (globalThis.confirm('Reset service log book to verified initial state and resync with Firebase?')) {
      const template = getSeedStateForBike(activeBikeId);
      const reset = JSON.parse(JSON.stringify(template));
      setState(reset);
      saveState(reset, activeBikeId);
      try {
        setSyncStatus('syncing');
        await initializeFirestoreSeed(activeBikeId);
        setSyncStatus('synced');
      } catch (e) {
        console.warn('Reset sync warning:', e);
      }
    }
  };

  return (
    <div className={`min-h-screen bg-[#07090e] text-[#eef1f4] flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden ${!isAdmin ? 'select-none' : ''}`}>
      {/* Dynamic Ambient Glow & Mesh from Login Pattern */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 0%, transparent 80%), radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 28px 28px',
        }}
      />
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* Top Bar Navigation with 5 Category Tabs */}
      <div className="relative z-10">
        <Header
        state={state}
        authSession={authSession}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSignOut={handleSignOut}
        onOpenPrint={() => setShowPrintModal(true)}
        onOpenSchedule={() => setShowScheduleModal(true)}
        onOpenInstall={() => setShowInstallModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetToDefaults={handleResetToDefaults}
        onClearAllData={() => setShowClearModal(true)}
        syncStatus={syncStatus}
        stats={stats}
      />
      </div>

      {/* Main Tabbed Views Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-5 relative z-10">
        {/* TAB 1: HOME (Bike About & Upcoming Service) */}
        {activeTab === 'home' && (
          <HomeTab
            state={state}
            isAdmin={isAdmin}
            onUpdateVehicle={handleUpdateVehicle}
            onNavigateToTab={setActiveTab}
            onOpenScheduleGuide={() => setShowScheduleModal(true)}
            onOpenPrint={() => setShowPrintModal(true)}
          />
        )}

        {/* TAB 2: VEHICLE IDENTIFICATION & REGISTRATION (Bike Details & Owner Details) */}
        {activeTab === 'vehicle' && (
          <VehicleRegistrationTab
            vehicle={state.vehicle}
            isAdmin={isAdmin}
            onUpdateVehicle={handleUpdateVehicle}
            onOpenPrintBooklet={() => setShowPrintModal(true)}
            onClearAllData={() => setShowClearModal(true)}
          />
        )}

        {/* TAB 3: SERVICE (Distance to Next Service, Log New Service & History) */}
        {activeTab === 'service' && (
          <ServiceTab
            state={state}
            isAdmin={isAdmin}
            onUpdateOdometer={handleUpdateOdometer}
            onUpdateTarget={handleUpdateTarget}
            onAddService={handleAddService}
            onDeleteService={handleDeleteService}
            onOpenScheduleGuide={() => setShowScheduleModal(true)}
          />
        )}

        {/* TAB 4: MAINTENANCE NOTES (Garage Remarks & Quick Notes) */}
        {activeTab === 'notes' && (
          <MaintenanceNotesTab
            notes={state.notes}
            currentOdo={state.odometer}
            isAdmin={isAdmin}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {/* TAB 5: BAJAJ DEALERS (Google Map & Service Centers) */}
        {activeTab === 'dealers' && (
          <GoogleMapsServiceLocator
            currentOdometer={state.odometer}
            nextServiceKm={currentTarget}
            isAdmin={isAdmin}
          />
        )}

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-zinc-500 border-t border-[#1d212a] mt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            {state.vehicle.model || 'Motorcycle'} ({state.vehicle.regNo || 'Log Book'}) · Official Maintenance Manager.
          </p>
          <span className="font-mono text-[11px] text-zinc-400">
            Database: {syncStatus === 'synced' ? '● Connected (Firestore)' : syncStatus === 'syncing' ? '◐ Syncing...' : '○ Local Mode'}
          </span>
        </footer>
      </main>

      {/* Modals */}
      {showPrintModal && (
        <PrintBookletModal
          state={state}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {showScheduleModal && (
        <ScheduleGuideModal
          currentOdo={state.odometer}
          onClose={() => setShowScheduleModal(false)}
        />
      )}

      {showClearModal && (
        <ClearDataModal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          onConfirmClear={handleExecuteClear}
          bikeName={state.vehicle.model || 'Motorcycle'}
          regNo={state.vehicle.regNo || 'Log'}
        />
      )}

      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        deferredPrompt={deferredPrompt}
      />

      {showProfileModal && authSession && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          authSession={authSession}
          vehicle={state.vehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onUpdateAuthSession={(updated) => {
            setAuthSession(updated);
            try {
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {
              console.warn('Could not update cached session:', e);
            }
          }}
        />
      )}
    </div>
  );
}
