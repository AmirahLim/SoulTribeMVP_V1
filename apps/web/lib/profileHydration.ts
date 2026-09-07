import { getSupabaseBrowserClient } from './supabase';
import { setUserProfile, isProfileCacheAccount } from './userStore';

export async function hydrateProfile(userId: string): Promise<void> {
  const client = getSupabaseBrowserClient();
  const [profile, answers] = await Promise.all([
    client
      .from('profiles')
      .select('id,handle,display_name,avatar_url,home_area,bio')
      .eq('id', userId)
      .maybeSingle(),
    client
      .from('profile_answers')
      .select('onboarding,deep_profile,completed_categories')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);
  if (profile.error || answers.error)
    throw new Error('Unable to load your saved profile.');
  if (!profile.data || !isProfileCacheAccount(userId)) return;
  const p = profile.data;
  setUserProfile({
    ...answers.data?.onboarding,
    id: userId,
    displayName: p.display_name,
    handle: p.handle,
    avatarUrl: p.avatar_url || '',
    homeArea: p.home_area,
    bio: p.bio || '',
    deepProfile: answers.data?.deep_profile || {},
    completedCategoryNums: answers.data?.completed_categories || [],
    hasCompletedOnboarding: Boolean(
      answers.data?.onboarding && Object.keys(answers.data.onboarding).length,
    ),
  });
}
