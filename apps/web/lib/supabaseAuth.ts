import { getSupabaseBrowserClient } from './supabase';
import { validateHandle } from './userStore';
import { SYNTHETIC_PROFILES } from '../../../supabase/seed/seed';

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
} | null> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client
      .from('profiles')
      .select('id, handle')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return { hasProfile: false };
    }
    return { hasProfile: true, handle: data.handle };
  } catch (err) {
    return { hasProfile: false };
  }
}

export async function checkHandleAvailability(
  handle: string,
  currentUserId?: string
): Promise<{ available: boolean; message?: string }> {
  const formatted = (handle || '').trim().toLowerCase();
  const val = validateHandle(formatted);
  if (!val.valid) {
    return { available: false, message: val.error };
  }

  // Check synthetic demo profiles first
  const isSyntheticTaken = SYNTHETIC_PROFILES.some(
    (p) => (p.handle || '').toLowerCase() === formatted
  );
  if (isSyntheticTaken) {
    return { available: false, message: `@${formatted} is already taken.` };
  }

  try {
    const client = getSupabaseBrowserClient();
    let query = client.from('profiles').select('id').eq('handle', formatted);
    if (currentUserId) {
      query = query.neq('id', currentUserId);
    }
    const { data, error } = await query.maybeSingle();

    if (error) {
      return { available: true };
    }

    if (data) {
      return { available: false, message: `@${formatted} is already taken.` };
    }

    return { available: true };
  } catch (err) {
    return { available: true };
  }
}
