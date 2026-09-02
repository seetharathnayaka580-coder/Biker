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
  Trash2,
  User,
  Crown,
  Sparkles,
  BadgeCheck,
  MessageCircle,
  Send,
  Phone,
} from 'lucide-react';
import { AppState, AuthSession } from '../types';

export type ActiveTab = 'home' | 'vehicle' | 'service' | 'notes' | 'dealers' | 'owner_control';

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
  onClearAllData?: () => void;
  onOpenInstall?: () => void;
  onOpenProfile?: () => void;
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
  onClearAllData,
  onOpenInstall,
  onOpenProfile,
  syncStatus,
  stats,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isAdmin = authSession.role === 'admin';
  const isSachi =
    authSession.username?.toLowerCase().includes('sachi') ||
    authSession.username?.toLowerCase().includes('pathum') ||
    authSession.bikeId === 'BKT-1374' ||
    state.vehicle.owner?.toLowerCase().includes('sachintha') ||
    state.vehicle.regNo === 'BKT-1374';

  interface NavItem {
    id: ActiveTab;
    label: string;
    sub: string;
    icon: React.ComponentType<{ className?: string }>;
    activeClass: string;
    inactiveClass: string;
    iconColor: string;
    badge?: string;
    badgeColor?: string;
    count?: number;
  }

  const navItems: NavItem[] = [
    {
      id: 'home' as ActiveTab,
      label: 'Home',
      sub: 'Overview & Stats',
      icon: Home,
      activeClass: 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] border-cyan-300 scale-[1.02]',
      inactiveClass: 'bg-[#09111c] text-cyan-200/90 hover:text-cyan-100 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/50',
      iconColor: 'text-cyan-400',
    },
    {
      id: 'vehicle' as ActiveTab,
      label: 'Vehicle ID & Reg',
      sub: 'Bike & Owner',
      icon: Shield,
      activeClass: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] border-blue-300 scale-[1.02]',
      inactiveClass: 'bg-[#080e1b] text-blue-200/90 hover:text-blue-100 border-blue-500/30 hover:border-blue-400 hover:bg-blue-950/50',
      iconColor: 'text-blue-400',
    },
    {
      id: 'service' as ActiveTab,
      label: 'Service',
      sub: 'Distance & History',
      icon: Wrench,
      activeClass: 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-zinc-950 font-black shadow-[0_0_22px_rgba(245,158,11,0.55)] border-amber-300 scale-[1.02]',
      inactiveClass: 'bg-[#181207] text-amber-200/90 hover:text-amber-100 border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/50',
      iconColor: 'text-amber-400',
    },
    {
      id: 'notes' as ActiveTab,
      label: 'Maintenance Notes',
      sub: 'Garage Remarks',
      icon: StickyNote,
      count: state.notes.length,
      activeClass: 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border-purple-300 scale-[1.02]',
      inactiveClass: 'bg-[#14081c] text-purple-200/90 hover:text-purple-100 border-purple-500/30 hover:border-purple-400 hover:bg-purple-950/50',
      iconColor: 'text-purple-400',
    },
    {
      id: 'dealers' as ActiveTab,
      label: 'Bajaj Dealers',
      sub: 'Google Maps & Hubs',
      icon: MapPin,
      activeClass: 'bg-gradient-to-r from-rose-500 via-pink-500 to-red-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] border-rose-300 scale-[1.02]',
      inactiveClass: 'bg-[#1a0711] text-rose-200/90 hover:text-rose-100 border-rose-500/30 hover:border-rose-400 hover:bg-rose-950/50',
      iconColor: 'text-rose-400',
    },
    ...(isSachi
      ? [
          {
            id: 'owner_control' as ActiveTab,
            label: 'Owner Sachi Control',
            sub: 'Managers, Clients & IPs',
            icon: Crown,
            badge: 'OWNER',
            badgeColor: 'bg-amber-400 text-zinc-950',
            activeClass:
              'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 font-black shadow-[0_0_25px_rgba(245,158,11,0.6)] border-amber-300 scale-[1.02]',
            inactiveClass:
              'bg-[#19140a] text-amber-300 hover:text-amber-100 border-amber-500/40 hover:border-amber-400 hover:bg-amber-950/60 ring-1 ring-amber-500/20',
            iconColor: 'text-amber-400',
          },
        ]
      : []),
  ];

  return (
    <header className="border-b border-[#1b202c] bg-[#0c0e14]/95 backdrop-blur-xl sticky top-0 z-40 px-3 sm:px-6 py-2.5 shadow-xl shadow-black/60 relative overflow-hidden">
      {/* Sleek top gray accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-600 opacity-80" />

      <div className="max-w-6xl mx-auto space-y-2.5">
        {/* Top Row: Brand, Reg No, Cloud Status & Quick Tool Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Brand & Plate */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#141824] border border-[#262e40] p-[2px] flex items-center justify-center shadow-lg shadow-black/40 overflow-hidden shrink-0 relative group">
              <div className="w-full h-full bg-[#0a0c10] rounded-[9px] p-0.5 overflow-hidden">
                <img
                  src={state.vehicle.photoUrl || '/app_icon.svg'}
                  alt="Bajaj Pulsar N160"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full ${state.vehicle.photoUrl ? 'object-cover' : 'object-contain'} rounded-lg transition-transform duration-300 group-hover:scale-105`}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-black text-lg sm:text-xl tracking-wider text-white">
                  PULSAR <span className="text-zinc-400 font-black">N160</span>
                </span>
                <span className="text-[11px] uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#161a26] text-zinc-200 border border-[#2a3247] font-mono font-bold shadow-sm">
                  {state.vehicle.regNo}
                </span>

                {/* Premium & Role Indicator */}
                {isSachi ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-zinc-950 border border-yellow-200/90 shadow-[0_0_14px_rgba(251,191,36,0.6)] tracking-wide">
                      <Crown className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950" />
                      PREMIUM
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#161b26] text-zinc-200 border border-[#2b3348] shadow-sm" title="Web Page Creator & Full Access Master Admin">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Creator & Admin
                    </span>
                  </>
                ) : isAdmin ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 shadow-sm uppercase tracking-wider">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      CLIENT
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#161b26] text-zinc-300 border border-[#2b3348] shadow-sm">
                      <Flame className="w-3 h-3 text-zinc-400" />
                      Admin
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 shadow-sm uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    CLIENT
                  </span>
                )}

                {/* Sync Status */}
                {syncStatus === 'synced' && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" title="Realtime Cloud Database Sync Active (Firestore)">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Synced
                  </span>
                )}
                {syncStatus === 'syncing' && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 animate-pulse">
                    <Loader2 className="w-2.5 h-2.5 text-zinc-400 animate-spin" />
                    Syncing...
                  </span>
                )}
                {syncStatus === 'offline' && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/40" title="Offline Cache Active - Changes saved locally">
                    <CloudOff className="w-2.5 h-2.5 text-zinc-400" />
                    Offline Mode
                  </span>
                )}

                {/* Logged in User IP Badge */}
                {authSession.loginIp && (
                  <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/25" title={`Your active connection IP: ${authSession.loginIp}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    IP: {authSession.loginIp}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {state.vehicle.ownerPhotoUrl && (
                  <img
                    src={state.vehicle.ownerPhotoUrl}
                    alt={state.vehicle.owner}
                    className="w-4 h-4 rounded-full object-cover border border-zinc-600 shrink-0"
                  />
                )}
                <p className="text-[11px] text-zinc-400 font-medium">
                  <span className="text-zinc-200 font-semibold">{state.vehicle.owner}</span>
                  {isSachi && (
                    <span className="ml-1 text-[10px] text-zinc-400 font-mono font-semibold hidden sm:inline">
                      (Web Page Creator · Full Access Admin)
                    </span>
                  )}
                  {' · '}Odometer: <strong className="text-zinc-100 font-mono">{state.odometer.toLocaleString()} km</strong>
                </p>
              </div>
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

            {onOpenInstall && (
              <button
                type="button"
                onClick={onOpenInstall}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-200 bg-[#141824] hover:bg-[#1a2030] border border-[#252e42] transition-all cursor-pointer shadow-sm active:scale-95"
                title="Install Chrome App Shortcut to Home Screen"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSchedule}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-300 bg-[#11141d] hover:bg-[#181c28] hover:text-white border border-[#202636] hover:border-zinc-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
              title="View Factory Schedule Guide"
            >
              <Wrench className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            <button
              type="button"
              onClick={onOpenPrint}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-300 bg-[#11141d] hover:bg-[#181c28] hover:text-white border border-[#202636] hover:border-zinc-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Print Official Service Booklet"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('owner')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Contact App Owner: WhatsApp +94 763961123 · Telegram @X_x_x_xzZ"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/30" />
              <span className="hidden lg:inline">Owner Contact</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 hidden xl:inline">WA/TG</span>
            </button>

            {/* Backup & Export */}
            <button
              type="button"
              onClick={onExportData}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 bg-[#11141d] hover:bg-[#181c28] border border-[#202636] hover:border-zinc-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
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
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 bg-[#11141d] hover:bg-[#181c28] border border-[#202636] hover:border-zinc-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Import JSON Record"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onResetToDefaults}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 bg-[#11141d] hover:bg-[#181c28] border border-[#202636] hover:border-zinc-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Reset to Factory Defaults"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                {onClearAllData && (
                  <button
                    type="button"
                    onClick={onClearAllData}
                    className="p-1.5 rounded-xl text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Clear All Data & Records for this Bike"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}

            {/* Active User / Profile Button */}
            {onOpenProfile && isAdmin ? (
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#11141d] hover:bg-[#181c28] border border-[#202636] hover:border-zinc-500/40 text-xs transition-all cursor-pointer shadow-sm active:scale-95 group"
                title={isSachi ? "Web Page Creator & Full Access Master Admin Profile" : "Click to edit user profile, bike number, and location"}
              >
                {isSachi ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/25 group-hover:scale-110 transition-transform" />
                ) : (
                  <User className="w-3.5 h-3.5 text-zinc-400 group-hover:scale-110 transition-transform" />
                )}
                <span className="font-semibold text-zinc-200">{authSession.username}</span>
                {isSachi ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-zinc-950 border border-yellow-200 shadow-sm uppercase tracking-wider">
                    PREMIUM
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase tracking-wider">
                    CLIENT
                  </span>
                )}
                <span className="text-[10px] text-zinc-400 font-mono hidden md:inline">✎ Edit</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#11141d] border border-[#202636] text-xs">
                <User className="w-3 h-3 text-zinc-400" />
                <span className="font-semibold text-zinc-200">{authSession.username}</span>
              </div>
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
        <nav className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none border-t border-[#1a2333] pt-2">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                  isActive
                    ? tab.activeClass
                    : `${tab.inactiveClass} border`
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'drop-shadow' : tab.iconColor}`} />
                <div className="flex flex-col text-left">
                  <span className="leading-tight">{tab.label}</span>
                </div>

                {/* Optional Status Pill or Count */}
                {tab.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold uppercase ${
                    isActive ? 'bg-black/35 text-white border border-white/40' : tab.badgeColor || 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                    isActive ? 'bg-black/30 text-white border border-white/30' : 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
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
