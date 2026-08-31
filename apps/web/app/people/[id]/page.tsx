'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SYNTHETIC_PROFILES } from '../../../../../supabase/seed/seed';
import { generateMatchExplanation } from '../../../../../packages/core/explain/generator';
import { ArrowLeft, MoreVertical, X, Star, Heart, Coffee, Sparkles, BookOpen, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const personId = params.id as string;

  const currentUser = SYNTHETIC_PROFILES[0]; // Priya
  const person = SYNTHETIC_PROFILES.find((p) => p.profile.id === personId) || SYNTHETIC_PROFILES[1];

  const [connected, setConnected] = useState(false);
  const [starred, setStarred] = useState(false);

  const explanation = generateMatchExplanation(currentUser, person);

  const heroPhoto = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&auto=format&fit=crop&q=80';
  const galleryPhotos = [
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0D1D15] text-[#FFFDF9]">
      {/* 2ND FRAME SPEC: FULL-SCREEN CINEMATIC PORTRAIT PHOTO BACKGROUND */}
      <img
        src={heroPhoto}
        alt={person.profile.display_name}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dark Ambient Vignette Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/90" />

      {/* 2ND FRAME SPEC: TOP TRANSPARENT NAVIGATION BAR */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-5 pt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h2 className="text-[18px] font-bold text-white tracking-tight drop-shadow-md">
          Make Matches
        </h2>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </header>

      {/* 2ND FRAME SPEC: FLOATING GLASSMOPHIC CONTENT SHEET (NEAR BOTTOM) */}
      <main className="absolute bottom-24 left-4 right-4 z-30">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 rounded-[32px] border border-white/20 bg-black/40 p-5 backdrop-blur-xl shadow-2xl"
        >
          {/* Candidate Name & Match Badge */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[26px] font-extrabold text-white tracking-tight leading-none drop-shadow-sm">
                {person.profile.display_name}
              </h1>
              <p className="mt-1 flex items-center text-[13px] font-medium text-white/80">
                <MapPin className="mr-1 h-3.5 w-3.5" /> {person.profile.home_area} · Singapore
              </p>
            </div>

            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white border border-white/30 backdrop-blur-md">
              Strong Fit
            </span>
          </div>

          {/* ABOUT ME */}
          <div>
            <h3 className="text-[14px] font-bold text-white tracking-tight">
              About Me
            </h3>
            <p className="mt-1 text-[13.5px] leading-relaxed text-white/90 font-normal">
              {person.profile.bio || "Specialty coffee enthusiast and ceramic craft lover. Always up for quiet weekend exploration, long conversations, and discovering new filter coffee spots in Tiong Bahru."}
            </p>
          </div>

          {/* INTERESTS GLASS CHIPS */}
          <div>
            <h3 className="text-[14px] font-bold text-white tracking-tight">
              Interests
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold text-white backdrop-blur-md">
                <Coffee className="h-3.5 w-3.5" /> Coffee
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold text-white backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" /> Pottery
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold text-white backdrop-blur-md">
                <BookOpen className="h-3.5 w-3.5" /> Reading
              </span>
            </div>
          </div>

          {/* PHOTO THUMBNAIL STRIP */}
          <div className="flex gap-2.5 pt-1">
            {galleryPhotos.map((photo, idx) => (
              <div
                key={idx}
                className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-[16px] border border-white/20 bg-black/30"
              >
                <img src={photo} alt="Gallery" className="h-full w-full object-cover" />
                {idx === 2 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[12px] font-bold text-white">
                    +3
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* 2ND FRAME SPEC: FLOATING BOTTOM ACTION CONTROL BUTTONS */}
      <div className="absolute bottom-6 left-0 right-0 z-40 flex items-center justify-center">
        <div className="flex items-center justify-center gap-5">
          {/* Pass Action (X) */}
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-13 w-13 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-xl transition-all hover:scale-110 active:scale-95 shadow-xl"
            title="Pass"
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
