import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Shield,
  Calendar,
  AlertTriangle,
  Clock,
  Wrench,
  CheckCircle2,
  MapPin,
  PlusCircle,
  TrendingUp,
  Fuel,
  Sparkles,
  Zap,
  Gauge,
  BookOpen,
  StickyNote,
  Award,
  ChevronRight,
  Camera,
  Upload,
  Maximize2,
  X,
  RotateCcw,
  Image as ImageIcon,
  Check,
  Edit2,
  Crown,
  MessageCircle,
  Send,
  Phone,
} from 'lucide-react';
import { AppState, VehicleDetails } from '../types';
import { fmtKm } from '../utils/formatters';

interface HomeTabProps {
  state: AppState;
  isAdmin: boolean;
  onUpdateVehicle?: (updated: VehicleDetails) => void;
  onNavigateToTab: (tab: 'home' | 'vehicle' | 'service' | 'notes' | 'dealers' | 'owner') => void;
  onOpenScheduleGuide: () => void;
  onOpenPrint: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  state,
  isAdmin,
  onUpdateVehicle,
  onNavigateToTab,
  onOpenScheduleGuide,
  onOpenPrint,
}) => {
  const currentTarget = state.targets[0] || 7688;
  const remainingKm = currentTarget - state.odometer;
  const isOverdue = remainingKm <= 0;
  const isDueSoon = remainingKm > 0 && remainingKm <= 500;

  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default bike asset
  const defaultBikeSvg = '/pulsar_n160.svg';
  const currentBikePhoto = state.vehicle.photoUrl || defaultBikeSvg;
  const isCustomPhoto = Boolean(state.vehicle.photoUrl);

  // Compress & convert uploaded image to high-quality data URL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Resize canvas to max 1280px for performance & instant cloud sync
        const maxDimension = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

          if (onUpdateVehicle) {
            onUpdateVehicle({
              ...state.vehicle,
              photoUrl: compressedDataUrl,
            });
          }
          setIsUploading(false);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3000);
        } else {
          setIsUploading(false);
        }
      };
      img.onerror = () => {
        setIsUploading(false);
        alert('Could not process this image file.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isAdmin) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isAdmin) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleResetPhoto = () => {
    if (!isAdmin) return;
    if (confirm('Reset bike photo to official factory render?')) {
      if (onUpdateVehicle) {
        onUpdateVehicle({
          ...state.vehicle,
          photoUrl: undefined,
        });
      }
    }
  };

  // Calculate percentage to next service
  const previousServiceKm = state.services[0]?.km || 0;
  const totalInterval = Math.max(currentTarget - previousServiceKm, 1000);
  const progressKm = Math.max(state.odometer - previousServiceKm, 0);
  const progressPercent = Math.min(Math.round((progressKm / totalInterval) * 100), 100);

  // Next recommended service tasks based on mileage
  const getUpcomingTasks = () => {
    if (currentTarget <= 1000) {
      return [
        { task: 'Engine Oil Replacement (Bajaj DTS-i 20W50 1150ml)', mandatory: true },
        { task: 'Engine Oil Filter Cartridge & O-Ring Change', mandatory: true },
        { task: 'Oil Strainer Cleaning & Magnetic Plug De-swarf', mandatory: true },
        { task: 'Drive Chain Slack (20-30mm) & Lubrication', mandatory: true },
        { task: 'Valve Tappet Clearance Check', mandatory: false },
        { task: 'All Fasteners & Wheel Axle Torque Check', mandatory: true },
      ];
    } else if (currentTarget <= 5000) {
      return [
        { task: 'Engine Oil Top-up / Replacement', mandatory: true },
        { task: 'Spark Plug Gap & Cleaning (Champion / BOSCH)', mandatory: true },
        { task: 'Air Cleaner Element Cleaning', mandatory: true },
        { task: 'Front & Rear Brake Pad Wear Inspection', mandatory: true },
        { task: 'Drive Chain Clean & Lube (Motul C2/C4)', mandatory: true },
        { task: 'Battery Voltage & Terminal Greasing', mandatory: false },
      ];
    } else {
      return [
        { task: 'Full Engine Oil Drain & Refill (20W50 Semi-Synthetic)', mandatory: true },
        { task: 'OEM Oil Filter & Gasket Replacement', mandatory: true },
        { task: 'Dual-Channel ABS Brake Fluid & Pad Check', mandatory: true },
        { task: 'Air Filter Inspection / Replacement', mandatory: true },
        { task: 'Clutch Free Play & Throttle Cable Adjustment', mandatory: true },
        { task: 'Drive Chain Tension & Sprocket Wear Check', mandatory: true },
      ];
    }
  };

  const upcomingTasks = getUpcomingTasks();

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Bike Photo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 1. HERO SHOWCASE: ABOUT THE BIKE WITH PHOTO VIEWER */}
      <section className="bg-gradient-to-br from-[#0d1117] via-[#101520] to-[#07090e] rounded-2xl border border-[#1a2333] p-5 sm:p-7 shadow-2xl relative overflow-hidden group">
        {/* Vibrant rainbow decorative ambient glows */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-gradient-to-tr from-rose-500/10 via-amber-500/10 via-cyan-400/15 to-purple-600/15 rounded-full blur-3xl pointer-events-none animate-rainbow" />
        <div className="absolute -bottom-16 left-1/4 w-72 h-72 bg-gradient-to-tr from-cyan-400/10 via-emerald-400/10 to-rose-500/10 rounded-full blur-3xl pointer-events-none animate-rainbow" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Bike Image & Visual Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative w-full max-w-md aspect-[4/3] rounded-2xl bg-gradient-to-b from-[#0a0d14] to-[#05070a] border transition-all duration-300 p-2 flex items-center justify-center shadow-2xl shadow-black/90 overflow-hidden group ${
                isDragging ? 'border-cyan-400 ring-4 ring-cyan-500/20 scale-[1.02]' : 'border-cyan-500/30 hover:border-purple-400/50'
              }`}
            >
              {/* Bike Image View */}
              <img
                src={currentBikePhoto}
                alt="Bajaj Pulsar N160 Brooklyn Black"
                referrerPolicy="no-referrer"
                className={`w-full h-full rounded-xl transition-transform duration-500 ${
                  isCustomPhoto ? 'object-cover' : 'object-contain p-1'
                } group-hover:scale-105`}
              />

              {/* Overlay vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none rounded-xl" />

              {/* Badges on Image */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 shadow-md">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {state.vehicle.colour || 'BROOKLYN BLACK'}
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsFullscreenModalOpen(true)}
                  className="p-1.5 rounded-lg bg-black/80 hover:bg-black/95 text-zinc-300 hover:text-white border border-zinc-700/60 shadow-md backdrop-blur-md transition-all cursor-pointer active:scale-95"
                  title="View Full Size Photo"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white text-[10px] font-bold tracking-wider font-mono shadow-md border border-rose-500/50">
                  DUAL ABS
                </div>
              </div>

              {/* Drag over indicator */}
              {isDragging && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-cyan-400 z-30 animate-pulse">
                  <Upload className="w-8 h-8 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider">Drop Photo Here</p>
                </div>
              )}

              {/* Bottom plate overlay on image */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-[#1a2333] text-xs shadow-md">
                <span className="font-mono text-zinc-400 text-[10px]">Registration Plate</span>
                <strong className="text-white font-mono text-xs tracking-wider">{state.vehicle.regNo}</strong>
              </div>
            </div>

            {/* Compact controls under photo */}
            <div className="flex items-center justify-between w-full max-w-md mt-2.5 px-1 text-xs">
              <div className="flex items-center gap-1.5">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 active:scale-95 text-cyan-300 border border-cyan-400/40 text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
                    title="Upload or Change Bike Photo"
                  >
                    <Camera className="w-3 h-3 text-cyan-400" />
                    <span>{isUploading ? 'Saving...' : isCustomPhoto ? 'Change Photo' : 'Add Photo'}</span>
                  </button>
                )}

                {isCustomPhoto && isAdmin && (
                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 text-[11px] transition-all cursor-pointer"
                    title="Reset to Stock Factory Render"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <span className="text-[10px] text-zinc-500 font-mono">
                {isCustomPhoto ? 'Custom photo active' : 'Official render'}
              </span>
            </div>

            {/* Upload status banner */}
            {uploadSuccess && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-full max-w-md animate-fadeIn">
                <Check className="w-3.5 h-3.5" />
                <span>Bike photo updated and synced!</span>
              </div>
            )}

            {/* Quick action buttons under image */}
            <div className="flex items-center gap-2 mt-4 w-full max-w-md">
              <button
                type="button"
                onClick={() => onNavigateToTab('vehicle')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#131924] hover:bg-[#1a2333] border border-cyan-500/30 hover:border-cyan-400 text-xs font-semibold text-zinc-200 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span>View Full Specs</span>
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab('vehicle')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-semibold text-cyan-300 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Edit bike specifications and registration details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenPrint}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#131924] hover:bg-[#1a2333] border border-[#233044] text-xs font-semibold text-zinc-300 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Right Column: About the Machine & Technical Highlights with Rainbow Spectrum */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-300 font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border border-cyan-400/30 shadow-sm">
                  Official Vehicle Profile
                </span>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Digital Record
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-display font-black text-white tracking-wide uppercase">
                BAJAJ PULSAR <span className="rainbow-text">N160</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
                Precision motorcycle engineered with a high-torque 164.82cc oil-cooled DTS-i engine, twin-spark ignition, underbelly exhaust, and best-in-class {state.vehicle.absSystem || 'dual-channel ABS'} braking system.
              </p>
            </div>

            {/* Rainbow Spectrum Spec Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {/* 1. Max Power - Rose / Pink */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#141018] to-[#101520] border border-rose-500/35 shadow-sm hover:border-rose-400 transition-colors">
                <div className="text-[10px] text-rose-300 uppercase font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-rose-400" /> Max Power
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">16 PS @ 8750 RPM</div>
              </div>

              {/* 2. Max Torque - Amber / Orange */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#17130d] to-[#101520] border border-amber-500/35 shadow-sm hover:border-amber-400 transition-colors">
                <div className="text-[10px] text-amber-300 uppercase font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-400" /> Max Torque
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">14.65 Nm @ 6750</div>
              </div>

              {/* 3. Displacement - Emerald / Green */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#0d1713] to-[#101520] border border-emerald-500/35 shadow-sm hover:border-emerald-400 transition-colors">
                <div className="text-[10px] text-emerald-300 uppercase font-semibold flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-emerald-400" /> Displacement
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">164.82 cc DTS-i</div>
              </div>

              {/* 4. Fuel & Tank - Cyan / Sky */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#0d1620] to-[#101520] border border-cyan-500/35 shadow-sm hover:border-cyan-400 transition-colors">
                <div className="text-[10px] text-cyan-300 uppercase font-semibold flex items-center gap-1">
                  <Fuel className="w-3 h-3 text-cyan-400" /> Fuel & Tank
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">{state.vehicle.fuelType || '14 L (95 Oct)'}</div>
              </div>

              {/* 5. Brakes - Blue / Indigo */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#0f1422] to-[#101520] border border-blue-500/35 shadow-sm hover:border-blue-400 transition-colors">
                <div className="text-[10px] text-blue-300 uppercase font-semibold flex items-center gap-1">
                  <Award className="w-3 h-3 text-blue-400" /> Brakes
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">{state.vehicle.absSystem || 'Dual Disc + ABS'}</div>
              </div>

              {/* 6. Oil Spec - Purple / Violet */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#150f22] to-[#101520] border border-purple-500/35 shadow-sm hover:border-purple-400 transition-colors">
                <div className="text-[10px] text-purple-300 uppercase font-semibold flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-purple-400" /> Oil Spec
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">{state.vehicle.oilSpec || '20W50 (1150 ml)'}</div>
              </div>
            </div>

            {/* Quick Owner & Reg Strip */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#0a0d14] via-[#0e121a] to-[#0a0d14] border border-cyan-500/20 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-medium">Registered Owner</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-semibold text-zinc-200">{state.vehicle.owner}</span>
                  {(state.vehicle.owner?.toLowerCase().includes('sachintha') || state.vehicle.owner?.toLowerCase().includes('sachi') || state.vehicle.regNo === 'BKT-1374') && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-zinc-950 border border-yellow-200 shadow-sm uppercase tracking-wider">
                      <Crown className="w-2.5 h-2.5 text-zinc-950 fill-zinc-950" />
                      PREMIUM
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block uppercase font-medium">Service Book ID</span>
                <span className="font-mono font-bold text-cyan-300">{state.vehicle.bookNo}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DASHBOARD CATEGORY HUB & MODULE SELECTORS */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              Dashboard Categories & Portals
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Tap to Jump to Module</span>
        </div>

        {/* 6 Distinct Category Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Category 1: Vehicle Details - Golden Amber */}
          <button
            type="button"
            onClick={() => onNavigateToTab('vehicle')}
            className="flex flex-col items-start justify-between p-3.5 rounded-2xl bg-gradient-to-br from-[#181207] to-[#0f0b04] border border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer text-left group active:scale-95"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                {state.vehicle.regNo}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition-colors">
                Vehicle ID & Reg
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Chassis, engine & specs
              </span>
            </div>
          </button>

          {/* Category 2: Service History - Emerald Green */}
          <button
            type="button"
            onClick={() => onNavigateToTab('service')}
            className="flex flex-col items-start justify-between p-3.5 rounded-2xl bg-gradient-to-br from-[#071710] to-[#040e0a] border border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all cursor-pointer text-left group active:scale-95"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                {state.services.length} Records
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-emerald-300 transition-colors">
                Service Records
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Distance & oil logs
              </span>
            </div>
          </button>

          {/* Category 3: Maintenance Notes - Royal Purple */}
          <button
            type="button"
            onClick={() => onNavigateToTab('notes')}
            className="flex flex-col items-start justify-between p-3.5 rounded-2xl bg-gradient-to-br from-[#14081c] to-[#0c0512] border border-purple-500/40 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all cursor-pointer text-left group active:scale-95"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <StickyNote className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 font-bold border border-purple-500/30">
                {state.notes.length} Notes
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-purple-300 transition-colors">
                Maintenance Notes
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Garage remarks & chain
              </span>
            </div>
          </button>

          {/* Category 4: Bajaj Dealers - Electric Rose */}
          <button
            type="button"
            onClick={() => onNavigateToTab('dealers')}
            className="flex flex-col items-start justify-between p-3.5 rounded-2xl bg-gradient-to-br from-[#1a0711] to-[#10040a] border border-rose-500/40 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.25)] transition-all cursor-pointer text-left group active:scale-95"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-rose-400 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30">
                DPMC Map
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-rose-300 transition-colors">
                Bajaj Dealers
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Authorized workshops
              </span>
            </div>
          </button>

          {/* Category 5: Schedule Guide - Electric Cyan */}
          <button
            type="button"
            onClick={onOpenScheduleGuide}
            className="flex flex-col items-start justify-between p-3.5 rounded-2xl bg-gradient-to-br from-[#09111c] to-[#040910] border border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all cursor-pointer text-left group active:scale-95"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-all">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30">
                OEM Specs
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-cyan-300 transition-colors">
                Schedule Guide
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Factory service steps
              </span>
            </div>
          </button>

          {/* Category 6: App Owner & Support - Glowing Emerald & Cyan */}
          <button
            type="button"
            onClick={() => onNavigateToTab('owner')}
            className="flex flex-col items-start justify-between p-3.5 rounded-2xl bg-gradient-to-br from-[#061710] via-[#04110b] to-[#020b07] border border-emerald-400/50 hover:border-emerald-300 hover:shadow-[0_0_22px_rgba(16,185,129,0.35)] transition-all cursor-pointer text-left group active:scale-95 col-span-2 sm:col-span-1 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-emerald-500/30 group-hover:scale-110 transition-all">
                <MessageCircle className="w-4 h-4 fill-zinc-950" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                Owner Direct
              </span>
            </div>
            <div>
              <span className="text-xs font-black text-white block group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                App Owner
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              </span>
              <span className="text-[10px] text-emerald-400/80 block mt-0.5 font-mono">
                WA: +94 763961123
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* 3. UPCOMING SERVICE STATUS & COUNTDOWN */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Upcoming Service Alert & Live Gauge Card */}
        <div className="lg:col-span-7 bg-[#0d1117] rounded-2xl border border-[#1a2333] p-5 sm:p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          {/* Ambient rainbow background halo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/10 via-purple-500/10 to-rose-500/10 rounded-full blur-3xl pointer-events-none animate-rainbow" />
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500/20 via-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-sm">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    Upcoming Service Status
                  </h2>
                  <span className="text-[11px] text-zinc-400">
                    Next scheduled maintenance target
                  </span>
                </div>
              </div>

              {isOverdue ? (
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 animate-pulse shadow-sm">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Service Overdue
                </span>
              ) : isDueSoon ? (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-3.5 h-3.5" />
                  Service Due Soon
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Within Safe Interval
                </span>
              )}
            </div>

            {/* Mileage Status Metric Box with Rainbow Spectrum Borders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#101520] border border-[#1a2333] mb-4 shadow-inner relative z-10">
              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-cyan-500/25">
                <span className="text-[10px] text-cyan-300 uppercase font-semibold tracking-wider">Current Odometer</span>
                <div className="text-xl sm:text-2xl font-mono font-black text-white mt-0.5">
                  {state.odometer.toLocaleString()} <span className="text-xs font-normal text-zinc-400">km</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-purple-500/25">
                <span className="text-[10px] text-purple-300 uppercase font-semibold tracking-wider">Target Service Km</span>
                <div className="text-xl sm:text-2xl font-mono font-black text-cyan-300 mt-0.5">
                  {currentTarget.toLocaleString()} <span className="text-xs font-normal text-zinc-400">km</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0d1117] border border-emerald-500/25">
                <span className="text-[10px] text-emerald-300 uppercase font-semibold tracking-wider">
                  {isOverdue ? 'Overdue By' : 'Distance Remaining'}
                </span>
                <div className={`text-xl sm:text-2xl font-mono font-black mt-0.5 ${isOverdue ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isOverdue ? `+${Math.abs(remainingKm).toLocaleString()}` : remainingKm.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-zinc-400">km</span>
                </div>
              </div>
            </div>

            {/* Service Interval Progress Bar with Rainbow Gradient */}
            <div className="space-y-1.5 mb-5 relative z-10">
              <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>Interval Elapsed</span>
                <span className="rainbow-text font-black">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#07090e] p-0.5 border border-[#1a2333] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isOverdue
                      ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-sm shadow-red-500/50'
                      : isDueSoon
                      ? 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 shadow-sm shadow-amber-500/50'
                      : 'bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 via-cyan-400 to-purple-600 animate-rainbow shadow-[0_0_12px_rgba(0,229,255,0.5)]'
                  }`}
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons with Rainbow Highlights */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#1a2333] relative z-10">
            <button
              type="button"
              onClick={() => onNavigateToTab('service')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 via-emerald-500 via-cyan-500 to-violet-600 animate-rainbow-fast hover:opacity-95 active:scale-95 text-white font-bold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer border border-white/30 uppercase font-display"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Log Service Record</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('dealers')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#101520] hover:bg-[#161e2e] active:scale-95 text-cyan-300 border border-cyan-500/30 font-semibold text-xs transition-all cursor-pointer shadow-sm"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Find Nearest Dealer</span>
            </button>
          </div>
        </div>

        {/* Right: Upcoming Service Checklist Guide */}
        <div className="lg:col-span-5 bg-[#0d1117] rounded-2xl border border-[#1a2333] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 via-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-sm">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Factory Service Checklist
                  </h3>
                  <span className="text-[10px] text-zinc-400">
                    Recommended for target {currentTarget.toLocaleString()} km
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenScheduleGuide}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
              >
                Full Guide
              </button>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 mt-3">
              {upcomingTasks.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#101520] border border-[#1a2333] transition-colors hover:border-cyan-500/40"
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      item.mandatory ? 'text-cyan-400' : 'text-zinc-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-200 leading-snug">{item.task}</p>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {item.mandatory ? '● Mandatory OEM Step' : '○ Inspection'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1a2333] flex items-center justify-between text-xs text-zinc-400">
            <span>David Pieris Motor Company Recommended</span>
            <button
              type="button"
              onClick={() => onNavigateToTab('notes')}
              className="text-cyan-400 hover:underline font-medium text-xs cursor-pointer transition-colors"
            >
              View Garage Notes →
            </button>
          </div>
        </div>
      </section>

      {/* 3. RECENT ACTIVITY QUICK SUMMARY with Rainbow Accents */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Last Recorded Service */}
        <div className="p-4 rounded-2xl bg-[#0d1117] border border-cyan-500/30 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-cyan-400 transition-colors">
          <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400 animate-rainbow" />
          <div>
            <span className="text-[10px] uppercase font-semibold text-emerald-400 block tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_#34d399]" />
              Last Completed Service
            </span>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm font-bold text-white">
                {state.services[0]?.label || 'No previous service logged'}
              </span>
              {state.services[0] && (
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-yellow-400/15 text-yellow-300 border border-yellow-400/40 font-bold">
                  {fmtKm(state.services[0].km)}
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">
              {state.services[0] ? `${state.services[0].date} · ${state.services[0].dealer}` : 'Fresh factory delivery record'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('service')}
            className="px-3.5 py-1.5 rounded-xl bg-[#101520] hover:bg-[#161e2e] active:scale-95 text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shadow-sm"
          >
            History →
          </button>
        </div>

        {/* Latest Maintenance / Garage Remark */}
        <div className="p-4 rounded-2xl bg-[#0d1117] border border-purple-500/30 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-purple-400 transition-colors">
          <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500 animate-rainbow" />
          <div>
            <span className="text-[10px] uppercase font-semibold text-purple-300 block tracking-wider">
              Latest Garage Remark
            </span>
            <div className="text-sm font-bold text-white mt-0.5 truncate max-w-xs sm:max-w-sm">
              {state.notes[0]?.text || 'No remarks recorded'}
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">
              {state.notes[0] ? `${state.notes[0].date} · ${state.notes[0].km ? `${state.notes[0].km} km` : 'General'}` : 'Add quick notes in Maintenance tab'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('notes')}
            className="px-3.5 py-1.5 rounded-xl bg-[#101520] hover:bg-[#161e2e] active:scale-95 text-xs font-semibold text-purple-300 border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer shadow-sm"
          >
            Notes →
          </button>
        </div>
      </section>

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#0d1117] border border-[#1a2333] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a2333] bg-[#101520]">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Bajaj Pulsar N160 · {state.vehicle.regNo}
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    {state.vehicle.colour} · {state.vehicle.owner}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00e5ff] via-[#00a2ff] to-[#0066ff] hover:from-[#33ecff] hover:to-[#1a75ff] text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsFullscreenModalOpen(false)}
                  className="p-1.5 rounded-xl bg-[#131924] hover:bg-[#1a2333] text-zinc-300 hover:text-white transition-colors cursor-pointer border border-[#233044]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 flex items-center justify-center bg-black/90 overflow-auto flex-1 min-h-[300px]">
              <img
                src={currentBikePhoto}
                alt="Bajaj Pulsar N160"
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Modal Footer Info */}
            <div className="px-5 py-3 border-t border-[#1a2333] bg-[#0a0d14] flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-3">
                <span>Chassis: <strong className="text-white font-mono">{state.vehicle.chassisNo}</strong></span>
                <span>Engine: <strong className="text-white font-mono">{state.vehicle.engineNo}</strong></span>
              </div>
              <span className="font-mono text-cyan-400">
                Odometer: {state.odometer.toLocaleString()} km
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
