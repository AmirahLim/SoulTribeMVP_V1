'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bloom } from '@soul-tribe/ui';
import { useAuth } from '../../lib/authContext';
import {
  getUserProfile, setUserProfile, UserProfileData,
  calculateTribeStanding
} from '../../lib/userStore';
import { AuthGuard } from '../../components/AuthGuard';
import { getSupabaseBrowserClient } from '../../lib/supabase';
import { fetchUserPitches, OutingItem } from '../../lib/outingsStore';
import { generateSelfProfile } from '@soul-tribe/core';
import type { SelfProfileData } from '@soul-tribe/core';
import { toProfileVector } from '../../lib/profileAdapter';

import { ProfileHero } from '../../components/profile/ProfileHero';
import { ThreadCard, ThreadData } from '../../components/profile/ThreadCard';
import { BoundariesMatching } from '../../components/profile/BoundariesMatching';
import { TribalRead } from '../../components/profile/TribalRead';
import { TheInterestingPart } from '../../components/profile/TheInterestingPart';
import { ConnectionNotes, NoteItem } from '../../components/profile/ConnectionNotes';
import { SocialInstincts, InstinctItem } from '../../components/profile/SocialInstincts';
import { ValuesConstellationCanvas } from '../../components/profile/ValuesConstellationCanvas';
import { InterestGraphCanvas } from '../../components/profile/InterestGraphCanvas';
import { OutingTriadCanvas } from '../../components/profile/OutingTriadCanvas';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { user: authUser } = useAuth();

  const [profile, setProfileState] = useState<UserProfileData>({
    displayName: 'Mimeo',
    handle: 'mimeooo',
    homeArea: 'Singapore',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: '',
    passCompletionPct: 100,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhoto, setEditPhoto] = useState('');

  const [userPitches, setUserPitches] = useState<OutingItem[]>([]);
  const [selfData, setSelfData] = useState<SelfProfileData | null>(null);
  const [userValues, setUserValues] = useState<any[]>([]);
  const [userInterests, setUserInterests] = useState<any[]>([]);

  useEffect(() => {
    async function loadPitches() {
      const list = await fetchUserPitches(authUser?.id || profile.id);
      setUserPitches(list);
    }
    loadPitches();
  }, [authUser?.id, profile.id]);

  useEffect(() => {
    let loaded = getUserProfile();
    setProfileState(loaded);
    setEditName(loaded.displayName || 'Mimeo');
    setEditArea(loaded.homeArea || 'Singapore');
    setEditBio(loaded.bio || '');
    setEditPhoto(loaded.avatarUrl || '');

    if (authUser?.id) {
      try {
        const client = getSupabaseBrowserClient();
        client
          .from('profiles')
          .select('*, trait_intent(*), trait_communication(*), trait_personality(*), trait_social_rhythm(*), trait_emotional(*), trait_experience(*), trait_lifestyle(*), trait_geography(*), user_interests(*), user_values(*)')
          .eq('id', authUser.id)
          .maybeSingle()
          .then(({ data: remoteProfile }) => {
            if (remoteProfile) {
              const merged = setUserProfile({
                ...loaded,
                displayName: remoteProfile.display_name || loaded.displayName,
                homeArea: remoteProfile.home_area || loaded.homeArea,
                avatarUrl: remoteProfile.avatar_url || loaded.avatarUrl,
                bio: remoteProfile.bio || loaded.bio,
                handle: remoteProfile.handle || loaded.handle,
              });
              setProfileState(merged);
              setEditName(merged.displayName);
              setEditArea(merged.homeArea);
              setEditBio(merged.bio || '');
              setEditPhoto(merged.avatarUrl);
              
              const vec = toProfileVector(remoteProfile, authUser.id);
              const computed = generateSelfProfile(vec);
              setSelfData(computed);
              
              if (remoteProfile.user_values) {
                setUserValues(remoteProfile.user_values.map((v: any) => ({
                  label: v.value_key,
                  x: v.x_pos || 50,
                  y: v.y_pos || 50,
                  weight: v.importance || 0.5
                })));
              }
              if (remoteProfile.user_interests) {
                setUserInterests(remoteProfile.user_interests.map((i: any) => ({
                  name: i.node_name || i.node_path,
                  x: i.x_pos || 50,
                  y: i.y_pos || 50,
                  weight: i.interest_level || 0.5
                })));
              }
            }
          });
      } catch {
        // Fallback
      }
    }
  }, [authUser?.id]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = setUserProfile({
      displayName: editName.trim() || 'Mimeo',
      homeArea: editArea,
      bio: editBio,
      avatarUrl: editPhoto,
    });
    setProfileState(updated);
    setIsSettingsOpen(false);

    if (authUser?.id) {
      try {
        const client = getSupabaseBrowserClient();
        await client
          .from('profiles')
          .update({
            display_name: editName.trim() || 'Mimeo',
            home_area: editArea,
            bio: editBio,
            avatar_url: editPhoto,
          })
          .eq('id', authUser.id);
      } catch {
        // Fallback
      }
    }
  };

  const currentStanding = calculateTribeStanding(profile.outingsAttended || 0, profile.outingsHosted || 0);
  const passCompletionPct = profile.passCompletionPct || 0;

  if (!selfData) {
    return (
      <div className="min-h-screen w-full bg-[#070908] flex items-center justify-center">
        <p className="text-[rgba(245,242,234,0.44)] animate-pulse text-sm">Loading your social footprint...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#070908] text-[#F5F2EA] pb-24">
      {/* ATMOSPHERIC BRAND CANVAS BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <img
          src="/user-you-bg.jpg"
          alt="Canvas Ground Background"
          className="absolute inset-0 h-full w-full object-cover blur-[2px] opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(4,6,5,0.80)] via-[rgba(4,6,5,0.60)] to-[rgba(4,6,5,0.95)]" />
      </div>

      {/* WRAPPER */}
      <div className="relative z-10 mx-auto max-w-[470px] px-[18px] pt-4 flex flex-col gap-6">
        {/* 1. Profile Hero with Top Social Summary, Tribe Standing & Connector Card */}
        <ProfileHero
          displayName={profile.displayName || 'Mimeo'}
          handle={profile.handle || 'mimeooo'}
          homeArea={profile.homeArea || 'Singapore'}
          bio={profile.bio}
          avatarUrl={profile.avatarUrl}
          passCompletionPct={passCompletionPct}
          standingText={currentStanding.label}
          instinctType={selfData?.primaryInstinct.type}
          instinctDescription={selfData?.primaryInstinct.description}
          onEditProfile={() => setIsSettingsOpen(true)}
          onDeepenPass={() => router.push('/you/deeper')}
        />

        {/* 2. Friendship DNA Bloom Header & Bloom Canvas */}
        <div className="flex flex-col items-center py-2 text-center border-t border-[rgba(245,242,234,0.08)] pt-6">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)] mb-1">
            FRIENDSHIP DNA BLOOM
          </p>
          <p className="text-xs text-[rgba(245,242,234,0.70)] max-w-xs leading-relaxed mb-4">
            A dynamic visual representation of your social energy, rhythm, and values.
          </p>
          <Bloom threads={selfData?.bloomThreads || []} size={280} interactive />
          <p className="text-[12.5px] text-[rgba(245,242,234,0.44)] mt-2">
            Ten threads · {selfData?.bloomThreads.filter(t => t.strength > 0).length || 0} explored · <span className="text-[#EFB94E]">tap a petal</span>
          </p>
        </div>

        {/* 3. Your Tribal Read */}
        <TribalRead data={selfData?.tribalRead} />

        {/* 4. The Interesting Part (Cross-thread Tension) */}
        <TheInterestingPart tension={selfData?.contradiction} />

        {/* 5. Connection Threads (Drawn Objects) */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between px-1">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
              Connection Threads
            </p>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
              {selfData?.connectionThreads?.length || 0} of 10
            </p>
          </div>

          {(selfData?.connectionThreads || []).map((t) => (
            <ThreadCard key={t.key} thread={t as any} />
          ))}
        </div>

        {/* 6. What Matters (Values Constellation Canvas) */}
        <ValuesConstellationCanvas values={userValues} />

        {/* 7. I'm Into (Interest Graph Canvas) */}
        <InterestGraphCanvas nodes={userInterests} />

        {/* 8. Outing DNA (Triad Radar Canvas) */}
        <OutingTriadCanvas
          descriptors={selfData?.outingPreferences.descriptors}
          values={selfData?.outingPreferences.values}
          instantYes={selfData?.outingPreferences.instantYes}
          usuallyYes={selfData?.outingPreferences.usuallyYes}
          convinceMe={selfData?.outingPreferences.convinceMe}
        />

        {/* 9. Connection Notes & Social Instincts */}
        <ConnectionNotes notes={selfData?.connectionNotes || []} />
        <SocialInstincts primaryInstinct={selfData?.primaryInstinct} />

        {/* 10. Hosted Pitches List */}
        {userPitches.length > 0 && (
          <div className="rounded-[26px] p-5 backdrop-blur-xl bg-[rgba(10,12,11,0.62)] border border-[rgba(245,242,234,0.11)] shadow-xl">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)] mb-3">
              Hosted Pitches ({userPitches.length})
            </p>
            <div className="flex flex-col gap-3">
              {userPitches.map((p) => (
                <div key={p.id} className="rounded-xl border border-[rgba(245,242,234,0.08)] bg-[rgba(255,255,255,0.03)] p-3.5">
                  <h4 className="font-sans text-sm font-semibold text-[#F5F2EA]">
                    {p.title}
                  </h4>
                  <p className="text-xs text-[rgba(245,242,234,0.70)] mt-1 leading-relaxed">
                    {p.pitch && p.pitch !== p.title
                      ? p.pitch
                      : `Hosted by ${profile.displayName} in ${p.area || profile.homeArea}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 11. Boundaries & Privacy */}
        <BoundariesMatching {...selfData?.boundaries} />

        {/* 12. Footer */}
        <p className="text-center text-[11.5px] leading-relaxed text-[rgba(245,242,234,0.44)] mt-6">
          Visual profile · your background, your brand colours<br />
          Content is illustrative — the engine supplies the words.
        </p>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(7,9,8,0.85)] p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[26px] border border-[rgba(245,242,234,0.20)] bg-[#0A0C0B] p-6 text-[#F5F2EA]">
            <h3 className="text-lg font-bold">Edit Profile &amp; Settings</h3>

            <form onSubmit={handleSaveSettings} className="mt-4 flex flex-col gap-4 text-xs">
              <div>
                <label className="font-semibold text-[rgba(245,242,234,0.70)]">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[rgba(245,242,234,0.15)] bg-[rgba(255,255,255,0.05)] p-2.5 text-[#F5F2EA]"
                />
              </div>

              <div>
                <label className="font-semibold text-[rgba(245,242,234,0.70)]">Home Area</label>
                <input
                  type="text"
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[rgba(245,242,234,0.15)] bg-[rgba(255,255,255,0.05)] p-2.5 text-[#F5F2EA]"
                />
              </div>

              <div>
                <label className="font-semibold text-[rgba(245,242,234,0.70)]">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[rgba(245,242,234,0.15)] bg-[rgba(255,255,255,0.05)] p-2.5 text-[#F5F2EA]"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 rounded-xl border border-[rgba(245,242,234,0.20)] bg-[rgba(255,255,255,0.05)] py-2.5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#2D523E] py-2.5 font-bold text-[#F5F2EA]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
