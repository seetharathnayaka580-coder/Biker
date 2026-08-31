import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
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
} from 'lucide-react';
import { AppState, VehicleDetails } from '../types';

interface HomeTabProps {
  state: AppState;
  isAdmin: boolean;
  onUpdateVehicle?: (updated: VehicleDetails) => void;
  onNavigateToTab: (tab: 'home' | 'vehicle' | 'service' | 'notes' | 'dealers') => void;
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
      <section className="bg-gradient-to-br from-[#131722] via-[#161b27] to-[#0e1118] rounded-2xl border border-[#232a3b] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative telemetry glows */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Bike Image & Visual Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative w-full max-w-md aspect-[4/3] rounded-2xl bg-gradient-to-b from-[#0c0e14] to-[#07080c] border transition-all duration-300 p-2 flex items-center justify-center shadow-2xl shadow-black/90 overflow-hidden group ${
                isDragging ? 'border-amber-400 ring-4 ring-amber-500/20 scale-[1.02]' : 'border-amber-500/30'
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
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-amber-500/40 text-[10px] font-mono font-bold text-amber-400 shadow-md">
                <Sparkles className="w-3 h-3 text-amber-400" />
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

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px] font-bold tracking-wider font-mono shadow-md border border-red-500/50">
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
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-zinc-800/90 text-xs shadow-md">
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
                    title="Upload or Change Bike Photo"
                  >
                    <Camera className="w-3 h-3 text-amber-400" />
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
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1d2331] hover:bg-[#252e40] border border-[#2d374d] text-xs font-semibold text-zinc-200 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span>View Full Specs</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab('vehicle')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold text-amber-300 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Edit bike specifications and registration details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenPrint}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#191e2b] hover:bg-[#22293b] border border-[#2c374d] text-xs font-semibold text-zinc-300 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Right Column: About the Machine & Technical Highlights */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25">
                  Official Vehicle Profile
                </span>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Digital Record
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide uppercase">
                {state.vehicle.model || 'BAJAJ PULSAR N160'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
                Precision motorcycle engineered with a high-torque 164.82cc oil-cooled DTS-i engine, twin-spark ignition, underbelly exhaust, and best-in-class {state.vehicle.absSystem || 'dual-channel ABS'} braking system.
              </p>
            </div>

            {/* Spec Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-[#161a25] border border-[#262e3f] shadow-sm">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Max Power
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">16 PS @ 8750 RPM</div>
              </div>

              <div className="p-3 rounded-xl bg-[#161a25] border border-[#262e3f] shadow-sm">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-400" /> Max Torque
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">14.65 Nm @ 6750</div>
              </div>

              <div className="p-3 rounded-xl bg-[#161a25] border border-[#262e3f] shadow-sm">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-amber-400" /> Displacement
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">164.82 cc DTS-i</div>
              </div>

              <div className="p-3 rounded-xl bg-[#161a25] border border-[#262e3f] shadow-sm">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                  <Fuel className="w-3 h-3 text-amber-400" /> Fuel & Tank
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">{state.vehicle.fuelType || '14 L (95 Oct)'}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#161a25] border border-[#262e3f] shadow-sm">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" /> Brakes
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">{state.vehicle.absSystem || 'Dual Disc + ABS'}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#161a25] border border-[#262e3f] shadow-sm">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-amber-400" /> Oil Spec
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">{state.vehicle.oilSpec || '20W50 (1150 ml)'}</div>
              </div>
            </div>

            {/* Quick Owner & Reg Strip */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#10131b] border border-[#222938] text-xs">
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
                <span className="font-mono font-bold text-amber-400">{state.vehicle.bookNo}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. UPCOMING SERVICE STATUS & COUNTDOWN */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Upcoming Service Alert & Live Gauge Card */}
        <div className="lg:col-span-7 bg-[#131722] rounded-2xl border border-[#232a3a] p-5 sm:p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
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

            {/* Mileage Status Metric Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#181d29] border border-[#273042] mb-4 shadow-inner">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Current Odometer</span>
                <div className="text-xl sm:text-2xl font-mono font-black text-white mt-0.5">
                  {state.odometer.toLocaleString()} <span className="text-xs font-normal text-zinc-400">km</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Target Service Km</span>
                <div className="text-xl sm:text-2xl font-mono font-black text-amber-400 mt-0.5">
                  {currentTarget.toLocaleString()} <span className="text-xs font-normal text-zinc-400">km</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
                  {isOverdue ? 'Overdue By' : 'Distance Remaining'}
                </span>
                <div className={`text-xl sm:text-2xl font-mono font-black mt-0.5 ${isOverdue ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isOverdue ? `+${Math.abs(remainingKm).toLocaleString()}` : remainingKm.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-zinc-400">km</span>
                </div>
              </div>
            </div>

            {/* Service Interval Progress Bar */}
            <div className="space-y-1.5 mb-5">
              <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>Interval Elapsed</span>
                <span className="text-amber-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#0b0e14] p-0.5 border border-[#273042] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isOverdue
                      ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-sm shadow-red-500/50'
                      : isDueSoon
                      ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-sm shadow-amber-500/50'
                      : 'bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-400 shadow-sm shadow-emerald-500/50'
                  }`}
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#202737]">
            <button
              type="button"
              onClick={() => onNavigateToTab('service')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs tracking-wide transition-all shadow-md cursor-pointer border border-amber-400"
            >
              <PlusCircle className="w-4 h-4 text-zinc-950" />
              <span>Log Service Record</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('dealers')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1c2230] hover:bg-[#252d40] active:scale-95 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-all cursor-pointer shadow-sm"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Find Nearest Dealer</span>
            </button>
          </div>
        </div>

        {/* Right: Upcoming Service Checklist Guide */}
        <div className="lg:col-span-5 bg-[#131722] rounded-2xl border border-[#232a3a] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
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
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#171c27] border border-[#252d3d] transition-colors hover:border-[#323d52]"
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      item.mandatory ? 'text-amber-400' : 'text-zinc-500'
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

          <div className="mt-4 pt-3 border-t border-[#202737] flex items-center justify-between text-xs text-zinc-400">
            <span>David Pieris Motor Company Recommended</span>
            <button
              type="button"
              onClick={() => onNavigateToTab('notes')}
              className="text-amber-400 hover:underline font-medium text-xs cursor-pointer transition-colors"
            >
              View Garage Notes →
            </button>
          </div>
        </div>
      </section>

      {/* 3. RECENT ACTIVITY QUICK SUMMARY */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Last Recorded Service */}
        <div className="p-4 rounded-2xl bg-[#131722] border border-[#232a3a] flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">
              Last Completed Service
            </span>
            <div className="text-sm font-bold text-white mt-0.5">
              {state.services[0]?.label || 'No previous service logged'}
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">
              {state.services[0] ? `${state.services[0].km.toLocaleString()} km · ${state.services[0].date} · ${state.services[0].dealer}` : 'Fresh factory delivery record'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('service')}
            className="px-3.5 py-1.5 rounded-xl bg-[#1c2230] hover:bg-[#252e40] active:scale-95 text-xs font-semibold text-zinc-200 border border-[#2d374c] transition-all cursor-pointer shadow-sm"
          >
            History →
          </button>
        </div>

        {/* Latest Maintenance / Garage Remark */}
        <div className="p-4 rounded-2xl bg-[#131722] border border-[#232a3a] flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">
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
            className="px-3.5 py-1.5 rounded-xl bg-[#1c2230] hover:bg-[#252e40] active:scale-95 text-xs font-semibold text-zinc-200 border border-[#2d374c] transition-all cursor-pointer shadow-sm"
          >
            Notes →
          </button>
        </div>
      </section>

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#12151c] border border-zinc-700/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-[#161a22]">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-5 h-5 text-amber-400" />
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
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsFullscreenModalOpen(false)}
                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
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
            <div className="px-5 py-3 border-t border-zinc-800 bg-[#141720] flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-3">
                <span>Chassis: <strong className="text-white font-mono">{state.vehicle.chassisNo}</strong></span>
                <span>Engine: <strong className="text-white font-mono">{state.vehicle.engineNo}</strong></span>
              </div>
              <span className="font-mono text-amber-400">
                Odometer: {state.odometer.toLocaleString()} km
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
