'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  IllustratedGround,
  ResonanceRead,
  Bloom,
  Button,
} from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../../supabase/seed/seed';
import { generateMatchExplanation } from '../../../../../packages/core/explain/generator';
import { ArrowLeft, MoreVertical, X, Star, Heart, Coffee, Music, BookOpen, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const personId = params.id as string;

  const currentUser = SYNTHETIC_PROFILES[0]; // Priya
  // 1 real main match profile (Marcus Tan)
  const person = SYNTHETIC_PROFILES.find((p) => p.profile.id === personId) || SYNTHETIC_PROFILES[1];

  const [connected, setConnected] = useState(false);
  const [starred, setStarred] = useState(false);

  const explanation = generateMatchExplanation(currentUser, person);

  const heroPhoto = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80';
  const galleryPhotos = [
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#0D1D15] text-[#F3F0E9] pb-28">
      {/* 2ND FRAME SPEC: CINEMATIC FULL-BLEED PORTRAIT COVER IMAGE */}
      <div className="relative h-[480px] w-full overflow-hidden bg-[#0D1D15]">
        <img
          src={heroPhoto}
          alt={person.profile.display_name}
          className="h-full w-full object-cover"
        />

        {/* Top Dark Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1D15]/80 via-transparent to-[#0D1D15]" />

        {/* 2ND FRAME SPEC: TOP BAR NAVIGATION */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D1D15]/60 text-[#F3F0E9] backdrop-blur-md border border-[#F3F0E9]/15"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h2 className="text-[17px] font-bold text-[#F3F0E9] tracking-tight">
            Make Matches
          </h2>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D1D15]/60 text-[#F3F0E9] backdrop-blur-md border border-[#F3F0E9]/15"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </header>
      </div>

      {/* 2ND FRAME SPEC: GLASSMOPHIC FLOATING OVERLAY CONTENT SHEET */}
      <main className="relative -mt-20 z-20 px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col gap-5 rounded-[32px] border border-[#F3F0E9]/15 bg-[#15261C]/95 p-6 shadow-2xl backdrop-blur-xl"
        >
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-[26px] font-extrabold text-[#F3F0E9] tracking-tight">
                {person.profile.display_name}
              </h1>
              <span className="rounded-full bg-[#0D1D15] px-3 py-1 text-[11px] font-bold text-[#F3F0E9] border border-[#F3F0E9]/15">
                Strong Fit
              </span>
            </div>

            <p className="mt-1 flex items-center text-[13px] font-medium text-[#A6AAA4]">
              <MapPin className="mr-1 h-3.5 w-3.5" /> {person.profile.home_area} · Singapore
            </p>
          </div>

          {/* 2ND FRAME SPEC: ABOUT ME */}
          <div className="border-t border-[#F3F0E9]/10 pt-4">
            <h3 className="text-[14px] font-bold tracking-tight text-[#F3F0E9]">
              About Me
            </h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#A6AAA4]">
              {person.profile.bio || "Specialty coffee enthusiast and ceramic craft lover. Always up for quiet weekend exploration, long conversations, and discovering new filter coffee spots in Tiong Bahru."}
            </p>
          </div>

          {/* 2ND FRAME SPEC: INTERESTS GLASS CHIPS */}
          <div className="border-t border-[#F3F0E9]/10 pt-4">
            <h3 className="text-[14px] font-bold tracking-tight text-[#F3F0E9]">
              Interests
            </h3>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-[#F3F0E9]/15 bg-[#0D1D15]/80 px-4 py-1.5 text-[12.5px] font-semibold text-[#F3F0E9]">
                <Coffee className="h-3.5 w-3.5" /> Coffee
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-[#F3F0E9]/15 bg-[#0D1D15]/80 px-4 py-1.5 text-[12.5px] font-semibold text-[#F3F0E9]">
                <Sparkles className="h-3.5 w-3.5" /> Pottery
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-[#F3F0E9]/15 bg-[#0D1D15]/80 px-4 py-1.5 text-[12.5px] font-semibold text-[#F3F0E9]">
                <BookOpen className="h-3.5 w-3.5" /> Books
              </span>
            </div>
          </div>

          {/* 2ND FRAME SPEC: PHOTO GALLERY STRIP */}
          <div className="border-t border-[#F3F0E9]/10 pt-4">
            <h3 className="text-[14px] font-bold tracking-tight text-[#F3F0E9]">
              Outing Moments
            </h3>
            <div className="mt-2.5 flex gap-3 overflow-x-auto pb-1">
              {galleryPhotos.map((photo, idx) => (
                <div key={idx} className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-[16px] border border-[#F3F0E9]/12 bg-[#0D1D15]">
                  <img src={photo} alt="Gallery" className="h-full w-full object-cover" />
                  {idx === 2 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0D1D15]/80 text-[13px] font-bold text-[#F3F0E9]">
                      +3
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* EDITORIAL RESONANCE READ */}
          <div className="border-t border-[#F3F0E9]/10 pt-4">
            <span className="text-[10px] font-bold tracking-widest text-[#8F998D] uppercase">
              Match Resonance Read
            </span>
            <div className="mt-2">
              <ResonanceRead
                clickText={explanation.click_text}
                rubText={explanation.rub_text}
              />
            </div>
          </div>
        </motion.div>
      </main>

      {/* 2ND FRAME SPEC: FLOATING BOTTOM ACTION CONTROL BAR */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex items-center justify-center px-4">
        <div className="flex items-center justify-center gap-6 rounded-full border border-[#F3F0E9]/20 bg-[#15261C]/95 px-6 py-3 shadow-2xl backdrop-blur-xl">
          {/* Pass Action */}
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#F3F0E9]/20 bg-[#0D1D15] text-[#A6AAA4] transition-all hover:scale-105 hover:text-[#F3F0E9]"
            title="Pass"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Star / Bookmark Action */}
          <button
            type="button"
            onClick={() => setStarred(!starred)}
            className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all hover:scale-105 ${
              starred
                ? 'border-[#F3F0E9] bg-[#F3F0E9] text-[#0D1D15]'
                : 'border-[#F3F0E9]/20 bg-[#0D1D15] text-[#F3F0E9]'
            }`}
            title="Star Match"
          >
            <Star className="h-5 w-5 fill-current" />
          </button>

          {/* Connect / Like Action */}
          <button
            type="button"
            onClick={() => setConnected(!connected)}
            className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all hover:scale-105 ${
              connected
                ? 'border-[#F3F0E9] bg-[#F3F0E9] text-[#0D1D15]'
                : 'border-[#F3F0E9]/20 bg-[#0D1D15] text-[#F3F0E9]'
            }`}
            title="Connect / Invite"
          >
            <Heart className="h-6 w-6 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
