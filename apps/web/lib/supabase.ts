import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !url.trim()) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!key || !key.trim()) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  if (!supabaseClient) {
    supabaseClient = createBrowserClient(url, key);
  }

  return supabaseClient;
}

/**
 * Shared browser client proxy for Supabase.
 * Validates NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY when accessed.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseBrowserClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
