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
    expect(res.error).toBe('Photo is too large. Please select a file under 20MB.');
  });

  it('2. Rejects invalid MIME types (e.g. text/plain, application/pdf)', () => {
    const txtFile = new File(['hello'], 'doc.txt', { type: 'text/plain' });
    const resTxt = validateAvatarFile(txtFile);
    expect(resTxt.valid).toBe(false);
    expect(resTxt.error).toBe('Invalid file format. Please select a photo image.');

    const pdfFile = new File(['pdfdata'], 'doc.pdf', { type: 'application/pdf' });
    const resPdf = validateAvatarFile(pdfFile);
    expect(resPdf.valid).toBe(false);
    expect(resPdf.error).toBe('Invalid file format. Please select a photo image.');
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
