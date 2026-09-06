'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getSupabaseBrowserClient,
  checkIsSupabaseConfigured,
} from '../../lib/supabase';
export function OutingUpdates({ userId }: { userId?: string }) {
  const [updates, setUpdates] = useState<
    { id: number; outing_id: string; message: string }[]
  >([]);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!userId || !checkIsSupabaseConfigured()) return;
    let active = true;
    getSupabaseBrowserClient()
      .from('outing_notifications')
      .select('id,outing_id,message')
      .eq('user_id', userId)
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError('Outing updates are temporarily unavailable.');
        else setUpdates(data || []);
      });
    return () => {
      active = false;
    };
  }, [userId]);
  const markRead = async (id: number) => {
    const { error } = await getSupabaseBrowserClient()
      .from('outing_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
    if (error) setError('Unable to dismiss this update.');
    else setUpdates((rows) => rows.filter((r) => r.id !== id));
  };
  return (
    <section aria-label="Outing updates" className="space-y-2">
      {updates.map((u) => (
        <div
          key={u.id}
          className="flex justify-between items-center gap-3 border rounded-xl p-3"
        >
          <Link href={`/outings/${u.outing_id}`} className="underline">
            {u.message}
          </Link>
          <button className="p-3" onClick={() => markRead(u.id)}>
            Dismiss
          </button>
        </div>
      ))}
      {error && <p role="status">{error}</p>}
    </section>
  );
}
