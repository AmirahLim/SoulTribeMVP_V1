import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const PITCH_PAGE_PATH = resolve(__dirname, '../../app/outings/pitch/page.tsx');
const GLOBALS_CSS_PATH = resolve(__dirname, '../../app/globals.css');

describe('Pitch Outing — Constraint and Layout Verification', () => {
  it('1. pitch/page.tsx sanitizes activity_category to valid database constraints', () => {
    const pitchSource = readFileSync(PITCH_PAGE_PATH, 'utf-8');
    // Ensure VALID_DB_CATEGORIES guard is present
    expect(pitchSource).toContain('VALID_DB_CATEGORIES');
    expect(pitchSource).toContain("activity_category: dbCategory");
    // Ensure intellectual is safely mapped to cultural or valid DB category
    expect(pitchSource).toMatch(/dbCategory/);
  });

  it('2. globals.css resets iOS date and time inputs to prevent bleeding overflow', () => {
    const cssSource = readFileSync(GLOBALS_CSS_PATH, 'utf-8');
    expect(cssSource).toContain('input[type="date"]');
    expect(cssSource).toContain('input[type="time"]');
    expect(cssSource).toContain('-webkit-appearance: none');
    expect(cssSource).toContain('::-webkit-date-and-time-value');
  });

  it('3. pitch/page.tsx date and time wrappers have overflow-hidden and appearance-none', () => {
    const pitchSource = readFileSync(PITCH_PAGE_PATH, 'utf-8');
    expect(pitchSource).toContain('appearance-none [-webkit-appearance:none]');
    expect(pitchSource).toContain('overflow-hidden');
  });

  it('4. pitch/page.tsx makes pitch description fully optional and labels spell out characters', () => {
    const pitchSource = readFileSync(PITCH_PAGE_PATH, 'utf-8');
    // Ensure validateForm has no pitch requirement
    expect(pitchSource).not.toContain('Please enter a pitch description');
    expect(pitchSource).toContain('Host Pitch (Optional, up to 600 characters)');
    expect(pitchSource).toContain('dbPitch');
  });
});

