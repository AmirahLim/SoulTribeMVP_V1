'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AuthGuard } from '../../../../components/AuthGuard';
import { useAuth } from '../../../../lib/authContext';
import { SafetyActions } from '../../../../components/outings/SafetyActions';

import {BondScrapbook, type BondNotes as Notes} from '../../../../components/BondScrapbook';
import scrapbook from '../../../../components/BondScrapbook.module.css';
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
    <main className={scrapbook.scene}>
      <div className="mx-auto max-w-3xl space-y-8">
        <Link href="/people" className="inline-block py-3 text-sm underline">
          Back to people
        </Link>
        {loading && <p role="status">Reading your shared threads…</p>}
        {error && (
          <div role="alert" className="rounded-2xl bg-ground-sand text-ink-espresso p-6">
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
            <BondScrapbook notes={notes} />
            {user && (
              <SafetyActions userId={user.id} targetId={notes.candidate.id} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
