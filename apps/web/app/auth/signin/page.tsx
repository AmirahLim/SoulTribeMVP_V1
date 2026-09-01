'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/authContext';
import { Button } from '@soul-tribe/ui';
import { motion } from 'framer-motion';
import { Mail, Sparkles, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/home';

  const { signInWithOtp, user, loading: authLoading, isSupabaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  // If already signed in, redirect to intended page
  if (user && !authLoading) {
    router.push(redirectPath);
    return null;
  }

  const handleSendMagicLink = async (e: React.FormEvent) => {
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

    const { error } = await signInWithOtp(trimmedEmail);

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
            Enter your email to receive a passwordless magic sign-in link.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-[16px] border border-amber-400/40 bg-amber-500/10 p-4 text-[13px] text-amber-200">
            <p className="font-semibold text-amber-300">Environment Setup Note</p>
            <p className="mt-1 text-amber-200/90 leading-relaxed">
              Supabase environment variables (<code className="text-amber-100">NEXT_PUBLIC_SUPABASE_URL</code> & <code className="text-amber-100">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>) are not configured locally yet. Sign in will connect once configured.
            </p>
          </div>
        )}

        {/* SUCCESS / CHECK YOUR EMAIL STATE */}
        {linkSent ? (
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
            </p>
            <p className="mt-1 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[14px] font-bold text-white">
              {sentEmail}
            </p>

            <p className="mt-4 text-[13px] text-white/60 leading-relaxed">
              Click the link in your email inbox to sign in instantly to Soul Tribe. You can close this tab after clicking the link.
            </p>

            <button
              type="button"
              onClick={() => {
                setLinkSent(false);
                setEmail('');
                setErrorMessage(null);
              }}
              className="mt-6 text-[13px] font-semibold text-white/70 hover:text-white underline underline-offset-4 transition-colors"
            >
              Use a different email address
            </button>
          </motion.div>
        ) : (
          /* SIGN IN FORM STATE */
          <form onSubmit={handleSendMagicLink} className="mt-6 flex flex-col gap-4">
            {/* Error Banner */}
            {errorMessage && (
              <div className="rounded-[16px] border border-rose-500/40 bg-rose-500/15 p-4 text-[13px] text-rose-200 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-rose-100">Unable to Send Magic Link</span>
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              </div>
            )}

            <div>
              <label className="text-[13px] font-semibold text-white">Email Address *</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-white/40" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-[14px] border border-white/20 bg-black/60 pl-10 pr-4 text-[14px] font-medium text-white outline-none transition-all focus:border-white placeholder:text-white/30 disabled:opacity-50"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-3.5 text-[15px] font-bold shadow-xl"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Sending Magic Link...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Send Magic Link <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <p className="mt-2 text-center text-[12px] text-white/50">
              No password required. We'll email you a secure one-click sign in link.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] flex items-center justify-center p-4">
      {/* Background Motion Image */}
      <img
        src="/user-artsy-1.jpg"
        alt="Arts Motion Canvas"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-70"
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      <React.Suspense
        fallback={
          <div className="relative z-10 flex flex-col items-center gap-3 text-white">
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
