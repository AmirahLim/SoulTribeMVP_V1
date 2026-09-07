'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AuthGuard } from '../../../../components/AuthGuard';
import { useAuth } from '../../../../lib/authContext';
import { SafetyActions } from '../../../../components/outings/SafetyActions';

type Thread = {
  key: string;
  status: 'known' | 'unknown';
  headline?: string;
  phrase?: string;
  mechanism?: string;
};
type Notes = {
  candidate: {
    id: string;
    displayName: string;
    bio?: string;
    homeArea?: string;
  };
  clickText: string;
  rubText: string;
  threads: Thread[];
  sharpen: { questionId: string; prompt: string; href: string }[];
  overall: { provisional: boolean };
};
const labels: Record<string, string> = {
  personality: 'Social Energy',
  communication: 'How You Connect',
  intent: 'Friendship Style',
  emotional: 'Emotional Pacing',
  values: 'What Matters',
  interests: 'Shared Interests',
  social_rhythm: 'Your Rhythms',
  lifestyle: 'Everyday Life',
  experience: 'Outing Preferences',
  geography: 'Meeting Up',
};
export default function ConnectionNotesPage() {
  return (
    <AuthGuard>
      <ConnectionNotesContent />
    </AuthGuard>
  );
}
function ConnectionNotesContent() {
  const params = useParams<{ id: string }>();
  const { session, user } = useAuth();
  const [notes, setNotes] = useState<Notes | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setNotes(null);
    if (!session?.access_token) {
      setLoading(false);
      setError('Sign in to read your Connection Notes.');
      return;
    }
    fetch('/api/bond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ candidateId: params.id }),
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok)
          throw new Error(
            r.status === 404
              ? 'These Connection Notes are unavailable.'
              : 'Unable to load your Connection Notes.',
          );
        return r.json();
      })
      .then(setNotes)
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [params.id, session?.access_token, attempt]);
  return (
    <main className="min-h-screen bg-ground-paper text-ink-espresso px-5 pt-8 pb-28">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link href="/people" className="inline-block py-3 text-sm underline">
          Back to people
        </Link>
        <header>
          <p className="text-xs uppercase tracking-widest text-accent-sage font-semibold">
            Soul Tribe
          </p>
          <h1 className="font-serif text-4xl mt-2">Connection Notes</h1>
          <p className="mt-3 text-ink-bark">
            A starting point for understanding each other.
          </p>
        </header>
        {loading && <p role="status">Reading your shared threads…</p>}
        {error && (
          <div role="alert" className="rounded-2xl bg-ground-sand p-6">
            <p>{error}</p>
            <button
              className="mt-3 p-3 underline"
              onClick={() => setAttempt((n) => n + 1)}
            >
              Try again
            </button>
          </div>
        )}
        {notes && (
          <>
            <section className="bg-ground-card rounded-3xl p-6 sm:p-8 shadow-e1 border border-ink-espresso/10">
              <p className="text-xs uppercase tracking-widest text-accent-sage">
                You & {notes.candidate.displayName}
              </p>
              <h2 className="font-serif text-2xl mt-3">
                Where you may connect
              </h2>
              <p className="mt-3 text-ink-bark leading-relaxed">
                {notes.clickText ||
                  'There is not enough shared information for a detailed read yet.'}
              </p>
              <h3 className="font-serif text-xl mt-6">Worth understanding</h3>
              <p className="mt-2 text-ink-bark leading-relaxed">
                {notes.rubText ||
                  'No specific friction is supported by the answers shared so far.'}
              </p>
              {notes.overall.provisional && (
                <p className="mt-5 text-sm">
                  This is an early read. It can change as you share more.
                </p>
              )}
            </section>
            <section className="space-y-3">
              <h2 className="font-serif text-2xl">Thread by thread</h2>
              {notes.threads.map((t, i) => (
                <details
                  key={t.key}
                  className={`rounded-2xl p-5 border border-ink-espresso/10 ${i % 2 ? 'bg-ground-mist' : 'bg-ground-sand'}`}
                >
                  <summary className="cursor-pointer font-semibold py-1">
                    {labels[t.key] || t.key}
                    <span className="block font-normal text-sm mt-1 text-ink-bark">
                      {t.status === 'known' ? t.headline : 'Still taking shape'}
                    </span>
                  </summary>
                  <p className="mt-4 leading-relaxed text-ink-bark">
                    {t.status === 'known'
                      ? t.phrase
                      : 'Not enough shared, visible information to describe this thread.'}
                  </p>
                </details>
              ))}
            </section>
            {!!notes.sharpen.length && (
              <section className="space-y-3">
                <h2 className="font-serif text-2xl">
                  Add a little more context
                </h2>
                {notes.sharpen.map((q) =>
                  q.href ? (
                    <Link
                      className="block py-2 underline"
                      key={q.questionId}
                      href={q.href}
                    >
                      {q.prompt}
                    </Link>
                  ) : (
                    <p key={q.questionId}>{q.prompt}</p>
                  ),
                )}
              </section>
            )}
            {user && (
              <SafetyActions userId={user.id} targetId={notes.candidate.id} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
