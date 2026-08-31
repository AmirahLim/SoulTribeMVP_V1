'use client';

import React from 'react';
import Link from 'next/link';
import { IllustratedGround, Button, ResonanceRead } from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../supabase/seed/seed';
import { generateMatchExplanation } from '../../../../packages/core/explain/generator';
import { MapPin, Heart, Star, Coffee, Sparkles } from 'lucide-react';

export default function PeopleListPage() {
  const currentUser = SYNTHETIC_PROFILES[0]; // Priya Sharma
  // ONLY 1 REAL MATCH PROFILE (Marcus Tan) as requested by user ("remove all the bots profile. Maybe only have 1")
  const marcus = SYNTHETIC_PROFILES[1];
  const explanation = generateMatchExplanation(currentUser, marcus);

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      <header className="pb-6 border-b border-[#F3F0E9]/12">
        <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
          Curated Batch · 1 Real Match
        </span>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight text-[#F3F0E9]">
          This Week's Match
        </h1>
        <p className="mt-1.5 text-[14px] text-[#A6AAA4] leading-relaxed">
          Surfaced based on your Friendship DNA and Singapore rhythm. Zero bot profiles.
        </p>
      </header>

      {/* 2ND FRAME STYLE CARD FOR THE 1 MAIN MATCH PROFILE */}
      <div className="mt-6">
        <Link href={`/people/${marcus.profile.id}`}>
          <div className="group overflow-hidden rounded-[28px] border border-[#F3F0E9]/15 bg-[#15261C] shadow-xl transition-all hover:border-[#F3F0E9]/40">
            {/* Cinematic Image Cover */}
            <div className="relative h-64 w-full overflow-hidden bg-[#0D1D15]">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80"
                alt={marcus.profile.display_name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1D15] via-transparent to-transparent" />

              <div className="absolute top-3.5 left-3.5 rounded-full bg-[#0D1D15]/90 px-3 py-1 text-[10px] font-bold tracking-widest text-[#F3F0E9] uppercase backdrop-blur-sm border border-[#F3F0E9]/15">
                Top Match · 92% Rhythm Overlap
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-[24px] font-extrabold text-[#F3F0E9] tracking-tight">
                  {marcus.profile.display_name}
                </h2>
                <span className="flex items-center text-[13px] font-medium text-[#A6AAA4]">
                  <MapPin className="mr-1 h-3.5 w-3.5" /> {marcus.profile.home_area} · Singapore
                </span>
              </div>
            </div>

            {/* Content & Resonance Read */}
            <div className="p-5">
              <p className="text-[13.5px] leading-relaxed text-[#A6AAA4]">
                {marcus.profile.bio}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="flex items-center gap-1 rounded-full border border-[#F3F0E9]/12 bg-[#0D1D15] px-3 py-1 text-[12px] text-[#F3F0E9]">
                  <Coffee className="h-3 w-3" /> Specialty Coffee
                </span>
                <span className="flex items-center gap-1 rounded-full border border-[#F3F0E9]/12 bg-[#0D1D15] px-3 py-1 text-[12px] text-[#F3F0E9]">
                  <Sparkles className="h-3 w-3" /> Pottery
                </span>
              </div>

              <div className="mt-4 border-t border-[#F3F0E9]/10 pt-3.5">
                <ResonanceRead
                  clickText={explanation.click_text}
                  rubText={explanation.rub_text}
                />
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#F3F0E9]/10 pt-3.5">
                <span className="text-[12px] font-bold text-[#F3F0E9]">
                  View Full Match Profile →
                </span>
                <Button variant="primary" size="sm">
                  Open Profile
                </Button>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </IllustratedGround>
  );
}
