'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PitchCard, Button, ResonanceRead } from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../supabase/seed/seed';
import { generateMatchExplanation } from '../../../../packages/core/explain/generator';
import { motion } from 'framer-motion';
import { Plus, Users, MapPin, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import { getUserProfile, UserProfileData, getUserPitches, PitchedOuting, DEFAULT_PITCHES, DEFAULT_USER_PROFILE } from '../../lib/userStore';
import { getCandidatePeopleForCity } from '../../lib/peopleStore';

export default function HomeDashboardPage() {
  const [activeTab, setActiveTab] = useState<'fit' | 'outings' | 'pitches' | 'tribe'>('fit');
  const [profile, setProfileState] = useState<UserProfileData>(DEFAULT_USER_PROFILE);
  const [pitches, setPitchesState] = useState<PitchedOuting[]>(DEFAULT_PITCHES);

  useEffect(() => {
    setProfileState(getUserProfile());
    setPitchesState(getUserPitches());
  }, []);

  const currentUser = SYNTHETIC_PROFILES[0]; // Priya Sharma
  const marcus = SYNTHETIC_PROFILES[1]; // Marcus Tan (1 real match profile)
  const candidates = getCandidatePeopleForCity(profile.homeArea);
  const marcusCandidate = candidates[0]; // Marcus Tan candidate profile
  const explanation = generateMatchExplanation(currentUser, marcus);

  return (
    <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] pb-24">
      {/* PAGE CANVAS BACKGROUND: YOUR UPLOADED ARTSY GOLDEN-HOUR BUBBLES PHOTO */}
      <img
        src="/user-home-bg.jpg"
        alt="Home Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-80"
      />

      {/* Dark Ambient Vignette Overlay for Readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/95 z-0 pointer-events-none" />

      {/* PAGE CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-8">
        {/* DARK FOREST TOP BAR */}
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
                {profile.homeArea || 'Singapore'} Cohort
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
        <section className="py-6 border-b border-white/15">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              Tribal Pass Status
            </span>
            <span className="text-[12px] font-semibold text-white">
              {profile.passCompletionPct}% Complete
            </span>
          </div>

          <p className="mt-2.5 text-[15px] leading-relaxed text-white drop-shadow-sm">
            We’ve learned your social rhythm and communication style. 1 person looks like a strong fit.
          </p>

          {/* Minimal Hairline Data Points */}
          <div className="mt-4 flex items-center gap-6 text-[13px] text-white/80">
            <div><strong className="text-white font-bold">1</strong> Match</div>
            <div><strong className="text-white font-bold">{pitches.length}</strong> Pitched</div>
            <div><strong className="text-white font-bold">2</strong> Outings</div>
            <div><strong className="text-white font-bold">1</strong> Tribe</div>
          </div>
        </section>

        {/* LUXURY MINIMALIST SEGMENTED SWITCHER (4 TABS) */}
        <section className="mt-6">
          <div className="flex border-b border-white/15 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('fit')}
              className={`pb-3 pr-4 text-[13.5px] font-semibold transition-all whitespace-nowrap ${
                activeTab === 'fit'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Match (1)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pitches')}
              className={`px-4 pb-3 text-[13.5px] font-semibold transition-all whitespace-nowrap ${
                activeTab === 'pitches'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Pitches ({pitches.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('outings')}
              className={`px-4 pb-3 text-[13.5px] font-semibold transition-all whitespace-nowrap ${
                activeTab === 'outings'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Outings (2)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tribe')}
              className={`px-4 pb-3 text-[13.5px] font-semibold transition-all whitespace-nowrap ${
                activeTab === 'tribe'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Your Tribe (1)
            </button>
          </div>
        </section>

        {/* TAB 1: 1 REAL MATCH CANDIDATE (MARCUS TAN) */}
        {activeTab === 'fit' && (
          <section className="mt-6 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[24px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl"
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

        {/* TAB 2: PITCHED OUTINGS & WHO JOINED */}
        {activeTab === 'pitches' && (
          <section className="mt-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                  Pitched Proposals
                </span>
                <h3 className="text-[18px] font-bold text-white">
                  Your Hosted Pitches
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
                className="overflow-hidden rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-5 shadow-2xl"
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                    Pitched Outing Proposal
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
                            <span className="rounded-full bg-white text-black text-[9.5px] font-extrabold px-1.5 py-0.5 uppercase">Host</span>
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

        {/* TAB 3: OUTINGS */}
        {activeTab === 'outings' && (
          <section className="mt-6 flex flex-col gap-6">
            <PitchCard
              id="out-101"
              title="Saturday Pottery & Filter Coffee"
              pitch="Let's spend two hours throwing clay at a local studio, followed by a quiet filter coffee to talk properly."
              area={profile.homeArea || 'Singapore'}
              dateTime="Sat 14 Sep · 3:00pm"
              hostName="Priya Sharma"
              hostAvatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              seatsTotal={6}
              seatsFilled={4}
              category="creative"
              orientation="conversation"
              imageUrl="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80"
              onPitchClick={() => {}}
            />

            <PitchCard
              id="out-102"
              title="Sunday Morning Botanical Walk & Matcha"
              pitch="A gentle 5km loop around Botanic Gardens at 8am before the heat hits, followed by iced matcha."
              area={profile.homeArea || 'Singapore'}
              dateTime="Sun 15 Sep · 8:00am"
              hostName="Marcus Tan"
              hostAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
              seatsTotal={6}
              seatsFilled={3}
              category="active"
              orientation="balanced"
              imageUrl="https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80"
              onPitchClick={() => {}}
            />
          </section>
        )}

        {/* TAB 4: YOUR TRIBE */}
        {activeTab === 'tribe' && (
          <section className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-[20px] border border-white/20 bg-black/60 backdrop-blur-xl p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <img
                  src={marcus.profile.avatar_url || ''}
                  alt={marcus.profile.display_name}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-[15px] font-bold text-white">
                    {marcus.profile.display_name}
                  </h4>
                  <p className="text-[12px] text-white/80">
                    Connected · 2 Outings Shared
                  </p>
                </div>
              </div>

              <span className="text-[12px] font-bold text-white bg-white/20 px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
                Established Bond
              </span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
