import { describe, it, expect } from 'vitest';
import { validateAvatarFile, MAX_AVATAR_SIZE_BYTES } from '../avatarUpload';

describe('Shared Avatar Upload & Validation Security Tests', () => {
  it('1. Rejects oversized files (> 4MB limit)', () => {
    // Create mock oversized file
    const oversizedFile = new File(['a'.repeat(1024)], 'large-photo.jpg', {
      type: 'image/jpeg',
    });
    Object.defineProperty(oversizedFile, 'size', {
      value: MAX_AVATAR_SIZE_BYTES + 1,
    });

    const res = validateAvatarFile(oversizedFile);
    expect(res.valid).toBe(false);
    expect(res.error).toBe('File size exceeds 4MB limit. Please choose a smaller photo.');
  });

  it('2. Rejects invalid MIME types (e.g. text/plain, image/gif, application/pdf)', () => {
    const txtFile = new File(['hello'], 'doc.txt', { type: 'text/plain' });
    const resTxt = validateAvatarFile(txtFile);
    expect(resTxt.valid).toBe(false);
    expect(resTxt.error).toBe('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');

    const gifFile = new File(['gifdata'], 'anim.gif', { type: 'image/gif' });
    const resGif = validateAvatarFile(gifFile);
    expect(resGif.valid).toBe(false);
    expect(resGif.error).toBe('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
  });

  it('3. Accepts valid JPEG, PNG, and WebP files under 4MB', () => {
    const jpgFile = new File(['imgdata'], 'avatar.jpeg', { type: 'image/jpeg' });
    expect(validateAvatarFile(jpgFile).valid).toBe(true);

    const pngFile = new File(['imgdata'], 'avatar.png', { type: 'image/png' });
    expect(validateAvatarFile(pngFile).valid).toBe(true);

    const webpFile = new File(['imgdata'], 'avatar.webp', { type: 'image/webp' });
    expect(validateAvatarFile(webpFile).valid).toBe(true);
  });
});
