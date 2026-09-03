'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GlassCard,
  WovenBloom,
  PairedThreadRow,
  VennMeetingCanvas,
  MechanismType,
} from '@soul-tribe/ui';
import { AuthGuard } from '../../../../components/AuthGuard';
import { getUserProfile } from '../../../../lib/userStore';
import { getRankedMatches, RankedMatch, toProfileVector } from '../../../../lib/matching';
import { DEMO_PROFILES, getGenderAvatarForName, generateMatchExplanation } from '@soul-tribe/core';

export default function ViewBondPage() {
  return (
    <AuthGuard>
      <ViewBondContent />
    </AuthGuard>
  );
}

function ViewBondContent() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const personId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || '';
  const cleanPersonId = personId ? decodeURIComponent(personId).trim().toLowerCase() : '';

  const [personMatch, setPersonMatch] = useState<RankedMatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBondData() {
      if (!cleanPersonId) {
        setLoading(false);
        return;
      }

      try {
        const userProfile = getUserProfile();
        const matches = await getRankedMatches(userProfile, { limit: 40 });
        const found = matches.find(
          (m) =>
            m.id.toLowerCase() === cleanPersonId ||
            m.name.toLowerCase().replace(/\s+/g, '') === cleanPersonId
        );

        if (found) {
          setPersonMatch(found);
        }
      } catch (err) {
        console.error('Failed to load bond profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBondData();
  }, [cleanPersonId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070908] text-[#F5F2EA] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#EFB94E]" />
        <p className="mt-4 text-xs font-medium text-[rgba(245,242,234,0.70)]">Calculating Friendship Bond...</p>
      </div>
    );
  }

  const memberName = personMatch?.name || 'Mervyn Tang';
  const memberFirstName = memberName.split(' ')[0] || 'Mervyn';
  const userProfile = getUserProfile();
  const userName = userProfile.displayName || 'Mimeo';

  const youDepths = [0.92, 0.80, 0.66, 0.88, 0.58, 0.95, 0, 0.72, 0, 0.84];
  const themDepths = [0.86, 0.74, 0.70, 0.60, 0.62, 0.40, 0, 0.66, 0.55, 0.78];

  const pairedThreadsList = [
    {
      threadName: 'Social Energy',
      mechanism: 'Aligned' as MechanismType,
      youPos: 26,
      themPos: 34,
      leftEndLabel: 'Selective 1:1',
      rightEndLabel: 'Expansive groups',
      consequenceSentence: `You both top out around four people. Neither of you will be the one pushing for the bigger table.`,
    },
    {
      threadName: 'Social Rhythm',
      mechanism: 'Planning friction' as MechanismType,
      youPos: 22,
      themPos: 76,
      leftEndLabel: 'Weeks ahead',
      rightEndLabel: 'Same day',
      consequenceSentence: `The widest gap between you. Getting it into the calendar will be harder than enjoying it once you're there.`,
    },
    {
      threadName: 'Social Initiative',
      mechanism: 'Complementary' as MechanismType,
      youPos: 24,
      themPos: 68,
      leftEndLabel: 'Waits to be asked',
      rightEndLabel: 'Makes the plan',
      consequenceSentence: `A difference that helps. ${memberFirstName} tends to make the plan; you tend to say yes. That pairing usually works — until nobody does either.`,
    },
    {
      threadName: 'Emotional Openness',
      mechanism: 'Aligned' as MechanismType,
      youPos: 30,
      themPos: 36,
      leftEndLabel: 'Takes time',
      rightEndLabel: 'Opens fast',
      consequenceSentence: `Both slow openers. Neither of you will expect the other to be vulnerable early, which usually makes the first few meetings easier.`,
    },
    {
      threadName: 'Conflict & Repair',
      mechanism: 'Not measured' as MechanismType,
      consequenceSentence: `Neither of you has answered these two questions yet. It's the biggest gap in this reading.`,
    },
  ];

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

        {/* Mode Switcher Bar */}
        <div className="flex gap-2 pt-2">
          <Link
            href={`/people/${encodeURIComponent(cleanPersonId)}`}
            className="flex-1 text-center text-xs font-semibold py-2.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(245,242,234,0.11)] text-[rgba(245,242,234,0.44)] hover:text-[#F5F2EA] transition-all"
          >
            Their profile
          </Link>
          <button className="flex-1 text-center text-xs font-semibold py-2.5 rounded-full bg-[rgba(245,242,234,0.10)] border border-[rgba(245,242,234,0.24)] text-[#F5F2EA]">
            View Bond
          </button>
        </div>

        {/* Paired Avatars Header */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="relative w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#5A4030] to-[#2A211A] shadow-[0_0_0_2px_rgba(239,185,78,0.55),0_8px_20px_rgba(0,0,0,0.6)] p-[2px]">
            <div className="relative h-full w-full overflow-hidden rounded-full border border-white/20">
              <img
                src={userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={userName}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <span className="font-sans text-xl text-[rgba(245,242,234,0.44)]">
            &amp;
          </span>

          <div className="relative w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#33503F] to-[#1B2C22] shadow-[0_0_0_2px_rgba(91,217,154,0.55),0_8px_20px_rgba(0,0,0,0.6)] p-[2px]">
            <div className="relative h-full w-full overflow-hidden rounded-full border border-white/20">
              <img
                src={personMatch?.avatarUrl || getGenderAvatarForName(memberName)}
                alt={memberName}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Woven Signature Dual Bloom */}
        <WovenBloom
          youDepths={youDepths}
          themDepths={themDepths}
          youName={userName}
          themName={memberFirstName}
        />

        {/* Thesis Card: Why you might click */}
        <GlassCard wash="rgba(239,185,78,0.13)">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#EFB94E] mb-2">
            Why you might click
          </p>
          <h2 className="font-sans text-[26px] font-semibold text-[#F5F2EA] leading-[1.16]">
            Quality time over <em className="not-italic text-[#EFB94E]">constant contact</em>
          </h2>
          <p className="text-sm leading-relaxed text-[rgba(245,242,234,0.70)] mt-2">
            Neither of you needs a full calendar to feel close, but when you do make time you want it to count. You're both planners who prefer smaller rooms — which removes the two things that usually kill a new friendship before it starts.
          </p>
        </GlassCard>

        {/* Paired Thread Rows */}
        <GlassCard>
          <div className="flex items-baseline justify-between mb-3 border-b border-[rgba(245,242,234,0.08)] pb-2">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
              Thread by thread
            </p>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
              8 comparable
            </p>
          </div>

          <div className="flex flex-col">
            {pairedThreadsList.map((t, idx) => (
              <PairedThreadRow
                key={idx}
                threadName={t.threadName}
                mechanism={t.mechanism}
                youPos={t.youPos}
                themPos={t.themPos}
                leftEndLabel={t.leftEndLabel}
                rightEndLabel={t.rightEndLabel}
                consequenceSentence={t.consequenceSentence}
                themName={memberFirstName}
              />
            ))}
          </div>
        </GlassCard>

        {/* Potential Friction Card */}
        <GlassCard wash="rgba(239,185,78,0.14)">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="text-[9.5px] font-bold tracking-widest uppercase text-[#EFB94E]">
              Planning
            </span>
            <span className="text-[9.5px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[rgba(239,185,78,0.13)] border border-[rgba(239,185,78,0.30)] text-[#EFB94E]">
              Noticeable
            </span>
          </div>

          <p className="text-sm leading-relaxed text-[rgba(245,242,234,0.70)]">
            You like dates locked in a week or two out. {memberFirstName} decides closer to the day. Left alone, this is the thing most likely to keep a good pairing from actually meeting.
          </p>

          <div className="grid grid-cols-2 gap-2.5 mt-3.5">
            <div className="rounded-xl border border-[rgba(245,242,234,0.11)] bg-[rgba(255,255,255,0.04)] p-3">
              <span className="text-[9.5px] font-bold tracking-wider uppercase text-[#EFB94E] block mb-1">
                You may feel
              </span>
              <p className="text-xs text-[rgba(245,242,234,0.70)] leading-relaxed">
                That he's vague, or that plans never quite firm up.
              </p>
            </div>

            <div className="rounded-xl border border-[rgba(245,242,234,0.11)] bg-[rgba(255,255,255,0.04)] p-3">
              <span className="text-[9.5px] font-bold tracking-wider uppercase text-[#4E8B69] block mb-1">
                He may feel
              </span>
              <p className="text-xs text-[rgba(245,242,234,0.70)] leading-relaxed">
                That committing early makes an easy thing feel like an obligation.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Where You'd Actually Meet */}
        <GlassCard wash="rgba(91,217,154,0.11)">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)] mb-3">
            Where you'd actually meet
          </p>
          <VennMeetingCanvas
            yourInterests={['Ceramics', 'Analog film']}
            sharedInterests={['Specialty coffee']}
            theirInterests={['Trail running', 'Vinyl']}
            noteSentence="Specialty coffee is the obvious first move. An activity gives this pairing somewhere to begin — you're both slow openers, so a table with nothing on it does more work than either of you wants to do."
          />
        </GlassCard>

        {/* Footer */}
        <p className="text-center text-[11.5px] leading-relaxed text-[rgba(245,242,234,0.44)] mt-6">
          Bond view · same ground and palette, paired everywhere<br />
          Content is illustrative — the engine supplies the words.
        </p>

      </div>
    </div>
  );
}
