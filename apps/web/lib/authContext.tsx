'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, checkIsSupabaseConfigured } from './supabase';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSupabaseConfigured: boolean;
  signInWithOtp: (email: string, redirectToPath?: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null; user: User | null }>;
  signInWithGoogle: (redirectToPath?: string) => Promise<{ error: Error | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: Error | null; user: User | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null; user: User | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getSiteBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return '';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = checkIsSupabaseConfigured();

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isConfigured) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const client = getSupabaseBrowserClient();
        const { data: { session: initialSession } } = await client.auth.getSession();

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        }

        const { data: { subscription } } = client.auth.onAuthStateChange(
          (_event, currentSession) => {
            if (mounted) {
              setSession(currentSession);
              setUser(currentSession?.user ?? null);
              setLoading(false);
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Supabase Auth init error:', err);
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, [isConfigured]);

  const signInWithOtp = async (
    email: string,
    redirectToPath?: string
  ): Promise<{ error: Error | null }> => {
    try {
      const client = getSupabaseBrowserClient();
      const baseUrl = getSiteBaseUrl();
      const nextParam = redirectToPath ? encodeURIComponent(redirectToPath) : '%2Fhome';
      const redirectTo = `${baseUrl}/auth/callback?next=${nextParam}`;

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
      const baseUrl = getSiteBaseUrl();
      const nextParam = redirectToPath ? encodeURIComponent(redirectToPath) : '%2Fhome';
      const redirectTo = `${baseUrl}/auth/callback?next=${nextParam}`;

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
      const baseUrl = getSiteBaseUrl();
      const redirectTo = `${baseUrl}/auth/callback?next=/you`;

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
      if (isConfigured) {
        const client = getSupabaseBrowserClient();
        await client.auth.signOut();
      }
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error('Supabase signOut error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isSupabaseConfigured: isConfigured,
        signInWithOtp,
        verifyOtp,
        signInWithGoogle,
        signUpWithPassword,
        signInWithPassword,
        resetPasswordForEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
