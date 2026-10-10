import React, { useState } from 'react';
import { NovaOrb } from './NovaOrb';
import { OrbSettings, UserProfile } from '../types/chat';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  User,
  X,
  CheckCircle,
} from 'lucide-react';

interface AuthScreenProps {
  onComplete: (profile: UserProfile) => void;
  onClose?: () => void;
  currentProfile: UserProfile;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onComplete,
  onClose,
  currentProfile,
}) => {
  const [stage, setStage] = useState<'intro' | 'signin' | 'signup'>('intro');
  const [email, setEmail] = useState(currentProfile.email || 'editbhai846@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState(currentProfile.name || 'THE EDITOR STAR');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const previewOrbSettings: OrbSettings = {
    orbType: 'energy',
    color: 'crimson',
    size: 1.0,
    animationIntensity: 1.0,
    particleEffects: true,
    auraBorderMode: false,
    voiceVisualizer: false,
    hapticFeedback: false,
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setNotice('Please enter an email address.');
      return;
    }
    const profile: UserProfile = {
      name: name.trim() || 'NOVA Explorer',
      email: email.trim(),
      avatar: currentProfile.avatar,
      isLoggedIn: true,
      isGuest: false,
      themeStyle: 'auraRed',
    };
    onComplete(profile);
  };

  const handleGuestMode = () => {
    const profile: UserProfile = {
      name: 'THE EDITOR STAR',
      email: 'guest@nova.ai',
      avatar: currentProfile.avatar,
      isLoggedIn: true,
      isGuest: true,
      themeStyle: 'auraRed',
    };
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07070a] overflow-y-auto flex flex-col justify-between p-6 select-none animate-fadeIn">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_8px_#ff1e38]" />
          <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">
            NOVA
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {stage === 'intro' ? (
        /* Intro Carousel Slide (Matches Screenshot 6) */
        <div className="flex flex-col items-center justify-center my-auto text-center px-4">
          <div className="my-6">
            <NovaOrb
              state="idle"
              settings={previewOrbSettings}
              interactive={false}
              className="scale-110"
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            Discover Intelligence with NOVA AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mb-8 leading-relaxed">
            NOVA AI, crafted to bring you smarter, advanced & intuitive neural voice solutions.
          </p>

          {/* Pagination Dots */}
          <div className="flex items-center space-x-2 mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#ff1e38]" />
            <span className="w-2 h-2 rounded-full bg-slate-700" />
            <span className="w-2 h-2 rounded-full bg-slate-700" />
            <span className="w-2 h-2 rounded-full bg-slate-700" />
          </div>

          {/* Get Started Button */}
          <button
            onClick={() => setStage('signin')}
            className="w-full max-w-xs py-3.5 px-6 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(255,30,56,0.6)] flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleGuestMode}
            className="mt-4 text-xs text-slate-400 hover:text-slate-200 underline tracking-wide"
          >
            Continue as Guest / Local Demo Mode
          </button>
        </div>
      ) : (
        /* Sign In / Sign Up Form (Matches Screenshot 7) */
        <div className="flex flex-col items-center justify-center my-auto max-w-sm w-full mx-auto">
          <div className="text-center mb-6">
            <div className="w-9 h-9 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mb-3 shadow-[0_0_15px_rgba(255,30,56,0.3)]">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {stage === 'signup' ? 'Create Your Account' : 'Sign In To Your Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Access your account to manage settings, preferences & more.
            </p>
          </div>

          {notice && (
            <div className="w-full mb-4 p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs text-center">
              {notice}
            </div>
          )}

          <form onSubmit={handleSignIn} className="w-full space-y-3.5">
            {stage === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. THE EDITOR STAR"
                    className="w-full bg-[#13131c] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#13131c] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#13131c] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-[#13131c] accent-red-600"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setNotice('Password reset link dispatched to your registered address.')}
                className="text-red-400 hover:text-red-300"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(255,30,56,0.6)] active:scale-95 transition-all mt-2"
            >
              Get Started
            </button>
          </form>

          {/* Or Divider */}
          <div className="w-full flex items-center my-4">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-3 text-[11px] text-slate-500 uppercase font-mono">Or</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGuestMode}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white text-xs font-semibold flex items-center justify-center space-x-2.5 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Toggle between Sign In & Sign Up */}
          <div className="mt-4 text-xs text-slate-400 text-center">
            {stage === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setStage('signup')}
                  className="text-red-400 font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setStage('signin')}
                  className="text-red-400 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer Branding (Matches Screenshot 8 & 12) */}
      <div className="text-center pt-4 border-t border-white/5">
        <p className="text-[11px] text-slate-500 font-mono">
          Intelligence that understands. Companion that <span className="text-red-500">cares.</span>
        </p>
      </div>
    </div>
  );
};
