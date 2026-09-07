'use client';
import React, { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../../lib/supabase';
export function ReflectionPreferences({ userId }: { userId: string }) {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    getSupabaseBrowserClient()
      .from('recommendation_preferences')
      .select('use_reflections')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setStatus('Unable to load your preference.');
        else setEnabled(data?.use_reflections || false);
        setBusy(false);
      });
  }, [userId]);
  const change = async (value: boolean) => {
    setBusy(true);
    const { error } = await getSupabaseBrowserClient()
      .from('recommendation_preferences')
      .upsert({
        user_id: userId,
        use_reflections: value,
        updated_at: new Date().toISOString(),
      });
    if (error) setStatus('Preference was not saved.');
    else {
      setEnabled(value);
      setStatus('Preference saved.');
    }
    setBusy(false);
  };
  return (
    <section className="p-4 border rounded-xl space-y-2">
      <label className="flex gap-3 items-center">
        <input
          type="checkbox"
          checked={enabled}
          disabled={busy}
          onChange={(e) => change(e.target.checked)}
        />
        Use my private reflections to suggest people I’d like to meet again
      </label>
      <p className="text-sm">
        This does not change your Social Signature or reveal your feedback. You
        can switch it off at any time.
      </p>
      {status && <p role="status">{status}</p>}
    </section>
  );
}
