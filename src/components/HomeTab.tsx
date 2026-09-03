import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Shield,
  User,
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
  onNavigateToTab: (tab: 'home' | 'vehicle' | 'service' | 'notes' | 'dealers') => void;
  onOpenScheduleGuide: () => void;
  onOpenPrint: () => void;
}

export type CardColorTheme = 'cyan' | 'amber' | 'emerald' | 'red' | 'purple';

export const CARD_THEMES: Record<CardColorTheme, {
  name: string;
  dotColor: string;
  badge: string;
  cardBorder: string;
  glowRgba: string;
  topLine: string;
  iconBg: string;
  iconBorder: string;
  iconText: string;
  accentText: string;
  buttonGradient: string;
  buttonShadow: string;
  buttonBorder: string;
  progressTrack: string;
  progressFill: string;
}> = {
  cyan: {
    name: 'Pulsar Cyan',
    dotColor: '#00e5ff',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40',
    cardBorder: 'border-cyan-500/35 hover:border-cyan-400/60',
    glowRgba: 'rgba(6, 182, 212, 0.16)',
    topLine: 'from-transparent via-cyan-400 to-transparent',
    iconBg: 'bg-gradient-to-br from-cyan-500/25 to-blue-600/10',
    iconBorder: 'border-cyan-400/50',
    iconText: 'text-cyan-300',
    accentText: 'text-cyan-400',
    buttonGradient: 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500',
    buttonShadow: 'shadow-[0_4px_22px_rgba(6,182,212,0.45)]',
    buttonBorder: 'border-cyan-300/50',
    progressTrack: 'border-cyan-900/40',
    progressFill: 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]',
  },
  amber: {
    name: 'Brooklyn Amber',
    dotColor: '#f59e0b',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-400/40',
    cardBorder: 'border-amber-500/35 hover:border-amber-400/60',
    glowRgba: 'rgba(245, 158, 11, 0.16)',
    topLine: 'from-transparent via-amber-400 to-transparent',
    iconBg: 'bg-gradient-to-br from-amber-500/25 to-yellow-600/10',
    iconBorder: 'border-amber-400/50',
    iconText: 'text-amber-300',
    accentText: 'text-amber-400',
    buttonGradient: 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500',
    buttonShadow: 'shadow-[0_4px_22px_rgba(245,158,11,0.45)]',
    buttonBorder: 'border-amber-300/50',
    progressTrack: 'border-amber-900/40',
    progressFill: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]',
  },
  emerald: {
    name: 'Neon Emerald',
    dotColor: '#10b981',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40',
    cardBorder: 'border-emerald-500/35 hover:border-emerald-400/60',
    glowRgba: 'rgba(16, 185, 129, 0.16)',
    topLine: 'from-transparent via-emerald-400 to-transparent',
    iconBg: 'bg-gradient-to-br from-emerald-500/25 to-teal-600/10',
    iconBorder: 'border-emerald-400/50',
    iconText: 'text-emerald-300',
    accentText: 'text-emerald-400',
    buttonGradient: 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 hover:from-emerald-400 hover:to-teal-500',
    buttonShadow: 'shadow-[0_4px_22px_rgba(16,185,129,0.45)]',
    buttonBorder: 'border-emerald-300/50',
    progressTrack: 'border-emerald-900/40',
    progressFill: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]',
  },
  red: {
    name: 'Racing Crimson',
    dotColor: '#ef4444',
    badge: 'bg-red-500/15 text-red-300 border-red-400/40',
    cardBorder: 'border-red-500/35 hover:border-red-400/60',
    glowRgba: 'rgba(239, 68, 68, 0.16)',
    topLine: 'from-transparent via-red-400 to-transparent',
    iconBg: 'bg-gradient-to-br from-red-500/25 to-rose-600/10',
    iconBorder: 'border-red-400/50',
    iconText: 'text-red-300',
    accentText: 'text-red-400',
    buttonGradient: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500',
    buttonShadow: 'shadow-[0_4px_22px_rgba(239,68,68,0.45)]',
    buttonBorder: 'border-red-300/50',
    progressTrack: 'border-red-900/40',
    progressFill: 'bg-gradient-to-r from-red-500 via-rose-400 to-orange-400 shadow-[0_0_12px_rgba(239,68,68,0.6)]',
  },
  purple: {
    name: 'Midnight Purple',
    dotColor: '#a855f7',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-400/40',
    cardBorder: 'border-purple-500/35 hover:border-purple-400/60',
    glowRgba: 'rgba(168, 85, 247, 0.16)',
    topLine: 'from-transparent via-purple-400 to-transparent',
    iconBg: 'bg-gradient-to-br from-purple-500/25 to-indigo-600/10',
    iconBorder: 'border-purple-400/50',
    iconText: 'text-purple-300',
    accentText: 'text-purple-400',
    buttonGradient: 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-violet-500',
    buttonShadow: 'shadow-[0_4px_22px_rgba(168,85,247,0.45)]',
    buttonBorder: 'border-purple-300/50',
    progressTrack: 'border-purple-900/40',
    progressFill: 'bg-gradient-to-r from-purple-500 via-pink-400 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]',
  },
};

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

  // Fixed card color theme (Pulsar Cyan cockpit styling)
  const activeTheme = CARD_THEMES.cyan;

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
      <section className="bg-gradient-to-br from-[#0c0f16] via-[#10141e] to-[#080b11] rounded-2xl border border-[#1e2536] p-5 sm:p-7 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Bike Image & Visual Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative w-full max-w-md aspect-[4/3] rounded-2xl bg-gradient-to-b from-[#0e121a] to-[#06080d] border-2 transition-all duration-300 p-2 flex items-center justify-center shadow-2xl shadow-black/90 overflow-hidden group ${
                isDragging ? 'border-amber-400 ring-4 ring-amber-500/20 scale-[1.02]' : 'border-[#6b4515]/70 hover:border-amber-500/80 shadow-[0_0_20px_rgba(180,83,9,0.15)]'
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/35 pointer-events-none rounded-xl" />

              {/* Badges on Image: Brooklyn Black Gold Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/90 backdrop-blur-md border border-amber-500/80 text-[11px] font-mono font-bold text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{state.vehicle.colour || 'Brooklyn Black'}</span>
              </div>

              {/* Top Right: Fullscreen Button & Dual ABS Solid Red Pill */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreenModalOpen(true)}
                  className="p-1.5 rounded-lg bg-black/85 hover:bg-black text-zinc-300 hover:text-white border border-zinc-700/80 shadow-md backdrop-blur-md transition-all cursor-pointer active:scale-95"
                  title="View Full Size Photo"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* DUAL ABS Solid Red Pill Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dc2626] text-white text-[11px] font-black tracking-wider font-mono shadow-[0_0_14px_rgba(220,38,38,0.6)] border border-red-400/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  DUAL ABS
                </div>
              </div>

              {/* Drag over indicator */}
              {isDragging && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-amber-400 z-30 animate-pulse">
                  <Upload className="w-8 h-8 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider">Drop Photo Here</p>
                </div>
              )}

              {/* Bottom plate overlay on image */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between px-3.5 py-2 rounded-lg bg-black/90 backdrop-blur-md border border-zinc-800/80 text-xs shadow-md">
                <span className="font-mono text-zinc-400 text-xs">Registration Plate</span>
                <strong className="text-white font-mono text-xs tracking-wider">{state.vehicle.regNo}</strong>
              </div>
            </div>

            {/* Compact controls under photo */}
            <div className="flex items-center justify-between w-full max-w-md mt-2.5 px-1 text-xs">
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/20 hover:bg-amber-950/40 active:scale-95 text-amber-400 border border-amber-600/70 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                    title="Upload or Change Bike Photo"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isUploading ? 'Saving...' : isCustomPhoto ? 'Change Photo' : 'Add Photo'}</span>
                  </button>
                )}

                {isCustomPhoto && isAdmin && (
                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900/70 hover:bg-zinc-800 active:scale-95 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 text-xs transition-all cursor-pointer"
                    title="Reset to Stock Factory Render"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <span className="text-xs text-zinc-500 font-mono">
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
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#121622] hover:bg-[#1a2130] border border-[#222a3d] text-xs font-semibold text-zinc-200 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span>View Full Specs</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab('vehicle')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/80 text-xs font-semibold text-amber-400 shadow-sm transition-all cursor-pointer active:scale-95"
                  title="Edit bike specifications and registration details"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Details</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenPrint}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-[#121622] hover:bg-[#1a2130] border border-[#222a3d] text-xs font-semibold text-zinc-300 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Right Column: About the Machine & Technical Highlights */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold px-3 py-1 rounded-lg bg-[#181206] border border-amber-600/80 shadow-sm leading-tight">
                  <div>OFFICIAL VEHICLE</div>
                  <div>PROFILE</div>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 leading-tight">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div>Verified Digital</div>
                    <div>Record</div>
                  </div>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-display font-black text-white tracking-wide uppercase mt-1">
                {state.vehicle.model?.toUpperCase() || 'PULSAR N160 USD DC ABS'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 leading-relaxed">
                Precision motorcycle engineered with a high-torque 164.82cc oil-cooled DTS-i engine, twin-spark ignition, underbelly exhaust, and best-in-class Dual-Channel ABS braking system.
              </p>
            </div>

            {/* Spec Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {/* 1. Max Power */}
              <div className="p-3 rounded-xl bg-[#10141e] border border-[#1e2536] shadow-sm hover:border-zinc-600 transition-colors">
                <div className="text-[10px] text-amber-400 uppercase font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> MAX POWER
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">16 PS @ 8750 RPM</div>
              </div>

              {/* 2. Max Torque */}
              <div className="p-3 rounded-xl bg-[#10141e] border border-[#1e2536] shadow-sm hover:border-zinc-600 transition-colors">
                <div className="text-[10px] text-amber-400 uppercase font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-400" /> MAX TORQUE
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">14.65 Nm @ 6750</div>
              </div>

              {/* 3. Displacement */}
              <div className="p-3 rounded-xl bg-[#10141e] border border-[#1e2536] shadow-sm hover:border-zinc-600 transition-colors">
                <div className="text-[10px] text-amber-400 uppercase font-semibold flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-amber-400" /> DISPLACEMENT
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">164.82 cc DTS-i</div>
              </div>

              {/* 4. Fuel & Tank */}
              <div className="p-3 rounded-xl bg-[#10141e] border border-[#1e2536] shadow-sm hover:border-zinc-600 transition-colors">
                <div className="text-[10px] text-amber-400 uppercase font-semibold flex items-center gap-1">
                  <Fuel className="w-3 h-3 text-amber-400" /> FUEL & TANK
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">{state.vehicle.fuelType || 'Octane 95 Euro-4'}</div>
              </div>

              {/* 5. Brakes */}
              <div className="p-3 rounded-xl bg-[#10141e] border border-[#1e2536] shadow-sm hover:border-zinc-600 transition-colors">
                <div className="text-[10px] text-amber-400 uppercase font-semibold flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" /> BRAKES
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">{state.vehicle.absSystem || 'Dual-Channel ABS'}</div>
              </div>

              {/* 6. Oil Spec */}
              <div className="p-3 rounded-xl bg-[#10141e] border border-[#1e2536] shadow-sm hover:border-zinc-600 transition-colors">
                <div className="text-[10px] text-amber-400 uppercase font-semibold flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-amber-400" /> OIL SPEC
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">{state.vehicle.oilSpec || '20W50 (1150 ml)'}</div>
              </div>
            </div>

            {/* Quick Owner & Reg Strip */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f121a] border border-[#222838] text-xs shadow-inner">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-medium">REGISTERED OWNER</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-semibold text-white">{state.vehicle.owner}</span>
                  {(state.vehicle.owner?.toLowerCase().includes('sachintha') || state.vehicle.owner?.toLowerCase().includes('sachi') || state.vehicle.regNo === 'BKT-1374') ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-zinc-950 border border-yellow-200 shadow-sm uppercase tracking-wider">
                      <Crown className="w-2.5 h-2.5 text-zinc-950 fill-zinc-950" />
                      PREMIUM
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 shadow-sm uppercase tracking-wider">
                      <User className="w-2.5 h-2.5 text-zinc-400" />
                      CLIENT
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block uppercase font-medium">SERVICE BOOK ID</span>
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

        {/* 5 Distinct Category Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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

          {/* Category 5: Schedule Guide - Dark Slate */}
          <button
            type="button"
            onClick={onOpenScheduleGuide}
            className="flex flex-col items-start justify-between p-3.5 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0a0d14] border border-zinc-700/60 hover:border-zinc-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all cursor-pointer text-left group active:scale-95 col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:scale-110 group-hover:bg-zinc-700 group-hover:text-white transition-all">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">
                OEM Specs
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-zinc-200 transition-colors">
                Schedule Guide
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Factory service steps
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* 3. UPCOMING SERVICE STATUS & COUNTDOWN */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Upcoming Service Alert & Live Gauge Card */}
        <div className={`lg:col-span-7 bg-gradient-to-br from-[#0c121e] via-[#070b14] to-[#04060a] rounded-2xl border ${activeTheme.cardBorder} p-5 sm:p-7 shadow-2xl flex flex-col justify-between relative overflow-hidden group transition-colors duration-300`}>
          {/* Top Neon Laser Beam Line */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${activeTheme.topLine} z-20`} />

          {/* Ambient Background Backlight Glow */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20"
            style={{ backgroundColor: activeTheme.dotColor }}
          />

          <div>
            {/* Header: Title, Live Status Badge & Color Theme Switcher */}
            <div className="flex items-center justify-between gap-3 mb-5 relative z-10 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${activeTheme.iconBg} border ${activeTheme.iconBorder} flex items-center justify-center ${activeTheme.iconText} shadow-lg shadow-black/60 relative shrink-0`}>
                  <Calendar className="w-5 h-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black" style={{ backgroundColor: activeTheme.dotColor }} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-display font-black uppercase tracking-wider text-white flex items-center gap-2">
                    Upcoming Service Status
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                    <span>Next scheduled maintenance target</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Vehicle Health Badge */}
              {isOverdue ? (
                <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-950/80 to-red-900/50 text-red-300 border border-red-500/60 text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_16px_rgba(239,68,68,0.35)] animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block" />
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>Service Overdue</span>
                </span>
              ) : isDueSoon ? (
                <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/80 to-amber-900/50 text-amber-300 border border-amber-500/60 text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.3)]">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shadow-[0_0_6px_#f59e0b]" />
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Service Due Soon</span>
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/70 to-emerald-900/40 text-emerald-300 border border-emerald-500/50 text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_16px_rgba(16,185,129,0.25)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Within Safe Interval</span>
                </span>
              )}
            </div>

            {/* 3 Cockpit Metric Displays */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5 relative z-10">
              {/* Tile 1: Current Odometer */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-[#0a1120] to-[#060b14] border border-cyan-500/30 hover:border-cyan-400/60 transition-all shadow-md relative overflow-hidden group/item">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400/80 via-blue-500/50 to-transparent" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold tracking-wider text-cyan-300/90">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Current Odometer</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 tracking-widest">
                    LIVE
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight mt-2 flex items-baseline gap-1.5">
                  {state.odometer.toLocaleString()}
                  <span className="text-xs font-semibold text-cyan-400 font-mono">km</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-2 pt-2 border-t border-cyan-900/30">
                  <span>Instrument ODO</span>
                  <span className="text-cyan-400 font-semibold">Active</span>
                </div>
              </div>

              {/* Tile 2: Target Service Km */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-[#161208] to-[#0c0a05] border border-amber-500/30 hover:border-amber-400/60 transition-all shadow-md relative overflow-hidden group/item">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400/80 via-yellow-500/50 to-transparent" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold tracking-wider text-amber-300/90">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Target Service Km</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 tracking-widest">
                    OEM
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-amber-200 tracking-tight mt-2 flex items-baseline gap-1.5">
                  {currentTarget.toLocaleString()}
                  <span className="text-xs font-semibold text-amber-400 font-mono">km</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-2 pt-2 border-t border-amber-900/30">
                  <span>Target Interval</span>
                  <span className="text-amber-400 font-semibold">Service #{state.services.length + 1}</span>
                </div>
              </div>

              {/* Tile 3: Distance Remaining / Overdue */}
              <div
                className={`p-4 rounded-xl relative overflow-hidden transition-all shadow-md group/item ${
                  isOverdue
                    ? 'bg-gradient-to-b from-[#200808] to-[#120505] border border-red-500/50 hover:border-red-400/70 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                    : isDueSoon
                    ? 'bg-gradient-to-b from-[#1e1405] to-[#100a03] border border-amber-500/40 hover:border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'bg-gradient-to-b from-[#061811] to-[#040e0a] border border-emerald-500/40 hover:border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.18)]'
                }`}
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${
                    isOverdue
                      ? 'from-red-400 via-rose-500 to-transparent'
                      : isDueSoon
                      ? 'from-amber-400 via-orange-500 to-transparent'
                      : 'from-emerald-400 via-teal-500 to-transparent'
                  }`}
                />
                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold tracking-wider ${
                      isOverdue ? 'text-red-300' : isDueSoon ? 'text-amber-300' : 'text-emerald-300'
                    }`}
                  >
                    {isOverdue ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    ) : isDueSoon ? (
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{isOverdue ? 'Overdue By' : 'Distance Remaining'}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-widest ${
                      isOverdue
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                        : isDueSoon
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isOverdue ? 'URGENT' : isDueSoon ? 'DUE SOON' : 'SAFE'}
                  </span>
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-mono font-black tracking-tight mt-2 flex items-baseline gap-1.5 ${
                    isOverdue
                      ? 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]'
                      : isDueSoon
                      ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                  }`}
                >
                  {isOverdue ? `+${Math.abs(remainingKm).toLocaleString()}` : remainingKm.toLocaleString()}
                  <span
                    className={`text-xs font-semibold font-mono ${
                      isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    km
                  </span>
                </div>
                <div
                  className={`flex items-center justify-between text-[10px] font-mono mt-2 pt-2 border-t ${
                    isOverdue
                      ? 'border-red-900/30 text-red-300/80'
                      : isDueSoon
                      ? 'border-amber-900/30 text-amber-300/80'
                      : 'border-emerald-900/30 text-emerald-300/80'
                  }`}
                >
                  <span>Service Status</span>
                  <span
                    className={`font-bold ${
                      isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {isOverdue ? 'Action Needed' : isDueSoon ? 'Within 500 km' : 'Safe Interval'}
                  </span>
                </div>
              </div>
            </div>

            {/* Service Interval Progress Bar */}
            <div className="space-y-2 mb-6 relative z-10">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-300 font-semibold">Service Interval Elapsed</span>
                  <span className={`px-2 py-0.5 rounded-md font-mono font-black text-[11px] border ${activeTheme.badge}`}>
                    {progressPercent}%
                  </span>
                </div>
                <span className="text-zinc-400 text-[11px] font-mono">
                  {previousServiceKm.toLocaleString()} km → {currentTarget.toLocaleString()} km
                </span>
              </div>

              {/* The Recessed Precision Bar */}
              <div className={`w-full h-3.5 rounded-full bg-[#05080f] p-0.5 border ${activeTheme.progressTrack} overflow-hidden shadow-inner relative flex items-center`}>
                <div
                  className={`h-full rounded-full transition-all duration-700 relative ${
                    isOverdue
                      ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-400 shadow-[0_0_14px_rgba(239,68,68,0.7)]'
                      : isDueSoon
                      ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.6)]'
                      : activeTheme.progressFill
                  }`}
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                >
                  {/* Subtle pulsing tip glow */}
                  <span className="absolute right-0 top-0 bottom-0 w-2 rounded-r-full bg-white/70 shadow-[0_0_6px_#ffffff]" />
                </div>
              </div>

              {/* Milestone Indicators */}
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 pt-0.5 px-0.5">
                <span>0% (Last Service)</span>
                <span>50% Mid-point</span>
                <span>100% (Target {currentTarget.toLocaleString()} km)</span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-800/80 relative z-10">
            <button
              type="button"
              onClick={() => onNavigateToTab('service')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-zinc-800 via-zinc-850 to-zinc-900 hover:from-zinc-750 hover:to-zinc-800 active:scale-95 text-white font-extrabold font-display uppercase tracking-wider text-xs sm:text-sm transition-all border border-zinc-700 hover:border-zinc-500 shadow-[0_4px_16px_rgba(0,0,0,0.7)] cursor-pointer group"
            >
              <PlusCircle className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" />
              <span>Log Service Record</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('service')}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0a1322] hover:bg-[#111f36] active:scale-95 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 hover:border-cyan-400 font-bold text-xs transition-all cursor-pointer shadow-sm"
              title="Open Pulsar Digital Instrument Cluster"
            >
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>Digital Cockpit</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('dealers')}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#10131e] hover:bg-[#181c2c] active:scale-95 text-zinc-300 hover:text-white border border-zinc-700/80 hover:border-zinc-500 font-bold text-xs transition-all cursor-pointer shadow-sm"
            >
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Find Dealer</span>
            </button>
          </div>
        </div>

        {/* Right: Upcoming Service Checklist Guide */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0c101c] via-[#090d16] to-[#06080e] rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 p-5 sm:p-6 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300">
          {/* Top subtle highlight line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
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
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
              >
                Full Guide
              </button>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 mt-3">
              {upcomingTasks.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#0e121d]/80 border border-zinc-800/80 transition-colors hover:border-zinc-700"
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      item.mandatory ? 'text-red-400' : 'text-zinc-500'
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

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>David Pieris Motor Company Recommended</span>
            <button
              type="button"
              onClick={() => onNavigateToTab('notes')}
              className="text-amber-400 hover:text-amber-300 hover:underline font-medium text-xs cursor-pointer transition-colors"
            >
              View Garage Notes →
            </button>
          </div>
        </div>
      </section>

      {/* 3. RECENT ACTIVITY QUICK SUMMARY */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Last Recorded Service */}
        <div className="p-4 rounded-2xl bg-[#0c0f16] border border-[#22293a] flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-zinc-600 transition-colors">
          <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-emerald-500 to-zinc-500" />
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
            className="px-3.5 py-1.5 rounded-xl bg-[#141822] hover:bg-[#1c2230] active:scale-95 text-xs font-semibold text-zinc-200 border border-zinc-700/60 hover:border-zinc-500 transition-all cursor-pointer shadow-sm"
          >
            History →
          </button>
        </div>

        {/* Latest Maintenance / Garage Remark */}
        <div className="p-4 rounded-2xl bg-[#0c0f16] border border-[#22293a] flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-zinc-600 transition-colors">
          <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-zinc-500 to-slate-400" />
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-300 block tracking-wider">
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
            className="px-3.5 py-1.5 rounded-xl bg-[#141822] hover:bg-[#1c2230] active:scale-95 text-xs font-semibold text-zinc-200 border border-zinc-700/60 hover:border-zinc-500 transition-all cursor-pointer shadow-sm"
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
