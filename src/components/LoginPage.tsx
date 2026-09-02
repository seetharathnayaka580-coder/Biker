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
} from 'lucide-react';
import { AuthSession, VehicleDetails } from '../types';
import { loginUser, registerAdminUser } from '../lib/firebase';
import { fetchClientNetworkInfo, ClientNetworkInfo } from '../utils/ipTracker';
import { ALL_DISTRICTS, ALL_PROVINCES, SRI_LANKA_REGIONS } from '../data/sriLankaRegions';

interface LoginPageProps {
  onLoginSuccess: (session: AuthSession) => void;
  vehicle?: VehicleDetails;
  onOpenInstall?: () => void;
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

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, vehicle, onOpenInstall }) => {
  // Mode: Sign In or Sign Up
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Lamp state (Turned on by default, can be toggled via the hanging cord)
  const [isLampOn, setIsLampOn] = useState(true);
  const [isCordPulled, setIsCordPulled] = useState(false);

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
  const [detectedNetInfo, setDetectedNetInfo] = useState<ClientNetworkInfo | null>(null);

  React.useEffect(() => {
    fetchClientNetworkInfo().then((info) => {
      setDetectedNetInfo(info);
    });
  }, []);

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

    if (!signUpOwnerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!signUpUsername.trim()) {
      setErrorMsg('Please choose a username.');
      return;
    }
    if (!signUpPassword.trim() || signUpPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (!signUpBikeNumber.trim()) {
      setErrorMsg('Please enter your bike registration plate number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerAdminUser({
        ownerName: signUpOwnerName.trim(),
        username: signUpUsername.trim(),
        password: signUpPassword.trim(),
        bikeNumber: signUpBikeNumber.trim().toUpperCase(),
        province: signUpProvince,
        district: signUpDistrict,
      });

      setSuccessMsg('Admin account created! Launching your log book...');
      setTimeout(() => {
        onLoginSuccess(result.session);
      }, 700);
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

        {/* Live Detected IP & Security Badge */}
        {detectedNetInfo && (
          <div className="mt-3 p-2.5 rounded-2xl bg-[#0b0e14]/90 border border-sky-500/30 backdrop-blur-md flex items-center justify-between gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-zinc-400 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-zinc-400 font-sans">Network IP:</span>
              <span className="text-sky-300 font-bold font-mono truncate">{detectedNetInfo.ip}</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-sans truncate">
              📍 {detectedNetInfo.city || 'Sri Lanka'}
            </span>
          </div>
        )}

        {/* App Owner & Direct Support Access */}
        <div className="mt-3 p-3.5 rounded-2xl bg-[#090d16]/90 border border-emerald-500/30 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              App Owner & Support:
            </span>
            <span className="text-[10px] font-mono text-emerald-300 font-semibold">
              Sachintha Pathum
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="https://wa.me/94763961123?text=Hi%20Sachintha,%20I'm%20contacting%20you%20regarding%20the%20Bike%20Service%20Log%20Book%20login."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-400/40" />
              <span>WhatsApp (+94 763961123)</span>
            </a>

            <a
              href="https://t.me/X_x_x_xzZ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-all"
            >
              <Send className="w-3.5 h-3.5 fill-sky-400/40" />
              <span>Telegram (@X_x_x_xzZ)</span>
            </a>
          </div>
        </div>

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
