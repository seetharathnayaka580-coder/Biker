import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ShieldCheck, Cpu, CheckCircle2, ChevronRight, Gauge, Volume2, Sparkles } from 'lucide-react';

interface AppSplashScreenProps {
  onComplete: () => void;
  regNo?: string;
  modelName?: string;
}

// Synthetic throttle exhaust note synthesizer using Web Audio API
const playEngineThrum = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Low single-cylinder 165cc rumble oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(48, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.35);
    osc.frequency.exponentialRampToValueAtTime(65, ctx.currentTime + 0.9);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.9);
  } catch {
    // Graceful fallback if audio blocked by autoplay policy
  }
};

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onComplete,
  regNo = 'BKT-1374',
  modelName = 'BAJAJ PULSAR N160',
}) => {
  const [progress, setProgress] = useState(0);
  const [rpm, setRpm] = useState(1200);
  const [stepIndex, setStepIndex] = useState(0);
  const [isLightFlashed, setIsLightFlashed] = useState(false);

  const steps = [
    { text: 'DTS-i TWIN-SPARK ECU BOOT', icon: Cpu, desc: 'Dual-Spark Ignition Synced' },
    { text: 'BI-LED PROJECTOR & DRL CHECK', icon: Zap, desc: 'Wolf-Eye Beams Calibrated' },
    { text: 'DUAL-CHANNEL ABS ONLINE', icon: ShieldCheck, desc: 'Bosch 9.1M Sensors Ready' },
    { text: 'FIRESTORE CLOUD TELEMETRY SYNC', icon: Gauge, desc: 'Encrypted Records Loaded' },
    { text: 'DIAGNOSTICS PASSED • SYSTEM ARMED', icon: CheckCircle2, desc: 'Ready for the Ride' },
  ];

  useEffect(() => {
    // Initial gentle throttle rumble
    const audioTimeout = setTimeout(() => {
      playEngineThrum();
    }, 400);

    const duration = 2400; // 2.4 seconds total sequence
    const intervalTime = 40;
    const totalSteps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentPct = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setProgress(currentPct);

      // Dynamic Tachometer RPM simulation (1200 idle -> 8500 rev -> 2000 cruise)
      if (currentPct < 30) {
        setRpm(Math.round(1200 + (currentPct / 30) * 4500));
      } else if (currentPct < 65) {
        setRpm(Math.round(5700 + Math.sin(currentPct) * 800));
      } else {
        setRpm(Math.round(6500 - ((currentPct - 65) / 35) * 4800));
      }

      if (currentPct < 22) setStepIndex(0);
      else if (currentPct < 45) {
        setStepIndex(1);
        setIsLightFlashed(true);
      }
      else if (currentPct < 70) setStepIndex(2);
      else if (currentPct < 90) setStepIndex(3);
      else setStepIndex(4);

      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 350);
      }
    }, intervalTime);

    return () => {
      clearInterval(timer);
      clearTimeout(audioTimeout);
    };
  }, [onComplete]);

  const CurrentIcon = steps[stepIndex].icon;

  const handleManualRev = () => {
    playEngineThrum();
    setRpm(8200);
    setTimeout(() => setRpm(2100), 500);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 bg-[#07090e] text-white flex flex-col items-center justify-center p-4 select-none overflow-hidden"
    >
      {/* Background High-Tech Atmospheric Glow & Radial Grids */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-cyan-500/15 via-amber-500/10 to-transparent rounded-full blur-3xl opacity-70" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(245, 158, 11, 0.3) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="w-full max-w-sm sm:max-w-md relative z-10 flex flex-col items-center">
        
        {/* Top Mini Plate Pill & RPM Tachometer Tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-3 w-full justify-between px-1"
        >
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase shadow-sm">
              {modelName}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-black tracking-wider text-amber-300 shadow-sm">
              {regNo}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#121622] border border-zinc-700 text-[10px] font-mono text-zinc-400">
            <span className="text-cyan-400 font-bold tabular-nums">{rpm}</span>
            <span className="text-[8px] text-zinc-500">RPM</span>
          </div>
        </motion.div>

        {/* Central Motorcycle Card (Matching Video Layout with High Definition Photo Asset) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleManualRev}
          className="w-full relative rounded-3xl bg-gradient-to-b from-[#141926] via-[#0d1018] to-[#07090e] border border-amber-500/40 p-4 sm:p-5 shadow-2xl shadow-black/90 flex flex-col items-center overflow-hidden cursor-pointer group"
          title="Click to Rev Engine"
        >
          {/* Top Metallic Bevel Edge */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50" />

          {/* Subtle Card Ambient Glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Motorcycle Illustration / Photo Image Asset */}
          <div className="relative w-full aspect-[4/3] max-h-56 sm:max-h-64 flex items-center justify-center">
            <img
              src="/pulsar_n160.svg"
              alt="Bajaj Pulsar N160"
              className="w-full h-full object-contain filter drop-shadow-[0_12px_30px_rgba(0,0,0,0.95)] transition-transform duration-500 group-hover:scale-[1.02]"
            />

            {/* Glowing Wolf-Eye DRL Pulsing FX Overlay */}
            <motion.div
              animate={{
                opacity: isLightFlashed ? [0.6, 1, 0.6] : [0.3, 0.7, 0.3],
                scale: isLightFlashed ? [1, 1.08, 1] : [0.98, 1.02, 0.98],
              }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="absolute right-[21%] top-[31%] w-6 h-6 rounded-full bg-cyan-400/50 blur-md pointer-events-none"
            />
          </div>

          {/* Bottom Official Emblem (As in video: BAJAJ PULSAR N160 DUAL ABS) */}
          <div className="mt-2 w-full flex items-center justify-center">
            <div className="px-4 py-1.5 rounded-xl bg-[#090b10] border border-amber-500/40 shadow-inner flex items-center gap-2 flex-wrap justify-center group-hover:border-amber-400 transition-colors">
              <span className="text-xs sm:text-sm font-display font-black tracking-widest text-white uppercase">
                BAJAJ PULSAR
              </span>
              <span className="text-xs sm:text-sm font-display font-black tracking-widest text-amber-400">
                N160
              </span>
              <span className="px-1.5 py-0.5 rounded bg-red-600 text-[9px] font-mono font-black text-white tracking-wider shadow-sm">
                DUAL ABS
              </span>
            </div>
          </div>

          {/* Telemetry Progress Bar & Diagnostics readout */}
          <div className="w-full mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-300 font-semibold truncate pr-2">
                <CurrentIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="truncate">{steps[stepIndex].text}</span>
              </span>
              <span className="text-amber-400 font-bold tabular-nums shrink-0">
                {progress}%
              </span>
            </div>

            {/* High-tech Meter / Progress Bar */}
            <div className="w-full h-2.5 bg-[#161c28] rounded-full overflow-hidden p-0.5 border border-zinc-700/70 shadow-inner relative">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-amber-400 to-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.8)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            {/* Sub-label for telemetry step */}
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-0.5">
              <span>{steps[stepIndex].desc}</span>
              <span className="text-zinc-600">Tap card to rev</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Skip / Enter Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onComplete}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#121622] hover:bg-[#1a2130] border border-zinc-700/60 hover:border-amber-500/60 text-xs font-mono text-zinc-300 hover:text-amber-300 transition-all cursor-pointer shadow-lg group active:scale-95"
        >
          <span>LAUNCH SERVICE LOG</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-amber-400" />
        </motion.button>
      </div>

      {/* Footer System Version */}
      <div className="absolute bottom-4 text-[10px] font-mono text-zinc-600 tracking-wider flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>PULSAR TELEMETRY OS • v2.4 • SECURE PROTOCOL</span>
      </div>
    </motion.div>
  );
};
