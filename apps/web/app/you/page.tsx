'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bloom, SocialDnaBars, Button } from '@soul-tribe/ui';
import { motion } from 'framer-motion';
import {
  Settings, X, MessageSquare, Heart, Compass, Sparkles, User, Coffee, Smile, Radio,
  Quote, ShieldCheck, Cpu, Flame, Layers, Clock, Globe, Lock, ArrowUpRight, Edit3, Sun, Moon, Sunrise, Info, Award, CheckCircle2
} from 'lucide-react';
import {
  getUserProfile, setUserProfile, UserProfileData,
  STANDING_LEVELS, calculateTribeStanding, StandingLevel
} from '../../lib/userStore';

export default function ProfilePage() {
  const [profile, setProfileState] = useState<UserProfileData>({
    displayName: 'You',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    homeArea: 'Tiong Bahru',
    bio: 'Loves specialty coffee, ceramic craft, and analog film.',
    passCompletionPct: 85,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStandingGuideOpen, setIsStandingGuideOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhoto, setEditPhoto] = useState('');

  useEffect(() => {
    const loaded = getUserProfile();
    setProfileState(loaded);
    setEditName(loaded.displayName);
    setEditArea(loaded.homeArea);
    setEditBio(loaded.bio);
    setEditPhoto(loaded.avatarUrl);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = setUserProfile({
      displayName: editName.trim() || 'You',
      homeArea: editArea,
      bio: editBio,
      avatarUrl: editPhoto,
    });
    setProfileState(updated);
    setIsSettingsOpen(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const deep = profile.deepProfile || {};
  const currentStanding = calculateTribeStanding(profile.outingsAttended || 3, profile.outingsHosted || 1);

  const bloomDimensions = [
    { key: 'p', label: 'Personality', strength: 0.8, confidence: 0.9, sentence: deep.selfDescriptionOpen || 'Curious, reflective, and independent.' },
    { key: 'c', label: 'Communication', strength: 0.7, confidence: 0.85, sentence: deep.messagingStyleOpen || 'Prefers intentional messages & voice notes.' },
    { key: 'r', label: 'Rhythm', strength: 0.6, confidence: 0.8, sentence: deep.idealSaturdayOpen || 'Slow mornings, afternoons for exploring.' },
    { key: 'i', label: 'Intent', strength: 0.9, confidence: 0.95, sentence: deep.realFriendOpen || 'Looking for a small, regular inner circle.' },
    { key: 'e', label: 'Emotional', strength: 0.75, confidence: 0.9, sentence: deep.supportOpen || 'Listen first. Advice once understood.' },
    { key: 'int', label: 'Interests', strength: 0.85, confidence: 0.85, sentence: deep.talkForHoursOpen || 'Art, ceramics, psychology, travel.' },
    { key: 'v', label: 'Values', strength: 0.7, confidence: 0.8, sentence: deep.respectPeopleOpen || 'Respects people who change their mind.' },
    { key: 'l', label: 'Lifestyle', strength: 0.65, confidence: 0.75, sentence: deep.instantYesOutingOpen || 'Enjoys low-key coffee and craft meetups.' },
  ];

  const socialDnaCategories = [
    { key: 'personality', name: 'Personality', score: 80 },
    { key: 'communication', name: 'Communication', score: 90 },
    { key: 'rhythm', name: 'Social Rhythm', score: 70 },
    { key: 'intent', name: 'Friendship Intent', score: 100 },
    { key: 'emotional', name: 'Emotional Style', score: 80 },
    { key: 'interests', name: 'Interests', score: 65 },
    { key: 'values', name: 'Values', score: 90 },
    { key: 'lifestyle', name: 'Lifestyle', score: 75 },
  ];

  const coreValuesList = (deep.coreValues || 'Curiosity · Freedom · Growth · Community')
    .split(/·|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] pb-24">
      {/* PAGE CANVAS BACKGROUND: YOUR UPLOADED ARTISTIC PAINTER EASEL PHOTO */}
      <img
        src="/user-you-bg.jpg"
        alt="You Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-80"
      />

      {/* Dark Ambient Vignette Overlay for Readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      {/* PAGE CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-8">
        {/* Top Bar Header */}
        <header className="flex items-center justify-between pb-6 border-b border-white/15">
          <div className="flex items-center gap-3">
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-white/30"
            />
            <div>
              <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                Tribal Pass · {profile.passCompletionPct}% Complete
              </span>
              <h1 className="text-[22px] font-extrabold text-white tracking-tight drop-shadow-md">
                {profile.displayName}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="rounded-full border border-white/20 bg-black/50 p-2.5 text-white hover:bg-black/70 backdrop-blur-md"
            title="Edit Profile & Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </header>

        {/* REPUTATION & STANDING METRIC */}
        <section className="py-6 border-b border-white/15">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              Tribe Standing
            </span>
            <button
              type="button"
              onClick={() => setIsStandingGuideOpen(true)}
              className="flex items-center gap-1 text-[11.5px] font-semibold text-white/80 hover:text-white underline"
            >
              <Info className="h-3.5 w-3.5" /> How Standing Works
            </button>
          </div>

          {/* Current Status Badge Display */}
          <div className="mt-3 flex items-center justify-between rounded-[20px] border border-white/20 bg-black/60 p-3.5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="text-[24px] leading-none">{currentStanding.icon}</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-extrabold text-white">{currentStanding.label}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase ${currentStanding.badgeColor}`}>
                    Active Level
                  </span>
                </div>
                <p className="text-[12px] text-white/80">{currentStanding.meaning}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsStandingGuideOpen(true)}
              className="rounded-full border border-white/20 bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <Award className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 text-[13.5px] leading-relaxed text-white/90">
            {profile.bio || 'Loves specialty coffee, ceramic craft, and analog film.'}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-[12.5px] text-white/80">
              <strong className="text-white font-semibold">{profile.homeArea}</strong> · Singapore
            </div>

            <Link href="/you/deeper">
              <Button variant="secondary" size="sm">
                Deepen Tribal Pass →
              </Button>
            </Link>
          </div>
        </section>

        {/* SECTION A: FRIENDSHIP DNA BLOOM */}
        <section className="py-6 border-b border-white/15">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              Friendship DNA Bloom
            </span>
          </div>

          <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/90">
            A dynamic visual representation of your social energy, rhythm, and values.
          </p>

          <div className="mt-6 flex justify-center rounded-[24px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <Bloom dimensions={bloomDimensions} size={280} interactive />
          </div>
        </section>

        {/* SECTION B: SOCIAL DNA METRIC BARS */}
        <section className="py-6 border-b border-white/15">
          <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
            Social DNA Breakdown
          </span>
          <p className="mt-1 text-[13.5px] text-white/90">
            Trait vectors calculated from your questionnaire responses.
          </p>

          <div className="mt-4 rounded-[24px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl">
            <SocialDnaBars categories={socialDnaCategories} />
          </div>
        </section>

        {/* SECTION C: 10-CATEGORY CREATIVE VISUAL DIAGRAM MAP */}
        <section className="py-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                Public Signals Map
              </span>

              <Link href="/you/deeper">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full border border-white/30 bg-black/70 px-4 py-1.5 text-[12.5px] font-bold text-white shadow-md hover:bg-white/20 backdrop-blur-md transition-all"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Pass
                </button>
              </Link>
            </div>

            <h2 className="text-[20px] font-bold text-white">
              What People See About You
            </h2>
            <p className="text-[13.5px] text-white/80">
              Visual radar map representing all 10 categories of your Deeper Tribal Pass.
            </p>
          </div>

          {/* 1. SOCIAL ENERGY (SVG SPECTRUM RADAR GAUGE) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Smile className="h-4 w-4" />
                <h3 className="text-[15.5px] font-extrabold">01. Social Energy</h3>
              </div>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white border border-white/30">
                {deep.groupSize || '3–4 people'}
              </span>
            </div>

            {/* Creative SVG Vector Radar Dial */}
            <div className="mt-4 flex items-center gap-4 border-t border-white/15 pt-3">
              <div className="relative h-16 w-16 flex-shrink-0 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-white"
                    strokeDasharray="65, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-[10px] font-extrabold text-white">
                  65%
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[12px] font-semibold text-white">
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-white">
                    {deep.socialVibe || 'Playful-chaotic & Calm'}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-white/70">
                  Optimal setting: Intimate small gatherings over large crowds.
                </p>
              </div>
            </div>

            {(deep.socialAtmosphereOpen || deep.socialEnergyOpen) && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “{deep.socialAtmosphereOpen || deep.socialEnergyOpen || 'I usually find one person I click with before I open up to the room.'}”
              </p>
            )}
          </motion.div>

          {/* 2. HOW I CONNECT (SVG VECTOR FLOW GRAPH) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl"
          >
            <div className="flex items-center gap-2 text-white">
              <MessageSquare className="h-4 w-4" />
              <h3 className="text-[15.5px] font-extrabold">02. How I Connect</h3>
            </div>

            {/* SVG Vector Flow Diagram */}
            <div className="mt-3 flex items-center justify-around py-3 border-y border-white/15 my-2">
              <div className="flex flex-col items-center gap-0.5 text-center">
                <div className="h-9 w-9 rounded-full border border-white/30 bg-white/20 flex items-center justify-center font-bold text-white text-[12px]">
                  🎙️
                </div>
                <span className="text-[11px] font-semibold text-white/90">Voice Notes</span>
              </div>
              <svg className="h-4 w-8 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M13 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex flex-col items-center gap-0.5 text-center">
                <div className="h-9 w-9 rounded-full border border-white/30 bg-white/20 flex items-center justify-center font-bold text-white text-[12px]">
                  💬
                </div>
                <span className="text-[11px] font-semibold text-white/90">Memes</span>
              </div>
              <svg className="h-4 w-8 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M13 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex flex-col items-center gap-0.5 text-center">
                <div className="h-9 w-9 rounded-full border border-white/30 bg-white/20 flex items-center justify-center font-bold text-white text-[12px]">
                  ☕
                </div>
                <span className="text-[11px] font-semibold text-white/90">Listen First</span>
              </div>
            </div>

            {deep.messagingStyleOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “{deep.messagingStyleOpen}”
              </p>
            )}
          </motion.div>

          {/* 3. FRIENDSHIP STYLE (DUAL-AXIS VECTOR GRAPH) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl"
          >
            <div className="flex items-center gap-2 text-white">
              <Heart className="h-4 w-4" />
              <h3 className="text-[15.5px] font-extrabold">03. Friendship Style</h3>
            </div>

            {/* 2D Vector Axis Graphic */}
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

            {deep.realFriendOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “{deep.realFriendOpen}”
              </p>
            )}
          </motion.div>

          {/* 4. MY RHYTHM (WEEKLY VECTOR TIMELINE) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Compass className="h-4 w-4" />
                <h3 className="text-[15.5px] font-extrabold">04. My Rhythm</h3>
              </div>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white border border-white/30">
                {deep.spontaneousTrip || 'Convince me'}
              </span>
            </div>

            {/* Visual 7-Day Calendar Strip */}
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

            {deep.idealSaturdayOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “{deep.idealSaturdayOpen}”
              </p>
            )}
          </motion.div>

          {/* 5. PERSONALITY SIGNALS (MBTI & ASTROLOGY BIG 3 VECTOR BADGES) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Cpu className="h-4 w-4" />
                <h3 className="text-[15.5px] font-extrabold">05. Personality & Astrology</h3>
              </div>
              {deep.mbti && (
                <span className="rounded-full border border-white/30 bg-white/20 px-3 py-0.5 text-[11px] font-extrabold text-white">
                  ✨ MBTI: {deep.mbti}
                </span>
              )}
            </div>

            {/* Astrology Big Three Badges */}
            {(deep.sunSign || deep.moonSign || deep.risingSign) && (
              <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-white/15">
                {deep.sunSign && (
                  <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-bold text-white">
                    <Sun className="h-3.5 w-3.5 text-white" /> Sun: {deep.sunSign}
                  </span>
                )}
                {deep.moonSign && (
                  <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-bold text-white">
                    <Moon className="h-3.5 w-3.5 text-white" /> Moon: {deep.moonSign}
                  </span>
                )}
                {deep.risingSign && (
                  <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] font-bold text-white">
                    <Sunrise className="h-3.5 w-3.5 text-white" /> Rising: {deep.risingSign}
                  </span>
                )}
              </div>
            )}

            <div className="mt-3 flex flex-col gap-2 pt-2">
              <div>
                <div className="flex justify-between text-[11.5px] font-semibold text-white">
                  <span>Reflective Curiosity</span>
                  <span>90% Confidence</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-white w-[90%] rounded-full" />
                </div>
              </div>
            </div>

            {deep.selfDescriptionOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “{deep.selfDescriptionOpen}”
              </p>
            )}
          </motion.div>

          {/* 6. WHAT MATTERS (VALUES CONSTELLATION ORBIT) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl"
          >
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4" />
              <h3 className="text-[15.5px] font-extrabold">06. What Matters</h3>
            </div>

            {/* Glowing Value Cloud */}
            <div className="mt-3 flex flex-wrap justify-center gap-2 py-1">
              {coreValuesList.map((val) => (
                <span
                  key={val}
                  className="rounded-full border border-white/30 bg-gradient-to-r from-white/20 to-white/10 px-3.5 py-1 text-[12.5px] font-bold text-white backdrop-blur-md shadow-md"
                >
                  ✨ {val}
                </span>
              ))}
            </div>

            {deep.respectPeopleOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “I really respect people who {deep.respectPeopleOpen}”
              </p>
            )}
          </motion.div>

          {/* 7. I'M INTO (CURIOSITY RABBIT HOLE TREE) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl"
          >
            <div className="flex items-center gap-2 text-white">
              <Flame className="h-4 w-4" />
              <h3 className="text-[15.5px] font-extrabold">07. I'm Into & Rabbit Holes</h3>
            </div>

            <div className="mt-3 rounded-[16px] border border-white/15 bg-white/10 p-3">
              <span className="text-[10px] font-bold text-white/70 uppercase">Current Rabbit Hole</span>
              <p className="mt-1 text-[13px] font-bold text-white">
                “{deep.currentRabbitHoleOpen || 'Japanese woodworking joints & specialty filter coffee roast notes.'}”
              </p>
            </div>

            {deep.talkForHoursOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “Could lose hours talking about {deep.talkForHoursOpen}”
              </p>
            )}
          </motion.div>

          {/* 8. OUTING DNA (ACTIVITY & VIBE VECTOR) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Layers className="h-4 w-4" />
                <h3 className="text-[15.5px] font-extrabold">08. Outing DNA</h3>
              </div>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white border border-white/30">
                Low-Key & Creative Outings
              </span>
            </div>

            {deep.instantYesOutingOpen && (
              <p className="mt-3.5 text-[13.5px] italic text-white/90 border-l-2 border-white/40 pl-3">
                “Instant Yes Outing: {deep.instantYesOutingOpen}”
              </p>
            )}
          </motion.div>

          {/* 9. YOU SHOULD KNOW (PROMPT VOICE CARDS) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl relative overflow-hidden"
          >
            <Quote className="absolute right-3 top-3 h-16 w-16 opacity-10 text-white pointer-events-none" />

            <div className="flex items-center gap-2 text-white">
              <User className="h-4 w-4" />
              <h3 className="text-[15.5px] font-extrabold">09. You Should Know</h3>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              <div className="rounded-[16px] border border-white/15 bg-black/40 p-3">
                <span className="text-[11px] font-bold text-white/70 uppercase">I'll probably like you if:</span>
                <p className="mt-1 text-[13.5px] text-white">“{deep.likeMeIfPrompt || 'You can switch from silly memes to deep topics in 5 mins.'}”</p>
              </div>
              <div className="rounded-[16px] border border-white/15 bg-black/40 p-3">
                <span className="text-[11px] font-bold text-white/70 uppercase">Quickest way to get me out:</span>
                <p className="mt-1 text-[13.5px] text-white">“{deep.quickestWayPrompt || 'Mention a quiet coffee walk or an invitation to a bookstore.'}”</p>
              </div>
            </div>
          </motion.div>

          {/* 10. BOUNDARIES & MATCHING (SECURITY SHIELD VECTOR) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl"
          >
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
                <p className="mt-0.5 text-[12.5px] font-bold text-white">{deep.punctualityPref || 'Essential'}</p>
              </div>
              <div className="rounded-[16px] border border-white/15 bg-white/10 p-2.5">
                <span className="text-[10px] font-bold text-white/70 uppercase">Cancellation</span>
                <p className="mt-0.5 text-[12.5px] font-bold text-white">{deep.cancellationStance || 'Notice Required'}</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* TRIBE STANDING GUIDE MODAL */}
        {isStandingGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="relative w-full max-w-[420px] max-h-[85vh] overflow-y-auto rounded-[28px] border border-white/20 bg-black/90 p-6 text-white shadow-2xl backdrop-blur-xl scrollbar-none">
              <div className="flex items-center justify-between pb-4 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-white" />
                  <h2 className="text-[18px] font-extrabold">Tribe Standing System</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStandingGuideOpen(false)}
                  className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-3 text-[13px] text-white/80 leading-relaxed">
                Tribe Standing is earned through authentic IRL participation, hosting reliability, and positive community history.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                {STANDING_LEVELS.map((level) => {
                  const isCurrent = level.key === currentStanding.key;
                  return (
                    <div
                      key={level.key}
                      className={`rounded-[20px] border p-4 transition-all ${
                        isCurrent
                          ? 'border-white bg-white/15 shadow-xl ring-1 ring-white/40'
                          : 'border-white/15 bg-black/50 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[22px] leading-none">{level.icon}</span>
                          <div>
                            <span className="text-[15px] font-extrabold text-white">{level.label}</span>
                            {isCurrent && (
                              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[9.5px] font-bold text-white uppercase border border-white/30">
                                Your Current Status
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 flex flex-col gap-1 text-[12.5px]">
                        <div>
                          <strong className="text-white/90">What it means:</strong>{' '}
                          <span className="text-white/80">{level.meaning}</span>
                        </div>
                        <div>
                          <strong className="text-white/90">How it's earned:</strong>{' '}
                          <span className="text-white/70">{level.howEarned}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-white/15">
                <Button variant="primary" size="sm" onClick={() => setIsStandingGuideOpen(false)} className="w-full">
                  Got It
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT PROFILE SETTINGS MODAL */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="relative w-full max-w-[400px] rounded-[28px] border border-white/20 bg-black/80 p-6 text-white shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/15">
                <h2 className="text-[18px] font-bold">Edit Profile Settings</h2>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="mt-4 flex flex-col gap-4">
                {/* Photo Preview & Custom Upload */}
                <div className="flex items-center gap-4">
                  <img
                    src={editPhoto}
                    alt="Preview"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div className="flex flex-col gap-1">
                    <label className="cursor-pointer text-[12.5px] font-bold text-white underline">
                      Upload Custom Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-white/60">
                      Upload any photo from your device
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[12.5px] font-semibold text-white/80">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 h-10 w-full rounded-[12px] border border-white/20 bg-black/60 px-3 text-[14px] text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[12.5px] font-semibold text-white/80">Home Area</label>
                  <input
                    type="text"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="mt-1 h-10 w-full rounded-[12px] border border-white/20 bg-black/60 px-3 text-[14px] text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[12.5px] font-semibold text-white/80">Bio</label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="mt-1 w-full rounded-[12px] border border-white/20 bg-black/60 p-2.5 text-[13.5px] text-white outline-none"
                  />
                </div>

                <div className="mt-2 flex gap-3 pt-2 border-t border-white/15">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setIsSettingsOpen(false)} className="w-1/2">
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="w-1/2">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
