'use client';

import React from 'react';
import Link from 'next/link';
import { IllustratedGround } from '@soul-tribe/ui';
import { ArrowLeft, MapPin } from 'lucide-react';

export default function TimelinePage() {
  const events = [
    {
      id: 'e1',
      date: '24 Aug 2026',
      title: 'Katong Peranakan Walk & Tea',
      headline: 'Discovered the quiet courtyard behind the vintage shop and agreed 4 people is the ideal group size for long afternoons.',
      location: 'Katong',
      attendees: [
        { name: 'Marcus', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
        { name: 'Priya', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
        { name: 'Maya', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
        { name: 'Chen', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
      ],
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'e2',
      date: '10 Aug 2026',
      title: 'Tiong Bahru Pottery Workshop',
      headline: 'Marcus brought filter coffee while we spent two hours learning to throw clay.',
      location: 'Tiong Bahru',
      attendees: [
        { name: 'Priya', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
        { name: 'Marcus', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      ],
      photo: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      {/* Header */}
      <header className="py-2 border-b border-[#F3F0E9]/12 pb-4">
        <Link href="/home" className="flex items-center text-[13.5px] font-semibold text-[#A6AAA4] hover:text-[#F3F0E9]">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
        </Link>

        <span className="mt-3 block text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
          Layer 2 Profile Artifact
        </span>

        <h1 className="mt-1 text-[26px] font-bold tracking-tight text-[#F3F0E9]">
          The Tribe's Timeline
        </h1>
        <p className="mt-1 text-[14px] text-[#A6AAA4]">
          The group chat holds the chatter — Soul Tribe holds the history.
        </p>
      </header>

      {/* Timeline Events */}
      <div className="mt-6 flex flex-col gap-6">
        {events.map((evt) => (
          <div key={evt.id} className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#2B1A17] p-5 shadow-lg">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-bold text-[#F3F0E9]">{evt.date}</span>
              <span className="flex items-center text-[#A6AAA4]">
                <MapPin className="mr-1 h-3.5 w-3.5" /> {evt.location}
              </span>
            </div>

            <h3 className="mt-2 text-[18px] font-bold text-[#F3F0E9]">{evt.title}</h3>
            <p className="mt-1 text-[13.5px] leading-relaxed text-[#A6AAA4]">{evt.headline}</p>

            {/* Attendees */}
            <div className="mt-4 flex items-center gap-2 border-t border-[#F3F0E9]/10 pt-3">
              {evt.attendees.map((att) => (
                <img
                  key={att.name}
                  src={att.avatar}
                  alt={att.name}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-[#F3F0E9]/20"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </IllustratedGround>
  );
}
