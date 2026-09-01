'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/authContext';
import { checkUserProfileExists } from '../../../lib/supabaseAuth';
import { Button } from '@soul-tribe/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Sparkles, AlertCircle, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

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
  const redirectPath = searchParams?.get('redirect') || '/home';

  const {
    signInWithOtp,
    verifyOtp,
    signInWithGoogle,
    signUpWithPassword,
    signInWithPassword,
    user,
    loading: authLoading,
    isSupabaseConfigured,
  } = useAuth();

  // Screen steps: 'email_input' | 'verify_code' | 'password_input'
  const [step, setStep] = useState<'email_input' | 'verify_code' | 'password_input'>('email_input');
  const [passwordMode, setPasswordMode] = useState<'signin' | 'signup'>('signin');

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-redirect signed-in users
  React.useEffect(() => {
    if (user && !authLoading) {
      checkUserProfileExists(user.id).then((hasProfile) => {
        router.push(hasProfile ? redirectPath : '/onboarding');
      });
    }
  }, [user, authLoading, redirectPath, router]);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleSubmitting(true);
    const { error } = await signInWithGoogle(redirectPath);
    setIsGoogleSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Google sign-in failed. Please try again.');
    }
  };

  const handleSendEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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

    setIsSubmitting(true);
    const { error } = await signInWithOtp(trimmedEmail, redirectPath);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Unable to send sign-in code. Please try again.');
    } else {
      setStep('verify_code');
      setErrorMessage(null);
    }
  };

  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const code = otpCode.trim();
    if (code.length < 6) {
      setErrorMessage('Please enter the full 6-digit code sent to your email.');
      return;
    }

    setIsSubmitting(true);
    const { error, user: verifiedUser } = await verifyOtp(email.trim(), code);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Invalid or expired 6-digit code. Please try again.');
      return;
    }

    if (verifiedUser) {
      const hasProfile = await checkUserProfileExists(verifiedUser.id);
      router.push(hasProfile ? redirectPath : '/onboarding');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    if (passwordMode === 'signup') {
      const { error, user: signedUpUser } = await signUpWithPassword(trimmedEmail, password);
      setIsSubmitting(false);

      if (error) {
        setErrorMessage(error.message || 'Failed to create account.');
        return;
      }

      if (signedUpUser) {
        const hasProfile = await checkUserProfileExists(signedUpUser.id);
        router.push(hasProfile ? redirectPath : '/onboarding');
      }
    } else {
      const { error, user: signedInUser } = await signInWithPassword(trimmedEmail, password);
      setIsSubmitting(false);

      if (error) {
        setErrorMessage(error.message || 'Invalid email or password.');
        return;
      }

      if (signedInUser) {
        const hasProfile = await checkUserProfileExists(signedInUser.id);
        router.push(hasProfile ? redirectPath : '/onboarding');
      }
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[400px]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-white/20 bg-black/80 p-8 backdrop-blur-2xl shadow-2xl"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-[24px] font-extrabold tracking-tight text-white">
            Welcome to Soul Tribe
          </h1>
          <p className="mt-1 text-[13.5px] text-white/70">
            Log in or sign up to get started.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mt-5 rounded-[16px] border border-amber-400/40 bg-amber-500/10 p-3.5 text-[12.5px] text-amber-200">
            <p className="font-semibold text-amber-300">Configuration Required</p>
            <p className="mt-1 text-amber-200/90 leading-relaxed">
              Missing Supabase environment variables (<code className="text-amber-100 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> & <code className="text-amber-100 font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>).
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'email_input' && (
            <motion.div
              key="step-email"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="mt-6 space-y-4"
            >
              {/* GOOGLE SIGN IN (LUMA PRIMARY OPTION) */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSubmitting}
                className="flex h-11 w-full items-center justify-center rounded-[16px] border border-white/20 bg-white/10 px-4 text-[14px] font-bold text-white transition-all hover:bg-white/20 active:scale-[0.99] disabled:opacity-50"
              >
                <GoogleIcon />
                {isGoogleSubmitting ? 'Connecting Google...' : 'Continue with Google'}
              </button>

              {/* DIVIDER */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-[1px] flex-1 bg-white/15" />
                <span className="text-[12px] font-semibold text-white/40 uppercase tracking-wider">or</span>
                <div className="h-[1px] flex-1 bg-white/15" />
              </div>

              {/* EMAIL FORM (LUMA STYLE) */}
              <form onSubmit={handleSendEmailCode} className="space-y-3.5">
                <div>
                  <label htmlFor="luma-email" className="block text-[13px] font-semibold text-white">
                    Email Address
                  </label>
                  <input
                    id="luma-email"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[14px] border border-white/20 bg-black/60 px-4 text-[14px] text-white placeholder-white/40 outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-[14px] border border-rose-500/40 bg-rose-500/15 p-3 text-[13px] text-rose-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full justify-center py-3 text-[14px] font-bold"
                >
                  {isSubmitting ? 'Sending Code...' : 'Continue with Email →'}
                </Button>
              </form>

              {/* BOTTOM SUBTLE PASSWORD OPTION */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('password_input');
                    setErrorMessage(null);
                  }}
                  className="text-[12.5px] font-medium text-white/60 hover:text-white transition-all underline underline-offset-4"
                >
                  Sign in with password instead
                </button>
              </div>
            </motion.div>
          )}

          {step === 'verify_code' && (
            <motion.div
              key="step-verify"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="mt-6 space-y-4"
            >
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/20 text-emerald-300">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-[18px] font-extrabold text-white">Check your email</h3>
                <p className="mt-1 text-[13px] text-white/70 leading-relaxed">
                  We sent a 6-digit code & sign-in link to:
                  <br />
                  <strong className="text-white font-mono">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-3.5">
                <div>
                  <label htmlFor="otp-input" className="block text-[13px] font-semibold text-white text-center">
                    Enter 6-Digit Code
                  </label>
                  <input
                    id="otp-input"
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(val);
                      if (val.length === 6) {
                        setIsSubmitting(true);
                        verifyOtp(email.trim(), val).then(({ error, user: verifiedUser }) => {
                          setIsSubmitting(false);
                          if (error) {
                            setErrorMessage(error.message || 'Invalid code. Please try again.');
                          } else if (verifiedUser) {
                            checkUserProfileExists(verifiedUser.id).then((hasProfile) => {
                              router.push(hasProfile ? redirectPath : '/onboarding');
                            });
                          }
                        });
                      }
                    }}
                    className="mt-2 h-13 w-full rounded-[14px] border border-white/30 bg-black/80 text-center font-mono text-[22px] font-bold tracking-[0.4em] text-white outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-[14px] border border-rose-500/40 bg-rose-500/15 p-3 text-[13px] text-rose-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting || otpCode.length < 6}
                  className="w-full justify-center py-3 text-[14px] font-bold"
                >
                  {isSubmitting ? 'Verifying Code...' : 'Verify Code & Log In →'}
                </Button>
              </form>

              <div className="pt-2 flex flex-col items-center gap-2 text-center">
                <p className="text-[12px] text-white/50">
                  Or click the direct sign-in link inside your email.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email_input');
                    setErrorMessage(null);
                  }}
                  className="text-[12.5px] font-medium text-white/70 hover:text-white transition-all underline underline-offset-4"
                >
                  Use a different email address
                </button>
              </div>
            </motion.div>
          )}

          {step === 'password_input' && (
            <motion.div
              key="step-password"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 space-y-4"
            >
              <div className="flex justify-center gap-4 text-[13px]">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordMode('signin');
                    setErrorMessage(null);
                  }}
                  className={`font-semibold transition-all ${
                    passwordMode === 'signin' ? 'text-white underline underline-offset-4' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Log In
                </button>
                <span className="text-white/30">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordMode('signup');
                    setErrorMessage(null);
                  }}
                  className={`font-semibold transition-all ${
                    passwordMode === 'signup' ? 'text-white underline underline-offset-4' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                <div>
                  <label htmlFor="pwd-email" className="block text-[13px] font-semibold text-white">
                    Email Address
                  </label>
                  <input
                    id="pwd-email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[14px] border border-white/20 bg-black/60 px-4 text-[14px] text-white placeholder-white/40 outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="pwd-input" className="block text-[13px] font-semibold text-white">
                    Password <span className="text-[11.5px] font-normal text-white/60">(min 8 characters)</span>
                  </label>
                  <input
                    id="pwd-input"
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[14px] border border-white/20 bg-black/60 px-4 text-[14px] text-white placeholder-white/40 outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-[14px] border border-rose-500/40 bg-rose-500/15 p-3 text-[13px] text-rose-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full justify-center py-3 text-[14px] font-bold"
                >
                  {isSubmitting
                    ? passwordMode === 'signup'
                      ? 'Creating Account...'
                      : 'Logging In...'
                    : passwordMode === 'signup'
                    ? 'Create Account ✨'
                    : 'Log In →'}
                </Button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email_input');
                    setErrorMessage(null);
                  }}
                  className="text-[12.5px] font-medium text-white/60 hover:text-white transition-all underline underline-offset-4"
                >
                  ← Back to Email & Google sign in
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
            <p className="text-[13px] text-white/70">Loading log in...</p>
          </div>
        }
      >
        <LumaSignInForm />
      </React.Suspense>
    </div>
  );
}
