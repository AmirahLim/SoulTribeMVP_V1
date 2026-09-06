'use client';
import React, { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../../lib/supabase';

type Message = {
  id: number;
  author_id: string;
  body: string;
  created_at: string;
};
export function OutingContext({
  outingId,
  userId,
  isHost,
}: {
  outingId: string;
  userId: string;
  isHost: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [venue, setVenue] = useState('');
  const [details, setDetails] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => {
    const client = getSupabaseBrowserClient();
    const [chat, logistics] = await Promise.all([
      client
        .from('outing_messages')
        .select('id,author_id,body,created_at')
        .eq('outing_id', outingId)
        .order('created_at', { ascending: false })
        .limit(50),
      client
        .from('outing_logistics')
        .select('venue_name,meeting_details')
        .eq('outing_id', outingId)
        .maybeSingle(),
    ]);
    if (chat.error || logistics.error) {
      setNotice('Unable to load outing details. Please try again.');
      return;
    }
    setMessages((chat.data || []).reverse());
    setVenue(logistics.data?.venue_name || '');
    setDetails(logistics.data?.meeting_details || '');
  };
  useEffect(() => {
    void load();
  }, [outingId]);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || busy) return;
    setBusy(true);
    setNotice('');
    const { error } = await getSupabaseBrowserClient()
      .from('outing_messages')
      .insert({ outing_id: outingId, author_id: userId, body: body.trim() });
    if (error) setNotice('Message was not sent. Please try again.');
    else {
      setBody('');
      await load();
    }
    setBusy(false);
  };
  const save = async () => {
    setBusy(true);
    const { error } = await getSupabaseBrowserClient()
      .from('outing_logistics')
      .upsert({
        outing_id: outingId,
        venue_name: venue,
        meeting_details: details,
        venue_type: 'public',
        updated_at: new Date().toISOString(),
      });
    setNotice(
      error
        ? 'Unable to save meeting details.'
        : 'Meeting details saved for confirmed participants.',
    );
    setBusy(false);
  };
  return (
    <section className="rounded-2xl bg-[#F5F2E9] text-[#263D32] p-6 space-y-5">
      <h2 className="text-2xl font-serif">Your outing, together</h2>
      <p className="text-sm">
        Meeting details and conversation are available to confirmed
        participants. Choose a public venue.
      </p>
      {isHost ? (
        <div className="space-y-3">
          <label className="block">
            Public venue
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              maxLength={200}
              className="block w-full border rounded-lg p-3 bg-transparent"
            />
          </label>
          <label className="block">
            Where to meet
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={2000}
              className="block w-full border rounded-lg p-3 bg-transparent"
            />
          </label>
          <button
            onClick={save}
            disabled={busy}
            className="p-3 border rounded-lg"
          >
            Save meeting details
          </button>
        </div>
      ) : (
        <div>
          <h3 className="font-semibold">
            {venue || 'Venue details coming soon'}
          </h3>
          <p className="whitespace-pre-wrap">{details}</p>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Outing conversation</h3>
        <button onClick={load} className="p-3 underline">
          Refresh
        </button>
      </div>
      <div className="space-y-3 max-h-80 overflow-auto">
        {messages.length ? (
          messages.map((m) => (
            <article key={m.id} className="border-b pb-3">
              <span className="text-xs">
                {m.author_id === userId ? 'You' : 'Participant'} ·{' '}
                {new Date(m.created_at).toLocaleString()}
              </span>
              <p className="whitespace-pre-wrap break-words">{m.body}</p>
            </article>
          ))
        ) : (
          <p>No messages yet. Share a practical detail or say hello.</p>
        )}
      </div>
      <form onSubmit={send} className="space-y-2">
        <label className="block">
          Message
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            className="w-full block p-3 border rounded-lg bg-transparent"
          />
        </label>
        <button
          disabled={busy || !body.trim()}
          className="p-3 border rounded-lg"
        >
          Send
        </button>
      </form>
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
