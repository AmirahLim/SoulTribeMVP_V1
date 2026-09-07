'use client';
import { AnswerPortrait } from '../../components/profile/AnswerPortrait';
import { ReflectionPreferences } from '../../components/outings/ReflectionPreferences';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bloom } from '@soul-tribe/ui';
import { useAuth } from '../../lib/authContext';
import { getUserProfile, setUserProfile } from '../../lib/userStore';
import { AuthGuard } from '../../components/AuthGuard';
import { saveProfileIdentity } from '../../lib/saveProfileIdentity';
import { fetchUserPitches, OutingItem } from '../../lib/outingsStore';
import Link from 'next/link';

import { ProfileHero } from '../../components/profile/ProfileHero';
import { PassArcCanvas } from '../../components/profile/PassArcCanvas';
import { ThreadCard, ThreadData } from '../../components/profile/ThreadCard';
import { TribalRead, TribalReadData } from '../../components/profile/TribalRead';
import { TheInterestingPart } from '../../components/profile/TheInterestingPart';
import { BoundariesMatching } from '../../components/profile/BoundariesMatching';
import { ConnectionNotes } from '../../components/profile/ConnectionNotes';
import { ValuesConstellationCanvas, ValueNode } from '../../components/profile/ValuesConstellationCanvas';
import { InterestGraphCanvas, InterestNode } from '../../components/profile/InterestGraphCanvas';
import { OutingTriadCanvas } from '../../components/profile/OutingTriadCanvas';

// ─── MyRead types (mirrors api/me/read response) ────────────────────

interface MyReadThreadKnown {
  key: string;
  name: string;
  status: 'known';
  strength: number;
  confidence: number;
  descriptor: string[];
  note: string;
  signals: { key: string; label: string; evidenceLevel: 'DIRECT' }[];
  extraVisualData?: Record<string, unknown>;
}

interface MyReadThreadUnknown {
  key: string;
  name: string;
  status: 'unknown';
  nextPrompt: string;
  nextHref: string;
}

type MyReadThread = MyReadThreadKnown | MyReadThreadUnknown;

interface MyReadOutingPrefs {
  descriptors?: string[];
  values?: [number, number, number];
  instantYes?: string;
  usuallyYes?: string[];
  convinceMe?: string[];
}

interface MyRead {
  profile: {
    id: string;
    display_name: string;
    handle: string;
    home_area: string;
    avatar_url?: string;
    bio?: string;
  };
  confidence: number;
  passCompletionPct?: number;
  threadsExplored: number;
  threadsTotal: 10;
  threads: MyReadThread[];
  markers: string[];
  signalsCount?: number;
  tribalRead?: TribalReadData;
  tension?: {
    headline: string;
    explanation: string;
    threadsInvolved: string[];
  };
  boundaries?: {
    punctualityStance?: string;
    cancellationStance?: string;
    groupSizeBoundary?: string;
    locationBoundary?: string;
  };
  connectionNotes?: Array<{
    id: string;
    hook: string;
    statement: string;
    explanation: string;
    whatItLooksLike?: string;
    sourceThreads?: string[];
  }>;
  socialInstinct?: {
    type: any;
    description: string;
  };
  outingPreferences?: MyReadOutingPrefs;
  interests: InterestNode[];
  values: ValueNode[];
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { user: authUser, session } = useAuth();

  const [myRead, setMyRead] = useState<MyRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const settingsDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (isSettingsOpen) settingsDialog.current?.showModal();
  }, [isSettingsOpen]);
  const [editName, setEditName] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhoto, setEditPhoto] = useState('');

  const [userPitches, setUserPitches] = useState<OutingItem[]>([]);

  // Fetch pitches
  useEffect(() => {
    async function loadPitches() {
      if (!authUser?.id) return;
      const list = await fetchUserPitches(authUser.id);
      setUserPitches(list);
    }
    loadPitches();
  }, [authUser?.id]);

  // Fetch /api/me/read
  useEffect(() => {
    async function fetchMyRead() {
      const token = session?.access_token;
      if (!token) {
        setLoading(false);
        setError('Not signed in');
        return;
      }

      try {
        const res = await fetch('/api/me/read', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || `Failed to load profile (${res.status})`);
          setLoading(false);
          return;
        }

        const data: MyRead = await res.json();
        setMyRead(data);

        // Sync identity to local store
        if (data.profile) {
          setUserProfile({
            displayName: data.profile.display_name,
            homeArea: data.profile.home_area,
            avatarUrl: data.profile.avatar_url,
            bio: data.profile.bio,
            handle: data.profile.handle,
          });
          setEditName(data.profile.display_name || '');
          setEditArea(data.profile.home_area || '');
          setEditBio(data.profile.bio || '');
          setEditPhoto(data.profile.avatar_url || '');
        }
      } catch (err) {
        setError('Could not load your profile read');
      } finally {
        setLoading(false);
      }
    }

    fetchMyRead();
  }, [session?.access_token]);

  // Settings save handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !authUser?.id) return;
    setSaving(true);
    setSaveError(null);
    try {
      const identity = await saveProfileIdentity(authUser.id, {
        display_name: editName, home_area: editArea, bio: editBio, avatar_url: editPhoto,
      });
      setMyRead(current => current ? { ...current, profile: { ...current.profile, ...identity } } : current);
      setUserProfile({ displayName: identity.display_name, homeArea: identity.home_area, bio: identity.bio, avatarUrl: identity.avatar_url });
      setIsSettingsOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Your changes could not be saved. Please try again.');
    } finally { setSaving(false); }

  };

  // ─── Loading state ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F8F5EE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#5BD99A]" />
          <p className="text-[#536657] text-sm">Loading your profile…</p>
        </div>
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────

  if (error || !myRead) {
    return (
      <div className="min-h-screen w-full bg-[#F8F5EE] flex items-center justify-center p-6">
        <div className="text-center max-w-xs">
          <p className="text-[#826044] text-sm font-semibold mb-2">Could not load your read</p>
          <p className="text-[#536657] text-xs leading-relaxed">
            {error || 'Something went wrong. Try refreshing.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-full border border-[#203B30]/15 text-xs text-[#203B30]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Derived data from MyRead ──────────────────────────────────────

  const profile = myRead.profile;
  const threads = myRead.threads;

  // Bloom threads: known → use strength, unknown → ghost petal (strength 0)
  const bloomThreads = threads.map((t) => ({
    key: t.key,
    label: t.name,
    strength: t.status === 'known' ? t.strength : 0,
    confidence: t.status === 'known' ? t.confidence : 0,
    sentence: t.status === 'known' ? t.note : '',
  }));

  // Connection threads excludes values and interests which have dedicated cards below
  const connectionThreads = threads.filter((t) => t.key !== 'interests' && t.key !== 'values');

  // Local standing calculation
  const localProfile = getUserProfile();

  return (
    <div className="relative min-h-screen w-full bg-[#101c18] text-[#d8e4db] pb-24">
      {/* WRAPPER */}
      <div className="relative z-10 mx-auto max-w-[470px] px-[18px] pt-4 flex flex-col gap-6">
        {/* 1. Restored Profile Hero (with real data, no hardcoded defaults) */}
        <div className="rounded-[30px] bg-[#f2f0e7] px-5"><ProfileHero
          displayName={profile.display_name}
          handle={profile.handle}
          homeArea={profile.home_area}
          bio={profile.bio}
          avatarUrl={profile.avatar_url}
          passCompletionPct={myRead.passCompletionPct}
          onEditProfile={() => {
            setEditName(profile.display_name); setEditArea(profile.home_area || '');
            setEditBio(profile.bio || ''); setSaveError(null); setIsSettingsOpen(true);
          }}
          onDeepenPass={() => router.push('/you/deeper')}
        /></div>

        {myRead.tribalRead ? <TribalRead data={myRead.tribalRead} /> : <section className="rounded-3xl bg-[#E3EADF] p-6"><h2 className="text-2xl font-semibold">Your Social Signature</h2><p className="mt-3 text-sm">Your portrait grows from what you choose to share. Add more answers when you feel ready.</p></section>}

        {/* 2. Pass Arc (Drawn Arc Canvas) */}
        <PassArcCanvas
          exploredPct={myRead.threadsExplored / myRead.threadsTotal}
          signalsText={
            typeof myRead.signalsCount === 'number' && myRead.signalsCount > 0
              ? `Developing read · ${myRead.signalsCount} signals`
              : `Developing read · ${myRead.threadsExplored} explored`
          }
        />

        <details className="rounded-3xl bg-[#f2f0e7] p-5 text-[#203B30]"><summary className="cursor-pointer text-sm">Your saved answers</summary><AnswerPortrait profile={localProfile} /></details>
        {/* 3. Friendship DNA Bloom */}
        <div className="flex flex-col items-center rounded-[32px] bg-gradient-to-br from-[#dfebdf] via-[#f2eee3] to-[#e1dfee] p-6 text-center text-[#203B30]">
          <h2 className="text-xl font-semibold">Your Social Signature</h2>
          <p className="mt-2 text-xs">A living visual of how your Connection Threads come together.</p>
          <Bloom threads={bloomThreads} size={280} interactive />
          <p className="text-[12.5px] text-[#536657] mt-1">
            Ten threads · {myRead.threadsExplored} explored · <span className="text-[#826044]">tap a petal</span>
          </p>
        </div>

        {/* 5. The Interesting Part (cross-thread tension) — only when data exists */}
        {myRead.tension && (
          <TheInterestingPart tension={myRead.tension} />
        )}

        {/* 6. Connection Threads */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between px-1">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#536657]">
              Connection Threads
            </p>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#536657]">
              {connectionThreads.filter((t) => t.status === 'known').length} of {connectionThreads.length}
            </p>
          </div>

          {connectionThreads.map((t) => {
            if (t.status === 'unknown') {
              return (
                <div
                  key={t.key}
                  className="rounded-[22px] p-5 backdrop-blur-xl bg-[#F2EEE5] border border-[#203B30]/15"
                >
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#536657] mb-2">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#536657] leading-relaxed">
                    This part of you is still unfolding.
                  </p>
                  <Link
                    href={t.nextHref}
                    className="inline-block mt-3 text-xs font-semibold text-[#826044] hover:underline"
                  >
                    {t.nextPrompt} →
                  </Link>
                </div>
              );
            }

            // Known thread → ThreadCard
            const threadData: ThreadData = {
              key: t.key,
              name: t.name,
              strength: t.strength,
              confidence: t.confidence,
              heroDescriptor: t.descriptor,
              note: t.note,
              naturalSetting: '',
              thriveWhen: '',
              signals: t.signals,
              extraVisualData: t.extraVisualData,
            };
            return <ThreadCard key={t.key} thread={threadData} />;
          })}
        </div>

        {/* 7. Boundaries & Social Principles — only when data exists */}
        {myRead.boundaries && (
          <BoundariesMatching
            voice="first"
            punctualityStance={myRead.boundaries.punctualityStance}
            cancellationStance={myRead.boundaries.cancellationStance}
            groupSizeBoundary={myRead.boundaries.groupSizeBoundary}
            locationBoundary={myRead.boundaries.locationBoundary}
          />
        )}

        {authUser?.id && <ReflectionPreferences userId={authUser.id} />}
        {/* 8. Connection Notes — only when data exists */}
        {myRead.connectionNotes && myRead.connectionNotes.length > 0 && (
          <ConnectionNotes notes={myRead.connectionNotes} />
        )}

        {/* 10. What Matters (Values Constellation Canvas) */}
        <div className="flex flex-col">
          <div className="flex items-baseline justify-between px-1 mb-3">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#536657]">
              What Matters
            </p>
          </div>
          <ValuesConstellationCanvas
            values={myRead.values?.length ? myRead.values : undefined}
            note={
              myRead.values?.length
                ? 'Values you have chosen to share.'
                : undefined
            }
          />
        </div>

        {/* 11. I'm Into (Interest Graph Canvas) */}
        <div className="flex flex-col">
          <div className="flex items-baseline justify-between px-1 mb-3">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#536657]">
              I'm Into
            </p>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#826044]">
              Rabbit hole
            </p>
          </div>
          <InterestGraphCanvas
            nodes={myRead.interests?.length ? myRead.interests : undefined}
          />
        </div>

        {/* 12. Outing DNA (Triad Radar Canvas) */}
        {myRead.outingPreferences && (
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between px-1 mb-3">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#536657]">
                Outing DNA
              </p>
            </div>
            <OutingTriadCanvas
              descriptors={myRead.outingPreferences.descriptors}
              values={myRead.outingPreferences.values}
              instantYes={myRead.outingPreferences.instantYes}
              usuallyYes={myRead.outingPreferences.usuallyYes}
              convinceMe={myRead.outingPreferences.convinceMe}
            />
          </div>
        )}

        {/* 13. Hosted Pitches */}
        {userPitches.length > 0 && (
          <div className="rounded-[26px] p-5 backdrop-blur-xl bg-[#F2EEE5] border border-[#203B30]/15 shadow-xl">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#536657] mb-3">
              Hosted Pitches ({userPitches.length})
            </p>
            <div className="flex flex-col gap-3">
              {userPitches.map((p) => (
                <div key={p.id} className="rounded-xl border border-[#203B30]/15 bg-[rgba(255,255,255,0.03)] p-3.5">
                  <h4 className="font-sans text-sm font-semibold text-[#203B30]">
                    {p.title}
                  </h4>
                  <p className="text-xs text-[#536657] mt-1 leading-relaxed">
                    {p.pitch && p.pitch !== p.title
                      ? p.pitch
                      : `Hosted by ${profile.display_name} in ${p.area || profile.home_area}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 14. Clean Footer */}
        <p className="text-center text-[11.5px] leading-relaxed text-[#536657] mt-6">
          Soul Tribe · Singapore
        </p>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <dialog ref={settingsDialog} aria-labelledby="profile-settings-title"
          onCancel={(event) => { if (saving) event.preventDefault(); else setIsSettingsOpen(false); }}
          className="w-full max-w-md rounded-[26px] bg-[#F8F5EE] p-0 backdrop:bg-black/40">
          <div className="w-full max-w-md rounded-[26px] border border-[#203B30]/15 bg-[#F8F5EE] p-6 text-[#203B30]">
            <h3 id="profile-settings-title" className="text-lg font-bold">Edit profile</h3>

            {saveError && <p role="alert" className="mt-3 text-sm text-red-800">{saveError}</p>}
            <form onSubmit={handleSaveSettings} className="mt-4 flex flex-col gap-4 text-xs">
              <div>
                <label htmlFor="profile-name" className="font-semibold text-[#536657]">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#203B30]/15 bg-[rgba(255,255,255,0.05)] p-2.5 text-[#203B30]"
                />
              </div>

              <div>
                <label htmlFor="profile-area" className="font-semibold text-[#536657]">Home Area</label>
                <input
                  type="text"
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#203B30]/15 bg-[rgba(255,255,255,0.05)] p-2.5 text-[#203B30]"
                />
              </div>

              <div>
                <label htmlFor="profile-bio" className="font-semibold text-[#536657]">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#203B30]/15 bg-[rgba(255,255,255,0.05)] p-2.5 text-[#203B30]"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 rounded-xl border border-[#203B30]/15 bg-[rgba(255,255,255,0.05)] py-2.5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[#2D523E] py-2.5 font-bold text-[#F5F2EA]"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}
