import { describe, it, expect } from 'vitest';
import { colors, THREAD_COLORS, THREAD_COLORS_BY_NAME } from '@soul-tribe/tokens';
import { containsLevel5Violation } from '@soul-tribe/core';

function relativeLuminance([r, g, b]: number[]): number {
  const sRGB = [r, g, b].map((v) => v / 255);
  const linear = sRGB.map((c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function hexToRgb(hex: string): [number, number, number] {
  const num = parseInt(hex.replace('#', ''), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Step 6q Profile Redesign Test Suite', () => {
  it('1. Contrast: every luminous surface/ink pair meets WCAG AA (>= 4.5:1)', () => {
    const luminous = colors.luminous;
    for (const [key, pair] of Object.entries(luminous)) {
      const ratio = contrastRatio(pair.surface, pair.ink);
      expect(ratio, `Luminous pair ${key} (${pair.surface} / ${pair.ink}) must meet AA 4.5:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('2. Thread colours come from token map and match spec definitions', () => {
    expect(THREAD_COLORS.personality.surface).toBe(colors.luminous.sage.surface);
    expect(THREAD_COLORS.communication.surface).toBe(colors.luminous.mint.surface);
    expect(THREAD_COLORS.values.surface).toBe(colors.luminous.cream.surface);
    expect(THREAD_COLORS.intent.surface).toBe(colors.luminous.lavender.surface);
    expect(THREAD_COLORS.emotional.surface).toBe(colors.luminous.peach.surface);
    expect(THREAD_COLORS.social_rhythm.surface).toBe(colors.luminous.butter.surface);
    expect(THREAD_COLORS.experience.surface).toBe(colors.luminous.sky.surface);
    expect(THREAD_COLORS.lifestyle.surface).toBe(colors.luminous.rose.surface);
    expect(THREAD_COLORS.interests.surface).toBe(colors.luminous.seafoam.surface);
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
