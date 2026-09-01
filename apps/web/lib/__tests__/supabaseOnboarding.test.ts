import { describe, it, expect, vi } from 'vitest';
import { saveOnboardingToSupabase, OnboardingDataToSave } from '../supabaseOnboarding';
import * as supabaseModule from '../supabase';

describe('Supabase Onboarding Data Saving & Validation', () => {
  const sampleUserId = '00000000-0000-0000-0000-000000000099';
  const sampleData: OnboardingDataToSave = {
    displayName: 'Priya Sharma',
    handle: 'priya_sharma',
    homeArea: 'Singapore',
    birthYear: 1995,
    q1Finding: ['A close inner circle'],
    q2Feelings: ['We can talk about anything'],
    q3Energy: 0.3,
    q3GroupSize: '3-4 people',
    q4Connected: ['Random messages throughout the day'],
    q5PlanningRhythm: 'Flexible - a couple of days ahead',
    q5Availability: ['sat_midday'],
    q6Outings: ['Coffee & wandering', 'Brunch'],
    q7EmotionalPacing: 'Let it unfold - I open up naturally over time',
    q8Qualities: ['Curious', 'Thoughtful'],
  };

  it('saves NULL for traits and excludes them from answered count when q3Energy, q5PlanningRhythm, and q7EmotionalPacing are untouched (null/undefined)', async () => {
    const upsertSpies: Record<string, any> = {};

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      const spy = vi.fn().mockResolvedValue({ error: null });
      upsertSpies[table] = spy;
      return { upsert: spy };
    });

    vi.spyOn(supabaseModule, 'getSupabaseBrowserClient').mockReturnValue({
      from: mockFrom,
    } as any);

    const untouchedData: OnboardingDataToSave = {
      displayName: 'Alex Tan',
      handle: 'alextan',
      homeArea: 'Singapore',
      birthYear: 1998,
      q1Finding: [],
      q2Feelings: [],
      q3Energy: null,
      q3GroupSize: null,
      q4Connected: [],
      q5PlanningRhythm: null,
      q5Availability: [],
      q6Outings: [],
      q7EmotionalPacing: null,
      q8Qualities: [],
    };

    const res = await saveOnboardingToSupabase(sampleUserId, untouchedData);
    expect(res.success).toBe(true);

    // 1. Trait Personality: extraversion must be null, answered must be 0
    expect(upsertSpies['trait_personality']).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: sampleUserId,
        extraversion: null,
        answered: 0,
      }),
      { onConflict: 'user_id' }
    );

    // 2. Trait Social Rhythm: planning_horizon must be null, answered must be 0
    expect(upsertSpies['trait_social_rhythm']).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: sampleUserId,
        planning_horizon: null,
        answered: 0,
      }),
      { onConflict: 'user_id' }
    );

    // 3. Trait Emotional: er_opening_pace must be null, answered must be 0
    expect(upsertSpies['trait_emotional']).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: sampleUserId,
        er_opening_pace: null,
        answered: 0,
      }),
      { onConflict: 'user_id' }
    );

    // 4. Trait Experience: group_size_pref must be null, answered must be 0
    expect(upsertSpies['trait_experience']).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: sampleUserId,
        group_size_pref: null,
        answered: 0,
      }),
      { onConflict: 'user_id' }
    );
  });

  it('saves NULL for planning_horizon when q5PlanningRhythm is empty or an unrecognized string (no fallback to 0.8)', async () => {
    const upsertSpies: Record<string, any> = {};

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      const spy = vi.fn().mockResolvedValue({ error: null });
      upsertSpies[table] = spy;
      return { upsert: spy };
    });

    vi.spyOn(supabaseModule, 'getSupabaseBrowserClient').mockReturnValue({
      from: mockFrom,
    } as any);

    const unrecognizedData: OnboardingDataToSave = {
      ...sampleData,
      q5PlanningRhythm: 'Unrecognized custom input string',
    };

    const res = await saveOnboardingToSupabase(sampleUserId, unrecognizedData);
    expect(res.success).toBe(true);

    expect(upsertSpies['trait_social_rhythm']).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: sampleUserId,
        planning_horizon: null,
        answered: 1, // 1 for q5Availability ['sat_midday'], 0 for planning_horizon
      }),
      { onConflict: 'user_id' }
    );
  });

  it('detects duplicate handle (Postgres 23505) and returns isDuplicateHandle: true without swallowing error', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({
        error: { code: '23505', message: 'duplicate key value violates unique constraint "profiles_handle_key"' },
      }),
    });

    vi.spyOn(supabaseModule, 'getSupabaseBrowserClient').mockReturnValue({
      from: mockFrom,
    } as any);

    const res = await saveOnboardingToSupabase(sampleUserId, sampleData);
    expect(res.success).toBe(false);
    expect(res.isDuplicateHandle).toBe(true);
    expect(res.error).toContain('already taken');
  });

  it('constructs profiles payload with auth.uid() and required DB fields (handle, display_name, home_area, birth_year)', async () => {
    const upsertSpies: Record<string, any> = {};

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      const spy = vi.fn().mockResolvedValue({ error: null });
      upsertSpies[table] = spy;
      return { upsert: spy };
    });

    vi.spyOn(supabaseModule, 'getSupabaseBrowserClient').mockReturnValue({
      from: mockFrom,
    } as any);

    const res = await saveOnboardingToSupabase(sampleUserId, sampleData);
    expect(res.success).toBe(true);

    expect(upsertSpies['profiles']).toHaveBeenCalledWith(
      expect.objectContaining({
        id: sampleUserId,
        handle: 'priya_sharma',
        display_name: 'Priya Sharma',
        home_area: 'Singapore',
        birth_year: 1995,
      }),
      { onConflict: 'id' }
    );

    expect(upsertSpies['trait_intent']).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: sampleUserId,
        intents: ['A close inner circle'],
        answered: 1,
      }),
      { onConflict: 'user_id' }
    );
  });

  it('returns success: false with clear error message if saving trait table fails', async () => {
    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') {
        return { upsert: vi.fn().mockResolvedValue({ error: null }) };
      }
      return {
        upsert: vi.fn().mockResolvedValue({
          error: { code: '42703', message: 'column does not exist' },
        }),
      };
    });

    vi.spyOn(supabaseModule, 'getSupabaseBrowserClient').mockReturnValue({
      from: mockFrom,
    } as any);

    const res = await saveOnboardingToSupabase(sampleUserId, sampleData);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Failed to save intent traits');
  });
});
