import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveOnboardingToSupabase, saveDeeperPassToSupabase, type OnboardingDataToSave } from '../supabaseOnboarding';
import * as supabaseModule from '../supabase';
describe('Transactional answer saving', () => {
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


  const rpc = vi.fn();
  const getUser = vi.fn();
  beforeEach(() => {
    rpc.mockReset().mockResolvedValue({ error: null });
    getUser.mockReset().mockResolvedValue({ data: { user: { id: sampleUserId } }, error: null });
    vi.spyOn(supabaseModule, 'getSupabaseBrowserClient').mockReturnValue({ rpc, auth: { getUser } } as any);
  });
  it('sends original answers and trait changes in one transaction, without synthesizing values', async () => {
    expect((await saveOnboardingToSupabase(sampleUserId, sampleData)).success).toBe(true);
    expect(rpc).toHaveBeenCalledTimes(1);
    const [name, args] = rpc.mock.calls[0];
    expect(name).toBe('save_profile_bundle');
    expect(args.p_answers.onboarding).toEqual(sampleData);
    expect(args.p_profile.handle).toBe('priya_sharma');
    expect(args.p_traits.user_values).toBeUndefined();
    expect(args.p_traits.trait_experience.orientation).toBeUndefined();
  });
  it('keeps untouched and unrecognized answers unknown, including explicit zero', async () => {
    await saveOnboardingToSupabase(sampleUserId, { ...sampleData, q3Energy: 0, q3GroupSize: null, q5PlanningRhythm: 'unknown', q7EmotionalPacing: null });
    const t = rpc.mock.calls[0][1].p_traits;
    expect(t.trait_personality.extraversion).toBe(0);
    expect(t.trait_social_rhythm.planning_horizon).toBeNull();
    expect(t.trait_emotional.er_opening_pace).toBeNull();
    expect(t.trait_experience.group_size_pref).toBeNull();
  });
  it('propagates a transaction failure and duplicate handle', async () => {
    rpc.mockResolvedValue({ error: { code: '23505', message: 'Handle already taken' } });
    expect(await saveOnboardingToSupabase(sampleUserId, sampleData)).toEqual({ success: false, error: 'Handle already taken', isDuplicateHandle: true });
  });
  it('refuses a mismatched account before writing', async () => {
    expect((await saveOnboardingToSupabase('someone-else', sampleData)).success).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });
  it('deeper edits clear withdrawn answers without overwriting baseline energy from MBTI', async () => {
    await saveDeeperPassToSupabase(sampleUserId, { mbti: 'ESTJ', seriousPlayful: 0 }, [1, 1]);
    const args = rpc.mock.calls[0][1];
    expect(args.p_traits.trait_personality.extraversion).toBeUndefined();
    expect(args.p_traits.trait_personality.serious_playful).toBe(0);
    expect(args.p_traits.trait_emotional.reliability_self).toBeNull();
    expect(args.p_answers.completed_categories).toEqual([1]);
  });
});
