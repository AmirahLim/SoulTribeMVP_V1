import { describe, it, expect } from 'vitest';
import assert from 'node:assert';
import type { UserProfileData } from '../userStore';
import { toProfileVector, completenessConfidence } from '../profileAdapter';

describe('Part 5 — Profile Adapter Tests', () => {
  it('1. An empty UserProfileData produces a vector with low confidence and answered: 0', () => {
    const emptyUser: UserProfileData = {
      displayName: 'Empty User',
      avatarUrl: '',
      homeArea: 'Singapore',
      bio: '',
      passCompletionPct: 0,
      deepProfile: {},
    };

    const vec = toProfileVector(emptyUser);
    assert.strictEqual(vec.personality?.answered ?? 0, 0);
    assert.strictEqual(vec.communication?.answered ?? 0, 0);
    assert.strictEqual(vec.emotional?.answered ?? 0, 0);
    assert.ok(vec.profile.confidence < 0.3, `Expected low confidence, got ${vec.profile.confidence}`);
  });

  it('2. Unanswered traits are NOT populated with invented values', () => {
    const emptyUser: UserProfileData = {
      displayName: 'Empty User',
      avatarUrl: '',
      homeArea: 'Singapore',
      bio: '',
      passCompletionPct: 0,
      deepProfile: {},
    };

    const vec = toProfileVector(emptyUser);
    assert.strictEqual(vec.personality?.answered ?? 0, 0);
    assert.strictEqual(vec.lifestyle?.answered ?? 0, 0);
    assert.strictEqual(vec.experience?.answered ?? 0, 0);
  });

  it('3. A known MBTI maps to the expected extraversion/conscientiousness direction', () => {
    const userESTJ: UserProfileData = {
      displayName: 'ESTJ User',
      avatarUrl: '',
      homeArea: 'Singapore',
      bio: '',
      passCompletionPct: 50,
      deepProfile: { mbti: 'ESTJ' },
    };

    const vecESTJ = toProfileVector(userESTJ);
    assert.strictEqual(vecESTJ.personality?.extraversion, 0.8);
    assert.strictEqual(vecESTJ.personality?.conscientiousness, 0.8);

    const userINFP: UserProfileData = {
      displayName: 'INFP User',
      avatarUrl: '',
      homeArea: 'Singapore',
      bio: '',
      passCompletionPct: 50,
      deepProfile: { mbti: 'INFP' },
    };

    const vecINFP = toProfileVector(userINFP);
    assert.strictEqual(vecINFP.personality?.extraversion, 0.3);
    assert.strictEqual(vecINFP.personality?.conscientiousness, 0.3);
  });

  it('4. sunSign/moonSign/risingSign do NOT change any numeric trait (identical traits)', () => {
    const userA: UserProfileData = {
      displayName: 'User A',
      avatarUrl: '',
      homeArea: 'Singapore',
      bio: '',
      passCompletionPct: 50,
      deepProfile: {
        mbti: 'INFJ',
        sunSign: 'Scorpio',
        moonSign: 'Cancer',
        risingSign: 'Leo',
      },
    };

    const userB: UserProfileData = {
      displayName: 'User B',
      avatarUrl: '',
      homeArea: 'Singapore',
      bio: '',
      passCompletionPct: 50,
      deepProfile: {
        mbti: 'INFJ',
        sunSign: 'Aries',
        moonSign: 'Gemini',
        risingSign: 'Taurus',
      },
    };

    const vecA = toProfileVector(userA);
    const vecB = toProfileVector(userB);

    assert.deepStrictEqual(vecA.personality, vecB.personality);
  });

  it('5. Slider direction asserted explicitly in words for every scale conversion', () => {
    const baseUser = { avatarUrl: '', bio: '', passCompletionPct: 50, homeArea: 'Singapore' };

    // 5a. Q3 Energy / Extraversion
    // "Quiet & Intimate" slider (0.1) MUST map to extraversion < 0.5 (introverted)
    const quietUser: UserProfileData = {
      ...baseUser,
      displayName: 'Quiet User',
      q3Energy: 0.1,
    };
    const quietVec = toProfileVector(quietUser);
    expect(quietVec.personality?.extraversion).toBeLessThan(0.5);

    // "High-Energy & Lively" slider (0.9) MUST map to extraversion > 0.5 (extraverted)
    const livelyUser: UserProfileData = {
      ...baseUser,
      displayName: 'Lively User',
      q3Energy: 0.9,
    };
    const livelyVec = toProfileVector(livelyUser);
    expect(livelyVec.personality?.extraversion).toBeGreaterThan(0.5);

    // 5b. Q3 Group Size
    const intimateUser: UserProfileData = {
      ...baseUser,
      displayName: 'Intimate User',
      q3GroupSize: 'One-on-one',
    };
    expect(toProfileVector(intimateUser).experience?.group_size_pref).toBeLessThan(0.5);

    // 5c. Q5 Planning Horizon
    const spontaneousUser: UserProfileData = {
      ...baseUser,
      displayName: 'Spontaneous User',
      q5PlanningRhythm: 'Spontaneous - same day or day before',
    };
    expect(toProfileVector(spontaneousUser).social_rhythm?.planning_horizon).toBeLessThan(0.5);

    const plannedUser: UserProfileData = {
      ...baseUser,
      displayName: 'Planned User',
      q5PlanningRhythm: 'Planned - a week or two in advance',
    };
    expect(toProfileVector(plannedUser).social_rhythm?.planning_horizon).toBeGreaterThan(0.5);

    // 5d. Q7 Emotional Opening Pace
    const gradualUser: UserProfileData = {
      ...baseUser,
      displayName: 'Gradual User',
      q7EmotionalPacing: 'Observant first - I take time to build trust',
    };
    expect(toProfileVector(gradualUser).emotional?.er_opening_pace).toBeLessThan(0.5);

    const fastUser: UserProfileData = {
      ...baseUser,
      displayName: 'Fast User',
      q7EmotionalPacing: 'Open book right away',
    };
    expect(toProfileVector(fastUser).emotional?.er_opening_pace).toBeGreaterThan(0.5);
  });
});
