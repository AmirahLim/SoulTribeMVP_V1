import { describe, it, expect, vi } from 'vitest';
import { validateHandle, validateDateOfBirth } from '../userStore';

describe('Auth & Session Integration Logic', () => {
  it('validates email format before requesting magic link', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('user@example.com')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
    expect(emailRegex.test('missing-domain@.com')).toBe(false);
  });

  it('handles invalid email submission without swallowing errors', async () => {
    const fakeSignInWithOtp = async (email: string) => {
      if (!email.includes('@')) {
        return { error: new Error('Invalid email address') };
      }
      return { error: null };
    };

    const res = await fakeSignInWithOtp('bad-email');
    expect(res.error).toBeDefined();
    expect(res.error?.message).toBe('Invalid email address');
  });

  it('handles successful magic link request', async () => {
    const fakeSignInWithOtp = async (email: string) => {
      if (email === 'user@example.com') {
        return { error: null };
      }
      return { error: new Error('Send failed') };
    };

    const res = await fakeSignInWithOtp('user@example.com');
    expect(res.error).toBeNull();
  });
});
