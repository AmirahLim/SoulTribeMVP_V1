'use client';

import React from 'react';
import Link from 'next/link';
import { IllustratedGround, Button, ResonanceRead } from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../supabase/seed/seed';
import { score } from '../../../../packages/core/matching/engine';
import { generateMatchExplanation } from '../../../../packages/core/explain/generator';
import { MapPin, Coffee, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PeopleListPage() {
  const currentUser = SYNTHETIC_PROFILES[0]; // Priya Sharma

  // Surface top curated matches for "This Week's People"
  const surfacedMatches = [SYNTHETIC_PROFILES[1], SYNTHETIC_PROFILES[2], SYNTHETIC_PROFILES[3]].map((candidate) => ({
    candidate,
    matchResult: score(currentUser, candidate),
    explanation: generateMatchExplanation(currentUser, candidate),
  }));

  // Real, natural human candid photos for each person
  const heroPhotos: Record<string, string> = {
    'Marcus Tan': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&auto=format&fit=crop&q=80',
    'Maya Lin': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80',
    'Chen Wei': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1000&auto=format&fit=crop&q=80',
  };

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      {/* ORIGINAL EDITORIAL HEADER: THIS WEEK'S PEOPLE */}
      <header className="pb-6 border-b border-[#F3F0E9]/12">
        <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
          Curated Batch · Singapore
        </span>
        <h1 className="mt-1 text-[28px] font-bold tracking-tight text-[#F3F0E9]">
          This Week's People
        </h1>
        <p className="mt-1.5 text-[14px] text-[#A6AAA4] leading-relaxed max-w-[340px]">
          Surfaced based on your Friendship DNA and Singapore rhythm. No swiping.
        </p>
      </header>

      {/* CURATED MATCHES BATCH LISTING */}
      <div className="mt-6 flex flex-col gap-6">
        {surfacedMatches.map(({ candidate, explanation }) => {
          const photo = heroPhotos[candidate.profile.display_name] || heroPhotos['Marcus Tan'];
          const rawInterests = candidate.tagged_interests || candidate.interests || [];
          const interestsList = (Array.isArray(rawInterests) ? rawInterests : []).map((item) =>
            typeof item === 'string' ? item : (item as any)?.node_name || 'Specialty Coffee'
          );
          const safeInterests = interestsList.length > 0 ? interestsList : ['Specialty Coffee', 'Ceramics', 'Bookshops'];

          return (
            <motion.div
              key={candidate.profile.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href={`/people/${candidate.profile.id}`}>
                <div className="group relative overflow-hidden rounded-[28px] border border-[#F3F0E9]/20 shadow-2xl transition-all hover:border-[#F3F0E9]/50">
                  {/* Natural Human Portrait Photo */}
                  <img
                    src={photo}
                    alt={candidate.profile.display_name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Dark Vignette Overlay for Crisp White Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />

                  {/* Content Container Overlaid on Natural Human Photo */}
                  <div className="relative z-10 p-6 flex flex-col justify-between min-h-[320px]">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold tracking-widest text-[#F3F0E9] uppercase backdrop-blur-md border border-[#F3F0E9]/20">
                          Strong Fit · 90% Rhythm Overlap
                        </span>
                        <span className="flex items-center text-[12px] font-semibold text-white/90 drop-shadow-sm">
                          <MapPin className="mr-1 h-3.5 w-3.5" /> {candidate.profile.home_area}
                        </span>
                      </div>

                      <h2 className="mt-3 text-[26px] font-extrabold text-white tracking-tight leading-none drop-shadow-md">
                        {candidate.profile.display_name}
                      </h2>

                      <p className="mt-2 text-[13.5px] leading-relaxed text-white/90 font-normal drop-shadow-sm line-clamp-2">
                        {candidate.profile.bio || "Singapore-based. Interested in intentional friendships, quiet weekend coffee, and ceramic craft."}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                      {/* Glass Chips */}
                      <div className="flex flex-wrap gap-2">
                        {safeInterests.slice(0, 3).map((interest, idx) => (
                          <span key={idx} className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3.5 py-1 text-[12px] font-medium text-white backdrop-blur-md">
                            <Coffee className="h-3 w-3" /> {interest}
                          </span>
                        ))}
                      </div>

                      {/* Resonance Read */}
                      <div className="rounded-[18px] border border-white/20 bg-black/40 p-3.5 backdrop-blur-md">
                        <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">
                          Why You Might Click
                        </span>
                        <p className="mt-0.5 text-[13px] text-white font-medium">
                          {explanation.click_text}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[12.5px] font-bold text-white drop-shadow-sm">
                          Open Candidate Profile →
                        </span>
                        <Button variant="primary" size="sm">
                          View Profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </IllustratedGround>
  );
}
