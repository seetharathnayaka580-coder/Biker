import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bike,
  User,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Zap,
  Download,
} from 'lucide-react';
import { AuthSession, VehicleDetails } from '../types';
import { signInWithGooglePopup } from '../lib/firebase';

interface LoginPageProps {
  onLoginSuccess: (session: AuthSession) => void;
  vehicle?: VehicleDetails;
  onOpenInstall?: () => void;
}

// Crisp mechanical motorcycle ignition relay switch audio feedback using Web Audio API
const playClickSound = (isTurningOn: boolean) => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isTurningOn ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isTurningOn ? 220 : 380, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(isTurningOn ? 520 : 120, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.11);
  } catch {
    // AudioContext may be restricted before user gesture
  }
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, vehicle, onOpenInstall }) => {
  // Lamp state (Turned on by default, can be toggled via the hanging cord)
  const [isLampOn, setIsLampOn] = useState(true);
  const [isCordPulled, setIsCordPulled] = useState(false);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google sign in state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Handle pull cord toggle
  const handlePullCord = () => {
    setIsCordPulled(true);
    const nextState = !isLampOn;
    setIsLampOn(nextState);
    playClickSound(nextState);

    setTimeout(() => {
      setIsCordPulled(false);
    }, 300);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const trimmedUser = username.trim();
      const trimmedPass = password.trim();

      // Check username: Sachi (case-insensitive) & password: 988800
      if (trimmedUser.toLowerCase() === 'sachi' && trimmedPass === '988800') {
        const session: AuthSession = {
          role: 'admin',
          username: 'Sachi',
          signedInAt: new Date().toISOString(),
        };
        onLoginSuccess(session);
      } else {
        setErrorMsg('Invalid username or password.');
      }
    }, 550);
  };

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);
    try {
      const user = await signInWithGooglePopup();
      const session: AuthSession = {
        role: 'client',
        username: user.displayName || user.email || 'Client User',
        email: user.email || undefined,
        photoURL: user.photoURL || undefined,
        signedInAt: new Date().toISOString(),
      };
      onLoginSuccess(session);
    } catch (err: unknown) {
      console.warn('Google sign-in notice:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('popup-closed-by-user') || errMsg.includes('cancelled-popup-request')) {
        setGoogleError('Sign-in was cancelled.');
      } else {
        setGoogleError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090e] text-[#eef1f4] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-y-auto select-none font-sans">
      {/* Dynamic Raindrop / Cyber Water droplet background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 0%, transparent 80%), radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 28px 28px',
        }}
      />

      {/* Atmospheric Ambient Glow & Darkness Gradient */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          isLampOn ? 'opacity-100' : 'opacity-20'
        }`}
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-cyan-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[280px] h-[350px] bg-gradient-to-b from-cyan-400/25 to-transparent blur-2xl pointer-events-none" />
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center pt-2">
        {/* ============================================================== */}
        {/* MOTORCYCLE PROJECTOR HEADLIGHT & IGNITION PULL CORD SECTION     */}
        {/* ============================================================== */}
        <div className="relative w-full flex flex-col items-center mb-6 z-30">
          {/* Motorcycle Handlebar Mount & Suspension Fork Tubes */}
          <div className="flex items-center gap-9 -mb-1">
            <div className="w-2 h-9 bg-gradient-to-b from-zinc-700 via-zinc-400 to-zinc-600 rounded-t-sm shadow-sm" />
            <div className="w-2 h-9 bg-gradient-to-b from-zinc-700 via-zinc-400 to-zinc-600 rounded-t-sm shadow-sm" />
          </div>

          {/* Triple-Tree Clamp / Handlebar Crown */}
          <div className="w-28 h-2.5 bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-800 rounded-md border border-zinc-500 shadow-md relative flex items-center justify-center">
            <div className="w-4 h-1.5 bg-zinc-900 rounded-sm border border-zinc-700" />
          </div>

          {/* Pulsar N160 Bi-LED Headlamp Assembly */}
          <div className="relative flex flex-col items-center mt-1.5">
            {/* Aerodynamic Pulsar Cowl Visor */}
            <div className="relative flex flex-col items-center">
              {/* Smoked Tinted Windscreen */}
              <div
                className="w-16 h-5 bg-gradient-to-b from-zinc-900 via-black to-zinc-800 rounded-t-lg border-t border-x border-cyan-500/40 shadow-inner -mb-1 relative z-10"
                style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }}
              >
                <div className="w-6 h-0.5 bg-cyan-400/60 mx-auto mt-1 rounded-full" />
              </div>

              {/* Main Angular Headlight Housing (Pulsar N160 Sharp Fairing) */}
              <div
                className={`w-32 sm:w-36 h-16 transition-all duration-300 relative rounded-2xl flex flex-col items-center justify-center p-2 shadow-2xl border ${
                  isLampOn
                    ? 'bg-gradient-to-b from-[#111620] via-[#0b0e14] to-[#06080c] border-cyan-400/70 shadow-[0_0_40px_rgba(6,182,212,0.5)]'
                    : 'bg-[#0e121a] border-zinc-700 shadow-black/90'
                }`}
              >
                {/* Dual Wolf-Eye LED DRL Brows (Left & Right) */}
                <div className="w-full flex items-center justify-between px-3.5 -mt-1 mb-1">
                  {/* Left DRL Brow */}
                  <div
                    className={`h-1.5 w-7 rounded-full transition-all duration-300 ${
                      isLampOn
                        ? 'bg-cyan-300 shadow-[0_0_12px_#00f2fe]'
                        : 'bg-zinc-700'
                    }`}
                    style={{ transform: 'rotate(14deg)' }}
                  />
                  {/* Right DRL Brow */}
                  <div
                    className={`h-1.5 w-7 rounded-full transition-all duration-300 ${
                      isLampOn
                        ? 'bg-cyan-300 shadow-[0_0_12px_#00f2fe]'
                        : 'bg-zinc-700'
                    }`}
                    style={{ transform: 'rotate(-14deg)' }}
                  />
                </div>

                {/* Central Bi-Functional LED Projector Lens */}
                <div
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                    isLampOn
                      ? 'border-cyan-300 bg-gradient-to-tr from-cyan-400 via-white to-cyan-200 shadow-[0_0_35px_12px_rgba(6,182,212,0.95)]'
                      : 'border-zinc-600 bg-zinc-800/90 shadow-inner'
                  }`}
                >
                  {/* Inner Optical Lens Reflection */}
                  <div
                    className={`w-4.5 h-4.5 rounded-full transition-all duration-300 ${
                      isLampOn ? 'bg-white shadow-[0_0_18px_#fff] animate-pulse' : 'bg-zinc-900'
                    }`}
                  />
                </div>

                {/* Aerodynamic Lower Chin Vents */}
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2.5 h-0.5 bg-zinc-700 rounded-full" />
                  <div className="w-4 h-0.5 bg-zinc-600 rounded-full" />
                  <div className="w-2.5 h-0.5 bg-zinc-700 rounded-full" />
                </div>
              </div>

              {/* Pulsar High-Beam Projector Light Cone Projection */}
              {isLampOn && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-14 w-[360px] h-[380px] pointer-events-none transition-opacity duration-500 z-10"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.30) 0%, rgba(14, 165, 233, 0.16) 42%, transparent 75%)',
                    clipPath: 'polygon(28% 0%, 72% 0%, 100% 100%, 0% 100%)',
                  }}
                />
              )}
            </div>

            {/* Interactive Motorcycle Ignition Key Lanyard / Pull Cord */}
            <div
              onClick={handlePullCord}
              className="absolute left-[calc(50%+44px)] top-10 cursor-pointer group flex flex-col items-center z-40"
              title="Pull ignition key cord to toggle headlight"
            >
              {/* Metallic Ignition Wire */}
              <motion.div
                animate={{ height: isCordPulled ? 48 : 34 }}
                transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                className="w-[2px] bg-gradient-to-b from-zinc-500 via-amber-400 to-red-500 group-hover:bg-cyan-300"
              />

              {/* Ignition Key Fob / Kill-Switch Tag */}
              <motion.div
                animate={{
                  y: isCordPulled ? 14 : 0,
                  scale: isCordPulled ? 1.2 : 1,
                  rotate: isCordPulled ? 6 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 12 }}
                className={`px-2 py-1 rounded-md border shadow-lg transition-colors flex items-center gap-1 ${
                  isLampOn
                    ? 'bg-gradient-to-b from-red-600 to-red-700 border-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.75)]'
                    : 'bg-zinc-800 border-zinc-600 text-zinc-400 group-hover:border-amber-400 group-hover:text-amber-300'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-300 shrink-0" />
                <span className="text-[8px] font-mono font-black tracking-tight uppercase whitespace-nowrap">
                  {isLampOn ? 'IGN ON' : 'IGN OFF'}
                </span>
              </motion.div>

              {/* Pulsing Pull Tag Label */}
              <span className="text-[9px] font-mono font-bold tracking-wider text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[#0a0d14] px-1.5 py-0.5 rounded border border-cyan-500/40 mt-1 shadow-md">
                PULL KEY
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* LOGIN CARD CONTAINER (Glassmorphic dark design from video)     */}
        {/* ============================================================== */}
        <div
          className={`w-full rounded-3xl pt-8 pb-7 px-6 sm:px-8 transition-all duration-500 relative border shadow-2xl ${
            isLampOn
              ? 'bg-[#0d1117]/95 border-[#1f2d3d] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.15)] backdrop-blur-xl'
              : 'bg-[#0a0d13]/90 border-zinc-800/60 shadow-2xl backdrop-blur-md'
          }`}
        >
          {/* Header Title & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
              Welcome Back.
            </h1>
            <p className="text-xs text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
              <span>Pull the cord to illuminate your path</span>
              {isLampOn && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
            </p>

            {/* Vehicle & Owner Badge */}
            <div className="flex items-center justify-center gap-2 mt-2.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Bike className="w-3 h-3 text-cyan-400" />
                {vehicle?.model || 'Bajaj Pulsar N160'}
              </span>
              <span className="text-[11px] font-mono uppercase text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                {vehicle?.regNo || 'BKT-1374'}
              </span>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
            {googleError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{googleError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form (Matching video inputs & style) */}
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            {/* USERNAME INPUT */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  autoComplete="username"
                  className="w-full bg-[#131924] border border-[#233044] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-all font-mono outline-none shadow-inner"
                  required
                />
                <User className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full bg-[#131924] border border-[#233044] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-all font-mono tracking-wider outline-none shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-cyan-300 transition-colors p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SIGN IN BUTTON (Luminous gradient as in video) */}
            <motion.button
              whileHover={{ scale: 1.015, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-5 rounded-xl font-display font-black text-sm tracking-wider text-white uppercase bg-gradient-to-r from-[#00e5ff] via-[#00a2ff] to-[#0066ff] hover:from-[#33ecff] hover:to-[#1a75ff] shadow-[0_4px_20px_rgba(0,162,255,0.4)] border border-cyan-300/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </motion.button>
          </form>

          {/* Social / Alternate Logins Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1e2738]" />
            </div>
            <span className="relative px-3 bg-[#0d1117] text-[11px] font-mono text-zinc-500 uppercase">
              Or continue with
            </span>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#141b27] hover:bg-[#1b2536] border border-[#243147] hover:border-zinc-500 text-xs font-semibold text-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50 group"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>

        {/* Footer info badge & Chrome App Install Shortcut */}
        <div className="flex flex-col items-center justify-center gap-2.5 mt-5">
          {onOpenInstall && (
            <button
              type="button"
              onClick={onOpenInstall}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Chrome App Shortcut</span>
            </button>
          )}

          <div className="text-center text-[11px] text-zinc-500 flex items-center justify-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bajaj Auto Digital Service Platform · Official N160 Log</span>
          </div>
        </div>
      </div>
    </div>
  );
};
