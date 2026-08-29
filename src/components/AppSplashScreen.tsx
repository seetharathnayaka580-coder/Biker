import React, { useEffect } from 'react';
import { motion } from 'motion/react';

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
  useEffect(() => {
    // Clean, fast, seamless transition (1.4 seconds)
    const timer = setTimeout(() => {
      onComplete();
    }, 1400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 bg-[#07090e] text-white flex flex-col items-center justify-between p-8 select-none"
    >
      {/* Top Subtle Registration Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-center gap-2"
      >
        <span className="px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono font-medium text-zinc-400">
          {regNo}
        </span>
      </motion.div>

      {/* Center Simple & Clean Hero Brand */}
      <div className="flex flex-col items-center justify-center text-center max-w-xs sm:max-w-sm -mt-6">
        {/* App Icon / Motorcycle Emblem */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#0f131c] border border-amber-500/30 p-2.5 flex items-center justify-center shadow-2xl shadow-black/80 mb-6 relative overflow-hidden"
        >
          {/* Subtle Ambient Warm Glow */}
          <div className="absolute inset-0 bg-amber-500/10 rounded-3xl blur-xl" />
          <img
            src="/favicon.svg"
            alt="Pulsar N160"
            className="w-full h-full object-contain relative z-10 filter drop-shadow-md"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-lg sm:text-xl font-bold font-display tracking-wider text-white uppercase"
        >
          {modelName}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-xs text-zinc-400 font-mono mt-1"
        >
          Official Digital Service Log Book
        </motion.p>

        {/* Minimalist Smooth Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-8 flex flex-col items-center gap-2.5 w-44"
        >
          <div className="w-full h-1 bg-zinc-800/80 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
            />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
            LOADING LOG BOOK...
          </span>
        </motion.div>
      </div>

      {/* Bottom Secure Tag */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-[10px] font-mono text-zinc-600 tracking-widest"
      >
        BAJAJ AUTO DIGITAL SYSTEM
      </motion.div>
    </motion.div>
  );
};
