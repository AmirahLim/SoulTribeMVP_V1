'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ResonanceRead } from '@soul-tribe/ui';
import { getUserProfile } from '../../lib/userStore';
import { getRankedMatches, RankedMatch } from '../../lib/matching';
import { getGenderAvatarForName } from '@soul-tribe/core';
import { MapPin, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PeopleListPage() {
  const [city, setCity] = useState('Singapore');
  const [matches, setMatches] = useState<RankedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true);
        const user = getUserProfile();
        if (user.homeArea) setCity(user.homeArea);
        const ranked = await getRankedMatches(user, { limit: 6 });
        setMatches(ranked);
        setError(null);
      } catch (err) {
        console.error('Failed to calculate matches:', err);
        setError('Unable to load matches right now. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

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
            Curated Batch · {city}
          </span>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-white drop-shadow-md">
            This Week's People
          </h1>
          <p className="mt-1.5 text-[14px] text-white/90 leading-relaxed max-w-[340px] drop-shadow-sm">
            Surfaced based on your Friendship DNA and {city} rhythm. No swiping.
          </p>
        </header>

        {/* LOADING STATE */}
        {loading && (
          <div className="mt-12 flex flex-col items-center justify-center p-8 rounded-[24px] border border-white/15 bg-black/60 backdrop-blur-xl">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <p className="mt-4 text-[14px] font-medium text-white/80">Calculating Friendship DNA Resonance...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="mt-12 flex flex-col items-center text-center p-8 rounded-[24px] border border-red-500/30 bg-black/70 backdrop-blur-xl">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <h3 className="mt-3 text-[18px] font-bold text-white">Match Calculation Error</h3>
            <p className="mt-1.5 text-[13.5px] text-white/80 leading-relaxed">{error}</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && matches.length === 0 && (
          <div className="mt-12 flex flex-col items-center text-center p-8 rounded-[28px] border border-white/20 bg-black/70 backdrop-blur-xl shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-[24px] border border-white/20">
              ✨
            </div>
            <h3 className="mt-4 text-[20px] font-extrabold text-white">No matches yet</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-white/80 max-w-[300px]">
              Complete more of your Social DNA pass so the engine can calculate intentional compatibility.
            </p>
            <Link href="/you/deeper" className="mt-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-bold text-black shadow-lg transition-transform hover:scale-105">
                <Sparkles className="h-4 w-4" /> Deepen Your Pass
              </span>
            </Link>
          </div>
        )}

        {/* CURATED MATCHES BATCH LISTING */}
        {!loading && !error && matches.length > 0 && (
          <div className="mt-6 flex flex-col gap-6">
            {matches.map((person) => {
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
                          src={getGenderAvatarForName(person.name)}
                          alt={person.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start">
                          <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase backdrop-blur-md border border-white/20">
                            {person.fitLabel} · {Math.round(person.rankScore * 100)}% Resonance
                          </span>
                          {person.provisional && (
                            <span className="rounded-full bg-amber-500/80 px-2.5 py-0.5 text-[9.5px] font-extrabold tracking-wide text-black uppercase backdrop-blur-md">
                              Early Match — Complete pass for details
                            </span>
                          )}
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
        )}
      </div>
    </div>
  );
}
