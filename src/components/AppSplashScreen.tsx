import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ShieldCheck, Cpu, CheckCircle2, ChevronRight, Gauge } from 'lucide-react';

interface AppSplashScreenProps {
  onComplete: () => void;
  regNo?: string;
  modelName?: string;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onComplete,
  regNo = 'BKT-1374',
  modelName = 'BAJAJ PULSAR N160',
}) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { text: 'DTS-i TWIN-SPARK ECU BOOT', icon: Cpu },
    { text: 'BI-LED PROJECTOR & DRL CHECK', icon: Zap },
    { text: 'DUAL-CHANNEL ABS ONLINE', icon: ShieldCheck },
    { text: 'FIRESTORE CLOUD TELEMETRY SYNC', icon: Gauge },
    { text: 'DIAGNOSTICS PASSED • SYSTEM ARMED', icon: CheckCircle2 },
  ];

  useEffect(() => {
    const duration = 2200; // 2.2 seconds total sequence
    const intervalTime = 40;
    const totalSteps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentPct = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setProgress(currentPct);

      if (currentPct < 25) setStepIndex(0);
      else if (currentPct < 50) setStepIndex(1);
      else if (currentPct < 75) setStepIndex(2);
      else if (currentPct < 95) setStepIndex(3);
      else setStepIndex(4);

      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 350);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  const CurrentIcon = steps[stepIndex].icon;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 bg-[#07090e] text-white flex flex-col items-center justify-center p-4 select-none overflow-hidden"
    >
      {/* Background High-Tech Atmospheric Glow & Radial Grids */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/10 via-amber-500/8 to-transparent rounded-full blur-3xl opacity-60" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(245, 158, 11, 0.25) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="w-full max-w-sm sm:max-w-md relative z-10 flex flex-col items-center">
        {/* Top Mini Plate Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-4"
        >
          <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase shadow-sm">
            {modelName}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-black tracking-wider text-amber-300 shadow-sm">
            {regNo}
          </span>
        </motion.div>

        {/* Central Motorcycle Card (Matching Video Layout) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative rounded-3xl bg-gradient-to-b from-[#121620] via-[#0c0f16] to-[#080a0f] border border-amber-500/30 p-4 sm:p-5 shadow-2xl shadow-black/80 flex flex-col items-center overflow-hidden group"
        >
          {/* Subtle Card Ambient Glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Motorcycle Illustration Image */}
          <div className="relative w-full aspect-[4/3] max-h-56 sm:max-h-64 flex items-center justify-center">
            <img
              src="/pulsar_n160.svg"
              alt="Bajaj Pulsar N160"
              className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]"
            />

            {/* Glowing Wolf-Eye DRL Pulsing FX Overlay */}
            <motion.div
              animate={{
                opacity: [0.4, 0.9, 0.4],
                scale: [0.98, 1.02, 0.98],
              }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="absolute right-[21%] top-[31%] w-5 h-5 rounded-full bg-cyan-400/40 blur-md pointer-events-none"
            />
          </div>

          {/* Bottom Official Emblem (As in video: BAJAJ PULSAR N160 DUAL ABS) */}
          <div className="mt-2 w-full flex items-center justify-center">
            <div className="px-4 py-1.5 rounded-xl bg-[#090b10] border border-amber-500/40 shadow-inner flex items-center gap-2 flex-wrap justify-center">
              <span className="text-xs sm:text-sm font-display font-black tracking-widest text-white uppercase">
                BAJAJ PULSAR
              </span>
              <span className="text-xs sm:text-sm font-display font-black tracking-widest text-amber-400">
                N160
              </span>
              <span className="px-1.5 py-0.5 rounded bg-red-600 text-[9px] font-mono font-black text-white tracking-wider">
                DUAL ABS
              </span>
            </div>
          </div>

          {/* Telemetry Progress Bar & Diagnostics readout */}
          <div className="w-full mt-5 space-y-2">
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
            <div className="w-full h-2 bg-[#161c28] rounded-full overflow-hidden p-0.5 border border-zinc-700/60 shadow-inner relative">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-amber-400 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.7)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Skip / Enter Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onComplete}
          className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#121622] hover:bg-[#1a2130] border border-zinc-700/60 hover:border-amber-500/50 text-xs font-mono text-zinc-400 hover:text-amber-300 transition-all cursor-pointer shadow-lg group"
        >
          <span>LAUNCH SERVICE LOG</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-amber-400" />
        </motion.button>
      </div>

      {/* Footer System Version */}
      <div className="absolute bottom-4 text-[10px] font-mono text-zinc-600 tracking-wider">
        PULSAR TELEMETRY OS • v2.4 • SECURE PROTOCOL
      </div>
    </motion.div>
  );
};
