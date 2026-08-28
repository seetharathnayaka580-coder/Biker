import React, { useState } from 'react';
import {
  Shield,
  Hash,
  KeyRound,
  Palette,
  User,
  BookOpen,
  Copy,
  Check,
  Edit2,
  Lock,
  MapPin,
  Calendar,
  Sparkles,
  Award,
  Zap,
  Gauge,
  Fuel,
  Wrench,
  FileText,
  CheckCircle2,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { VehicleDetails } from '../types';

interface VehicleRegistrationTabProps {
  vehicle: VehicleDetails;
  isAdmin: boolean;
  onUpdateVehicle: (updated: VehicleDetails) => void;
  onOpenPrintBooklet: () => void;
}

export const VehicleRegistrationTab: React.FC<VehicleRegistrationTabProps> = ({
  vehicle,
  isAdmin,
  onUpdateVehicle,
  onOpenPrintBooklet,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<VehicleDetails>(vehicle);

  const handleCopy = (key: string, text: string) => {
    if (!isAdmin) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    onUpdateVehicle(editData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#171a23] via-[#1a1f2b] to-[#14161f] border border-[#272d3b] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 p-1 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10 overflow-hidden">
            <img
              src={vehicle.photoUrl || '/pulsar_n160.svg'}
              alt="Bajaj Pulsar N160"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
                Vehicle Identification & Owner Registration
              </h1>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold text-xs">
                {vehicle.regNo}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Official DMV & David Pieris Motor Company digital registry record
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setEditData(vehicle);
                setIsEditing(!isEditing);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Information'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPrintBooklet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#202735] hover:bg-[#283244] text-zinc-200 border border-[#333e54] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print ID Card</span>
          </button>
        </div>
      </div>

      {/* Admin Edit Form */}
      {isEditing && isAdmin && (
        <form onSubmit={handleSaveEdit} className="p-5 rounded-2xl bg-[#161a22] border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#2a3040]">
            <Edit2 className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Edit Vehicle & Owner Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Owner Full Name
              </label>
              <input
                type="text"
                value={editData.owner}
                onChange={(e) => setEditData({ ...editData, owner: e.target.value })}
                className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Vehicle Model
              </label>
              <input
                type="text"
                value={editData.model}
                onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Body Colour & Trim
              </label>
              <input
                type="text"
                value={editData.colour}
                onChange={(e) => setEditData({ ...editData, colour: e.target.value })}
                className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Registration Number (Plate)
              </label>
              <input
                type="text"
                value={editData.regNo}
                onChange={(e) => setEditData({ ...editData, regNo: e.target.value })}
                className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Chassis / VIN Number (17 digits)
              </label>
              <input
                type="text"
                value={editData.chassisNo}
                onChange={(e) => setEditData({ ...editData, chassisNo: e.target.value })}
                className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Engine Number
              </label>
              <input
                type="text"
                value={editData.engineNo}
                onChange={(e) => setEditData({ ...editData, engineNo: e.target.value })}
                className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Service Book ID Number
              </label>
              <input
                type="text"
                value={editData.bookNo}
                onChange={(e) => setEditData({ ...editData, bookNo: e.target.value })}
                className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-[#202530] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-lg cursor-pointer"
            >
              Save Changes to Cloud
            </button>
          </div>
        </form>
      )}

      {/* 2 Main Cards: Bike Details & Owner Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CARD 1: BIKE DETAILS (Vehicle Identification) */}
        <div className="lg:col-span-7 bg-[#141720] rounded-2xl border border-[#272d3b] p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#222734]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Bike Details & Specifications
                </h2>
                <span className="text-[11px] text-zinc-400">Technical and engineering identification</span>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Verified Specs
            </span>
          </div>

          {/* Core Identification Numbers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Registration Number */}
            <div
              onClick={() => handleCopy('regNo', vehicle.regNo)}
              className="p-3 rounded-xl bg-[#191d27] border border-[#2c3444] flex flex-col justify-between group hover:border-amber-500/40 transition-colors cursor-pointer"
              title={isAdmin ? 'Click to copy' : ''}
            >
              <div className="flex items-center justify-between text-[11px] text-zinc-400 uppercase font-semibold">
                <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-amber-400" /> Plate Number</span>
                {isAdmin && (copiedKey === 'regNo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500 group-hover:text-amber-400" />)}
              </div>
              <div className="text-lg font-mono font-black text-amber-300 mt-1">{vehicle.regNo}</div>
              <span className="text-[10px] text-zinc-400">Sri Lanka DMT Registered</span>
            </div>

            {/* Service Book Number */}
            <div
              onClick={() => handleCopy('bookNo', vehicle.bookNo)}
              className="p-3 rounded-xl bg-[#191d27] border border-[#2c3444] flex flex-col justify-between group hover:border-amber-500/40 transition-colors cursor-pointer"
              title={isAdmin ? 'Click to copy' : ''}
            >
              <div className="flex items-center justify-between text-[11px] text-zinc-400 uppercase font-semibold">
                <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-amber-400" /> Service Book ID</span>
                {isAdmin && (copiedKey === 'bookNo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500 group-hover:text-amber-400" />)}
              </div>
              <div className="text-sm font-mono font-bold text-white mt-1">{vehicle.bookNo}</div>
              <span className="text-[10px] text-zinc-400">Official DPMC Warranty Log</span>
            </div>

            {/* Chassis / VIN Number */}
            <div
              onClick={() => handleCopy('chassisNo', vehicle.chassisNo)}
              className="p-3 rounded-xl bg-[#191d27] border border-[#2c3444] flex flex-col justify-between group hover:border-amber-500/40 transition-colors cursor-pointer sm:col-span-2"
              title={isAdmin ? 'Click to copy Chassis Number' : ''}
            >
              <div className="flex items-center justify-between text-[11px] text-zinc-400 uppercase font-semibold">
                <span className="flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5 text-amber-400" /> Chassis / Frame VIN Number</span>
                {isAdmin && (copiedKey === 'chassisNo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500 group-hover:text-amber-400" />)}
              </div>
              <div className="text-sm font-mono font-black text-white tracking-widest mt-1">{vehicle.chassisNo}</div>
              <span className="text-[10px] text-zinc-400">17-character ISO-compliant Vehicle Identification Number</span>
            </div>

            {/* Engine Number */}
            <div
              onClick={() => handleCopy('engineNo', vehicle.engineNo)}
              className="p-3 rounded-xl bg-[#191d27] border border-[#2c3444] flex flex-col justify-between group hover:border-amber-500/40 transition-colors cursor-pointer sm:col-span-2"
              title={isAdmin ? 'Click to copy Engine Number' : ''}
            >
              <div className="flex items-center justify-between text-[11px] text-zinc-400 uppercase font-semibold">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Engine Block Serial Number</span>
                {isAdmin && (copiedKey === 'engineNo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500 group-hover:text-amber-400" />)}
              </div>
              <div className="text-sm font-mono font-black text-white tracking-widest mt-1">{vehicle.engineNo}</div>
              <span className="text-[10px] text-zinc-400">164.82cc DTS-i Twin Spark Factory Stamped</span>
            </div>
          </div>

          {/* Factory Spec Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="p-2.5 rounded-xl bg-[#161a24] border border-[#262c3a]">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">Model Code</span>
              <span className="text-xs font-bold text-white mt-0.5 block">{vehicle.model}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#161a24] border border-[#262c3a]">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">Trim & Colour</span>
              <span className="text-xs font-bold text-amber-400 mt-0.5 block">{vehicle.colour}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#161a24] border border-[#262c3a]">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">ABS System</span>
              <span className="text-xs font-bold text-red-400 mt-0.5 block">Dual-Channel ABS</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#161a24] border border-[#262c3a]">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">Engine Oil Spec</span>
              <span className="text-xs font-bold text-white mt-0.5 block font-mono">20W50 (1150 ml)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#161a24] border border-[#262c3a]">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">Recommended Fuel</span>
              <span className="text-xs font-bold text-white mt-0.5 block">Octane 95 Euro-4</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#161a24] border border-[#262c3a]">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">Tyre Pressures</span>
              <span className="text-xs font-bold text-white mt-0.5 block font-mono">F: 25 PSI / R: 28-32</span>
            </div>
          </div>
        </div>

        {/* CARD 2: OWNER DETAILS (Registration & Ownership) */}
        <div className="lg:col-span-5 bg-[#141720] rounded-2xl border border-[#272d3b] p-5 sm:p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222734]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    Owner Details
                  </h2>
                  <span className="text-[11px] text-zinc-400">Registered custodian & contact profile</span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
                Primary Owner
              </span>
            </div>

            {/* Owner Identity Profile Box */}
            <div className="p-4 rounded-xl bg-[#191d27] border border-[#2a3242] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-zinc-950 flex items-center justify-center font-bold text-lg shadow-md font-display">
                  {vehicle.owner.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-base font-bold text-white">{vehicle.owner}</div>
                  <span className="text-xs text-amber-400 font-mono">Authorized Registered Owner</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#252c3b] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Authority:</span>
                  <span className="text-zinc-200 font-medium">Dept. of Motor Traffic (Sri Lanka)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">District / Region:</span>
                  <span className="text-zinc-200 font-medium">Kurunegala, North Western Province</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">App Role Status:</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Full Administrative Access
                  </span>
                </div>
              </div>
            </div>

            {/* Legal & Ownership Compliance Stamp */}
            <div className="p-3.5 rounded-xl bg-[#161a22] border border-[#272d3b] flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                This digital identification booklet corresponds to Bajaj Pulsar N160 bearing registration <strong>{vehicle.regNo}</strong>. Maintained in compliance with David Pieris Motor Company warranty guidelines.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#222734]">
            <button
              type="button"
              onClick={onOpenPrintBooklet}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-lg cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Vehicle & Owner Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
