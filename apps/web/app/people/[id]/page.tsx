'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bloom,
  GlassCard,
  ReadPill,
  ThreadBloom,
} from '@soul-tribe/ui';
import { getRankedMatches, RankedMatch, toProfileVector, countRealMembers, isSmallCommunityMode, getFitLabel } from '../../../lib/matching';
import { DEMO_PROFILES, getGenderAvatarForName, generateMatchExplanation, score, generateSelfProfile } from '@soul-tribe/core';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { AuthGuard } from '../../../components/AuthGuard';
import { getUserProfile, calculateTribeStanding } from '../../../lib/userStore';
import { checkIsSupabaseConfigured, getSupabaseBrowserClient } from '../../../lib/supabase';
import { fetchUserPitches, OutingItem } from '../../../lib/outingsStore';
import { ThreadCard } from '../../../components/profile/ThreadCard';
import { TribalRead } from '../../../components/profile/TribalRead';
import { ValuesConstellationCanvas } from '../../../components/profile/ValuesConstellationCanvas';
import { InterestGraphCanvas } from '../../../components/profile/InterestGraphCanvas';
import { OutingTriadCanvas } from '../../../components/profile/OutingTriadCanvas';

export default function PersonDetailPage() {
  return (
    <AuthGuard>
      <PersonDetailContent />
    </AuthGuard>
  );
}

function PersonDetailContent() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const personId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || '';
  const cleanPersonId = personId ? decodeURIComponent(personId).trim().toLowerCase() : '';

  const [rankedMatch, setRankedMatch] = useState<RankedMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberPitches, setMemberPitches] = useState<OutingItem[]>([]);

  useEffect(() => {
    async function loadMemberPitches() {
      if (!cleanPersonId) return;
      const pitches = await fetchUserPitches(cleanPersonId);
      setMemberPitches(pitches);
    }
    loadMemberPitches();
  }, [cleanPersonId]);

  useEffect(() => {
    async function loadMatch() {
      if (!cleanPersonId) {
        setLoading(false);
        return;
      }

      try {
        const user = getUserProfile();
        const matches = await getRankedMatches(user, { limit: 40 });
        let found = matches.find((m) => {
          const mId = (m.id || '').toLowerCase();
          const mName = (m.name || '').toLowerCase().replace(/\s+/g, '');
          return (
            mId === cleanPersonId ||
            (mId && mId.includes(cleanPersonId)) ||
            (cleanPersonId && cleanPersonId.includes(mId)) ||
            (mName && cleanPersonId.includes(mName))
          );
        });

        if (!found && checkIsSupabaseConfigured()) {
          try {
            const client = getSupabaseBrowserClient();
            const { data: dbProfile } = await client
              .from('profiles')
              .select(`
                *,
                trait_intent (*),
                trait_communication (*),
                trait_personality (*),
                trait_social_rhythm (*),
                trait_emotional (*),
                trait_experience (*),
                trait_lifestyle (*),
                trait_geography (*),
                user_interests (*),
                user_values (*)
              `)
              .or(`id.eq.${cleanPersonId},handle.ilike.${cleanPersonId}`)
              .maybeSingle();

            if (dbProfile) {
              const viewerVec = toProfileVector(user, user.id);
              // Pass the FULL DB profile to toProfileVector — it reads trait_personality,
              // trait_communication, etc. from (user as any).trait_* automatically.
              const candVec = toProfileVector({
                displayName: dbProfile.display_name,
                homeArea: dbProfile.home_area || 'Singapore',
                avatarUrl: dbProfile.avatar_url,
                bio: dbProfile.bio,
                // Spread trait tables so toProfileVector can find them via (user as any).trait_*
                ...dbProfile,
              } as any, dbProfile.id);

              const explanation = generateMatchExplanation(viewerVec, candVec);
              const matchResult = score(viewerVec, candVec);
              const minConf = Math.min(viewerVec.profile.confidence || 0, candVec.profile.confidence || 0);

              found = {
                id: dbProfile.id,
                name: dbProfile.display_name || 'Member',
                avatarUrl: dbProfile.avatar_url || getGenderAvatarForName(dbProfile.display_name || 'Member'),
                homeArea: dbProfile.home_area || 'Singapore',
                bio: dbProfile.bio || '',
                rankScore: matchResult.rank_score,
                resonance: matchResult.resonance,
                logistics: matchResult.logistics,
                clickText: explanation.click_text,
                rubText: explanation.friction_text,
                fitLabel: getFitLabel(matchResult.rank_score, minConf < 0.55, minConf),
                provisional: minConf < 0.55,
                isDemo: false,
              } as RankedMatch;
              // Attach candVec for render-time selfProfile generation (not part of RankedMatch type)
              (found as any)._candidateVec = candVec;
            }
          } catch (dbErr) {
            console.error('Direct Supabase profile lookup error:', dbErr);
          }
        }

        if (found) {
          setRankedMatch(found);
        }
      } catch (err) {
        console.error('Failed to load match detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatch();
  }, [cleanPersonId]);

  if (loading) {
    return (
      <div className="relative min-h-screen w-full bg-[#070908] text-[#F5F2EA] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-[#5BD99A] animate-spin" />
        <p className="mt-4 text-xs font-medium text-[rgba(245,242,234,0.70)]">Loading profile...</p>
      </div>
    );
  }

  const memberName = rankedMatch?.name || 'Member';
  const memberFirstName = memberName.split(' ')[0] || 'Member';

  // Wire to self-profile synthesizer for 3rd-person view.
  // If RLS blocks trait data, candidateVec will be thin and selfProfile
  // will return "still developing" states — which is honest, not fake.
  const candidateVec = (rankedMatch as any)?._candidateVec;
  const selfProfile = candidateVec ? generateSelfProfile(candidateVec) : null;

  // 3rd Person Tribal Read Data — from synthesizer or honest empty state
  const memberTribalReadData = selfProfile ? {
    ...selfProfile.tribalRead,
    // Rewrite summary to 3rd person if it starts with "You"
    summary: selfProfile.tribalRead.summary.replace(/^You /i, `${memberFirstName} `).replace(/\byou\b/g, memberFirstName.toLowerCase()),
  } : {
    headline: 'Still getting to know them',
    summary: `${memberFirstName} hasn't shared enough data yet for a full profile read.`,
    pills: [],
    topThreads: ['personality', 'communication'] as [string, string],
    sections: [],
  };

  const bloomThreads = selfProfile ? selfProfile.bloomThreads : [
    { key: 'personality', label: 'Social Energy', strength: 0, confidence: 0, sentence: 'Not enough data yet.' },
    { key: 'communication', label: 'Communication', strength: 0, confidence: 0, sentence: 'Not enough data yet.' },
    { key: 'social_rhythm', label: 'Social Rhythm', strength: 0, confidence: 0, sentence: 'Not enough data yet.' },
    { key: 'intent', label: 'Friendship Style', strength: 0, confidence: 0, sentence: 'Not enough data yet.' },
    { key: 'emotional', label: 'Emotional Connection', strength: 0, confidence: 0, sentence: 'Not enough data yet.' },
    { key: 'interests', label: 'Interests', strength: 0, confidence: 0, sentence: 'Not enough data yet.' },
    { key: 'values', label: 'Values', strength: 0, confidence: 0, sentence: 'Not enough data yet.' },
    { key: 'lifestyle', label: 'Play & Humour', strength: 0, confidence: 0, sentence: 'Not enough data yet.' },
    { key: 'experience', label: 'Conversation', strength: 0, confidence: 0, sentence: 'Not enough data yet.' },
    { key: 'logistics', label: 'Availability', strength: 0, confidence: 0, sentence: 'Not enough data yet.' },
  ];

  const rawHandle = (rankedMatch as any)?.handle || cleanPersonId || 'mervyn';
  const displayHandle = rawHandle.replace(/^[a-f0-9-]{20,}/i, memberFirstName.toLowerCase()).replace(/^@/, '');

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
          <button className="flex-1 text-center text-xs font-semibold py-2.5 rounded-full bg-[rgba(245,242,234,0.10)] border border-[rgba(245,242,234,0.24)] text-[#F5F2EA]">
            Their profile
          </button>
          <Link
            href={`/people/${encodeURIComponent(cleanPersonId)}/bond`}
            className="flex-1 text-center text-xs font-semibold py-2.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(245,242,234,0.11)] text-[rgba(245,242,234,0.44)] hover:text-[#F5F2EA] transition-all"
          >
            View Bond
          </Link>
        </div>

        {/* Member Header Row */}
        <div className="flex items-center gap-3.5 pt-2">
          <div className="relative h-[58px] w-[58px] shrink-0 rounded-full bg-gradient-to-br from-[#33503F] to-[#1B2C22] shadow-[0_8px_22px_rgba(0,0,0,0.6)] p-[2px]">
            <div className="relative h-full w-full overflow-hidden rounded-full border border-white/20">
              <img
                src={rankedMatch?.avatarUrl || getGenderAvatarForName(memberName)}
                alt={memberName}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div>
            <h1 className="font-sans text-[23px] font-bold text-[#F5F2EA] leading-tight">
              {memberName}
            </h1>
            <p className="text-[12.5px] text-[rgba(245,242,234,0.44)] mt-0.5">
              @{displayHandle} · {rankedMatch?.homeArea || 'Bishan'}
            </p>
            <ReadPill label="Deep read · 61 signals" tone="emerald" className="mt-2" />
          </div>
        </div>

        {/* 3rd Person Tribal Read Card (Emerald Wash) */}
        <TribalRead
          data={memberTribalReadData}
          label={`${memberFirstName}'s Tribal Read`}
          tone="emerald"
          showReadMore={false}
        />

        {/* Dynamic Friendship DNA Bloom */}
        <div className="flex flex-col items-center py-2 text-center border-t border-[rgba(245,242,234,0.08)] pt-6">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)] mb-1">
            FRIENDSHIP DNA BLOOM
          </p>
          <Bloom threads={bloomThreads} size={280} interactive={false} />
        </div>

        {/* Member Connection Threads */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between px-1">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
              His Threads
            </p>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
              7 of 10
            </p>
          </div>

          <ThreadCard
            thread={{
              key: 'personality',
              name: 'Social Energy',
              heroDescriptor: ['Intimate', 'Selective', 'Calm'],
              strength: 0.86,
              confidence: 0.8,
              note: `${memberFirstName} tops out around four people. He recharges in quiet settings.`,
              extraVisualData: { activeGroup: '3–4' },
            }}
          />
        </div>

        {/* He's Into & Gated Connection Notes */}
        <GlassCard wash="rgba(91,217,154,0.08)">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)] mb-2.5">
            He's Into
          </p>
          <div className="flex flex-wrap gap-2">
            {['Trail running', 'Specialty coffee', 'Vinyl', 'Hawker archaeology'].map((tag, idx) => (
              <span
                key={idx}
                className={`text-[12.5px] px-3 py-1.5 rounded-full border ${
                  idx === 0
                    ? 'bg-[rgba(91,217,154,0.12)] border-[rgba(91,217,154,0.30)] text-[#5BD99A] font-semibold'
                    : 'bg-[rgba(255,255,255,0.055)] border-[rgba(245,242,234,0.11)] text-[rgba(245,242,234,0.70)]'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Gated Connection Notes Statement */}
          <div className="flex items-center gap-2 text-[12.5px] text-[rgba(245,242,234,0.44)] pt-3.5 mt-3 border-t border-[rgba(245,242,234,0.08)]">
            <span>🔒</span>
            <span>Connection Notes are visible once you've shared an outing.</span>
          </div>
        </GlassCard>

        {/* Footer */}
        <p className="text-center text-[11.5px] leading-relaxed text-[rgba(245,242,234,0.44)] mt-6">
          Member profile · third person read<br />
          Content is illustrative — the engine supplies the words.
        </p>

      </div>
    </div>
  );
}
