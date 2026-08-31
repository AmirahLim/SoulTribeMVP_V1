'use client';

import React from 'react';
import Link from 'next/link';
import { Button, ResonanceRead } from '@soul-tribe/ui';
import { CANDIDATE_PEOPLE } from '../../lib/peopleStore';
import { MapPin, Coffee, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PeopleListPage() {
  return (
    <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] pb-24">
      {/* PAGE CANVAS BACKGROUND */}
      <img
        src="/user-artsy-1.jpg"
        alt="Artsy Golden Hour Motion Canvas"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-80"
      />

      {/* Dark Ambient Vignette Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/95 z-0 pointer-events-none" />

      {/* PAGE CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-8">
        {/* EDITORIAL HEADER: THIS WEEK'S PEOPLE */}
        <header className="pb-6 border-b border-white/15">
          <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
            Curated Batch · Singapore
          </span>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-white drop-shadow-md">
            This Week's People
          </h1>
          <p className="mt-1.5 text-[14px] text-white/90 leading-relaxed max-w-[340px] drop-shadow-sm">
            Surfaced based on your Friendship DNA and Singapore rhythm. No swiping.
          </p>
        </header>

        {/* CURATED MATCHES BATCH LISTING */}
        <div className="mt-6 flex flex-col gap-6">
          {CANDIDATE_PEOPLE.map((person) => {
            return (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link href={`/people/${person.id}`}>
                  <div className="group overflow-hidden rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl shadow-2xl transition-all hover:border-white/50">
                    {/* Candidate's Individual Portrait Image */}
                    <div className="relative h-64 w-full overflow-hidden bg-black/40">
                      <img
                        src={person.avatarUrl}
                        alt={person.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                      <div className="absolute top-3.5 left-3.5 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase backdrop-blur-md border border-white/20">
                        {person.fitLabel} · {person.rhythmOverlap}% Rhythm Overlap
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-[24px] font-extrabold text-white tracking-tight drop-shadow-md">
                          {person.name}
                        </h2>
                        <span className="flex items-center text-[13px] font-medium text-white/80">
                          <MapPin className="mr-1 h-3.5 w-3.5" /> {person.homeArea}
                        </span>
                      </div>
                    </div>

                    {/* Content & Resonance Read */}
                    <div className="p-5">
                      <p className="text-[13.5px] leading-relaxed text-white/90">
                        {person.bio}
                      </p>

                      <div className="mt-3.5 flex flex-wrap gap-2">
                        {person.interests.map((interest, idx) => (
                          <span key={idx} className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[12px] font-medium text-white backdrop-blur-md">
                            <Coffee className="h-3 w-3 text-white/80" /> {interest}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 border-t border-white/15 pt-3.5">
                        <ResonanceRead
                          clickText={person.clickText}
                          rubText={person.rubText}
                        />
                      </div>

                      <div className="mt-5 flex items-center justify-end border-t border-white/15 pt-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-bold text-black shadow-md transition-transform group-hover:scale-105">
                          Open Profile <ArrowRight className="h-3.5 w-3.5" />
                        </span>
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
