'use client';

import React from 'react';
import Link from 'next/link';
import { IllustratedGround, Button } from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../supabase/seed/seed';
import { Plus, Bell, Heart, Bookmark, Sparkles, MapPin, Coffee, Music, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DiscoverPage() {
  const marcus = SYNTHETIC_PROFILES[1]; // Marcus Tan (The 1 main real match profile!)

  const storyCircles = [
    { id: 'add', name: 'Create', isAdd: true, avatar: '' },
    { id: 'm1', name: 'Marcus Tan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { id: 'm2', name: 'Maya Lin', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { id: 'm3', name: 'Chen Wei', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  ];

  const discoveryFeed = [
    {
      id: 'feed-1',
      author: 'Marcus Tan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      time: '12 Mins Ago',
      title: 'Saturday Pottery & Filter Coffee in Tiong Bahru',
      description: "Let's spend two hours throwing clay at Tiong Bahru Studios, followed by a quiet filter coffee to talk properly.",
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80',
      area: 'Tiong Bahru',
      seatsLeft: '2 seats open',
    },
    {
      id: 'feed-2',
      author: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      time: '1 Hour Ago',
      title: 'Sunday Morning Botanical Walk & Matcha',
      description: 'A gentle 5km loop around Botanic Gardens at 8am before the heat hits, followed by iced matcha.',
      image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80',
      area: 'Tanglin',
      seatsLeft: '3 seats open',
    },
  ];

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      {/* 3RD FRAME SPEC: TOP BAR WITH TITLE & NOTIFICATION BELL */}
      <header className="flex items-center justify-between pb-4 border-b border-[#F3F0E9]/12">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#F3F0E9]" />
          <h1 className="text-[24px] font-bold text-[#F3F0E9] tracking-tight">
            Discover
          </h1>
        </div>

        <button
          type="button"
          className="relative rounded-full border border-[#F3F0E9]/15 bg-[#15261C] p-2.5 text-[#F3F0E9]"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#F3F0E9]" />
        </button>
      </header>

      {/* 3RD FRAME SPEC: TOP CIRCULAR AVATAR STORY STRIP */}
      <section className="py-4 border-b border-[#F3F0E9]/12">
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
          {storyCircles.map((circle) => (
            <div key={circle.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              {circle.isAdd ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[#F3F0E9]/30 bg-[#15261C] text-[#F3F0E9]">
                  <Plus className="h-6 w-6" />
                </div>
              ) : (
                <Link href={`/people/${marcus.profile.id}`}>
                  <div className="relative p-0.5 rounded-full ring-2 ring-[#F3F0E9]">
                    <img
                      src={circle.avatar}
                      alt={circle.name}
                      className="h-13 w-13 rounded-full object-cover"
                    />
                  </div>
                </Link>
              )}
              <span className="text-[11px] font-medium text-[#A6AAA4]">
                {circle.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3RD FRAME SPEC: FEATURED "BEST MATCH" CAROUSEL BANNER */}
      <section className="py-5 border-b border-[#F3F0E9]/12">
        <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
          Top Curated Match
        </span>

        <div className="relative mt-3 overflow-hidden rounded-[24px] border border-[#F3F0E9]/15 bg-[#15261C] shadow-xl">
          <div className="relative h-60 w-full overflow-hidden bg-[#0D1D15]">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80"
              alt="Marcus & Priya"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1D15] via-transparent to-transparent" />

            <div className="absolute bottom-4 left-4 right-4">
              <span className="rounded-full bg-[#0D1D15]/90 px-3 py-1 text-[10px] font-bold tracking-widest text-[#F3F0E9] uppercase backdrop-blur-sm">
                Strong Fit · 92% Rhythm Overlap
              </span>
              <h3 className="mt-1.5 text-[22px] font-bold text-[#F3F0E9]">
                Marcus Tan <span className="text-[14px] font-normal text-[#A6AAA4]">· Tiong Bahru</span>
              </h3>
              <p className="text-[12.5px] text-[#A6AAA4]">
                Loves specialty coffee, pottery throwing, and quiet weekend walks.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#15261C]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F3F0E9]" />
              <span className="h-2 w-2 rounded-full bg-[#F3F0E9]/30" />
              <span className="h-2 w-2 rounded-full bg-[#F3F0E9]/30" />
            </div>

            <Link href={`/people/${marcus.profile.id}`}>
              <Button variant="primary" size="sm">
                View Match Profile →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3RD FRAME SPEC: SOCIAL & OUTING DISCOVERY FEED */}
      <section className="py-5 flex flex-col gap-6">
        <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
          Tribe Outing Feed
        </span>

        {discoveryFeed.map((post) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] shadow-lg"
          >
            {/* Author Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-[#F3F0E9]/20"
                />
                <div>
                  <h4 className="text-[14.5px] font-bold text-[#F3F0E9]">
                    {post.author}
                  </h4>
                  <span className="text-[11.5px] text-[#A6AAA4]">
                    {post.time} · {post.area}
                  </span>
                </div>
              </div>

              <span className="rounded-full bg-[#0D1D15] px-3 py-1 text-[11px] font-bold text-[#F3F0E9] border border-[#F3F0E9]/15">
                {post.seatsLeft}
              </span>
            </div>

            {/* Large Candid Cover Image */}
            <div className="relative h-56 w-full overflow-hidden bg-[#0D1D15]">
              <img
                src={post.image}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Post Content & Actions */}
            <div className="p-5">
              <h3 className="text-[18px] font-bold text-[#F3F0E9] leading-snug">
                {post.title}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#A6AAA4]">
                {post.description}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-[#F3F0E9]/10 pt-3.5">
                <div className="flex items-center gap-3 text-[#A6AAA4]">
                  <button type="button" className="hover:text-[#F3F0E9]">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button type="button" className="hover:text-[#F3F0E9]">
                    <Bookmark className="h-5 w-5" />
                  </button>
                </div>

                <Link href="/outings/out-101">
                  <Button variant="secondary" size="sm">
                    Join Outing →
                  </Button>
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </section>
    </IllustratedGround>
  );
}
