'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IllustratedGround,
  PitchCard,
  Button,
} from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../supabase/seed/seed';
import { score } from '../../../../packages/core/matching/engine';
import { generateMatchExplanation } from '../../../../packages/core/explain/generator';
import { motion } from 'framer-motion';
import { MapPin, Plus, ArrowRight } from 'lucide-react';
import { getUserProfile, UserProfileData } from '../../lib/userStore';

export default function HomeDashboardPage() {
  const [activeTab, setActiveTab] = useState<'fit' | 'outings' | 'tribe'>('fit');
  const [profile, setProfileState] = useState<UserProfileData>({
    displayName: 'You',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    homeArea: 'Tiong Bahru',
    bio: '',
    passCompletionPct: 72,
  });

  useEffect(() => {
    setProfileState(getUserProfile());
  }, []);

  const currentUser = SYNTHETIC_PROFILES[0]; // Priya Sharma

  // Surface top candidate matches
  const surfacedMatches = SYNTHETIC_PROFILES.slice(1)
    .map((candidate) => ({
      candidate,
      matchResult: score(currentUser, candidate),
      explanation: generateMatchExplanation(currentUser, candidate),
    }))
    .sort((a, b) => b.matchResult.score - a.matchResult.score);

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      {/* DARK FOREST TOP BAR */}
      <header className="flex items-center justify-between pb-6 border-b border-[#F3F0E9]/12">
        <div className="flex items-center gap-3">
          <Link href="/you">
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-11 w-11 rounded-full object-cover ring-1 ring-[#F3F0E9]/30"
            />
          </Link>
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
              Singapore Cohort
            </span>
            <h1 className="text-[22px] font-bold text-[#F3F0E9] tracking-tight">
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
      <section className="py-6 border-b border-[#F3F0E9]/12">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
            Tribal Pass Status
          </span>
          <span className="text-[12px] font-semibold text-[#F3F0E9]">
            {profile.passCompletionPct}% Complete
          </span>
        </div>

        <p className="mt-2.5 text-[15px] leading-relaxed text-[#F3F0E9]">
          We’ve learned your social rhythm and communication style. 6 people look like a strong fit.
        </p>

        {/* Minimal Hairline Data Points */}
        <div className="mt-4 flex items-center gap-6 text-[13px] text-[#A6AAA4]">
          <div><strong className="text-[#F3F0E9] font-bold">6</strong> Strong Fit</div>
          <div><strong className="text-[#F3F0E9] font-bold">3</strong> Outings Free</div>
          <div><strong className="text-[#F3F0E9] font-bold">4</strong> New Bonds</div>
        </div>
      </section>

      {/* LUXURY MINIMALIST SEGMENTED SWITCHER */}
      <section className="mt-6">
        <div className="flex border-b border-[#F3F0E9]/12">
          <button
            type="button"
            onClick={() => setActiveTab('fit')}
            className={`pb-3 pr-6 text-[14px] font-semibold transition-all ${
              activeTab === 'fit'
                ? 'text-[#F3F0E9] border-b-2 border-[#F3F0E9]'
                : 'text-[#A6AAA4] hover:text-[#F3F0E9]'
            }`}
          >
            Strong Fit (6)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outings')}
            className={`px-6 pb-3 text-[14px] font-semibold transition-all ${
              activeTab === 'outings'
                ? 'text-[#F3F0E9] border-b-2 border-[#F3F0E9]'
                : 'text-[#A6AAA4] hover:text-[#F3F0E9]'
            }`}
          >
            Outings (3)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tribe')}
            className={`px-6 pb-3 text-[14px] font-semibold transition-all ${
              activeTab === 'tribe'
                ? 'text-[#F3F0E9] border-b-2 border-[#F3F0E9]'
                : 'text-[#A6AAA4] hover:text-[#F3F0E9]'
            }`}
          >
            Your Tribe (4)
          </button>
        </div>
      </section>

      {/* TAB CONTENT: STRONG FIT CANDIDATES */}
      {activeTab === 'fit' && (
        <section className="mt-6 flex flex-col gap-6">
          {surfacedMatches.slice(0, 3).map(({ candidate, explanation }) => {
            const interestsList = candidate.tagged_interests || candidate.interests || ['Coffee', 'Pottery', 'Art'];
            return (
              <motion.div
                key={candidate.profile.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={candidate.profile.avatar_url || ''}
                      alt={candidate.profile.display_name}
                      className="h-12 w-12 rounded-full object-cover ring-1 ring-[#F3F0E9]/20"
                    />
                    <div>
                      <h3 className="text-[18px] font-bold text-[#F3F0E9]">
                        {candidate.profile.display_name}
                      </h3>
                      <p className="text-[12.5px] text-[#A6AAA4]">
                        {candidate.profile.home_area} · Singapore
                      </p>
                    </div>
                  </div>

                  <span className="text-[12px] font-bold text-[#F3F0E9]">
                    Strong Fit
                  </span>
                </div>

                {/* Editorial Resonance Read */}
                <div className="mt-4 border-t border-[#F3F0E9]/10 pt-3.5">
                  <span className="text-[10px] font-bold tracking-widest text-[#8F998D] uppercase">
                    Why You Might Click
                  </span>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-[#F3F0E9]">
                    {explanation.click_text}
                  </p>

                  <span className="mt-3 block text-[10px] font-bold tracking-widest text-[#A6AAA4] uppercase">
                    Where You Might Rub
                  </span>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-[#A6AAA4]">
                    {explanation.rub_text}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#F3F0E9]/10">
                  <span className="text-[12px] text-[#A6AAA4]">
                    {interestsList.slice(0, 3).join(' · ')}
                  </span>

                  <Link href={`/people/${candidate.profile.id}`}>
                    <Button variant="secondary" size="sm">
                      View Tribal Pass →
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
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
          {SYNTHETIC_PROFILES.slice(1, 5).map((member) => (
            <div
              key={member.profile.id}
              className="flex items-center justify-between rounded-[20px] border border-[#F3F0E9]/12 bg-[#15261C] p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={member.profile.avatar_url || ''}
                  alt={member.profile.display_name}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-[15px] font-bold text-[#F3F0E9]">
                    {member.profile.display_name}
                  </h4>
                  <p className="text-[12px] text-[#A6AAA4]">
                    Connected · 2 Outings Shared
                  </p>
                </div>
              </div>

              <span className="text-[12px] font-bold text-[#F3F0E9]">
                Established Bond
              </span>
            </div>
          ))}
        </section>
      )}
    </IllustratedGround>
  );
}
