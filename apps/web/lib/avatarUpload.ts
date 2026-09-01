import { checkIsSupabaseConfigured, getSupabaseBrowserClient } from './supabase';

export const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_AVATAR_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

export interface AvatarValidationResult {
  valid: boolean;
  error?: string;
}

export interface AvatarUploadResult {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}

/**
 * Validates photo file type and size.
 * Enforces JPEG, PNG, or WebP under 4MB limit.
 */
export function validateAvatarFile(file: File): AvatarValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
    };
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return {
      valid: false,
      error: 'File size exceeds 4MB limit. Please choose a smaller photo.',
    };
  }

  return { valid: true };
}

/**
 * Reads a File as a base64 Data URL and updates user profile if connected.
 */
async function readFileAsDataUrl(
  file: File,
  userId?: string,
  client?: any
): Promise<AvatarUploadResult> {
  return new Promise<AvatarUploadResult>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      if (client && userId) {
        try {
          await client
            .from('profiles')
            .update({ avatar_url: dataUrl })
            .eq('id', userId);
        } catch {
          // ignore DB error if user profile record isn't saved yet
        }
      }
      resolve({ success: true, avatarUrl: dataUrl });
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read photo file.' });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an avatar image to Supabase Storage (avatars bucket) scoped under `avatars/{userId}/...`.
 * Seamlessly falls back to base64 Data URL if storage bucket is not configured or missing.
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<AvatarUploadResult> {
  const validation = validateAvatarFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (checkIsSupabaseConfigured() && userId) {
    try {
      const client = getSupabaseBrowserClient();
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Attempt upload to storage bucket 'avatars'
      const { data: uploadData, error: uploadErr } = await client.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadErr) {
        console.warn('Supabase avatars bucket upload failed or bucket missing, falling back to Data URL:', uploadErr.message);
        return readFileAsDataUrl(file, userId, client);
      }

      // Get public URL or object path in storage
      const { data: publicUrlData } = client.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      const avatarUrl = publicUrlData?.publicUrl || uploadData.path;

      // Update profile avatar_url in database
      await client
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);

      return { success: true, avatarUrl };
    } catch (err: any) {
      console.warn('Storage exception encountered, falling back to Data URL:', err?.message);
      return readFileAsDataUrl(file, userId);
    }
  }

  // Fallback FileReader base64 for offline / unconfigured mode
  return readFileAsDataUrl(file);
}
