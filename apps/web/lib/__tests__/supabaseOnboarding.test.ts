import { describe, it, expect, vi, beforeEach } from 'vitest';
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

    // Verify profiles insert payload
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

    // Verify trait tables answered counts and null unasked traits
    expect(upsertSpies['trait_intent']).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: sampleUserId,
        intents: ['A close inner circle'],
        answered: 1,
      }),
      { onConflict: 'user_id' }
    );

    expect(upsertSpies['trait_geography']).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: sampleUserId,
        home_area: 'Singapore',
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
