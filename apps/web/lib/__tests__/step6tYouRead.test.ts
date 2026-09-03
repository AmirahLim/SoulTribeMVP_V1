import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../app/api/me/read/route';
import { NextRequest } from 'next/server';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Mock profiles ──────────────────────────────────────────────────

const quietMember = {
  id: 'quiet-1',
  display_name: 'Quiet Qi',
  handle: 'quietqi',
  avatar_url: null,
  home_area: 'Tiong Bahru',
  bio: 'Introvert energy.',
  birth_year: 1994,
  status: 'active',
  trait_intent: { intents: ['close_friends'], depth: 3, answered: 2 },
  trait_communication: { response_speed_self: 0.2, initiation_self: 0.2, mediums: ['text'], conv_styles: ['deep'], answered: 4 },
  trait_personality: { extraversion: 0.15, openness: 0.6, answered: 6 },
  trait_social_rhythm: { planning_horizon: 0.8, social_freq_self: 0.3, availability: ['sat_morning'], answered: 3 },
  trait_emotional: { er_opening_pace: 0.2, answered: 2 },
  trait_experience: { group_size_pref: 0.2, answered: 4 },
  trait_lifestyle: { budget_band: 2, answered: 2 },
  trait_geography: { home_area: 'Tiong Bahru', answered: 2 },
  user_interests: [{ node_name: 'Reading' }, { node_name: 'Tea' }],
  user_values: [{ value_key: 'depth' }],
};

const livelyMember = {
  id: 'lively-1',
  display_name: 'Lively Lina',
  handle: 'livelylina',
  avatar_url: null,
  home_area: 'Orchard',
  bio: 'Social butterfly.',
  birth_year: 1996,
  status: 'active',
  trait_intent: { intents: ['social_circle'], depth: 1, answered: 2 },
  trait_communication: { response_speed_self: 0.9, initiation_self: 0.9, mediums: ['call', 'text'], conv_styles: ['light'], answered: 4 },
  trait_personality: { extraversion: 0.85, openness: 0.8, answered: 6 },
  trait_social_rhythm: { planning_horizon: 0.2, social_freq_self: 0.8, availability: ['fri_evening', 'sat_afternoon', 'sun_morning'], answered: 3 },
  trait_emotional: { er_opening_pace: 0.9, answered: 2 },
  trait_experience: { group_size_pref: 0.8, answered: 4 },
  trait_lifestyle: { budget_band: 4, answered: 2 },
  trait_geography: { home_area: 'Orchard', answered: 2 },
  user_interests: [{ node_name: 'Dancing' }, { node_name: 'Brunch' }, { node_name: 'Cocktails' }],
  user_values: [{ value_key: 'fun' }, { value_key: 'spontaneity' }],
};

const emptyMember = {
  id: 'empty-1',
  display_name: 'New User',
  handle: 'newuser',
  avatar_url: null,
  home_area: 'Singapore',
  bio: null,
  birth_year: null,
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
};

const allMembers = [quietMember, livelyMember, emptyMember];

// ─── Supabase mock ──────────────────────────────────────────────────

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(async (token: string) => {
        if (token === 'quiet_token') return { data: { user: { id: 'quiet-1' } }, error: null };
        if (token === 'lively_token') return { data: { user: { id: 'lively-1' } }, error: null };
        if (token === 'empty_token') return { data: { user: { id: 'empty-1' } }, error: null };
        return { data: { user: null }, error: new Error('Invalid token') };
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn((_col: string, id: string) => ({
          maybeSingle: vi.fn(async () => {
            const found = allMembers.find((m) => m.id === id);
            return { data: found || null, error: null };
          }),
        })),
      })),
    })),
  })),
}));

// ─── Helpers ─────────────────────────────────────────────────────────

async function callRoute(token: string) {
  const req = new NextRequest('http://localhost:3000/api/me/read', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const res = await GET(req);
  return { status: res.status, body: await res.json() };
}

// ─── Tests ───────────────────────────────────────────────────────────

describe('6t — /api/me/read and You page wiring', () => {
  it('1. Two different members produce two different reads', async () => {
    const quiet = await callRoute('quiet_token');
    const lively = await callRoute('lively_token');

    expect(quiet.status).toBe(200);
    expect(lively.status).toBe(200);

    const qThreads = quiet.body.threads.filter((t: any) => t.status === 'known');
    const lThreads = lively.body.threads.filter((t: any) => t.status === 'known');

    // At least three threads should differ in note
    let diffCount = 0;
    for (const qt of qThreads) {
      const lt = lThreads.find((t: any) => t.key === qt.key);
      if (lt && lt.note !== qt.note) diffCount++;
    }
    expect(diffCount).toBeGreaterThanOrEqual(3);

    // Quiet member's activeGroup should be '1:1' (group_size_pref: 0.2)
    const qPersonality = quiet.body.threads.find((t: any) => t.key === 'personality');
    expect(qPersonality?.extraVisualData?.activeGroup).toBe('1:1');

    // Lively member's activeGroup should be 'Crowd' (group_size_pref: 0.8)
    const lPersonality = lively.body.threads.find((t: any) => t.key === 'personality');
    expect(lPersonality?.extraVisualData?.activeGroup).toBe('Crowd');
  });

  it('2. Equal depth, different values, equal petals', async () => {
    const quiet = await callRoute('quiet_token');
    const lively = await callRoute('lively_token');

    // Both have answered: 6 on personality
    const qP = quiet.body.threads.find((t: any) => t.key === 'personality');
    const lP = lively.body.threads.find((t: any) => t.key === 'personality');

    expect(qP.status).toBe('known');
    expect(lP.status).toBe('known');
    expect(qP.strength).toBe(lP.strength); // same answered count → same strength

    // But different notes (different extraversion values)
    expect(qP.note).not.toBe(lP.note);
  });

  it('3. Empty profile stays empty', async () => {
    const empty = await callRoute('empty_token');
    expect(empty.status).toBe(200);

    const threads = empty.body.threads;
    expect(threads).toHaveLength(10);

    // All threads should be unknown
    const unknownThreads = threads.filter((t: any) => t.status === 'unknown');
    expect(unknownThreads).toHaveLength(10);

    // Top-level confidence should be low
    expect(empty.body.confidence).toBeLessThan(0.3);

    // No unknown thread should contain note, strength, confidence, or descriptor
    for (const t of threads) {
      expect(t).not.toHaveProperty('note');
      expect(t).not.toHaveProperty('strength');
      expect(t).not.toHaveProperty('confidence');
      expect(t).not.toHaveProperty('descriptor');
    }
  });

  it('4. No prototype copy left in the page', () => {
    const youPagePath = resolve(__dirname, '../../app/you/page.tsx');
    const source = readFileSync(youPagePath, 'utf-8');

    const forbidden = [
      'Four people is where you stop scanning',
      "'Mimeo'",
      "'mimeooo'",
      'Selective, curious',
      'images.unsplash.com',
      'confidence: 0.95',
      "activeGroup: '3–4'",
      'Bricolage_Grotesque',
      'Karla',
    ];

    for (const f of forbidden) {
      expect(source).not.toContain(f);
    }
  });

  it('5. The page actually calls the route', () => {
    const youPagePath = resolve(__dirname, '../../app/you/page.tsx');
    const source = readFileSync(youPagePath, 'utf-8');
    expect(source).toContain('/api/me/read');
  });

  it('6. The fallback is gone', () => {
    const tcPath = resolve(__dirname, '../../components/profile/ThreadCard.tsx');
    const source = readFileSync(tcPath, 'utf-8');
    expect(source).not.toContain("|| '3–4'");
    expect(source).not.toContain("|| '3-4'");
  });

  it('7. The adapter is shared, not copied', () => {
    const bondPath = resolve(__dirname, '../../app/api/bond/route.ts');
    const source = readFileSync(bondPath, 'utf-8');

    // Must import from profileRowAdapter
    expect(source).toContain('profileRowAdapter');

    // Must NOT define adaptRowToUserData locally
    expect(source).not.toMatch(/function adaptRowToUserData/);
  });
});
