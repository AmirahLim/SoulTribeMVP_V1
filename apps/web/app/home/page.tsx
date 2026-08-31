'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PitchCard, Button, ResonanceRead } from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../supabase/seed/seed';
import { generateMatchExplanation } from '../../../../packages/core/explain/generator';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { getUserProfile, UserProfileData } from '../../lib/userStore';

export default function HomeDashboardPage() {
  const [activeTab, setActiveTab] = useState<'fit' | 'outings' | 'tribe'>('fit');
  const [profile, setProfileState] = useState<UserProfileData>({
    displayName: 'You',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    homeArea: 'Tiong Bahru',
    bio: '',
    passCompletionPct: 85,
  });

  useEffect(() => {
    setProfileState(getUserProfile());
  }, []);

  const currentUser = SYNTHETIC_PROFILES[0]; // Priya Sharma
  const marcus = SYNTHETIC_PROFILES[1]; // Marcus Tan (1 real match profile)
  const explanation = generateMatchExplanation(currentUser, marcus);

  return (
    <div className="relative min-h-screen w-full bg-[#0D1D15] text-[#FFFDF9] pb-24">
      {/* PAGE CANVAS BACKGROUND: YOUR UPLOADED ARTSY GOLDEN-HOUR TRAMPOLINE PHOTO */}
      <img
        src="/user-home-bg.jpg"
        alt="Home Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-45"
      />

      {/* Dark Ambient Vignette Overlay for Readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

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
            <div><strong className="text-white font-bold">1</strong> Strong Match</div>
            <div><strong className="text-white font-bold">2</strong> Active Outings</div>
            <div><strong className="text-white font-bold">1</strong> Established Bond</div>
          </div>
        </section>

        {/* LUXURY MINIMALIST SEGMENTED SWITCHER */}
        <section className="mt-6">
          <div className="flex border-b border-white/15">
            <button
              type="button"
              onClick={() => setActiveTab('fit')}
              className={`pb-3 pr-6 text-[14px] font-semibold transition-all ${
                activeTab === 'fit'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Match (1)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('outings')}
              className={`px-6 pb-3 text-[14px] font-semibold transition-all ${
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
              className={`px-6 pb-3 text-[14px] font-semibold transition-all ${
                activeTab === 'tribe'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Your Tribe (1)
            </button>
          </div>
        </section>

        {/* TAB CONTENT: 1 REAL MATCH CANDIDATE (MARCUS TAN) */}
        {activeTab === 'fit' && (
          <section className="mt-6 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[24px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={marcus.profile.avatar_url || ''}
                    alt={marcus.profile.display_name}
                    className="h-12 w-12 rounded-full object-cover ring-1 ring-white/30"
                  />
                  <div>
                    <h3 className="text-[18px] font-bold text-white">
                      {marcus.profile.display_name}
                    </h3>
                    <p className="text-[12.5px] text-white/80">
                      {marcus.profile.home_area} · Singapore
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

                <Link href={`/people/${marcus.profile.id}`}>
                  <Button variant="secondary" size="sm">
                    View Full Profile →
                  </Button>
                </Link>
              </div>
            </motion.div>
          </section>
        )}

        {/* TAB CONTENT: OUTINGS */}
        {activeTab === 'outings' && (
          <section className="mt-6 flex flex-col gap-6">
            <PitchCard
              id="out-101"
              title="Saturday Pottery & Filter Coffee"
              pitch="Let's spend two hours throwing clay at Tiong Bahru Studios, followed by a quiet filter coffee to talk properly."
              area="Tiong Bahru"
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
              area="Tanglin"
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

        {/* TAB CONTENT: YOUR TRIBE */}
        {activeTab === 'tribe' && (
          <section className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-[20px] border border-white/20 bg-black/50 backdrop-blur-xl p-4 shadow-2xl">
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
