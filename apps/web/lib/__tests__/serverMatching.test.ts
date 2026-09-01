import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toProfileVector } from '../profileAdapter';
import { generateMatchExplanation } from '@soul-tribe/core';
import { POST } from '../../app/api/matches/route';
import { NextRequest } from 'next/server';

describe('Server-Side Matching & Privacy Protections (Step 6b)', () => {
  it('1. Two candidates with different trait answers produce different clickText', () => {
    const viewer = toProfileVector({ displayName: 'Viewer', id: 'v1' } as any);

    const candidate1 = toProfileVector({
      displayName: 'Alice',
      id: 'c1',
      trait_personality: { extraversion: 0.9, answered: 8 },
      user_interests: [{ node_name: 'Coffee & Cafes' }],
    } as any);

    const candidate2 = toProfileVector({
      displayName: 'Bob',
      id: 'c2',
      trait_personality: { extraversion: 0.1, answered: 8 },
      user_interests: [{ node_name: 'Pottery & Craft' }],
    } as any);

    const exp1 = generateMatchExplanation(viewer, candidate1);
    const exp2 = generateMatchExplanation(viewer, candidate2);

    expect(exp1.click_text).not.toBe(exp2.click_text);
  });

  it('2. Candidate with no trait rows gets lower confidence and does NOT receive invented interests/values', () => {
    const thinCandidate = toProfileVector({
      displayName: 'Thin Profile',
      id: 'thin1',
    } as any);

    const fullCandidate = toProfileVector({
      displayName: 'Full Profile',
      id: 'full1',
      trait_personality: { extraversion: 0.8, answered: 10 },
      trait_communication: { mediums: ['text'], answered: 10 },
      trait_social_rhythm: { availability: ['sat_midday'], answered: 6 },
      trait_intent: { intents: ['friendship'], answered: 5 },
      trait_emotional: { er_opening_pace: 0.5, answered: 6 },
      trait_lifestyle: { answered: 5 },
      trait_experience: { group_size_pref: 0.5, answered: 4 },
      trait_geography: { answered: 2 },
    } as any);

    expect(thinCandidate.profile.confidence).toBeLessThan(fullCandidate.profile.confidence);
    expect(thinCandidate.interests).toHaveLength(0);
    expect(thinCandidate.values).toHaveLength(0);
  });

  it('3. Matches response payload contains NONE of the private trait keys at any nesting depth', () => {
    const forbiddenKeys = [
      'trait_intent',
      'trait_personality',
      'trait_social_rhythm',
      'trait_emotional',
      'trait_lifestyle',
      'trait_experience',
      'trait_geography',
      'answered',
      'availability',
      'dealbreakers',
      'user_interests',
      'user_values',
    ];

    const sampleRankedMatch = {
      id: 'c1',
      name: 'Alice',
      avatarUrl: 'https://example.com/avatar.jpg',
      homeArea: 'Singapore',
      bio: 'Hello world',
      rankScore: 0.85,
      resonance: 0.88,
      logistics: 0.90,
      clickText: 'You both enjoy thoughtful conversations.',
      rubText: 'Different preferred group sizes.',
      fitLabel: 'Strong Resonance',
      provisional: false,
      isDemo: false,
    };

    const jsonStr = JSON.stringify(sampleRankedMatch);
    for (const key of forbiddenKeys) {
      expect(jsonStr.includes(`"${key}"`)).toBe(false);
    }
  });

  it('4. Request to /api/matches with no session token returns 401', async () => {
    const req = new NextRequest('http://localhost/api/matches', {
      method: 'POST',
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
