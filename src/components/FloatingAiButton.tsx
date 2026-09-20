import React, { useState } from 'react';
import { Sparkles, Wrench, MessageSquareText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingAiButtonProps {
  onClick: () => void;
  isOverdue?: boolean;
  isDueSoon?: boolean;
  remainingKm?: number;
}

export const FloatingAiButton: React.FC<FloatingAiButtonProps> = ({
  onClick,
  isOverdue,
  isDueSoon,
  remainingKm,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Expanded hover tooltip banner on desktop */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-3 w-64 p-3 rounded-2xl bg-[#0e1422]/95 border border-amber-500/40 shadow-2xl backdrop-blur-xl text-left pointer-events-none hidden sm:block"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-display font-black text-xs text-white uppercase tracking-wider">
                Pulsar MechAI Online
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Gemini Flash
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-snug">
              Instant troubleshooting, sound diagnostics, tyre pressure, and custom service log analysis.
            </p>
            {isOverdue ? (
              <div className="mt-2 text-[10px] font-bold text-red-400 flex items-center gap-1">
                <span>⚠️ Service is overdue! Ask AI for a safety checklist.</span>
              </div>
            ) : isDueSoon ? (
              <div className="mt-2 text-[10px] font-semibold text-amber-300 flex items-center gap-1">
                <span>🔔 Service due in {remainingKm?.toLocaleString()} km.</span>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="group relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#141b2b] via-[#101726] to-[#0a0f1a] border-2 border-amber-500/60 hover:border-amber-400 text-white shadow-[0_8px_30px_rgba(0,0,0,0.7)] hover:shadow-[0_0_25px_rgba(245,158,11,0.45)] transition-all cursor-pointer backdrop-blur-md overflow-hidden"
        title="Open AI Maintenance Assistant & Mechanic"
      >
        {/* Animated ambient pulse glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/15 via-transparent to-cyan-500/15 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Outer pulsing ring */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-black" />
        </span>

        {/* Icon with glowing backdrop */}
        <div className="relative w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-[1px] shadow-sm shrink-0">
          <div className="w-full h-full rounded-[11px] bg-[#0c101a] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          </div>
        </div>

        {/* Button Text */}
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-black text-xs tracking-wider text-white group-hover:text-amber-300 transition-colors">
              AI Mechanic
            </span>
            <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-300 border border-amber-400/40">
              AI
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 block -mt-0.5 group-hover:text-zinc-300 transition-colors">
            Ask Pulsar Tech
          </span>
        </div>
      </motion.button>
    </div>
  );
};
