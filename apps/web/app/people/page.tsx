'use client';

import React from 'react';
import Link from 'next/link';
import { IllustratedGround, Button } from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../supabase/seed/seed';
import { score } from '../../../../packages/core/matching/engine';
import { MapPin } from 'lucide-react';

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
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      <header className="pb-6 border-b border-[#F3F0E9]/12">
        <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
          Curated Batch · Singapore
        </span>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight text-[#F3F0E9]">
          This Week's People
        </h1>
        <p className="mt-1.5 text-[14px] text-[#A6AAA4] leading-relaxed">
          Surfaced based on your Friendship DNA and Singapore rhythm. No swiping.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-5">
        {surfacedMatches.map(({ candidate }) => {
          const interestsList = candidate.tagged_interests || candidate.interests || ['Coffee', 'Pottery', 'Art'];
          return (
            <Link key={candidate.profile.id} href={`/people/${candidate.profile.id}`}>
              <div className="group rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg transition-all hover:border-[#F3F0E9]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={candidate.profile.avatar_url || ''}
                      alt={candidate.profile.display_name}
                      className="h-14 w-14 rounded-full object-cover ring-1 ring-[#F3F0E9]/20"
                    />
                    <div>
                      <h2 className="text-[19px] font-bold text-[#F3F0E9]">
                        {candidate.profile.display_name}
                      </h2>
                      <span className="flex items-center text-[12.5px] text-[#A6AAA4]">
                        <MapPin className="mr-1 h-3.5 w-3.5" /> {candidate.profile.home_area} · Singapore
                      </span>
                    </div>
                  </div>

                  <span className="text-[12px] font-bold text-[#F3F0E9]">
                    Strong Fit →
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#F3F0E9]/10">
                  <span className="text-[12px] text-[#A6AAA4]">
                    {interestsList.slice(0, 3).join(' · ')}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </IllustratedGround>
  );
}
