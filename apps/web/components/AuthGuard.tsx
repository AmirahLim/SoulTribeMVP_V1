'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../lib/authContext';
import { AlertTriangle, Lock } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isSupabaseConfigured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && isSupabaseConfigured && !user) {
      const redirectUrl = `/auth/signin?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
    }
  }, [user, loading, isSupabaseConfigured, pathname, router]);

  // FAIL CLOSED: If Supabase is not configured, do NOT render protected content.
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-6 text-center text-[#FFFDF9]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-[22px] font-extrabold text-white">App Configuration Required</h2>
        <p className="mt-2 max-w-[380px] text-[14px] leading-relaxed text-white/70">
          Soul Tribe is not configured yet. Missing environment variables (<code className="text-amber-300 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> & <code className="text-amber-300 font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>).
        </p>
        <p className="mt-4 text-[13px] text-white/50">
          Protected content cannot be rendered until environment configuration is provided.
        </p>
      </div>
    );
  }

  // FAIL CLOSED: While checking auth, do NOT render protected content.
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black text-[#FFFDF9]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-[13px] font-medium text-white/70">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // FAIL CLOSED: If user is not authenticated, do NOT render protected content.
  if (!user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-6 text-center text-[#FFFDF9]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-[22px] font-extrabold text-white">Sign In Required</h2>
        <p className="mt-2 max-w-[340px] text-[14px] leading-relaxed text-white/70">
          You must be signed in to view this page. Redirecting to sign in...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
