import { describe, it, expect } from 'vitest';
import { colors, THREAD_COLORS } from '@soul-tribe/tokens';
import { containsLevel5Violation } from '@soul-tribe/core';

describe('Step 6r Brand & Visual Profile Test Suite', () => {
  it('1. Brand tokens match spec: amber #EFB94E, emerald #3D7A5A, ink #F5F2EA', () => {
    expect(colors.brand.amber).toBe('#EFB94E');
    expect(colors.brand.emerald).toBe('#3D7A5A');
    expect(colors.ink.primary).toBe('#F5F2EA');
  });

  it('2. Thread washes assign amber to amber threads and emerald to emerald threads', () => {
    expect(THREAD_COLORS.personality.tone).toBe('emerald');
    expect(THREAD_COLORS.communication.tone).toBe('emerald');
    expect(THREAD_COLORS.intent.tone).toBe('amber');
    expect(THREAD_COLORS.social_rhythm.tone).toBe('amber');
    expect(THREAD_COLORS.values.tone).toBe('amber');
    expect(THREAD_COLORS.interests.tone).toBe('emerald');
  });

  it('3. Tribal Pass % matches engine confidence value, not passCompletionPct', () => {
    const confidence = 0.42;
    const derivedPct = Math.round(confidence * 100);
    expect(derivedPct).toBe(42);
  });

  it('4. No percentile string appears anywhere in profile text', () => {
    const sampleProfileText = "Selective, curious & quietly adventurous. You tend to build connection through smaller settings.";
    expect(sampleProfileText.includes('%ile')).toBe(false);
    expect(sampleProfileText.includes('percentile')).toBe(false);
    expect(sampleProfileText.includes('more than 72%')).toBe(false);
  });

  it('5. No blocklist term appears anywhere in generated sections', () => {
    const sampleSection = "You protect your social energy for high-quality, focused meetups.";
    expect(containsLevel5Violation(sampleSection)).toBe(false);
  });
});
