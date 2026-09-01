import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSupabaseBrowserClient } from '../supabase';

describe('Supabase Browser Client Initialization', () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  afterEach(() => {
    if (originalUrl !== undefined) {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    } else {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    }

    if (originalKey !== undefined) {
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
    } else {
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    }
  });

  it('throws a clear error naming NEXT_PUBLIC_SUPABASE_URL when missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';

    expect(() => getSupabaseBrowserClient()).toThrow(
      'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL'
    );
  });

  it('throws a clear error naming NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY when missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(() => getSupabaseBrowserClient()).toThrow(
      'Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    );
  });

  it('creates client successfully when both environment variables are present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';

    const client = getSupabaseBrowserClient();
    expect(client).toBeDefined();
  });
});
