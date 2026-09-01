'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../lib/supabase';
import { Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') || '/home';

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        const client = getSupabaseBrowserClient();

        // Retrieve current session
        const { data: { session }, error } = await client.auth.getSession();

        if (error) {
          if (isMounted) setErrorMsg(error.message);
          return;
        }

        if (session) {
          if (isMounted) {
            const { data: profile } = await client
              .from('profiles')
              .select('id')
              .eq('id', session.user.id)
              .maybeSingle();

            const targetPath = profile ? next : '/onboarding';
            router.push(targetPath);
          }
          return;
        }

        // Listen for auth state change after hash/token processing
        const { data: { subscription } } = client.auth.onAuthStateChange(async (event, newSession) => {
          if (!isMounted) return;
          if (newSession) {
            subscription.unsubscribe();
            const { data: profile } = await client
              .from('profiles')
              .select('id')
              .eq('id', newSession.user.id)
              .maybeSingle();

            const targetPath = profile ? next : '/onboarding';
            router.push(targetPath);
          }
        });

        // Timeout fallback if no session established within 6s
        const timer = setTimeout(() => {
          if (isMounted && !session) {
            setErrorMsg('Magic link session verification timed out. Please try requesting a new sign-in link.');
          }
        }, 6000);

        return () => {
          clearTimeout(timer);
          subscription.unsubscribe();
        };
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Unable to establish session.');
        }
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [next, router]);

  return (
    <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] flex items-center justify-center p-4">
      <img
        src="/user-artsy-1.jpg"
        alt="Arts Motion Canvas"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-70"
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[32px] border border-white/20 bg-black/80 p-8 backdrop-blur-2xl text-center shadow-2xl flex flex-col items-center"
        >
          {errorMsg ? (
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/20 text-rose-300">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-[20px] font-extrabold text-white">
                Sign In Error
              </h2>
              <p className="mt-2 text-[13px] text-rose-200 leading-relaxed">
                {errorMsg}
              </p>
              <button
                onClick={() => router.push('/auth/signin')}
                className="mt-6 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-white/20 transition-all"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-inner">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>
              <h2 className="mt-4 text-[20px] font-extrabold text-white">
                Connecting to Soul Tribe...
              </h2>
              <div className="mt-4 flex items-center gap-2 text-[13px] font-medium text-white/70">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Verifying your magic link session...
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-black text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-[13px] text-white/70">Connecting to Soul Tribe...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </React.Suspense>
  );
}
