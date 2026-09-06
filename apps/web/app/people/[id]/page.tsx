'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AuthGuard } from '../../../components/AuthGuard';
import { useAuth } from '../../../lib/authContext';
import { getSupabaseBrowserClient } from '../../../lib/supabase';
import { SafetyActions } from '../../../components/outings/SafetyActions';

type PublicProfile = {
  id: string;
  display_name: string;
  handle: string;
  avatar_url?: string;
  bio?: string;
  home_area?: string;
  user_values?: { value_key: string }[];
};
export default function PersonDetailPage() {
  return (
    <AuthGuard>
      <PersonDetailContent />
    </AuthGuard>
  );
}
function PersonDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [status, setStatus] = useState('Loading profile…');
  const [attempt, setAttempt] = useState(0);
  const [pitches, setPitches] = useState<
    { id: string; title: string; area: string }[]
  >([]);
  useEffect(() => {
    let active = true;
    setProfile(null);
    setStatus('Loading profile…');
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      setStatus('Profile unavailable.');
      return;
    }
    // Explicit public projection, governed by bilateral block/status RLS.
    getSupabaseBrowserClient()
      .from('profiles')
      .select(
        'id,display_name,handle,avatar_url,bio,home_area,user_values(value_key)',
      )
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setStatus('Unable to load this profile.');
        else if (!data) setStatus('Profile unavailable.');
        else {
          setProfile(data as PublicProfile);
          setStatus('');
        }
      });
    getSupabaseBrowserClient()
      .from('outings')
      .select('id,title,area')
      .eq('host_id', id)
      .in('state', ['open', 'confirmed'])
      .order('starts_at')
      .limit(6)
      .then(({ data }) => {
        if (active) setPitches(data || []);
      });
    return () => {
      active = false;
    };
  }, [id, attempt]);
  return (
    <main className="min-h-screen bg-ground-paper text-ink-espresso px-5 pt-8 pb-28">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link href="/people" className="inline-block py-3 underline text-sm">
          Back to people
        </Link>
        {status && (
          <div role="status">
            <p>{status}</p>
            <button
              className="py-3 underline"
              onClick={() => setAttempt((n) => n + 1)}
            >
              Try again
            </button>
          </div>
        )}
        {profile && (
          <>
            <header className="flex gap-5 items-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-ground-sand flex items-center justify-center text-3xl font-serif">
                  {profile.display_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-xs text-accent-sage tracking-widest uppercase">
                  Soul Tribe
                </p>
                <h1 className="font-serif text-4xl mt-2">
                  {profile.display_name}
                </h1>
                <p className="text-sm text-ink-bark mt-2">
                  @{profile.handle} · {profile.home_area}
                </p>
              </div>
            </header>
            <section className="rounded-3xl p-6 bg-ground-card border border-ink-espresso/10 shadow-e1">
              <h2 className="font-serif text-2xl">In their own words</h2>
              <p className="mt-3 leading-relaxed whitespace-pre-wrap text-ink-bark">
                {profile.bio || 'They haven’t added an introduction yet.'}
              </p>
            </section>
            {!!profile.user_values?.length && (
              <section className="bg-ground-mist rounded-3xl p-6">
                <h2 className="font-serif text-2xl">What they’ve shared</h2>
                <div className="flex flex-wrap gap-3 mt-4">
                  {profile.user_values.map((v) => (
                    <span
                      key={v.value_key}
                      className="rounded-full bg-ground-card px-4 py-2 text-sm"
                    >
                      {v.value_key.replaceAll('_', ' ')}
                    </span>
                  ))}
                </div>
              </section>
            )}
            <section className="rounded-3xl bg-ground-sand p-6">
              <h2 className="font-serif text-2xl">
                What could friendship feel like?
              </h2>
              <p className="mt-3 text-ink-bark leading-relaxed">
                Explore your shared rhythms, possible differences and the
                threads that are still taking shape.
              </p>
              <Link
                href={`/people/${profile.id}/bond`}
                className="inline-block mt-4 rounded-full bg-accent-sage text-ink-chalk px-6 py-3"
              >
                Read Connection Notes
              </Link>
            </section>
            <Link
              href={`/outings/pitch?inviteId=${profile.id}`}
              className="inline-block py-3 underline"
            >
              Invite them to an outing
            </Link>
            {!!pitches.length && (
              <section>
                <h2 className="font-serif text-2xl">Their open Pitches</h2>
                {pitches.map((p) => (
                  <Link
                    className="block py-4 border-b"
                    key={p.id}
                    href={`/outings/${p.id}`}
                  >
                    {p.title} · {p.area}
                  </Link>
                ))}
              </section>
            )}
            {user && <SafetyActions userId={user.id} targetId={profile.id} />}
          </>
        )}
      </div>
    </main>
  );
}
