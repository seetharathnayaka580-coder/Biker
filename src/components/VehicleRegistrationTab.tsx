import React, { useState, useRef, useEffect } from 'react';
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
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Sliders,
  RotateCcw,
  Bike,
  Crown,
  BadgeCheck,
} from 'lucide-react';
import { VehicleDetails } from '../types';
import { ALL_DISTRICTS, ALL_PROVINCES, SRI_LANKA_REGIONS } from '../data/sriLankaRegions';

interface VehicleRegistrationTabProps {
  vehicle: VehicleDetails;
  isAdmin: boolean;
  onUpdateVehicle: (updated: VehicleDetails) => void;
  onOpenPrintBooklet: () => void;
  onClearAllData?: () => void;
  initialEditMode?: boolean;
}

export const VehicleRegistrationTab: React.FC<VehicleRegistrationTabProps> = ({
  vehicle,
  isAdmin,
  onUpdateVehicle,
  onOpenPrintBooklet,
  onClearAllData,
  initialEditMode = false,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [editData, setEditData] = useState<VehicleDetails>(vehicle);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editBikeFileInputRef = useRef<HTMLInputElement>(null);

  const isSachi =
    vehicle.owner?.toLowerCase().includes('sachintha') ||
    vehicle.owner?.toLowerCase().includes('sachi') ||
    vehicle.regNo === 'BKT-1374';

  // Sync editData if vehicle changes externally
  useEffect(() => {
    setEditData(vehicle);
  }, [vehicle]);

  const handleCopy = (key: string, text: string) => {
    if (!isAdmin) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const processOwnerPhoto = (file: File, isForEditForm = false) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compress & scale to max 800px for crisp avatar rendering & efficient Firestore storage
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

          if (isForEditForm) {
            setEditData((prev) => ({ ...prev, ownerPhotoUrl: compressedDataUrl }));
          } else {
            onUpdateVehicle({ ...vehicle, ownerPhotoUrl: compressedDataUrl });
          }

          setIsUploading(false);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 2500);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const processBikePhoto = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

          setEditData((prev) => ({ ...prev, photoUrl: compressedDataUrl }));
          setIsUploading(false);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 2500);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isForEditForm = false) => {
    if (e.target.files && e.target.files[0]) {
      processOwnerPhoto(e.target.files[0], isForEditForm);
    }
  };

  const handleBikeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processBikePhoto(e.target.files[0]);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent, isForEditForm = false) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (isForEditForm) {
      setEditData((prev) => ({ ...prev, ownerPhotoUrl: undefined }));
    } else {
      onUpdateVehicle({ ...vehicle, ownerPhotoUrl: undefined });
    }
  };

  const handleRemoveBikePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    setEditData((prev) => ({ ...prev, photoUrl: undefined }));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    onUpdateVehicle(editData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e, false)}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={editFileInputRef}
        onChange={(e) => handleFileChange(e, true)}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={editBikeFileInputRef}
        onChange={handleBikeFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#171a23] via-[#1a1f2b] to-[#14161f] border border-[#272d3b] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 p-1 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10 overflow-hidden">
            <img
              src={vehicle.photoUrl || '/pulsar_n160.svg'}
              alt={vehicle.model || 'Bajaj Pulsar N160'}
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

        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditData(vehicle);
                  setIsEditing(!isEditing);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md active:scale-95 ${
                  isEditing
                    ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Close Editor' : 'Edit Bike Details'}</span>
              </button>

              {onClearAllData && (
                <button
                  type="button"
                  onClick={onClearAllData}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  title="Clear all records & reset data for this bike"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Data</span>
                </button>
              )}
            </>
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

      {/* Save Success Toast */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Vehicle details updated successfully and synced to Cloud Firestore!</span>
        </div>
      )}

      {/* Comprehensive Admin Edit Form */}
      {isEditing && isAdmin && (
        <form onSubmit={handleSaveEdit} className="p-5 sm:p-6 rounded-2xl bg-[#161a22] border border-amber-500/40 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a3040]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Edit2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Edit Bike & Owner Information
                </h2>
                <p className="text-[11px] text-zinc-400">Update specifications, identification numbers, and owner profile</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
              Admin Access
            </span>
          </div>

          {/* Section 1: Photos Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Owner Photo */}
            <div className="p-3.5 rounded-xl bg-[#1d222e] border border-[#2d3648] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-2xl bg-[#131722] border-2 border-amber-500/40 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                  {editData.ownerPhotoUrl ? (
                    <img
                      src={editData.ownerPhotoUrl}
                      alt={editData.owner}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-amber-300 text-zinc-950 flex items-center justify-center font-bold text-lg font-display">
                      {(editData.owner || 'CH').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Owner Photo
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {editData.ownerPhotoUrl ? 'Custom photo set' : 'Initials avatar'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => editFileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{editData.ownerPhotoUrl ? 'Change' : 'Upload'}</span>
                </button>

                {editData.ownerPhotoUrl && (
                  <button
                    type="button"
                    onClick={(e) => handleRemovePhoto(e, true)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-xs transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Bike Photo */}
            <div className="p-3.5 rounded-xl bg-[#1d222e] border border-[#2d3648] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-2xl bg-[#131722] border-2 border-amber-500/40 overflow-hidden shrink-0 flex items-center justify-center shadow-md p-1">
                  <img
                    src={editData.photoUrl || '/pulsar_n160.svg'}
                    alt="Bike"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-amber-400" />
                    Bike Showcase Photo
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {editData.photoUrl ? 'Custom photo set' : 'Default stock render'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => editBikeFileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{editData.photoUrl ? 'Change' : 'Upload'}</span>
                </button>

                {editData.photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveBikePhoto}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-xs transition-colors cursor-pointer"
                    title="Reset to Stock Render"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Machine Identification Numbers */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              1. Machine Identification & Registration Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Registration Number (Plate) *
                </label>
                <input
                  type="text"
                  value={editData.regNo}
                  onChange={(e) => setEditData({ ...editData, regNo: e.target.value })}
                  placeholder="e.g. WP BXX-XXXX"
                  className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Vehicle Model Name *
                </label>
                <input
                  type="text"
                  value={editData.model}
                  onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                  placeholder="e.g. Bajaj Pulsar N160 Dual Channel ABS"
                  className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Trim & Body Colour *
                </label>
                <input
                  type="text"
                  value={editData.colour}
                  onChange={(e) => setEditData({ ...editData, colour: e.target.value })}
                  placeholder="e.g. Ebony Black / Brooklyn Black"
                  className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Chassis / VIN Number (17 digits) *
                </label>
                <input
                  type="text"
                  value={editData.chassisNo}
                  onChange={(e) => setEditData({ ...editData, chassisNo: e.target.value })}
                  placeholder="e.g. MD2B54DX-CHATHURA-01"
                  className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Engine Serial Number *
                </label>
                <input
                  type="text"
                  value={editData.engineNo}
                  onChange={(e) => setEditData({ ...editData, engineNo: e.target.value })}
                  placeholder="e.g. PDXCSH-CHATHURA-01"
                  className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Service Book ID Number *
                </label>
                <input
                  type="text"
                  value={editData.bookNo}
                  onChange={(e) => setEditData({ ...editData, bookNo: e.target.value })}
                  placeholder="e.g. POR0022026-CHATHURA"
                  className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Engineering Specs & Workshop Parameters */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              2. Engineering Specs & Workshop Parameters
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  ABS Braking System
                </label>
                <input
                  type="text"
                  value={editData.absSystem || 'Dual-Channel ABS'}
                  onChange={(e) => setEditData({ ...editData, absSystem: e.target.value })}
                  placeholder="e.g. Dual-Channel ABS"
                  className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Engine Oil Spec & Volume
                </label>
                <input
                  type="text"
                  value={editData.oilSpec || '20W50 (1150 ml)'}
                  onChange={(e) => setEditData({ ...editData, oilSpec: e.target.value })}
                  placeholder="e.g. 20W50 (1150 ml)"
                  className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Recommended Fuel
                </label>
                <input
                  type="text"
                  value={editData.fuelType || 'Octane 95 Euro-4'}
                  onChange={(e) => setEditData({ ...editData, fuelType: e.target.value })}
                  placeholder="e.g. Octane 95 Euro-4"
                  className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Tyre Pressures (F / R)
                </label>
                <input
                  type="text"
                  value={editData.tyrePressures || 'F: 25 PSI / R: 28-32'}
                  onChange={(e) => setEditData({ ...editData, tyrePressures: e.target.value })}
                  placeholder="e.g. F: 25 PSI / R: 28-32"
                  className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Owner & Registry Details */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              3. Owner & Official Registry Profile
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Owner Full Name *
                </label>
                <input
                  type="text"
                  value={editData.owner}
                  onChange={(e) => setEditData({ ...editData, owner: e.target.value })}
                  placeholder="e.g. Chathura"
                  className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Province
                </label>
                <select
                  value={editData.province || 'Western Province'}
                  onChange={(e) => {
                    const newProv = e.target.value;
                    const reg = SRI_LANKA_REGIONS.find((r) => r.province === newProv);
                    const newDist = reg && reg.districts.length > 0 ? reg.districts[0] : editData.district;
                    setEditData({ ...editData, province: newProv, district: newDist });
                  }}
                  className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  {ALL_PROVINCES.map((prov) => (
                    <option key={prov} value={prov} className="bg-[#141822] text-white">
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  District
                </label>
                <select
                  value={editData.district || 'Colombo'}
                  onChange={(e) => setEditData({ ...editData, district: e.target.value })}
                  className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  {(
                    SRI_LANKA_REGIONS.find((r) => r.province === (editData.province || 'Western Province'))?.districts ||
                    ALL_DISTRICTS
                  ).map((dist) => (
                    <option key={dist} value={dist} className="bg-[#141822] text-white">
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Registration Authority
                </label>
                <input
                  type="text"
                  value={editData.authority || 'Dept. of Motor Traffic (Sri Lanka)'}
                  onChange={(e) => setEditData({ ...editData, authority: e.target.value })}
                  placeholder="e.g. Dept. of Motor Traffic (Sri Lanka)"
                  className="w-full bg-[#202530] border border-[#333b4d] rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2a3040]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-[#202530] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save & Sync Bike Details</span>
            </button>
          </div>
        </form>
      )}

      {/* 2 Main Display Cards: Bike Details & Owner Details */}
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

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setEditData(vehicle);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Edit bike specifications"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Specs</span>
                </button>
              )}
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                Verified Specs
              </span>
            </div>
          </div>

          {/* Core Identification Numbers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Registration Number */}
            <div
              onClick={() => handleCopy('regNo', vehicle.regNo)}
              className="p-3.5 rounded-xl bg-[#191d27] border border-[#2c3444] flex flex-col justify-between group hover:border-amber-500/40 transition-colors cursor-pointer"
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
              className="p-3.5 rounded-xl bg-[#191d27] border border-[#2c3444] flex flex-col justify-between group hover:border-amber-500/40 transition-colors cursor-pointer"
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
              className="p-3.5 rounded-xl bg-[#191d27] border border-[#2c3444] flex flex-col justify-between group hover:border-amber-500/40 transition-colors cursor-pointer sm:col-span-2"
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
              className="p-3.5 rounded-xl bg-[#191d27] border border-[#2c3444] flex flex-col justify-between group hover:border-amber-500/40 transition-colors cursor-pointer sm:col-span-2"
              title={isAdmin ? 'Click to copy Engine Number' : ''}
            >
              <div className="flex items-center justify-between text-[11px] text-zinc-400 uppercase font-semibold">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Engine Block Serial Number</span>
                {isAdmin && (copiedKey === 'engineNo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500 group-hover:text-amber-400" />)}
              </div>
              <div className="text-sm font-mono font-black text-white tracking-widest mt-1">{vehicle.engineNo}</div>
              <span className="text-[10px] text-zinc-400">DTS-i Twin Spark Factory Stamped</span>
            </div>
          </div>

          {/* Dynamic Factory Spec Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="p-2.5 rounded-xl bg-[#161a24] border border-[#262c3a]">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">Model Code</span>
              <span className="text-xs font-bold text-white mt-0.5 block truncate" title={vehicle.model}>{vehicle.model}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#161a24] border border-[#262c3a]">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">Trim & Colour</span>
              <span className="text-xs font-bold text-amber-400 mt-0.5 block truncate" title={vehicle.colour}>{vehicle.colour}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#161a24] border border-[#262c3a]">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">ABS System</span>
              <span className="text-xs font-bold text-red-400 mt-0.5 block">{vehicle.absSystem || 'Dual-Channel ABS'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#161a24] border border-[#262c3a]">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">Engine Oil Spec</span>
              <span className="text-xs font-bold text-white mt-0.5 block font-mono">{vehicle.oilSpec || '20W50 (1150 ml)'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#161a24] border border-[#262c3a]">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">Recommended Fuel</span>
              <span className="text-xs font-bold text-white mt-0.5 block">{vehicle.fuelType || 'Octane 95 Euro-4'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#161a24] border border-[#262c3a]">
              <span className="text-[10px] text-zinc-400 uppercase block font-medium">Tyre Pressures</span>
              <span className="text-xs font-bold text-white mt-0.5 block font-mono">{vehicle.tyrePressures || 'F: 25 PSI / R: 28-32'}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: OWNER DETAILS (Registration & Ownership) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (isAdmin) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (isAdmin && e.dataTransfer.files && e.dataTransfer.files[0]) {
              processOwnerPhoto(e.dataTransfer.files[0], false);
            }
          }}
          className={`lg:col-span-5 bg-[#141720] rounded-2xl border transition-all duration-200 p-5 sm:p-6 shadow-xl space-y-5 flex flex-col justify-between ${
            isDragging ? 'border-amber-400 bg-amber-500/5' : 'border-[#272d3b]'
          }`}
        >
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

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditData(vehicle);
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Edit owner profile"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Profile</span>
                  </button>
                )}
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
                  Primary Owner
                </span>
              </div>
            </div>

            {/* Owner Identity Profile Box with Photo Upload */}
            <div className="p-4 rounded-xl bg-[#191d27] border border-[#2a3242] space-y-3 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  {/* Avatar / Photo with Camera Hover Trigger */}
                  <div
                    onClick={() => {
                      if (isAdmin) fileInputRef.current?.click();
                    }}
                    className={`relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 transition-all shadow-md group ${
                      isAdmin ? 'cursor-pointer hover:border-amber-400 hover:shadow-amber-500/20' : 'border-amber-500/30'
                    } ${vehicle.ownerPhotoUrl ? 'border-amber-500/40 bg-[#0e1118]' : 'border-amber-500/30'}`}
                    title={isAdmin ? 'Click to upload or change owner photo' : ''}
                  >
                    {vehicle.ownerPhotoUrl ? (
                      <img
                        src={vehicle.ownerPhotoUrl}
                        alt={vehicle.owner}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-amber-300 text-zinc-950 flex items-center justify-center font-bold text-lg font-display">
                        {(vehicle.owner || 'CH').slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    {/* Camera overlay on hover / active */}
                    {isAdmin && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-300">
                        <Camera className="w-4 h-4" />
                        <span className="text-[9px] font-bold mt-0.5">Change</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>{vehicle.owner}</span>
                      {isSachi && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-zinc-950 border border-yellow-200 shadow-[0_0_12px_rgba(251,191,36,0.5)] uppercase tracking-wider">
                          <Crown className="w-3 h-3 text-zinc-950 fill-zinc-950" />
                          PREMIUM
                        </span>
                      )}
                      {uploadSuccess && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-sans">
                          <Check className="w-3 h-3" /> Photo Saved
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
                      {isSachi ? 'Web Page Creator & Full Access Master Admin' : 'Authorized Registered Owner'}
                    </span>
                  </div>
                </div>

                {/* Photo Action Buttons for Admin */}
                {isAdmin && (
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{vehicle.ownerPhotoUrl ? 'Change' : 'Upload Photo'}</span>
                    </button>

                    {vehicle.ownerPhotoUrl && (
                      <button
                        type="button"
                        onClick={(e) => handleRemovePhoto(e, false)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Status details */}
              <div className="pt-2 border-t border-[#252c3b] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Authority:</span>
                  <span className="text-zinc-200 font-medium">{vehicle.authority || 'Dept. of Motor Traffic (Sri Lanka)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">District & Province:</span>
                  <span className="text-zinc-200 font-medium">
                    {vehicle.district ? `${vehicle.district}${vehicle.province ? `, ${vehicle.province}` : ''}` : (vehicle.province || 'Sri Lanka')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">App Role & Access Level:</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {isSachi ? 'Creator · Full Master Administrative Access' : 'Full Administrative Access'}
                  </span>
                </div>
              </div>
            </div>

            {/* Legal & Ownership Compliance Stamp */}
            <div className="p-3.5 rounded-xl bg-[#161a22] border border-[#272d3b] flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                This digital identification booklet corresponds to {vehicle.model || 'Bajaj Pulsar N160'} bearing registration <strong>{vehicle.regNo}</strong>. Maintained in compliance with David Pieris Motor Company warranty guidelines.
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
