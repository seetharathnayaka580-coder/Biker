import React from 'react';
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
} from 'lucide-react';
import { AppState } from '../types';

interface HomeTabProps {
  state: AppState;
  isAdmin: boolean;
  onNavigateToTab: (tab: 'home' | 'vehicle' | 'service' | 'notes' | 'dealers') => void;
  onOpenScheduleGuide: () => void;
  onOpenPrint: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  state,
  isAdmin,
  onNavigateToTab,
  onOpenScheduleGuide,
  onOpenPrint,
}) => {
  const currentTarget = state.targets[0] || 7688;
  const remainingKm = currentTarget - state.odometer;
  const isOverdue = remainingKm <= 0;
  const isDueSoon = remainingKm > 0 && remainingKm <= 500;

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
      {/* 1. HERO SHOWCASE: ABOUT THE BIKE */}
      <section className="bg-gradient-to-br from-[#151922] via-[#181d28] to-[#10131a] rounded-2xl border border-[#272f3e] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Bike Image & Visual Branding */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl bg-gradient-to-b from-[#0e1117] to-[#08090d] border border-amber-500/30 p-4 flex items-center justify-center shadow-xl shadow-black/60 overflow-hidden group">
              <img
                src="/pulsar_n160.svg"
                alt="Bajaj Pulsar N160 Brooklyn Black"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Badges on Image */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-amber-500/40 text-[10px] font-mono font-bold text-amber-400">
                <Sparkles className="w-3 h-3 text-amber-400" />
                BROOKLYN BLACK
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/90 text-white text-[10px] font-bold tracking-wider font-mono shadow-md">
                DUAL ABS
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md border border-zinc-700/60 text-xs">
                <span className="font-mono text-zinc-400 text-[11px]">Reg: <strong className="text-white">{state.vehicle.regNo}</strong></span>
                <span className="font-mono text-amber-400 text-[11px]">Odo: <strong>{state.odometer.toLocaleString()} km</strong></span>
              </div>
            </div>

            {/* Quick action buttons under image */}
            <div className="flex items-center gap-2 mt-4 w-full max-w-md">
              <button
                type="button"
                onClick={() => onNavigateToTab('vehicle')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#202633] hover:bg-[#283142] border border-[#333e54] text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
              >
                <span>View Full Specs</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
              <button
                type="button"
                onClick={onOpenPrint}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Print Booklet</span>
              </button>
            </div>
          </div>

          {/* Right Column: About the Machine & Technical Highlights */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  Official Vehicle Profile
                </span>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-wide">
                BAJAJ PULSAR <span className="text-amber-400">N160</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
                Precision streetfighter motorcycle engineered with a high-torque 164.82cc oil-cooled DTS-i engine, twin-spark ignition, underbelly exhaust, and best-in-class segment dual-channel ABS braking system.
              </p>
            </div>

            {/* Spec Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-[#1a1f2c] border border-[#2d3548]">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Max Power
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">16 PS @ 8750 RPM</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1a1f2c] border border-[#2d3548]">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-400" /> Max Torque
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">14.65 Nm @ 6750</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1a1f2c] border border-[#2d3548]">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-amber-400" /> Displacement
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">164.82 cc DTS-i</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1a1f2c] border border-[#2d3548]">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                  <Fuel className="w-3 h-3 text-amber-400" /> Fuel & Tank
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">14 Litres (95 Oct)</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1a1f2c] border border-[#2d3548]">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" /> Brakes
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">Dual Disc + ABS</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1a1f2c] border border-[#2d3548]">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-amber-400" /> Oil Spec
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">20W50 (1150 ml)</div>
              </div>
            </div>

            {/* Quick Owner & Reg Strip */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#12151d] border border-[#272d3a] text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-medium">Registered Owner</span>
                <span className="font-semibold text-zinc-200">{state.vehicle.owner}</span>
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
        <div className="lg:col-span-7 bg-[#151820] rounded-2xl border border-[#272c38] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
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
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Service Overdue
                </span>
              ) : isDueSoon ? (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Service Due Soon
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Within Safe Interval
                </span>
              )}
            </div>

            {/* Mileage Status Metric Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#1a1f2a] border border-[#2b3344] mb-4">
              <div>
                <span className="text-[11px] text-zinc-400 uppercase font-medium">Current Odometer</span>
                <div className="text-xl sm:text-2xl font-mono font-black text-white mt-0.5">
                  {state.odometer.toLocaleString()} <span className="text-xs font-normal text-zinc-400">km</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 uppercase font-medium">Target Service Km</span>
                <div className="text-xl sm:text-2xl font-mono font-black text-amber-400 mt-0.5">
                  {currentTarget.toLocaleString()} <span className="text-xs font-normal text-zinc-400">km</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 uppercase font-medium">
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
                <span>Interval Progress</span>
                <span className="text-amber-400 font-bold">{progressPercent}% elapsed</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#0d1015] p-0.5 border border-[#2c3444] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isOverdue
                      ? 'bg-gradient-to-r from-red-600 to-red-500'
                      : isDueSoon
                      ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                      : 'bg-gradient-to-r from-emerald-600 to-amber-500'
                  }`}
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#232834]">
            <button
              type="button"
              onClick={() => onNavigateToTab('service')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs tracking-wide transition-all shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Service Record</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('dealers')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#202735] hover:bg-[#283244] text-amber-400 border border-amber-500/30 font-semibold text-xs transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>Find Nearest Dealer</span>
            </button>
          </div>
        </div>

        {/* Right: Upcoming Service Checklist Guide */}
        <div className="lg:col-span-5 bg-[#151820] rounded-2xl border border-[#272c38] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
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
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 cursor-pointer"
              >
                Full Guide
              </button>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2.5 mt-3">
              {upcomingTasks.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#191e28] border border-[#28303f]"
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

          <div className="mt-4 pt-3 border-t border-[#232834] flex items-center justify-between text-xs text-zinc-400">
            <span>David Pieris Motor Company Recommended</span>
            <button
              type="button"
              onClick={() => onNavigateToTab('notes')}
              className="text-amber-400 hover:underline font-medium text-xs cursor-pointer"
            >
              View Garage Notes →
            </button>
          </div>
        </div>
      </section>

      {/* 3. RECENT ACTIVITY QUICK SUMMARY */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Last Recorded Service */}
        <div className="p-4 rounded-2xl bg-[#14171f] border border-[#242935] flex items-center justify-between">
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
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
          >
            History →
          </button>
        </div>

        {/* Latest Maintenance / Garage Remark */}
        <div className="p-4 rounded-2xl bg-[#14171f] border border-[#242935] flex items-center justify-between">
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
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
          >
            Notes →
          </button>
        </div>
      </section>
    </div>
  );
};
