'use client';

import React from 'react';
import Link from 'next/link';
import { Button, ResonanceRead } from '@soul-tribe/ui';
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

  // Individual natural human portrait photos for each candidate
  const candidatePhotos: Record<string, string> = {
    'Marcus Tan': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    'Maya Lin': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    'Chen Wei': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0D1D15] text-[#FFFDF9] pb-24">
      {/* PAGE BACKGROUND: YOUR UPLOADED ARTSY GOLDEN-HOUR MOTION PHOTO (INSTEAD OF SOLID GREEN) */}
      <img
        src="/user-community.jpg"
        alt="Page Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-40"
      />

      {/* Dark Ambient Vignette Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      {/* PAGE CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-8">
        {/* EDITORIAL HEADER: THIS WEEK'S PEOPLE */}
        <header className="pb-6 border-b border-white/15">
          <span className="text-[11px] font-bold tracking-widest text-[#A6AAA4] uppercase">
            Curated Batch · Singapore
          </span>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-white drop-shadow-md">
            This Week's People
          </h1>
          <p className="mt-1.5 text-[14px] text-white/80 leading-relaxed max-w-[340px]">
            Surfaced based on your Friendship DNA and Singapore rhythm. No swiping.
          </p>
        </header>

        {/* CURATED MATCHES BATCH LISTING */}
        <div className="mt-6 flex flex-col gap-6">
          {surfacedMatches.map(({ candidate, explanation }) => {
            const photo = candidatePhotos[candidate.profile.display_name] || candidatePhotos['Marcus Tan'];
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
                  <div className="group overflow-hidden rounded-[28px] border border-white/20 bg-black/40 backdrop-blur-xl shadow-2xl transition-all hover:border-white/50">
                    {/* Candidate's Individual Cover Image */}
                    <div className="relative h-64 w-full overflow-hidden bg-black/30">
                      <img
                        src={photo}
                        alt={candidate.profile.display_name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                      <div className="absolute top-3.5 left-3.5 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase backdrop-blur-md border border-white/20">
                        Strong Fit · 90% Rhythm Overlap
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-[24px] font-extrabold text-white tracking-tight drop-shadow-md">
                          {candidate.profile.display_name}
                        </h2>
                        <span className="flex items-center text-[13px] font-medium text-white/80">
                          <MapPin className="mr-1 h-3.5 w-3.5" /> {candidate.profile.home_area} · Singapore
                        </span>
                      </div>
                    </div>

                    {/* Content & Resonance Read */}
                    <div className="p-5">
                      <p className="text-[13.5px] leading-relaxed text-white/90">
                        {candidate.profile.bio || "Singapore-based. Interested in intentional friendships, quiet weekend coffee, and ceramic craft."}
                      </p>

                      <div className="mt-3.5 flex flex-wrap gap-2">
                        {safeInterests.slice(0, 3).map((interest, idx) => (
                          <span key={idx} className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[12px] font-medium text-white backdrop-blur-md">
                            <Coffee className="h-3 w-3 text-white/80" /> {interest}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 border-t border-white/15 pt-3.5">
                        <ResonanceRead
                          clickText={explanation.click_text}
                          rubText={explanation.rub_text}
                        />
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-3.5">
                        <span className="text-[12.5px] font-bold text-white">
                          View Candidate Profile →
                        </span>
                        <Button variant="primary" size="sm">
                          Open Profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
