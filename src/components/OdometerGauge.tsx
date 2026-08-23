import React, { useState } from 'react';
import { Gauge, ArrowUpRight, CheckCircle2, AlertTriangle, AlertCircle, Edit3, Plus } from 'lucide-react';
import { calculateServiceStats, fmtKm } from '../utils/formatters';
import { ServiceRecord } from '../types';

interface OdometerGaugeProps {
  odometer: number;
  targets: number[];
  services: ServiceRecord[];
  onUpdateOdometer: (newOdo: number) => void;
  onUpdateTarget: (newTarget: number) => void;
}

export const OdometerGauge: React.FC<OdometerGaugeProps> = ({
  odometer,
  targets,
  services,
  onUpdateOdometer,
  onUpdateTarget,
}) => {
  const currentTarget = targets[0] || 7688;
  const stats = calculateServiceStats(services, odometer, currentTarget);

  const [showOdoModal, setShowOdoModal] = useState(false);
  const [tempOdo, setTempOdo] = useState(odometer.toString());
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [tempTarget, setTempTarget] = useState(currentTarget.toString());

  // Gauge calculations
  // Arc length for SVG path M 20 120 A 90 90 0 0 1 200 120 is approx 283
  const arcLength = 283;
  const strokeOffset = arcLength - arcLength * stats.progressRatio;

  const handleSaveOdo = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(tempOdo);
    if (!isNaN(val) && val >= 0) {
      onUpdateOdometer(val);
      setShowOdoModal(false);
    }
  };

  const handleQuickAdd = (kmToAdd: number) => {
    onUpdateOdometer(odometer + kmToAdd);
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(tempTarget);
    if (!isNaN(val) && val > 0) {
      onUpdateTarget(val);
      setShowTargetModal(false);
    }
  };

  const getGaugeColor = () => {
    if (stats.isOverdue) return '#ef4444'; // Red
    if (stats.isDueSoon || stats.progressRatio > 0.85) return '#f59e0b'; // Amber
    return '#3b82f6'; // Neon Blue / Cyan
  };

  return (
    <div className="relative bg-[#171a21] border border-[#262b35] rounded-2xl p-5 sm:p-6 shadow-xl overflow-hidden flex flex-col justify-between">
      {/* Ambient background glow */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: getGaugeColor() }}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-amber-400" />
          <h2 className="font-display font-bold text-base sm:text-lg text-white tracking-wide">
            Distance to Next Service
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setTempOdo(odometer.toString());
              setShowOdoModal(true);
            }}
            className="px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:text-white bg-[#222732] hover:bg-[#2c3240] border border-[#313847] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
          >
            <Edit3 className="w-3 h-3 text-amber-400" />
            Edit Odo
          </button>
          <button
            onClick={() => {
              setTempTarget(currentTarget.toString());
              setShowTargetModal(true);
            }}
            className="px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:text-white bg-[#222732] hover:bg-[#2c3240] border border-[#313847] rounded-lg transition-colors cursor-pointer"
          >
            Target: {currentTarget} km
          </button>
        </div>
      </div>

      {/* Central Dial */}
      <div className="relative flex flex-col items-center justify-center my-3">
        <svg viewBox="0 0 220 135" className="w-full max-w-[280px] sm:max-w-[310px] overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d="M 20 120 A 90 90 0 0 1 200 120"
            fill="none"
            stroke="#222732"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Active Fill Arc */}
          <path
            d="M 20 120 A 90 90 0 0 1 200 120"
            fill="none"
            stroke={stats.isOverdue ? '#ef4444' : 'url(#gaugeGradient)'}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeOffset}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease',
              filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.35))',
            }}
          />

          {/* Tick markers */}
          <circle cx="20" cy="120" r="2.5" fill="#64748b" />
          <circle cx="110" cy="30" r="2.5" fill="#64748b" />
          <circle cx="200" cy="120" r="2.5" fill="#64748b" />
        </svg>

        {/* Readout overlay inside arc */}
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow">
            {odometer.toLocaleString('en-US')}
          </span>
          <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mt-0.5">
            KM ON THE CLOCK
          </span>
        </div>

        {/* Quick Increment Chips */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[11px] text-zinc-400 font-medium mr-1">Quick Add:</span>
          {[10, 25, 50, 100].map((inc) => (
            <button
              key={inc}
              onClick={() => handleQuickAdd(inc)}
              className="px-2 py-0.5 text-[11px] font-mono text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-all cursor-pointer flex items-center gap-0.5"
              title={`Add ${inc} km to current odometer`}
            >
              <Plus className="w-2.5 h-2.5" />
              {inc}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Breakdown Bar */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#262b35] mt-2 text-center">
        <div className="p-2 rounded-xl bg-[#13161c] border border-[#212630]">
          <span className="block text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
            Last Service
          </span>
          <span className="font-mono text-xs sm:text-sm font-semibold text-zinc-200">
            {fmtKm(stats.lastKm)}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-[#13161c] border border-[#212630]">
          <span className="block text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
            Next Target
          </span>
          <span className="font-mono text-xs sm:text-sm font-semibold text-amber-300">
            {fmtKm(stats.target)}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-[#13161c] border border-[#212630]">
          <span className="block text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
            Remaining
          </span>
          <span
            className={`font-mono text-xs sm:text-sm font-bold ${
              stats.isOverdue
                ? 'text-red-400'
                : stats.isDueSoon
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {stats.isOverdue ? 'OVERDUE' : fmtKm(stats.remaining)}
          </span>
        </div>
      </div>

      {/* Ridden This Period Info banner */}
      <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-zinc-900/90 to-[#191d26] border border-[#272d3a] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {stats.isOverdue ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : stats.isDueSoon ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <div>
            <span className="text-zinc-400">Ridden since last service: </span>
            <span className="font-mono font-bold text-amber-400">
              {fmtKm(stats.riddenSinceLast)}
            </span>
          </div>
        </div>
        <div className="font-mono text-zinc-400 text-[11px]">
          {Math.round(stats.progressRatio * 100)}% cycle
        </div>
      </div>

      {/* Edit Odometer Modal */}
      {showOdoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#1a1e27] border border-[#303746] rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-400" />
              Update Odometer Reading
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter the exact reading currently shown on your Pulsar N160 digital dash.
            </p>
            <form onSubmit={handleSaveOdo}>
              <div className="relative mb-4">
                <input
                  type="number"
                  min="0"
                  value={tempOdo}
                  onChange={(e) => setTempOdo(e.target.value)}
                  className="w-full bg-[#101318] border border-[#394254] rounded-xl px-4 py-3 text-lg font-mono text-amber-300 focus:border-amber-400 focus:outline-none"
                  placeholder="e.g. 6063"
                  autoFocus
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">
                  km
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOdoModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-[#252c38] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-lg shadow-amber-500/20"
                >
                  Save Odometer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Next Target Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#1a1e27] border border-[#303746] rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
              Set Next Service Target
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Default service interval is recommended every ~2,500 km or at scheduled manual milestones.
            </p>
            <form onSubmit={handleSaveTarget}>
              <div className="relative mb-4">
                <input
                  type="number"
                  min="1"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  className="w-full bg-[#101318] border border-[#394254] rounded-xl px-4 py-3 text-lg font-mono text-amber-300 focus:border-amber-400 focus:outline-none"
                  placeholder="e.g. 7688"
                  autoFocus
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">
                  km
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setTempTarget(String(stats.lastKm + 2500))}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Use +2,500 km ({stats.lastKm + 2500} km)
                </button>
                <button
                  type="button"
                  onClick={() => setTempTarget('7688')}
                  className="text-[11px] text-zinc-400 hover:underline"
                >
                  Preset 7,688 km
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTargetModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-[#252c38] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-lg shadow-amber-500/20"
                >
                  Set Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
