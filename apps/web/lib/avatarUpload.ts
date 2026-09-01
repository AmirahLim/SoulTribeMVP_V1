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
 * Uploads an avatar image to Supabase Storage (avatars bucket) scoped under `avatars/{userId}/...`.
 * Falls back to local data URL if Supabase storage is not configured.
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

      // Upload to storage bucket 'avatars' scoped under userId
      const { data: uploadData, error: uploadErr } = await client.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadErr) {
        return {
          success: false,
          error: `Failed to upload avatar to storage: ${uploadErr.message}`,
        };
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
      return {
        success: false,
        error: err?.message || 'Failed to upload photo to storage.',
      };
    }
  }

  // Fallback FileReader base64 for offline / unconfigured mode
  return new Promise<AvatarUploadResult>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ success: true, avatarUrl: reader.result as string });
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read image file.' });
    };
    reader.readAsDataURL(file);
  });
}
