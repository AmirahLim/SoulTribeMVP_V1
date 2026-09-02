import { describe, it, expect } from 'vitest';
import {
  score,
  generateMatchExplanation,
  DEMO_PROFILES,
} from '@soul-tribe/core';
import { toProfileVector } from '../profileAdapter';
import type { UserProfileData } from '../userStore';

describe('Engine Baseline Snapshot Before Rename', () => {
  const memberA: UserProfileData & Record<string, any> = {
    displayName: 'Member Alpha',
    handle: 'member_a',
    avatarUrl: '',
    bio: '',
    homeArea: 'Tiong Bahru',
    birthYear: 1992,
    passCompletionPct: 100,
    q1Finding: ['Close 1-on-1 friendships'],
    q2Feelings: ['Deep 1-on-1s'],
    q3Energy: 0.2,
    q3GroupSize: '1-on-1',
    q4Connected: ['Voice notes'],
    q5PlanningRhythm: 'Spontaneous',
    q5Availability: ['sat_midday', 'sun_midday'],
    q6Outings: ['Coffee & Cafes', 'Quiet Walks'],
    q7EmotionalPacing: 'Slow & Cautious',
    q8Qualities: ['Authenticity', 'Reliability'],
    deepProfile: {
      mbti: 'INFJ',
      messagingStyle: 'Voice notes',
      socialVibe: 'Intimate · Calm',
      supportStyle: 'Listen first',
      friendshipPillars: 'Reliability',
      idealSaturday: 'Slow coffee',
      spontaneousTrip: 'Convince me',
    },
  };

  const memberB: UserProfileData & Record<string, any> = {
    displayName: 'Member Beta',
    handle: 'member_b',
    avatarUrl: '',
    bio: '',
    homeArea: 'Tampines',
    birthYear: 1988,
    passCompletionPct: 100,
    q1Finding: ['Big group activities'],
    q2Feelings: ['Banter & laughs'],
    q3Energy: 0.9,
    q3GroupSize: '5-6 people',
    q4Connected: ['Group chats'],
    q5PlanningRhythm: 'In advance',
    q5Availability: ['sat_midday', 'sun_evening'],
    q6Outings: ['Live Music', 'Boardgames & Gaming'],
    q7EmotionalPacing: 'Fast opener',
    q8Qualities: ['Ambition', 'Humor'],
    deepProfile: {
      mbti: 'ESTP',
      messagingStyle: 'Group chats',
      socialVibe: 'High energy',
      supportStyle: 'Action / Advice',
      friendshipPillars: 'Ambition',
      idealSaturday: 'Out with friends',
      spontaneousTrip: 'Packed & ready',
    },
  };

  it('pins score() output for two distinct, fully-answered members', () => {
    const vecA = toProfileVector(memberA, 'user-alpha');
    const vecB = toProfileVector(memberB, 'user-beta');
    const res = score(vecA, vecB);

    expect(res.resonance.toFixed(6)).toBe('0.375715');
    expect(res.logistics.toFixed(6)).toBe('0.436722');
    expect(res.rank_score.toFixed(6)).toBe('0.399022');
    expect(res.gated).toBe(false);
    expect(res.gate_reasons).toEqual([]);

    expect(res.contributions.personality?.toFixed(6)).toBe('0.358342');
    expect(res.contributions.communication?.toFixed(6)).toBe('0.557096');
    expect(res.contributions.social_rhythm?.toFixed(6)).toBe('0.401011');
    expect(res.contributions.intent?.toFixed(6)).toBe('0.400000');
    expect(res.contributions.emotional?.toFixed(6)).toBe('0.468993');
    expect(res.contributions.interests?.toFixed(6)).toBe('0.000000');
    expect(res.contributions.values).toBeUndefined();
    expect(res.contributions.lifestyle).toBeUndefined();
    expect(res.contributions.experience?.toFixed(6)).toBe('0.311215');
    expect(res.contributions.geography?.toFixed(6)).toBe('0.892813');
  });

  it('pins score() output for two demo fixtures', () => {
    const demoA = DEMO_PROFILES[0];
    const demoB = DEMO_PROFILES[1];
    const res = score(demoA, demoB);

    expect(res.resonance.toFixed(6)).toBe('0.595110');
    expect(res.logistics.toFixed(6)).toBe('0.828492');
    expect(res.rank_score.toFixed(6)).toBe('0.679319');
    expect(res.gated).toBe(false);
  });

  it('pins click_text and friction_text byte-for-byte for demo pair', () => {
    const demoA = DEMO_PROFILES[0];
    const demoB = DEMO_PROFILES[1];
    const explanation = generateMatchExplanation(demoA, demoB);

    expect(explanation.click_text).toBe('Overlap with Marcus Tan in Specialty Coffee. Aligned core values with Marcus Tan around growth and community.');
    expect(explanation.friction_text).toBe('On friendship depth, Marcus Tan is looking for easy, low-pressure friendships, whereas you are looking for people to do specific things with. Your interests overlap only moderately, so outing themes might take a little extra alignment.');
  });
});
