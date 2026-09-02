import { checkIsSupabaseConfigured, getSupabaseBrowserClient } from './supabase';
import { validateAvatarFile, compressAndFormatImage } from './avatarUpload';

export interface CoverUploadResult {
  success: boolean;
  coverUrl?: string;
  error?: string;
}

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
 * Uploads a host-custom cover photo to Supabase Storage (outing-covers bucket).
 * Reuses validateAvatarFile, MIME & 20MB caps, canvas compression, and owner RLS path logic.
 */
export async function uploadOutingCover(
  userId: string,
  file: File
): Promise<CoverUploadResult> {
  const validation = validateAvatarFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Compress photo client-side to max 1200px
  const compressedDataUrl = await compressAndFormatImage(file, 1200, 0.85);
  const finalPhotoUrl =
    compressedDataUrl ||
    (await new Promise<string>((res) => {
      const r = new FileReader();
      r.onloadend = () => res(r.result as string);
      r.readAsDataURL(file);
    }));

  if (!finalPhotoUrl) {
    return { success: false, error: 'Failed to process selected cover photo.' };
  }

  if (checkIsSupabaseConfigured() && userId && userId !== 'onboarding_user' && userId !== 'user') {
    try {
      const client = getSupabaseBrowserClient();
      const photoBlob = dataUrlToBlob(finalPhotoUrl);
      const filePath = `${userId}/cover-${Date.now()}.jpg`;

      // Upload to storage bucket 'outing-covers' (scoped to owner folder)
      const { data: uploadData, error: uploadErr } = await client.storage
        .from('outing-covers')
        .upload(filePath, photoBlob, {
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (!uploadErr && uploadData?.path) {
        const { data: publicUrlData } = client.storage
          .from('outing-covers')
          .getPublicUrl(uploadData.path);

        const storageCoverUrl = publicUrlData?.publicUrl || uploadData.path;
        return { success: true, coverUrl: storageCoverUrl };
      }

      return { success: true, coverUrl: finalPhotoUrl };
    } catch {
      return { success: true, coverUrl: finalPhotoUrl };
    }
  }

  return { success: true, coverUrl: finalPhotoUrl };
}
