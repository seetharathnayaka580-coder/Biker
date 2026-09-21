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
import { ServiceRecord, ServiceItemCost, ExpenseCategory } from '../types';

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
  'Drive Chain Clean & Lubricate',
  'Air Filter Clean / Replace',
  'Chain Slack Adjusted',
  'Brake Pads Clean / Inspect',
  'Spark Plug Clean / Check',
  'General Bike Wash & Polish',
];

const DEFAULT_PART_PRICES: Record<string, string> = {
  'Engine Oil (Bajaj DTS-i 20W50 1.35L)': '2800',
  'Oil Filter (Genuine Bajaj)': '750',
  'Drive Chain Clean & Lubricate': '800',
  'Air Filter Clean / Replace': '1200',
  'Chain Slack Adjusted': '300',
  'Brake Pads Clean / Inspect': '500',
  'Spark Plug Clean / Check': '600',
  'General Bike Wash & Polish': '800',
};

function detectPartCategory(name: string): ExpenseCategory {
  const lower = name.toLowerCase();
  if (lower.includes('oil') || lower.includes('fluid') || lower.includes('coolant')) {
    return 'oil_fluids';
  }
  if (lower.includes('chain') || lower.includes('sprocket')) {
    return 'chain_sprocket';
  }
  if (lower.includes('tyre') || lower.includes('tire') || lower.includes('wheel')) {
    return 'tyres_wheels';
  }
  if (lower.includes('wash') || lower.includes('polish') || lower.includes('detail')) {
    return 'wash_detail';
  }
  if (lower.includes('plug') || lower.includes('battery') || lower.includes('fuse') || lower.includes('electrical')) {
    return 'electrical';
  }
  if (lower.includes('labour') || lower.includes('labor') || lower.includes('service charge') || lower.includes('fee')) {
    return 'labour_fee';
  }
  return 'spares_parts';
}

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
  
  // Separate Service / Labour fee and individual parts costs
  const [serviceFee, setServiceFee] = useState('1200');
  const [parts, setParts] = useState<string[]>([
    'Engine Oil (Bajaj DTS-i 20W50 1.35L)',
    'Oil Filter (Genuine Bajaj)',
    'Drive Chain Clean & Lubricate',
  ]);
  const [partCosts, setPartCosts] = useState<Record<string, string>>({
    'Engine Oil (Bajaj DTS-i 20W50 1.35L)': '2800',
    'Oil Filter (Genuine Bajaj)': '750',
    'Drive Chain Clean & Lubricate': '800',
  });
  const [customPart, setCustomPart] = useState('');
  const [customPartCost, setCustomPartCost] = useState('');
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
      if (!partCosts[item]) {
        setPartCosts((prev) => ({
          ...prev,
          [item]: DEFAULT_PART_PRICES[item] || '800',
        }));
      }
    }
  };

  const handleUpdatePartCost = (item: string, costStr: string) => {
    setPartCosts((prev) => ({
      ...prev,
      [item]: costStr,
    }));
  };

  const handleAddCustomPart = () => {
    const trimmed = customPart.trim();
    if (trimmed && !parts.includes(trimmed)) {
      setParts([...parts, trimmed]);
      setPartCosts((prev) => ({
        ...prev,
        [trimmed]: customPartCost.trim() || '1000',
      }));
      setCustomPart('');
      setCustomPartCost('');
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

  const serviceFeeNum = Math.max(0, Number(serviceFee) || 0);
  const partsTotalNum = parts.reduce((sum, p) => sum + Math.max(0, Number(partCosts[p]) || 0), 0);
  const totalCostNum = serviceFeeNum + partsTotalNum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const finalKm = Number(km);
    if (isNaN(finalKm) || finalKm <= 0) return;

    // Compile items list: service fee and each individual part with distinct costs
    const items: ServiceItemCost[] = [];

    if (serviceFeeNum > 0) {
      items.push({
        name: 'Workshop Service Charge & Labour Fee',
        amount: serviceFeeNum,
        category: 'labour_fee',
      });
    }

    parts.forEach((p) => {
      const pAmt = Math.max(0, Number(partCosts[p]) || 0);
      if (pAmt > 0) {
        items.push({
          name: p,
          amount: pAmt,
          category: detectPartCategory(p),
        });
      }
    });

    const newRecord: ServiceRecord = {
      id: uid('svc'),
      label: defaultLabel,
      date,
      km: finalKm,
      dealer: dealer.trim() || 'M.V. Electronic & D.S. Motors (Matara)',
      note: note.trim() || 'Official periodic service completed.',
      cost: totalCostNum > 0 ? totalCostNum : undefined,
      serviceFee: serviceFeeNum > 0 ? serviceFeeNum : undefined,
      partsCost: partsTotalNum > 0 ? partsTotalNum : undefined,
      items: items.length > 0 ? items : undefined,
      partsReplaced: parts,
      locked: false,
    };

    onAddService(newRecord);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);

    // Reset optional fields
    setNote('');
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

          {/* FIELD 4: WORKSHOP SERVICE & LABOUR FEE (SEPARATE FROM PARTS) */}
          <div className="bg-[#070c16] border border-[#182438] rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200 tracking-wider uppercase flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Workshop Service Charge / Labour Fee</span>
              </label>
              <span className="text-[11px] font-mono text-amber-300 font-bold">
                {serviceFeeNum > 0 ? `Rs. ${serviceFeeNum.toLocaleString()}` : 'Free / No Charge'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Official service charge, labour, bike wash, and inspection fees (entered separately from replacement parts).
            </p>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 font-mono">
                Rs.
              </span>
              <input
                type="number"
                min="0"
                value={serviceFee}
                onChange={(e) => setServiceFee(e.target.value)}
                placeholder="e.g. 1200"
                className="w-full bg-[#060a12] border border-[#1c2940] focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-11 pr-14 py-2.5 text-sm text-white font-mono placeholder-zinc-600 transition-colors outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium">
                LKR
              </span>
            </div>

            {/* Quick preset buttons for routine service fees */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-zinc-500 font-medium mr-1">Presets:</span>
              {[
                { label: 'Free (Warranty)', val: '0' },
                { label: 'Rs. 1,000', val: '1000' },
                { label: 'Rs. 1,200', val: '1200' },
                { label: 'Rs. 1,500', val: '1500' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.val}
                  onClick={() => setServiceFee(p.val)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                    serviceFee === p.val
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-[#0f1726] text-zinc-400 border-[#1c283d] hover:text-zinc-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* FIELD 5: INDIVIDUAL PARTS USED WITH SEPARATE ITEM COSTS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300 tracking-wider uppercase flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-cyan-400" />
                <span>Parts Replaced & Consumables ({parts.length})</span>
              </label>
              <span className="text-[11px] font-mono text-cyan-400 font-bold">
                Parts Total: Rs. {partsTotalNum.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Input or edit the individual cost for each item used. These will be itemized under Maintenance Costs.
            </p>

            {/* Checklist items with inline price input */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {COMMON_PARTS.map((item) => {
                const isChecked = parts.includes(item);
                const currentItemCost = partCosts[item] || DEFAULT_PART_PRICES[item] || '500';

                return (
                  <div
                    key={item}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isChecked
                        ? 'bg-[#151d2a] border-amber-500/50 shadow-sm'
                        : 'bg-[#070c16] border-[#182338] hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      {/* Checkbox and Label */}
                      <button
                        type="button"
                        onClick={() => togglePart(item)}
                        className="flex items-center gap-2.5 text-left text-xs sm:text-sm font-medium transition-all cursor-pointer flex-1 min-w-0"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600 shrink-0" />
                        )}
                        <span className={`truncate ${isChecked ? 'text-zinc-100 font-semibold' : 'text-zinc-400'}`}>
                          {item}
                        </span>
                      </button>

                      {/* Individual Part Cost Input */}
                      {isChecked ? (
                        <div className="flex items-center gap-1.5 shrink-0 bg-[#090e17] border border-[#23334d] px-2 py-1 rounded-lg">
                          <span className="text-[10px] text-zinc-400 font-mono">Rs.</span>
                          <input
                            type="number"
                            min="0"
                            value={partCosts[item] || ''}
                            onChange={(e) => handleUpdatePartCost(item, e.target.value)}
                            placeholder="Cost"
                            className="w-16 bg-transparent text-right text-xs font-mono font-bold text-amber-300 outline-none"
                            title={`Cost for ${item}`}
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-600 shrink-0">
                          ~Rs. {DEFAULT_PART_PRICES[item]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Any additional custom parts that were added */}
              {parts
                .filter((p) => !COMMON_PARTS.includes(p))
                .map((customItem) => (
                  <div
                    key={customItem}
                    className="p-2.5 rounded-xl border bg-[#151d2a] border-cyan-500/50 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-cyan-100 truncate">
                        {customItem}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 bg-[#090e17] border border-[#23334d] px-2 py-1 rounded-lg">
                        <span className="text-[10px] text-zinc-400 font-mono">Rs.</span>
                        <input
                          type="number"
                          min="0"
                          value={partCosts[customItem] || ''}
                          onChange={(e) => handleUpdatePartCost(customItem, e.target.value)}
                          placeholder="Cost"
                          className="w-16 bg-transparent text-right text-xs font-mono font-bold text-cyan-300 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePart(customItem)}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Remove part"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Custom Part Input Bar with dedicated name & cost */}
            <div className="bg-[#080d17] border border-[#162134] rounded-xl p-2.5 space-y-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Add Custom Part & Price
              </span>
              <div className="flex items-center gap-2">
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
                  placeholder="Part name (e.g. Brake Pads, O-Ring)"
                  className="flex-1 bg-[#060a12] border border-[#1c2940] focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none"
                />
                <div className="relative w-24">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-mono">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={customPartCost}
                    onChange={(e) => setCustomPartCost(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomPart();
                      }
                    }}
                    placeholder="Price"
                    className="w-full bg-[#060a12] border border-[#1c2940] focus:border-cyan-400 rounded-xl pl-7 pr-2 py-1.5 text-xs text-white font-mono placeholder-zinc-500 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomPart}
                  className="px-3.5 py-1.5 rounded-xl bg-[#142034] hover:bg-[#1d2d48] text-xs font-bold text-cyan-300 border border-[#233552] transition-colors cursor-pointer shrink-0"
                >
                  Add Part
                </button>
              </div>
            </div>
          </div>

          {/* LIVE TOTAL COST SUMMARY CARD */}
          <div className="bg-gradient-to-br from-[#0c1422] to-[#080d16] border border-[#1e2f4a] rounded-2xl p-4 shadow-md space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Service Total Cost Summary</span>
              </span>
              <div className="text-right">
                <span className="text-xs text-zinc-400 mr-2">Service Record Total:</span>
                <span className="font-mono font-black text-base sm:text-lg text-emerald-400">
                  Rs. {totalCostNum.toLocaleString()} LKR
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-[#162338]">
              <div className="text-zinc-400">
                Labour / Workshop:{' '}
                <span className="text-zinc-200 font-semibold">
                  Rs. {serviceFeeNum.toLocaleString()}
                </span>
              </div>
              <div className="text-zinc-400 text-right">
                Parts ({parts.length} items):{' '}
                <span className="text-zinc-200 font-semibold">
                  Rs. {partsTotalNum.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 text-[11px] text-emerald-300/90 leading-snug flex items-start gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Display Rule:</strong> The service record will display only the total cost (Rs. {totalCostNum.toLocaleString()} LKR). The individual parts and labour costs will be itemized under the <strong>'Maintenance Costs'</strong> tab.
              </span>
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
