import { getSupabaseBrowserClient } from './supabase';

export async function checkUserProfileExists(userId: string): Promise<boolean> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}
