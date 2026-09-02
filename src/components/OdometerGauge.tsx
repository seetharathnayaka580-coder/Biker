import React, { useState, useEffect, useRef } from 'react';
import {
  Gauge,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Plus,
  Wrench,
  Zap,
  Fuel,
  Palette,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { calculateServiceStats, fmtKm } from '../utils/formatters';
import { ServiceRecord } from '../types';

export type MeterColorId = 'cyan' | 'amber' | 'red' | 'green' | 'purple' | 'white';

export interface MeterColorConfig {
  id: MeterColorId;
  name: string;
  dotColor: string;
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
  glowRgb: string;
  textColor: string;
  subtextColor: string;
  accentBg: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
}

export const METER_COLORS: Record<MeterColorId, MeterColorConfig> = {
  cyan: {
    id: 'cyan',
    name: 'Pulsar Cyan (OEM)',
    dotColor: '#00e5ff',
    gradientStart: '#06b6d4',
    gradientMid: '#0ea5e9',
    gradientEnd: '#38bdf8',
    glowRgb: '6, 182, 212',
    textColor: 'text-cyan-400',
    subtextColor: 'text-cyan-300',
    accentBg: 'bg-cyan-500/10',
    accentBorder: 'border-cyan-500/40',
    badgeBg: 'bg-cyan-950/80',
    badgeText: 'text-cyan-300',
  },
  amber: {
    id: 'amber',
    name: 'Brooklyn Amber (Classic)',
    dotColor: '#f59e0b',
    gradientStart: '#d97706',
    gradientMid: '#f59e0b',
    gradientEnd: '#fbbf24',
    glowRgb: '245, 158, 11',
    textColor: 'text-amber-400',
    subtextColor: 'text-amber-300',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/40',
    badgeBg: 'bg-amber-950/80',
    badgeText: 'text-amber-300',
  },
  red: {
    id: 'red',
    name: 'Sport Crimson (Redline)',
    dotColor: '#ef4444',
    gradientStart: '#dc2626',
    gradientMid: '#ef4444',
    gradientEnd: '#f87171',
    glowRgb: '239, 68, 68',
    textColor: 'text-red-400',
    subtextColor: 'text-red-300',
    accentBg: 'bg-red-500/10',
    accentBorder: 'border-red-500/40',
    badgeBg: 'bg-red-950/80',
    badgeText: 'text-red-300',
  },
  green: {
    id: 'green',
    name: 'Matrix Emerald',
    dotColor: '#10b981',
    gradientStart: '#059669',
    gradientMid: '#10b981',
    gradientEnd: '#34d399',
    glowRgb: '16, 185, 129',
    textColor: 'text-emerald-400',
    subtextColor: 'text-emerald-300',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-950/80',
    badgeText: 'text-emerald-300',
  },
  purple: {
    id: 'purple',
    name: 'Neon Violet (Cyber)',
    dotColor: '#a855f7',
    gradientStart: '#7c3aed',
    gradientMid: '#a855f7',
    gradientEnd: '#c084fc',
    glowRgb: '168, 85, 247',
    textColor: 'text-purple-400',
    subtextColor: 'text-purple-300',
    accentBg: 'bg-purple-500/10',
    accentBorder: 'border-purple-500/40',
    badgeBg: 'bg-purple-950/80',
    badgeText: 'text-purple-300',
  },
  white: {
    id: 'white',
    name: 'Ice OLED White',
    dotColor: '#ffffff',
    gradientStart: '#94a3b8',
    gradientMid: '#e2e8f0',
    gradientEnd: '#ffffff',
    glowRgb: '255, 255, 255',
    textColor: 'text-zinc-100',
    subtextColor: 'text-zinc-200',
    accentBg: 'bg-zinc-500/10',
    accentBorder: 'border-zinc-400/40',
    badgeBg: 'bg-zinc-800/80',
    badgeText: 'text-white',
  },
};

const COLOR_STORAGE_KEY = 'n160_meter_color_theme';

type DisplayMode = 'ODO' | 'TRIP_A' | 'TRIP_B' | 'DTE' | 'AFE' | 'SERVICE';

interface OdometerGaugeProps {
  odometer: number;
  targets: number[];
  services: ServiceRecord[];
  isAdmin?: boolean;
  onUpdateOdometer: (newOdo: number) => void;
  onUpdateTarget: (newTarget: number) => void;
}

export const OdometerGauge: React.FC<OdometerGaugeProps> = ({
  odometer,
  targets,
  services,
  isAdmin = true,
  onUpdateOdometer,
  onUpdateTarget,
}) => {
  const currentTarget = targets[0] || 7688;
  const stats = calculateServiceStats(services, odometer, currentTarget);

  // Modal states
  const [showOdoModal, setShowOdoModal] = useState(false);
  const [tempOdo, setTempOdo] = useState(odometer.toString());
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [tempTarget, setTempTarget] = useState(currentTarget.toString());
  const [showColorMenu, setShowColorMenu] = useState(false);

  // Meter Mode state (Authentic Pulsar MID modes)
  const [meterMode, setMeterMode] = useState<DisplayMode>('ODO');
  const [currentTime, setCurrentTime] = useState('');
  
  // Interactive Gear & Throttle simulator state
  const [currentGear, setCurrentGear] = useState<number>(0); // 0 = N, 1-5
  const [simulatedRpm, setSimulatedRpm] = useState<number>(1400); // 1.4k idle
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(0);
  const [isRevving, setIsRevving] = useState<boolean>(false);
  const [fuelBars, setFuelBars] = useState<number>(5); // 0-6 bars
  const [leftBlinker, setLeftBlinker] = useState<boolean>(false);
  const [rightBlinker, setRightBlinker] = useState<boolean>(false);
  const [highBeam, setHighBeam] = useState<boolean>(false);
  const [sideStand, setSideStand] = useState<boolean>(false);

  // Meter Color Theme state (persistent)
  const [activeColorId, setActiveColorId] = useState<MeterColorId>(() => {
    try {
      const saved = localStorage.getItem(COLOR_STORAGE_KEY) as MeterColorId;
      return saved && METER_COLORS[saved] ? saved : 'cyan';
    } catch {
      return 'cyan';
    }
  });

  const activeColor = METER_COLORS[activeColorId] || METER_COLORS.cyan;

  const handleSelectColor = (id: MeterColorId) => {
    setActiveColorId(id);
    setShowColorMenu(false);
    try {
      localStorage.setItem(COLOR_STORAGE_KEY, id);
    } catch (e) {
      console.warn('Could not save meter color:', e);
    }
  };

  // Real-time digital clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Throttle rev simulation animation
  const revAnimRef = useRef<number | null>(null);
  useEffect(() => {
    let targetRpm = isRevving ? (currentGear === 0 ? 8800 : 7200) : 1400;
    let targetSpeed = isRevving ? (currentGear === 0 ? 0 : currentGear * 22) : (currentGear === 0 ? 0 : Math.max(0, simulatedSpeed - 5));

    const step = () => {
      setSimulatedRpm((prev) => {
        const diff = targetRpm - prev;
        if (Math.abs(diff) < 40) return targetRpm;
        return prev + diff * 0.18;
      });

      setSimulatedSpeed((prev) => {
        const diff = targetSpeed - prev;
        if (Math.abs(diff) < 1) return targetSpeed;
        return Math.round(prev + diff * 0.15);
      });

      revAnimRef.current = requestAnimationFrame(step);
    };

    revAnimRef.current = requestAnimationFrame(step);
    return () => {
      if (revAnimRef.current) cancelAnimationFrame(revAnimRef.current);
    };
  }, [isRevving, currentGear]);

  // Tachometer RPM calculations (0 - 10,000 RPM)
  // Total arc angle is 180 degrees from 180 to 0
  const maxRpm = 10000;
  const redlineRpm = 8500;
  const isShiftWarning = simulatedRpm >= redlineRpm;

  // Arc length calculations for SVG Tachometer
  const arcLength = 283;
  // Progress based on service interval or live RPM during rev
  const activeArcRatio = isRevving
    ? Math.min(simulatedRpm / maxRpm, 1)
    : Math.min(stats.progressRatio, 1);
  const strokeOffset = arcLength - arcLength * activeArcRatio;

  const handleSaveOdo = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(tempOdo);
    if (!isNaN(val) && val >= 0) {
      onUpdateOdometer(val);
      setShowOdoModal(false);
    }
  };

  const handleQuickAdd = (kmToAdd: number) => {
    onUpdateOdometer(odometer + kmToAdd);
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(tempTarget);
    if (!isNaN(val) && val > 0) {
      onUpdateTarget(val);
      setShowTargetModal(false);
    }
  };

  // Cycle through MID display modes (Authentic "M" Mode Button)
  const cycleMode = () => {
    const modes: DisplayMode[] = ['ODO', 'TRIP_A', 'TRIP_B', 'DTE', 'AFE', 'SERVICE'];
    const idx = modes.indexOf(meterMode);
    setMeterMode(modes[(idx + 1) % modes.length]);
  };

  // Gear shifter
  const shiftUp = () => {
    setCurrentGear((prev) => Math.min(5, prev + 1));
  };
  const shiftDown = () => {
    setCurrentGear((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="relative bg-[#05080e] border-2 border-[#1c2436] rounded-[2rem] p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_1px_4px_rgba(255,255,255,0.08)] overflow-hidden flex flex-col justify-between group select-none">
      
      {/* 1. BACKGROUND CARBON TEXTURE & PERIMETER INSTRUMENT GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:14px_14px] opacity-20 pointer-events-none" />
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 blur-3xl pointer-events-none rounded-full opacity-25 transition-all duration-700"
        style={{ backgroundColor: activeColor.dotColor }}
      />
      <div
        className="absolute -bottom-20 right-0 w-80 h-40 blur-3xl pointer-events-none rounded-full opacity-15 transition-all duration-700"
        style={{ backgroundColor: activeColor.dotColor }}
      />

      {/* 2. AUTHENTIC CORNER HEX BOLTS & BEZEL ACCENTS */}
      <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-[#1e2738] border border-zinc-600/80 flex items-center justify-center text-[8px] text-zinc-400 font-mono shadow-inner pointer-events-none">
        +
      </div>
      <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-[#1e2738] border border-zinc-600/80 flex items-center justify-center text-[8px] text-zinc-400 font-mono shadow-inner pointer-events-none">
        +
      </div>
      <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-[#1e2738] border border-zinc-600/80 flex items-center justify-center text-[8px] text-zinc-400 font-mono shadow-inner pointer-events-none">
        +
      </div>
      <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-[#1e2738] border border-zinc-600/80 flex items-center justify-center text-[8px] text-zinc-400 font-mono shadow-inner pointer-events-none">
        +
      </div>

      {/* 3. PULSAR N160 TOP BRANDING HEADER STRIP */}
      <div className="relative z-10 flex items-center justify-between pb-3 mb-2 border-b border-[#141b2a] flex-wrap gap-2">
        {/* Pulsar Metallic Chrome Insignia */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#090d16] border border-[#222e44] shadow-sm">
            <span className="font-display font-black text-xs sm:text-sm tracking-widest text-white uppercase">
              BAJAJ
            </span>
            <span className="w-1 h-1 rounded-full bg-red-500" />
            <span className={`font-display font-black text-xs sm:text-sm tracking-widest uppercase ${activeColor.textColor}`}>
              PULSAR N160
            </span>
          </div>
          <span className="hidden sm:inline-block text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#0a0f1c] text-zinc-400 border border-[#1b2438]">
            Infinity Display
          </span>
        </div>

        {/* Color Palette Menu & Settings Controls */}
        <div className="flex items-center gap-2 relative">
          {/* Color Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorMenu(!showColorMenu)}
              className={`px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white bg-[#0a0e18] hover:bg-[#12192a] border border-[#202b40] hover:${activeColor.accentBorder} rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95`}
              title="Change LCD Backlight Theme Color"
            >
              <span
                className="w-3 h-3 rounded-full border border-white/50 shadow-sm"
                style={{ backgroundColor: activeColor.dotColor }}
              />
              <span className="text-[11px] font-mono hidden xs:inline">{activeColor.name.split(' ')[0]}</span>
            </button>

            {/* Color Palette Dropdown Menu */}
            {showColorMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#080c14] border border-[#202b40] rounded-2xl p-2 shadow-2xl z-30 animate-in fade-in zoom-in-95">
                <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5 border-b border-[#182030] mb-1">
                  <Palette className="w-3 h-3 text-cyan-400" />
                  <span>Meter Backlight Color</span>
                </div>
                <div className="space-y-1">
                  {(Object.keys(METER_COLORS) as MeterColorId[]).map((key) => {
                    const c = METER_COLORS[key];
                    const isSelected = activeColorId === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectColor(key)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#151d2d] text-white border border-[#2e3d5b]'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#0f1422]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: c.dotColor }}
                          />
                          <span className={isSelected ? 'font-bold text-white' : ''}>
                            {c.name}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => {
                  setTempOdo(odometer.toString());
                  setShowOdoModal(true);
                }}
                className={`px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white bg-[#0a0e18] hover:bg-[#12192a] border border-[#202b40] hover:${activeColor.accentBorder} rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95`}
                title="Edit Odometer Value"
              >
                <Edit3 className={`w-3.5 h-3.5 ${activeColor.textColor}`} />
                <span className="text-[11px] font-mono">Edit Odo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempTarget(currentTarget.toString());
                  setShowTargetModal(true);
                }}
                className={`px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white bg-[#0a0e18] hover:bg-[#12192a] border border-[#202b40] hover:${activeColor.accentBorder} rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95`}
                title="Set Next Service Target"
              >
                <span className="text-[11px] text-zinc-400">Target:</span>
                <span className={`${activeColor.textColor} font-mono font-bold text-[11px]`}>{currentTarget.toLocaleString()}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4. AUTHENTIC TELL-TALE WARNING LED BAR (Pulsar N160 Factory Layout) */}
      <div className="relative z-10 flex items-center justify-between px-3 py-2 rounded-2xl bg-[#03050a] border border-[#141c2c] mb-3 shadow-inner gap-1 sm:gap-2">
        {/* Left Tell-Tales: Turn Left, ABS, Neutral, High Beam */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Turn Left Indicator */}
          <button
            type="button"
            onClick={() => setLeftBlinker(!leftBlinker)}
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black transition-all cursor-pointer flex items-center gap-1 border ${
              leftBlinker
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.7)]'
                : 'bg-zinc-950 text-zinc-600 border-zinc-800'
            }`}
            title="Toggle Left Turn Indicator"
          >
            <ChevronLeft className="w-3 h-3" />
            <span className="hidden xs:inline">L</span>
          </button>

          {/* Dual Channel ABS Warning Lamp */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-950/70 border border-red-500/60 text-[10px] font-mono font-black text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
            title="Dual-Channel ABS System Active"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>ABS</span>
          </div>

          {/* Neutral [ N ] Lamp */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-black border transition-all ${
              currentGear === 0
                ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                : 'bg-zinc-950 text-zinc-600 border-zinc-800'
            }`}
            title="Neutral Gear Lamp"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentGear === 0 ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-zinc-700'}`} />
            <span>N</span>
          </div>

          {/* High Beam Indicator */}
          <button
            type="button"
            onClick={() => setHighBeam(!highBeam)}
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer border ${
              highBeam
                ? 'bg-blue-950/90 text-blue-400 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)]'
                : 'bg-zinc-950 text-zinc-600 border-zinc-800'
            }`}
            title="Toggle High Beam"
          >
            💡
          </button>
        </div>

        {/* Center: Shift Warning Flasher / Clock */}
        <div className="flex items-center gap-2">
          {/* Top Shift Flasher LED (illuminates on redline / rev limiter) */}
          <div
            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider transition-all ${
              isShiftWarning
                ? 'bg-red-600 text-white animate-ping shadow-[0_0_16px_rgba(239,68,68,1)] border border-red-300'
                : 'bg-[#080c16] text-zinc-600 border border-[#162032]'
            }`}
          >
            RPM LIMIT
          </div>

          {/* Pulsar Digital 12-Hour Clock */}
          <div className={`text-[11px] font-mono font-bold tracking-wider bg-[#070b14] px-2.5 py-0.5 rounded-md border border-[#1a2336] ${activeColor.subtextColor}`}>
            {currentTime || '10:17 AM'}
          </div>
        </div>

        {/* Right Tell-Tales: Side Stand, Service Spanner, Engine Check, Turn Right */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Side Stand Warning */}
          <button
            type="button"
            onClick={() => setSideStand(!sideStand)}
            className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold transition-all cursor-pointer border ${
              sideStand
                ? 'bg-amber-950/90 text-amber-300 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                : 'bg-zinc-950 text-zinc-600 border-zinc-800'
            }`}
            title="Toggle Side Stand Indicator"
          >
            STAND
          </button>

          {/* Service Reminder Spanner */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-black border transition-all ${
              stats.isOverdue
                ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse shadow-[0_0_14px_rgba(239,68,68,0.7)]'
                : stats.isDueSoon
                ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}
            title="Service Maintenance Reminder"
          >
            <Wrench className="w-3 h-3" />
            <span className="hidden sm:inline">SERVICE</span>
          </div>

          {/* Battery Voltage */}
          <div className={`hidden sm:flex items-center gap-1 text-[10px] font-mono ${activeColor.textColor}`}>
            <Zap className="w-3 h-3" />
            <span className="font-bold">12.4V</span>
          </div>

          {/* Turn Right Indicator */}
          <button
            type="button"
            onClick={() => setRightBlinker(!rightBlinker)}
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black transition-all cursor-pointer flex items-center gap-1 border ${
              rightBlinker
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.7)]'
                : 'bg-zinc-950 text-zinc-600 border-zinc-800'
            }`}
            title="Toggle Right Turn Indicator"
          >
            <span className="hidden xs:inline">R</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 5. MAIN CONSOLE INSTRUMENT CLUSTER BODY (Fuel Gauge + Center LCD + Gear Box) */}
      <div className="relative grid grid-cols-12 gap-2 sm:gap-4 items-center my-2 z-10 bg-[#03060c] p-3 sm:p-5 rounded-2xl border border-[#162034] shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)]">
        
        {/* LEFT WING: SEGMENTED 6-BAR FUEL LEVEL GAUGE */}
        <div className="col-span-2 sm:col-span-2 flex flex-col items-center justify-between h-full py-1">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold text-zinc-400">F</span>
            <Fuel className={`w-3.5 h-3.5 my-1 ${fuelBars <= 1 ? 'text-amber-400 animate-bounce' : 'text-zinc-400'}`} />
          </div>

          {/* 6-Segment Vertical Fuel Bar Gauge */}
          <div className="flex flex-col-reverse gap-1 my-1 w-full max-w-[20px] bg-[#070b14] p-1 rounded-md border border-[#1a2336]">
            {[1, 2, 3, 4, 5, 6].map((bar) => {
              const isFilled = fuelBars >= bar;
              return (
                <button
                  key={bar}
                  type="button"
                  onClick={() => setFuelBars(bar)}
                  className={`w-full h-3 rounded-[2px] transition-all cursor-pointer ${
                    isFilled
                      ? bar <= 1
                        ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                        : `${activeColor.accentBg} bg-cyan-400 shadow-[0_0_6px_currentColor]`
                      : 'bg-[#101726]'
                  }`}
                  style={{
                    backgroundColor: isFilled ? (bar <= 1 ? '#f59e0b' : activeColor.dotColor) : undefined,
                  }}
                  title={`Set Fuel Level: ${bar}/6`}
                />
              );
            })}
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold text-zinc-500">E</span>
            <span className="text-[9px] font-mono text-zinc-500 mt-0.5">{Math.round((fuelBars / 6) * 100)}%</span>
          </div>
        </div>

        {/* CENTER: PULSAR INFINITY DIGITAL SPEEDO & ODOMETER DIAL */}
        <div className="col-span-8 sm:col-span-8 flex flex-col items-center justify-center relative">
          
          {/* Tachometer RPM Scale Numbers (0, 2, 4, 6, 8, 10 x1000 RPM) */}
          <div className="w-full max-w-[280px] sm:max-w-[310px] flex items-center justify-between text-[9px] font-mono text-zinc-500 px-3 mb-0.5 select-none">
            <span className={`${activeColor.textColor} font-bold opacity-90`}>0</span>
            <span>2</span>
            <span>4</span>
            <span>6</span>
            <span className="text-amber-400">8</span>
            <span className="text-red-400 font-bold">10k RPM</span>
          </div>

          {/* Sweeping Arc Vector */}
          <svg viewBox="0 0 220 135" className="w-full max-w-[260px] sm:max-w-[310px] overflow-visible">
            <defs>
              <linearGradient id="n160TachoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={activeColor.gradientStart} />
                <stop offset="65%" stopColor={activeColor.gradientMid} />
                <stop offset="85%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <linearGradient id="gaugeOverdueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
              <filter id="n160MeterGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Bezel Inactive Track */}
            <path
              d="M 20 120 A 90 90 0 0 1 200 120"
              fill="none"
              stroke="#0b101c"
              strokeWidth="15"
              strokeLinecap="round"
            />

            {/* Segmented Ticks */}
            <path
              d="M 24 120 A 86 86 0 0 1 196 120"
              fill="none"
              stroke="#192336"
              strokeWidth="2"
              strokeDasharray="2 6"
            />

            {/* Active Sweeping Arc Fill */}
            <path
              d="M 20 120 A 90 90 0 0 1 200 120"
              fill="none"
              stroke={stats.isOverdue && !isRevving ? 'url(#gaugeOverdueGrad)' : 'url(#n160TachoGradient)'}
              strokeWidth="15"
              strokeLinecap="round"
              strokeDasharray={arcLength}
              strokeDashoffset={strokeOffset}
              style={{
                transition: isRevving ? 'stroke-dashoffset 0.1s ease-out' : 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                filter: isShiftWarning
                  ? 'drop-shadow(0 0 14px rgba(239, 68, 68, 0.9))'
                  : `drop-shadow(0 0 12px rgba(${activeColor.glowRgb}, 0.75))`,
              }}
            />

            {/* Precision Nodes along Arc */}
            <circle cx="20" cy="120" r="3.5" fill={activeColor.gradientEnd} />
            <circle cx="58" cy="56" r="3" fill={activeColor.gradientEnd} opacity="0.9" />
            <circle cx="110" cy="30" r="4" fill={activeColor.gradientEnd} filter="url(#n160MeterGlow)" />
            <circle cx="162" cy="56" r="3.5" fill="#f59e0b" opacity="0.9" />
            <circle cx="200" cy="120" r="4" fill="#ef4444" filter="url(#n160MeterGlow)" />
          </svg>

          {/* Readout Overlay Inside Arc: Giant Digital Numerals */}
          <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            {/* If revving, show Speedometer km/h; otherwise show Odometer km */}
            <div className="relative">
              <span
                className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white block leading-none select-all"
                style={{
                  textShadow: `0 2px 20px rgba(${activeColor.glowRgb}, 0.6)`,
                }}
              >
                {isRevving ? simulatedSpeed : odometer.toLocaleString('en-US')}
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <span
                className={`block text-[11px] font-black tracking-widest uppercase ${activeColor.textColor}`}
                style={{
                  textShadow: `0 0 8px rgba(${activeColor.glowRgb}, 0.4)`,
                }}
              >
                {isRevving ? 'KM / H SPEED' : 'KM ON THE CLOCK'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT WING: GEAR POSITION INDICATOR (GPI) */}
        <div className="col-span-2 sm:col-span-2 flex flex-col items-center justify-between h-full py-1">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">GEAR</span>
          
          {/* Digital Gear Box */}
          <div className="flex flex-col items-center justify-center w-full max-w-[44px] aspect-square rounded-xl bg-[#070b14] border-2 border-[#1c263c] shadow-inner my-1">
            <span
              className={`font-mono text-2xl font-black ${
                currentGear === 0 ? 'text-emerald-400' : activeColor.textColor
              }`}
              style={{
                textShadow: currentGear === 0
                  ? '0 0 10px rgba(16, 185, 129, 0.8)'
                  : `0 0 10px rgba(${activeColor.glowRgb}, 0.8)`,
              }}
            >
              {currentGear === 0 ? 'N' : currentGear}
            </span>
          </div>

          {/* Gear Up / Down Shifter Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={shiftDown}
              className="p-1 rounded-md bg-[#0a0f1c] hover:bg-[#12192a] text-zinc-400 hover:text-white border border-[#1b253a] text-[9px] font-mono transition-all cursor-pointer active:scale-95"
              title="Shift Down Gear"
            >
              ▼
            </button>
            <button
              type="button"
              onClick={shiftUp}
              className="p-1 rounded-md bg-[#0a0f1c] hover:bg-[#12192a] text-zinc-400 hover:text-white border border-[#1b253a] text-[9px] font-mono transition-all cursor-pointer active:scale-95"
              title="Shift Up Gear"
            >
              ▲
            </button>
          </div>
        </div>
      </div>

      {/* 6. MULTI-INFORMATION DISPLAY (MID) INFO BAR WITH 'M' & 'S' BUTTONS */}
      <div className="relative z-10 flex items-center justify-between bg-[#04060c] px-3 py-2 rounded-2xl border border-[#141d2c] my-2 gap-2 flex-wrap">
        {/* Pulsar "M" (Mode) Handlebar / Meter Push Button */}
        <button
          type="button"
          onClick={cycleMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c1220] hover:bg-[#162138] border border-[#223048] text-white text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
          title="Press 'M' Button to Cycle Display Modes"
        >
          <span className="w-4 h-4 rounded-md bg-[#1a253a] flex items-center justify-center text-[10px] text-cyan-300 font-black">
            M
          </span>
          <span className="text-[11px] text-zinc-300">Mode:</span>
          <span className={`${activeColor.textColor} font-bold`}>{meterMode}</span>
        </button>

        {/* Dynamic Mode Readout Banner */}
        <div className="flex-1 text-center font-mono text-xs font-bold text-zinc-300">
          {meterMode === 'ODO' && (
            <span>ODO: <strong className="text-white">{odometer.toLocaleString()} km</strong> (Total Distance)</span>
          )}
          {meterMode === 'TRIP_A' && (
            <span>TRIP 1: <strong className="text-cyan-400">{stats.riddenSinceLast.toLocaleString()} km</strong> (Since Last Serv)</span>
          )}
          {meterMode === 'TRIP_B' && (
            <span>TRIP 2: <strong className="text-purple-400">{Math.round(stats.riddenSinceLast * 0.45).toLocaleString()} km</strong> (City Commute)</span>
          )}
          {meterMode === 'DTE' && (
            <span>DTE: <strong className="text-amber-400">{stats.remaining > 0 ? stats.remaining.toLocaleString() : '0'} km</strong> (Distance To Empty)</span>
          )}
          {meterMode === 'AFE' && (
            <span>AFE: <strong className="text-emerald-400">48.5 km/L</strong> (Avg Fuel Economy)</span>
          )}
          {meterMode === 'SERVICE' && (
            <span>NEXT TARGET: <strong className={activeColor.textColor}>{currentTarget.toLocaleString()} km</strong> ({stats.remaining.toLocaleString()} km left)</span>
          )}
        </div>

        {/* Pulsar "S" (Set) Push Button / Interactive Throttle Rev Trigger */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onMouseDown={() => setIsRevving(true)}
            onMouseUp={() => setIsRevving(false)}
            onTouchStart={() => setIsRevving(true)}
            onTouchEnd={() => setIsRevving(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 shadow-sm select-none ${
              isRevving
                ? 'bg-red-600 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                : 'bg-[#0c1220] hover:bg-[#162138] border-[#223048] text-amber-400'
            }`}
            title="Hold to Rev Engine & Test Tachometer Arc Sweep"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="text-[11px]">{isRevving ? 'REVVING...' : 'HOLD THROTTLE'}</span>
          </button>
        </div>
      </div>

      {/* 7. QUICK COLOR PALETTE SWATCH BAR & ADMIN CALIBRATION */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#141c2c] flex-wrap relative z-10">
        {/* Quick Color Swatch Quick-Pick Strip */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-zinc-500">Theme:</span>
          <div className="flex items-center gap-1 bg-[#05070d] px-2 py-1 rounded-xl border border-[#162032]">
            {(Object.keys(METER_COLORS) as MeterColorId[]).map((key) => {
              const c = METER_COLORS[key];
              const isSelected = activeColorId === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectColor(key)}
                  className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer border ${
                    isSelected
                      ? 'scale-125 border-white shadow-[0_0_8px_currentColor]'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: c.dotColor,
                    color: c.dotColor,
                  }}
                  title={c.name}
                />
              );
            })}
          </div>
        </div>

        {/* Quick Increment Chips */}
        {isAdmin ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-zinc-500 font-mono">Quick Add:</span>
            {[
              { val: 10, label: '+10' },
              { val: 25, label: '+25' },
              { val: 50, label: '+50' },
              { val: 100, label: '+100' },
            ].map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAdd(val)}
                className={`px-2 py-0.5 text-[11px] font-mono font-bold ${activeColor.textColor} bg-[#0a101c] hover:bg-[#121c30] border ${activeColor.accentBorder} rounded-lg transition-all cursor-pointer shadow-sm active:scale-95`}
                title={`Add ${val} km to current odometer`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
            <span>🔒 Odometer calibrated by Administrator</span>
          </div>
        )}
      </div>

      {/* 8. 3 SERVICE STATS BREAKDOWN SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-[#141c2c] mt-2 text-center relative z-10">
        <div className="p-2.5 rounded-xl bg-[#060912] border border-[#162032] shadow-sm">
          <span className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-0.5">
            LAST SERVICE
          </span>
          <div className="font-mono text-xs sm:text-sm font-bold text-white">
            {stats.lastKm.toLocaleString()}{' '}
            <span className="text-[10px] font-normal text-zinc-400">km</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#060912] border border-[#162032] shadow-sm">
          <span className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-0.5">
            NEXT TARGET
          </span>
          <div className={`font-mono text-xs sm:text-sm font-bold ${activeColor.textColor}`}>
            {stats.target.toLocaleString()}{' '}
            <span className="text-[10px] font-normal opacity-80">km</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#060912] border border-[#162032] shadow-sm">
          <span className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-0.5">
            REMAINING
          </span>
          <div
            className={`font-mono text-xs sm:text-sm font-bold ${
              stats.isOverdue
                ? 'text-red-400'
                : stats.isDueSoon
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {stats.isOverdue ? 'OVERDUE' : (
              <>
                {stats.remaining.toLocaleString()}{' '}
                <span className="text-[10px] font-normal opacity-80">km</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Odometer Modal */}
      {showOdoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#080c14] border border-[#202b40] rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
              <Edit3 className={`w-4 h-4 ${activeColor.textColor}`} />
              Update Odometer Reading
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter the latest total distance in kilometers displayed on your Pulsar N160 Infinity cluster.
            </p>
            <form onSubmit={handleSaveOdo}>
              <div className="mb-4">
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  CURRENT ODOMETER (KM)
                </label>
                <input
                  type="number"
                  min="0"
                  value={tempOdo}
                  onChange={(e) => setTempOdo(e.target.value)}
                  className={`w-full bg-[#04060c] border border-[#202b40] focus:${activeColor.accentBorder} rounded-xl px-4 py-3 text-lg font-mono ${activeColor.textColor} focus:outline-none`}
                  placeholder="e.g. 6135"
                  autoFocus
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOdoModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Save Odometer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Next Target Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#080c14] border border-[#202b40] rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
              <ArrowUpRight className={`w-4 h-4 ${activeColor.textColor}`} />
              Set Next Service Target
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter target kilometers for your upcoming service interval.
            </p>
            <form onSubmit={handleSaveTarget}>
              <div className="mb-4">
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  TARGET MILESTONE (KM)
                </label>
                <input
                  type="number"
                  min="1"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  className={`w-full bg-[#04060c] border border-[#202b40] focus:${activeColor.accentBorder} rounded-xl px-4 py-3 text-lg font-mono ${activeColor.textColor} focus:outline-none`}
                  placeholder="e.g. 7688"
                  autoFocus
                  required
                />
              </div>

              {/* Quick suggestions based on Bajaj service intervals */}
              <div className="mb-4">
                <span className="block text-[11px] text-zinc-400 mb-1.5 font-medium">
                  Standard Interval Milestones:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: '5th Serv (7,500 km)', km: 7500 },
                    { label: 'Manual (7,688 km)', km: 7688 },
                    { label: '6th Serv (10,000 km)', km: 10000 },
                    { label: '+2,500 km', km: odometer + 2500 },
                    { label: '+5,000 km', km: odometer + 5000 },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTempTarget(item.km.toString())}
                      className="px-2 py-1 text-[10px] font-mono bg-[#0c1220] hover:bg-[#162238] text-zinc-300 border border-[#1b263c] rounded-lg transition-colors text-center cursor-pointer"
                    >
                      {item.km.toLocaleString()} km
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTargetModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Set Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
