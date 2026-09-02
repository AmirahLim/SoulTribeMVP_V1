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
import { getActiveNextBestPrompts } from '../../lib/threadPrompts';
import { getSupabaseBrowserClient } from '../../lib/supabase';
import { fetchUserPitches, OutingItem } from '../../lib/outingsStore';

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

function sanitizeOpenAnswer(raw?: string): string {
  if (!raw) return '';
  return raw
    .replace(/^(I really respect people who|I feel most connected when|I'm looking for|What earns my trust is|I respect people who)\s*/i, '')
    .trim();
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
  const { user: authUser } = useAuth();

  const [profile, setProfileState] = useState<UserProfileData>({
    displayName: 'Mimeo',
    handle: 'mimeooo',
    homeArea: 'Singapore',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: 'Loves specialty coffee, ceramic craft, and analog film.',
    passCompletionPct: 10,
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

  const confidenceValue = 0.42;

  const nextPrompts = getActiveNextBestPrompts(profile, 2).map((p) => ({
    thread: p.thread,
    question: p.label,
    prompt: p.copy,
  }));

  // 10 Petals for Bloom (ghost outlines for unexplored threads)
  const bloomThreads = [
    { key: 'personality', label: 'Social Energy', strength: 0.85, confidence: confidenceValue, sentence: 'Four people is where you stop scanning the room and start noticing one person.' },
    { key: 'communication', label: 'Communication', strength: 0.9, confidence: confidenceValue, sentence: 'You surface in bursts. A quiet fortnight does not read as distance.' },
    { key: 'social_rhythm', label: 'Social Rhythm', strength: 0.75, confidence: confidenceValue, sentence: 'Plans land best a week or two out. Same-day invitations rarely stick.' },
    { key: 'intent', label: 'Friendship Style', strength: 0.95, confidence: confidenceValue, sentence: 'A small number of people, held closely — and comfortable when everyone disappears into their own life for a while.' },
    { key: 'emotional', label: 'Emotional Connection', strength: 0.8, confidence: confidenceValue, sentence: 'Paces trust thoughtfully over repeated catch-ups.' },
    { key: 'interests', label: 'Interests', strength: 0.85, confidence: confidenceValue, sentence: 'Loves specialty coffee, ceramic craft, and analog film.' },
    { key: 'values', label: 'Values', strength: 0, confidence: 0, sentence: 'Unexplored thread' },
    { key: 'lifestyle', label: 'Play & Humour', strength: 0.8, confidence: confidenceValue, sentence: 'Appreciates light banter and novel outing spots.' },
    { key: 'experience', label: 'Conversation', strength: 0, confidence: 0, sentence: 'Unexplored thread' },
    { key: 'logistics', label: 'Availability', strength: 0.65, confidence: confidenceValue, sentence: 'Available weekday evenings and Saturday mornings.' },
  ];

  // Connection Threads list with drawn visual objects
  const connectionThreadsList: ThreadData[] = [
    {
      key: 'personality',
      name: 'Social Energy',
      heroDescriptor: ['Intimate', 'Selective', 'Calm'],
      strength: 0.85,
      confidence: confidenceValue,
      note: 'Four people is where you stop scanning the room and start noticing one person.',
      naturalSetting: 'Low-noise coffee spots, quiet studios, 1-on-1 tea catch-ups.',
      thriveWhen: 'Settings have minimal background noise and predictable party sizes.',
      extraVisualData: { activeGroup: '3–4' },
      signals: [
        { key: 'q3', label: 'Prefers 1-on-1 or 3-4 people', evidenceLevel: 'DIRECT' },
      ],
    },
    {
      key: 'communication',
      name: 'Communication',
      heroDescriptor: ['Asynchronous', 'Low-pressure', 'Intentional'],
      strength: 0.9,
      confidence: confidenceValue,
      note: "You surface in bursts. A quiet fortnight doesn't read as distance.",
      naturalSetting: 'Thoughtful text threads, voice notes, and unhurried replies.',
      thriveWhen: 'Friends share asynchronous digital touchpoints.',
      signals: [
        { key: 'q4', label: 'Low-maintenance reply pace', evidenceLevel: 'DIRECT' },
      ],
    },
    {
      key: 'intent',
      name: 'Friendship Style',
      heroDescriptor: ['Close', 'Independent', 'Steady'],
      strength: 0.95,
      confidence: confidenceValue,
      note: 'A small number of people, held closely — and comfortable when everyone disappears into their own life for a while.',
      naturalSetting: 'Small inner circle with deep mutual trust.',
      thriveWhen: 'Friendships allow long quiet stretches without guilt.',
      extraVisualData: { mapX: 34, mapY: 36 },
      signals: [
        { key: 'q7', label: 'Observant first trust pacing', evidenceLevel: 'DIRECT' },
      ],
    },
    {
      key: 'social_rhythm',
      name: 'Social Rhythm',
      heroDescriptor: ['Structured', 'Advance-planned'],
      strength: 0.75,
      confidence: confidenceValue,
      note: 'Plans land best a week or two out. Same-day invitations rarely stick.',
      naturalSetting: 'Meetups confirmed 1–2 weeks in advance.',
      thriveWhen: 'Calendars are settled early without last-minute scrambling.',
      extraVisualData: { activeDays: ['W', 'S', 'S2'] },
      signals: [
        { key: 'q5', label: 'Planned 1-2 weeks in advance', evidenceLevel: 'DIRECT' },
      ],
    },
  ];

  const tribalReadData = {
    headline: 'Selective, curious & quietly adventurous',
    summary: 'You build connection through smaller settings and shared experience — conversations that start somewhere ordinary and end up somewhere neither of you planned.',
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
    <div className="relative min-h-screen w-full bg-[#070908] text-[#F5F2EA] pb-24 font-['Karla',sans-serif]">
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
        {/* 1. Profile Hero (Reference Screenshot Top Layout) */}
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
          onExploreThread={(key) => router.push('/you/deeper')}
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
          <Bloom threads={bloomThreads} size={280} interactive />
          <p className="text-[12.5px] text-[rgba(245,242,234,0.44)] mt-2">
            Ten threads · six explored · <span className="text-[#EFB94E]">tap a petal</span>
          </p>
        </div>

        {/* 3. Your Tribal Read */}
        <TribalRead data={tribalReadData} />

        {/* 4. The Interesting Part (Cross-thread Tension) */}
        <TheInterestingPart tension={contradictionTension} />

        {/* 5. Connection Threads (Drawn Objects) */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between px-1">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
              Connection Threads
            </p>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
              6 of 10
            </p>
          </div>

          {connectionThreadsList.map((t) => (
            <ThreadCard key={t.key} thread={t} />
          ))}
        </div>

        {/* 6. What Matters (Values Constellation Canvas) */}
        <ValuesConstellationCanvas />

        {/* 7. I'm Into (Interest Graph Canvas) */}
        <InterestGraphCanvas />

        {/* 8. Outing DNA (Triad Radar Canvas) */}
        <OutingTriadCanvas
          descriptors={['Low-key', 'Creative', 'Exploratory']}
          values={[0.85, 0.78, 0.72]}
          instantYes="Pottery somewhere you've never been, then coffee that runs long"
          usuallyYes={['Quiet museums', 'acoustic sets', 'neighbourhood walks']}
          convinceMe={['Rooftop mixers']}
        />

        {/* 9. Connection Notes & Social Instincts */}
        <ConnectionNotes notes={connectionNotesList} />
        <SocialInstincts primaryInstinct={primaryInstinct} />

        {/* 10. Hosted Pitches List */}
        {userPitches.length > 0 && (
          <div className="rounded-[26px] p-5 backdrop-blur-xl bg-[rgba(10,12,11,0.62)] border border-[rgba(245,242,234,0.11)] shadow-xl">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)] mb-3">
              Hosted Pitches ({userPitches.length})
            </p>
            <div className="flex flex-col gap-3">
              {userPitches.map((p) => (
                <div key={p.id} className="rounded-xl border border-[rgba(245,242,234,0.08)] bg-[rgba(255,255,255,0.03)] p-3.5">
                  <h4 className="font-['Bricolage_Grotesque'] text-sm font-semibold text-[#F5F2EA]">
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
        <BoundariesMatching />

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
                  className="flex-1 rounded-xl bg-[#5BD99A] py-2.5 font-bold text-[#070908]"
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
