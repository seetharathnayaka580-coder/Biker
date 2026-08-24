import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VehicleDetailsStrip } from './components/VehicleDetailsStrip';
import { OdometerGauge } from './components/OdometerGauge';
import { ServiceLogger } from './components/ServiceLogger';
import { ServiceTimeline } from './components/ServiceTimeline';
import { MaintenanceNotes } from './components/MaintenanceNotes';
import { PrintBookletModal } from './components/PrintBookletModal';
import { ScheduleGuideModal } from './components/ScheduleGuideModal';
import { AppState, MaintenanceNote, ServiceRecord, VehicleDetails } from './types';
import { loadState, saveState, calculateServiceStats } from './utils/formatters';
import { SEED_STATE } from './data/seed';
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
  initializeFirestoreSeed,
} from './lib/firebase';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('syncing');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Initialize Firebase and Subscribe to Firestore in real-time
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function setupFirebaseSync() {
      try {
        setSyncStatus('syncing');
        await initAuth();
        unsubscribe = subscribeToBike(
          'BKT-1374',
          (cloudState) => {
            setState(cloudState);
            saveState(cloudState);
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
  }, []);

  // Sync state to localStorage whenever it changes as offline backup
  useEffect(() => {
    saveState(state);
  }, [state]);

  const currentTarget = state.targets[0] || 7688;
  const stats = calculateServiceStats(state.services, state.odometer, currentTarget);

  // Handlers with Optimistic UI + Cloud Firestore Persistence
  const handleUpdateVehicle = async (vehicle: VehicleDetails) => {
    try {
      setSyncStatus('syncing');
      await saveVehicleToCloud(vehicle);
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Could not persist vehicle to Firestore:', e);
      setSyncStatus('offline');
    }
  };

  const handleUpdateOdometer = async (newOdo: number) => {
    try {
      setSyncStatus('syncing');
      await saveOdometerToCloud(newOdo);
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Could not persist odometer to Firestore:', e);
      setSyncStatus('offline');
    }
  };

  const handleUpdateTarget = async (newTarget: number) => {
    const newTargets = [newTarget, ...(state.targets.slice(1) || [])];
    try {
      setSyncStatus('syncing');
      await saveTargetToCloud(newTargets);
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Could not persist target to Firestore:', e);
      setSyncStatus('offline');
    }
  };

  const handleAddService = async (newService: ServiceRecord) => {
    try {
      setSyncStatus('syncing');
      await addServiceToCloud(newService);
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Could not persist service to Firestore:', e);
      setSyncStatus('offline');
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      setSyncStatus('syncing');
      await deleteServiceFromCloud(id);
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Could not delete service from Firestore:', e);
      setSyncStatus('offline');
    }
  };

  const handleAddNote = async (newNote: MaintenanceNote) => {
    try {
      setSyncStatus('syncing');
      await addNoteToCloud(newNote);
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Could not persist note to Firestore:', e);
      setSyncStatus('offline');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      setSyncStatus('syncing');
      await deleteNoteFromCloud(id);
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Could not delete note from Firestore:', e);
      setSyncStatus('offline');
    }
  };

  const handleExportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(state, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `N160_ServiceLog_${state.vehicle.regNo}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.vehicle && parsed.services) {
            setState(parsed);
            saveState(parsed);
            // Sync imported records to Firestore
            setSyncStatus('syncing');
            await saveVehicleToCloud(parsed.vehicle);
            await saveOdometerToCloud(parsed.odometer, parsed.targets);
            if (Array.isArray(parsed.services)) {
              for (const s of parsed.services) {
                await addServiceToCloud(s);
              }
            }
            if (Array.isArray(parsed.notes)) {
              for (const n of parsed.notes) {
                await addNoteToCloud(n);
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
    if (globalThis.confirm('Reset service log book to verified factory initial state and resync with Firebase?')) {
      const reset = JSON.parse(JSON.stringify(SEED_STATE));
      setState(reset);
      saveState(reset);
      try {
        setSyncStatus('syncing');
        await initializeFirestoreSeed('BKT-1374');
        setSyncStatus('synced');
      } catch (e) {
        console.warn('Reset sync warning:', e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1116] text-[#eef1f4] flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar Navigation */}
      <Header
        state={state}
        onOpenPrint={() => setShowPrintModal(true)}
        onOpenSchedule={() => setShowScheduleModal(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetToDefaults={handleResetToDefaults}
        syncStatus={syncStatus}
        stats={stats}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 sm:px-6">
        {/* Vehicle Identity Badges */}
        <VehicleDetailsStrip
          vehicle={state.vehicle}
          onUpdateVehicle={handleUpdateVehicle}
        />

        {/* Top 2-Column Grid: Gauge & Logger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
          <div className="lg:col-span-6 flex flex-col">
            <OdometerGauge
              odometer={state.odometer}
              targets={state.targets}
              services={state.services}
              onUpdateOdometer={handleUpdateOdometer}
              onUpdateTarget={handleUpdateTarget}
            />
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <ServiceLogger
              currentOdometer={state.odometer}
              servicesCount={state.services.length}
              onAddService={handleAddService}
            />
          </div>
        </div>

        {/* Service History Timeline */}
        <ServiceTimeline
          services={state.services}
          onDeleteService={handleDeleteService}
        />

        {/* Maintenance Notes & Intermediate Logs */}
        <MaintenanceNotes
          notes={state.notes}
          currentOdo={state.odometer}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
        />

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-zinc-500 border-t border-[#1d212a] mt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Bajaj Pulsar N160 (BKT-1374) Service Log Book · Cloud-synchronized with Firebase Firestore.
          </p>
          <span className="font-mono text-[11px] text-zinc-400">
            Database: {syncStatus === 'synced' ? '● Connected' : syncStatus === 'syncing' ? '◐ Syncing' : '○ Offline Mode'}
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
    </div>
  );
}

