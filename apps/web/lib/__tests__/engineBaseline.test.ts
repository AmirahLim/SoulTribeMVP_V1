import { describe, it, expect } from 'vitest';
import { toProfileVector } from '../profileAdapter';
import { score, generateMatchExplanation, DEMO_PROFILES } from '@soul-tribe/core';

/**
 * ENGINE BASELINE — a golden snapshot of scoring output.
 *
 * This snapshot reflects the post-6e engine state (where absence no longer
 * counts as agreement). A pure rename or cosmetic change must remain a provable
 * no-op: if any value below changes during a rename, the rename altered
 * behaviour and must be corrected, not re-baselined.
 *
 * Logic changes to scoring may legitimately change these values, provided they
 * are re-captured and documented in their own dedicated commit.
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

const r6 = (n: number | null) => (n === null ? null : Number(n.toFixed(6)));

describe('Engine baseline — post-6e golden snapshot', () => {
  it('score() output for two fully-answered, very different members', () => {
    const a = toProfileVector(MEMBER_A, 'aaa');
    const b = toProfileVector(MEMBER_B, 'bbb');
    const r = score(a, b);

    expect(r6(r.resonance)).toBe(0.233857);
    expect(r6(r.logistics)).toBe(0.171611);
    expect(r6(r.rank_score)).toBe(0);
    expect(r6(r.confidence_a)).toBe(0.365);
    expect(r6(r.confidence_b)).toBe(0.4075);
    expect(r.gated).toBe(true);
    expect(r.gate_reasons).toEqual(['CONFIDENCE_TOO_LOW', 'NO_SHARED_AVAILABILITY_SLOT']);

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
    expect(r6(r.rank_score)).toBe(0.505797);
  });

  it('explanation text is byte-identical for demo pair', () => {
    const e = generateMatchExplanation(DEMO_PROFILES[0], DEMO_PROFILES[1]);

    expect(e.click_text).toBe(
      'You and Marcus Tan take time to open up emotionally while enjoying playful, engaging catch-ups. Light humor keeps early interactions warm and enjoyable. Exploring new spots and sharing lighthearted moments creates a relaxed space where trust deepens at its own pace.'
    );
    expect(e.friction_text).toBe(
      'On friendship depth, Marcus Tan is looking for easy, low-pressure friendships, whereas you are looking for people to do specific things with.'
    );
  });
});
