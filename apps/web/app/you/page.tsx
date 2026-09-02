'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bloom } from '@soul-tribe/ui';
import { Settings } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import {
  getUserProfile, setUserProfile, UserProfileData,
  calculateTribeStanding
} from '../../lib/userStore';
import { AuthGuard } from '../../components/AuthGuard';
import { getActiveNextBestPrompts } from '../../lib/threadPrompts';
import { getSupabaseBrowserClient } from '../../lib/supabase';
import { fetchUserPitches, OutingItem } from '../../lib/outingsStore';

import { ProfileHero } from '../../components/profile/ProfileHero';
import { ReadDepthIndicator } from '../../components/profile/ReadDepthIndicator';
import { ThreadCard, ThreadData } from '../../components/profile/ThreadCard';
import { WhatStandsOut } from '../../components/profile/WhatStandsOut';
import { RealWorldSocialSelf } from '../../components/profile/RealWorldSocialSelf';
import { BoundariesMatching } from '../../components/profile/BoundariesMatching';
import { TribalRead } from '../../components/profile/TribalRead';
import { TheInterestingPart } from '../../components/profile/TheInterestingPart';
import { ConnectionNotes, NoteItem } from '../../components/profile/ConnectionNotes';
import { SocialInstincts, InstinctItem } from '../../components/profile/SocialInstincts';

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
    bio: 'Loves specialty coffee, ceramic craft, and analog film.',
    passCompletionPct: 95,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhoto, setEditPhoto] = useState('');

  const [userPitches, setUserPitches] = useState<OutingItem[]>([]);

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
    setEditBio(loaded.bio || 'Loves specialty coffee, ceramic craft, and analog film.');
    setEditPhoto(loaded.avatarUrl || '');

    if (authUser?.id) {
      try {
        const client = getSupabaseBrowserClient();
        client
          .from('profiles')
          .select('*')
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
              setEditBio(merged.bio);
              setEditPhoto(merged.avatarUrl);
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

  const currentStanding = calculateTribeStanding(profile.outingsAttended || 3, profile.outingsHosted || 1);
  const completedCats = profile.completedCategoryNums || [2, 3, 4, 5, 6, 7];
  const isCatDone = (num: number) => completedCats.includes(num);

  // Confidence derived from signal counts (engine confidence)
  const confidenceValue = 0.95;
  const totalSignalsCount = 78;

  // Next best questions phrased as value
  const nextPrompts = getActiveNextBestPrompts(profile, 2).map((p) => ({
    thread: p.thread,
    question: p.label,
    prompt: p.copy,
  }));

  // Bloom threads
  const bloomThreads = [
    { key: 'personality', label: 'Social Energy', strength: 0.85, confidence: confidenceValue, sentence: 'Thrives in quiet, intentional 1-on-1s and small groups.' },
    { key: 'communication', label: 'Communication', strength: 0.9, confidence: confidenceValue, sentence: 'Prefers low-pressure, async messaging.' },
    { key: 'social_rhythm', label: 'Social Rhythm', strength: 0.75, confidence: confidenceValue, sentence: 'Values planned dates locked in advance.' },
    { key: 'intent', label: 'Friendship Style', strength: 0.95, confidence: confidenceValue, sentence: 'Seeks a small, enduring inner circle.' },
    { key: 'emotional', label: 'Emotional Connection', strength: 0.8, confidence: confidenceValue, sentence: 'Paces trust thoughtfully over repeated catch-ups.' },
    { key: 'interests', label: 'Interests', strength: 0.85, confidence: confidenceValue, sentence: 'Loves specialty coffee, ceramic craft, and analog film.' },
    { key: 'values', label: 'Values', strength: 0.9, confidence: confidenceValue, sentence: 'Prioritizes authenticity, growth, and community.' },
    { key: 'lifestyle', label: 'Play & Humour', strength: 0.8, confidence: confidenceValue, sentence: 'Appreciates light banter and novel outing spots.' },
  ];

  // Connection Threads list
  const connectionThreadsList: ThreadData[] = [
    {
      key: 'personality',
      name: 'Social Energy',
      heroDescriptor: ['Intimate', 'Selective', 'Calm'],
      strength: 0.85,
      confidence: confidenceValue,
      naturalSetting: 'Low-noise coffee spots, quiet studios, 1-on-1 tea catch-ups.',
      socialMeaning: 'You recharge through focused conversations rather than bustling crowds.',
      thriveWhen: 'Settings have minimal background noise and predictable party sizes.',
      potentialFriction: 'May feel drained in loud, open-ended networking mixers.',
      signals: [
        { key: 'q3', label: 'Prefers 1-on-1 or 3-4 people', evidenceLevel: 'DIRECT' },
        { key: 'p_ext', label: 'Selective extraversion', evidenceLevel: 'SUPPORTED INFERENCE' },
      ],
    },
    {
      key: 'communication',
      name: 'Communication',
      heroDescriptor: ['Asynchronous', 'Low-pressure', 'Intentional'],
      strength: 0.9,
      confidence: confidenceValue,
      naturalSetting: 'Thoughtful text threads, voice notes, and unhurried replies.',
      socialMeaning: 'You communicate deeply without expecting immediate instant-reply speed.',
      thriveWhen: 'Friends share asynchronous digital touchpoints.',
      potentialFriction: 'High-frequency daily check-in expectations.',
      signals: [
        { key: 'q4', label: 'Low-maintenance reply pace', evidenceLevel: 'DIRECT' },
      ],
    },
    {
      key: 'social_rhythm',
      name: 'Social Rhythm',
      heroDescriptor: ['Structured', 'Advance-planned', 'Predictable'],
      strength: 0.75,
      confidence: confidenceValue,
      naturalSetting: 'Meetups confirmed 1–2 weeks in advance.',
      socialMeaning: 'Knowing plans ahead of time lets you allocate energy effortlessly.',
      thriveWhen: 'Calendars are settled early without last-minute scrambling.',
      potentialFriction: 'Same-day last-minute plans.',
      signals: [
        { key: 'q5', label: 'Planned 1-2 weeks in advance', evidenceLevel: 'DIRECT' },
      ],
    },
  ];

  // Stage B Synthesis Data
  const tribalReadData = {
    headline: 'Selective, curious & quietly adventurous',
    summary: 'You tend to build connection through smaller settings, shared experiences, and conversations that gradually become more meaningful.',
    pills: ['Small-circle energy', 'Depth over frequency', 'Novelty-seeking'],
    topThreads: ['personality', 'interests'] as [string, string],
    sections: [
      { title: 'Who you are socially', content: 'You protect your social energy for high-quality, focused meetups where real conversation can happen.', markerCount: 3 },
      { title: 'You connect through', content: 'Hands-on shared activities, craft workshops, and quiet coffee walks that provide an easy anchor.', markerCount: 2 },
      { title: "You're at your best with", content: 'Friends who respect your unhurried response pace and value planned dates locked in early.', markerCount: 3 },
    ],
  };

  const contradictionTension = {
    headline: 'Adventurous, but not chaotic.',
    explanation: "You actively seek unfamiliar experiences, but prefer knowing they're happening ahead of time. Novelty energizes you; logistical uncertainty doesn't.",
    threadsInvolved: ['interests', 'social_rhythm'],
  };

  const connectionNotesList: NoteItem[] = [
    {
      id: 'note-1',
      hook: 'How to become friends with me',
      statement: 'Invite me to low-key, focused activities first',
      explanation: 'I feel most comfortable when there is a shared activity or quiet setting to ground our conversation.',
      whatItLooksLike: 'A specialty coffee walk or ceramic workshop works better than a noisy lounge.',
      sourceThreads: ['personality', 'interests'],
    },
    {
      id: 'note-2',
      hook: 'What makes me feel close',
      statement: 'Thoughtful catch-ups without digital reply pressure',
      explanation: 'Taking time to reply to messages is normal for me, and I appreciate friends who hold zero pressure around reply speed.',
      whatItLooksLike: 'Picking up a text thread days later without awkwardness.',
      sourceThreads: ['communication'],
    },
  ];

  const primaryInstinct: InstinctItem = {
    type: 'Connector',
    description: 'bringing people together around shared crafts and quiet, quality experiences',
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0D1D15] text-[#F3F0E9] pb-24">
      {/* RESTORED ATMOSPHERIC CANVAS BACKGROUND IMAGE */}
      <img
        src="/user-you-bg.jpg"
        alt="Atmospheric Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-75"
      />

      {/* AMBIENT GRADIENT VIGNETTE OVERLAY */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0D1D15]/85 via-[#0D1D15]/75 to-[#0D1D15]/95 z-0 pointer-events-none" />

      {/* PAGE CONTAINER WITH FLOATING GLASSMORPHIC CARDS */}
      <div className="relative z-10 mx-auto max-w-2xl px-5 pt-8 flex flex-col gap-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <ReadDepthIndicator signalCount={totalSignalsCount} />
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="rounded-full border border-white/20 bg-white/10 p-2.5 text-[#F3F0E9] hover:bg-white/20 backdrop-blur-md transition-all"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* 2.1 Profile Hero */}
        <ProfileHero
          displayName={profile.displayName || 'Mimeo'}
          handle={profile.handle || 'mimeooo'}
          homeArea={profile.homeArea || 'Singapore'}
          bio={profile.bio || 'Loves specialty coffee, ceramic craft, and analog film.'}
          avatarUrl={profile.avatarUrl}
          tier="Member"
          standingText={currentStanding.label}
          confidence={confidenceValue}
          nextQuestions={nextPrompts}
          onEditProfile={() => setIsSettingsOpen(true)}
          onExploreThread={() => router.push('/you/deeper')}
        />

        {/* 2.4 Floating Ethereal Tribal Bloom (No box wrapper) */}
        <div className="flex flex-col items-center py-4 text-center">
          <span className="text-[10px] font-bold tracking-widest text-[#D9E4D2] uppercase">
            Your Social Signature (Tribal Bloom)
          </span>
          <p className="mt-1 text-xs text-[#A6AAA4]">
            An organic visual signature generated from your active Connection Threads.
          </p>

          <div className="mt-6 flex justify-center">
            <Bloom threads={bloomThreads} size={280} interactive />
          </div>
        </div>

        {/* 3.1 Stage B: Your Tribal Read (Luminous Floating Card) */}
        <TribalRead data={tribalReadData} />

        {/* 3.2 Stage B: The Interesting Part (Cross-thread Tension) */}
        <TheInterestingPart tension={contradictionTension} />

        {/* 2.5 What Stands Out */}
        <WhatStandsOut
          standouts={[
            { trait: 'Socially selective', description: 'You consistently favour smaller, higher-quality interactions over crowded mixers.' },
            { trait: 'High curiosity', description: 'Novel ideas and unfamiliar environments appear repeatedly across your Pass.' },
          ]}
        />

        {/* 2.3 Connection Threads (Luminous Floating Cards) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[11px] font-bold tracking-widest text-[#D9E4D2] uppercase">
            Connection Threads
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {connectionThreadsList.map((t) => (
              <ThreadCard key={t.key} thread={t} />
            ))}
          </div>
        </div>

        {/* 3.3 Stage B: Connection Notes */}
        <ConnectionNotes notes={connectionNotesList} />

        {/* 3.4 Stage B: Social Instincts */}
        <SocialInstincts primaryInstinct={primaryInstinct} />

        {/* 2.6 Real-world Social Self */}
        <RealWorldSocialSelf
          interests={[
            { name: 'Specialty Coffee', isRabbitHole: true },
            { name: 'Ceramics & Craft' },
            { name: 'Analog Film' },
            { name: 'Architecture Walks' },
          ]}
          outingDna={{
            descriptors: ['Low-key', 'Creative', 'Exploratory'],
            instantYes: 'Specialty coffee walk & ceramic studio visit',
            usuallyYes: ['Quiet museum visits', 'Acoustic live music'],
            convinceMe: ['Rooftop cocktail mixers'],
          }}
          youShouldKnow={[
            'Prefers 1-on-1 or small group meetups (3-4 max)',
            'Plans dates 1-2 weeks in advance',
            'Enjoys quiet cafes over noisy venues',
          ]}
          availabilityText="Generally available weekday evenings and Saturday mornings for coffee or craft hangouts."
          hostedOutingsCount={profile.outingsHosted || 1}
        />

        {/* 2.7 Boundaries & Matching */}
        <BoundariesMatching />
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1D15]/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[24px] border border-white/20 bg-[#15261C] p-6 text-[#F3F0E9]">
            <h3 className="text-lg font-bold">Edit Profile & Settings</h3>

            <form onSubmit={handleSaveSettings} className="mt-4 flex flex-col gap-4 text-xs">
              <div>
                <label className="font-semibold text-[#A6AAA4]">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-[#0D1D15] p-2.5 text-[#F3F0E9]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#A6AAA4]">Home Area</label>
                <input
                  type="text"
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-[#0D1D15] p-2.5 text-[#F3F0E9]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#A6AAA4]">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-[#0D1D15] p-2.5 text-[#F3F0E9]"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 rounded-xl border border-white/20 bg-[#0D1D15] py-2.5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#2D523E] py-2.5 font-bold text-[#F3F0E9]"
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
