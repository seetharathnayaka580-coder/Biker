import React from 'react';
import { MaintenanceNotes } from './MaintenanceNotes';
import { MaintenanceNote } from '../types';
import { StickyNote, Disc, Gauge, Droplets, Zap, ShieldAlert, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

interface MaintenanceNotesTabProps {
  notes: MaintenanceNote[];
  currentOdo: number;
  isAdmin: boolean;
  onAddNote: (note: MaintenanceNote) => void;
  onDeleteNote: (id: string) => void;
}

export const MaintenanceNotesTab: React.FC<MaintenanceNotesTabProps> = ({
  notes,
  currentOdo,
  isAdmin,
  onAddNote,
  onDeleteNote,
}) => {
  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#171a23] via-[#1a1f2b] to-[#14161f] border border-[#272d3b] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
            <StickyNote className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
                Garage Remarks & Quick Maintenance Notes
              </h1>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold text-xs">
                {notes.length} Active Notes
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Intermediate chain lubes, tyre pressure checks, fluid top-ups, DIY fixes & mechanic observations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-[#10131a] px-3 py-1.5 rounded-xl border border-[#282f3e]">
          <span>Current Odo:</span>
          <span className="text-amber-400 font-bold">{currentOdo.toLocaleString()} km</span>
        </div>
      </div>

      {/* Main Garage Remarks & Notes Component */}
      <MaintenanceNotes
        notes={notes}
        currentOdo={currentOdo}
        isAdmin={isAdmin}
        onAddNote={onAddNote}
        onDeleteNote={onDeleteNote}
      />

      {/* Pulsar N160 Factory Quick Reference Specs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#141720] border border-[#252b38] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Disc className="w-4 h-4" />
            <span>Drive Chain Maintenance</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Clean and lubricate with O-Ring safe chain lube (e.g. Motul C2/C4) every <strong>500 km</strong>. Recommended chain slack free-play: <strong>20 mm - 30 mm</strong>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#141720] border border-[#252b38] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Gauge className="w-4 h-4" />
            <span>Tyre Pressure Guide (Cold)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Solo Riding: <strong>Front: 25 PSI | Rear: 28 PSI</strong>.<br />
            With Pillion Passenger: <strong>Front: 25 PSI | Rear: 32 PSI</strong>.<br />
            Check tyre pressures weekly when tyres are cold.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#141720] border border-[#252b38] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Droplets className="w-4 h-4" />
            <span>Engine Oil & Fluids</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Engine Oil: <strong>SAE 20W50 API SN, JASO MA2</strong>.<br />
            Quantity: <strong>1150 ml (Refill with filter)</strong>.<br />
            Brake Fluid: <strong>DOT 4 Glycol Fluid</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
