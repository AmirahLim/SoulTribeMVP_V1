'use client';
import React, { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../../lib/supabase';
export function ContinuationCheck({
  outingId,
  userId,
  peers,
}: {
  outingId: string;
  userId: string;
  peers: { user_id: string; display_name?: string }[];
}) {
  const [attended, setAttended] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const client = getSupabaseBrowserClient();
    Promise.all([
      client
        .from('outing_records')
        .select('attended')
        .eq('outing_id', outingId)
        .maybeSingle(),
      client
        .from('connection_continuations')
        .select('peer_id,met_again')
        .eq('author_id', userId)
        .eq('source_outing_id', outingId),
    ]).then(([r, c]) => {
      if (r.error || c.error) {
        setNotice('Unable to load your continuation check.');
        return;
      }
      setAttended(r.data?.attended || []);
      setAnswers(
        Object.fromEntries((c.data || []).map((x) => [x.peer_id, x.met_again])),
      );
    });
  }, [outingId, userId]);
  const save = async (peer: string, value: boolean) => {
    const { error } = await getSupabaseBrowserClient()
      .from('connection_continuations')
      .upsert({
        author_id: userId,
        peer_id: peer,
        source_outing_id: outingId,
        met_again: value,
        updated_at: new Date().toISOString(),
      });
    if (error) setNotice('Unable to save your answer.');
    else {
      setAnswers((a) => ({ ...a, [peer]: value }));
      setNotice('Saved privately.');
    }
  };
  if (!attended.includes(userId)) return null;
  return (
    <section className="border rounded-2xl p-5 space-y-3">
      <h2 className="font-serif text-2xl">Did the connection continue?</h2>
      <p className="text-sm">
        Have you met again since this outing, here or elsewhere? Your answer is
        private and optional.
      </p>
      {peers
        .filter((p) => p.user_id !== userId && attended.includes(p.user_id))
        .map((p) => (
          <div key={p.user_id} className="flex flex-wrap items-center gap-3">
            <span>{p.display_name || 'Participant'}</span>
            <button
              aria-pressed={answers[p.user_id] === true}
              className="border rounded-lg p-3"
              onClick={() => save(p.user_id, true)}
            >
              Yes
            </button>
            <button
              aria-pressed={answers[p.user_id] === false}
              className="border rounded-lg p-3"
              onClick={() => save(p.user_id, false)}
            >
              Not yet
            </button>
          </div>
        ))}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
