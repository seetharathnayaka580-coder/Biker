import React, { useState } from 'react';
import {
  Bike,
  Shield,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Flame,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Gauge,
  Zap,
} from 'lucide-react';
import { AuthSession } from '../types';
import { signInWithGooglePopup } from '../lib/firebase';

interface LoginPageProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'google'>('admin');
  
  // Admin form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revving, setRevving] = useState(false);

  // Google sign in state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    setRevving(true);

    setTimeout(() => {
      setRevving(false);
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
        setErrorMsg('Invalid Credentials. Admin username is "Sachi" and password is "988800".');
      }
    }, 600);
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
      console.warn('Google sign-in popup notice:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('popup-closed-by-user') || errMsg.includes('cancelled-popup-request')) {
        setGoogleError('Sign-in popup closed. You can also click "Continue as Guest Client" below.');
      } else {
        setGoogleError('Google Sign-In encountered an issue. Try guest direct access below.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleDirectGuestClient = () => {
    const session: AuthSession = {
      role: 'client',
      username: 'Client Viewer',
      email: 'client@guest.local',
      signedInAt: new Date().toISOString(),
    };
    onLoginSuccess(session);
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#eef1f4] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Motoring Grid & Lighting Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Carbon Pattern Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)`,
          backgroundSize: '10px 10px',
        }}
      />

      <div className="w-full max-w-xl relative z-10">
        {/* Motorcycle Cockpit Header Card */}
        <div className="text-center mb-6">
          {/* Animated Motorcycle Emblem */}
          <div className="relative inline-block mb-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-zinc-900 via-[#161a22] to-zinc-950 border-2 border-amber-500/40 flex items-center justify-center shadow-2xl shadow-amber-500/20 relative group">
              <Bike className={`w-10 h-10 sm:w-12 sm:h-12 text-amber-400 transition-transform duration-300 ${revving ? 'animate-bounce' : 'group-hover:scale-110'}`} />
              
              {/* Tachometer RPM Ring Glow */}
              <div className="absolute -inset-1 rounded-3xl border border-amber-400/30 blur-[2px] animate-pulse pointer-events-none" />
              
              {/* Status LED */}
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-[#0a0c10]"></span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25">
              BKT-1374
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50">
              Sri Lanka
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-wider text-white uppercase mt-1">
            Bajaj Pulsar <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-400 to-amber-500">N160</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-md mx-auto">
            Official Digital Service Log Book & Electronic Maintenance System
          </p>

          {/* Motorcycle HUD Quick Spec Strip */}
          <div className="flex items-center justify-center gap-3 mt-3 text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-amber-400" />
              164.82cc DTS-i
            </span>
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Dual-Channel ABS
            </span>
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-red-400" />
              Brooklyn Black
            </span>
          </div>
        </div>

        {/* Auth Mode Switcher / Dashboard Console */}
        <div className="bg-[#12151d] border border-[#262c39] rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/80 backdrop-blur-xl relative">
          {/* Top Toggle Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-[#0a0c11] rounded-2xl border border-[#202532] mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setErrorMsg(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-display font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/25'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <Lock className="w-4 h-4" />
              Admin Login
              <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded ${
                activeTab === 'admin' ? 'bg-zinc-950/30 text-zinc-900 font-black' : 'bg-zinc-800 text-zinc-400'
              }`}>
                Sachi
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('google');
                setGoogleError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-display font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'google'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/25'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <User className="w-4 h-4" />
              Google Sign-In
              <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded ${
                activeTab === 'google' ? 'bg-black/30 text-white font-bold' : 'bg-zinc-800 text-zinc-400'
              }`}>
                Client View
              </span>
            </button>
          </div>

          {/* TAB 1: ADMIN LOGIN FORM */}
          {activeTab === 'admin' && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#212632]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-display font-bold text-white tracking-wide">
                      Admin Portal (Full Access)
                    </h2>
                    <p className="text-[11px] text-zinc-400">
                      Edit odometer, record maintenance, manage bike details
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  Owner Level
                </span>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Admin Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username (Sachi)"
                      className="w-full bg-[#0a0c11] border border-[#2a303f] focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 transition-all font-mono"
                      required
                      autoFocus
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-zinc-500">
                      User: Sachi
                    </span>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Passcode Key
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (988800)"
                      className="w-full bg-[#0a0c11] border border-[#2a303f] focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 transition-all font-mono tracking-widest"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1 cursor-pointer"
                      title={showPassword ? 'Hide passcode' : 'Show passcode'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Auto-Fill Credential Helper for Convenience */}
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                  <span>Authorized bike master credentials</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('Sachi');
                      setPassword('988800');
                    }}
                    className="text-amber-400 hover:text-amber-300 hover:underline font-mono cursor-pointer"
                  >
                    Quick Fill (Sachi / 988800)
                  </button>
                </div>

                {/* Ignition / Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-display font-black text-sm tracking-wider text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 border border-amber-300/40 shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 uppercase disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-zinc-950" />
                      Igniting Engine & Verifying...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Unlock Admin Workspace
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: GOOGLE SIGN-IN / CLIENT ACCESS */}
          {activeTab === 'google' && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#212632]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-display font-bold text-white tracking-wide">
                      Client / Buyer / Guest View
                    </h2>
                    <p className="text-[11px] text-zinc-400">
                      Official verified inspection view with restricted editing & copying
                    </p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex text-[10px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                  Read Only
                </span>
              </div>

              {googleError && (
                <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{googleError}</span>
                </div>
              )}

              {/* Client Access Policy Card */}
              <div className="p-3.5 rounded-2xl bg-[#0a0c11] border border-[#202532] mb-5 space-y-2">
                <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Client Mode Security Policies Enforced:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>View complete service logs</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>View odometer & schedule</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-red-400">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Editing options disabled</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-red-400">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Text & detail copy disabled</span>
                  </div>
                </div>
              </div>

              {/* Official Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-3 px-4 rounded-xl font-medium text-sm text-white bg-[#1a1f2c] hover:bg-[#232a3b] border border-[#343e52] hover:border-zinc-500 transition-all cursor-pointer flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 group"
              >
                {/* SVG Google Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span className="font-semibold">
                  {isGoogleLoading ? 'Connecting to Google Auth...' : 'Continue with Google Sign-In'}
                </span>
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#232a38]" />
                </div>
                <span className="relative px-3 bg-[#12151d] text-[11px] font-mono text-zinc-500 uppercase">
                  or quick preview
                </span>
              </div>

              {/* Direct Guest Client Button */}
              <button
                type="button"
                onClick={handleDirectGuestClient}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#0e1117] hover:bg-[#181c25] border border-[#262c3a] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Enter Directly as Verified Client / Buyer (Read-Only)
              </button>
            </div>
          )}
        </div>

        {/* Footer info badge */}
        <div className="text-center mt-6 text-xs text-zinc-500 flex items-center justify-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Bajaj Auto Digital Service Platform · Cloud Engine Active</span>
        </div>
      </div>
    </div>
  );
};
