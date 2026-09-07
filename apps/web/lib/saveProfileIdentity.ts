import { getSupabaseBrowserClient } from './supabase';

export interface ProfileIdentity {
  display_name: string;
  home_area: string;
  bio: string;
  avatar_url: string;
}

/** Require an acknowledged row before the caller updates its portrait or cache. */
export async function saveProfileIdentity(userId: string, draft: ProfileIdentity): Promise<ProfileIdentity> {
  const identity = { ...draft, display_name: draft.display_name.trim(), home_area: draft.home_area.trim(), bio: draft.bio.trim() };
  if (!userId) throw new Error('Please sign in again.');
  if (!identity.display_name) throw new Error('Please enter your name.');
  const { data, error } = await getSupabaseBrowserClient().from('profiles')
    .update(identity).eq('id', userId).select('id').single();
  if (error || !data) throw new Error('Your changes could not be saved. Please try again.');
  return identity;
}
