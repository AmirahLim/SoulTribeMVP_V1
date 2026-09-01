import { describe, it, expect } from 'vitest';
import {
  validateHandle,
  deriveSuggestedHandle,
  validateDateOfBirth,
  calculateAge,
} from '../userStore';

describe('Onboarding Validation — Handle (Username)', () => {
  it('accepts valid handles matching ^[a-z0-9_]{3,20}$', () => {
    const validHandles = ['priya', 'priya_sharma', 'user_123', 'a_b_c', 'abc_123_xyz_456_789'];
    for (const handle of validHandles) {
      const res = validateHandle(handle);
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    }
  });

  it('rejects handles shorter than 3 characters', () => {
    const res = validateHandle('ab');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('at least 3 characters');
  });

  it('rejects handles longer than 20 characters', () => {
    const res = validateHandle('a_very_long_username_that_exceeds_twenty_chars');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('20 characters or fewer');
  });

  it('rejects handles with uppercase, spaces, or special characters', () => {
    const invalidHandles = ['Priya', 'priya sharma', 'priya@sharma', 'user-name', 'user!'];
    for (const handle of invalidHandles) {
      const res = validateHandle(handle);
      expect(res.valid).toBe(false);
      expect(res.error).toBeDefined();
    }
  });

  it('rejects empty or missing handle', () => {
    expect(validateHandle('').valid).toBe(false);
    expect(validateHandle('   ').valid).toBe(false);
  });

  it('derives clean suggested handles from display names', () => {
    expect(deriveSuggestedHandle('Priya Sharma')).toBe('priya_sharma');
    expect(deriveSuggestedHandle('Maya Lin!')).toBe('maya_lin');
    expect(deriveSuggestedHandle('Al')).toBe('al_user');
  });
});

describe('Onboarding Validation — Date of Birth & Age Verification', () => {
  it('accepts users 18 years or older', () => {
    const adultDob = '2000-01-15';
    const res = validateDateOfBirth(adultDob);
    expect(res.valid).toBe(true);
    expect(res.age).toBeGreaterThanOrEqual(18);
    expect(res.birthYear).toBe(2000);
    expect(res.error).toBeUndefined();
  });

  it('rejects under-18 users with a plain message stating Soul Tribe is 18+', () => {
    const today = new Date();
    const minorYear = today.getFullYear() - 16;
    const minorDob = `${minorYear}-05-20`;

    const res = validateDateOfBirth(minorDob);
    expect(res.valid).toBe(false);
    expect(res.error).toBe('Soul Tribe is strictly for adults aged 18 and above.');
  });

  it('rejects empty or invalid date strings', () => {
    expect(validateDateOfBirth('').valid).toBe(false);
    expect(validateDateOfBirth('not-a-date').valid).toBe(false);
  });

  it('correctly calculates age', () => {
    const dob = '1995-06-15';
    const age = calculateAge(dob);
    expect(age).not.toBeNull();
    expect(age).toBeGreaterThanOrEqual(28);
  });
});
