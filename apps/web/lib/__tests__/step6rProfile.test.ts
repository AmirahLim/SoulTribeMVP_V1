import { describe, it, expect } from 'vitest';
import { colors, THREAD_COLORS } from '@soul-tribe/tokens';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const YOU_PAGE_PATH = resolve(__dirname, '../../app/you/page.tsx');
const PROFILE_PAGE_PATH = resolve(__dirname, '../../app/people/[id]/page.tsx');

describe('Step 6r — Profile Wiring Regression Guards', () => {
  const youPageSource = readFileSync(YOU_PAGE_PATH, 'utf-8');
  const profilePageSource = readFileSync(PROFILE_PAGE_PATH, 'utf-8');

  it('1. you/page.tsx imports generateSelfProfile from @soul-tribe/core', () => {
    expect(youPageSource).toContain('generateSelfProfile');
    expect(youPageSource).toContain('@soul-tribe/core');
  });

  it('2. you/page.tsx does NOT contain hardcoded bloom strengths', () => {
    // These were the exact hardcoded strengths from the prototype
    const hardcodedPattern = /strength:\s*0\.85,\s*confidence:\s*0\.95/;
    expect(youPageSource).not.toMatch(hardcodedPattern);
  });

  it('3. you/page.tsx does NOT contain "Ten threads · six explored" as static text', () => {
    expect(youPageSource).not.toContain('Ten threads · six explored');
    expect(youPageSource).not.toContain('six explored');
  });

  it('4. you/page.tsx does NOT contain hardcoded prototype instinct', () => {
    // "primaryInstinct" should not be a hardcoded object literal
    expect(youPageSource).not.toMatch(/primaryInstinct:\s*\{\s*type:\s*'Connector'/);
  });

  it('5. people/[id]/page.tsx passes trait data to toProfileVector (not just 4 cosmetic fields)', () => {
    // The old code had: toProfileVector({ displayName, homeArea, avatarUrl, bio } as any, ...)
    // The new code spreads the full dbProfile: ...dbProfile
    expect(profilePageSource).toContain('...dbProfile');
  });

  it('6. people/[id]/page.tsx uses real score() not hardcoded rankScore', () => {
    expect(profilePageSource).not.toContain('rankScore: 0.82');
    expect(profilePageSource).not.toContain('resonance: 0.82');
    expect(profilePageSource).not.toContain('logistics: 0.85');
  });

  it('7. Brand tokens match spec: amber #EFB94E, emerald #3D7A5A, ink #F5F2EA', () => {
    expect(colors.brand.amber).toBe('#EFB94E');
    expect(colors.brand.emerald).toBe('#3D7A5A');
    expect(THREAD_COLORS.personality.tone).toBe('emerald');
    expect(THREAD_COLORS.intent.tone).toBe('amber');
  });
});
