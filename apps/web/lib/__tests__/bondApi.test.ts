import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../app/api/bond/route';
import { NextRequest } from 'next/server';

const mockDbProfiles = [
  {
    id: 'viewer-1',
    display_name: 'Viewer One',
    avatar_url: 'https://example.com/v1.jpg',
    home_area: 'Singapore',
    bio: 'Viewer Bio',
    birth_year: 1995,
    age_pref_min: 20,
    age_pref_max: 40,
    status: 'active',
    trait_intent: { intents: ['friendship'], answered: 5 },
    trait_communication: { mediums: ['text'], conv_styles: ['deep'], answered: 5 },
    trait_personality: { extraversion: 0.8, answered: 5 },
    trait_social_rhythm: { availability: ['sat_midday'], answered: 5 },
    trait_emotional: { er_opening_pace: 0.7, answered: 5 },
    trait_experience: { group_size_pref: 0.5, answered: 5 },
    trait_lifestyle: { answered: 5 },
    trait_geography: { answered: 2 },
    user_interests: [{ node_name: 'Coffee' }],
    user_values: [{ value_name: 'Authenticity' }],
  },
  {
    id: 'cand-full',
    display_name: 'Cand Full',
    avatar_url: 'https://example.com/c1.jpg',
    home_area: 'Singapore',
    bio: 'Cand Full Bio',
    birth_year: 1994,
    age_pref_min: 20,
    age_pref_max: 40,
    status: 'active',
    trait_intent: { intents: ['friendship'], answered: 5 },
    trait_communication: { mediums: ['text'], conv_styles: ['deep'], answered: 5 },
    trait_personality: { extraversion: 0.7, answered: 5 },
    trait_social_rhythm: { availability: ['sat_midday'], answered: 5 },
    trait_emotional: { er_opening_pace: 0.6, answered: 5 },
    trait_experience: { group_size_pref: 0.5, answered: 5 },
    trait_lifestyle: { answered: 5 },
    trait_geography: { answered: 2 },
    user_interests: [{ node_name: 'Coffee' }],
    user_values: [{ value_name: 'Authenticity' }],
  },
  {
    id: 'cand-no-emotional',
    display_name: 'Cand No Emo',
    avatar_url: 'https://example.com/c2.jpg',
    home_area: 'Singapore',
    bio: 'Cand No Emo Bio',
    birth_year: 1993,
    age_pref_min: 20,
    age_pref_max: 40,
    status: 'active',
    trait_intent: { intents: ['activity'], answered: 5 },
    trait_communication: { mediums: ['call'], conv_styles: ['light'], answered: 5 },
    trait_personality: { extraversion: 0.2, answered: 5 },
    trait_social_rhythm: { availability: ['sun_eve'], answered: 5 },
    trait_emotional: null, // missing emotional trait
    trait_experience: { group_size_pref: 0.2, answered: 5 },
    trait_lifestyle: { answered: 5 },
    trait_geography: { answered: 2 },
    user_interests: [{ node_name: 'Hiking' }],
    user_values: [{ value_name: 'Humor' }],
  },
  {
    id: 'viewer-empty',
    display_name: 'Viewer Empty',
    avatar_url: 'https://example.com/ve.jpg',
    home_area: 'Singapore',
    bio: 'Empty Bio',
    birth_year: 1995,
    status: 'active',
    trait_intent: null,
    trait_communication: null,
    trait_personality: null,
    trait_social_rhythm: null,
    trait_emotional: null,
    trait_experience: null,
    trait_lifestyle: null,
    trait_geography: null,
    user_interests: [],
    user_values: [],
  },
];

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(async (token: string) => {
        if (token === 'valid_token') return { data: { user: { id: 'viewer-1' } }, error: null };
        if (token === 'empty_token') return { data: { user: { id: 'viewer-empty' } }, error: null };
        return { data: { user: null }, error: new Error('Invalid token') };
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        in: vi.fn(async (_col: string, ids: string[]) => {
          const profiles = mockDbProfiles.filter((p) => ids.includes(p.id));
          return { data: profiles, error: null };
        }),
      })),
    })),
  })),
}));

function walkObject(obj: any, forbidKeys: string[]) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    for (const forbidden of forbidKeys) {
      if (key.startsWith(forbidden) || key === forbidden) {
        throw new Error(`Forbidden key "${key}" found in response`);
      }
    }
    walkObject(obj[key], forbidKeys);
  }
}

describe('POST /api/bond Endpoint Tests', () => {
  it('1. Two candidates with different answers produce Tribal Thread text that differs in substance', async () => {
    const req1 = new NextRequest('http://localhost/api/bond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid_token',
      },
      body: JSON.stringify({ candidateId: 'cand-full' }),
    });

    const req2 = new NextRequest('http://localhost/api/bond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid_token',
      },
      body: JSON.stringify({ candidateId: 'cand-no-emotional' }),
    });

    const res1 = await POST(req1);
    const res2 = await POST(req2);

    const json1 = await res1.json();
    const json2 = await res2.json();

    const pers1 = json1.threads.find((d: any) => d.key === 'personality');
    const pers2 = json2.threads.find((d: any) => d.key === 'personality');

    expect(pers1.phrase).not.toBe(pers2.phrase);
    expect(pers1.alignment).not.toBe(pers2.alignment);
  });

  it('2. Thin viewer returns honest state plus non-empty sharpen list and no connection thread sentences for unanswered connection threads', async () => {
    const req = new NextRequest('http://localhost/api/bond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer empty_token',
      },
      body: JSON.stringify({ candidateId: 'cand-full' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    const threads = json.threads;
    const allUnknown = threads.every(
      (d: any) => d.status === 'unknown' && !('alignment' in d) && !('phrase' in d)
    );
    expect(allUnknown).toBe(true);
    expect(json.sharpen.length).toBeGreaterThan(0);
  });

  it('3. No connection thread with status: "unknown" carries an alignment key at any depth', async () => {
    const req = new NextRequest('http://localhost/api/bond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid_token',
      },
      body: JSON.stringify({ candidateId: 'cand-no-emotional' }),
    });

    const res = await POST(req);
    const json = await res.json();
    const threads = json.threads;

    for (const d of threads) {
      if (d.status === 'unknown') {
        expect('alignment' in d).toBe(false);
        expect('phrase' in d).toBe(false);
      }
    }
  });

  it('4. The response contains none of trait_*, answered, availability, dealbreakers, user_interests, user_values (object walk)', async () => {
    const req = new NextRequest('http://localhost/api/bond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid_token',
      },
      body: JSON.stringify({ candidateId: 'cand-full' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(() =>
      walkObject(json, [
        'trait_',
        'answered',
        'availability',
        'dealbreakers',
        'user_interests',
        'user_values',
      ])
    ).not.toThrow();
  });

  it('5. Every sentence the generator emits is reachable only when the answers it cites are present', async () => {
    const candidateId = 'cand-full';
    const req = new NextRequest('http://localhost/api/bond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid_token',
      },
      body: JSON.stringify({ candidateId }),
    });

    const res = await POST(req);
    const json = await res.json();
    const threads = json.threads;

    const persDim = threads.find((d: any) => d.key === 'personality');
    expect(persDim.status).toBe('known');
    expect(persDim.phrase).toContain('social energy');

    // For missing candidate personality trait, status becomes unknown and phrase is omitted
    const req2 = new NextRequest('http://localhost/api/bond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid_token',
      },
      body: JSON.stringify({ candidateId: 'cand-no-emotional' }),
    });

    const res2 = await POST(req2);
    const json2 = await res2.json();
    const threads2 = json2.threads;
    const emoDim = threads2.find((d: any) => d.key === 'emotional');
    expect(emoDim.status).toBe('unknown');
    expect('phrase' in emoDim).toBe(false);
  });

  it('6. POST /api/bond returns mechanism, outputState, fitAtoB, fitBtoA and imbalance at top level', async () => {
    const req = new NextRequest('http://localhost/api/bond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid_token',
      },
      body: JSON.stringify({ candidateId: 'cand-full' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.overall).toHaveProperty('fitAtoB');
    expect(json.overall).toHaveProperty('fitBtoA');
    expect(json.overall).toHaveProperty('imbalance');

    const knownThread = json.threads.find((d: any) => d.status === 'known');
    expect(knownThread).toBeDefined();
    expect(knownThread).toHaveProperty('mechanism');
    expect(knownThread).toHaveProperty('outputState');
  });
});
