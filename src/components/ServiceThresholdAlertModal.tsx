import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gauge,
  MapPin,
  Volume2,
  VolumeX,
  Wrench,
  X,
  ShieldAlert,
  Calendar,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { VehicleDetails } from '../types';
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  sendBrowserServiceNotification,
  playAlertChime,
  snoozeAlert,
  SERVICE_ALERT_THRESHOLD_KM,
} from '../utils/serviceAlerts';

interface ServiceThresholdAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOdo: number;
  targetKm: number;
  vehicle: VehicleDetails;
  onNavigateToService: () => void;
  onOpenScheduleGuide: () => void;
  onOpenDealers?: () => void;
}

export const ServiceThresholdAlertModal: React.FC<ServiceThresholdAlertModalProps> = ({
  isOpen,
  onClose,
  currentOdo,
  targetKm,
  vehicle,
  onNavigateToService,
  onOpenScheduleGuide,
  onOpenDealers,
}) => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isRequestingPerm, setIsRequestingPerm] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [snoozeSuccess, setSnoozeSuccess] = useState<string | null>(null);

  const remainingKm = targetKm - currentOdo;
  const isOverdue = remainingKm <= 0;
  const isDueSoon = remainingKm > 0 && remainingKm <= SERVICE_ALERT_THRESHOLD_KM;

  // Track browser notification capability
  useEffect(() => {
    setNotificationPermission(getBrowserNotificationPermission());
  }, []);

  // Play subtle warning chime on open if sound is enabled
  useEffect(() => {
    if (isOpen && soundEnabled) {
      playAlertChime();
    }
  }, [isOpen, soundEnabled]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setIsRequestingPerm(true);
    const perm = await requestBrowserNotificationPermission();
    setNotificationPermission(perm);
    setIsRequestingPerm(false);

    if (perm === 'granted') {
      sendBrowserServiceNotification(
        vehicle.model || 'Bajaj Pulsar N160',
        vehicle.regNo || 'BKT-1374',
        currentOdo,
        targetKm,
        remainingKm
      );
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 5000);
    }
  };

  const handleSnooze = (type: '50km' | '100km' | '24h') => {
    snoozeAlert(targetKm, type, currentOdo);
    const label = type === '50km' ? 'Snoozed for 50 km' : type === '100km' ? 'Snoozed for 100 km' : 'Snoozed for 24 hours';
    setSnoozeSuccess(label);
    setTimeout(() => {
      setSnoozeSuccess(null);
      onClose();
    }, 700);
  };

  // Calculate visual progress within the threshold zone
  const thresholdSpan = SERVICE_ALERT_THRESHOLD_KM;
  const consumedInThreshold = Math.max(0, Math.min(thresholdSpan, thresholdSpan - remainingKm));
  const thresholdPercent = Math.min(100, Math.max(0, Math.round((consumedInThreshold / thresholdSpan) * 100)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Outer Card with Warning Luminescence */}
      <div
        className={`relative w-full max-w-2xl bg-gradient-to-b from-[#10141f] via-[#0b0e17] to-[#07090e] rounded-3xl border ${
          isOverdue
            ? 'border-red-500/60 shadow-[0_0_50px_rgba(239,68,68,0.35)]'
            : 'border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.25)]'
        } p-5 sm:p-7 overflow-hidden text-white my-auto`}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Glowing Laser Accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${
            isOverdue
              ? 'from-transparent via-red-500 to-transparent'
              : 'from-transparent via-amber-400 to-transparent'
          }`}
        />

        {/* Ambient Halo */}
        <div
          className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isOverdue ? 'bg-red-500' : 'bg-amber-500'
          }`}
        />

        {/* Header: Title & Close Button */}
        <div className="flex items-start justify-between gap-3 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xl shrink-0 ${
                isOverdue
                  ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-red-500/20'
                  : 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-amber-500/20'
              }`}
            >
              {isOverdue ? (
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              ) : (
                <BellRing className="w-6 h-6 animate-bounce" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-wider border ${
                    isOverdue
                      ? 'bg-red-500/25 text-red-300 border-red-500/40 animate-pulse'
                      : 'bg-amber-500/25 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {isOverdue ? 'CRITICAL: OVERDUE' : '500 KM ALERT THRESHOLD'}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {vehicle.model || 'Bajaj Pulsar N160'} · {vehicle.regNo}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-display font-black text-white tracking-wide mt-1">
                {isOverdue
                  ? 'Scheduled Maintenance Is Overdue!'
                  : 'Scheduled Maintenance Due Soon'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playAlertChime();
              }}
              className="p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/80 transition-all cursor-pointer"
              title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/80 transition-all cursor-pointer"
              aria-label="Close Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Cockpit Metric Readout Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 relative z-10">
          {/* Current Odometer */}
          <div className="p-3.5 rounded-2xl bg-[#0e1320] border border-cyan-500/25 shadow-md">
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300/80 uppercase font-bold tracking-wider">
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Current Odo
              </span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono">LIVE</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-white mt-1.5 tracking-tight">
              {currentOdo.toLocaleString()} <span className="text-xs text-cyan-400 font-normal">km</span>
            </div>
          </div>

          {/* Target Service Km */}
          <div className="p-3.5 rounded-2xl bg-[#14120c] border border-amber-500/25 shadow-md">
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-300/80 uppercase font-bold tracking-wider">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Target Target
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono">OEM</span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-black text-amber-200 mt-1.5 tracking-tight">
              {targetKm.toLocaleString()} <span className="text-xs text-amber-400 font-normal">km</span>
            </div>
          </div>

          {/* Distance Remaining / Overdue */}
          <div
            className={`p-3.5 rounded-2xl border shadow-md ${
              isOverdue
                ? 'bg-red-950/40 border-red-500/40'
                : 'bg-amber-950/40 border-amber-500/40'
            }`}
          >
            <div
              className={`flex items-center justify-between text-[10px] font-mono uppercase font-bold tracking-wider ${
                isOverdue ? 'text-red-300' : 'text-amber-300'
              }`}
            >
              <span className="flex items-center gap-1">
                {isOverdue ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {isOverdue ? 'Overdue By' : 'Distance Left'}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                  isOverdue ? 'bg-red-500/30 text-red-200' : 'bg-amber-500/30 text-amber-200'
                }`}
              >
                {isOverdue ? 'CRITICAL' : '≤ 500 KM'}
              </span>
            </div>
            <div
              className={`text-xl sm:text-2xl font-mono font-black mt-1.5 tracking-tight ${
                isOverdue ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-amber-300'
              }`}
            >
              {isOverdue ? `+${Math.abs(remainingKm).toLocaleString()}` : remainingKm.toLocaleString()}{' '}
              <span className="text-xs font-normal">km</span>
            </div>
          </div>
        </div>

        {/* 500 KM Threshold Zone Visual Progress Gauge */}
        <div className="p-4 rounded-2xl bg-[#0b0e17] border border-zinc-800 mb-5 relative z-10">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-zinc-300 font-bold flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isOverdue ? 'bg-red-500 animate-ping' : 'bg-amber-400'}`} />
              500 km Service Interval Buffer Zone
            </span>
            <span className={`font-mono font-bold ${isOverdue ? 'text-red-400' : 'text-amber-300'}`}>
              {isOverdue ? '100% EXCEEDED' : `${500 - remainingKm} / 500 km inside buffer`}
            </span>
          </div>

          {/* The Buffer Bar */}
          <div className="w-full h-3 rounded-full bg-[#05070d] p-0.5 border border-zinc-700/80 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isOverdue
                  ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.7)]'
              }`}
              style={{ width: `${isOverdue ? 100 : thresholdPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-1.5">
            <span>500 km Entry Point</span>
            <span className="text-zinc-300 font-semibold">Scheduled Target ({targetKm.toLocaleString()} km)</span>
            <span className={isOverdue ? 'text-red-400 font-bold' : ''}>
              {isOverdue ? 'Engine Protection Risk' : 'Zero Buffer'}
            </span>
          </div>
        </div>

        {/* Essential OEM Maintenance Checklist Preview */}
        <div className="p-4 rounded-2xl bg-[#0c101c] border border-zinc-800/80 mb-5 relative z-10">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              Recommended OEM Factory Procedures for {targetKm.toLocaleString()} km
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenScheduleGuide();
              }}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
            >
              Full Schedule Guide →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-zinc-200">Replace Engine Oil & Filter (Bajaj DTS-i 10W-40)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-zinc-200">Drive Chain Clean, Slack (25-35mm) & Lube</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className="text-zinc-200">Inspect Dual-Channel ABS & Brake Fluid (DOT 4)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className="text-zinc-200">Check Spark Plug, Air Filter & Tire Pressures</span>
            </div>
          </div>
        </div>

        {/* Web Push / Browser Notification Integration Box */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 mb-5 flex items-center justify-between gap-3 flex-wrap relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
              <Bell className="w-4 h-4 text-zinc-300" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Native Browser Notifications</span>
                {notificationPermission === 'granted' && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                    Enabled
                  </span>
                )}
                {notificationPermission === 'denied' && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-mono">
                    Blocked in browser
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                {notificationPermission === 'granted'
                  ? 'Desktop & mobile push alerts active for upcoming service limits'
                  : 'Get automatic alerts directly on your device when distance is low'}
              </p>
            </div>
          </div>

          {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
            <button
              type="button"
              onClick={handleRequestPermission}
              disabled={isRequestingPerm}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs font-bold text-white border border-zinc-600 transition-all cursor-pointer shrink-0"
            >
              {isRequestingPerm ? 'Enabling...' : 'Enable Notifications'}
            </button>
          )}

          {notificationPermission === 'granted' && (
            <button
              type="button"
              onClick={() => {
                sendBrowserServiceNotification(
                  vehicle.model || 'Bajaj Pulsar N160',
                  vehicle.regNo || 'BKT-1374',
                  currentOdo,
                  targetKm,
                  remainingKm
                );
                setTestNotificationSent(true);
                setTimeout(() => setTestNotificationSent(false), 4000);
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 cursor-pointer transition-colors shrink-0"
            >
              {testNotificationSent ? '✓ Sent to Browser!' : 'Test Notification'}
            </button>
          )}
        </div>

        {/* Snooze Status Notification */}
        {snoozeSuccess && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-fadeIn">
            ✓ {snoozeSuccess}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-zinc-800/80 relative z-10">
          {/* Primary CTA: Log Service Now */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToService();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white font-display font-black text-sm uppercase tracking-wider shadow-lg shadow-red-950/60 transition-all cursor-pointer border border-red-400/50"
          >
            <Wrench className="w-4 h-4 text-white" />
            <span>Log Service Record Now</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Find Dealer CTA */}
          {onOpenDealers && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDealers();
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#141926] hover:bg-[#1a2234] active:scale-95 text-cyan-300 hover:text-cyan-200 border border-cyan-500/35 font-bold text-xs transition-all cursor-pointer shadow-sm"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Find Dealer</span>
            </button>
          )}

          {/* Snooze Controls */}
          <div className="flex items-center gap-1.5 justify-end">
            <button
              type="button"
              onClick={() => handleSnooze('50km')}
              className="flex-1 sm:flex-none py-3 px-3.5 rounded-2xl bg-zinc-850 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white border border-zinc-700/80 font-semibold text-xs transition-all cursor-pointer"
              title="Do not show popup again for the next 50 km of riding"
            >
              Snooze 50 km
            </button>

            <button
              type="button"
              onClick={() => handleSnooze('24h')}
              className="flex-1 sm:flex-none py-3 px-3.5 rounded-2xl bg-zinc-850 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white border border-zinc-700/80 font-semibold text-xs transition-all cursor-pointer"
              title="Remind me tomorrow"
            >
              Remind in 24h
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
