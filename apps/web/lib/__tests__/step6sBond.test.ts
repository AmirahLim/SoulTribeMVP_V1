import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const BOND_PAGE_PATH = resolve(__dirname, '../../app/people/[id]/bond/page.tsx');
const PROFILE_PAGE_PATH = resolve(__dirname, '../../app/people/[id]/page.tsx');

describe('Step 6s — Bond View & Surface Wiring Guards', () => {
  const bondPageSource = readFileSync(BOND_PAGE_PATH, 'utf-8');
  const profilePageSource = readFileSync(PROFILE_PAGE_PATH, 'utf-8');

  it('1. Component Library Uniqueness — shared components imported from packages/ui', async () => {
    const uiExports = await import('@soul-tribe/ui');
    expect(uiExports.GlassCard).toBeDefined();
    expect(uiExports.ReadPill).toBeDefined();
    expect(uiExports.PairedThreadRow).toBeDefined();
    expect(uiExports.WovenBloom).toBeDefined();
    expect(uiExports.VennMeetingCanvas).toBeDefined();
    expect(uiExports.ThreadBloom).toBeDefined();
  });

  it('2. bond/page.tsx does NOT contain hardcoded youDepths/themDepths arrays', () => {
    // These were the exact hardcoded depth arrays
    expect(bondPageSource).not.toMatch(/const\s+youDepths\s*=\s*\[0\.92/);
    expect(bondPageSource).not.toMatch(/const\s+themDepths\s*=\s*\[0\.86/);
  });

  it('3. bond/page.tsx does NOT contain "Content is illustrative"', () => {
    expect(bondPageSource).not.toContain('Content is illustrative');
  });

  it('4. bond/page.tsx does NOT contain hardcoded masculine pronouns in friction cards', () => {
    // "He may feel" and "he's" were hardcoded for Mervyn
    expect(bondPageSource).not.toMatch(/He may feel/);
    expect(bondPageSource).not.toMatch(/he's vague/i);
  });

  it('5. people/[id]/page.tsx does NOT contain hardcoded Mervyn fallback data', () => {
    // These were the Mervyn-specific hardcoded strings
    expect(profilePageSource).not.toContain("'Mervyn Tang'");
    expect(profilePageSource).not.toContain('Mervyn builds trust before disclosure');
    expect(profilePageSource).not.toContain('Trail running, specialty coffee, vinyl');
  });

  it('6. people/[id]/page.tsx imports score and generateSelfProfile', () => {
    expect(profilePageSource).toContain('score');
    expect(profilePageSource).toContain('generateSelfProfile');
  });

  it('7. bond/page.tsx imports and calls generateMatchExplanation', () => {
    expect(bondPageSource).toContain('generateMatchExplanation');
  });
});
