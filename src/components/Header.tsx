import React from 'react';
import {
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
  Flame,
  Map as MapIcon,
  BookOpen,
  Home,
  Shield,
  StickyNote,
  MapPin,
  FileBadge,
} from 'lucide-react';
import { AppState, AuthSession } from '../types';

export type ActiveTab = 'home' | 'vehicle' | 'service' | 'notes' | 'dealers';

interface HeaderProps {
  state: AppState;
  authSession: AuthSession;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
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

  const navItems = [
    {
      id: 'home' as ActiveTab,
      label: 'Home',
      sub: 'About & Upcoming',
      icon: Home,
    },
    {
      id: 'vehicle' as ActiveTab,
      label: 'Vehicle ID & Reg',
      sub: 'Bike & Owner',
      icon: Shield,
    },
    {
      id: 'service' as ActiveTab,
      label: 'Service',
      sub: 'Distance & History',
      icon: Wrench,
      badge: stats.isOverdue ? 'Due' : undefined,
    },
    {
      id: 'notes' as ActiveTab,
      label: 'Maintenance Notes',
      sub: 'Garage Remarks',
      icon: StickyNote,
      count: state.notes.length,
    },
    {
      id: 'dealers' as ActiveTab,
      label: 'Bajaj Dealers',
      sub: 'Google Map & Hubs',
      icon: MapPin,
    },
  ];

  return (
    <header className="border-b border-[#222734] bg-[#10131a]/95 backdrop-blur-xl sticky top-0 z-40 px-3 sm:px-6 py-2.5 shadow-xl shadow-black/40">
      <div className="max-w-6xl mx-auto space-y-2.5">
        {/* Top Row: Brand, Reg No, Cloud Status & Quick Tool Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Brand & Plate */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#181d28] via-[#121620] to-[#0a0c12] border border-amber-500/40 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/10 overflow-hidden shrink-0 relative group">
              <img
                src={state.vehicle.photoUrl || '/pulsar_n160.svg'}
                alt="Bajaj Pulsar N160"
                referrerPolicy="no-referrer"
                className={`w-full h-full ${state.vehicle.photoUrl ? 'object-cover' : 'object-contain'} rounded-lg transition-transform duration-300 group-hover:scale-105`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-black text-lg sm:text-xl tracking-wider text-white">
                  PULSAR <span className="text-amber-400">N160</span>
                </span>
                <span className="text-[11px] uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/25 font-mono font-bold shadow-sm">
                  {state.vehicle.regNo}
                </span>

                {/* Role Indicator */}
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm">
                    <Flame className="w-3 h-3 text-amber-400" />
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 shadow-sm">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    Client
                  </span>
                )}

                {/* Sync Status */}
                {syncStatus === 'synced' && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" title="Firebase Firestore Realtime Sync Active">
                    <Cloud className="w-2.5 h-2.5 text-emerald-400" />
                    Synced
                  </span>
                )}
                {syncStatus === 'syncing' && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 animate-pulse">
                    <Loader2 className="w-2.5 h-2.5 text-amber-400 animate-spin" />
                    Syncing
                  </span>
                )}
                {syncStatus === 'offline' && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/40" title="Offline Cache Active - Changes saved locally">
                    <CloudOff className="w-2.5 h-2.5 text-zinc-400" />
                    Offline Mode
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                {state.vehicle.owner} · Odometer: <strong className="text-zinc-100 font-mono">{state.odometer.toLocaleString()} km</strong>
              </p>
            </div>
          </div>

          {/* Right Action Icons & Utilities */}
          <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
            {stats.isOverdue ? (
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Service Overdue
              </span>
            ) : stats.isDueSoon ? (
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Due in {stats.remaining.toLocaleString()} km
              </span>
            ) : null}

            <button
              type="button"
              onClick={onOpenSchedule}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-300 bg-[#191e28] hover:bg-[#222938] hover:text-white border border-[#2b3446] transition-all cursor-pointer shadow-sm active:scale-95"
              title="View Factory Schedule Guide"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            <button
              type="button"
              onClick={onOpenPrint}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-300 bg-[#191e28] hover:bg-[#222938] hover:text-white border border-[#2b3446] transition-all cursor-pointer shadow-sm active:scale-95"
              title="Print Official Service Booklet"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Backup & Export */}
            <button
              type="button"
              onClick={onExportData}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 bg-[#191e28] hover:bg-[#222938] border border-[#2b3446] transition-all cursor-pointer shadow-sm active:scale-95"
              title="Download JSON Backup"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

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
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 bg-[#191e28] hover:bg-[#222938] border border-[#2b3446] transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Import JSON Record"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onResetToDefaults}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-amber-300 bg-[#191e28] hover:bg-[#222938] border border-[#2b3446] transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Reset to Factory Defaults"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Sign Out */}
            <button
              type="button"
              onClick={onSignOut}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: 5 PRIMARY CATEGORY TABS */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none border-t border-[#1d222e] pt-2">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/25 font-bold scale-[1.02] border border-amber-400'
                    : 'bg-[#151922] hover:bg-[#1e2330] text-zinc-300 hover:text-white border border-[#252c3c]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-amber-400'}`} />
                <div className="flex flex-col text-left">
                  <span className="leading-tight">{tab.label}</span>
                </div>

                {/* Optional Status Pill or Count */}
                {tab.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold uppercase ${
                    isActive ? 'bg-red-600 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold ${
                    isActive ? 'bg-zinc-950/25 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
