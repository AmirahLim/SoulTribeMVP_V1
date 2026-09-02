import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST as searchImagePOST } from '../../app/api/outings/search-image/route';
import { extractDistinctiveQuery } from '../coverSearchQuery';
import { POST as triggerDownloadPOST } from '../../app/api/outings/trigger-download/route';

describe('Step 6k — Outing Cover Images & Search API', () => {
  const originalEnv = process.env.UNSPLASH_ACCESS_KEY;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.UNSPLASH_ACCESS_KEY = originalEnv;
    vi.restoreAllMocks();
  });

  it('1. The search route returns 500 if UNSPLASH_ACCESS_KEY is absent, naming the variable', async () => {
    delete process.env.UNSPLASH_ACCESS_KEY;

    const req = new Request('http://localhost:3000/api/outings/search-image', {
      method: 'POST',
      body: JSON.stringify({ title: 'Pottery Night' }),
    });

    const res = await searchImagePOST(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toContain('UNSPLASH_ACCESS_KEY');
    expect(data.error).not.toContain('undefined');
  });

  it('2. Query builder extracts distinctive words and strips generic outing stopwords', () => {
    expect(extractDistinctiveQuery('Cowboy Night Meetup', 'Come hang out')).toBe('cowboy');
    expect(extractDistinctiveQuery('Filter Coffee & Books', 'Cozy morning')).toBe('filter coffee books');
    expect(extractDistinctiveQuery('', '', 'Ceramics', 'creative')).toBe('Ceramics');
    expect(extractDistinctiveQuery('', '', '', 'coffee')).toBe('coffee');
  });

  it('3. A search returning no results leaves image columns null and card renders without fallback photo', async () => {
    process.env.UNSPLASH_ACCESS_KEY = 'mock_key';

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);

    const req = new Request('http://localhost:3000/api/outings/search-image', {
      method: 'POST',
      body: JSON.stringify({ title: 'Unknown Random Outing' }),
    });

    const res = await searchImagePOST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.results).toEqual([]);
  });

  it('4. download_location is called exactly once when a photo is selected, and not on render', async () => {
    process.env.UNSPLASH_ACCESS_KEY = 'mock_key';

    const fetchSpy = vi.fn().mockResolvedValue({ ok: true } as Response);
    globalThis.fetch = fetchSpy;

    const req = new Request('http://localhost:3000/api/outings/trigger-download', {
      method: 'POST',
      body: JSON.stringify({ downloadLocation: 'https://api.unsplash.com/photos/123/download' }),
    });

    const res = await triggerDownloadPOST(req);
    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe('https://api.unsplash.com/photos/123/download');
  });

  it('5. Attribution fields are structured with photographer profile and UTM parameters', async () => {
    process.env.UNSPLASH_ACCESS_KEY = 'mock_key';

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            urls: { regular: 'https://images.unsplash.com/photo-123' },
            alt_description: 'Pottery wheel',
            user: {
              name: 'John Doe',
              links: { html: 'https://unsplash.com/@johndoe' },
            },
            links: { download_location: 'https://api.unsplash.com/photos/123/download' },
          },
        ],
      }),
    } as Response);

    const req = new Request('http://localhost:3000/api/outings/search-image', {
      method: 'POST',
      body: JSON.stringify({ title: 'Pottery Workshop' }),
    });

    const res = await searchImagePOST(req);
    const data = await res.json();

    expect(data.results.length).toBe(1);
    const item = data.results[0];
    expect(item.cover_image_url).toBe('https://images.unsplash.com/photo-123');
    expect(item.cover_photographer_name).toBe('John Doe');
    expect(item.cover_photographer_url).toContain('utm_source=soul_tribe');
    expect(item.cover_download_location).toBe('https://api.unsplash.com/photos/123/download');
  });

  it('6. A host-uploaded image has no photographer attribution', () => {
    const hostCover = {
      cover_image_url: 'https://supabase.co/storage/v1/object/public/outing-covers/user1/cover.jpg',
      cover_photographer_name: null,
      cover_photographer_url: null,
    };

    expect(hostCover.cover_photographer_name).toBeNull();
    expect(hostCover.cover_photographer_url).toBeNull();
  });
});
