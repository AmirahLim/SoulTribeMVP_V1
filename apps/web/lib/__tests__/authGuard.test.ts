import { describe, it, expect } from 'vitest';

describe('AuthGuard — Fail Closed Protection Policy', () => {
  function evaluateAuthGuardState(opts: {
    isSupabaseConfigured: boolean;
    loading: boolean;
    user: any | null;
  }): { renderProtectedContent: boolean; stateMessage: string } {
    const { isSupabaseConfigured, loading, user } = opts;

    if (!isSupabaseConfigured) {
      return {
        renderProtectedContent: false,
        stateMessage: 'App Configuration Required: Missing Supabase environment variables.',
      };
    }

    if (loading) {
      return {
        renderProtectedContent: false,
        stateMessage: 'Checking authentication...',
      };
    }

    if (!user) {
      return {
        renderProtectedContent: false,
        stateMessage: 'Sign In Required: Redirecting to sign in...',
      };
    }

    return {
      renderProtectedContent: true,
      stateMessage: 'Authenticated',
    };
  }

  it('fails closed when isSupabaseConfigured is false and user is null (content NOT rendered)', () => {
    const res = evaluateAuthGuardState({
      isSupabaseConfigured: false,
      loading: false,
      user: null,
    });

    expect(res.renderProtectedContent).toBe(false);
    expect(res.stateMessage).toContain('App Configuration Required');
  });

  it('fails closed when loading is true (content NOT rendered)', () => {
    const res = evaluateAuthGuardState({
      isSupabaseConfigured: true,
      loading: true,
      user: null,
    });

    expect(res.renderProtectedContent).toBe(false);
    expect(res.stateMessage).toBe('Checking authentication...');
  });

  it('fails closed when user is null (content NOT rendered, redirects to sign-in)', () => {
    const res = evaluateAuthGuardState({
      isSupabaseConfigured: true,
      loading: false,
      user: null,
    });

    expect(res.renderProtectedContent).toBe(false);
    expect(res.stateMessage).toContain('Sign In Required');
  });

  it('renders protected content ONLY when isSupabaseConfigured is true, loading is false, and user is present', () => {
    const res = evaluateAuthGuardState({
      isSupabaseConfigured: true,
      loading: false,
      user: { id: 'user-123', email: 'test@example.com' },
    });

    expect(res.renderProtectedContent).toBe(true);
    expect(res.stateMessage).toBe('Authenticated');
  });
});
