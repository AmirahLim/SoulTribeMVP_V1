'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IllustratedGround,
  RhythmStrip,
  PitchCard,
  Bloom,
  SocialDnaBars,
  Button,
  Chip,
} from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../supabase/seed/seed';
import { score } from '../../../../packages/core/matching/engine';
import { generateMatchExplanation } from '../../../../packages/core/explain/generator';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Calendar, Users, ArrowRight, ShieldCheck, Plus, Check } from 'lucide-react';
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
      {/* OPAL SLEEK TOP BAR */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link href="/you">
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-[#C85A32]"
            />
          </Link>
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#C85A32] uppercase">
              Singapore Cohort
            </span>
            <h1 className="text-[20px] font-extrabold tracking-tight text-[#1C2B22]">
              Hey, {profile.displayName}
            </h1>
          </div>
        </div>

        <Link
          href="/outings/pitch"
          className="flex items-center gap-1.5 rounded-full bg-[#1C3A27] px-3.5 py-2 text-[12px] font-bold text-[#FFFDF9] shadow-sm transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" /> Pitch Outing
        </Link>
      </header>

      {/* OPAL STATS SUMMARY CARD */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-4 rounded-[28px] border border-[#1C3A27]/08 bg-[#FFFDF9] p-5 shadow-[0_8px_24px_-6px_rgba(28,58,39,0.06)]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-[#C85A32] uppercase">
            Tribal Pass · {profile.passCompletionPct}% Complete
          </span>
          <span className="rounded-full bg-[#1C3A27]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#1C3A27]">
            Active Pass
          </span>
        </div>

        <p className="mt-2 text-[14px] font-medium leading-[21px] text-[#3A4D42]">
          We’ve learned more about your social rhythm and communication style. 6 people look like a strong fit.
        </p>

        {/* OPAL METRIC PILLS */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center rounded-[18px] border border-[#1C3A27]/08 bg-[#F6F1EA] p-2.5 text-center">
            <span className="text-[16px] font-extrabold text-[#1C2B22]">6</span>
            <span className="text-[10px] font-bold text-[#6E7F75]">Strong Fit</span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-[18px] border border-[#1C3A27]/08 bg-[#F6F1EA] p-2.5 text-center">
            <span className="text-[16px] font-extrabold text-[#C85A32]">3</span>
            <span className="text-[10px] font-bold text-[#6E7F75]">Outings Free</span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-[18px] border border-[#1C3A27]/08 bg-[#F6F1EA] p-2.5 text-center">
            <span className="text-[16px] font-extrabold text-[#1C3A27]">4</span>
            <span className="text-[10px] font-bold text-[#6E7F75]">New Bonds</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#1C3A27]/06 text-[12px] font-bold text-[#3A4D42]">
          <span>You’ve built 4 new bonds this month.</span>
          <Link href="/you" className="text-[#C85A32] hover:underline">
            View Pass →
          </Link>
        </div>
      </motion.section>

      {/* OPAL PILL SEGMENTED CONTROL SWITCHER */}
      <section className="mt-5">
        <div className="flex rounded-full border border-[#1C3A27]/10 bg-[#EBDDD0]/80 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('fit')}
            className={`flex-1 rounded-full py-2.5 text-[13px] font-bold transition-all ${
              activeTab === 'fit'
                ? 'bg-[#FFFDF9] text-[#1C2B22] shadow-sm'
                : 'text-[#6E7F75] hover:text-[#1C2B22]'
            }`}
          >
            Strong Fit (6)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outings')}
            className={`flex-1 rounded-full py-2.5 text-[13px] font-bold transition-all ${
              activeTab === 'outings'
                ? 'bg-[#FFFDF9] text-[#1C2B22] shadow-sm'
                : 'text-[#6E7F75] hover:text-[#1C2B22]'
            }`}
          >
            Outings (3)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tribe')}
            className={`flex-1 rounded-full py-2.5 text-[13px] font-bold transition-all ${
              activeTab === 'tribe'
                ? 'bg-[#FFFDF9] text-[#1C2B22] shadow-sm'
                : 'text-[#6E7F75] hover:text-[#1C2B22]'
            }`}
          >
            Your Tribe (4)
          </button>
        </div>
      </section>

      {/* TAB CONTENT: STRONG FIT CANDIDATES */}
      {activeTab === 'fit' && (
        <section className="mt-4 flex flex-col gap-4">
          {surfacedMatches.slice(0, 3).map(({ candidate, explanation }) => (
            <motion.div
              key={candidate.profile.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[28px] border border-[#1C3A27]/08 bg-[#FFFDF9] p-5 shadow-[0_8px_24px_-6px_rgba(28,58,39,0.06)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={candidate.profile.avatar_url || ''}
                    alt={candidate.profile.display_name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-[#1C3A27]/15"
                  />
                  <div>
                    <h3 className="text-[17px] font-extrabold text-[#1C2B22]">
                      {candidate.profile.display_name}
                    </h3>
                    <p className="flex items-center text-[12px] font-medium text-[#6E7F75]">
                      <MapPin className="mr-1 h-3.5 w-3.5 text-[#C85A32]" />
                      {candidate.profile.home_area} · Singapore
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-[#1C3A27]/10 px-3 py-1 text-[11px] font-bold text-[#1C3A27]">
                  Strong Fit
                </span>
              </div>

              {/* RESONANCE COPY & FRICTION */}
              <div className="mt-3.5 rounded-[18px] border border-[#1C3A27]/08 bg-[#F6F1EA] p-3.5">
                <span className="text-[10px] font-bold tracking-wider text-[#C85A32] uppercase">
                  Why You Might Click
                </span>
                <p className="mt-1 text-[13px] font-medium leading-[19px] text-[#1C2B22]">
                  {explanation.click_text}
                </p>

                <span className="mt-3 block text-[10px] font-bold tracking-wider text-[#3A4D42] uppercase">
                  Where You Might Rub
                </span>
                <p className="mt-1 text-[13px] font-medium leading-[19px] text-[#3A4D42]">
                  {explanation.rub_text}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between pt-1">
                <span className="text-[12px] font-bold text-[#6E7F75]">
                  {candidate.tagged_interests.slice(0, 3).join(' · ')}
                </span>

                <Link href={`/people/${candidate.profile.id}`}>
                  <Button variant="primary" size="sm">
                    View Tribal Pass <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      {/* TAB CONTENT: OUTINGS */}
      {activeTab === 'outings' && (
        <section className="mt-4 flex flex-col gap-4">
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
            onPitchClick={() => {}}
          />
        </section>
      )}

      {/* TAB CONTENT: YOUR TRIBE */}
      {activeTab === 'tribe' && (
        <section className="mt-4 flex flex-col gap-3">
          {SYNTHETIC_PROFILES.slice(1, 5).map((member) => (
            <div
              key={member.profile.id}
              className="flex items-center justify-between rounded-[22px] border border-[#1C3A27]/08 bg-[#FFFDF9] p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={member.profile.avatar_url || ''}
                  alt={member.profile.display_name}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-[15px] font-extrabold text-[#1C2B22]">
                    {member.profile.display_name}
                  </h4>
                  <p className="text-[12px] font-medium text-[#6E7F75]">
                    Connected · 2 Outings Shared
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-[#1C3A27] px-3 py-1 text-[11px] font-bold text-[#FFFDF9]">
                Established Bond
              </span>
            </div>
          ))}
        </section>
      )}
    </IllustratedGround>
  );
}
