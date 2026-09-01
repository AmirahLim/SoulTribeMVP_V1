'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, checkIsSupabaseConfigured } from './supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signInWithOtp: (email: string, redirectToPath?: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null; user: User | null }>;
  signInWithGoogle: (redirectToPath?: string) => Promise<{ error: Error | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: Error | null; user: User | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null; user: User | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isSupabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signInWithOtp: async () => ({ error: new Error('Auth not initialized') }),
  verifyOtp: async () => ({ error: new Error('Auth not initialized'), user: null }),
  signInWithGoogle: async () => ({ error: new Error('Auth not initialized') }),
  signUpWithPassword: async () => ({ error: new Error('Auth not initialized'), user: null }),
  signInWithPassword: async () => ({ error: new Error('Auth not initialized'), user: null }),
  resetPasswordForEmail: async () => ({ error: new Error('Auth not initialized') }),
  signOut: async () => {},
  isSupabaseConfigured: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(() => checkIsSupabaseConfigured());

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

  const signInWithOtp = async (
    email: string,
    redirectToPath?: string
  ): Promise<{ error: Error | null }> => {
    try {
      const client = getSupabaseBrowserClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const nextParam = redirectToPath ? encodeURIComponent(redirectToPath) : '%2Fhome';
      const redirectTo = `${origin}/auth/callback?next=${nextParam}`;

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

  const verifyOtp = async (
    email: string,
    token: string
  ): Promise<{ error: Error | null; user: User | null }> => {
    try {
      const client = getSupabaseBrowserClient();
      const { data, error: verifyErr } = await client.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'email',
      });

      if (verifyErr) {
        return { error: new Error(verifyErr.message), user: null };
      }
      return { error: null, user: data.user };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)), user: null };
    }
  };

  const signInWithGoogle = async (redirectToPath?: string): Promise<{ error: Error | null }> => {
    try {
      const client = getSupabaseBrowserClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const nextParam = redirectToPath ? encodeURIComponent(redirectToPath) : '%2Fhome';
      const redirectTo = `${origin}/auth/callback?next=${nextParam}`;

      const { error: oauthErr } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (oauthErr) {
        return { error: new Error(oauthErr.message) };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signUpWithPassword = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null; user: User | null }> => {
    if (password.length < 8) {
      return { error: new Error('Password must be at least 8 characters long.'), user: null };
    }

    try {
      const client = getSupabaseBrowserClient();
      const { data, error: signUpErr } = await client.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpErr) {
        return { error: new Error(signUpErr.message), user: null };
      }

      return { error: null, user: data.user };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)), user: null };
    }
  };

  const signInWithPassword = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null; user: User | null }> => {
    if (password.length < 8) {
      return { error: new Error('Password must be at least 8 characters long.'), user: null };
    }

    try {
      const client = getSupabaseBrowserClient();
      const { data, error: signInErr } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInErr) {
        return { error: new Error(signInErr.message), user: null };
      }

      return { error: null, user: data.user };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)), user: null };
    }
  };

  const resetPasswordForEmail = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const client = getSupabaseBrowserClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectTo = `${origin}/auth/callback?next=/you`;

      const { error: resetErr } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (resetErr) {
        return { error: new Error(resetErr.message) };
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
        verifyOtp,
        signInWithGoogle,
        signUpWithPassword,
        signInWithPassword,
        resetPasswordForEmail,
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
