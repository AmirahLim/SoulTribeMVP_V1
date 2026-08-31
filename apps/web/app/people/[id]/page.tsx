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

  // Real, natural human candid photos for each person
  const heroPhotos: Record<string, string> = {
    'Marcus Tan': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&auto=format&fit=crop&q=80',
    'Maya Lin': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80',
    'Chen Wei': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1000&auto=format&fit=crop&q=80',
  };
  const activePhoto = heroPhotos[person.profile.display_name] || heroPhotos['Marcus Tan'];

  const galleryPhotos = [
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0D1D15] text-[#FFFDF9]">
      {/* 2ND FRAME SPEC: REAL NATURAL HUMAN PORTRAIT PHOTO BACKGROUND */}
      <img
        src={activePhoto}
        alt={person.profile.display_name}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dark Ambient Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />

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

      {/* 2ND FRAME SPEC: OVERLAID CONTENT (ABOUT ME, INTERESTS, THUMBNAILS) */}
      <main className="absolute bottom-24 left-5 right-5 z-30 flex flex-col gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4"
        >
          {/* ABOUT ME SECTION */}
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-[22px] font-bold text-white tracking-tight drop-shadow-md">
                About Me
              </h1>
              <span className="flex items-center text-[12.5px] font-semibold text-white/80">
                <MapPin className="mr-1 h-3.5 w-3.5" /> {person.profile.home_area} · Singapore
              </span>
            </div>

            <p className="mt-1.5 max-w-[340px] text-[13.5px] font-normal leading-[20px] text-white/90 drop-shadow-sm">
              {person.profile.bio || "Singapore-based. Looking for genuine, intentional friendships. I love quiet weekend wandering, pottery throwing, and deep conversations over filter coffee. Let's connect!"}
            </p>
          </div>

          {/* INTERESTS SECTION (GLASS CHIPS) */}
          <div>
            <h2 className="text-[18px] font-bold text-white tracking-tight drop-shadow-md">
              Interests
            </h2>
            <div className="mt-2 flex flex-wrap gap-2.5">
              <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-4 py-1.5 text-[12.5px] font-medium text-white backdrop-blur-md">
                <Coffee className="h-3.5 w-3.5" /> Specialty Coffee
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-4 py-1.5 text-[12.5px] font-medium text-white backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" /> Ceramics
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-4 py-1.5 text-[12.5px] font-medium text-white backdrop-blur-md">
                <BookOpen className="h-3.5 w-3.5" /> Independent Bookshops
              </span>
            </div>
          </div>

          {/* PHOTO THUMBNAILS ROW (10+ BADGE) */}
          <div className="flex items-center gap-3 pt-1">
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
      </main>

      {/* 2ND FRAME SPEC: FLOATING BOTTOM ACTION BUTTONS (PASS, STAR, LIKE) */}
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
