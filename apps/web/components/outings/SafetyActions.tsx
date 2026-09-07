'use client';
import React, { useState } from 'react';
import { getSupabaseBrowserClient } from '../../lib/supabase';
export function SafetyActions({
  userId,
  targetId,
  outingId,
}: {
  userId: string;
  targetId: string;
  outingId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  if (userId === targetId) return null;
  const act = async (kind: 'block' | 'report') => {
    setBusy(true);
    const client = getSupabaseBrowserClient();
    const result =
      kind === 'block'
        ? await client
            .from('blocks')
            .upsert({ blocker_id: userId, blocked_id: targetId })
        : await client
            .from('reports')
            .insert({
              reporter_id: userId,
              reported_id: targetId,
              outing_id: outingId || null,
              category: 'member_concern',
              detail,
            });
    setStatus(
      result.error
        ? 'Unable to save. Please try again.'
        : kind === 'block'
          ? 'Blocked. They will not be notified.'
          : 'Report submitted privately.',
    );
    setBusy(false);
  };
  return (
    <div className="text-sm">
      <button className="p-3 underline" onClick={() => setOpen(!open)}>
        Block or report
      </button>
      {open && (
        <div className="space-y-2 border rounded-xl p-3">
          <p>Blocking removes this person from your recommendations.</p>
          <button
            disabled={busy}
            onClick={() => act('block')}
            className="p-3 border rounded-lg"
          >
            Block person
          </button>
          <label className="block">
            Report a concern
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              maxLength={2000}
              className="block w-full p-3 rounded-lg bg-transparent border"
            />
          </label>
          <button
            disabled={busy || !detail.trim()}
            onClick={() => act('report')}
            className="p-3 border rounded-lg"
          >
            Submit report
          </button>
        </div>
      )}
      {status && <p role="status">{status}</p>}
    </div>
  );
}
