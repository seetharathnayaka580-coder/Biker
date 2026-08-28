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
    <header className="border-b border-[#242932] bg-[#12151c]/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5">
      <div className="max-w-6xl mx-auto space-y-2.5">
        {/* Top Row: Brand, Reg No, Cloud Status & Quick Tool Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Brand & Plate */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#181d28] to-[#0c0f15] border border-amber-500/40 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/10 overflow-hidden shrink-0">
              <img
                src={state.vehicle.photoUrl || '/pulsar_n160.svg'}
                alt="Bajaj Pulsar N160"
                referrerPolicy="no-referrer"
                className={`w-full h-full ${state.vehicle.photoUrl ? 'object-cover' : 'object-contain'} rounded-lg`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-bold text-lg sm:text-xl tracking-wider text-white">
                  PULSAR <span className="text-amber-400">N160</span>
                </span>
                <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold">
                  {state.vehicle.regNo}
                </span>

                {/* Role Indicator */}
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Flame className="w-3 h-3 text-amber-400" />
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    Client
                  </span>
                )}

                {/* Sync Status */}
                {syncStatus === 'synced' && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/25" title="Firebase Firestore Realtime Sync Active">
                    <Cloud className="w-2.5 h-2.5 text-sky-400" />
                    Synced
                  </span>
                )}
                {syncStatus === 'syncing' && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 animate-pulse">
                    <Loader2 className="w-2.5 h-2.5 text-amber-400 animate-spin" />
                    Syncing
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                {state.vehicle.owner} · Odo: <strong className="text-zinc-200 font-mono">{state.odometer.toLocaleString()} km</strong>
              </p>
            </div>
          </div>

          {/* Right Action Icons & Utilities */}
          <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
            {stats.isOverdue ? (
              <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Service Overdue!
              </span>
            ) : stats.isDueSoon ? (
              <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Due in {stats.remaining.toLocaleString()} km
              </span>
            ) : null}

            <button
              onClick={onOpenSchedule}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800/70 hover:bg-zinc-700 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
              title="View Factory Schedule Guide"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            <button
              onClick={onOpenPrint}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800/70 hover:bg-zinc-700 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
              title="Print Official Service Booklet"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Backup & Export */}
            <button
              onClick={onExportData}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/40 transition-colors cursor-pointer"
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
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/40 transition-colors cursor-pointer"
                  title="Import JSON Record"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onResetToDefaults}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/40 transition-colors cursor-pointer"
                  title="Reset to Factory Defaults"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Sign Out */}
            <button
              onClick={onSignOut}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: 5 PRIMARY CATEGORY TABS */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none border-t border-[#202530] pt-2">
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
                    ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-bold scale-[1.02]'
                    : 'bg-[#181c24] hover:bg-[#202632] text-zinc-300 hover:text-white border border-[#272d3a]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-amber-400'}`} />
                <div className="flex flex-col text-left">
                  <span className="leading-tight">{tab.label}</span>
                </div>

                {/* Optional Status Pill or Count */}
                {tab.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold uppercase ${
                    isActive ? 'bg-red-600 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
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
