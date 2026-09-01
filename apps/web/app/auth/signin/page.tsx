'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/authContext';
import { checkUserProfileExists } from '../../../lib/supabaseAuth';
import { Button } from '@soul-tribe/ui';
import { motion } from 'framer-motion';
import { Mail, Sparkles, AlertCircle, CheckCircle2, Lock, KeyRound } from 'lucide-react';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/home';

  const {
    signInWithOtp,
    signUpWithPassword,
    signInWithPassword,
    user,
    loading: authLoading,
    isSupabaseConfigured,
  } = useAuth();

  const [authMethod, setAuthMethod] = useState<'magic_link' | 'password'>('magic_link');
  const [passwordMode, setPasswordMode] = useState<'signin' | 'signup'>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  // If already signed in, redirect based on profile presence
  React.useEffect(() => {
    if (user && !authLoading) {
      checkUserProfileExists(user.id).then((hasProfile) => {
        router.push(hasProfile ? redirectPath : '/onboarding');
      });
    }
  }, [user, authLoading, redirectPath, router]);

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address format (e.g., name@example.com).');
      return;
    }

    setIsSubmitting(true);

    // Pass destination redirectPath to signInWithOtp
    const { error } = await signInWithOtp(trimmedEmail, redirectPath);

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(
        error.message || 'Unable to send magic link right now. Please verify your email and try again.'
      );
      setLinkSent(false);
    } else {
      setSentEmail(trimmedEmail);
      setLinkSent(true);
      setErrorMessage(null);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address format (e.g., name@example.com).');
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
        setErrorMessage(error.message || 'Failed to create account. Please try again.');
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
        className="rounded-[32px] border border-white/20 bg-black/75 p-8 backdrop-blur-2xl shadow-2xl"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-inner">
            <Sparkles className="h-7 w-7" />
          </div>
          <span className="mt-3.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur-md">
            Soul Tribe · Sign In
          </span>
          <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-1.5 text-[14px] text-white/70">
            Sign in or create your Soul Tribe account.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-[16px] border border-amber-400/40 bg-amber-500/10 p-4 text-[13px] text-amber-200">
            <p className="font-semibold text-amber-300">Environment Setup Note</p>
            <p className="mt-1 text-amber-200/90 leading-relaxed">
              Supabase environment variables (<code className="text-amber-100">NEXT_PUBLIC_SUPABASE_URL</code> & <code className="text-amber-100">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>) are not configured. Sign in will connect once configured.
            </p>
          </div>
        )}

        {/* AUTH METHOD SELECTOR TABS */}
        <div className="mt-6 flex rounded-[16px] border border-white/15 bg-black/40 p-1">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('magic_link');
              setErrorMessage(null);
            }}
            className={`flex-1 rounded-[12px] py-2 text-[12.5px] font-bold transition-all ${
              authMethod === 'magic_link'
                ? 'bg-white text-black shadow'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Magic Link
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('password');
              setErrorMessage(null);
            }}
            className={`flex-1 rounded-[12px] py-2 text-[12.5px] font-bold transition-all ${
              authMethod === 'password'
                ? 'bg-white text-black shadow'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Email + Password
          </button>
        </div>

        {/* SUCCESS / CHECK YOUR EMAIL STATE FOR MAGIC LINK */}
        {authMethod === 'magic_link' && linkSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 flex flex-col items-center text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/20 text-emerald-300">
              <Mail className="h-8 w-8" />
            </div>

            <h2 className="mt-4 text-[22px] font-extrabold text-white">
              Check your email
            </h2>

            <p className="mt-2 text-[14px] text-white/80 leading-relaxed">
              We sent a magic sign-in link to:
              <br />
              <strong className="text-white font-mono">{sentEmail}</strong>
            </p>

            <p className="mt-4 text-[12.5px] text-white/60">
              Click the link in the email to automatically sign in and continue.
            </p>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setLinkSent(false);
                setErrorMessage(null);
              }}
              className="mt-6 w-full"
            >
              Use a different email
            </Button>
          </motion.div>
        ) : authMethod === 'magic_link' ? (
          /* MAGIC LINK FORM */
          <form onSubmit={handleMagicLinkSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email-input" className="block text-[13px] font-semibold text-white">
                Email Address
              </label>
              <div className="relative mt-2">
                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-white/50" />
                <input
                  id="email-input"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              {isSubmitting ? 'Sending Magic Link...' : 'Send Magic Link ✨'}
            </Button>

            <p className="text-center text-[12px] text-white/50">
              No password required. We'll email you a secure one-click sign in link.
            </p>
          </form>
        ) : (
          /* EMAIL + PASSWORD FORM */
          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
            {/* Sub-mode selector (Sign In vs Sign Up) */}
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
                Sign In
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
                Create Account (Sign Up)
              </button>
            </div>

            <div>
              <label htmlFor="pwd-email-input" className="block text-[13px] font-semibold text-white">
                Email Address
              </label>
              <div className="relative mt-2">
                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-white/50" />
                <input
                  id="pwd-email-input"
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
              <label htmlFor="password-input" className="block text-[13px] font-semibold text-white">
                Password <span className="text-[11.5px] font-normal text-white/60">(min 8 characters)</span>
              </label>
              <div className="relative mt-2">
                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-white/50" />
                <input
                  id="password-input"
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
                ? passwordMode === 'signup'
                  ? 'Creating Account...'
                  : 'Signing In...'
                : passwordMode === 'signup'
                ? 'Create Account ✨'
                : 'Sign In →'}
            </Button>
          </form>
        )}
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
        <SignInForm />
      </React.Suspense>
    </div>
  );
}
