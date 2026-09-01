'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PitchCard, Button, ResonanceRead } from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../supabase/seed/seed';
import { generateMatchExplanation } from '../../../../packages/core/explain/generator';
import { motion } from 'framer-motion';
import { Plus, Users, MapPin, Calendar, CheckCircle2, Sparkles, Compass, Radio, Ticket } from 'lucide-react';
import { getUserProfile, UserProfileData, getUserPitches, PitchedOuting, DEFAULT_PITCHES, DEFAULT_USER_PROFILE } from '../../lib/userStore';
import { getCandidatePeopleForCity } from '../../lib/peopleStore';

import { AuthGuard } from '../../components/AuthGuard';

export default function HomeDashboardPage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}

function HomeContent() {
  // Tabs: Matches | Your Pitches | Going | On Your Radar
  const [activeTab, setActiveTab] = useState<'matches' | 'pitches' | 'going' | 'radar'>('matches');
  const [profile, setProfileState] = useState<UserProfileData>(DEFAULT_USER_PROFILE);
  const [pitches, setPitchesState] = useState<PitchedOuting[]>(DEFAULT_PITCHES);
  const [radarJoined, setRadarJoined] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setProfileState(getUserProfile());
    setPitchesState(getUserPitches());
  }, []);

  const currentUser = SYNTHETIC_PROFILES[0]; // Priya Sharma
  const marcus = SYNTHETIC_PROFILES[1]; // Marcus Tan (1 real match profile)
  const candidates = getCandidatePeopleForCity(profile.homeArea);
  const marcusCandidate = candidates[0]; // Marcus Tan candidate profile
  const explanation = generateMatchExplanation(currentUser, marcus);

  const handleToggleRadarJoin = (id: string) => {
    setRadarJoined((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] pb-24">
      {/* PAGE CANVAS BACKGROUND */}
      <img
        src="/user-home-bg.jpg"
        alt="Home Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-80"
      />

      {/* Dark Ambient Vignette Overlay for Readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/95 z-0 pointer-events-none" />

      {/* PAGE CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-8">
        {/* TOP BAR */}
        <header className="flex items-center justify-between pb-6 border-b border-white/15">
          <div className="flex items-center gap-3">
            <Link href="/you">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-white/30"
              />
            </Link>
            <div>
              <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                Singapore Cohort
              </span>
              <h1 className="text-[22px] font-extrabold text-white tracking-tight drop-shadow-md">
                Hey, {profile.displayName}
              </h1>
            </div>
          </div>

          <Link href="/outings/pitch">
            <Button variant="primary" size="sm">
              <Plus className="mr-1 h-4 w-4" /> Pitch Outing
            </Button>
          </Link>
        </header>

        {/* TRIBAL PASS EDITORIAL SUMMARY */}
        <section className="py-5 border-b border-white/15">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              Tribal Pass Status
            </span>
            <span className="text-[12px] font-semibold text-white">
              {profile.passCompletionPct}% Complete
            </span>
          </div>

          <p className="mt-2 text-[14.5px] leading-relaxed text-white drop-shadow-sm">
            We’ve learned your social rhythm and communication style. 1 person looks like a strong fit.
          </p>

          {/* Minimal Hairline Data Points */}
          <div className="mt-3.5 flex items-center gap-5 text-[12.5px] text-white/80">
            <div><strong className="text-white font-bold">1</strong> Match</div>
            <div><strong className="text-white font-bold">{pitches.length}</strong> Pitched</div>
            <div><strong className="text-white font-bold">2</strong> Going</div>
            <div><strong className="text-white font-bold">3</strong> On Radar</div>
          </div>
        </section>

        {/* SEGMENTED TAB SWITCHER (Matches | Your Pitches | Going | On Your Radar) */}
        <section className="mt-5">
          <div className="flex border-b border-white/15 overflow-x-auto scrollbar-none gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('matches')}
              className={`pb-3 pr-3 text-[13px] font-semibold transition-all whitespace-nowrap ${
                activeTab === 'matches'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Matches (1)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pitches')}
              className={`px-3 pb-3 text-[13px] font-semibold transition-all whitespace-nowrap ${
                activeTab === 'pitches'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Your Pitches ({pitches.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('going')}
              className={`px-3 pb-3 text-[13px] font-semibold transition-all whitespace-nowrap ${
                activeTab === 'going'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Going (2)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={`px-3 pb-3 text-[13px] font-semibold transition-all text-left leading-tight ${
                activeTab === 'radar'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              On your<br />radar (3)
            </button>
          </div>
        </section>

        {/* TAB 1: MATCHES */}
        {activeTab === 'matches' && (
          <section className="mt-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                  Matched Connections
                </span>
                <h3 className="text-[18px] font-bold text-white">
                  People Matched With You
                </h3>
              </div>
              <span className="text-[12px] text-white/70">1 Matched Profile</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[24px] border border-white/20 bg-black/65 backdrop-blur-xl p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={marcusCandidate.avatarUrl}
                    alt={marcusCandidate.name}
                    className="h-12 w-12 rounded-full object-cover ring-1 ring-white/30"
                  />
                  <div>
                    <h3 className="text-[18px] font-bold text-white">
                      {marcusCandidate.name}
                    </h3>
                    <p className="text-[12.5px] text-white/80">
                      {marcusCandidate.homeArea}
                    </p>
                  </div>
                </div>

                <span className="text-[12px] font-bold text-white bg-white/20 px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
                  Strong Match
                </span>
              </div>

              {/* Editorial Resonance Read */}
              <div className="mt-4 border-t border-white/15 pt-3.5">
                <ResonanceRead
                  clickText={explanation.click_text}
                  rubText={explanation.rub_text}
                />
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/15">
                <span className="text-[12px] text-white/80">
                  Specialty Coffee · Pottery · Books
                </span>

                <Link href={`/people/${marcusCandidate.id}`}>
                  <Button variant="secondary" size="sm">
                    View Full Profile →
                  </Button>
                </Link>
              </div>
            </motion.div>
          </section>
        )}

        {/* TAB 2: YOUR PITCHES */}
        {activeTab === 'pitches' && (
          <section className="mt-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                  Pitched Proposals
                </span>
                <h3 className="text-[18px] font-bold text-white">
                  Pitches You Sent Out
                </h3>
              </div>

              <Link href="/outings/pitch">
                <Button variant="primary" size="sm">
                  <Plus className="mr-1 h-3.5 w-3.5" /> Pitch New
                </Button>
              </Link>
            </div>

            {pitches.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-[28px] border border-white/20 bg-black/65 backdrop-blur-xl p-5 shadow-2xl"
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                    Your Hosted Pitch
                  </span>
                  <span className="text-[12px] font-bold text-white bg-white/20 px-3 py-1 rounded-full border border-white/30">
                    {item.seatsFilled} / {item.seatsTotal} Seats Filled
                  </span>
                </div>

                {/* Title & Pitch */}
                <h2 className="mt-3 text-[20px] font-extrabold text-white">
                  {item.title}
                </h2>
                <p className="mt-1.5 text-[13.5px] text-white/90 leading-relaxed">
                  “{item.pitch}”
                </p>

                {/* Area, Time & Cohesion Readout */}
                <div className="mt-4 flex items-center justify-between border-t border-b border-white/15 py-3 text-[12.5px] text-white/80">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-white" />
                    <span>{item.area}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-white" />
                    <span>{item.dateTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                    <span>{item.cohesionScore}/100 Cohesion</span>
                  </div>
                </div>

                {/* WHO JOINED / GUEST ROSTER */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                      Who Joined ({item.joinedGuests.length + 1} Members)
                    </span>
                    <span className="text-[11.5px] text-white/70">
                      Cap: 6 Seats Max
                    </span>
                  </div>

                  {/* Joined Guests List */}
                  <div className="mt-3 flex flex-col gap-2.5">
                    {/* Host item */}
                    <div className="flex items-center justify-between rounded-[16px] border border-white/20 bg-white/10 p-2.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.hostAvatar}
                          alt={item.hostName}
                          className="h-9 w-9 rounded-full object-cover ring-1 ring-white/30"
                        />
                        <div>
                          <h4 className="text-[13.5px] font-bold text-white flex items-center gap-1.5">
                            {item.hostName}
                            <span className="rounded-full bg-white text-black text-[9.5px] font-extrabold px-1.5 py-0.5 uppercase">You (Host)</span>
                          </h4>
                          <span className="text-[11px] text-white/70">{profile.homeArea} · Organizer</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-white flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" /> Confirmed
                      </span>
                    </div>

                    {/* Guest Items */}
                    {item.joinedGuests.map((guest) => (
                      <div
                        key={guest.id}
                        className="flex items-center justify-between rounded-[16px] border border-white/15 bg-black/40 p-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={guest.avatarUrl}
                            alt={guest.name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="text-[13.5px] font-bold text-white">
                              {guest.name}
                            </h4>
                            <span className="text-[11px] text-white/70">
                              {guest.homeArea} · Joined
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold text-white flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-white/80" /> {guest.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </section>
        )}

        {/* TAB 3: GOING (Events / Pitches User Is Attending) */}
        {activeTab === 'going' && (
          <section className="mt-6 flex flex-col gap-5">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                Attending Outings
              </span>
              <h3 className="text-[18px] font-bold text-white">
                Events & Pitches You’re Attending
              </h3>
              <p className="mt-1 text-[13px] text-white/70">
                Other members' pitches where your seat is confirmed.
              </p>
            </div>

            {/* Event 1 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[28px] border border-white/20 bg-black/65 backdrop-blur-xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300 backdrop-blur-md flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Seat Confirmed
                </span>
                <span className="text-[12px] font-bold text-white bg-white/20 px-3 py-1 rounded-full border border-white/30">
                  3 / 6 Seats Filled
                </span>
              </div>

              <div>
                <h3 className="text-[19px] font-extrabold text-white">
                  Sunday Morning Botanical Walk & Matcha
                </h3>
                <p className="mt-1.5 text-[13.5px] text-white/90 leading-relaxed">
                  “A gentle 5km loop around Botanic Gardens at 8am before the heat hits, followed by iced matcha.”
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-b border-white/15 py-3 text-[12.5px] text-white/80">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                  <span>Botanic Gardens, SG</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-white" />
                  <span>Sun 15 Sep · 8:00am</span>
                </div>
              </div>

              {/* Host & Attendees */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    alt="Marcus Tan"
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-white/30"
                  />
                  <span className="text-[12.5px] text-white">
                    Pitched by <strong className="font-bold">Marcus Tan</strong>
                  </span>
                </div>

                <Link href="/outings/out-102">
                  <Button variant="secondary" size="sm">
                    View Record →
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Event 2 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-[28px] border border-white/20 bg-black/65 backdrop-blur-xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300 backdrop-blur-md flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Seat Confirmed
                </span>
                <span className="text-[12px] font-bold text-white bg-white/20 px-3 py-1 rounded-full border border-white/30">
                  4 / 6 Seats Filled
                </span>
              </div>

              <div>
                <h3 className="text-[19px] font-extrabold text-white">
                  Katong Peranakan Walk & Tea
                </h3>
                <p className="mt-1.5 text-[13.5px] text-white/90 leading-relaxed">
                  “Exploring vintage shophouses and quiet courtyards in Katong followed by traditional tea.”
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-b border-white/15 py-3 text-[12.5px] text-white/80">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                  <span>Katong, Singapore</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-white" />
                  <span>Sat 21 Sep · 2:30pm</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                    alt="Maya Lin"
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-white/30"
                  />
                  <span className="text-[12.5px] text-white">
                    Pitched by <strong className="font-bold">Maya Lin</strong>
                  </span>
                </div>

                <Link href="/outings/out-103">
                  <Button variant="secondary" size="sm">
                    View Record →
                  </Button>
                </Link>
              </div>
            </motion.div>
          </section>
        )}

        {/* TAB 4: ON YOUR RADAR (Suggested Pitches & Events) */}
        {activeTab === 'radar' && (
          <section className="mt-6 flex flex-col gap-5">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                Curated Recommendations
              </span>
              <h3 className="text-[18px] font-bold text-white leading-tight">
                On your<br />radar
              </h3>
              <p className="mt-1 text-[13px] text-white/70">
                Suggested pitches and events suited to your social rhythm & interests.
              </p>
            </div>

            {/* Radar Item 1 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[28px] border border-white/20 bg-black/65 backdrop-blur-xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> 94% Rhythm Fit
                </span>
                <span className="text-[11.5px] font-bold text-white/70">
                  Quiet & Intimate
                </span>
              </div>

              <div>
                <h3 className="text-[19px] font-extrabold text-white">
                  Analog Vinyl Listening & Filter Coffee
                </h3>
                <p className="mt-1.5 text-[13.5px] text-white/90 leading-relaxed">
                  “Bringing 3 vintage jazz & soul records to sample on a valve amp while trying micro-lot pour overs.”
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-b border-white/15 py-3 text-[12.5px] text-white/80">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                  <span>Tiong Bahru, SG</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-white" />
                  <span>Fri 20 Sep · 7:00pm</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                    alt="Sarah Chen"
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-white/30"
                  />
                  <span className="text-[12.5px] text-white">
                    Pitched by <strong className="font-bold">Sarah Chen</strong>
                  </span>
                </div>

                <Button
                  variant={radarJoined['radar-1'] ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleRadarJoin('radar-1')}
                >
                  {radarJoined['radar-1'] ? 'Joined ✓' : 'Join Pitch →'}
                </Button>
              </div>
            </motion.div>

            {/* Radar Item 2 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-[28px] border border-white/20 bg-black/65 backdrop-blur-xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1 text-[11px] font-bold text-indigo-300 backdrop-blur-md flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> 88% Activity Fit
                </span>
                <span className="text-[11.5px] font-bold text-white/70">
                  Small Group (Max 6)
                </span>
              </div>

              <div>
                <h3 className="text-[19px] font-extrabold text-white">
                  Sunday Morning Bouldering & Acai Bowls
                </h3>
                <p className="mt-1.5 text-[13.5px] text-white/90 leading-relaxed">
                  “Casual indoor bouldering session for all experience levels, followed by fresh acai bowls next door.”
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-b border-white/15 py-3 text-[12.5px] text-white/80">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                  <span>Kallang, SG</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-white" />
                  <span>Sun 22 Sep · 10:00am</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
                    alt="Daniel K."
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-white/30"
                  />
                  <span className="text-[12.5px] text-white">
                    Pitched by <strong className="font-bold">Daniel K.</strong>
                  </span>
                </div>

                <Button
                  variant={radarJoined['radar-2'] ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleRadarJoin('radar-2')}
                >
                  {radarJoined['radar-2'] ? 'Joined ✓' : 'Join Pitch →'}
                </Button>
              </div>
            </motion.div>

            {/* Radar Item 3 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[28px] border border-white/20 bg-black/65 backdrop-blur-xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-rose-400/40 bg-rose-500/20 px-3 py-1 text-[11px] font-bold text-rose-300 backdrop-blur-md flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> 92% Curiosity Fit
                </span>
                <span className="text-[11.5px] font-bold text-white/70">
                  Intimate (Max 4)
                </span>
              </div>

              <div>
                <h3 className="text-[19px] font-extrabold text-white">
                  Late Afternoon Indie Bookshop Crawl
                </h3>
                <p className="mt-1.5 text-[13.5px] text-white/90 leading-relaxed">
                  “Browsing second-hand art and poetry books across 3 quiet stores in Bras Basah, ending with coffee.”
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-b border-white/15 py-3 text-[12.5px] text-white/80">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                  <span>Bras Basah, SG</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-white" />
                  <span>Sat 27 Sep · 4:00pm</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
                    alt="Elena R."
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-white/30"
                  />
                  <span className="text-[12.5px] text-white">
                    Pitched by <strong className="font-bold">Elena R.</strong>
                  </span>
                </div>

                <Button
                  variant={radarJoined['radar-3'] ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleRadarJoin('radar-3')}
                >
                  {radarJoined['radar-3'] ? 'Joined ✓' : 'Join Pitch →'}
                </Button>
              </div>
            </motion.div>
          </section>
        )}
      </div>
    </div>
  );
}
