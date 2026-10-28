import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signin',
}) => {
  const { signIn, signUp, resetPassword, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset errors when mode changes
  const switchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Password reset instructions have been sent to your email.');
      }
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        onClose();
      }
    } else if (mode === 'signup') {
      const { error, user, session } = await signUp(email, password);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else if (user && user.identities && user.identities.length === 0) {
        setErrorMsg('An account with this email already exists.');
      } else if (session) {
        setSuccessMsg('Account created successfully! You are now logged in.');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setSuccessMsg('Account created! Please check your email to confirm registration, then sign in.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'signin'
          ? 'Sign in to PocketPilot Cloud'
          : mode === 'signup'
          ? 'Create PocketPilot Account'
          : 'Reset Your Password'
      }
      description={
        mode === 'forgot'
          ? 'Enter your email to receive recovery instructions.'
          : 'Sync and recover your transactions and budgets across devices.'
      }
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Unconfigured Notice */}
        {!isConfigured && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Supabase Cloud Credentials Required</p>
                <p className="mt-1 text-amber-800 leading-relaxed">
                  To enable cloud sync and authentication, add your project credentials to the <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-mono">.env</code> file:
                </p>
                <ul className="list-disc list-inside mt-1 font-mono text-[11px] text-amber-900 space-y-0.5">
                  <li>VITE_SUPABASE_URL="https://your-project.supabase.co"</li>
                  <li>VITE_SUPABASE_ANON_KEY="your-anon-key"</li>
                </ul>
                <p className="mt-1.5 text-amber-700">
                  PocketPilot continues to work 100% offline via your browser's local IndexedDB.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab switcher for Sign In / Sign Up */}
        {mode !== 'forgot' && isConfigured && (
          <div className="flex p-1 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-white text-[#047857] shadow-xs font-bold'
                  : 'text-[#475569] hover:text-[#1F2937]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#047857] shadow-xs font-bold'
                  : 'text-[#475569] hover:text-[#1F2937]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#D1FAE5] border border-[#047857]/20 text-xs text-[#047857]">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857]"
                disabled={loading || !isConfigured}
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#1F2937]">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-[11px] font-medium text-[#047857] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857]"
                  disabled={loading || !isConfigured}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1F2937] p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#CBD5E1] bg-white text-[#1F2937] focus:outline-hidden focus:ring-2 focus:ring-[#047857]"
                  disabled={loading || !isConfigured}
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !isConfigured}
              className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-[#047857] hover:bg-[#065f46] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'signin' ? (
                <span>Sign In</span>
              ) : mode === 'signup' ? (
                <span>Create Cloud Account</span>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </div>
        </form>

        {mode === 'forgot' && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="text-xs font-semibold text-[#047857] hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* Security footnote */}
        <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#047857]" />
          <span>Protected by PostgreSQL Row Level Security (RLS)</span>
        </div>
      </div>
    </Modal>
  );
};
