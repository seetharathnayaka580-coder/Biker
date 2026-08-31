import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Shield,
  Bike,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Check,
  Sparkles,
  AlertCircle,
  KeyRound,
  FileBadge,
  Crown,
  BadgeCheck,
} from 'lucide-react';
import { AuthSession, UserAccount, VehicleDetails } from '../types';
import { updateUserAccount, getLocalAccounts } from '../lib/firebase';
import { ALL_DISTRICTS, ALL_PROVINCES, SRI_LANKA_REGIONS } from '../data/sriLankaRegions';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  authSession: AuthSession;
  vehicle: VehicleDetails;
  onUpdateVehicle: (updated: VehicleDetails) => void;
  onUpdateAuthSession: (updated: AuthSession) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  authSession,
  vehicle,
  onUpdateVehicle,
  onUpdateAuthSession,
}) => {
  const [ownerName, setOwnerName] = useState(vehicle.owner || authSession.username || '');
  const [bikeNumber, setBikeNumber] = useState(vehicle.regNo || authSession.bikeNumber || '');
  const [province, setProvince] = useState(vehicle.province || authSession.province || 'Western Province');
  const [district, setDistrict] = useState(vehicle.district || authSession.district || 'Colombo');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isSachi =
    authSession.username?.toLowerCase().includes('sachi') ||
    authSession.username?.toLowerCase().includes('pathum') ||
    authSession.bikeId === 'BKT-1374' ||
    vehicle.owner?.toLowerCase().includes('sachintha') ||
    vehicle.regNo === 'BKT-1374';

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOwnerName(vehicle.owner || authSession.username || '');
      setBikeNumber(vehicle.regNo || authSession.bikeNumber || '');
      setProvince(vehicle.province || authSession.province || 'Western Province');
      setDistrict(vehicle.district || authSession.district || 'Colombo');
      setPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, vehicle, authSession]);

  // Update district options based on selected province
  const currentDistricts = React.useMemo(() => {
    const region = SRI_LANKA_REGIONS.find((r) => r.province === province);
    return region ? region.districts : ALL_DISTRICTS;
  }, [province]);

  const handleProvinceChange = (newProv: string) => {
    setProvince(newProv);
    const region = SRI_LANKA_REGIONS.find((r) => r.province === newProv);
    if (region && region.districts.length > 0 && !region.districts.includes(district)) {
      setDistrict(region.districts[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!ownerName.trim()) {
      setErrorMsg('Owner Name is required.');
      return;
    }
    if (!bikeNumber.trim()) {
      setErrorMsg('Bike Number / Plate is required.');
      return;
    }

    setIsSaving(true);
    try {
      const bikeId = authSession.bikeId || 'BKT-1374';
      const username = authSession.username || 'admin';

      await updateUserAccount(username, bikeId, {
        ownerName: ownerName.trim(),
        bikeNumber: bikeNumber.trim().toUpperCase(),
        district: district.trim(),
        province: province.trim(),
        ...(password.trim() ? { password: password.trim() } : {}),
      });

      // Update parent vehicle
      const updatedVehicle: VehicleDetails = {
        ...vehicle,
        owner: ownerName.trim(),
        regNo: bikeNumber.trim().toUpperCase(),
        district: district.trim(),
        province: province.trim(),
      };
      onUpdateVehicle(updatedVehicle);

      // Update auth session
      const updatedSession: AuthSession = {
        ...authSession,
        username: ownerName.trim(),
        bikeNumber: bikeNumber.trim().toUpperCase(),
        district: district.trim(),
        province: province.trim(),
      };
      onUpdateAuthSession(updatedSession);

      setSuccessMsg('User profile & bike details updated successfully!');
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMsg(err.message || 'Failed to update profile.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-[#11141c] border border-[#262f40] rounded-2xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh] text-[#eef1f4]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#202736]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Edit User Details & Profile
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {authSession.role}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Manage account information, bike ID, and location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1a202c] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alerts */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Creator / Master Admin Premium Banner */}
        {isSachi && (
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/35 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                <Crown className="w-4 h-4 text-amber-300 fill-amber-400/25" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-200">Web Page Creator</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-zinc-950 border border-yellow-200 uppercase tracking-widest shadow-sm">
                    PREMIUM
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">Master Administrator · Full Access Privileges</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
              <BadgeCheck className="w-3 h-3 text-emerald-400" />
              Verified
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Owner Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Owner / Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Kasun Sandaruwan"
                className="w-full bg-[#181e2b] border border-[#28354a] focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all"
                required
              />
              <User className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Bike Number / Plate */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Bike Number / Plate Number *
            </label>
            <div className="relative">
              <input
                type="text"
                value={bikeNumber}
                onChange={(e) => setBikeNumber(e.target.value.toUpperCase())}
                placeholder="e.g. WP BGH-4592 or BKT-1374"
                className="w-full bg-[#181e2b] border border-[#28354a] focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono uppercase tracking-wider placeholder:text-zinc-600 outline-none transition-all"
                required
              />
              <Bike className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Province & District Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Province Select */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Province
              </label>
              <select
                value={province}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="w-full bg-[#181e2b] border border-[#28354a] focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
              >
                {ALL_PROVINCES.map((prov) => (
                  <option key={prov} value={prov} className="bg-[#141822] text-white">
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            {/* District Select */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#181e2b] border border-[#28354a] focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
              >
                {currentDistricts.map((dist) => (
                  <option key={dist} value={dist} className="bg-[#141822] text-white">
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Password Update */}
          <div className="pt-2 border-t border-[#202736]">
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Change Password</span>
              <span className="text-[10px] text-zinc-500 font-normal normal-case">Leave blank to keep current</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (optional)"
                className="w-full bg-[#181e2b] border border-[#28354a] focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-amber-300 transition-colors p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Account Meta Info */}
          <div className="p-3 rounded-xl bg-[#151923] border border-[#222a3a] space-y-1 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="font-mono text-[11px]">Active Bike ID:</span>
              <span className="font-mono text-[11px] text-amber-300 font-bold">{authSession.bikeId || 'BKT-1374'}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="font-mono text-[11px]">Signed In As:</span>
              <span className="font-mono text-[11px] text-zinc-200">{authSession.username}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#202736]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-[#1a202c] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update Profile Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
