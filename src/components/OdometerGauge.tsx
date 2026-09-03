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
  Check,
  Droplet,
  Compass,
  Layers,
} from 'lucide-react';
import { calculateServiceStats, fmtKm } from '../utils/formatters';
import { ServiceRecord } from '../types';

export type MeterColorId = 'white' | 'cyan' | 'amber' | 'red' | 'green' | 'purple';

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
  hexCode: string;
}

export const METER_COLORS: Record<MeterColorId, MeterColorConfig> = {
  white: {
    id: 'white',
    name: 'Pulsar Ice OLED (OEM)',
    dotColor: '#e0f2fe',
    gradientStart: '#cbd5e1',
    gradientMid: '#e2e8f0',
    gradientEnd: '#f8fafc',
    glowRgb: '224, 242, 254',
    textColor: 'text-zinc-100',
    subtextColor: 'text-cyan-200',
    accentBg: 'bg-cyan-500/10',
    accentBorder: 'border-cyan-400/40',
    badgeBg: 'bg-cyan-950/80',
    badgeText: 'text-white',
    hexCode: '#e0f2fe',
  },
  cyan: {
    id: 'cyan',
    name: 'Pulsar Cyan (Electric)',
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
    hexCode: '#00e5ff',
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
    hexCode: '#f59e0b',
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
    hexCode: '#ef4444',
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
    hexCode: '#10b981',
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
    hexCode: '#a855f7',
  },
};

const COLOR_STORAGE_KEY = 'n160_meter_color_theme';
const CLUSTER_MODE_KEY = 'n160_meter_display_layout';

type DisplayMode = 'IFE' | 'ODO' | 'TRIP_A' | 'TRIP_B' | 'DTE' | 'AFE' | 'SERVICE';
type RidingMode = 'ROAD' | 'RAIN' | 'SPORT' | 'OFF-ROAD';

// Authentic 7-Segment Digit Renderer with skew and ghost segments
const SEGMENT_MAP: Record<string, boolean[]> = {
  // [a, b, c, d, e, f, g]
  '0': [true, true, true, true, true, true, false],
  '1': [false, true, true, false, false, false, false],
  '2': [true, true, false, true, true, false, true],
  '3': [true, true, true, true, false, false, true],
  '4': [false, true, true, false, false, true, true],
  '5': [true, false, true, true, false, true, true],
  '6': [true, false, true, true, true, true, true],
  '7': [true, true, true, false, false, false, false],
  '8': [true, true, true, true, true, true, true],
  '9': [true, true, true, true, false, true, true],
  '-': [false, false, false, false, false, false, true],
};

const LCDDigit: React.FC<{ digit: string; color: string; size?: 'lg' | 'md' | 'sm' }> = ({
  digit,
  color,
  size = 'lg',
}) => {
  const segs = SEGMENT_MAP[digit] || SEGMENT_MAP['-'];
  const width = size === 'lg' ? 62 : size === 'md' ? 36 : 22;
  const height = size === 'lg' ? 92 : size === 'md' ? 52 : 32;

  return (
    <svg
      viewBox="0 0 54 82"
      width={width}
      height={height}
      className="overflow-visible select-none drop-shadow-[0_0_8px_currentColor]"
      style={{ color }}
    >
      <g transform="skewX(-9) translate(6, 0)">
        {/* Segment a (top horizontal) */}
        <polygon
          points="8,4 42,4 37,11 13,11"
          fill={segs[0] ? color : '#070f1a'}
          opacity={segs[0] ? 1 : 0.12}
        />
        {/* Segment b (top-right vertical) */}
        <polygon
          points="43,5 49,11 44,38 38,34 42,12"
          fill={segs[1] ? color : '#070f1a'}
          opacity={segs[1] ? 1 : 0.12}
        />
        {/* Segment c (bottom-right vertical) */}
        <polygon
          points="43,44 48,47 43,76 37,70 41,47"
          fill={segs[2] ? color : '#070f1a'}
          opacity={segs[2] ? 1 : 0.12}
        />
        {/* Segment d (bottom horizontal) */}
        <polygon
          points="13,71 37,71 42,78 8,78"
          fill={segs[3] ? color : '#070f1a'}
          opacity={segs[3] ? 1 : 0.12}
        />
        {/* Segment e (bottom-left vertical) */}
        <polygon
          points="7,47 12,44 12,70 7,76 2,47"
          fill={segs[4] ? color : '#070f1a'}
          opacity={segs[4] ? 1 : 0.12}
        />
        {/* Segment f (top-left vertical) */}
        <polygon
          points="8,11 13,12 13,34 7,38 2,11"
          fill={segs[5] ? color : '#070f1a'}
          opacity={segs[5] ? 1 : 0.12}
        />
        {/* Segment g (center horizontal) */}
        <polygon
          points="11,38 39,38 43,41 39,44 11,44 7,41"
          fill={segs[6] ? color : '#070f1a'}
          opacity={segs[6] ? 1 : 0.12}
        />
      </g>
    </svg>
  );
};

interface OdometerGaugeProps {
  odometer: number;
  targets: number[];
  services: ServiceRecord[];
  isAdmin?: boolean;
  bikeName?: string;
  onUpdateOdometer: (newOdo: number) => void;
  onUpdateTarget: (newTarget: number) => void;
}

export const OdometerGauge: React.FC<OdometerGaugeProps> = ({
  odometer,
  targets,
  services,
  isAdmin = true,
  bikeName = 'PULSAR4904',
  onUpdateOdometer,
  onUpdateTarget,
}) => {
  const currentTarget = targets[0] || 7688;
  const stats = calculateServiceStats(services, odometer, currentTarget);

  // View layout mode: 'cockpit' (Exact user photo cluster) or 'arc'
  const [clusterLayout, setClusterLayout] = useState<'cockpit' | 'arc'>(() => {
    try {
      const saved = localStorage.getItem(CLUSTER_MODE_KEY);
      return saved === 'arc' ? 'arc' : 'cockpit';
    } catch {
      return 'cockpit';
    }
  });

  const handleSetClusterLayout = (mode: 'cockpit' | 'arc') => {
    setClusterLayout(mode);
    try {
      localStorage.setItem(CLUSTER_MODE_KEY, mode);
    } catch (e) {
      console.warn(e);
    }
  };

  // Modal states
  const [showOdoModal, setShowOdoModal] = useState(false);
  const [tempOdo, setTempOdo] = useState(odometer.toString());
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [tempTarget, setTempTarget] = useState(currentTarget.toString());
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showBikeTagModal, setShowBikeTagModal] = useState(false);
  const [customBikeTag, setCustomBikeTag] = useState<string>(() => {
    try {
      return localStorage.getItem('pulsar_custom_bike_tag') || bikeName || 'PULSAR4904';
    } catch {
      return bikeName || 'PULSAR4904';
    }
  });
  const [tempBikeTag, setTempBikeTag] = useState(customBikeTag);

  // Meter Mode state (Authentic Pulsar MID modes: IFE, ODO, TRIP A, TRIP B, DTE, AFE, SERVICE)
  const [meterMode, setMeterMode] = useState<DisplayMode>('IFE');
  const [ridingMode, setRidingMode] = useState<RidingMode>('ROAD');
  const [currentTime, setCurrentTime] = useState('');

  // Interactive Gear & Throttle simulator state
  const [currentGear, setCurrentGear] = useState<number>(0); // 0 = N, 1-5
  const [simulatedRpm, setSimulatedRpm] = useState<number>(1400); // 1.4k idle
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(0);
  const [isRevving, setIsRevving] = useState<boolean>(false);
  const [fuelBars, setFuelBars] = useState<number>(5); // 0-6 bars

  // Telltale indicators (can toggle or reflect live states)
  const [oilAlertActive, setOilAlertActive] = useState<boolean>(false);
  const [absLampActive, setAbsLampActive] = useState<boolean>(true);
  const [checkEngineActive, setCheckEngineActive] = useState<boolean>(true);
  const [ignOnBadge, setIgnOnBadge] = useState<boolean>(true);

  // Meter Color Theme state (persistent) - default 'white' (Pulsar Ice OLED from photo)
  const [activeColorId, setActiveColorId] = useState<MeterColorId>(() => {
    try {
      const saved = localStorage.getItem(COLOR_STORAGE_KEY) as MeterColorId;
      return saved && METER_COLORS[saved] ? saved : 'white';
    } catch {
      return 'white';
    }
  });

  const activeColor = METER_COLORS[activeColorId] || METER_COLORS.white;

  const handleSelectColor = (id: MeterColorId) => {
    setActiveColorId(id);
    setShowColorMenu(false);
    try {
      localStorage.setItem(COLOR_STORAGE_KEY, id);
    } catch (e) {
      console.warn('Could not save meter color:', e);
    }
  };

  // Real-time digital clock formatted authentic: e.g. "6:40 PM"
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minStr = minutes < 10 ? '0' + minutes : minutes;
      setCurrentTime(`${hours}:${minStr} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Throttle rev simulation animation
  const revAnimRef = useRef<number | null>(null);
  useEffect(() => {
    let targetRpm = isRevving
      ? currentGear === 0
        ? 9400
        : Math.min(10800, 2400 + currentGear * 1650)
      : 1400;

    let targetSpeed = isRevving
      ? currentGear === 0
        ? 0
        : Math.min(138, currentGear * 24 + 8)
      : currentGear === 0
      ? 0
      : Math.max(0, simulatedSpeed - 4);

    const step = () => {
      setSimulatedRpm((prev) => {
        const diff = targetRpm - prev;
        if (Math.abs(diff) < 30) return targetRpm;
        return prev + diff * 0.2;
      });

      setSimulatedSpeed((prev) => {
        const diff = targetSpeed - prev;
        if (Math.abs(diff) < 1) return targetSpeed;
        return Math.round(prev + diff * 0.16);
      });

      revAnimRef.current = requestAnimationFrame(step);
    };

    revAnimRef.current = requestAnimationFrame(step);
    return () => {
      if (revAnimRef.current) cancelAnimationFrame(revAnimRef.current);
    };
  }, [isRevving, currentGear, simulatedSpeed]);

  const isShiftWarning = simulatedRpm >= 9200;

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

  const handleSaveBikeTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tempBikeTag.trim().toUpperCase() || 'PULSAR4904';
    setCustomBikeTag(clean);
    try {
      localStorage.setItem('pulsar_custom_bike_tag', clean);
    } catch {}
    setShowBikeTagModal(false);
  };

  // Cycle through MID display modes (Authentic "M" Mode Button)
  const cycleMode = () => {
    const modes: DisplayMode[] = ['IFE', 'ODO', 'TRIP_A', 'TRIP_B', 'DTE', 'AFE', 'SERVICE'];
    const idx = modes.indexOf(meterMode);
    setMeterMode(modes[(idx + 1) % modes.length]);
  };

  // Cycle Riding mode: ROAD -> RAIN -> SPORT -> OFF-ROAD
  const cycleRidingMode = () => {
    const modes: RidingMode[] = ['ROAD', 'RAIN', 'SPORT', 'OFF-ROAD'];
    const idx = modes.indexOf(ridingMode);
    setRidingMode(modes[(idx + 1) % modes.length]);
  };

  // Gear shifter
  const shiftUp = () => {
    setCurrentGear((prev) => Math.min(5, prev + 1));
  };
  const shiftDown = () => {
    setCurrentGear((prev) => Math.max(0, prev - 1));
  };

  // Tachometer calculation for 12,000 RPM bar
  const rpmRatio = Math.min(Math.max(simulatedRpm / 12000, 0), 1);
  const totalTachoBars = 24;
  const litBars = Math.round(rpmRatio * totalTachoBars);

  // Speedometer digits string
  const speedStr = isRevving ? simulatedSpeed.toString() : '0';

  // Odometer formatted with authentic spacing, e.g. "6 186 km"
  const formattedOdo = odometer.toLocaleString('en-US').replace(/,/g, ' ');

  return (
    <div className="relative bg-[#020509] border border-[#161c28] rounded-[2.25rem] p-3 sm:p-5 shadow-[0_24px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col justify-between group select-none">
      
      {/* 1. CARBON TEXTURE & ATMOSPHERIC BACKDROP */}
      <div className="absolute inset-0 bg-[radial-gradient(#1b2436_1px,transparent_1px)] [background-size:12px_12px] opacity-25 pointer-events-none" />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[220px] blur-[90px] pointer-events-none rounded-full opacity-20 transition-all duration-700"
        style={{ backgroundColor: activeColor.dotColor }}
      />

      {/* 2. TOP UTILITY HEADER: BRANDING, LAYOUT TOGGLE & THEME PICKER */}
      <div className="relative z-10 flex items-center justify-between pb-3 mb-2 border-b border-[#121824] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#070b14] border border-[#1a2436] shadow-sm">
            <span className="font-orbitron font-black text-xs sm:text-sm tracking-widest text-white uppercase">
              BAJAJ
            </span>
            <span className="w-1 h-1 rounded-full bg-red-500" />
            <span className={`font-orbitron font-black text-xs sm:text-sm tracking-widest uppercase ${activeColor.textColor}`}>
              PULSAR N160
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleSetClusterLayout(clusterLayout === 'cockpit' ? 'arc' : 'cockpit')}
            className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-xl bg-[#090e18] hover:bg-[#131b2c] text-zinc-300 border border-[#1d273a] transition-all cursor-pointer shadow-sm active:scale-95"
            title="Toggle between Cockpit Cluster and Classic Arc"
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>{clusterLayout === 'cockpit' ? 'Photo Cluster View' : 'Arc Sweeper View'}</span>
          </button>
        </div>

        {/* Action Buttons: Color Theme, Edit Odo & Set Target */}
        <div className="flex items-center gap-2 relative">
          {/* Theme Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorMenu(!showColorMenu)}
              className="px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white bg-[#080c16] hover:bg-[#12192a] border border-[#1c2638] rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Change Meter Backlight Color"
            >
              <span
                className="w-3 h-3 rounded-full border border-white/60 shadow-sm"
                style={{ backgroundColor: activeColor.dotColor }}
              />
              <span className="text-[11px] font-mono hidden xs:inline">{activeColor.name.split(' ')[0]}</span>
            </button>

            {showColorMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#070b14] border border-[#1e2a3e] rounded-2xl p-2 shadow-2xl z-40 animate-in fade-in zoom-in-95">
                <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5 border-b border-[#141d2c] mb-1">
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
                            ? 'bg-[#121a28] text-white border border-[#27364e]'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#0c121e]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                            style={{ backgroundColor: c.dotColor }}
                          />
                          <span className={isSelected ? 'font-bold text-white' : ''}>
                            {c.name}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
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
                className={`px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white bg-[#080c16] hover:bg-[#12192a] border border-[#1c2638] rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95`}
                title="Edit Current Odometer Value"
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
                className={`px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white bg-[#080c16] hover:bg-[#12192a] border border-[#1c2638] rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95`}
                title="Set Next Target Km"
              >
                <span className="text-[11px] text-zinc-400">Target:</span>
                <span className={`${activeColor.textColor} font-mono font-bold text-[11px]`}>
                  {currentTarget.toLocaleString()}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. AUTHENTIC DIGITAL COCKPIT INSTRUMENT CONSOLE (EXACT FROM USER'S PHOTO)  */}
      {/* ========================================================================= */}
      {clusterLayout === 'cockpit' ? (
        <div className="relative my-2 z-10">
          
          {/* OUTER MOTORCYCLE INSTRUMENT HOUSING WITH FACETED WINGS */}
          <div className="relative bg-gradient-to-b from-[#0a0f18] via-[#05080e] to-[#020408] border-2 border-[#182234] rounded-[2.5rem] p-3 sm:p-5 shadow-[inset_0_1px_4px_rgba(255,255,255,0.08),0_15px_40px_rgba(0,0,0,0.9)] overflow-hidden">
            
            {/* Top Center Ignition Accent Lamp */}
            <div className="flex items-center justify-between px-3 sm:px-6 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1e2738] border border-zinc-600/60 shadow-inner flex items-center justify-center text-[7px] text-zinc-500 font-mono">
                  +
                </div>
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest hidden sm:inline">
                  Cockpit Telemetry
                </span>
              </div>

              {/* Center Ambient Light Sensor Notch & IGN ON Lamp */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-2 rounded-full bg-[#03060c] border border-zinc-800 shadow-inner" />
                <button
                  type="button"
                  onClick={() => setIgnOnBadge(!ignOnBadge)}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer border ${
                    ignOnBadge
                      ? 'bg-red-600/90 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                      : 'bg-zinc-900 text-zinc-600 border-zinc-800'
                  }`}
                  title="Toggle Ignition Lamp"
                >
                  <Zap className="w-2.5 h-2.5 fill-current" />
                  <span>IGN ON</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest hidden sm:inline">
                  Multi-LCD
                </span>
                <div className="w-2.5 h-2.5 rounded-full bg-[#1e2738] border border-zinc-600/60 shadow-inner flex items-center justify-center text-[7px] text-zinc-500 font-mono">
                  +
                </div>
              </div>
            </div>

            {/* MAIN CLUSTER GRID: LEFT POD (OIL + N) | CENTER LCD SCREEN | RIGHT POD (ABS + ENGINE) */}
            <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center">
              
              {/* ------------------------------------------------------------- */}
              {/* LEFT WING POD: OIL PRESSURE LAMP & NEUTRAL [N] INDICATOR      */}
              {/* ------------------------------------------------------------- */}
              <div className="col-span-2 sm:col-span-2 flex flex-col items-center justify-center gap-4 py-2">
                {/* 1. RED OIL CAN WARNING LAMP (Far left in photo) */}
                <button
                  type="button"
                  onClick={() => setOilAlertActive(!oilAlertActive)}
                  className={`p-2 sm:p-2.5 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center border group/lamp ${
                    oilAlertActive || stats.isOverdue
                      ? 'bg-red-950/80 border-red-500 text-red-400 shadow-[0_0_18px_rgba(239,68,68,0.85)] animate-pulse'
                      : 'bg-[#060a12] border-[#141b2a] text-red-950 hover:text-red-800 hover:border-red-900/60'
                  }`}
                  title="Low Engine Oil / Pressure Warning Indicator (Click to toggle)"
                >
                  {/* Custom Oil Can Icon representation */}
                  <div className="relative flex items-center justify-center">
                    <Droplet className={`w-5 h-5 sm:w-6 sm:h-6 fill-current ${oilAlertActive || stats.isOverdue ? 'text-red-400' : 'text-zinc-800'}`} />
                  </div>
                  <span className={`text-[8px] font-mono font-bold mt-1 tracking-tighter ${oilAlertActive || stats.isOverdue ? 'text-red-300' : 'text-zinc-700'}`}>
                    OIL
                  </span>
                </button>

                {/* 2. BRIGHT GLOWING GREEN [N] NEUTRAL INDICATOR (Photo highlight) */}
                <button
                  type="button"
                  onClick={() => setCurrentGear(currentGear === 0 ? 1 : 0)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-orbitron font-black text-xl sm:text-2xl transition-all cursor-pointer border ${
                    currentGear === 0
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.9)] scale-105 ring-2 ring-emerald-500/50'
                      : 'bg-[#050910] text-zinc-800 border-[#121927]'
                  }`}
                  title="Neutral Lamp (Click or use Shifter to toggle)"
                >
                  <span className={currentGear === 0 ? 'drop-shadow-[0_0_10px_#34d399]' : ''}>N</span>
                  <span className={`text-[7px] font-mono tracking-widest -mt-1 ${currentGear === 0 ? 'text-emerald-400' : 'text-zinc-800'}`}>
                    NEUTRAL
                  </span>
                </button>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* CENTER LCD DISPLAY: SPEEDO, TACHOMETER, ODOMETER & FUEL       */}
              {/* ------------------------------------------------------------- */}
              <div className="col-span-8 sm:col-span-8 relative">
                
                {/* ANGLED LCD CONSOLE INNER SHROUD & BORDER GLOW */}
                <div
                  className="relative bg-[#020409] border-2 rounded-2xl p-2.5 sm:p-4 shadow-[inset_0_0_25px_rgba(0,0,0,0.95)] overflow-hidden"
                  style={{
                    borderColor: `${activeColor.hexCode}40`,
                    boxShadow: `0 0 20px ${activeColor.hexCode}20, inset 0 0 20px rgba(0,0,0,0.9)`,
                  }}
                >
                  {/* Subtle LCD Scanline Pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] [background-size:100%_4px] opacity-15 pointer-events-none" />

                  {/* --------------------------------------------------------- */}
                  {/* A. TACHOMETER (RPM BAR GRAPH: 0 - 12 x 1000 RPM)          */}
                  {/* --------------------------------------------------------- */}
                  <div className="relative mb-2">
                    {/* Tachometer Tick Marks & Number Labels */}
                    <div className="flex items-end justify-between text-[9px] sm:text-[10px] font-orbitron font-bold text-zinc-400 px-1 mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-mono text-zinc-500">X1000rpm</span>
                      </div>
                      <div className="flex items-center justify-between flex-1 pl-3 sm:pl-5 pr-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((rpm) => (
                          <span
                            key={rpm}
                            className={`font-orbitron font-bold text-[9px] sm:text-[10px] transition-colors ${
                              simulatedRpm >= rpm * 1000
                                ? rpm >= 11
                                  ? 'text-red-400 drop-shadow-[0_0_6px_#ef4444]'
                                  : rpm >= 9
                                  ? 'text-amber-400 drop-shadow-[0_0_6px_#f59e0b]'
                                  : 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                                : 'text-zinc-600'
                            }`}
                          >
                            {rpm}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Progressive Segmented Tachometer Sweeping Bar */}
                    <div className="flex items-center gap-[2px] sm:gap-1 w-full bg-[#050912] p-1 rounded-md border border-[#141d2e]">
                      {Array.from({ length: totalTachoBars }).map((_, idx) => {
                        const isLit = idx < litBars;
                        const isRedline = idx >= 20; // 10k-12k
                        const isAmberZone = idx >= 16 && idx < 20; // 8k-10k

                        return (
                          <div
                            key={idx}
                            className={`flex-1 h-3 sm:h-4 rounded-[1.5px] transition-all duration-75 ${
                              isLit
                                ? isRedline
                                  ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                                  : isAmberZone
                                  ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                                  : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                                : 'bg-[#080d1a]'
                            }`}
                            style={{
                              backgroundColor: isLit
                                ? isRedline
                                  ? '#ef4444'
                                  : isAmberZone
                                  ? '#f59e0b'
                                  : activeColor.hexCode
                                : undefined,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* --------------------------------------------------------- */}
                  {/* B. SUB-BAR: TIME 6:40 PM | NAVIGATION | PULSAR4904       */}
                  {/* --------------------------------------------------------- */}
                  <div className="flex items-center justify-between px-1 pb-1 mb-2 border-b border-[#101826] text-xs font-mono">
                    {/* Live Clock (Left) */}
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
                        TIME
                      </span>
                      <span className="font-orbitron font-bold text-xs sm:text-sm text-white tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">
                        {currentTime || '6:40 PM'}
                      </span>
                    </div>

                    {/* Navigation & Bike Tag / Plate (Right) */}
                    <div className="flex flex-col items-end">
                      <span className="text-[7px] sm:text-[8px] font-mono tracking-widest text-zinc-500 uppercase">
                        NAVIGATION
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempBikeTag(customBikeTag);
                          setShowBikeTagModal(true);
                        }}
                        className="font-orbitron font-black italic text-xs sm:text-sm tracking-wider text-white hover:text-cyan-300 transition-colors drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] cursor-pointer"
                        title="Click to customize Bike Bluetooth Tag / Plate"
                      >
                        {customBikeTag}
                      </button>
                    </div>
                  </div>

                  {/* --------------------------------------------------------- */}
                  {/* C. CENTER STAGE: GEAR BOX + GIANT SPEEDO + FUEL GAUGE     */}
                  {/* --------------------------------------------------------- */}
                  <div className="grid grid-cols-12 gap-2 items-center my-1">
                    
                    {/* LEFT SUB-WING: GEAR POSITION + FUEL GAUGE */}
                    <div className="col-span-4 sm:col-span-3 flex flex-col justify-between h-full py-1">
                      
                      {/* Authentic Bracketed Gear Position Box */}
                      <div className="flex flex-col items-center">
                        <div
                          className="relative px-3 py-1.5 rounded-lg border border-dashed border-zinc-700/80 bg-[#060a14]/90 flex flex-col items-center justify-center min-w-[54px]"
                          style={{
                            boxShadow: `0 0 12px ${currentGear === 0 ? 'rgba(52,211,153,0.3)' : `${activeColor.hexCode}20`}`,
                          }}
                        >
                          {/* Corner Brackets */}
                          <div className="absolute top-0.5 left-0.5 text-[8px] text-zinc-500 leading-none font-mono">
                            ┌
                          </div>
                          <div className="absolute top-0.5 right-0.5 text-[8px] text-zinc-500 leading-none font-mono">
                            ┐
                          </div>
                          <div className="absolute bottom-0.5 left-0.5 text-[8px] text-zinc-500 leading-none font-mono">
                            └
                          </div>
                          <div className="absolute bottom-0.5 right-0.5 text-[8px] text-zinc-500 leading-none font-mono">
                            ┘
                          </div>

                          <span
                            className={`font-orbitron font-black text-2xl sm:text-3xl leading-none ${
                              currentGear === 0
                                ? 'text-emerald-300 drop-shadow-[0_0_10px_#34d399]'
                                : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]'
                            }`}
                          >
                            {currentGear === 0 ? 'N' : currentGear}
                          </span>
                        </div>
                        <span className="text-[8px] font-mono font-bold tracking-widest text-zinc-400 mt-0.5">
                          GEAR
                        </span>
                      </div>

                      {/* Authentic Pulsar Horizontal Fuel Bar Gauge */}
                      <div className="mt-3 pt-2 border-t border-[#121b2b]">
                        <div className="flex items-center justify-between text-[8px] font-mono font-bold text-zinc-400 mb-1">
                          <div className="flex items-center gap-1">
                            <Fuel className="w-3 h-3 text-zinc-400" />
                            <span className="text-[7px]">FUEL</span>
                          </div>
                          <span>F</span>
                        </div>

                        {/* 6 Segment Horizontal Fuel Bars */}
                        <div className="flex items-center gap-1 bg-[#060a12] p-1 rounded-md border border-[#152034]">
                          {[1, 2, 3, 4, 5, 6].map((bar) => {
                            const isFilled = fuelBars >= bar;
                            return (
                              <button
                                key={bar}
                                type="button"
                                onClick={() => setFuelBars(bar)}
                                className={`flex-1 h-3 rounded-[1px] transition-all cursor-pointer ${
                                  isFilled
                                    ? bar <= 1
                                      ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                                      : 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                                    : 'bg-[#09101e]'
                                }`}
                                style={{
                                  backgroundColor: isFilled
                                    ? bar <= 1
                                      ? '#f59e0b'
                                      : activeColor.hexCode
                                    : undefined,
                                }}
                                title={`Set fuel level: ${bar}/6`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 mt-0.5">
                          <span>E</span>
                          <span>{Math.round((fuelBars / 6) * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* CENTER STAGE: GIANT SLANTED 7-SEGMENT SPEEDOMETER */}
                    <div className="col-span-8 sm:col-span-9 flex flex-col items-center justify-center relative py-2">
                      <div className="flex items-baseline justify-center gap-2 sm:gap-3">
                        {/* 7-Segment SVG Speed Numerals */}
                        <div className="flex items-center justify-center">
                          {speedStr.split('').map((char, i) => (
                            <LCDDigit
                              key={i}
                              digit={char}
                              color={activeColor.hexCode}
                              size="lg"
                            />
                          ))}
                        </div>

                        {/* Km/h Slanted Unit (Right of speed number) */}
                        <div className="flex flex-col">
                          <span
                            className="font-orbitron font-black italic text-base sm:text-xl text-white tracking-tight"
                            style={{
                              textShadow: `0 0 10px ${activeColor.hexCode}`,
                            }}
                          >
                            Km/h
                          </span>
                        </div>
                      </div>

                      {/* Underline Shelf Accent */}
                      <div
                        className="w-3/4 max-w-[200px] h-[3px] rounded-full mt-2"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${activeColor.hexCode}, transparent)`,
                          boxShadow: `0 0 10px ${activeColor.hexCode}`,
                        }}
                      />
                    </div>
                  </div>

                  {/* --------------------------------------------------------- */}
                  {/* D. BOTTOM ROW: ODO 6 186 km | ROAD | IFE ------ km/L     */}
                  {/* --------------------------------------------------------- */}
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#121c2d] flex-wrap gap-2 text-xs font-mono">
                    
                    {/* Odometer Readout (Left) */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-[11px] font-orbitron font-black uppercase text-zinc-400">
                        ODO
                      </span>
                      <span className="font-orbitron font-black text-sm sm:text-base text-white tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
                        {formattedOdo}{' '}
                        <span className="text-[11px] font-normal text-zinc-400 font-sans">km</span>
                      </span>
                    </div>

                    {/* Center Riding Mode Badge (Clickable) */}
                    <button
                      type="button"
                      onClick={cycleRidingMode}
                      className="px-2.5 py-0.5 rounded-md bg-[#070d18] border border-cyan-500/40 text-[10px] font-orbitron font-black text-white hover:border-cyan-400 transition-all cursor-pointer shadow-[0_0_8px_rgba(34,211,238,0.3)] active:scale-95"
                      title="Click to toggle Riding Mode (ROAD / RAIN / SPORT / OFF-ROAD)"
                    >
                      {ridingMode}
                    </button>

                    {/* Instant Fuel Economy / MID Info (Right) */}
                    <button
                      type="button"
                      onClick={cycleMode}
                      className="flex flex-col items-end text-right transition-colors cursor-pointer group/mid"
                      title="Click or press 'M' to cycle display (IFE, TRIP, DTE, AFE, SERVICE)"
                    >
                      <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider group-hover/mid:text-cyan-300">
                        {meterMode === 'IFE' ? 'km/L' : meterMode}
                      </span>
                      <span className="font-orbitron font-bold text-xs sm:text-sm text-white tracking-wider drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]">
                        {meterMode === 'IFE' && (simulatedSpeed > 0 ? `${(42.5 + simulatedSpeed * 0.1).toFixed(1)}` : 'IFE ------')}
                        {meterMode === 'ODO' && `${odometer.toLocaleString()} km`}
                        {meterMode === 'TRIP_A' && `TRIP 1  ${stats.riddenSinceLast.toLocaleString()} km`}
                        {meterMode === 'TRIP_B' && `TRIP 2  ${Math.round(stats.riddenSinceLast * 0.45).toLocaleString()} km`}
                        {meterMode === 'DTE' && `DTE  ${stats.remaining > 0 ? stats.remaining.toLocaleString() : '0'} km`}
                        {meterMode === 'AFE' && 'AFE  48.5 km/L'}
                        {meterMode === 'SERVICE' && `SRV  ${currentTarget.toLocaleString()} km`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* RIGHT WING POD: AMBER (ABS) RING & AMBER CHECK ENGINE (MIL)   */}
              {/* ------------------------------------------------------------- */}
              <div className="col-span-2 sm:col-span-2 flex flex-col items-center justify-center gap-4 py-2">
                {/* 1. AMBER (ABS) INDICATOR LAMP */}
                <button
                  type="button"
                  onClick={() => setAbsLampActive(!absLampActive)}
                  className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex flex-col items-center justify-center font-orbitron font-black text-xs sm:text-sm transition-all cursor-pointer border ${
                    absLampActive
                      ? 'bg-amber-950/80 text-amber-300 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.85)] ring-2 ring-amber-500/40'
                      : 'bg-[#060a12] text-zinc-800 border-[#141b2a]'
                  }`}
                  title="Dual-Channel ABS Status Lamp (Click to toggle)"
                >
                  <span className={absLampActive ? 'drop-shadow-[0_0_8px_#f59e0b]' : ''}>ABS</span>
                  <span className={`text-[6px] font-mono tracking-tighter -mt-0.5 ${absLampActive ? 'text-amber-400' : 'text-zinc-800'}`}>
                    ACTIVE
                  </span>
                </button>

                {/* 2. AMBER CHECK ENGINE / MALFUNCTION INDICATOR (MIL) */}
                <button
                  type="button"
                  onClick={() => setCheckEngineActive(!checkEngineActive)}
                  className={`p-2 sm:p-2.5 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center border ${
                    checkEngineActive
                      ? 'bg-amber-950/80 border-amber-500 text-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.85)]'
                      : 'bg-[#060a12] border-[#141b2a] text-zinc-800'
                  }`}
                  title="Malfunction Indicator Lamp (MIL / Engine Check - Click to toggle)"
                >
                  {/* Engine Silhouette Icon */}
                  <div className="relative flex items-center justify-center">
                    <Wrench className={`w-5 h-5 sm:w-6 sm:h-6 fill-current ${checkEngineActive ? 'text-amber-400' : 'text-zinc-800'}`} />
                  </div>
                  <span className={`text-[8px] font-mono font-bold mt-1 tracking-tighter ${checkEngineActive ? 'text-amber-300' : 'text-zinc-700'}`}>
                    CHECK
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* FALLBACK VIEW: CLASSIC SWEEPING ARC DIAL MODE                             */
        /* ========================================================================= */
        <div className="relative my-2 z-10 bg-[#03060c] p-4 rounded-2xl border border-[#162034]">
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 220 135" className="w-full max-w-[280px]">
              <path
                d="M 20 120 A 90 90 0 0 1 200 120"
                fill="none"
                stroke="#0b101c"
                strokeWidth="15"
                strokeLinecap="round"
              />
              <path
                d="M 20 120 A 90 90 0 0 1 200 120"
                fill="none"
                stroke={activeColor.hexCode}
                strokeWidth="15"
                strokeLinecap="round"
                strokeDasharray={283}
                strokeDashoffset={283 - 283 * (simulatedRpm / 10000)}
                style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
              />
            </svg>
            <div className="absolute text-center">
              <span className="font-orbitron text-4xl font-black text-white block">
                {isRevving ? simulatedSpeed : odometer.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest">
                {isRevving ? 'KM / H SPEED' : 'ODOMETER KM'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. COCKPIT CONTROLS: "M" (MODE), "S" (SET / REV), SHIFTER & QUICK INCREMENTS */}
      <div className="relative z-10 flex items-center justify-between bg-[#04060c] px-3 py-2 rounded-2xl border border-[#141d2c] my-2 gap-2 flex-wrap">
        
        {/* Pulsar Physical "M" (Mode) Handlebar Button */}
        <button
          type="button"
          onClick={cycleMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a0f1c] hover:bg-[#141d30] border border-[#202b3e] text-white text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
          title="Press 'M' Button to Cycle LCD Mode"
        >
          <span className="w-4 h-4 rounded-md bg-[#182338] flex items-center justify-center text-[10px] text-cyan-300 font-black">
            M
          </span>
          <span className="text-[11px] text-zinc-400">Mode:</span>
          <span className={`${activeColor.textColor} font-bold`}>{meterMode}</span>
        </button>

        {/* Gear Shifter Buttons */}
        <div className="flex items-center gap-1.5 bg-[#070c16] px-2.5 py-1 rounded-xl border border-[#182338]">
          <span className="text-[10px] font-mono text-zinc-500">Gear:</span>
          <button
            type="button"
            onClick={shiftDown}
            className="px-2 py-0.5 rounded-md bg-[#0d1424] hover:bg-[#18243c] text-zinc-300 hover:text-white border border-[#202e48] text-xs font-bold transition-all cursor-pointer active:scale-95"
            title="Shift Down (▼)"
          >
            ▼
          </button>
          <span className="font-orbitron font-black text-sm text-white px-1">
            {currentGear === 0 ? 'N' : currentGear}
          </span>
          <button
            type="button"
            onClick={shiftUp}
            className="px-2 py-0.5 rounded-md bg-[#0d1424] hover:bg-[#18243c] text-zinc-300 hover:text-white border border-[#202e48] text-xs font-bold transition-all cursor-pointer active:scale-95"
            title="Shift Up (▲)"
          >
            ▲
          </button>
        </div>

        {/* Pulsar "S" (Set) / Hold Throttle Rev Trigger */}
        <button
          type="button"
          onMouseDown={() => setIsRevving(true)}
          onMouseUp={() => setIsRevving(false)}
          onTouchStart={() => setIsRevving(true)}
          onTouchEnd={() => setIsRevving(false)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 shadow-sm select-none ${
            isRevving
              ? 'bg-red-600 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.8)]'
              : 'bg-[#0a0f1c] hover:bg-[#141d30] border-[#202b3e] text-amber-400'
          }`}
          title="Hold to Rev Engine & Test Tachometer Sweep"
        >
          <span className="w-4 h-4 rounded-md bg-[#182338] flex items-center justify-center text-[10px] text-amber-300 font-black">
            S
          </span>
          <Flame className="w-3.5 h-3.5" />
          <span className="text-[11px]">{isRevving ? 'REVVING...' : 'HOLD THROTTLE'}</span>
        </button>
      </div>

      {/* 5. QUICK INCREMENT CHIPS & CALIBRATION BAR */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#121a28] flex-wrap relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-zinc-500">Backlight:</span>
          <div className="flex items-center gap-1 bg-[#05070d] px-2 py-1 rounded-xl border border-[#141c2c]">
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

        {/* Quick Add Km Chips */}
        {isAdmin && (
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
                className={`px-2 py-0.5 text-[11px] font-mono font-bold ${activeColor.textColor} bg-[#080e1a] hover:bg-[#121c2e] border ${activeColor.accentBorder} rounded-lg transition-all cursor-pointer shadow-sm active:scale-95`}
                title={`Add ${val} km to current odometer`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 6. SERVICE STATS BREAKDOWN SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-[#121a28] mt-2 text-center relative z-10">
        <div className="p-2.5 rounded-xl bg-[#060912] border border-[#141c2c] shadow-sm">
          <span className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-0.5">
            LAST SERVICE
          </span>
          <div className="font-mono text-xs sm:text-sm font-bold text-white">
            {stats.lastKm.toLocaleString()}{' '}
            <span className="text-[10px] font-normal text-zinc-400">km</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#060912] border border-[#141c2c] shadow-sm">
          <span className="block text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-0.5">
            NEXT TARGET
          </span>
          <div className={`font-mono text-xs sm:text-sm font-bold ${activeColor.textColor}`}>
            {stats.target.toLocaleString()}{' '}
            <span className="text-[10px] font-normal opacity-80">km</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#060912] border border-[#141c2c] shadow-sm">
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
            {stats.isOverdue ? (
              'OVERDUE'
            ) : (
              <>
                {stats.remaining.toLocaleString()}{' '}
                <span className="text-[10px] font-normal opacity-80">km</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: EDIT ODOMETER READING                                 */}
      {/* ============================================================== */}
      {showOdoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#080c14] border border-[#202b40] rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-orbitron font-bold text-lg text-white mb-2 flex items-center gap-2">
              <Edit3 className={`w-4 h-4 ${activeColor.textColor}`} />
              Update Odometer Reading
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter the latest total distance in kilometers displayed on your Pulsar N160 cluster.
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
                  placeholder="e.g. 6186"
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

      {/* ============================================================== */}
      {/* MODAL 2: SET NEXT SERVICE TARGET                               */}
      {/* ============================================================== */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#080c14] border border-[#202b40] rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-orbitron font-bold text-lg text-white mb-2 flex items-center gap-2">
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

      {/* ============================================================== */}
      {/* MODAL 3: EDIT BIKE BLUETOOTH / NAVIGATION TAG                  */}
      {/* ============================================================== */}
      {showBikeTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#080c14] border border-[#202b40] rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-orbitron font-bold text-lg text-white mb-2 flex items-center gap-2">
              <Compass className={`w-4 h-4 ${activeColor.textColor}`} />
              Customize Console Header Tag
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter your bike&apos;s Bluetooth ID, console name, or registration plate (as shown under NAVIGATION in the cluster).
            </p>
            <form onSubmit={handleSaveBikeTag}>
              <div className="mb-4">
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  CONSOLE / BIKE IDENTIFIER
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={tempBikeTag}
                  onChange={(e) => setTempBikeTag(e.target.value.toUpperCase())}
                  className={`w-full bg-[#04060c] border border-[#202b40] focus:${activeColor.accentBorder} rounded-xl px-4 py-3 text-lg font-orbitron font-black text-white focus:outline-none`}
                  placeholder="e.g. PULSAR4904"
                  autoFocus
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBikeTagModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Save Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
