import React from 'react';
import { X, CheckCircle2, Clock, Wrench, Shield, AlertCircle, Droplets, Disc, Sparkles } from 'lucide-react';
import { fmtKm } from '../utils/formatters';

interface ScheduleGuideModalProps {
  currentOdo: number;
  onClose: () => void;
}

interface Milestone {
  service: string;
  recommendedKm: number;
  timePeriod: string;
  status: 'completed' | 'upcoming' | 'future';
  keyTasks: string[];
}

export const ScheduleGuideModal: React.FC<ScheduleGuideModalProps> = ({ currentOdo, onClose }) => {
  const milestones: Milestone[] = [
    {
      service: '1st Service',
      recommendedKm: 750,
      timePeriod: '30 - 45 Days',
      status: currentOdo >= 707 ? 'completed' : 'upcoming',
      keyTasks: ['Engine Oil (DTS-i)', 'Oil Filter Replacement', 'Tappet Check', 'Chain Lube', 'Washing'],
    },
    {
      service: '2nd Service',
      recommendedKm: 2500,
      timePeriod: '120 Days / 4 Mo',
      status: currentOdo >= 2394 ? 'completed' : 'upcoming',
      keyTasks: ['Engine Oil Replacement', 'Brake Clean & Inspection', 'Chain Slack Check', 'Washing'],
    },
    {
      service: '3rd Service',
      recommendedKm: 5000,
      timePeriod: '240 Days / 8 Mo',
      status: currentOdo >= 4894 ? 'completed' : 'upcoming',
      keyTasks: ['Engine Oil Replacement', 'Oil Filter Change', 'Air Filter Clean', 'Brake Pads Check'],
    },
    {
      service: '4th Service',
      recommendedKm: 7500,
      timePeriod: '360 Days / 1 Yr',
      status: currentOdo >= 7500 ? 'completed' : currentOdo >= 5500 ? 'upcoming' : 'future',
      keyTasks: ['Engine Oil Replacement', 'Spark Plug Inspection', 'Brake Pad Replacement Check', 'Chain Service'],
    },
    {
      service: '5th Service',
      recommendedKm: 10000,
      timePeriod: '15 Months',
      status: currentOdo >= 10000 ? 'completed' : 'future',
      keyTasks: ['Engine Oil & Oil Filter', 'Air Filter Replacement', 'Spark Plug Replacement', 'Brake Fluid Top-up'],
    },
    {
      service: '6th Service',
      recommendedKm: 12500,
      timePeriod: '18 Months',
      status: currentOdo >= 12500 ? 'completed' : 'future',
      keyTasks: ['Engine Oil Replacement', 'Valve Tappet Clearance Check', 'Cables Lubrication', 'Brake Caliper Clean'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#171a21] border border-[#2a303d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#13151b] px-5 py-4 flex items-center justify-between border-b border-[#252a35]">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-display font-bold text-base text-white tracking-wide">
                Bajaj Pulsar N160 Service Interval Guide
              </h3>
              <p className="text-xs text-zinc-400">
                Factory recommended maintenance milestones & component lifecycles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Milestone List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Periodic Service Intervals
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    m.status === 'completed'
                      ? 'bg-[#1a202a]/70 border-emerald-500/30'
                      : m.status === 'upcoming'
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : 'bg-[#12151b] border-[#222732] opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {m.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : m.status === 'upcoming' ? (
                        <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-zinc-600 flex items-center justify-center text-[10px] text-zinc-500">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-white">{m.service}</span>
                        <span className="font-mono text-xs font-semibold text-amber-300">
                          {fmtKm(m.recommendedKm)}
                        </span>
                        <span className="text-[11px] text-zinc-400">({m.timePeriod})</span>
                        {m.status === 'upcoming' && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-500 text-zinc-950">
                            NEXT TARGET
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {m.keyTasks.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] px-2 py-0.5 rounded bg-[#1f2430] text-zinc-300 border border-[#2d3443]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <span
                      className={`text-xs font-mono font-bold uppercase ${
                        m.status === 'completed'
                          ? 'text-emerald-400'
                          : m.status === 'upcoming'
                          ? 'text-amber-400'
                          : 'text-zinc-500'
                      }`}
                    >
                      {m.status === 'completed' ? 'Done' : m.status === 'upcoming' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Component Replacement Lifecycles */}
          <div className="p-4 rounded-xl bg-[#12151b] border border-[#232835]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-amber-400" />
              Essential Consumables & Periodic Lifecycles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#181c24] border border-[#262c37]">
                <span className="font-bold text-amber-300 block mb-0.5">Engine Oil & Filter</span>
                <span className="text-zinc-400 text-[11px]">
                  Replace oil every 2,500 km or 4 months. Oil filter every 5,000 km. Capacity: ~1.2L - 1.3L.
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#181c24] border border-[#262c37]">
                <span className="font-bold text-amber-300 block mb-0.5">Drive Chain Care</span>
                <span className="text-zinc-400 text-[11px]">
                  Clean & lubricate every 500 km. Check chain slack (25-35 mm) regularly.
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#181c24] border border-[#262c37]">
                <span className="font-bold text-amber-300 block mb-0.5">Spark Plug & Air Filter</span>
                <span className="text-zinc-400 text-[11px]">
                  Clean air filter every service; replace at 10,000 km. Replace Champion spark plug at 10,000 km.
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#181c24] border border-[#262c37]">
                <span className="font-bold text-amber-300 block mb-0.5">Brake Pads & Fluid (DOT 4)</span>
                <span className="text-zinc-400 text-[11px]">
                  Inspect pads thickness (&gt;1.5mm) every service. Flush DOT 4 brake fluid every 20,000 km / 2 yrs.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#13151b] px-5 py-3 border-t border-[#252a35] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
