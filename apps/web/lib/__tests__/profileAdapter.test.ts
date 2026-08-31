import { describe, it } from 'vitest';
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
    assert.strictEqual(vec.personality.answered, 0);
    assert.strictEqual(vec.communication.answered, 0);
    assert.strictEqual(vec.emotional.answered, 0);
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
    assert.strictEqual(vec.personality.answered, 0);
    assert.strictEqual(vec.lifestyle.answered, 0);
    assert.strictEqual(vec.experience.answered, 0);
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
    assert.strictEqual(vecESTJ.personality.extraversion, 0.8);
    assert.strictEqual(vecESTJ.personality.conscientiousness, 0.8);

    const userINFP: UserProfileData = {
      displayName: 'INFP User',
      avatarUrl: '',
      homeArea: 'Singapore',
      bio: '',
      passCompletionPct: 50,
      deepProfile: { mbti: 'INFP' },
    };

    const vecINFP = toProfileVector(userINFP);
    assert.strictEqual(vecINFP.personality.extraversion, 0.3);
    assert.strictEqual(vecINFP.personality.conscientiousness, 0.3);
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
    assert.deepStrictEqual(vecA.communication, vecB.communication);
    assert.deepStrictEqual(vecA.social_rhythm, vecB.social_rhythm);
    assert.deepStrictEqual(vecA.emotional, vecB.emotional);
    assert.strictEqual(vecA.profile.confidence, vecB.profile.confidence);
  });

  it('5. A fully answered profile yields materially higher confidence than an empty one', () => {
    const emptyUser: UserProfileData = {
      displayName: 'Empty',
      avatarUrl: '',
      homeArea: 'Singapore',
      bio: '',
      passCompletionPct: 0,
      deepProfile: {},
    };

    const fullUser: UserProfileData = {
      displayName: 'Full User',
      avatarUrl: '',
      homeArea: 'Singapore',
      bio: '',
      passCompletionPct: 100,
      deepProfile: {
        mbti: 'INTJ',
        groupSize: '3–4 people',
        socialVibe: 'Intimate · Calm',
        messagingStyle: 'Voice notes',
        supportStyle: 'Listen first',
        friendshipPillars: 'Reliability',
        idealSaturday: 'Slow coffee',
        spontaneousTrip: 'Convince me',
        budgetPref: '$20-50',
      },
    };

    const vecEmpty = toProfileVector(emptyUser);
    const vecFull = toProfileVector(fullUser);

    assert.ok(vecFull.profile.confidence > vecEmpty.profile.confidence + 0.3, 'Fully answered profile must have higher confidence');
  });
});
