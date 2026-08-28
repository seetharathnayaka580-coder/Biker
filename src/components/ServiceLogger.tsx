import React, { useState } from 'react';
import {
  PlusCircle,
  Wrench,
  Calendar,
  MapPin,
  CheckSquare,
  Square,
  DollarSign,
  Check,
  FileText,
  Lock,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import { ordinalSuffix, uid } from '../utils/formatters';
import { ServiceRecord } from '../types';

interface ServiceLoggerProps {
  currentOdometer: number;
  servicesCount: number;
  isAdmin?: boolean;
  onAddService: (service: ServiceRecord) => void;
}

const COMMON_TASKS = [
  'Engine Oil Replacement',
  'Oil Filter Change',
  'Bike Wash & Foam Clean',
  'Brake Pads Clean & Inspect',
  'Drive Chain Clean & Lube',
  'Chain Slack Adjustment',
  'Air Filter Clean / Replace',
  'Spark Plug Inspection',
  'Throttle & Clutch Cable Lube',
  'Battery & Electrical Check',
];

const DEALER_PRESETS = [
  'M.V. Electronic & D.S. Motors',
  'Bajaj Authorized Service Station',
  'David Pieris Motor Company (DPMC)',
  'Self Service / Personal Workshop',
];

export const ServiceLogger: React.FC<ServiceLoggerProps> = ({
  currentOdometer,
  servicesCount,
  isAdmin = true,
  onAddService,
}) => {
  const nextOrdinalNum = servicesCount + 1;
  const defaultLabel = `${nextOrdinalNum}${ordinalSuffix(nextOrdinalNum)} Service`;

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [km, setKm] = useState(currentOdometer.toString());
  const [dealer, setDealer] = useState('M.V. Electronic & D.S. Motors');
  const [customDealer, setCustomDealer] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([
    'Engine Oil Replacement',
    'Oil Filter Change',
    'Bike Wash & Foam Clean',
    'Brake Pads Clean & Inspect',
  ]);
  const [note, setNote] = useState('');
  const [cost, setCost] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleTask = (task: string) => {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(selectedTasks.filter((t) => t !== task));
    } else {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const finalKm = Number(km);
    if (isNaN(finalKm) || finalKm <= 0) return;

    const finalDealer = customDealer.trim() || dealer;
    const taskSummary = selectedTasks.length > 0 ? selectedTasks.join(', ') : '';
    const finalNote = note.trim() ? `${taskSummary ? taskSummary + '. ' : ''}${note.trim()}` : taskSummary;

    const newRecord: ServiceRecord = {
      id: uid('svc'),
      label: defaultLabel,
      date,
      km: finalKm,
      dealer: finalDealer,
      note: finalNote || 'Routine maintenance completed.',
      cost: cost ? Number(cost) : undefined,
      partsReplaced: selectedTasks,
      locked: false,
    };

    onAddService(newRecord);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2500);

    // Reset fields for next entry
    setNote('');
    setCost('');
  };

  // CLIENT READ-ONLY INSPECTION VIEW
  if (!isAdmin) {
    return (
      <div className="bg-[#171a21] border border-[#262b35] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#242935]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base sm:text-lg text-white tracking-wide">
                  Service Summary
                </h2>
                <p className="text-xs text-zinc-400">Official Genuine Maintenance History</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#11141a] border border-[#222733] space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <ClipboardList className="w-4 h-4 text-amber-400" />
              <span>Bajaj Authorised Service Records</span>
            </div>
            <div className="pt-2 border-t border-[#1e232e] text-xs text-zinc-400 space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span>Completed Services:</span>
                <span className="font-bold text-white">{servicesCount} Completed</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Recorded Clock:</span>
                <span className="font-bold text-amber-400">{currentOdometer.toLocaleString()} km</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-zinc-300 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400 shrink-0" />
          <span>All official service intervals and workshop details are recorded below.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#171a21] border border-[#262b35] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-red-400" />
          <h2 className="font-display font-bold text-base sm:text-lg text-white tracking-wide">
            Log New Service Record
          </h2>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          Next: {defaultLabel}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date & KM Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              Service Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#11141a] border border-[#2d3442] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Odometer Reading (km)
            </label>
            <input
              type="number"
              min="0"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              className="w-full bg-[#11141a] border border-[#2d3442] rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:border-amber-400 focus:outline-none"
              placeholder="e.g. 7400"
              required
            />
          </div>
        </div>

        {/* Dealer / Workshop */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-400" />
            Dealer / Workshop
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={dealer}
              onChange={(e) => {
                setDealer(e.target.value);
                if (e.target.value !== 'Other') setCustomDealer('');
              }}
              className="bg-[#11141a] border border-[#2d3442] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
            >
              {DEALER_PRESETS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              <option value="Other">Other Workshop...</option>
            </select>

            {dealer === 'Other' && (
              <input
                type="text"
                value={customDealer}
                onChange={(e) => setCustomDealer(e.target.value)}
                placeholder="Enter workshop name"
                className="bg-[#11141a] border border-[#2d3442] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                required
              />
            )}
          </div>
        </div>

        {/* Quick Checklists for maintenance tasks */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Maintenance Checklist & Parts</span>
            <span className="text-[10px] text-zinc-500 font-normal">
              {selectedTasks.length} selected
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {COMMON_TASKS.map((task) => {
              const isChecked = selectedTasks.includes(task);
              return (
                <button
                  type="button"
                  key={task}
                  onClick={() => toggleTask(task)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
                      : 'bg-[#11141a] text-zinc-400 border border-[#262c37] hover:border-zinc-600'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  )}
                  <span className="truncate">{task}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Notes & Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-zinc-400" />
              Additional Remarks
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Front fork oil check, tyre pressure adjusted"
              className="w-full bg-[#11141a] border border-[#2d3442] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-zinc-400" />
              Cost (LKR/Currency)
            </label>
            <input
              type="number"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="e.g. 6500"
              className="w-full bg-[#11141a] border border-[#2d3442] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-xl font-display font-bold text-sm tracking-wide text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border border-red-500/40 shadow-lg shadow-red-600/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isSuccess ? (
            <>
              <Check className="w-4 h-4 text-white animate-bounce" />
              Record Added Successfully!
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              Record {defaultLabel}
            </>
          )}
        </button>
      </form>
    </div>
  );
};
