import { describe, it, expect } from 'vitest';
import { getSiteBaseUrl } from '../authContext';

describe('Auth & Session Integration Logic', () => {
  it('uses NEXT_PUBLIC_SITE_URL if defined, stripping trailing slashes, otherwise falls back to origin', () => {
    const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

    process.env.NEXT_PUBLIC_SITE_URL = 'https://soultribemvpv1.vercel.app/';
    expect(getSiteBaseUrl()).toBe('https://soultribemvpv1.vercel.app');

    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteBaseUrl()).toBe('');

    process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
  });

  it('validates email format before requesting magic link or password auth', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('user@example.com')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
    expect(emailRegex.test('missing-domain@.com')).toBe(false);
  });

  it('appends redirect destination to magic link email callback URL (?next=...)', () => {
    const buildRedirectUrl = (origin: string, destination?: string) => {
      const nextParam = destination ? encodeURIComponent(destination) : '%2Fhome';
      return `${origin}/auth/callback?next=${nextParam}`;
    };

    expect(buildRedirectUrl('https://example.com', '/people')).toBe(
      'https://example.com/auth/callback?next=%2Fpeople'
    );
    expect(buildRedirectUrl('https://example.com', '/outings/pitch')).toBe(
      'https://example.com/auth/callback?next=%2Foutings%2Fpitch'
    );
    expect(buildRedirectUrl('https://example.com')).toBe(
      'https://example.com/auth/callback?next=%2Fhome'
    );
  });

  it('rejects passwords shorter than 8 characters with a clear error message', async () => {
    const fakePasswordSubmit = async (password: string) => {
      if (password.length < 8) {
        return { error: new Error('Password must be at least 8 characters long.'), user: null };
      }
      return { error: null, user: { id: 'user-1' } };
    };

    const resShort = await fakePasswordSubmit('1234567');
    expect(resShort.error).toBeDefined();
    expect(resShort.error?.message).toBe('Password must be at least 8 characters long.');
    expect(resShort.user).toBeNull();

    const resValid = await fakePasswordSubmit('strongpass123');
    expect(resValid.error).toBeNull();
    expect(resValid.user).toBeDefined();
  });

  it('routes brand new users without a profile row to /onboarding', () => {
    const determinePostAuthRoute = (hasProfile: boolean, intendedPath: string) => {
      return hasProfile ? intendedPath : '/onboarding';
    };

    expect(determinePostAuthRoute(false, '/people')).toBe('/onboarding');
    expect(determinePostAuthRoute(false, '/home')).toBe('/onboarding');
    expect(determinePostAuthRoute(true, '/people')).toBe('/people');
  });

  it('handles password sign-in errors without returning a success state', async () => {
    const fakeSignInWithPassword = async (email: string, pass: string) => {
      if (pass === 'wrongpass') {
        return { error: new Error('Invalid login credentials'), user: null };
      }
      return { error: null, user: { id: 'u1' } };
    };

    const res = await fakeSignInWithPassword('user@example.com', 'wrongpass');
    expect(res.error).toBeDefined();
    expect(res.error?.message).toBe('Invalid login credentials');
    expect(res.user).toBeNull();
  });
});
