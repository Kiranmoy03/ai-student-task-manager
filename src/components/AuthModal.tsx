import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SparkleIcon } from './SparkleIcon';
import { X, Mail, Lock, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  onAuthSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onAuthSuccess }) => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal, signIn, signUp } =
    useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  // Reset inputs and messages when modal opens or mode changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setEmail('');
      setPassword('');
      setErrorMessage(null);
      setConfirmationNotice(null);
      setIsSubmitting(false);
    }
  }, [isAuthModalOpen, authModalMode]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    setConfirmationNotice(null);

    // Basic client validation
    if (!email.trim() || !password) {
      setErrorMessage('Please provide both an email address and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (authModalMode === 'signup') {
        const result = await signUp(email.trim(), password);
        if (result.error) {
          setErrorMessage(result.error.message);
        } else if (result.session) {
          // When Supabase returns a valid session (e.g. email confirmation disabled),
          // the user is treated as authenticated and goes directly to the dashboard.
          // Do not display "Check your email" when a session exists.
          setConfirmationNotice(null);
          closeAuthModal();
          if (onAuthSuccess) {
            onAuthSuccess();
          }
        } else if (result.needsEmailConfirmation) {
          // Only show when no session was returned by Supabase
          setConfirmationNotice('Check your email to confirm your account, then sign in.');
          setPassword('');
        } else {
          closeAuthModal();
        }
      } else {
        const result = await signIn(email.trim(), password);
        if (result.error) {
          setErrorMessage(result.error.message);
        } else if (result.session) {
          closeAuthModal();
          if (onAuthSuccess) {
            onAuthSuccess();
          }
        } else {
          closeAuthModal();
        }
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0f0f18] border border-violet-500/30 text-white shadow-2xl p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative purple glow in corner */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Close button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-500/30">
            <SparkleIcon size={14} className="text-white" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-violet-300 block">
              Supabase Authentication
            </span>
            <h2 id="auth-modal-title" className="text-xl font-light tracking-tight text-white">
              {authModalMode === 'signup' ? 'Create student account' : 'Welcome back'}
            </h2>
          </div>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/10 mb-6 text-xs">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors cursor-pointer ${
              authModalMode === 'login'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => openAuthModal('signup')}
            className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors cursor-pointer ${
              authModalMode === 'signup'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Confirmation notice banner (when email confirmation is needed) */}
        {confirmationNotice && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-emerald-100">{confirmationNotice}</p>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="text-[11px] underline text-emerald-300 hover:text-white pt-1 block"
              >
                Go to Sign in form
              </button>
            </div>
          </div>
        )}

        {/* Error notice banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="auth-email-input"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="auth-email-input"
                type="email"
                required
                autoComplete="email"
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password-input"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="auth-password-input"
                type="password"
                required
                autoComplete={authModalMode === 'signup' ? 'new-password' : 'current-password'}
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors disabled:opacity-50"
              />
            </div>
            {authModalMode === 'signup' && (
              <p className="text-[11px] text-slate-500 mt-1">Minimum 6 characters.</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 active:scale-[0.99] transition-all shadow-md shadow-violet-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
                  <span>{authModalMode === 'signup' ? 'Creating account...' : 'Signing in...'}</span>
                </>
              ) : (
                <>
                  <span>{authModalMode === 'signup' ? 'Create account' : 'Sign in'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-[11px] text-slate-500">
          Protected by Supabase Auth · Connected to student-task-manager
        </div>
      </div>
    </div>
  );
};
