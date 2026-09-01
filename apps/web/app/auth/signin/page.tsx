'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/authContext';
import { checkUserProfileExists } from '../../../lib/supabaseAuth';
import { Button } from '@soul-tribe/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Sparkles, AlertCircle, Lock, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 mr-3 shrink-0 opacity-60" viewBox="0 0 24 24">
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

function WorkingSignInForm() {
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

  // Primary mode: 'signup' (Create Account) or 'signin' (Sign In)
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Toggle state for secondary notes
  const [showOtherMethodsNote, setShowOtherMethodsNote] = useState(false);

  // Auto-redirect signed-in users based on profile presence
  React.useEffect(() => {
    if (user && !authLoading) {
      checkUserProfileExists(user.id).then((hasProfile) => {
        router.push(hasProfile ? redirectPath : '/onboarding');
      });
    }
  }, [user, authLoading, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address (e.g., name@example.com).');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    if (mode === 'signup') {
      const { error, user: signedUpUser } = await signUpWithPassword(trimmedEmail, password);
      setIsSubmitting(false);

      if (error) {
        setErrorMessage(error.message || 'Failed to create account. Please check your details.');
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
        setErrorMessage(error.message || 'Invalid email or password. Please try again.');
        return;
      }

      if (signedInUser) {
        const hasProfile = await checkUserProfileExists(signedInUser.id);
        router.push(hasProfile ? redirectPath : '/onboarding');
      }
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[420px]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-white/20 bg-black/85 p-8 backdrop-blur-2xl shadow-2xl"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-inner">
            <Sparkles className="h-7 w-7 text-amber-300" />
          </div>
          <span className="mt-3.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur-md">
            Soul Tribe · Authentication
          </span>
          <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-white">
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-white/75">
            {mode === 'signup'
              ? 'Enter your email & password to start onboarding.'
              : 'Sign in with your email and password.'}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-[16px] border border-amber-400/40 bg-amber-500/10 p-4 text-[13px] text-amber-200">
            <p className="font-semibold text-amber-300">Environment Configuration Required</p>
            <p className="mt-1 text-amber-200/90 leading-relaxed">
              Missing Supabase environment variables (<code className="text-amber-100 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> & <code className="text-amber-100 font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>).
            </p>
          </div>
        )}

        {/* PRIMARY MODE TABS (CREATE ACCOUNT vs SIGN IN) */}
        <div className="mt-6 flex rounded-[16px] border border-white/15 bg-black/60 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 rounded-[12px] py-2.5 text-[13px] font-bold transition-all ${
              mode === 'signup'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 rounded-[12px] py-2.5 text-[13px] font-bold transition-all ${
              mode === 'signin'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* WORKING EMAIL + PASSWORD FORM */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="auth-email" className="block text-[13px] font-semibold text-white">
              Email Address
            </label>
            <div className="relative mt-2">
              <Mail className="absolute left-3.5 top-3 h-5 w-5 text-white/50" />
              <input
                id="auth-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-[14px] border border-white/20 bg-black/60 pl-11 pr-4 text-[14px] text-white placeholder-white/40 outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-[13px] font-semibold text-white">
              Password <span className="text-[11.5px] font-normal text-white/60">(min 8 characters)</span>
            </label>
            <div className="relative mt-2">
              <Lock className="absolute left-3.5 top-3 h-5 w-5 text-white/50" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-[14px] border border-white/20 bg-black/60 pl-11 pr-4 text-[14px] text-white placeholder-white/40 outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
            </div>
          </div>

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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="w-full justify-center py-3.5 text-[14px] font-bold"
          >
            {isSubmitting
              ? mode === 'signup'
                ? 'Creating Account...'
                : 'Signing In...'
              : mode === 'signup'
              ? 'Create Account & Start Onboarding →'
              : 'Sign In →'}
          </Button>
        </form>

        {/* DIVIDER & DISABLED/COMING SOON OPTIONS */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-[1px] flex-1 bg-white/15" />
          <span className="text-[11.5px] font-semibold text-white/35 uppercase tracking-wider">Other Options</span>
          <div className="h-[1px] flex-1 bg-white/15" />
        </div>

        {/* DISABLED GOOGLE BUTTON WITH CLEAR NOTE */}
        <div className="space-y-3">
          <button
            type="button"
            disabled
            className="flex h-11 w-full items-center justify-center rounded-[16px] border border-white/10 bg-white/5 px-4 text-[13.5px] font-semibold text-white/40 cursor-not-allowed"
          >
            <GoogleIcon />
            Continue with Google <span className="ml-2 text-[11px] font-bold text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded-full">(Coming Soon)</span>
          </button>
        </div>

        {/* COLLAPSIBLE NOTE FOR MAGIC LINK / 6-DIGIT CODE */}
        <div className="mt-4 pt-2 text-center">
          <button
            type="button"
            onClick={() => setShowOtherMethodsNote(!showOtherMethodsNote)}
            className="text-[12px] text-white/50 hover:text-white/80 transition-all underline underline-offset-4"
          >
            {showOtherMethodsNote ? 'Hide note on email links & OTP codes' : 'Why is email link / 6-digit code sign-in disabled?'}
          </button>

          {showOtherMethodsNote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 rounded-[14px] border border-white/15 bg-white/5 p-3.5 text-[12px] text-white/70 text-left leading-relaxed"
            >
              Email magic links and 6-digit OTP codes are currently disabled until custom SMTP provider setup is completed. Please use <strong>Email + Password</strong> above to sign in or create your account.
            </motion.div>
          )}
        </div>
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
        <WorkingSignInForm />
      </React.Suspense>
    </div>
  );
}
