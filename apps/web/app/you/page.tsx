'use client';
import {PublicAnswerSharing} from '../../components/profile/PublicAnswers';
import { AnswerPortrait } from '../../components/profile/AnswerPortrait';
import { ReflectionPreferences } from '../../components/outings/ReflectionPreferences';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../lib/authContext';
import { getUserProfile, setUserProfile } from '../../lib/userStore';
import { AuthGuard } from '../../components/AuthGuard';
import { saveProfileIdentity } from '../../lib/saveProfileIdentity';
import { fetchUserPitches, OutingItem } from '../../lib/outingsStore';
import Link from 'next/link';

import {SocialScrapbook} from '../../components/profile/SocialScrapbook';
import {selfSocialPages} from '../../lib/socialScrapbook';
import type {TribalReadData} from '../../components/profile/TribalRead';
import type {ValueNode} from '../../components/profile/ValuesConstellationCanvas';
import type {InterestNode} from '../../components/profile/InterestGraphCanvas';

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
  const { user: authUser, session, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const handleSignOut = async () => {
    if (signingOut || saving) return;
    setSigningOut(true); setSignOutError(null);
    try { await signOut(); window.location.assign('/'); }
    catch { setSignOutError('Could not sign out. Please try again.'); setSigningOut(false); }
  };

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
    if (saving || signingOut || !authUser?.id) return;
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

  const profile = myRead.profile;
  const localProfile = getUserProfile();

  return (
    <div>
      <SocialScrapbook own name={profile.display_name} handle={profile.handle} area={profile.home_area}
        avatar={profile.avatar_url} bio={profile.bio} headline={myRead.tribalRead?.headline}
        summary={myRead.tribalRead?.summary} pages={selfSocialPages(myRead)}
        onEdit={() => {
          setEditName(profile.display_name); setEditArea(profile.home_area || '');
          setEditBio(profile.bio || ''); setSaveError(null); setIsSettingsOpen(true);
        }}>
        {!!localProfile.lifeContexts?.length && <p className="mb-6">Life lately · {localProfile.lifeContexts.join(' · ')}</p>}
        {!!userPitches.length && <section className="mb-8">
          <h2 className="font-serif text-2xl mb-3">Plans with my name on them</h2>
          {userPitches.map(p => <Link key={p.id} href={`/outings/${p.id}`} className="block py-3 border-b border-white/20">{p.title} ↗</Link>)}
        </section>}
        <details className="border-t border-white/25">
          <summary>My answers, profile & privacy</summary>
          <div>
            <Link className="underline py-3" href="/onboarding">Review or change my six answers →</Link>
            <Link className="underline py-3" href="/early-read">Revisit and correct my Early Read →</Link>
            <details><summary>Your saved answers</summary><AnswerPortrait profile={localProfile}/></details>
            <PublicAnswerSharing userId={authUser?.id}/>
            {authUser?.id && <ReflectionPreferences userId={authUser.id}/>}
          </div>
        </details>
      </SocialScrapbook>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <dialog ref={settingsDialog} aria-labelledby="profile-settings-title"
          onCancel={(event) => { if (saving) event.preventDefault(); else setIsSettingsOpen(false); }}
          className="w-[calc(100%-32px)] max-w-md max-h-[85dvh] overflow-y-auto rounded-[26px] bg-[#F8F5EE] p-0 backdrop:bg-black/40">
          <div className="w-full max-w-md rounded-[26px] border border-[#203B30]/15 bg-[#F8F5EE] p-6 text-[#203B30]">
            <h3 id="profile-settings-title" className="text-lg font-bold">Edit profile</h3>

            {saveError && <p role="alert" className="mt-3 text-sm text-red-800">{saveError}</p>}
            <form onSubmit={handleSaveSettings} className="mt-4 flex flex-col gap-4 text-sm [&_input]:text-base [&_textarea]:text-base">
              <div>
                <label htmlFor="profile-name" className="font-semibold text-[#536657]">Display name</label>
                <p className="mt-1 text-sm">The name people see. It does not need to be unique.</p>
                <input
                  id="profile-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#203B30]/15 bg-[rgba(255,255,255,0.05)] p-2.5 text-[#203B30]"
                />
              </div>

              <div className="text-sm">
                <p className="font-semibold text-[#536657]">Username</p>
                <p>@{profile.handle}</p>
                <p className="mt-1">Your unique handle. Changing your display name does not change this.</p>
              </div>
              <div>
                <label htmlFor="profile-area" className="font-semibold text-[#536657]">Home Area</label>
                <input
                  id="profile-area"
                  type="text"
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#203B30]/15 bg-[rgba(255,255,255,0.05)] p-2.5 text-[#203B30]"
                />
              </div>

              <div>
                <label htmlFor="profile-bio" className="font-semibold text-[#536657]">Bio (optional)</label>
                <p className="mt-1 text-sm">Your saved introduction. Edit or clear it, then save changes.</p>
                <textarea
                  id="profile-bio"
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
            <div className="mt-6 border-t border-[#203B30]/20 pt-4">
              {signOutError && <p role="alert" className="mb-3 text-sm text-red-800">{signOutError}</p>}
              <button type="button" onClick={handleSignOut} disabled={signingOut || saving} className="w-full rounded border border-[#697653] bg-[#e0e3cc] py-3 text-base font-semibold text-[#35402f] disabled:opacity-50">
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
