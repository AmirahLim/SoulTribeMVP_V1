'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SYNTHETIC_PROFILES } from '../../../../supabase/seed/seed';
import { score } from '../../../../packages/core/matching/engine';
import { generateMatchExplanation } from '../../../../packages/core/explain/generator';
import { ArrowLeft, MoreVertical, X, Star, Heart, Coffee, Sparkles, BookOpen, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PeopleListPage() {
  const currentUser = SYNTHETIC_PROFILES[0]; // Priya Sharma
  const [candidateIdx, setCandidateIdx] = useState(0);

  // Curated batch of real matches
  const batchCandidates = [SYNTHETIC_PROFILES[1], SYNTHETIC_PROFILES[2], SYNTHETIC_PROFILES[3]];
  const currentCandidate = batchCandidates[candidateIdx % batchCandidates.length];

  const matchResult = score(currentUser, currentCandidate);
  const explanation = generateMatchExplanation(currentUser, currentCandidate);

  const [starred, setStarred] = useState(false);
  const [connected, setConnected] = useState(false);

  // Exact artsy, golden-hour motion-blur images uploaded by user!
  const heroPhotos = [
    '/user-community.jpg',
    '/user-community-2.png',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1000&auto=format&fit=crop&q=80',
  ];
  const activePhoto = heroPhotos[candidateIdx % heroPhotos.length];

  const galleryPhotos = [
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  ];

  const handleNextCandidate = () => {
    setCandidateIdx((prev) => (prev + 1) % batchCandidates.length);
    setConnected(false);
    setStarred(false);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0D1D15] text-[#FFFDF9]">
      {/* 2ND FRAME SPEC: FULL-SCREEN ARTSY GOLDEN-HOUR MOTION PHOTO BACKGROUND */}
      <AnimatePresence mode="wait">
        <motion.img
          key={activePhoto}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          src={activePhoto}
          alt={currentCandidate.profile.display_name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* Dark Ambient Vignette Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/90" />

      {/* 2ND FRAME SPEC: TOP TRANSPARENT NAVIGATION BAR */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-5 pt-8">
        <Link
          href="/home"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">
            Curated Batch ({candidateIdx + 1}/{batchCandidates.length})
          </span>
          <h2 className="text-[17px] font-bold text-white tracking-tight drop-shadow-md">
            This Week's People
          </h2>
        </div>

        <button
          type="button"
          onClick={handleNextCandidate}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20"
          title="Next Match"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </header>

      {/* 2ND FRAME SPEC: OVERLAID CONTENT (ABOUT ME, INTERESTS, THUMBNAILS) */}
      <main className="absolute bottom-24 left-5 right-5 z-30 flex flex-col gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCandidate.profile.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
          >
            {/* ABOUT ME SECTION */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[26px] font-extrabold text-white tracking-tight leading-none drop-shadow-md">
                    {currentCandidate.profile.display_name}
                  </h1>
                  <p className="mt-1 flex items-center text-[12.5px] font-semibold text-white/80">
                    <MapPin className="mr-1 h-3.5 w-3.5" /> {currentCandidate.profile.home_area} · Singapore
                  </p>
                </div>

                <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white border border-white/30 backdrop-blur-md">
                  Strong Fit
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-[14px] font-bold text-white tracking-tight">
                  About Me
                </h3>
                <p className="mt-1 max-w-[340px] text-[13.5px] font-normal leading-[20px] text-white/90 drop-shadow-sm">
                  {currentCandidate.profile.bio || "Singapore-based. Looking for genuine, intentional friendships. I love quiet weekend wandering, pottery throwing, and deep conversations over filter coffee."}
                </p>
              </div>
            </div>

            {/* INTERESTS SECTION (GLASS CHIPS) */}
            <div>
              <h3 className="text-[14px] font-bold text-white tracking-tight">
                Interests
              </h3>
              <div className="mt-2 flex flex-wrap gap-2.5">
                <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-4 py-1.5 text-[12.5px] font-medium text-white backdrop-blur-md">
                  <Coffee className="h-3.5 w-3.5" /> Coffee
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-4 py-1.5 text-[12.5px] font-medium text-white backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" /> Ceramics
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-4 py-1.5 text-[12.5px] font-medium text-white backdrop-blur-md">
                  <BookOpen className="h-3.5 w-3.5" /> Reading
                </span>
              </div>
            </div>

            {/* RESONANCE READ SUMMARY */}
            <div className="rounded-[18px] border border-white/20 bg-black/40 p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">
                Why You Might Click
              </span>
              <p className="mt-0.5 text-[13px] text-white font-medium">
                {explanation.click_text}
              </p>
            </div>

            {/* PHOTO THUMBNAILS ROW */}
            <div className="flex items-center gap-3 pt-0.5">
              {galleryPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-[16px] border border-white/25 bg-black/40 shadow-lg"
                >
                  <img src={photo} alt="Gallery preview" className="h-full w-full object-cover" />
                  {idx === 2 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[13px] font-bold text-white backdrop-blur-xs">
                      10+
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 2ND FRAME SPEC: FLOATING BOTTOM ACTION BUTTONS (PASS, STAR, LIKE) */}
      <div className="absolute bottom-6 left-0 right-0 z-40 flex items-center justify-center">
        <div className="flex items-center justify-center gap-5">
          {/* Pass / Next Candidate */}
          <button
            type="button"
            onClick={handleNextCandidate}
            className="flex h-13 w-13 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shadow-xl"
            title="Next Candidate"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Star Action (★) */}
          <button
            type="button"
            onClick={() => setStarred(!starred)}
            className={`flex h-13 w-13 items-center justify-center rounded-full border backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shadow-xl ${
              starred
                ? 'border-white bg-white text-black'
                : 'border-white/30 bg-black/50 text-white'
            }`}
            title="Star Match"
          >
            <Star className="h-6 w-6 fill-current" />
          </button>

          {/* Like / Connect Action (♥) */}
          <button
            type="button"
            onClick={() => setConnected(!connected)}
            className={`flex h-13 w-13 items-center justify-center rounded-full border backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shadow-xl ${
              connected
                ? 'border-white bg-white text-black'
                : 'border-white/30 bg-black/50 text-white'
            }`}
            title="Connect"
          >
            <Heart className="h-6 w-6 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
