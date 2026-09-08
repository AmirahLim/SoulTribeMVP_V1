import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './supabase';

type Scope =
  | { table: 'outing_messages' | 'outing_logistics' | 'outings' | 'outing_members'; outingId: string; userId?: never }
  | { table: 'outing_members'; userId: string; outingId?: never };
let sequence = 0;

/** Notifications only invalidate an authenticated query; never trust event data as UI state. */
export function subscribeOutingChanges(
  scope: Scope,
  refetch: () => void | Promise<void>,
  clientFactory = getSupabaseBrowserClient,
): () => void {
  let stopped = false;
  let channel: RealtimeChannel | undefined;
  let client: ReturnType<typeof clientFactory> | undefined;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  let pending = false;
  const refresh = async () => {
    if (stopped) return;
    if (running) { pending = true; return; }
    running = true;
    try { await refetch(); }
    catch (error) { console.error('[SoulTribe] Realtime refresh failed', error); }
    finally {
      running = false;
      if (pending && !stopped) { pending = false; void refresh(); }
    }
  };
  const remove = () => {
    const old = channel;
    channel = undefined;
    if (old && client) {
      try { void Promise.resolve(client.removeChannel(old)).catch(() => {}); } catch { /* best effort */ }
    }
  };
  const schedule = () => {
    if (stopped || retry) return;
    retry = setTimeout(() => { retry = undefined; connect(); }, 5000);
  };
  const connect = () => {
    if (stopped) return;
    remove();
    try {
      client = clientFactory();
      const column = scope.userId ? 'user_id' : scope.table === 'outings' ? 'id' : 'outing_id';
      const id = scope.userId ?? scope.outingId;
      // IDs are UUIDs; reject offline/local IDs and filter syntax injection.
      if (!id || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)) return;
      const current = client.channel(`outing-changes:${++sequence}`);
      channel = current;
      for (const event of ['INSERT', 'UPDATE'] as const) {
        current.on('postgres_changes', { event, schema: 'public', table: scope.table, filter: `${column}=eq.${id}` }, () => { void refresh(); });
      }
      current.subscribe((status) => {
        if (stopped || channel !== current) return;
        if (status === 'SUBSCRIBED') {
          if (retry) { clearTimeout(retry); retry = undefined; }
          // Also close the initial fetch/subscribe gap. Rejoins are not replayed.
          void refresh();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') schedule();
      });
    } catch { remove(); schedule(); }
  };
  const wake = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    void refresh();
    if (retry) { clearTimeout(retry); retry = undefined; }
    connect();
  };
  connect();
  if (typeof window !== 'undefined') window.addEventListener('online', wake);
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', wake);
  return () => {
    stopped = true;
    if (retry) clearTimeout(retry);
    if (typeof window !== 'undefined') window.removeEventListener('online', wake);
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', wake);
    remove();
  };
}

/** Replace from the authoritative query, removing duplicates rather than appending echoes. */
export function uniqueMessages<T extends { id: string | number }>(rows: T[]): T[] {
  return [...new Map(rows.map(row => [row.id, row])).values()];
}
