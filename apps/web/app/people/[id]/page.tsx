'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bloom, SocialDnaBars, ResonanceRead, Button } from '@soul-tribe/ui';
import { getRankedMatches, RankedMatch, toProfileVector, countRealMembers, isSmallCommunityMode } from '../../../lib/matching';
import { DEMO_PROFILES, getGenderAvatarForName, generateMatchExplanation, PHRASES } from '@soul-tribe/core';
import {
  ArrowLeft, Star, Heart, MapPin, Smile, MessageSquare, Compass, Sparkles, User, Coffee,
  Flame, Layers, ShieldCheck, Lock, Sun, Moon, Sunrise, Radio, Cpu, Quote, X, Award, BookOpen, PawPrint, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthGuard } from '../../../components/AuthGuard';
import { getUserProfile, calculateTribeStanding } from '../../../lib/userStore';

function formatInterestLabel(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    return item.node_name || item.node_path || item.name || item.interest_name || '';
  }
  return String(item);
}

function formatValueLabel(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    return item.value_name || item.name || item.label || '';
  }
  return String(item);
}

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
  const [isSmallCommunity, setIsSmallCommunity] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatch() {
      if (!cleanPersonId) {
        setLoading(false);
        return;
      }

      try {
        const user = getUserProfile();
        const realCount = await countRealMembers(user.homeArea || 'Singapore');
        setIsSmallCommunity(isSmallCommunityMode(realCount));

        const matches = await getRankedMatches(user, { limit: 40 });
        const found = matches.find((m) => {
          const mId = (m.id || '').toLowerCase();
          const mName = (m.name || '').toLowerCase().replace(/\s+/g, '');
          return (
            mId === cleanPersonId ||
            (mId && mId.includes(cleanPersonId)) ||
            (cleanPersonId && cleanPersonId.includes(mId)) ||
            (mName && cleanPersonId.includes(mName))
          );
        });

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

  const demoCandidate = cleanPersonId
    ? DEMO_PROFILES.find((p) => {
        const dId = (p.profile.id || '').toLowerCase();
        const dName = (p.profile.display_name || '').toLowerCase().replace(/\s+/g, '');
        const dHandle = (p.profile.handle || '').toLowerCase();
        return (
          dId === cleanPersonId ||
          (dId && dId.includes(cleanPersonId)) ||
          (cleanPersonId && cleanPersonId.includes(dId)) ||
          (dHandle && dHandle === cleanPersonId) ||
          (dName && cleanPersonId.includes(dName))
        );
      })
    : null;

  const targetVec =
    demoCandidate ||
    (rankedMatch
      ? DEMO_PROFILES.find(
          (p) =>
            p.profile.id === rankedMatch.id ||
            p.profile.display_name.toLowerCase() === (rankedMatch.name || '').toLowerCase()
        )
      : null);

  const userProfile = getUserProfile();
  const viewerVector = userProfile ? toProfileVector(userProfile, userProfile.id) : DEMO_PROFILES[0];
  const explanation = targetVec && viewerVector ? generateMatchExplanation(viewerVector, targetVec) : null;

  const rawInterests = targetVec?.interests || [];
  const interestsList = rawInterests.map(formatInterestLabel).filter(Boolean);

  const rawValues = targetVec?.values || [];
  const valuesList = rawValues.map(formatValueLabel).filter(Boolean);

  const rawFallbackPerson = targetVec
    ? {
        id: targetVec.profile.id,
        name: targetVec.profile.display_name || 'Member',
        avatarUrl: targetVec.profile.avatar_url || getGenderAvatarForName(targetVec.profile.display_name || 'Member'),
        homeArea: targetVec.profile.home_area || 'Singapore',
        bio: targetVec.profile.bio || 'Singapore-based member.',
        interests: interestsList,
        clickText: explanation?.click_text || "There isn't enough in your pass yet to say much — add more and this will sharpen.",
        rubText: explanation?.friction_text || "There isn't enough in your pass yet to flag friction honestly — add more and this will sharpen.",
        fitLabel: 'Good Fit',
        rhythmOverlap: Math.round((targetVec.profile.confidence || 0.7) * 100),
      }
    : null;

  const fallbackPerson = rawFallbackPerson
    ? {
        ...rawFallbackPerson,
        avatarUrl: rawFallbackPerson.avatarUrl || getGenderAvatarForName(rawFallbackPerson.name),
      }
    : null;

  const foundPerson = rankedMatch
    ? {
        id: rankedMatch.id,
        name: rankedMatch.name || 'Member',
        avatarUrl: rankedMatch.avatarUrl || getGenderAvatarForName(rankedMatch.name || 'Member'),
        homeArea: rankedMatch.homeArea || 'Singapore',
        bio: rankedMatch.bio || 'Singapore-based member.',
        clickText: rankedMatch.clickText || explanation?.click_text || "Shared social rhythm and complementary interests.",
        rubText: rankedMatch.rubText || explanation?.friction_text || "Different social energy levels — take time to adjust.",
        fitLabel: rankedMatch.fitLabel || 'Good Fit',
        rhythmOverlap: Math.round((rankedMatch.rankScore || 0.7) * 100),
        interests: interestsList,
        isDemo: Boolean(rankedMatch.isDemo),
      }
    : fallbackPerson
    ? { ...fallbackPerson, isDemo: true }
    : null;

  const [connected, setConnected] = useState(false);
  const [starred, setStarred] = useState(false);
  const [demoActionAlert, setDemoActionAlert] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="mt-4 text-[13.5px] font-medium text-white/70">Loading profile details...</p>
      </div>
    );
  }

  if (!foundPerson) {
    return (
      <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white border border-white/20 shadow-xl">
          <AlertCircle className="h-8 w-8 text-amber-300" />
        </div>
        <h1 className="mt-4 text-[24px] font-extrabold text-white">Profile Not Found</h1>
        <p className="mt-2 text-[14px] text-white/75 max-w-[320px] leading-relaxed">
          This member profile could not be found or is no longer available in your curated batch.
        </p>
        <Link href="/people" className="mt-6">
          <Button variant="primary" size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Return to People
          </Button>
        </Link>
      </div>
    );
  }

  const nameString = foundPerson.name || 'Member';
  const firstName = nameString.split(' ')[0] || 'Member';
  const possessiveFirstName = `${firstName}'s`;

  const [connected, setConnected] = useState(false);
  const [starred, setStarred] = useState(false);
  const [demoActionAlert, setDemoActionAlert] = useState<string | null>(null);

  // Real Standing Check (only rendered if person has real outings_attended or outings_hosted > 0)
  const attendedCount = (targetVec?.profile as any)?.outings_attended ?? 0;
  const hostedCount = (targetVec?.profile as any)?.outings_hosted ?? 0;
  const standingInfo = (attendedCount > 0 || hostedCount > 0) ? calculateTribeStanding(attendedCount, hostedCount) : null;

  // Real Traits derived from candidate vector
  const personalityAnswered = targetVec ? (targetVec.personality?.answered ?? 0) > 0 : false;
  const commAnswered = targetVec ? (targetVec.communication?.answered ?? 0) > 0 : false;
  const rhythmAnswered = targetVec ? (targetVec.social_rhythm?.answered ?? 0) > 0 : false;
  const intentAnswered = targetVec ? (targetVec.intent?.answered ?? 0) > 0 : false;
  const emotionalAnswered = targetVec ? (targetVec.emotional?.answered ?? 0) > 0 : false;
  const lifestyleAnswered = targetVec ? (targetVec.lifestyle?.answered ?? 0) > 0 : false;
  const experienceAnswered = targetVec ? (targetVec.experience?.answered ?? 0) > 0 : false;

  // Dynamic Friendship DNA Bloom Petals
  const candidateBloomDimensions = targetVec ? [
    { key: 'p', label: 'Personality', strength: targetVec.personality?.extraversion ?? 0.5, confidence: targetVec.profile?.confidence ?? 0.7, sentence: PHRASES.extraversion(targetVec.personality?.extraversion ?? 0.5) },
    { key: 'c', label: 'Communication', strength: targetVec.communication?.response_speed_self ?? 0.5, confidence: 0.8, sentence: PHRASES.responseSpeed(targetVec.communication?.response_speed_self ?? 0.5) },
    { key: 'r', label: 'Rhythm', strength: targetVec.social_rhythm?.planning_horizon ?? 0.5, confidence: 0.8, sentence: PHRASES.planningHorizon(targetVec.social_rhythm?.planning_horizon ?? 0.5) },
    { key: 'i', label: 'Intent', strength: Math.min(1, (targetVec.intent?.depth ?? 2) / 4), confidence: 0.9, sentence: PHRASES.depth(targetVec.intent?.depth ?? 2) },
    { key: 'e', label: 'Emotional', strength: targetVec.emotional?.er_opening_pace ?? 0.5, confidence: 0.8, sentence: PHRASES.openingPace(targetVec.emotional?.er_opening_pace ?? 0.5) },
    { key: 'int', label: 'Interests', strength: Math.min(1, interestsList.length / 5), confidence: 0.8, sentence: interestsList.length ? interestsList.slice(0, 3).join(', ') : "Hasn't listed interest topics yet" },
    { key: 'v', label: 'Values', strength: Math.min(1, valuesList.length / 5), confidence: 0.8, sentence: valuesList.length ? valuesList.slice(0, 3).join(', ') : "Hasn't listed core values yet" },
  ] : [];

  // Dynamic Tribal Print Categories
  const candidateSocialDna = targetVec ? [
    { key: 'personality', name: 'Personality', score: Math.round((targetVec.personality?.extraversion ?? 0.5) * 100), catNum: 5 },
    { key: 'communication', name: 'Communication', score: Math.round((targetVec.communication?.response_speed_self ?? 0.5) * 100), catNum: 2 },
    { key: 'rhythm', name: 'Social Rhythm', score: Math.round((targetVec.social_rhythm?.planning_horizon ?? 0.5) * 100), catNum: 4 },
    { key: 'intent', name: 'Friendship Intent', score: Math.round(((targetVec.intent?.depth ?? 2) / 4) * 100), catNum: 3 },
    { key: 'emotional', name: 'Emotional Style', score: Math.round((targetVec.emotional?.er_opening_pace ?? 0.5) * 100), catNum: 9 },
    { key: 'interests', name: 'Interests', score: Math.min(100, interestsList.length * 20), catNum: 7 },
    { key: 'values', name: 'Values', score: Math.min(100, valuesList.length * 20), catNum: 6 },
    { key: 'lifestyle', name: 'Lifestyle', score: Math.round((targetVec.lifestyle?.activity_level ?? 0.5) * 100), catNum: 8 },
  ] : [];

  // Gallery Photos (Real gallery photos or empty)
  const galleryPhotos = (targetVec?.profile as any)?.gallery_urls || [];

  return (
    <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] pb-32">
      {/* BACKGROUND PORTRAIT PHOTO */}
      <img
        src={foundPerson.avatarUrl}
        alt={foundPerson.name}
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-75"
      />

      {/* Dark Ambient Vignette Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-20 flex items-center justify-between p-5 pt-8 max-w-[440px] mx-auto border-b border-white/15">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h2 className="text-[16px] font-bold text-white tracking-tight drop-shadow-md">
          Match Profile · {foundPerson.name}
        </h2>

        <div className="w-10" />
      </header>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-6 flex flex-col gap-6">
        {foundPerson.isDemo && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] border border-amber-400/40 bg-amber-500/15 p-4 text-[13px] text-amber-200 backdrop-blur-md shadow-xl flex items-start gap-3.5 overflow-hidden"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 shrink-0 mt-0.5 shadow-sm text-[14px]">
              ⚠️
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold uppercase text-amber-300 tracking-wider text-[11px] leading-tight">
                DEMO PROFILE — DISPLAY ONLY
              </h4>
              <p className="mt-1 text-amber-100/90 leading-relaxed text-[12.5px]">
                This synthetic candidate is for demonstration purposes only. Demo profiles do not exist in the database and cannot be invited to outings, pitched, or connected with.
              </p>
            </div>
          </motion.div>
        )}

        {/* HERO CARD */}
        <div className="overflow-hidden rounded-[28px] border border-white/20 bg-black/70 backdrop-blur-xl shadow-2xl">
          {/* Candidate Portrait Image Banner */}
          <div className="relative h-64 w-full overflow-hidden bg-black/40">
            <img
              src={foundPerson.avatarUrl}
              alt={foundPerson.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

            <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start">
              {foundPerson.isDemo && (
                <span className="rounded-full bg-amber-400 text-black px-2 py-0.5 text-[9.5px] font-extrabold tracking-wider uppercase shadow-lg border border-amber-300">
                  Demo
                </span>
              )}
              {foundPerson.fitLabel ? (
                <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase backdrop-blur-md border border-white/20">
                  {foundPerson.fitLabel}
                </span>
              ) : null}
            </div>

            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                  Singapore Member Profile
                </span>
                <h1 className="text-[26px] font-extrabold text-white tracking-tight drop-shadow-md">
                  {foundPerson.name}
                </h1>
                <span className="flex items-center text-[12.5px] font-semibold text-white/90">
                  <MapPin className="mr-1 h-3.5 w-3.5" /> {foundPerson.homeArea}
                </span>
              </div>

              {/* Real Standing Level Badge (if data exists) */}
              {standingInfo && (
                <div className="flex flex-col items-end pb-1">
                  <span className="text-[20px] leading-none">{standingInfo.icon}</span>
                  <span className={`mt-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${standingInfo.badgeColor}`}>
                    {standingInfo.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 pt-3">
            <p className="text-[14px] leading-relaxed text-white/90">
              {foundPerson.bio}
            </p>

            {/* INTERESTS CHIPS */}
            <div className="mt-4 pt-3 border-t border-white/15">
              <span className="text-[11px] font-bold text-white/70 uppercase">Interests</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {interestsList.length > 0 ? (
                  interestsList.map((interest, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/50 px-3.5 py-1 text-[12px] font-medium text-white backdrop-blur-md">
                      <Coffee className="h-3.5 w-3.5 text-white/80" /> {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-[12.5px] text-white/50 italic">Hasn't shared interest topics yet</span>
                )}
              </div>
            </div>

            {/* GALLERY THUMBNAILS */}
            {galleryPhotos.length > 0 && (
              <div className="mt-4 border-t border-white/15 pt-3">
                <span className="text-[11px] font-bold text-white/70 uppercase">Photo Moments</span>
                <div className="mt-2 flex items-center gap-2.5 overflow-hidden">
                  {galleryPhotos.map((photo: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-[14px] border border-white/25 bg-black/40 shadow-md"
                    >
                      <img src={photo} alt="Gallery preview" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RESONANCE READ MATCH EXPLANATION */}
        <section className="rounded-[28px] border border-white/20 bg-black/70 backdrop-blur-xl p-5 shadow-2xl">
          <div className="flex items-center gap-2 text-white pb-3 border-b border-white/15">
            <Sparkles className="h-4 w-4 text-white" />
            <h3 className="text-[15px] font-bold">Resonance Read · Match Breakdown</h3>
          </div>

          <div className="mt-4">
            <ResonanceRead clickText={foundPerson.clickText} rubText={foundPerson.rubText} />
          </div>
        </section>

        {/* SECTION A: FRIENDSHIP DNA BLOOM */}
        {candidateBloomDimensions.length > 0 && (
          <section className="py-2 border-b border-white/15">
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              Friendship DNA Bloom
            </span>
            <p className="mt-1 text-[13.5px] text-white/90">
              Visual trait petals representing {foundPerson.name}'s social energy, rhythm, and values.
            </p>

            <div className="mt-4 flex justify-center rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
              <Bloom dimensions={candidateBloomDimensions} size={280} interactive />
            </div>
          </section>
        )}

        {/* SECTION B: TRIBAL PRINT */}
        {candidateSocialDna.length > 0 && (
          <section className="py-2 border-b border-white/15">
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              {possessiveFirstName} Tribal Print
            </span>
            <p className="mt-1 text-[13.5px] text-white/90">
              Dynamic trait vectors from {foundPerson.name}'s completed Tribal Pass.
            </p>

            <div className="mt-4">
              <SocialDnaBars categories={candidateSocialDna} title={`${possessiveFirstName} Tribal Print`} />
            </div>
          </section>
        )}

        {/* SECTION C: 10-CATEGORY VISUAL SIGNALS MAP */}
        <section className="py-2 flex flex-col gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              Social Signature
            </span>
            <h2 className="mt-1 text-[20px] font-bold text-white">
              {possessiveFirstName} Social Signature
            </h2>
            <p className="mt-1 text-[13.5px] text-white/80">
              Visual breakdown from {foundPerson.name}'s pass.
            </p>
          </div>

          {/* 1. SOCIAL ENERGY */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Smile className="h-4 w-4" />
                <h3 className="text-[15.5px] font-extrabold">01. Social Energy</h3>
              </div>
              {experienceAnswered && targetVec && (
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white border border-white/30">
                  {PHRASES.groupSize(targetVec.experience?.group_size_pref ?? 0.5)}
                </span>
              )}
            </div>

            {personalityAnswered && targetVec ? (
              <div className="mt-4 flex items-center gap-4 border-t border-white/15 pt-3">
                <div className="relative h-16 w-16 flex-shrink-0 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                    <path className="text-white/10" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-white" strokeDasharray={`${Math.round((targetVec.personality?.extraversion ?? 0.5) * 100)}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute text-[10px] font-extrabold text-white">
                    {Math.round((targetVec.personality?.extraversion ?? 0.5) * 100)}%
                  </div>
                </div>
                <div>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[12px] font-semibold text-white">
                    {PHRASES.extraversion(targetVec.personality?.extraversion ?? 0.5)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-white/50 italic">Hasn't shared social energy preference yet.</p>
            )}
          </div>

          {/* 2. HOW I CONNECT */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-white">
              <MessageSquare className="h-4 w-4" />
              <h3 className="text-[15.5px] font-extrabold">02. How I Connect</h3>
            </div>

            {commAnswered && targetVec ? (
              <div className="mt-3 flex items-center justify-around py-3 border-t border-white/15 my-2">
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <div className="h-9 w-9 rounded-full border border-white/30 bg-white/20 flex items-center justify-center font-bold text-white text-[12px]">💬</div>
                  <span className="text-[11px] font-semibold text-white/90">{PHRASES.responseSpeed(targetVec.communication?.response_speed_self ?? 0.5)}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <div className="h-9 w-9 rounded-full border border-white/30 bg-white/20 flex items-center justify-center font-bold text-white text-[12px]">☕</div>
                  <span className="text-[11px] font-semibold text-white/90">{PHRASES.cadenceNeed(targetVec.communication?.contact_frequency_self ?? 0.5)}</span>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-white/50 italic">Hasn't shared messaging preferences yet.</p>
            )}
          </div>

          {/* 3. FRIENDSHIP STYLE */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-white">
              <Heart className="h-4 w-4" />
              <h3 className="text-[15.5px] font-extrabold">03. Friendship Style</h3>
            </div>

            {intentAnswered && targetVec ? (
              <div className="mt-3 rounded-[16px] border border-white/15 bg-white/5 p-3.5">
                <span className="text-[10px] font-bold text-white/60 uppercase">Friendship Intent</span>
                <p className="mt-1 text-[13.5px] font-bold text-white">{PHRASES.depth(targetVec.intent?.depth ?? 2)}</p>
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-white/50 italic">Hasn't shared friendship intent yet.</p>
            )}
          </div>

          {/* 4. MY RHYTHM */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Compass className="h-4 w-4" />
                <h3 className="text-[15.5px] font-extrabold">04. My Rhythm</h3>
              </div>
              {rhythmAnswered && targetVec && (
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white border border-white/30">
                  {PHRASES.planningHorizon(targetVec.social_rhythm?.planning_horizon ?? 0.5)}
                </span>
              )}
            </div>

            {rhythmAnswered && targetVec ? (
              <p className="mt-3 text-[13.5px] text-white/90">
                Planning style: {PHRASES.planningHorizon(targetVec.social_rhythm?.planning_horizon ?? 0.5)}.
              </p>
            ) : (
              <p className="mt-3 text-[13px] text-white/50 italic">Hasn't shared planning rhythm yet.</p>
            )}
          </div>

          {/* 5. WHAT MATTERS */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4" />
              <h3 className="text-[15.5px] font-extrabold">05. What Matters & Values</h3>
            </div>

            {valuesList.length > 0 ? (
              <div className="mt-3 flex flex-wrap justify-start gap-2 py-1">
                {valuesList.map((val: string) => (
                  <span
                    key={val}
                    className="rounded-full border border-white/30 bg-gradient-to-r from-white/20 to-white/10 px-3.5 py-1 text-[12.5px] font-bold text-white backdrop-blur-md shadow-md"
                  >
                    ✨ {val}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-white/50 italic">Hasn't listed core values yet.</p>
            )}
          </div>

          {/* 6. OUTING DNA */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Layers className="h-4 w-4" />
                <h3 className="text-[15.5px] font-extrabold">06. Outing DNA</h3>
              </div>
            </div>

            {lifestyleAnswered && targetVec ? (
              <div className="mt-3 space-y-2">
                <p className="text-[13px] text-white/90">
                  <span className="font-semibold text-white">Budget Preference:</span> {PHRASES.budgetBand(targetVec.lifestyle?.budget_band ?? 2)}
                </p>
                <p className="text-[13px] text-white/90">
                  <span className="font-semibold text-white">Activity Style:</span> {PHRASES.activityLevel(targetVec.lifestyle?.activity_level ?? 0.5)}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-white/50 italic">Hasn't shared outing preferences yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* FLOATING BOTTOM ACTION BUTTONS */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex flex-col items-center justify-center gap-3 px-4">
        {demoActionAlert && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[400px] rounded-[18px] border border-amber-400/60 bg-black/90 p-3 text-[12.5px] font-medium text-amber-200 shadow-2xl backdrop-blur-xl flex items-center justify-between"
          >
            <span>{demoActionAlert}</span>
            <button
              type="button"
              onClick={() => setDemoActionAlert(null)}
              className="ml-2 font-bold text-white hover:text-amber-300 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-13 w-13 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
            title="Pass"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (foundPerson.isDemo) {
                setDemoActionAlert('Demo profiles are display-only. Connecting, pitching, and inviting are disabled.');
                return;
              }
              setStarred(!starred);
            }}
            className={`flex h-13 w-13 items-center justify-center rounded-full border backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer ${
              starred ? 'border-white bg-white text-black' : 'border-white/30 bg-black/60 text-white'
            }`}
            title="Star Match"
          >
            <Star className="h-6 w-6 fill-current" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (foundPerson.isDemo) {
                setDemoActionAlert('Demo profiles are display-only. Connecting, pitching, and inviting are disabled.');
                return;
              }
              setConnected(!connected);
            }}
            className={`flex h-13 w-13 items-center justify-center rounded-full border backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer ${
              connected ? 'border-white bg-white text-black' : 'border-white/30 bg-black/60 text-white'
            }`}
            title="Connect"
          >
            <Heart className="h-6 w-6 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
