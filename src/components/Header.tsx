import React from 'react';
import {
  Bike,
  Printer,
  Download,
  Upload,
  ShieldCheck,
  Wrench,
  RefreshCw,
  Cloud,
  CloudOff,
  Loader2,
  LogOut,
  ShieldAlert,
  UserCheck,
  Flame,
  Map as MapIcon,
  BookOpen,
} from 'lucide-react';
import { AppState, AuthSession } from '../types';

interface HeaderProps {
  state: AppState;
  authSession: AuthSession;
  activeTab: 'logbook' | 'map';
  onSelectTab: (tab: 'logbook' | 'map') => void;
  onSignOut: () => void;
  onOpenPrint: () => void;
  onOpenSchedule: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetToDefaults: () => void;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  stats: {
    remaining: number;
    isOverdue: boolean;
    isDueSoon: boolean;
  };
}

export const Header: React.FC<HeaderProps> = ({
  state,
  authSession,
  activeTab,
  onSelectTab,
  onSignOut,
  onOpenPrint,
  onOpenSchedule,
  onExportData,
  onImportData,
  onResetToDefaults,
  syncStatus,
  stats,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isAdmin = authSession.role === 'admin';

  return (
    <header className="border-b border-[#242932] bg-[#14171d]/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Brand & Registration */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/40 p-1 flex items-center justify-center shadow-lg shadow-amber-500/10 overflow-hidden shrink-0">
            <img
              src="/pulsar_n160.svg"
              alt="Bajaj Pulsar N160"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-xl sm:text-2xl tracking-wider text-white">
                N160
              </span>
              <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-semibold">
                {state.vehicle.regNo}
              </span>

              {/* Role Indicator Badge */}
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Admin · {authSession.username}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 shadow-sm">
                  <ShieldAlert className="w-3 h-3 text-red-400" />
                  Client View (Read Only)
                </span>
              )}

              {/* Firebase Cloud Sync Status */}
              {syncStatus === 'synced' && (
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/25" title="Firebase Firestore Realtime Sync Active">
                  <Cloud className="w-2.5 h-2.5 text-sky-400" />
                  Cloud Synced
                </span>
              )}
              {syncStatus === 'syncing' && (
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 animate-pulse" title="Syncing changes to Firestore...">
                  <Loader2 className="w-2.5 h-2.5 text-amber-400 animate-spin" />
                  Syncing
                </span>
              )}
              {syncStatus === 'offline' && (
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400 border border-zinc-600/30" title="Local browser storage mode">
                  <CloudOff className="w-2.5 h-2.5 text-zinc-400" />
                  Local Mode
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              {state.vehicle.model} · {state.vehicle.owner}
            </p>
          </div>
        </div>

        {/* Center/Right: Navigation Tabs & Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end flex-wrap">
          {/* Main Navigation Tab Switcher */}
          <div className="flex items-center bg-[#0d1015] p-1 rounded-xl border border-[#272d3b] shadow-inner">
            <button
              onClick={() => onSelectTab('logbook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'logbook'
                  ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Service Log</span>
            </button>

            <button
              onClick={() => onSelectTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Maps</span>
            </button>
          </div>

          {/* Quick status & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {stats.isOverdue ? (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Overdue!
              </span>
            ) : stats.isDueSoon ? (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                Due in {stats.remaining.toLocaleString()} km
              </span>
            ) : null}

            <button
              onClick={onOpenSchedule}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800/70 hover:bg-zinc-700/80 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
              title="View Official Factory Schedule Guide"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            <button
              onClick={onOpenPrint}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800/70 hover:bg-zinc-700/80 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
              title="Print Official Service Log Book"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={onExportData}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/40 transition-colors cursor-pointer"
              title="Download JSON Record"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Admin Only Actions: Import & Reset */}
            {isAdmin && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onImportData}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/40 transition-colors cursor-pointer"
                  title="Restore from JSON Backup (Admin Only)"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onResetToDefaults}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-amber-300 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/40 transition-colors cursor-pointer"
                  title="Reset to Factory Log Seed (Admin Only)"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Sign Out */}
            <button
              onClick={onSignOut}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors cursor-pointer"
              title="Sign Out / Switch Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Exit</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

