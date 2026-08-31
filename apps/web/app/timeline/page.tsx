'use client';

import React from 'react';
import Link from 'next/link';
import { IllustratedGround, Button } from '@soul-tribe/ui';
import { Sparkles, Calendar, MapPin, ArrowLeft, Heart, Image as ImageIcon } from 'lucide-react';

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
      <header className="py-4">
        <Link href="/home" className="flex items-center text-[13px] font-medium text-[#7A6B5F] hover:text-[#3D2E24]">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
        </Link>

        <span className="mt-2 block text-[11px] font-semibold tracking-wider text-[#C85A32] uppercase">
          Layer 2 Profile Artifact
        </span>

        <h1
          className="text-[32px] font-semibold text-[#3D2E24]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          The Tribe's Timeline
        </h1>
        <p className="mt-1 text-[14px] text-[#4A3B30]">
          The group chat holds the chatter — Soul Tribe holds the history.
        </p>
      </header>

      {/* Timeline Stream */}
      <div className="mt-6 flex flex-col gap-6">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="relative overflow-hidden rounded-[32px] border border-[#3D2E24]/12 bg-[#FFFDF9] p-5 shadow-[0_4px_16px_rgba(61,46,36,0.06)]"
          >
            <div className="flex items-center justify-between text-[12px] font-medium text-[#7A6B5F]">
              <span className="flex items-center gap-1.5 text-[#3E6B5C]">
                <Calendar className="h-3.5 w-3.5" /> {evt.date}
              </span>
              <span className="flex items-center gap-1 text-[#C85A32]">
                <MapPin className="h-3.5 w-3.5" /> {evt.location}
              </span>
            </div>

            <h2
              className="mt-2 text-[22px] font-semibold text-[#3D2E24]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              {evt.title}
            </h2>

            <p className="mt-2 text-[15px] leading-[23px] text-[#4A3B30] italic">
              "{evt.headline}"
            </p>

            {/* Photo Vignette */}
            <div className="relative mt-4 h-40 w-full overflow-hidden rounded-[22px] border border-[#3D2E24]/10">
              <img src={evt.photo} alt={evt.title} className="h-full w-full object-cover" />
            </div>

            {/* Attendees Row */}
            <div className="mt-4 flex items-center justify-between border-t border-[#3D2E24]/10 pt-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-[#7A6B5F]">Attendees:</span>
                <div className="flex -space-x-2">
                  {evt.attendees.map((att, i) => (
                    <img
                      key={i}
                      src={att.avatar}
                      alt={att.name}
                      className="h-7 w-7 rounded-full border-2 border-[#FFFDF9] object-cover"
                    />
                  ))}
                </div>
              </div>

              <Link href={`/outings/rec-1/record`} className="text-[12px] font-semibold text-[#C85A32] hover:underline">
                Rhythm Check →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </IllustratedGround>
  );
}
