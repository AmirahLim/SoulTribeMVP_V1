'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bloom, SocialDnaBars, ResonanceRead, Button } from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../../supabase/seed/seed';
import { score } from '../../../../../packages/core/matching/engine';
import { generateMatchExplanation } from '../../../../../packages/core/explain/generator';
import {
  ArrowLeft, Star, Heart, MapPin, Smile, MessageSquare, Compass, Sparkles, User, Coffee,
  Flame, Layers, ShieldCheck, Lock, Sun, Moon, Sunrise, Radio, Cpu, Quote, X, Award, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateTribeStanding } from '../../../lib/userStore';

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const personId = params.id as string;

  const currentUser = SYNTHETIC_PROFILES[0]; // Priya Sharma
  const person = SYNTHETIC_PROFILES.find((p) => p.profile.id === personId) || SYNTHETIC_PROFILES[1];

  const [connected, setConnected] = useState(false);
  const [starred, setStarred] = useState(false);

  const matchResult = score(currentUser, person);
  const explanation = generateMatchExplanation(currentUser, person);

  // Bot Profile Real Photo Mapping
  const heroPhotos: Record<string, string> = {
    'Marcus Tan': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&auto=format&fit=crop&q=80',
    'Maya Lin': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80',
    'Chen Wei': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1000&auto=format&fit=crop&q=80',
  };
  const activePhoto = heroPhotos[person.profile.display_name] || heroPhotos['Marcus Tan'];

  const galleryPhotos = [
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  ];

  // Bot Standing Level
  const botStanding = calculateTribeStanding(
    person.profile.display_name === 'Marcus Tan' ? 5 : 2,
    person.profile.display_name === 'Marcus Tan' ? 2 : 0
  );

  // Candidate Traits for Friendship DNA Bloom
  const candidateBloomDimensions = [
    { key: 'p', label: 'Personality', strength: 0.85, confidence: 0.9, sentence: `${person.profile.display_name} is thoughtful, analytical, and loves quiet craft.` },
    { key: 'c', label: 'Communication', strength: 0.9, confidence: 0.95, sentence: 'Prefers deep one-on-one talks and voice notes.' },
    { key: 'r', label: 'Rhythm', strength: 0.75, confidence: 0.85, sentence: 'Active Saturday afternoons and quiet Sunday coffee mornings.' },
    { key: 'i', label: 'Intent', strength: 0.95, confidence: 0.95, sentence: 'Seeking 3–4 long-term intentional friends in Singapore.' },
    { key: 'e', label: 'Emotional', strength: 0.8, confidence: 0.9, sentence: 'Listens first, offers grounded perspective.' },
    { key: 'int', label: 'Interests', strength: 0.85, confidence: 0.85, sentence: 'Pottery throwing, specialty filter coffee, woodworking.' },
    { key: 'v', label: 'Values', strength: 0.9, confidence: 0.9, sentence: 'Values honesty, quiet reliability, and continuous learning.' },
  ];

  // Candidate Traits for Tribal Print
  const candidateSocialDna = [
    { key: 'personality', name: 'Personality', score: 85, catNum: 5 },
    { key: 'communication', name: 'Communication', score: 90, catNum: 2 },
    { key: 'rhythm', name: 'Social Rhythm', score: 75, catNum: 4 },
    { key: 'intent', name: 'Friendship Intent', score: 95, catNum: 3 },
    { key: 'emotional', name: 'Emotional Style', score: 80, catNum: 9 },
    { key: 'interests', name: 'Interests', score: 85, catNum: 7 },
    { key: 'values', name: 'Values', score: 90, catNum: 6 },
    { key: 'lifestyle', name: 'Lifestyle', score: 80, catNum: 8 },
  ];

  // Custom Bot Specific Responses
  const botAnswers: Record<string, any> = {
    'Marcus Tan': {
      groupSize: '3–4 people',
      socialVibe: 'Intimate · Calm',
      socialAtmosphereOpen: 'Give me 3 people around a kitchen table and I can talk about architecture & coffee until 2am.',
      messagingStyle: 'Voice notes · Memes',
      supportStyle: 'Listen first',
      messagingStyleOpen: 'I appreciate voice notes when we can\'t meet, but nothing beats sitting across a table.',
      friendshipPillars: 'Comfortable silence · Reliability',
      realFriendOpen: 'We can go weeks without talking and pick right back up without any weirdness.',
      idealSaturday: 'Filter coffee & Woodworking',
      spontaneousTrip: 'Convince me',
      idealSaturdayOpen: 'Morning filter coffee in Tiong Bahru, afternoon throwing clay or woodworking.',
      selfDescriptionOpen: 'Analytical yet warm, curious about how things are designed and built.',
      mbti: 'INTJ',
      sunSign: 'Taurus',
      moonSign: 'Virgo',
      risingSign: 'Leo',
      coreValues: 'Craft · Curiosity · Honesty · Freedom',
      respectPeopleOpen: 'can stay calm and open-minded during a disagreement.',
      talkForHoursOpen: 'Japanese woodworking joints, espresso extraction variables, and analog camera lenses.',
      currentRabbitHoleOpen: 'Restoring a 1970s Olympus OM-1 film camera.',
      budgetPref: '$20–50',
      instantYesOutingOpen: 'A quiet 2-hour pottery workshop followed by filter coffee.',
      likeMeIfPrompt: 'You appreciate quiet coffee walks and design history.',
      quickestWayPrompt: 'Invite me to a quiet bookstore or specialty roastery.',
      punctualityPref: 'Essential',
      cancellationStance: 'Notice Required',
    },
    'Maya Lin': {
      groupSize: '3–4 people',
      socialVibe: 'Creative & Adventurous',
      socialAtmosphereOpen: 'Love warm, encouraging settings where people share creative projects.',
      messagingStyle: 'Check-ins & Memes',
      supportStyle: 'Reassure & Listen',
      messagingStyleOpen: 'Casual daily check-ins keep friendships alive.',
      friendshipPillars: 'Inside jokes · Spontaneous plans',
      realFriendOpen: 'We can laugh about something stupid for 20 minutes straight.',
      idealSaturday: 'Botanical walk & Brunch',
      spontaneousTrip: 'Already packing',
      idealSaturdayOpen: 'Early walk at Botanic Gardens, followed by sourdough & filter coffee in Katong.',
      selfDescriptionOpen: 'Optimistic, empathetic, and always looking for new coffee spots.',
      mbti: 'ENFP',
      sunSign: 'Libra',
      moonSign: 'Pisces',
      risingSign: 'Gemini',
      coreValues: 'Creativity · Community · Growth',
      respectPeopleOpen: 'are kind to strangers and servers.',
      talkForHoursOpen: 'Graphic design, film scores, and urban green spaces in Singapore.',
      currentRabbitHoleOpen: 'Natural sourdough fermentation and botanical illustration.',
      budgetPref: '$20–50',
      instantYesOutingOpen: 'Morning coffee walk through Katong heritage shophouses.',
      likeMeIfPrompt: 'You love finding hidden coffee spots and art markets.',
      quickestWayPrompt: 'Propose a weekend cafe crawl in Katong.',
      punctualityPref: 'Flexible',
      cancellationStance: 'Context matters',
    },
    'Chen Wei': {
      groupSize: 'One-on-one / 3–4',
      socialVibe: 'Intellectual & Calm',
      socialAtmosphereOpen: 'Prefer quiet spaces where we can actually hear each other talk.',
      messagingStyle: 'Making plans & Calls',
      supportStyle: 'Listen & Solve it',
      messagingStyleOpen: 'Direct communication with intentional catch-ups.',
      friendshipPillars: 'Reliability & Show up',
      realFriendOpen: 'You show up when it actually matters.',
      idealSaturday: 'Trail running & Reading',
      spontaneousTrip: '24 hours notice needed',
      idealSaturdayOpen: 'Early trail run at MacRitchie, followed by quiet reading at a bookstore.',
      selfDescriptionOpen: 'Grounded, disciplined, and reflective.',
      mbti: 'ISTJ',
      sunSign: 'Capricorn',
      moonSign: 'Taurus',
      risingSign: 'Virgo',
      coreValues: 'Integrity · Discipline · Reliability',
      respectPeopleOpen: 'keep their word and show up on time.',
      talkForHoursOpen: 'Marathon training tech, financial independence, and Singapore history.',
      currentRabbitHoleOpen: 'Ultramarathon pacing strategies and biomechanics.',
      budgetPref: '$20–50',
      instantYesOutingOpen: '7am MacRitchie reservoir trail walk and kopi.',
      likeMeIfPrompt: 'You value punctuality and direct honesty.',
      quickestWayPrompt: 'Invite me for an early morning trail run.',
      punctualityPref: 'Essential',
      cancellationStance: 'Dislike — notice required',
    },
  };

  const currentBotDeep = botAnswers[person.profile.display_name] || botAnswers['Marcus Tan'];
  const coreValuesList = (currentBotDeep.coreValues || 'Craft · Curiosity · Freedom')
    .split(/·|,/)
    .map((s: string) => s.trim())
    .filter(Boolean);

  return (
    <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] pb-32">
      {/* BACKGROUND PORTRAIT PHOTO */}
      <img
        src={activePhoto}
        alt={person.profile.display_name}
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-75"
      />

      {/* Dark Ambient Vignette Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-20 flex items-center justify-between p-5 pt-8 max-w-[440px] mx-auto border-b border-white/15">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h2 className="text-[16px] font-bold text-white tracking-tight drop-shadow-md">
          Match Profile · {person.profile.display_name}
        </h2>

        <div className="w-10" />
      </header>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-6 flex flex-col gap-6">
        {/* HERO CARD (ORIGINAL DETAILS + BIO + INTEREST CHIPS + GALLERY THUMBNAILS + STANDING) */}
        <div className="rounded-[28px] border border-white/20 bg-black/70 backdrop-blur-xl p-5 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                Singapore Member Profile
              </span>
              <h1 className="mt-0.5 text-[28px] font-extrabold text-white tracking-tight drop-shadow-md">
                {person.profile.display_name}
              </h1>
              <span className="flex items-center text-[13px] font-semibold text-white/80 mt-0.5">
                <MapPin className="mr-1 h-3.5 w-3.5" /> {person.profile.home_area} · Singapore
              </span>
            </div>

            {/* Standing Level Badge */}
            <div className="flex flex-col items-end">
              <span className="text-[20px] leading-none">{botStanding.icon}</span>
              <span className={`mt-1 rounded-full border px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase ${botStanding.badgeColor}`}>
                {botStanding.label}
              </span>
            </div>
          </div>

          <p className="mt-3.5 text-[14px] leading-relaxed text-white/90">
            {person.profile.bio || "Singapore-based. Looking for genuine, intentional friendships. I love quiet weekend wandering, pottery throwing, and deep conversations over filter coffee. Let's connect!"}
          </p>

          {/* INTERESTS CHIPS */}
          <div className="mt-4 pt-3 border-t border-white/15">
            <span className="text-[11px] font-bold text-white/70 uppercase">Interests</span>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/50 px-3.5 py-1 text-[12px] font-medium text-white backdrop-blur-md">
                <Coffee className="h-3.5 w-3.5" /> Specialty Coffee
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/50 px-3.5 py-1 text-[12px] font-medium text-white backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" /> Ceramics
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/50 px-3.5 py-1 text-[12px] font-medium text-white backdrop-blur-md">
                <BookOpen className="h-3.5 w-3.5" /> Independent Bookshops
              </span>
            </div>
          </div>

          {/* GALLERY THUMBNAILS */}
          <div className="mt-4 flex items-center gap-3 pt-3 border-t border-white/15">
            {galleryPhotos.map((photo, idx) => (
              <div
                key={idx}
                className="relative h-14 w-18 flex-shrink-0 overflow-hidden rounded-[14px] border border-white/25 bg-black/40 shadow-lg"
              >
                <img src={photo} alt="Gallery preview" className="h-full w-full object-cover" />
                {idx === 2 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[12px] font-bold text-white backdrop-blur-xs">
                    10+
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RESONANCE READ MATCH EXPLANATION (WHY YOU CLICK & FRICTION) */}
        <section className="rounded-[28px] border border-white/20 bg-black/70 backdrop-blur-xl p-5 shadow-2xl">
          <div className="flex items-center gap-2 text-white pb-3 border-b border-white/15">
            <Sparkles className="h-4 w-4 text-white" />
            <h3 className="text-[15px] font-bold">Resonance Read · Match Breakdown</h3>
          </div>

          <div className="mt-4">
            <ResonanceRead clickText={explanation.click_text} rubText={explanation.rub_text} />
          </div>
        </section>

        {/* SECTION A: FRIENDSHIP DNA BLOOM */}
        <section className="py-2 border-b border-white/15">
          <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
            Friendship DNA Bloom
          </span>
          <p className="mt-1 text-[13.5px] text-white/90">
            Visual trait petals representing {person.profile.display_name}'s social energy, rhythm, and values.
          </p>

          <div className="mt-4 flex justify-center rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <Bloom dimensions={candidateBloomDimensions} size={280} interactive />
          </div>
        </section>

        {/* SECTION B: YOUR TRIBAL PRINT */}
        <section className="py-2 border-b border-white/15">
          <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
            Your Tribal Print
          </span>
          <p className="mt-1 text-[13.5px] text-white/90">
            Dynamic trait vectors from {person.profile.display_name}'s completed Tribal Pass.
          </p>

          <div className="mt-4">
            <SocialDnaBars categories={candidateSocialDna} />
          </div>
        </section>

        {/* SECTION C: 10-CATEGORY VISUAL SIGNALS MAP */}
        <section className="py-2 flex flex-col gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              Public Signals Map
            </span>
            <h2 className="mt-1 text-[20px] font-bold text-white">
              What You See About {person.profile.display_name}
            </h2>
            <p className="mt-1 text-[13.5px] text-white/80">
              Complete 10-category visual breakdown from {person.profile.display_name}'s Deeper Pass.
            </p>
          </div>

          {/* 1. SOCIAL ENERGY (SVG SPECTRUM RADAR GAUGE) */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Smile className="h-4 w-4" />
                <h3 className="text-[15.5px] font-extrabold">01. Social Energy</h3>
              </div>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white border border-white/30">
                {currentBotDeep.groupSize}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-4 border-t border-white/15 pt-3">
              <div className="relative h-16 w-16 flex-shrink-0 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                  <path className="text-white/10" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-white" strokeDasharray="65, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute text-[10px] font-extrabold text-white">65%</div>
              </div>
              <div>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[12px] font-semibold text-white">
                  {currentBotDeep.socialVibe}
                </span>
                <p className="mt-1 text-[12px] text-white/70">
                  Optimal setting: Intimate small gatherings over large crowds.
                </p>
              </div>
            </div>

            {currentBotDeep.socialAtmosphereOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “{currentBotDeep.socialAtmosphereOpen}”
              </p>
            )}
          </div>

          {/* 2. HOW I CONNECT (SVG VECTOR FLOW GRAPH) */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-white">
              <MessageSquare className="h-4 w-4" />
              <h3 className="text-[15.5px] font-extrabold">02. How I Connect</h3>
            </div>

            <div className="mt-3 flex items-center justify-around py-3 border-y border-white/15 my-2">
              <div className="flex flex-col items-center gap-0.5 text-center">
                <div className="h-9 w-9 rounded-full border border-white/30 bg-white/20 flex items-center justify-center font-bold text-white text-[12px]">🎙️</div>
                <span className="text-[11px] font-semibold text-white/90">Voice Notes</span>
              </div>
              <svg className="h-4 w-8 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M13 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex flex-col items-center gap-0.5 text-center">
                <div className="h-9 w-9 rounded-full border border-white/30 bg-white/20 flex items-center justify-center font-bold text-white text-[12px]">💬</div>
                <span className="text-[11px] font-semibold text-white/90">Memes</span>
              </div>
              <svg className="h-4 w-8 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M13 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex flex-col items-center gap-0.5 text-center">
                <div className="h-9 w-9 rounded-full border border-white/30 bg-white/20 flex items-center justify-center font-bold text-white text-[12px]">☕</div>
                <span className="text-[11px] font-semibold text-white/90">{currentBotDeep.supportStyle}</span>
              </div>
            </div>

            {currentBotDeep.messagingStyleOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “{currentBotDeep.messagingStyleOpen}”
              </p>
            )}
          </div>

          {/* 3. FRIENDSHIP STYLE (DUAL-AXIS VECTOR GRAPH) */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-white">
              <Heart className="h-4 w-4" />
              <h3 className="text-[15.5px] font-extrabold">03. Friendship Style</h3>
            </div>

            <div className="mt-3 relative h-20 w-full rounded-[16px] border border-white/15 bg-white/5 p-3 flex items-center justify-between">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-white/60 uppercase">Axis A</span>
                <span className="text-[13px] font-bold text-white">Comfortable Silence</span>
              </div>
              <div className="h-8 w-0.5 bg-white/20" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold text-white/60 uppercase">Axis B</span>
                <span className="text-[13px] font-bold text-white">Reliability & Trust</span>
              </div>
            </div>

            {currentBotDeep.realFriendOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “{currentBotDeep.realFriendOpen}”
              </p>
            )}
          </div>

          {/* 4. MY RHYTHM (WEEKLY VECTOR TIMELINE) */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Compass className="h-4 w-4" />
                <h3 className="text-[15.5px] font-extrabold">04. My Rhythm</h3>
              </div>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white border border-white/30">
                {currentBotDeep.spontaneousTrip}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-1 py-2 border-y border-white/15">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                const isPeak = day === 'Sat' || day === 'Sun';
                return (
                  <div
                    key={day}
                    className={`flex flex-col items-center justify-center rounded-[10px] py-1.5 px-2 text-[11px] font-bold transition-all ${
                      isPeak
                        ? 'bg-white text-black font-extrabold shadow-md'
                        : 'border border-white/15 bg-black/40 text-white/60'
                    }`}
                  >
                    <span>{day}</span>
                    <span className="text-[9px] mt-0.5">{isPeak ? '★ Peak' : 'Quiet'}</span>
                  </div>
                );
              })}
            </div>

            {currentBotDeep.idealSaturdayOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “{currentBotDeep.idealSaturdayOpen}”
              </p>
            )}
          </div>

          {/* 5. PERSONALITY SIGNALS (MBTI & ASTROLOGY BIG 3 VECTOR BADGES) */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Cpu className="h-4 w-4" />
                <h3 className="text-[15.5px] font-extrabold">05. Personality & Astrology</h3>
              </div>
              {currentBotDeep.mbti && (
                <span className="rounded-full border border-white/30 bg-white/20 px-3 py-0.5 text-[11px] font-extrabold text-white">
                  ✨ MBTI: {currentBotDeep.mbti}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-white/15">
              {currentBotDeep.sunSign && (
                <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-bold text-white">
                  <Sun className="h-3.5 w-3.5 text-white" /> Sun: {currentBotDeep.sunSign}
                </span>
              )}
              {currentBotDeep.moonSign && (
                <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-bold text-white">
                  <Moon className="h-3.5 w-3.5 text-white" /> Moon: {currentBotDeep.moonSign}
                </span>
              )}
              {currentBotDeep.risingSign && (
                <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-bold text-white">
                  <Sunrise className="h-3.5 w-3.5 text-white" /> Rising: {currentBotDeep.risingSign}
                </span>
              )}
            </div>

            {currentBotDeep.selfDescriptionOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “{currentBotDeep.selfDescriptionOpen}”
              </p>
            )}
          </div>

          {/* 6. WHAT MATTERS (VALUES CONSTELLATION ORBIT) */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4" />
              <h3 className="text-[15.5px] font-extrabold">06. What Matters</h3>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2 py-1">
              {coreValuesList.map((val: string) => (
                <span
                  key={val}
                  className="rounded-full border border-white/30 bg-gradient-to-r from-white/20 to-white/10 px-3.5 py-1 text-[12.5px] font-bold text-white backdrop-blur-md shadow-md"
                >
                  ✨ {val}
                </span>
              ))}
            </div>

            {currentBotDeep.respectPeopleOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “I really respect people who {currentBotDeep.respectPeopleOpen}”
              </p>
            )}
          </div>

          {/* 7. I'M INTO (CURIOSITY RABBIT HOLE TREE) */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-white">
              <Flame className="h-4 w-4" />
              <h3 className="text-[15.5px] font-extrabold">07. I'm Into & Rabbit Holes</h3>
            </div>

            <div className="mt-3 rounded-[16px] border border-white/15 bg-white/10 p-3">
              <span className="text-[10px] font-bold text-white/70 uppercase">Current Rabbit Hole</span>
              <p className="mt-1 text-[13px] font-bold text-white">
                “{currentBotDeep.currentRabbitHoleOpen}”
              </p>
            </div>

            {currentBotDeep.talkForHoursOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “Could lose hours talking about {currentBotDeep.talkForHoursOpen}”
              </p>
            )}
          </div>

          {/* 8. OUTING DNA (ACTIVITY & VIBE VECTOR) */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Layers className="h-4 w-4" />
                <h3 className="text-[15.5px] font-extrabold">08. Outing DNA</h3>
              </div>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white border border-white/30">
                Low-Key & Creative Outings
              </span>
            </div>

            {currentBotDeep.instantYesOutingOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “Instant Yes Outing: {currentBotDeep.instantYesOutingOpen}”
              </p>
            )}
          </div>

          {/* 9. YOU SHOULD KNOW (PROMPT VOICE CARDS) */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl relative overflow-hidden">
            <Quote className="absolute right-3 top-3 h-16 w-16 opacity-10 text-white pointer-events-none" />

            <div className="flex items-center gap-2 text-white">
              <User className="h-4 w-4" />
              <h3 className="text-[15.5px] font-extrabold">09. You Should Know</h3>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              <div className="rounded-[16px] border border-white/15 bg-black/40 p-3">
                <span className="text-[11px] font-bold text-white/70 uppercase">I'll probably like you if:</span>
                <p className="mt-1 text-[13.5px] text-white">“{currentBotDeep.likeMeIfPrompt}”</p>
              </div>
              <div className="rounded-[16px] border border-white/15 bg-black/40 p-3">
                <span className="text-[11px] font-bold text-white/70 uppercase">Quickest way to get me out:</span>
                <p className="mt-1 text-[13.5px] text-white">“{currentBotDeep.quickestWayPrompt}”</p>
              </div>
            </div>
          </div>

          {/* 10. BOUNDARIES & MATCHING (SECURITY SHIELD VECTOR) */}
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-4 w-4 text-white" />
                <h3 className="text-[15.5px] font-extrabold">10. Boundaries & Matching</h3>
              </div>
              <span className="flex items-center gap-1 rounded-full border border-white/30 bg-black/60 px-2.5 py-0.5 text-[10.5px] font-bold text-white">
                <Lock className="h-3 w-3" /> Algorithm Guard
              </span>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-center">
              <div className="rounded-[16px] border border-white/15 bg-white/10 p-2.5">
                <span className="text-[10px] font-bold text-white/70 uppercase">Punctuality</span>
                <p className="mt-0.5 text-[12.5px] font-bold text-white">{currentBotDeep.punctualityPref}</p>
              </div>
              <div className="rounded-[16px] border border-white/15 bg-white/10 p-2.5">
                <span className="text-[10px] font-bold text-white/70 uppercase">Cancellation</span>
                <p className="mt-0.5 text-[12.5px] font-bold text-white">{currentBotDeep.cancellationStance}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FLOATING BOTTOM ACTION BUTTONS */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex items-center justify-center">
        <div className="flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-13 w-13 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shadow-2xl"
            title="Pass"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={() => setStarred(!starred)}
            className={`flex h-13 w-13 items-center justify-center rounded-full border backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shadow-2xl ${
              starred ? 'border-white bg-white text-black' : 'border-white/30 bg-black/60 text-white'
            }`}
            title="Star Match"
          >
            <Star className="h-6 w-6 fill-current" />
          </button>

          <button
            type="button"
            onClick={() => setConnected(!connected)}
            className={`flex h-13 w-13 items-center justify-center rounded-full border backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shadow-2xl ${
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
