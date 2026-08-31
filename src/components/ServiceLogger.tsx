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

const COMMON_PARTS = [
  'Engine Oil (Bajaj DTS-i 20W50 1.35L)',
  'Oil Filter (Genuine Bajaj)',
  'Air Filter Clean / Replace',
  'Drive Chain Clean & Lubricate',
  'Chain Slack Adjusted',
  'Brake Pads Clean / Inspect',
  'Spark Plug Clean / Check',
  'General Bike Wash & Polish',
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
  const [dealer, setDealer] = useState('M.V. Electronic & D.S. Motors (Matara)');
  const [note, setNote] = useState('');
  const [cost, setCost] = useState('');
  const [parts, setParts] = useState<string[]>([
    'Engine Oil (Bajaj DTS-i 20W50 1.35L)',
    'Oil Filter (Genuine Bajaj)',
    'Drive Chain Clean & Lubricate',
  ]);
  const [customPart, setCustomPart] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const togglePart = (item: string) => {
    if (parts.includes(item)) {
      setParts(parts.filter((p) => p !== item));
    } else {
      setParts([...parts, item]);
    }
  };

  const handleAddCustomPart = () => {
    if (customPart.trim() && !parts.includes(customPart.trim())) {
      setParts([...parts, customPart.trim()]);
      setCustomPart('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const finalKm = Number(km);
    if (isNaN(finalKm) || finalKm <= 0) return;

    const newRecord: ServiceRecord = {
      id: uid('svc'),
      label: defaultLabel,
      date,
      km: finalKm,
      dealer: dealer.trim() || 'M.V. Electronic & D.S. Motors (Matara)',
      note: note.trim() || 'Official periodic service completed.',
      cost: cost ? Number(cost) : undefined,
      partsReplaced: parts,
      locked: false,
    };

    onAddService(newRecord);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);

    // Reset optional fields
    setNote('');
    setCost('');
  };

  if (!isAdmin) {
    return (
      <div className="bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#1a2333]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
                <Wrench className="w-5 h-5" />
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

          <div className="p-4 rounded-xl bg-[#101520] border border-[#1a2333] space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <ClipboardList className="w-4 h-4 text-cyan-400" />
              <span>Bajaj Authorised Digital Records</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              All official service intervals, parts, and workshop stamps are verified and cataloged in the service log below.
            </p>
            <div className="pt-2 border-t border-[#1a2333] text-xs text-zinc-400 space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span>Completed Services:</span>
                <span className="font-bold text-white">{servicesCount} Completed</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Recorded Clock:</span>
                <span className="font-bold text-cyan-400">{currentOdometer.toLocaleString()} km</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-zinc-300 flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Switch to Owner / Admin mode to register new service events and stamp official mileage.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d1117] border border-[#1a2333] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#1a2333]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-black text-base sm:text-lg text-white tracking-wide">
                Log New Service
              </h2>
              <p className="text-[11px] text-zinc-400">Record a completed routine maintenance or inspection</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
            {defaultLabel}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Row 1: Date & Km */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" />
                Service Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#101520] border border-[#1a2333] rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Odometer (KM)</span>
                <span className="text-[10px] text-zinc-500 font-mono">Current: {currentOdometer} km</span>
              </label>
              <input
                type="number"
                min="0"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                className="w-full bg-[#101520] border border-[#1a2333] rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono font-bold focus:border-cyan-400 focus:outline-none transition-colors"
                placeholder="e.g. 7400"
                required
              />
            </div>
          </div>

          {/* Row 2: Dealer & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                Dealer / Workshop
              </label>
              <input
                type="text"
                value={dealer}
                onChange={(e) => setDealer(e.target.value)}
                placeholder="Workshop Name"
                className="w-full bg-[#101520] border border-[#1a2333] rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                Cost (Optional LKR)
              </label>
              <input
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. 3500"
                className="w-full bg-[#101520] border border-[#1a2333] rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Row 3: Parts Replaced Checklist */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Parts Replaced / Work Checklist ({parts.length})
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {COMMON_PARTS.map((item) => {
                const isChecked = parts.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => togglePart(item)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30'
                        : 'bg-[#101520] text-zinc-400 border border-[#1a2333] hover:border-cyan-500/30'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    )}
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Part Input */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={customPart}
                onChange={(e) => setCustomPart(e.target.value)}
                placeholder="Add other custom part..."
                className="flex-1 bg-[#101520] border border-[#1a2333] rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomPart}
                className="px-3 py-1.5 rounded-xl bg-[#131924] hover:bg-[#1a2333] text-xs font-semibold text-zinc-200 border border-[#233044] cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Row 4: Note */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Service Notes & Remarks
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Engine oil changed with DTS-i 20W50, chain adjusted, front brake pads cleaned."
              className="w-full bg-[#101520] border border-[#1a2333] rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs sm:text-sm tracking-wide text-white bg-gradient-to-r from-[#00e5ff] via-[#00a2ff] to-[#0066ff] hover:from-[#33ecff] hover:to-[#1a75ff] border border-cyan-300/40 shadow-[0_4px_20px_rgba(0,162,255,0.4)] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                Service Record Added!
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Record {defaultLabel} ({Number(km).toLocaleString()} km)
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
