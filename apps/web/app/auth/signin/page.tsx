'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/authContext';
import { checkUserProfileExists } from '../../../lib/supabaseAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, KeyRound, CheckCircle2, Lock, Mail, Key } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 mr-3 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 10.5 0 12s.6 2.8 1.6 4.8l3.7-2.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
      />
    </svg>
  );
}

function LumaSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('next') || searchParams?.get('redirect') || '/home';

  const {
    signInWithOtp,
    signInWithGoogle,
    signUpWithPassword,
    signInWithPassword,
    resetPasswordForEmail,
    user,
    loading: authLoading,
    isSupabaseConfigured,
  } = useAuth();

  // Mode: 'login' | 'forgot_password'
  const [view, setView] = useState<'login' | 'forgot_password'>('login');

  // Toggle for password mode vs Email OTP mode
  const [usePasswordMode, setUsePasswordMode] = useState(true);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [otpSentSuccess, setOtpSentSuccess] = useState(false);

  // Remembered password / email local storage check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('soul_tribe_saved_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, []);

  // Auto-redirect signed-in users based on profile presence
  useEffect(() => {
    if (user && !authLoading) {
      checkUserProfileExists(user.id).then((hasProfile) => {
        router.push(hasProfile ? redirectPath : '/onboarding');
      });
    }
  }, [user, authLoading, redirectPath, router]);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setOtpSentSuccess(false);
    setIsSubmitting(true);

    const { error } = await signInWithGoogle(redirectPath);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Google sign-in failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setOtpSentSuccess(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Save or clear remembered email
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        localStorage.setItem('soul_tribe_saved_email', trimmedEmail);
      } else {
        localStorage.removeItem('soul_tribe_saved_email');
      }
    }

    setIsSubmitting(true);

    if (usePasswordMode) {
      if (!password || password.length < 8) {
        setIsSubmitting(false);
        setErrorMessage('Password must be at least 8 characters long.');
        return;
      }

      // Try sign-in first, if user doesn't exist try sign-up
      const { error: signInErr, user: signedInUser } = await signInWithPassword(trimmedEmail, password);

      if (signInErr) {
        if (signInErr.message.includes('Invalid login credentials') || signInErr.message.includes('User not found')) {
          // Attempt sign-up for new users seamlessly
          const { error: signUpErr, user: signedUpUser } = await signUpWithPassword(trimmedEmail, password);
          setIsSubmitting(false);

          if (signUpErr) {
            setErrorMessage(signUpErr.message || 'Invalid email or password. Please try again.');
            return;
          }

          if (signedUpUser) {
            const hasProfile = await checkUserProfileExists(signedUpUser.id);
            router.push(hasProfile ? redirectPath : '/onboarding');
            return;
          }
        }

        setIsSubmitting(false);
        setErrorMessage(signInErr.message || 'Failed to sign in. Please check your password.');
        return;
      }

      setIsSubmitting(false);
      if (signedInUser) {
        const hasProfile = await checkUserProfileExists(signedInUser.id);
        router.push(hasProfile ? redirectPath : '/onboarding');
      }
    } else {
      // Email OTP mode - pass redirectPath through as next=... parameter
      const { error } = await signInWithOtp(trimmedEmail, redirectPath);
      setIsSubmitting(false);

      if (error) {
        setErrorMessage(error.message || 'Unable to send Email OTP link right now.');
        return;
      }

      setOtpSentSuccess(true);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await resetPasswordForEmail(trimmedEmail);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to send password reset email.');
      return;
    }

    setResetSuccessMessage('Password reset link sent! Please check your email inbox.');
  };

  return (
    <div className="relative z-10 w-full max-w-[420px]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-white/15 bg-[#09090b]/90 p-8 backdrop-blur-2xl shadow-2xl text-white"
      >
        <AnimatePresence mode="wait">
          {view === 'login' ? (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
            >
              {/* Header Icon */}
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#18181b] text-white shadow-inner">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mt-5 text-center">
                <h1 className="text-[26px] font-extrabold tracking-tight text-white">
                  Welcome to Soul Tribe
                </h1>
                <p className="mt-1.5 text-[14px] text-white/70">
                  Log in or sign up to get started.
                </p>
              </div>

              {!isSupabaseConfigured && (
                <div className="mt-5 rounded-[16px] border border-amber-400/40 bg-amber-500/10 p-3.5 text-[12.5px] text-amber-200">
                  <p className="font-semibold text-amber-300">Environment Configuration Required</p>
                  <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                    Set <code className="text-amber-100 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> & <code className="text-amber-100 font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>.
                  </p>
                </div>
              )}

              {/* Google OAuth Button (Active) */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center rounded-[16px] border border-white/20 bg-[#18181b] hover:bg-[#27272a] active:scale-[0.99] text-[14.5px] font-bold text-white shadow-sm transition-all cursor-pointer"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </div>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-white/15" />
                <span className="text-[11.5px] font-bold tracking-widest text-white/40 uppercase">OR</span>
                <div className="h-[1px] flex-1 bg-white/15" />
              </div>

              {/* Tab Selector for Password vs Email OTP */}
              <div className="flex rounded-[16px] border border-[#27272a] bg-black/60 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setUsePasswordMode(true);
                    setErrorMessage(null);
                    setOtpSentSuccess(false);
                  }}
                  className={`flex-1 rounded-[12px] py-2 text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    usePasswordMode
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Key className="h-3.5 w-3.5" /> Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsePasswordMode(false);
                    setErrorMessage(null);
                    setOtpSentSuccess(false);
                  }}
                  className={`flex-1 rounded-[12px] py-2 text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    !usePasswordMode
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" /> Email OTP
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="auth-email-input" className="block text-[13.5px] font-semibold text-white mb-2">
                    Email Address
                  </label>
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-[16px] border border-[#27272a] bg-black/60 px-4 text-[14px] text-white placeholder-white/40 outline-none focus:border-white/60 focus:ring-1 focus:ring-white/60 transition-all"
                  />
                </div>

                {/* Password input when password mode is active */}
                {usePasswordMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2 pt-1"
                  >
                    <label htmlFor="auth-password-input" className="block text-[13.5px] font-semibold text-white">
                      Password
                    </label>
                    <input
                      id="auth-password-input"
                      type="password"
                      required
                      minLength={8}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-[16px] border border-[#27272a] bg-black/60 px-4 text-[14px] text-white placeholder-white/40 outline-none focus:border-white/60 focus:ring-1 focus:ring-white/60 transition-all"
                    />
                    <div className="flex justify-end pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setView('forgot_password');
                          setErrorMessage(null);
                        }}
                        className="text-[12.5px] font-medium text-white/60 hover:text-white underline underline-offset-4 transition-all cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Remember me checkbox */}
                    <div className="pt-2 flex items-center gap-2">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-[#3f3f46] bg-black text-white focus:ring-0 accent-white cursor-pointer"
                      />
                      <label htmlFor="remember-me" className="text-[12.5px] text-white/70 cursor-pointer select-none">
                        Remember password on this device
                      </label>
                    </div>
                  </motion.div>
                )}

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[14px] border border-rose-500/40 bg-rose-500/15 p-3.5 text-[13px] text-rose-200 flex items-start gap-2.5"
                  >
                    <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {otpSentSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[14px] border border-emerald-500/40 bg-emerald-500/15 p-3.5 text-[13px] text-emerald-200 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                    <span>Email OTP link sent! Check your inbox to complete sign-in.</span>
                  </motion.div>
                )}

                {/* Primary Cream Pill CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-[16px] bg-[#FDFBF7] hover:bg-white active:scale-[0.99] text-black font-extrabold text-[15px] transition-all shadow-lg flex items-center justify-center gap-2 mt-3 cursor-pointer"
                >
                  {isSubmitting
                    ? 'Processing...'
                    : usePasswordMode
                    ? 'Continue with Email →'
                    : 'Send Email OTP →'}
                </button>
              </form>

              {/* Underlined Sub-action Toggle */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setUsePasswordMode(!usePasswordMode);
                    setErrorMessage(null);
                    setOtpSentSuccess(false);
                  }}
                  className="text-[13px] font-medium text-white/70 hover:text-white underline underline-offset-4 transition-all cursor-pointer"
                >
                  {usePasswordMode ? 'Sign in with Email OTP instead' : 'Sign in with password instead'}
                </button>
              </div>
            </motion.div>
          ) : (
            /* FORGOT PASSWORD VIEW */
            <motion.div
              key="forgot-password-view"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
            >
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#18181b] text-amber-300 shadow-inner">
                  <KeyRound className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-5 text-center">
                <h2 className="text-[24px] font-extrabold tracking-tight text-white">
                  Reset Your Password
                </h2>
                <p className="mt-1.5 text-[13.5px] text-white/70">
                  Enter your email address and we'll send you a password reset link.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="reset-email-input" className="block text-[13.5px] font-semibold text-white mb-2">
                    Email Address
                  </label>
                  <input
                    id="reset-email-input"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-[16px] border border-[#27272a] bg-black/60 px-4 text-[14px] text-white placeholder-white/40 outline-none focus:border-white/60 focus:ring-1 focus:ring-white/60 transition-all"
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-[14px] border border-rose-500/40 bg-rose-500/15 p-3.5 text-[13px] text-rose-200 flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {resetSuccessMessage && (
                  <div className="rounded-[14px] border border-emerald-500/40 bg-emerald-500/15 p-3.5 text-[13px] text-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                    <span>{resetSuccessMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-[16px] bg-[#FDFBF7] hover:bg-white active:scale-[0.99] text-black font-extrabold text-[15px] transition-all shadow-lg flex items-center justify-center cursor-pointer mt-3"
                >
                  {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link →'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setErrorMessage(null);
                    setResetSuccessMessage(null);
                  }}
                  className="text-[13px] font-medium text-white/70 hover:text-white underline underline-offset-4 transition-all cursor-pointer"
                >
                  ← Back to log in
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black p-4 text-white">
      {/* Background ambient canvas photo */}
      <img
        src="/user-onboarding-bg.jpg"
        alt="Background"
        className="fixed inset-0 h-full w-full object-cover opacity-50 z-0"
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      <React.Suspense
        fallback={
          <div className="relative z-10 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-[13px] text-white/70">Loading sign in...</p>
          </div>
        }
      >
        <LumaSignInForm />
      </React.Suspense>
    </div>
  );
}
