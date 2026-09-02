import React, { useState, useEffect } from 'react';
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
  Plus,
  ChevronDown,
  Building2,
  Trash2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ordinalSuffix, uid } from '../utils/formatters';
import { ServiceRecord } from '../types';

interface ServiceLoggerProps {
  currentOdometer: number;
  servicesCount: number;
  isAdmin?: boolean;
  onAddService: (service: ServiceRecord) => void;
}

const DEFAULT_DEALERS = [
  'M.V. Electronic & D.S. Motors (Matara)',
  'David Pieris Motor Company (Main Complex / Hyde Park)',
  'David Pieris Authorised Workshop - Galle',
  'Bajaj Authorised Service Centre - Kandy',
  'David Pieris Authorised Dealer - Gampaha',
  'Bajaj Speed Tech Service & Spare Parts - Negombo',
  'David Pieris Motor Company - Kurunegala Regional Service Hub',
  'Southern Bajaj Specialist Garage (Matara)',
  'DPMC Express Lube Center (Kalutara)',
];

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

const STORAGE_KEY_DEALERS = 'n160_custom_dealers_list';

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

  // Dealer selection & add options
  const [savedDealers, setSavedDealers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEALERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge unique
          return Array.from(new Set([...DEFAULT_DEALERS, ...parsed]));
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_DEALERS;
  });

  const [showDealerPicker, setShowDealerPicker] = useState(false);
  const [showAddDealerModal, setShowAddDealerModal] = useState(false);
  const [newDealerName, setNewDealerName] = useState('');
  const [newDealerLocation, setNewDealerLocation] = useState('');

  // Persist custom dealers
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DEALERS, JSON.stringify(savedDealers));
    } catch {
      // ignore
    }
  }, [savedDealers]);

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

  const handleAddNewDealer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealerName.trim()) return;

    const formattedName = newDealerLocation.trim()
      ? `${newDealerName.trim()} (${newDealerLocation.trim()})`
      : newDealerName.trim();

    if (!savedDealers.includes(formattedName)) {
      const updated = [formattedName, ...savedDealers];
      setSavedDealers(updated);
    }

    setDealer(formattedName);
    setNewDealerName('');
    setNewDealerLocation('');
    setShowAddDealerModal(false);
    setShowDealerPicker(false);
  };

  const handleSelectDealer = (selected: string) => {
    setDealer(selected);
    setShowDealerPicker(false);
  };

  const handleDeleteDealer = (dealerToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDealers.filter((d) => d !== dealerToDelete);
    setSavedDealers(updated);
    if (dealer === dealerToDelete) {
      setDealer(updated[0] || 'M.V. Electronic & D.S. Motors (Matara)');
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
      <div className="bg-[#0b111e] border border-[#1a2333] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#1a2333]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-sm">
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

          <div className="p-4 rounded-2xl bg-[#070c16] border border-[#1a2333] space-y-3">
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

        <div className="mt-4 p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-zinc-300 flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Switch to Owner / Admin mode to register new service events and stamp official mileage.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b111e] border border-[#1a2333] rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col justify-between relative">
      <div>
        {/* Header - EXACT Shape and Colors from Photo */}
        <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-[#162033]">
          <div className="flex items-center gap-3">
            {/* Red / Coral circular icon container as in photo */}
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-sm shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-wide">
                Log New Service
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Record a completed routine maintenance or inspection
              </p>
            </div>
          </div>

          {/* Amber framed rectangular badge as in photo (e.g. 4th Service) */}
          <div className="px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-mono font-bold bg-[#1c1507] text-amber-400 border border-amber-500/60 shadow-sm text-center shrink-0">
            {defaultLabel}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* FIELD 1: SERVICE DATE (with amber calendar icon) */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Service Date</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#060a12] border border-[#182438] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white transition-colors outline-none"
              required
            />
          </div>

          {/* FIELD 2: ODOMETER (KM) with CURRENT: 6135 KM */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-300 tracking-wider uppercase">
                Odometer (KM)
              </label>
              <span className="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider">
                Current: {currentOdometer} km
              </span>
            </div>
            <input
              type="number"
              min="0"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              className="w-full bg-[#060a12] border border-[#182438] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-bold transition-colors outline-none"
              placeholder="e.g. 6135"
              required
            />
          </div>

          {/* FIELD 3: DEALER / WORKSHOP with NEW ADD OPTION & SELECTOR */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-300 tracking-wider uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Dealer / Workshop</span>
              </label>

              {/* Service Dealer Add Option Button */}
              <button
                type="button"
                onClick={() => setShowAddDealerModal(true)}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-lg transition-all cursor-pointer"
                title="Add New Custom Dealer or Workshop"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Dealer</span>
              </button>
            </div>

            {/* Input with Quick Dropdown Toggle */}
            <div className="relative">
              <input
                type="text"
                value={dealer}
                onChange={(e) => setDealer(e.target.value)}
                placeholder="M.V. Electronic & D.S. Motors (Matara)"
                className="w-full bg-[#060a12] border border-[#182438] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white transition-colors outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowDealerPicker(!showDealerPicker)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-400 hover:text-white bg-[#101726] hover:bg-[#162238] border border-[#202d44] transition-colors cursor-pointer"
                title="Select from Saved Dealers"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showDealerPicker ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown Selector Menu */}
            {showDealerPicker && (
              <div className="mt-2 p-2.5 rounded-2xl bg-[#080d18] border border-[#1e2a40] shadow-2xl space-y-1.5 max-h-56 overflow-y-auto animate-fadeIn z-20">
                <div className="flex items-center justify-between px-2 py-1 text-[11px] text-zinc-400 font-semibold border-b border-[#172133]">
                  <span>Choose Authorized Dealer / Workshop:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDealerPicker(false);
                      setShowAddDealerModal(true);
                    }}
                    className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Custom
                  </button>
                </div>

                {savedDealers.map((d) => {
                  const isSelected = dealer === d;
                  return (
                    <div
                      key={d}
                      onClick={() => handleSelectDealer(d)}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200 font-semibold'
                          : 'bg-[#0b111e] hover:bg-[#111a2d] text-zinc-300 border border-[#162134]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Building2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} />
                        <span className="truncate">{d}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        {/* Only allow delete if not default list */}
                        {!DEFAULT_DEALERS.slice(0, 3).includes(d) && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteDealer(d, e)}
                            className="p-1 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove Dealer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FIELD 4: COST (OPTIONAL LKR) (with emerald dollar icon) */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cost (Optional LKR)</span>
            </label>
            <input
              type="number"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="e.g. 3500"
              className="w-full bg-[#060a12] border border-[#182438] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 transition-colors outline-none"
            />
          </div>

          {/* FIELD 5: PARTS REPLACED / WORK CHECKLIST (EXACT PHOTO COLORS & SHAPES) */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 tracking-wider uppercase mb-2">
              Parts Replaced / Work Checklist ({parts.length})
            </label>

            {/* Checklist items in photo style */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {COMMON_PARTS.map((item) => {
                const isChecked = parts.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => togglePart(item)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-[#241a08] text-amber-200 border border-amber-500/80 shadow-sm'
                        : 'bg-[#070c16] text-zinc-400 border border-[#182338] hover:border-zinc-700'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-600 shrink-0" />
                    )}
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Part Input Bar */}
            <div className="flex items-center gap-2 mt-2.5">
              <input
                type="text"
                value={customPart}
                onChange={(e) => setCustomPart(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomPart();
                  }
                }}
                placeholder="Add other custom part..."
                className="flex-1 bg-[#060a12] border border-[#182438] focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomPart}
                className="px-4 py-2 rounded-xl bg-[#131d2f] hover:bg-[#1c2a42] text-xs font-bold text-zinc-200 border border-[#22334e] transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* FIELD 6: SERVICE NOTES & REMARKS */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 tracking-wider uppercase mb-1.5">
              Service Notes & Remarks
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Engine oil changed with DTS-i 20W50, chain adjusted, front brake pads cleaned."
              className="w-full bg-[#060a12] border border-[#182438] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none resize-none transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-display font-black text-sm tracking-wide text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 border border-amber-300 shadow-[0_4px_20px_rgba(251,191,36,0.35)] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSuccess ? (
              <>
                <Check className="w-4 h-4 text-zinc-950 font-bold" />
                <span>Service Record Added Successfully!</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 text-zinc-950" />
                <span>Record {defaultLabel} ({Number(km).toLocaleString()} km)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* POPUP MODAL: ADD CUSTOM SERVICE DEALER / WORKSHOP */}
      {showAddDealerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b111e] border border-[#1e2a40] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#182338]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Service Dealer</h3>
                  <p className="text-xs text-zinc-400">Save a new workshop for quick selection</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDealerModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewDealer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Dealer / Workshop Name:
                </label>
                <input
                  type="text"
                  value={newDealerName}
                  onChange={(e) => setNewDealerName(e.target.value)}
                  placeholder="e.g. Apex Bajaj Care Center"
                  className="w-full bg-[#060a12] border border-[#1a253a] rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-400 outline-none"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  City / Location (Optional):
                </label>
                <input
                  type="text"
                  value={newDealerLocation}
                  onChange={(e) => setNewDealerLocation(e.target.value)}
                  placeholder="e.g. Matara / Galle Road"
                  className="w-full bg-[#060a12] border border-[#1a253a] rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-200/90 space-y-1">
                <p className="font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Instant Quick Recall:
                </p>
                <p className="text-zinc-400">
                  This dealer will be permanently saved to your device and selectable on all future service logs.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDealerModal(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#101726] hover:bg-[#162238] border border-[#202d44] text-xs font-semibold text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20 hover:from-amber-300 hover:to-yellow-300 transition-all"
                >
                  Save & Select Dealer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
