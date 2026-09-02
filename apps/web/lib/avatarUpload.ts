import { checkIsSupabaseConfigured, getSupabaseBrowserClient } from './supabase';

export const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
export const MAX_AVATAR_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB max raw camera photo

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
 * Validates photo file existence, format, and raw size limit (up to 20MB).
 * Raw mobile camera photos are automatically downscaled and compressed to <500KB.
 */
export function validateAvatarFile(file: File): AvatarValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  const mimeType = (file.type || '').toLowerCase();
  const extension = (file.name || '').split('.').pop()?.toLowerCase() || '';

  const isImageMime = mimeType.startsWith('image/');
  const isImageExt = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(extension);

  if (!isImageMime && !isImageExt) {
    return {
      valid: false,
      error: 'Invalid file format. Please select a photo image.',
    };
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Photo is too large. Please select a file under 20MB.',
    };
  }

  return { valid: true };
}

/**
 * Resizes and compresses any image file (up to 20MB)
 * into a clean JPEG Data URL (<500KB) using HTML5 Canvas.
 */
export async function compressAndFormatImage(
  file: File,
  maxImageSize = 1000,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxImageSize || height > maxImageSize) {
          if (width > height) {
            height = Math.round((height * maxImageSize) / width);
            width = maxImageSize;
          } else {
            width = Math.round((width * maxImageSize) / height);
            height = maxImageSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => {
        resolve(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a data URL string into a Blob for storage upload.
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(parts[1] || '');
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Uploads an avatar image to Supabase Storage (avatars bucket) or profile table.
 * Automatically downscales and compresses raw mobile camera photos.
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<AvatarUploadResult> {
  const validation = validateAvatarFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Compress photo client-side
  const compressedDataUrl = await compressAndFormatImage(file);
  const finalPhotoUrl = compressedDataUrl || (await new Promise<string>((res) => {
    const r = new FileReader();
    r.onloadend = () => res(r.result as string);
    r.readAsDataURL(file);
  }));

  if (!finalPhotoUrl) {
    return { success: false, error: 'Failed to process selected photo.' };
  }

  if (checkIsSupabaseConfigured() && userId && userId !== 'onboarding_user' && userId !== 'user') {
    try {
      const client = getSupabaseBrowserClient();
      const photoBlob = dataUrlToBlob(finalPhotoUrl);
      const filePath = `${userId}/avatar-${Date.now()}.jpg`;

      // Attempt upload to storage bucket 'avatars'
      const { data: uploadData, error: uploadErr } = await client.storage
        .from('avatars')
        .upload(filePath, photoBlob, {
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (!uploadErr && uploadData?.path) {
        const { data: publicUrlData } = client.storage
          .from('avatars')
          .getPublicUrl(uploadData.path);

        const storageAvatarUrl = publicUrlData?.publicUrl || uploadData.path;

        await client
          .from('profiles')
          .update({ avatar_url: storageAvatarUrl })
          .eq('id', userId);

        return { success: true, avatarUrl: storageAvatarUrl };
      }

      // If storage bucket missing or error occurs, save compressed data URL to profile
      await client
        .from('profiles')
        .update({ avatar_url: finalPhotoUrl })
        .eq('id', userId);

      return { success: true, avatarUrl: finalPhotoUrl };
    } catch {
      return { success: true, avatarUrl: finalPhotoUrl };
    }
  }

  return { success: true, avatarUrl: finalPhotoUrl };
}
