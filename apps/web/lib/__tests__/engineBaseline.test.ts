import { describe, it, expect } from 'vitest';
import { toProfileVector } from '../profileAdapter';
import { score, generateMatchExplanation, DEMO_PROFILES } from '@soul-tribe/core';

/**
 * ENGINE BASELINE — a golden snapshot of scoring output.
 *
 * These numbers were captured from commit 823abe1 BEFORE the dimension →
 * connection-thread rename. A rename is a no-op: if any value below changes, the
 * rename altered behaviour and must be corrected, not re-baselined.
 *
 * Do NOT update these numbers to make the test pass during a rename.
 *
 * They WILL legitimately change when 6e lands (absence stops counting as agreement).
 * At that point, re-capture them in the same commit as the 6e logic change, and say so
 * in the commit message — never in a rename commit.
 */

const MEMBER_A = {
  displayName: 'A', homeArea: 'Bishan', avatarUrl: '', bio: '', passCompletionPct: 100,
  q1Finding: ['Close 1-on-1 friendships'], q2Feelings: ['Deep 1-on-1s'], q3Energy: 0.2,
  q3GroupSize: '1-on-1', q4Connected: ['Voice notes'], q5PlanningRhythm: 'Spontaneous',
  q5Availability: ['Sat night'], q6Outings: ['Pottery & Craft'],
  q7EmotionalPacing: 'Fast opener', q8Qualities: ['Curiosity'],
} as any;

const MEMBER_B = {
  displayName: 'B', homeArea: 'Bishan', avatarUrl: '', bio: '', passCompletionPct: 100,
  q1Finding: ['A wide circle'], q2Feelings: ['Active & energetic'], q3Energy: 0.9,
  q3GroupSize: '6+', q4Connected: ['Regular check-ins'], q5PlanningRhythm: 'Planned ahead',
  q5Availability: ['Fri night'], q6Outings: ['Nightlife & Bars'],
  q7EmotionalPacing: 'Slow opener', q8Qualities: ['Reliability'],
} as any;

const r6 = (n: number) => Number(n.toFixed(6));

describe('Engine baseline — post-6e golden snapshot', () => {
  it('score() output for two fully-answered, very different members', () => {
    const a = toProfileVector(MEMBER_A, 'aaa');
    const b = toProfileVector(MEMBER_B, 'bbb');
    const r = score(a, b);

    expect(r6(r.resonance)).toBe(0.233857);
    expect(r6(r.logistics)).toBe(0.171611);
    expect(r6(r.rank_score)).toBe(0);
    expect(r6(r.confidence_a)).toBe(1);
    expect(r6(r.confidence_b)).toBe(1);
    expect(r.gated).toBe(true);
    expect(r.gate_reasons).toEqual(['NO_SHARED_AVAILABILITY_SLOT']);

    expect(Object.fromEntries(
      Object.entries(r.contributions).map(([k, v]) => [k, r6(v as number)])
    )).toEqual({
      personality: 0.193481,
      communication: 0,
      social_rhythm: 0.067678,
      intent: 0.4,
      emotional: 0.629847,
      interests: 0,
      experience: 0.139019,
      geography: 1,
    });
  });

  it('score() output for two demo fixtures', () => {
    const r = score(DEMO_PROFILES[0], DEMO_PROFILES[1]);
    expect(r6(r.resonance)).toBe(0.59511);
    expect(r6(r.logistics)).toBe(0.828492);
    expect(r6(r.rank_score)).toBe(0.679319);
  });

  it('explanation text is byte-identical for demo pair', () => {
    const e = generateMatchExplanation(DEMO_PROFILES[0], DEMO_PROFILES[1]);

    expect(e.click_text).toBe(
      'Overlap with Marcus Tan in Specialty Coffee. Aligned core values with Marcus Tan around growth and community.'
    );
    expect(e.friction_text).toBe(
      'On friendship depth, Marcus Tan is looking for easy, low-pressure friendships, whereas you are looking for people to do specific things with. Your interests overlap only moderately, so outing themes might take a little extra alignment.'
    );
  });
});
