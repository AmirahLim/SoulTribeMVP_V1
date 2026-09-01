'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isSupabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signInWithOtp: async () => ({ error: new Error('Auth not initialized') }),
  signOut: async () => {},
  isSupabaseConfigured: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    let mounted = true;

    try {
      const client = getSupabaseBrowserClient();
      setIsConfigured(true);

      client.auth.getSession().then(({ data: { session }, error: sessionErr }) => {
        if (!mounted) return;
        if (sessionErr) {
          console.error('Failed to retrieve Supabase session:', sessionErr.message);
          setError(sessionErr.message);
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } catch (err: any) {
      // Supabase env vars missing in local offline mode
      setIsConfigured(false);
      setLoading(false);
    }
  }, []);

  const signInWithOtp = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const client = getSupabaseBrowserClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectTo = `${origin}/auth/callback`;

      const { error: sendErr } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (sendErr) {
        return { error: new Error(sendErr.message) };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const client = getSupabaseBrowserClient();
      const { error: signOutErr } = await client.auth.signOut();
      if (signOutErr) {
        console.error('Supabase signOut error:', signOutErr.message);
      }
    } catch (err) {
      console.error('Sign out failed:', err);
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signInWithOtp,
        signOut,
        isSupabaseConfigured: isConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
