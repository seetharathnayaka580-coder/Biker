import React, { useState } from 'react';
import { Gauge, ArrowUpRight, CheckCircle2, AlertTriangle, AlertCircle, Edit3, Plus } from 'lucide-react';
import { calculateServiceStats, fmtKm } from '../utils/formatters';
import { ServiceRecord } from '../types';

interface OdometerGaugeProps {
  odometer: number;
  targets: number[];
  services: ServiceRecord[];
  isAdmin?: boolean;
  onUpdateOdometer: (newOdo: number) => void;
  onUpdateTarget: (newTarget: number) => void;
}

export const OdometerGauge: React.FC<OdometerGaugeProps> = ({
  odometer,
  targets,
  services,
  isAdmin = true,
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
    return '#00e5ff'; // Electric Cyan
  };

  return (
    <div className="relative bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 sm:p-6 shadow-xl overflow-hidden flex flex-col justify-between group">
      {/* Rainbow ambient background glow */}
      <div
        className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none bg-gradient-to-tr from-rose-500 via-emerald-400 via-cyan-400 to-purple-600 animate-rainbow"
      />
      <div
        className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none bg-gradient-to-tr from-cyan-400 via-amber-400 to-rose-500 animate-rainbow"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-500 via-amber-400 via-cyan-400 to-purple-500 p-[1px] flex items-center justify-center">
            <div className="w-full h-full bg-[#0d1117] rounded-[7px] flex items-center justify-center">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
          <h2 className="font-display font-bold text-base sm:text-lg text-white tracking-wide">
            Distance to Next Service
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          {isAdmin ? (
            <>
              <button
                onClick={() => {
                  setTempOdo(odometer.toString());
                  setShowOdoModal(true);
                }}
                className="px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:text-white bg-[#101520] hover:bg-[#161e2e] border border-[#1a2333] hover:border-cyan-400/50 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Edit3 className="w-3 h-3 text-cyan-400" />
                Edit Odo
              </button>
              <button
                onClick={() => {
                  setTempTarget(currentTarget.toString());
                  setShowTargetModal(true);
                }}
                className="px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:text-white bg-[#101520] hover:bg-[#161e2e] border border-[#1a2333] hover:border-purple-400/50 rounded-lg transition-all cursor-pointer shadow-sm"
              >
                Target: <span className="text-cyan-300 font-mono font-bold">{currentTarget} km</span>
              </button>
            </>
          ) : (
            <span className="px-2.5 py-1 text-[11px] font-mono text-zinc-400 bg-[#101520] border border-[#1a2333] rounded-lg">
              Target: {currentTarget} km
            </span>
          )}
        </div>
      </div>

      {/* Central Dial */}
      <div className="relative flex flex-col items-center justify-center my-3 z-10">
        <svg viewBox="0 0 220 135" className="w-full max-w-[280px] sm:max-w-[310px] overflow-visible">
          <defs>
            {/* Rainbow Spectrum Gradient for Gauge */}
            <linearGradient id="rainbowGaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff0055" />
              <stop offset="18%" stopColor="#ff6d00" />
              <stop offset="38%" stopColor="#ffd600" />
              <stop offset="58%" stopColor="#00e676" />
              <stop offset="78%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#7c4dff" />
            </linearGradient>
            <linearGradient id="gaugeOverdueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            <filter id="rainbowGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d="M 20 120 A 90 90 0 0 1 200 120"
            fill="none"
            stroke="#141923"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Active Fill Arc */}
          <path
            d="M 20 120 A 90 90 0 0 1 200 120"
            fill="none"
            stroke={stats.isOverdue ? 'url(#gaugeOverdueGradient)' : 'url(#rainbowGaugeGradient)'}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeOffset}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease',
              filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.45)) drop-shadow(0 0 14px rgba(255, 0, 100, 0.25))',
            }}
          />

          {/* Rainbow Tick markers */}
          <circle cx="20" cy="120" r="3" fill="#ff0055" />
          <circle cx="65" cy="55" r="2.5" fill="#ffd600" />
          <circle cx="110" cy="30" r="3" fill="#00e676" />
          <circle cx="155" cy="55" r="2.5" fill="#00e5ff" />
          <circle cx="200" cy="120" r="3" fill="#7c4dff" />
        </svg>

        {/* Readout overlay inside arc */}
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,229,255,0.4)]">
            {odometer.toLocaleString('en-US')}
          </span>
          <span className="block text-[11px] font-bold rainbow-text uppercase tracking-widest mt-0.5">
            KM ON THE CLOCK
          </span>
        </div>

        {/* Quick Increment Chips / Rainbow Palette */}
        {isAdmin ? (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[11px] text-zinc-400 font-medium mr-1">Quick Add:</span>
            {[
              { val: 10, color: 'text-rose-300 bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/25' },
              { val: 25, color: 'text-amber-300 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/25' },
              { val: 50, color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/25' },
              { val: 100, color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/25' },
            ].map(({ val, color }) => (
              <button
                key={val}
                onClick={() => handleQuickAdd(val)}
                className={`px-2 py-0.5 text-[11px] font-mono border rounded-md transition-all cursor-pointer flex items-center gap-0.5 shadow-sm active:scale-95 ${color}`}
                title={`Add ${val} km to current odometer`}
              >
                <Plus className="w-2.5 h-2.5" />
                {val}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-[11px] font-mono text-zinc-500 mt-2 flex items-center gap-1">
            <span>🔒 Odometer updates managed by Administrator (Sachi)</span>
          </div>
        )}
      </div>

      {/* Stats Breakdown Bar */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1a2333] mt-2 text-center relative z-10">
        <div className="p-2 rounded-xl bg-[#101520] border border-cyan-500/20">
          <span className="block text-[10px] uppercase font-semibold text-cyan-300 tracking-wider">
            Last Service
          </span>
          <span className="font-mono text-xs sm:text-sm font-semibold text-zinc-200">
            {fmtKm(stats.lastKm)}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-[#101520] border border-purple-500/20">
          <span className="block text-[10px] uppercase font-semibold text-purple-300 tracking-wider">
            Next Target
          </span>
          <span className="font-mono text-xs sm:text-sm font-bold text-cyan-300">
            {fmtKm(stats.target)}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-[#101520] border border-emerald-500/20">
          <span className="block text-[10px] uppercase font-semibold text-emerald-300 tracking-wider">
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

      {/* Ridden This Period Info banner with Rainbow Accent */}
      <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-[#101520] via-[#131b2c] to-[#101520] border border-cyan-500/25 flex items-center justify-between text-xs relative z-10 shadow-sm">
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
            <span className="font-mono font-bold text-cyan-300">
              {fmtKm(stats.riddenSinceLast)}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500/20 via-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
          {Math.round(stats.progressRatio * 100)}%
        </span>
      </div>

      {/* Edit Odometer Modal */}
      {showOdoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-cyan-400" />
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
                  className="w-full bg-[#101520] border border-[#1a2333] focus:border-cyan-400 rounded-xl px-4 py-3 text-lg font-mono text-cyan-300 focus:outline-none"
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
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-[#161e2e] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00e5ff] via-[#00a2ff] to-[#0066ff] hover:from-[#33ecff] hover:to-[#1a75ff] text-white transition-colors shadow-lg shadow-cyan-500/20"
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
          <div className="w-full max-w-sm bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-cyan-400" />
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
                  className="w-full bg-[#101520] border border-[#1a2333] focus:border-cyan-400 rounded-xl px-4 py-3 text-lg font-mono text-cyan-300 focus:outline-none"
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
                  className="text-[11px] text-cyan-400 hover:underline"
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
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-[#161e2e] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00e5ff] via-[#00a2ff] to-[#0066ff] hover:from-[#33ecff] hover:to-[#1a75ff] text-white transition-colors shadow-lg shadow-cyan-500/20"
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
