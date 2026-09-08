import { getSupabaseBrowserClient } from './supabase';
import { validateHandle } from './userStore';

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

export async function getUserProfileRecord(userId: string): Promise<{
  hasProfile: boolean;
  handle?: string;
  display_name?: string;
  avatar_url?: string;
  home_area?: string;
  bio?: string;
} | null> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client
      .from('profiles')
      .select('id, handle, display_name, avatar_url, home_area, bio')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return { hasProfile: false };
    }
    return {
      hasProfile: true,
      handle: data.handle,
      display_name: data.display_name,
      avatar_url: data.avatar_url,
      home_area: data.home_area,
      bio: data.bio,
    };
  } catch (err) {
    return { hasProfile: false };
  }
}

export async function checkHandleAvailability(
  handle: string,
  currentUserId?: string
): Promise<{ available: boolean; message?: string; failed?: boolean }> {
  const formatted = (handle || '').trim().toLowerCase();
  const val = validateHandle(formatted);
  if (!val.valid) {
    return { available: false, message: val.error };
  }

  try {
    const client = getSupabaseBrowserClient();
    // The database derives the current account from auth.uid(), never a caller-
    // supplied id. Only a boolean is exposed, not another member's profile.
    const { data, error } = await client.rpc('username_available', {p_username: formatted});
    if (error || typeof data !== 'boolean') {
      console.error('[SoulTribe] username availability failed', {code:error?.code,message:error?.message});
      return { available: false, failed: true, message: 'Could not check username availability. Please retry.' };
    }
    if (!data) {
      return { available: false, message: `@${formatted} is already taken.` };
    }

    return { available: true };
  } catch (err) {
    return { available: false, failed: true, message: 'Could not check username availability. Please retry.' };
  }
}
