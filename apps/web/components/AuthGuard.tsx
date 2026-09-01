'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../lib/authContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isSupabaseConfigured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if Supabase is configured and authentication has resolved to signed-out
    if (!loading && isSupabaseConfigured && !user) {
      const redirectUrl = `/auth/signin?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
    }
  }, [user, loading, isSupabaseConfigured, pathname, router]);

  if (loading && isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-[13px] font-medium text-white/70">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
