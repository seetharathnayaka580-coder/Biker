import React, { useState, useMemo } from 'react';
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
  Shield,
  UserPlus,
  LogIn,
  MapPin,
  Compass,
  CheckCircle2,
  MessageCircle,
  Send,
  Phone,
  Crown,
  Star,
  BadgeCheck,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { AuthSession, VehicleDetails } from '../types';
import { loginUser, registerAdminUser, loginWithGoogle } from '../lib/firebase';
import { ALL_DISTRICTS, ALL_PROVINCES, SRI_LANKA_REGIONS } from '../data/sriLankaRegions';

interface LoginPageProps {
  onLoginSuccess: (session: AuthSession) => void;
  vehicle?: VehicleDetails;
  onOpenInstall?: () => void;
  onUpdateVehicle?: (vehicle: VehicleDetails) => void;
}

// Crisp mechanical motorcycle ignition relay switch audio feedback using Web Audio API
const playClickSound = (isTurningOn: boolean) => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, vehicle, onOpenInstall, onUpdateVehicle }) => {
  // Mode: Sign In or Sign Up
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Lamp state (Turned on by default, can be toggled via the hanging cord)
  const [isLampOn, setIsLampOn] = useState(true);
  const [isCordPulled, setIsCordPulled] = useState(false);

  // Photo for Creator Pathum Sachintha
  const currentPhoto = vehicle?.ownerPhotoUrl || (typeof window !== 'undefined' ? localStorage.getItem('pathum_photo') : '') || '/pathum_photo.svg';

  // Sign In form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up form state
  const [signUpOwnerName, setSignUpOwnerName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpBikeNumber, setSignUpBikeNumber] = useState('');
  const [signUpProvince, setSignUpProvince] = useState('Western Province');
  const [signUpDistrict, setSignUpDistrict] = useState('Colombo');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Filter districts dynamically based on selected province in Sign Up
  const currentDistricts = useMemo(() => {
    const region = SRI_LANKA_REGIONS.find((r) => r.province === signUpProvince);
    return region ? region.districts : ALL_DISTRICTS;
  }, [signUpProvince]);

  const handleProvinceChange = (newProv: string) => {
    setSignUpProvince(newProv);
    const region = SRI_LANKA_REGIONS.find((r) => r.province === newProv);
    if (region && region.districts.length > 0) {
      setSignUpDistrict(region.districts[0]);
    }
  };

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

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const result = await loginWithGoogle();
      setSuccessMsg('Google verification successful! Launching dashboard...');
      setTimeout(() => {
        onLoginSuccess(result.session);
      }, 350);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setIsSubmitting(false);
        return;
      }
      console.warn('Google Sign-In notice:', err);
      setErrorMsg(err.message || 'Google sign-in was unsuccessful. Please use username and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign In Handler
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const result = await loginUser(username, password);
      onLoginSuccess(result.session);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid username or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign Up Handler (Creates new Admin User & Bike)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const name = signUpOwnerName.trim();
    const cleanUser = signUpUsername.trim().toLowerCase().replace(/\s+/g, '');
    const pass = signUpPassword.trim();
    const plate = signUpBikeNumber.trim().toUpperCase();

    if (!name) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!cleanUser || cleanUser.length < 3) {
      setErrorMsg('Username must be at least 3 characters long (letters, numbers, underscores).');
      return;
    }
    if (!pass || pass.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (!plate) {
      setErrorMsg('Please enter your bike registration plate number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerAdminUser({
        ownerName: name,
        username: cleanUser,
        password: pass,
        bikeNumber: plate,
        province: signUpProvince,
        district: signUpDistrict,
      });

      setSuccessMsg(`Account created for ${name}! Opening your Admin Logbook...`);
      setTimeout(() => {
        onLoginSuccess(result.session);
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090b0e] text-[#e2e8f0] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-y-auto select-none font-sans">
      {/* Carbon / Slate Gray Mesh Background */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none bg-carbon-mesh"
      />

      {/* Atmospheric Ambient Glow & Darkness Gradient */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          isLampOn ? 'opacity-100' : 'opacity-20'
        }`}
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-zinc-700/15 via-slate-800/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[280px] h-[350px] bg-gradient-to-b from-zinc-500/20 to-transparent blur-2xl pointer-events-none" />
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full max-w-[460px] relative z-10 flex flex-col items-center pt-2">
        {/* ============================================================== */}
        {/* MOTORCYCLE PROJECTOR HEADLIGHT & IGNITION PULL CORD SECTION     */}
        {/* ============================================================== */}
        <div className="relative w-full flex flex-col items-center mb-5 z-30">
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
                className="w-16 h-5 bg-gradient-to-b from-zinc-900 via-black to-zinc-800 rounded-t-lg border-t border-x border-zinc-600 shadow-inner -mb-1 relative z-10"
                style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }}
              >
                <div className="w-6 h-0.5 bg-zinc-400 mx-auto mt-1 rounded-full" />
              </div>

              {/* Main Angular Headlight Housing */}
              <div
                className={`w-32 sm:w-36 h-16 transition-all duration-300 relative rounded-2xl flex flex-col items-center justify-center p-2 shadow-2xl border ${
                  isLampOn
                    ? 'bg-gradient-to-b from-[#181c26] via-[#12151e] to-[#0b0e14] border-sky-400/70 shadow-[0_0_35px_rgba(56,189,248,0.35)]'
                    : 'bg-[#10131a] border-zinc-700 shadow-black/90'
                }`}
              >
                {/* Dual Wolf-Eye LED DRL Brows - Blue Light Design */}
                <div className="w-full flex items-center justify-between px-3.5 -mt-1 mb-1">
                  <div
                    className={`h-1.5 w-7 rounded-full transition-all duration-300 ${
                      isLampOn ? 'bg-sky-300 shadow-[0_0_12px_#38bdf8]' : 'bg-zinc-700'
                    }`}
                    style={{ transform: 'rotate(14deg)' }}
                  />
                  <div
                    className={`h-1.5 w-7 rounded-full transition-all duration-300 ${
                      isLampOn ? 'bg-sky-300 shadow-[0_0_12px_#38bdf8]' : 'bg-zinc-700'
                    }`}
                    style={{ transform: 'rotate(-14deg)' }}
                  />
                </div>

                {/* Central Bi-LED Projector Lens - Blue Light Design */}
                <div
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                    isLampOn
                      ? 'border-sky-300 bg-gradient-to-tr from-sky-400 via-white to-blue-400 shadow-[0_0_32px_10px_rgba(56,189,248,0.85)]'
                      : 'border-zinc-600 bg-zinc-800/90 shadow-inner'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full transition-all duration-300 ${
                      isLampOn ? 'bg-white shadow-[0_0_18px_#38bdf8] animate-pulse' : 'bg-zinc-900'
                    }`}
                  />
                </div>

                {/* Lower Chin Vents */}
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2.5 h-0.5 bg-zinc-700 rounded-full" />
                  <div className="w-4 h-0.5 bg-zinc-600 rounded-full" />
                  <div className="w-2.5 h-0.5 bg-zinc-700 rounded-full" />
                </div>
              </div>

              {/* Pulsar High-Beam Projector Blue Light Cone */}
              {isLampOn && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-14 w-[360px] h-[380px] pointer-events-none transition-opacity duration-500 z-10"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.30) 0%, rgba(37, 99, 235, 0.14) 45%, transparent 75%)',
                    clipPath: 'polygon(28% 0%, 72% 0%, 100% 100%, 0% 100%)',
                  }}
                />
              )}
            </div>

            {/* Interactive Ignition Key Pull Cord */}
            <div
              onClick={handlePullCord}
              className="absolute left-[calc(50%+44px)] top-10 cursor-pointer group flex flex-col items-center z-40"
              title="Pull ignition key cord to toggle headlight"
            >
              <motion.div
                animate={{ height: isCordPulled ? 48 : 34 }}
                transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                className="w-[2px] bg-gradient-to-b from-zinc-500 via-amber-400 to-red-500 group-hover:bg-zinc-300"
              />

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

              <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[#12151f] px-1.5 py-0.5 rounded border border-zinc-600 mt-1 shadow-md">
                PULL KEY
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* LOGIN / SIGN UP CARD CONTAINER                                */}
        {/* ============================================================== */}
        <div
          className={`w-full rounded-3xl pt-6 pb-7 px-5 sm:px-7 transition-all duration-500 relative border shadow-2xl ${
            isLampOn
              ? 'bg-[#11141c]/95 border-[#242b3b] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,0,0,0.4)] backdrop-blur-xl'
              : 'bg-[#0e1117]/90 border-zinc-800/60 shadow-2xl backdrop-blur-md'
          }`}
        >
          {/* Header Title & Subtitle */}
          <div className="text-center mb-5">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-wide">
              {authMode === 'signin' ? 'Welcome Back.' : 'Create Bike Admin Account'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
              <span>{authMode === 'signin' ? 'Sign in to access your digital service record' : 'Register your bike, province, and district'}</span>
              {isLampOn && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
            </p>
          </div>

          {/* Mode Switch Tabs (Sign In / Sign Up) */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#161a24] border border-[#262e3f] mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-white shadow-md border border-zinc-600'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-white shadow-md border border-zinc-600'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Error / Success Feedback */}
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
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================================================== */}
          {/* TAB 1: SIGN IN FORM                                            */}
          {/* ============================================================== */}
          {authMode === 'signin' && (
            <div className="space-y-4">
              <form onSubmit={handleSignInSubmit} className="space-y-4">
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
                      placeholder="e.g. sachi, chathura, or your username"
                      autoComplete="username"
                      className="w-full bg-[#161a24] border border-[#283244] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-all font-mono outline-none shadow-inner"
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
                      placeholder="Enter password"
                      autoComplete="current-password"
                      className="w-full bg-[#161a24] border border-[#283244] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-all font-mono tracking-wider outline-none shadow-inner"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors p-1 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* SIGN IN BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.015, filter: 'brightness(1.1)' }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-5 rounded-xl font-display font-black text-sm tracking-wider text-white uppercase bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-900 hover:from-zinc-600 hover:to-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-zinc-600 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-white" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Unlock Service Dashboard</span>
                      <ArrowRight className="w-4 h-4 text-zinc-300" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* OR DIVIDER */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">or continue with</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              {/* GOOGLE SIGN IN BUTTON */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-zinc-200 bg-[#161a24] hover:bg-[#1e2330] border border-[#2d374d] hover:border-zinc-500 transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google Account</span>
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: SIGN UP FORM (Full details: user, pass, bike, district, prov) */}
          {/* ============================================================== */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              {/* Full Name / Bike Owner */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Full Name / Owner *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={signUpOwnerName}
                    onChange={(e) => setSignUpOwnerName(e.target.value)}
                    placeholder="e.g. Kasun Sandaruwan"
                    className="w-full bg-[#161a24] border border-[#283244] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 transition-all outline-none"
                    required
                  />
                  <User className="w-3.5 h-3.5 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Username & Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="e.g. kasun99"
                    className="w-full bg-[#161a24] border border-[#283244] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/50 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-zinc-600 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Password (4+ chars)"
                      className="w-full bg-[#161a24] border border-[#283244] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/50 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-zinc-600 transition-all outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 p-1 cursor-pointer"
                    >
                      {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bike Number / Plate */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Bike Number / Plate Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={signUpBikeNumber}
                    onChange={(e) => setSignUpBikeNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. WP BGH-4592 or BKT-1374"
                    className="w-full bg-[#161a24] border border-[#283244] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/50 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase tracking-wider placeholder:text-zinc-600 transition-all outline-none"
                    required
                  />
                  <Bike className="w-3.5 h-3.5 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Province & District Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Province Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Province *
                  </label>
                  <select
                    value={signUpProvince}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full bg-[#161a24] border border-[#283244] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/50 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    {ALL_PROVINCES.map((prov) => (
                      <option key={prov} value={prov} className="bg-[#11141c] text-white">
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    District *
                  </label>
                  <select
                    value={signUpDistrict}
                    onChange={(e) => setSignUpDistrict(e.target.value)}
                    className="w-full bg-[#161a24] border border-[#283244] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/50 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    {currentDistricts.map((dist) => (
                      <option key={dist} value={dist} className="bg-[#11141c] text-white">
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Admin Privileges Note */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 text-[11px] text-amber-300">
                <Shield className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>You will be registered as an <strong>Admin</strong> with full logging and editing permissions.</span>
              </div>

              {/* SIGN UP BUTTON */}
              <motion.button
                whileHover={{ scale: 1.015, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-5 rounded-xl font-display font-black text-sm tracking-wider text-white uppercase bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-900 hover:from-zinc-600 hover:to-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-zinc-600 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-white" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-white" />
                    <span>Sign Up & Open Logbook</span>
                  </>
                )}
              </motion.button>
            </form>
          )}
        </div>

        {/* App Creator & Executive Direct Support Access Card (Compact Small Card) */}
        <div className="mt-2.5 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-[#141b29]/95 via-[#0e1422]/95 to-[#090d16]/95 border border-amber-500/35 hover:border-amber-400/50 shadow-lg backdrop-blur-xl relative overflow-hidden transition-all duration-300 space-y-2">
          {/* Subtle ambient lighting glows */}
          <div className="absolute -top-8 -right-8 w-20 h-20 bg-amber-500/15 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />

          {/* Top Row: Owner Profile & Status */}
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Photo with golden rim */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full border-2 border-amber-400/70 p-[1px] shadow-[0_0_12px_rgba(245,158,11,0.35)] overflow-hidden bg-[#0c101a]">
                  <img
                    src={currentPhoto}
                    alt="Pathum Sachintha"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/pathum_photo.svg';
                    }}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-xs sm:text-sm text-white tracking-wide truncate">
                    Pathum Sachintha
                  </span>
                  <BadgeCheck className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-[10px] font-mono text-zinc-400 truncate">
                    App Creator & System Architect
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp & Telegram Action Buttons */}
          <div className="grid grid-cols-2 gap-2 relative z-10 pt-0.5">
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/94763961123?text=Hi%20Pathum%20Sachintha,%20I'm%20contacting%20you%20regarding%20the%20Bike%20Service%20Log%20Book."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/60 hover:border-amber-300 text-white text-xs font-bold shadow-[0_2px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_2px_18px_rgba(16,185,129,0.5)] transition-all group active:scale-95"
              title="Contact Pathum Sachintha on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-display tracking-wider">WhatsApp</span>
            </a>

            {/* Telegram Button */}
            <a
              href="https://t.me/X_x_x_xzZ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-blue-500 border border-sky-400/60 hover:border-amber-300 text-white text-xs font-bold shadow-[0_2px_12px_rgba(14,165,233,0.3)] hover:shadow-[0_2px_18px_rgba(14,165,233,0.5)] transition-all group active:scale-95"
              title="Contact Pathum Sachintha on Telegram"
            >
              <Send className="w-3.5 h-3.5 fill-white group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-display tracking-wider">Telegram</span>
            </a>
          </div>
        </div>

        {/* Premium Edition Showcase Modal */}
        <AnimatePresence>
          {showPremiumModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 15 }}
                className="w-full max-w-md bg-gradient-to-b from-[#151c2c] via-[#0f1422] to-[#0a0e18] border border-amber-500/40 rounded-3xl p-5 shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative overflow-hidden text-white"
              >
                {/* Decorative background ambient glows */}
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Modal Close Button */}
                <button
                  type="button"
                  onClick={() => setShowPremiumModal(false)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-xl bg-zinc-800/70 hover:bg-zinc-700/70 border border-zinc-700/60 transition-all cursor-pointer z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Modal Header */}
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.5)] shrink-0">
                    <div className="w-full h-full rounded-[14px] bg-[#0c101a] flex items-center justify-center">
                      <Crown className="w-6 h-6 text-amber-400 fill-amber-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-lg text-white tracking-wide">
                        Premium Pro Edition
                      </h3>
                      <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40">
                        VIP
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Curated by Creator Pathum Sachintha for serious riders
                    </p>
                  </div>
                </div>

                {/* Feature Highlights Grid */}
                <div className="space-y-2.5 my-4 relative z-10">
                  <div className="p-2.5 rounded-xl bg-zinc-900/85 border border-zinc-800/80 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
                      <Bike className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Unlimited Fleet & Multi-Bike Storage</h4>
                      <p className="text-[11px] text-zinc-400 leading-snug">Track unlimited motorbikes with instant switching, custom registration numbers, and individual logs.</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-900/85 border border-zinc-800/80 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Bajaj Digital Certificate Verification</h4>
                      <p className="text-[11px] text-zinc-400 leading-snug">Tamper-proof digital service logbook with certified QR stamps and exportable PDF records.</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-900/85 border border-zinc-800/80 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 shrink-0 mt-0.5">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Real-Time Cloud Synchronization</h4>
                      <p className="text-[11px] text-zinc-400 leading-snug">Continuous automatic cloud backups to Google Firebase Firestore with cross-device sync.</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-900/85 border border-zinc-800/80 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400 shrink-0 mt-0.5">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">24/7 Priority Support by Pathum Sachintha</h4>
                      <p className="text-[11px] text-zinc-400 leading-snug">Direct contact line for custom requests, system support, maintenance consulting, and VIP updates.</p>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="space-y-2 pt-2 relative z-10">
                  <a
                    href="https://wa.me/94763961123?text=Hi%20Pathum%20Sachintha,%20I'm%20interested%20in%20activating%20the%20Premium%20Pro%20Edition%20of%20the%20Bike%20Service%20Log%20Book!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-display font-black text-xs tracking-wider uppercase shadow-[0_4px_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Contact Pathum Sachintha on WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>

                  <a
                    href="https://t.me/X_x_x_xzZ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#182233] hover:bg-[#1e2a40] border border-sky-500/30 text-sky-300 font-display font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 fill-sky-400/40" />
                    <span>Chat on Telegram (@X_x_x_xzZ)</span>
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer info badge & Chrome App Install Shortcut */}
        <div className="flex flex-col items-center justify-center gap-2.5 mt-3">
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
            <span>Bajaj Auto Digital Service Platform · Multi-Admin Log</span>
          </div>
        </div>
      </div>
    </div>
  );
};
