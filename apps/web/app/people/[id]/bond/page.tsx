'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
import { getGenderAvatarForName, generateMatchExplanation, score, generateSelfProfile, getBondThreadPhrase } from '@soul-tribe/core';
import type { ProfileVector, MatchResult, ExplanationText } from '@soul-tribe/core';

export default function ViewBondPage() {
  return (
    <AuthGuard>
      <ViewBondContent />
    </AuthGuard>
  );
}

/** Thread keys in display order */
const THREAD_KEYS = [
  'personality', 'communication', 'social_rhythm', 'intent', 'emotional',
  'interests', 'values', 'lifestyle', 'experience', 'geography',
] as const;

const THREAD_DISPLAY_NAMES: Record<string, string> = {
  personality: 'Social Energy',
  communication: 'Communication',
  social_rhythm: 'Social Rhythm',
  intent: 'Friendship Style',
  emotional: 'Emotional Openness',
  interests: 'Interests',
  values: 'Values',
  lifestyle: 'Play & Humour',
  experience: 'Conversation',
  geography: 'Availability',
};

function deriveMechanism(contrib: number | undefined): MechanismType {
  if (contrib === undefined || contrib === null) return 'Not measured' as MechanismType;
  if (contrib >= 0.7) return 'Aligned' as MechanismType;
  if (contrib >= 0.4) return 'Complementary' as MechanismType;
  return 'Planning friction' as MechanismType;
}

function ViewBondContent() {
  const params = useParams();

  const rawId = params?.id;
  const personId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || '';
  const cleanPersonId = personId ? decodeURIComponent(personId).trim().toLowerCase() : '';

  const [personMatch, setPersonMatch] = useState<RankedMatch | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [explanation, setExplanation] = useState<ExplanationText | null>(null);
  const [viewerVec, setViewerVec] = useState<ProfileVector | null>(null);
  const [candidateVec, setCandidateVec] = useState<ProfileVector | null>(null);
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

          // Build viewer vector from local profile
          const vVec = toProfileVector(userProfile, userProfile.id);
          setViewerVec(vVec);

          // If the match has a cached candidate vec, use it for deeper data
          const cVec = (found as any)?._candidateVec as ProfileVector | undefined;
          if (cVec) {
            setCandidateVec(cVec);
            const mr = score(vVec, cVec);
            setMatchResult(mr);
            const expl = generateMatchExplanation(vVec, cVec);
            setExplanation(expl);
          }
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

  const memberName = personMatch?.name || 'Member';
  const memberFirstName = memberName.split(' ')[0] || 'Member';
  const userProfile = getUserProfile();
  const userName = userProfile.displayName || 'You';

  // Derive bloom depths from selfProfile or default to 0
  const viewerSelf = viewerVec ? generateSelfProfile(viewerVec) : null;
  const candidateSelf = candidateVec ? generateSelfProfile(candidateVec) : null;

  const youDepths = viewerSelf
    ? viewerSelf.bloomThreads.map((t) => t.strength)
    : new Array(10).fill(0);

  const themDepths = candidateSelf
    ? candidateSelf.bloomThreads.map((t) => t.strength)
    : new Array(10).fill(0);

  // Build paired threads from match result contributions
  const contribs = matchResult?.contributions;
  const pairedThreadsList = THREAD_KEYS
    .map((key) => {
      const contrib = contribs?.[key as keyof typeof contribs] as number | undefined;
      if (contrib === undefined || contrib === null) return null;

      const mechanism = deriveMechanism(contrib);
      const displayName = THREAD_DISPLAY_NAMES[key] || key;

      // Derive positions from viewer and candidate vectors
      const youVal = getThreadPrimaryValue(key, viewerVec);
      const themVal = getThreadPrimaryValue(key, candidateVec);
      const youPos = youVal !== null ? Math.round(youVal * 100) : undefined;
      const themPos = themVal !== null ? Math.round(themVal * 100) : undefined;

      // Generate consequence sentence from engine
      let consequenceSentence = '';
      if (viewerVec && candidateVec) {
        consequenceSentence = getBondThreadPhrase(key, viewerVec, candidateVec, contrib);
      }

      return {
        threadName: displayName,
        mechanism,
        youPos,
        themPos,
        leftEndLabel: getLeftLabel(key),
        rightEndLabel: getRightLabel(key),
        consequenceSentence: consequenceSentence || `Thread data for ${displayName.toLowerCase()} is still developing.`,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  // Thesis and friction text from match explanation or RankedMatch fallback
  const clickText = explanation?.click_text || personMatch?.clickText || '';
  const frictionText = explanation?.friction_text || personMatch?.rubText || '';

  // Split click text into headline and body
  const clickParts = clickText.split('. ');
  const clickHeadline = clickParts[0] || 'Exploring your connection';
  const clickBody = clickParts.slice(1).join('. ') || '';

  // Split friction into label and body
  // Identify friction type and perspectives
  let frictionType = 'DYNAMIC';
  let youPerspective = 'That plans or expectations need clearer shape.';
  let themPerspective = `That keeping things fluid makes meeting up feel more natural.`;

  const lowerFric = frictionText.toLowerCase();
  if (lowerFric.includes('plan') || lowerFric.includes('schedule') || lowerFric.includes('calendar') || lowerFric.includes('horizon')) {
    frictionType = 'PLANNING';
    youPerspective = 'That dates need locking in so plans never feel vague.';
    themPerspective = `That committing too far in advance can feel restrictive.`;
  } else if (lowerFric.includes('energy') || lowerFric.includes('crowd') || lowerFric.includes('introvert') || lowerFric.includes('extravert')) {
    frictionType = 'SOCIAL PACING';
    youPerspective = 'Preferring an intimate setting without background chaos.';
    themPerspective = `Thriving when there is a lively buzz in the room.`;
  } else if (lowerFric.includes('lead') || lowerFric.includes('initiative') || lowerFric.includes('ask') || lowerFric.includes('start')) {
    frictionType = 'INITIATIVE';
    youPerspective = 'Wondering who will take the first step to reach out.';
    themPerspective = `Hoping the other person sets the time and place.`;
  } else if (lowerFric.includes('open') || lowerFric.includes('vulnerab') || lowerFric.includes('trust')) {
    frictionType = 'DISCLOSURE';
    youPerspective = 'Taking time before moving into deeper topics.';
    themPerspective = `Gauging the right moment to open up without forcing it.`;
  }

  // Venn interests from real user data
  const viewerInterests = (viewerVec?.interests || []).map((i) => i.node_name || i.node_path || '');
  const candidateInterests = (candidateVec?.interests || []).map((i) => i.node_name || i.node_path || '');

  const sharedInterests = viewerInterests.filter((i) =>
    candidateInterests.some((c) => c.toLowerCase() === i.toLowerCase())
  );
  const yourOnlyInterests = viewerInterests.filter(
    (i) => !sharedInterests.some((s) => s.toLowerCase() === i.toLowerCase())
  );
  const theirOnlyInterests = candidateInterests.filter(
    (i) => !sharedInterests.some((s) => s.toLowerCase() === i.toLowerCase())
  );

  const comparableCount = pairedThreadsList.length;

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
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#5A4030] text-sm font-bold text-[#F5F2EA]">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <span className="font-sans text-xl text-[rgba(245,242,234,0.44)]">
            &amp;
          </span>

          <div className="relative w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#33503F] to-[#1B2C22] shadow-[0_0_0_2px_rgba(91,217,154,0.55),0_8px_20px_rgba(0,0,0,0.6)] p-[2px]">
            <div className="relative h-full w-full overflow-hidden rounded-full border border-white/20">
              {personMatch?.avatarUrl ? (
                <img
                  src={personMatch.avatarUrl}
                  alt={memberName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#33503F] text-sm font-bold text-[#F5F2EA]">
                  {memberFirstName.charAt(0).toUpperCase()}
                </div>
              )}
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
            {clickHeadline}
          </h2>
          {clickBody && (
            <p className="text-sm leading-relaxed text-[rgba(245,242,234,0.70)] mt-2">
              {clickBody}
            </p>
          )}
        </GlassCard>

        {/* Paired Thread Rows */}
        {pairedThreadsList.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between px-1 mb-3">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
                Thread by thread
              </p>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
                {comparableCount} comparable
              </p>
            </div>
            <GlassCard>
              <div className="flex flex-col divide-y divide-[rgba(245,242,234,0.08)]">
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
          </div>
        )}

        {/* Potential Friction Card — from engine with side-by-side perspectives */}
        {frictionText && (
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between px-1 mb-3">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
                Potential friction
              </p>
            </div>
            <GlassCard wash="rgba(239,185,78,0.14)">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="text-[9.5px] font-bold tracking-widest uppercase text-[#EFB94E]">
                  {frictionType}
                </span>
                <span className="text-[9.5px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[rgba(239,185,78,0.13)] border border-[rgba(239,185,78,0.30)] text-[#EFB94E]">
                  Noticeable
                </span>
              </div>

              <p className="text-sm leading-relaxed text-[rgba(245,242,234,0.70)]">
                {frictionText}
              </p>

              <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-[rgba(245,242,234,0.08)]">
                <div className="rounded-xl p-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(245,242,234,0.11)]">
                  <div className="text-[9.5px] font-bold tracking-widest uppercase text-[#EFB94E] mb-1">
                    You may feel
                  </div>
                  <div className="text-xs text-[rgba(245,242,234,0.70)] leading-relaxed">
                    {youPerspective}
                  </div>
                </div>
                <div className="rounded-xl p-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(245,242,234,0.11)]">
                  <div className="text-[9.5px] font-bold tracking-widest uppercase text-[#5BD99A] mb-1">
                    {memberFirstName} may feel
                  </div>
                  <div className="text-xs text-[rgba(245,242,234,0.70)] leading-relaxed">
                    {themPerspective}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Where You'd Actually Meet */}
        {(viewerInterests.length > 0 || candidateInterests.length > 0) && (
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between px-1 mb-3">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
                Where you'd actually meet
              </p>
            </div>
            <GlassCard wash="rgba(91,217,154,0.11)">
              <VennMeetingCanvas
                yourInterests={yourOnlyInterests.slice(0, 4)}
                sharedInterests={sharedInterests.slice(0, 3)}
                theirInterests={theirOnlyInterests.slice(0, 4)}
                noteSentence={
                  sharedInterests.length > 0
                    ? `${sharedInterests[0]} is the obvious starting point for your first hangout.`
                    : viewerInterests.length > 0 && candidateInterests.length > 0
                      ? `No shared interests yet — but that's sometimes how the best friendships start.`
                      : `Add interests to your profile to see overlap.`
                }
              />
            </GlassCard>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[11.5px] leading-relaxed text-[rgba(245,242,234,0.44)] mt-6">
          Bond view · same ground and palette, paired everywhere
        </p>

      </div>
    </div>
  );
}

// ─── Helper functions ────────────────────────────────────────────────

function getThreadPrimaryValue(key: string, vec: ProfileVector | null): number | null {
  if (!vec) return null;
  switch (key) {
    case 'personality': return vec.personality?.extraversion ?? null;
    case 'communication': return vec.communication?.response_speed_self ?? null;
    case 'social_rhythm': return vec.social_rhythm?.planning_horizon ?? null;
    case 'intent': {
      const d = vec.intent?.depth;
      return typeof d === 'number' ? d / 4 : null;
    }
    case 'emotional': return vec.emotional?.er_opening_pace ?? null;
    case 'interests': return vec.interests && vec.interests.length > 0 ? 0.5 : null;
    case 'values': return vec.values && vec.values.length > 0 ? 0.5 : null;
    case 'lifestyle': {
      const b = vec.lifestyle?.budget_band;
      return typeof b === 'number' ? b / 4 : null;
    }
    case 'experience': return vec.experience?.group_size_pref ?? null;
    case 'geography': return null; // no continuum for geography
    default: return null;
  }
}

function getLeftLabel(key: string): string {
  const labels: Record<string, string> = {
    personality: 'Selective 1:1',
    communication: 'Replies slowly',
    social_rhythm: 'Weeks ahead',
    intent: 'Casual',
    emotional: 'Takes time',
    interests: 'Few shared',
    values: 'Different values',
    lifestyle: 'Budget-friendly',
    experience: 'Small groups',
    geography: 'Close by',
  };
  return labels[key] || '';
}

function getRightLabel(key: string): string {
  const labels: Record<string, string> = {
    personality: 'Expansive groups',
    communication: 'Replies fast',
    social_rhythm: 'Same day',
    intent: 'Deep',
    emotional: 'Opens fast',
    interests: 'Many shared',
    values: 'Similar values',
    lifestyle: 'Premium',
    experience: 'Large groups',
    geography: 'Far apart',
  };
  return labels[key] || '';
}
