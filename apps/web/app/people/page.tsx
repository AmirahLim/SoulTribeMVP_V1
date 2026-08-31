'use client';

import React from 'react';
import Link from 'next/link';
import { IllustratedGround, Bloom, Button } from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../supabase/seed/seed';
import { score } from '../../../../packages/core/matching/engine';
import { MapPin, Sparkles } from 'lucide-react';

export default function PeopleListPage() {
  const currentUser = SYNTHETIC_PROFILES[0]; // Priya Sharma

  const surfacedMatches = SYNTHETIC_PROFILES.slice(1)
    .map((candidate) => ({
      candidate,
      matchResult: score(currentUser, candidate),
    }))
    .filter((m) => !m.matchResult.gated)
    .sort((a, b) => b.matchResult.rank_score - a.matchResult.rank_score)
    .slice(0, 5);

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-20">
      <header className="py-4">
        <span className="text-[12px] font-semibold tracking-wider text-[#D9663F] uppercase">
          Curated Weekly Batch
        </span>
        <h1
          className="mt-1 text-[32px] font-semibold text-[#2B211B]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          This Week's People
        </h1>
        <p className="mt-1 text-[14px] text-[#5C4E44]">
          5 people surfaced based on your Friendship DNA and Singapore rhythm. No swiping.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-4">
        {surfacedMatches.map(({ candidate, matchResult }) => (
          <Link key={candidate.profile.id} href={`/people/${candidate.profile.id}`}>
            <div className="group relative overflow-hidden rounded-[24px] border border-[#2B211B]/10 bg-[#FFFDFA] p-5 shadow-[0_2px_4px_rgba(74,55,42,.06),0_8px_24px_-12px_rgba(74,55,42,.18)] transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={candidate.profile.avatar_url || ''}
                    alt={candidate.profile.display_name}
                    className="h-16 w-16 rounded-full object-cover shadow-sm"
                  />
                  <div>
                    <h2 className="text-[20px] font-semibold text-[#2B211B]">
                      {candidate.profile.display_name.split(' ')[0]}
                    </h2>
                    <span className="flex items-center text-[13px] text-[#8A7D73]">
                      <MapPin className="mr-1 h-3.5 w-3.5" /> {candidate.profile.home_area}
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
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
              </div>

              <p className="mt-3 text-[15px] leading-[22px] text-[#5C4E44]">
                "{candidate.profile.bio}"
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-[#2B211B]/10 pt-3">
                <span className="flex items-center text-[12px] font-medium text-[#3E6B5C]">
                  <Sparkles className="mr-1 h-3.5 w-3.5" /> High Rhythm Alignment
                </span>
                <span className="text-[13px] font-semibold text-[#D9663F] group-hover:underline">
                  Read Resonance →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </IllustratedGround>
  );
}
