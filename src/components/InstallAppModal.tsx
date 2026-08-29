import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  X,
  Smartphone,
  CheckCircle2,
  Share,
  MoreVertical,
  PlusSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: BeforeInstallPromptEvent | null;
  onInstalled?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled,
}) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('android');

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as unknown as { MSStream?: boolean }).MSStream) {
      setPlatform('ios');
    } else if (/android/i.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      try {
        setIsInstalling(true);
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setInstallSuccess(true);
          onInstalled?.();
          setTimeout(() => {
            onClose();
          }, 1800);
        }
      } catch (err) {
        console.warn('Install prompt warning:', err);
      } finally {
        setIsInstalling(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-[#0f131c] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/90 relative overflow-hidden"
      >
        {/* Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Icon Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#141824] border border-amber-500/40 p-1.5 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
            <img src="/favicon.svg" alt="Pulsar N160 App Icon" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-1.5">
              Install Chrome App <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Add Bajaj Pulsar N160 to your home screen
            </p>
          </div>
        </div>

        {/* Success State */}
        {installSuccess ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h4 className="text-base font-bold text-white">Shortcut Installed!</h4>
            <p className="text-xs text-zinc-400 max-w-xs">
              Pulsar N160 Log Book is now on your home screen for fast 1-tap access.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Features list */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-xl bg-[#141924] border border-zinc-800 text-zinc-300 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Instant Offline Access</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#141924] border border-zinc-800 text-zinc-300 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Real-time Sync</span>
              </div>
            </div>

            {/* Direct 1-Click Install Button if Chrome prompt is ready */}
            {deferredPrompt ? (
              <button
                type="button"
                onClick={handleTriggerInstall}
                disabled={isInstalling}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>{isInstalling ? 'Installing Shortcut...' : '1-Click Install Shortcut'}</span>
              </button>
            ) : (
              /* Platform Specific Guides */
              <div className="p-3.5 rounded-xl bg-[#131826] border border-zinc-700/60 space-y-2.5 text-xs text-zinc-300">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5 font-mono">
                  <Smartphone className="w-4 h-4" />
                  <span>How to Add to Home Screen:</span>
                </div>

                {platform === 'ios' ? (
                  <ol className="space-y-1.5 list-decimal list-inside text-zinc-300 font-mono text-[11px]">
                    <li>
                      Tap the <Share className="w-3.5 h-3.5 inline text-blue-400 mx-1" /> <strong>Share</strong> button in Safari.
                    </li>
                    <li>
                      Scroll down and select <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mx-1" /> <strong>"Add to Home Screen"</strong>.
                    </li>
                    <li>Tap <strong>Add</strong> at top right to complete.</li>
                  </ol>
                ) : (
                  <ol className="space-y-1.5 list-decimal list-inside text-zinc-300 font-mono text-[11px]">
                    <li>
                      Tap the Chrome menu <MoreVertical className="w-3.5 h-3.5 inline text-zinc-200 mx-1" /> (three dots) at top right.
                    </li>
                    <li>
                      Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </li>
                    <li>Confirm <strong>"Install"</strong> to place the shortcut icon on your phone.</li>
                  </ol>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Maybe later
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
