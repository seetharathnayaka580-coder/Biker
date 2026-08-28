import React, { useState } from 'react';
import { Copy, Check, Edit2, Shield, Hash, KeyRound, Palette, User, BookOpen, Lock, ShieldAlert } from 'lucide-react';
import { VehicleDetails } from '../types';

interface VehicleDetailsStripProps {
  vehicle: VehicleDetails;
  isAdmin?: boolean;
  onUpdateVehicle: (updated: VehicleDetails) => void;
}

export const VehicleDetailsStrip: React.FC<VehicleDetailsStripProps> = ({
  vehicle,
  isAdmin = true,
  onUpdateVehicle,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<VehicleDetails>(vehicle);

  const handleCopy = (key: string, text: string) => {
    // If not admin (client mode), copying is strictly restricted
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

  const items = [
    { key: 'owner', label: 'Owner', value: vehicle.owner, icon: User },
    { key: 'model', label: 'Model', value: vehicle.model, icon: Shield },
    { key: 'colour', label: 'Colour', value: vehicle.colour, icon: Palette },
    { key: 'regNo', label: 'Reg No', value: vehicle.regNo, icon: Hash, isPrimary: true },
    { key: 'chassisNo', label: 'Chassis No.', value: vehicle.chassisNo, icon: KeyRound, isMono: true },
    { key: 'engineNo', label: 'Engine No.', value: vehicle.engineNo, icon: KeyRound, isMono: true },
    { key: 'bookNo', label: 'Service Book', value: vehicle.bookNo, icon: BookOpen, isMono: true },
  ];

  return (
    <div className={`mb-6 ${!isAdmin ? 'select-none' : ''}`} onContextMenu={(e) => { if (!isAdmin) e.preventDefault(); }}>
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          Vehicle Identification & Registration
          {!isAdmin && (
            <span className="inline-flex items-center gap-1 text-[10px] lowercase font-normal px-2 py-0.2 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
              <Lock className="w-2.5 h-2.5 text-amber-400" />
              read-only (copy disabled)
            </span>
          )}
        </span>

        {/* Edit button is only visible to Admin */}
        {isAdmin && (
          <button
            onClick={() => {
              setEditData(vehicle);
              setIsEditing(!isEditing);
            }}
            className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            {isEditing ? 'Cancel' : 'Edit info'}
          </button>
        )}
      </div>

      {isEditing && isAdmin ? (
        <form onSubmit={handleSaveEdit} className="p-4 rounded-xl bg-[#181b22] border border-[#2a2f3b] shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Owner Name</label>
              <input
                type="text"
                value={editData.owner}
                onChange={(e) => setEditData({ ...editData, owner: e.target.value })}
                className="w-full bg-[#212631] border border-[#333a49] rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Model</label>
              <input
                type="text"
                value={editData.model}
                onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                className="w-full bg-[#212631] border border-[#333a49] rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Colour</label>
              <input
                type="text"
                value={editData.colour}
                onChange={(e) => setEditData({ ...editData, colour: e.target.value })}
                className="w-full bg-[#212631] border border-[#333a49] rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Registration No</label>
              <input
                type="text"
                value={editData.regNo}
                onChange={(e) => setEditData({ ...editData, regNo: e.target.value })}
                className="w-full bg-[#212631] border border-[#333a49] rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Chassis Number</label>
              <input
                type="text"
                value={editData.chassisNo}
                onChange={(e) => setEditData({ ...editData, chassisNo: e.target.value })}
                className="w-full bg-[#212631] border border-[#333a49] rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Engine Number</label>
              <input
                type="text"
                value={editData.engineNo}
                onChange={(e) => setEditData({ ...editData, engineNo: e.target.value })}
                className="w-full bg-[#212631] border border-[#333a49] rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Service Book No.</label>
              <input
                type="text"
                value={editData.bookNo}
                onChange={(e) => setEditData({ ...editData, bookNo: e.target.value })}
                className="w-full bg-[#212631] border border-[#333a49] rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:bg-[#252b37] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer"
            >
              Save Details
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col md:flex-row gap-2.5 bg-[#12151b] p-2.5 rounded-2xl border border-[#262b35] shadow-lg">
          {/* N160 Photo Showcase Badge */}
          <div className="flex items-center gap-3 p-2 bg-[#181c24] border border-[#2d3444] rounded-xl shrink-0 md:w-48">
            <div className="w-14 h-14 rounded-lg bg-black/50 border border-amber-500/30 p-1 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src="/pulsar_n160.svg"
                alt="Bajaj Pulsar N160"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-display font-black text-white tracking-wider">
                PULSAR <span className="text-amber-400">N160</span>
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                {vehicle.colour}
              </div>
              <div className="text-[9px] font-mono text-emerald-400">
                Dual-ABS Verified
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            {items.map((item) => (
              <div
                key={item.key}
                onClick={() => handleCopy(item.key, item.value)}
                className={`group relative bg-[#181c23] border border-[#262c37] rounded-xl p-2.5 sm:p-3 transition-all duration-200 flex flex-col justify-between ${
                  isAdmin
                    ? 'hover:bg-[#202530] hover:border-amber-500/40 cursor-pointer'
                    : 'cursor-default'
                }`}
                title={isAdmin ? 'Click to copy' : 'Official registration data (copy restricted)'}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1">
                    <item.icon className={`w-3 h-3 ${isAdmin ? 'text-zinc-400 group-hover:text-amber-400' : 'text-zinc-500'} transition-colors`} />
                    {item.label}
                  </span>
                  {isAdmin && (
                    <span className="text-zinc-500 group-hover:text-amber-400 transition-colors">
                      {copiedKey === item.key ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </span>
                  )}
                </div>
                <div
                  className={`text-xs font-semibold truncate ${
                    item.isPrimary
                      ? 'text-amber-300 font-mono font-bold'
                      : item.isMono
                      ? 'font-mono text-zinc-200 text-[11px]'
                      : 'text-zinc-200'
                  }`}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
