'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IllustratedGround,
  RhythmStrip,
  PitchCard,
  Bloom,
  SocialDnaBars,
  Button,
} from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../supabase/seed/seed';
import { score } from '../../../../packages/core/matching/engine';
import { generateMatchExplanation } from '../../../../packages/core/explain/generator';
import { Plus, Sparkles, MapPin, Clock, ShieldCheck, ArrowRight, Users, Heart } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'people' | 'outings' | 'history'>('people');
  const currentUser = SYNTHETIC_PROFILES[0]; // Priya Sharma

  // Top surfaced matches
  const surfacedMatches = SYNTHETIC_PROFILES.slice(1)
    .map((candidate) => {
      const matchResult = score(currentUser, candidate);
      const explanation = generateMatchExplanation(currentUser, candidate);
      return {
        candidate,
        matchResult,
        explanation,
      };
    })
    .filter((m) => !m.matchResult.gated)
    .sort((a, b) => b.matchResult.rank_score - a.matchResult.rank_score)
    .slice(0, 6);

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.profile.avatar_url || ''}
            alt={currentUser.profile.display_name}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-[#C85A32]/30"
          />
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#7A6B5F] uppercase">
              <span>Singapore</span>
              <span>·</span>
              <span className="text-[#C85A32]">Tiong Bahru</span>
            </div>
            <h1 className="text-[20px] font-extrabold tracking-tight text-[#3D2E24]">
              {currentUser.profile.display_name.split(' ')[0]}
            </h1>
          </div>
        </div>

        <Link href="/outings/pitch">
          <button
            type="button"
            className="flex items-center gap-1 rounded-full bg-[#C85A32] px-3.5 py-1.5 text-[12.5px] font-bold text-[#FFFDF9] shadow-sm transition-all hover:bg-[#a84723]"
          >
            <Plus className="h-4 w-4" /> Pitch Outing
          </button>
        </Link>
      </header>

      {/* EXACT USER-SPECIFIED CLEAN TRIBAL PASS STATUS CARD */}
      <section className="mt-4 rounded-[28px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-5 shadow-[0_8px_24px_-6px_rgba(61,46,36,0.06)]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider text-[#C85A32] uppercase">
            Tribal Pass Status
          </span>
          <span className="rounded-full bg-[#C85A32]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#C85A32]">
            72% Complete
          </span>
        </div>

        <h2 className="mt-2 text-[20px] font-extrabold tracking-tight text-[#3D2E24]">
          Your Tribal Pass is 72% complete.
        </h2>

        <p className="mt-1 text-[13.5px] font-medium leading-[20px] text-[#4A3B30]">
          We’ve learned more about your social rhythm and communication style.
        </p>

        {/* Clean Metrics Grid */}
        <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
          <div className="rounded-[18px] bg-[#F8F3ED] p-3">
            <span className="text-[18px] font-extrabold text-[#C85A32]">6</span>
            <p className="mt-0.5 text-[11px] font-bold text-[#7A6B5F]">Strong Fit</p>
          </div>

          <div className="rounded-[18px] bg-[#F8F3ED] p-3">
            <span className="text-[18px] font-extrabold text-[#2E5345]">3</span>
            <p className="mt-0.5 text-[11px] font-bold text-[#7A6B5F]">Outings Free</p>
          </div>

          <div className="rounded-[18px] bg-[#F8F3ED] p-3">
            <span className="text-[18px] font-extrabold text-[#D69336]">4</span>
            <p className="mt-0.5 text-[11px] font-bold text-[#7A6B5F]">New Bonds</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#3D2E24]/08 pt-3">
          <span className="text-[12px] font-medium text-[#7A6B5F]">
            You’ve built 4 new bonds this month.
          </span>
          <Link href="/onboarding" className="text-[12px] font-bold text-[#C85A32] hover:underline">
            Complete Pass →
          </Link>
        </div>
      </section>

      {/* Segmented Switcher */}
      <section className="mt-5">
        <div className="flex w-full items-center rounded-full border border-[#3D2E24]/08 bg-[#FFFDF9] p-1 shadow-sm">
          {(
            [
              ['people', 'Strong Fit'],
              ['outings', 'Outings'],
              ['history', 'Your Tribe'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex-1 rounded-full py-2 text-[12.5px] font-bold transition-all ${
                activeTab === key
                  ? 'bg-[#3D2E24] text-[#FFFDF9] shadow-sm'
                  : 'text-[#7A6B5F] hover:text-[#3D2E24]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* TAB CONTENT 1: STRONG FIT MATCHES */}
      {activeTab === 'people' && (
        <section className="mt-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#7A6B5F] uppercase tracking-wider">
              6 People Look Like A Strong Fit
            </span>
            <Link href="/people" className="text-[12px] font-bold text-[#C85A32] hover:underline">
              View All →
            </Link>
          </div>

          <div className="flex gap-3.5 overflow-x-auto pb-2 pt-1">
            {surfacedMatches.map(({ candidate }) => (
              <div
                key={candidate.profile.id}
                className="min-w-[270px] max-w-[280px] flex-shrink-0 overflow-hidden rounded-[28px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-4.5 shadow-[0_8px_24px_-6px_rgba(61,46,36,0.06)]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={candidate.profile.avatar_url || ''}
                    alt={candidate.profile.display_name}
                    className="h-12 w-12 rounded-full object-cover shadow-sm ring-2 ring-[#C85A32]/20"
                  />
                  <div>
                    <h3 className="text-[16px] font-bold text-[#3D2E24]">
                      {candidate.profile.display_name.split(' ')[0]}
                    </h3>
                    <p className="flex items-center text-[12px] font-medium text-[#7A6B5F]">
                      <MapPin className="mr-1 h-3 w-3 text-[#C85A32]" /> {candidate.profile.home_area}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[13.5px] font-medium leading-[20px] text-[#4A3B30] line-clamp-2">
                  "{candidate.profile.bio}"
                </p>

                <div className="my-2 flex justify-center">
                  <Bloom
                    dimensions={[
                      { key: 'p', label: 'P', strength: candidate.personality.openness, confidence: candidate.profile.confidence, sentence: '' },
                      { key: 'c', label: 'C', strength: candidate.communication.contact_frequency_self, confidence: candidate.profile.confidence, sentence: '' },
                      { key: 'r', label: 'R', strength: candidate.social_rhythm.planning_horizon, confidence: candidate.profile.confidence, sentence: '' },
                      { key: 'i', label: 'I', strength: candidate.intent.depth / 4, confidence: candidate.profile.confidence, sentence: '' },
                      { key: 'e', label: 'E', strength: candidate.emotional.er_opening_pace, confidence: candidate.profile.confidence, sentence: '' },
                      { key: 'int', label: 'Int', strength: 0.7, confidence: candidate.profile.confidence, sentence: '' },
                      { key: 'v', label: 'V', strength: 0.8, confidence: candidate.profile.confidence, sentence: '' },
                      { key: 'l', label: 'L', strength: candidate.lifestyle.budget_band / 4, confidence: candidate.profile.confidence, sentence: '' },
                    ]}
                    size={80}
                    interactive={false}
                  />
                </div>

                <Link href={`/people/${candidate.profile.id}`}>
                  <button
                    type="button"
                    className="mt-1 w-full rounded-[14px] bg-[#EFE5D8] py-2 text-[13px] font-bold text-[#3D2E24] hover:bg-[#e2d5c4]"
                  >
                    Read Fit & Resonance
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB CONTENT 2: OUTINGS */}
      {activeTab === 'outings' && (
        <section className="mt-5 flex flex-col gap-3">
          <div className="rounded-[20px] border border-[#2E5345]/20 bg-[#E1E8E3] p-3 text-[13px] font-medium text-[#2E5345]">
            ✨ <strong>3 outings match your weekend rhythm this Saturday.</strong>
          </div>

          <PitchCard
            title="Saturday Pottery & Filter Coffee"
            pitch="Let's spend two hours throwing clay at Tiong Bahru Studios, followed by a quiet filter coffee to talk properly."
            hostName="Marcus Tan"
            hostAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            dateTime="Sat 14 Sep · 3:00pm"
            location="Tiong Bahru"
            budget="$20–50"
            orientation="Conversation-first"
            totalSeats={6}
            filledSeats={4}
            actionText="Join Outing"
            onAction={() => alert("Viewing Marcus Tan's Outing Proposal")}
          />
        </section>
      )}

      {/* TAB CONTENT 3: YOUR TRIBE & BONDS */}
      {activeTab === 'history' && (
        <section className="mt-5 flex flex-col gap-3">
          <div className="overflow-hidden rounded-[28px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-[#2E5345] uppercase">
                Your Tribe · 4 Established Bonds
              </span>
              <span className="text-[11px] font-bold text-[#7A6B5F]">Katong</span>
            </div>

            <h3 className="mt-1 text-[17px] font-bold text-[#3D2E24]">
              Katong Peranakan Walk & Tea
            </h3>

            <p className="mt-2 text-[14px] leading-[21px] text-[#4A3B30] italic">
              "Discovered the quiet courtyard behind the vintage shop and agreed that four people is the ideal group size."
            </p>

            <Link href="/timeline" className="mt-3 block text-[12px] font-bold text-[#C85A32] hover:underline">
              View Tribe History Timeline →
            </Link>
          </div>
        </section>
      )}

      {/* YOUR WEEKEND RHYTHM */}
      <section className="mt-8">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-[#3D2E24]">
            Your Weekend Rhythm Matrix
          </h2>
          <span className="text-[12px] font-bold text-[#C85A32]">3 Outings Free</span>
        </div>

        <RhythmStrip
          userAvailability={currentUser.social_rhythm.availability}
          interactive={false}
        />
      </section>
    </IllustratedGround>
  );
}
