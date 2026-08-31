'use client';

import React from 'react';

export interface PitchCardProps {
  id: string;
  title: string;
  pitch: string;
  area: string;
  dateTime: string;
  hostName: string;
  hostAvatar?: string;
  seatsTotal: number;
  seatsFilled: number;
  category: 'coffee' | 'dining' | 'active' | 'cultural' | 'nightlife' | 'creative';
  orientation: 'conversation' | 'activity' | 'balanced';
  imageUrl?: string;
  onPitchClick?: () => void;
  className?: string;
}

export function PitchCard({
  id,
  title,
  pitch,
  area,
  dateTime,
  hostName,
  hostAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  seatsTotal = 6,
  seatsFilled = 3,
  category,
  orientation,
  imageUrl = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
  onPitchClick,
  className = '',
}: PitchCardProps) {
  const categoryLabels = {
    creative: 'ART & CRAFT',
    coffee: 'COFFEE & WANDER',
    dining: 'DINING & TALK',
    active: 'OUTDOORS & MOVEMENT',
    cultural: 'CULTURE & GALLERIES',
    nightlife: 'EVENING & DRINKS',
  };

  return (
    <article
      className={`group overflow-hidden rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] transition-all hover:border-[#D49B4B]/40 shadow-md ${className}`}
    >
      {/* Image-Led Hero Cover */}
      <div className="relative h-48 w-full overflow-hidden bg-[#0D1D15]">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3.5 left-3.5 rounded-lg bg-[#0D1D15]/90 px-3 py-1 text-[10px] font-bold tracking-widest text-[#D49B4B] uppercase backdrop-blur-sm">
          {categoryLabels[category]} · {dateTime.split('·')[0]}
        </div>
      </div>

      {/* Editorial Content */}
      <div className="p-5">
        <h3 className="text-[20px] font-bold tracking-tight text-[#F3F0E9] leading-snug">
          {title}
        </h3>

        <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#A6AAA4] line-clamp-2">
          {pitch}
        </p>

        {/* Host & Attendee Context */}
        <div className="mt-4 flex items-center justify-between border-t border-[#F3F0E9]/10 pt-3.5">
          <div className="flex items-center gap-2.5">
            <img
              src={hostAvatar}
              alt={hostName}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-[#D49B4B]/40"
            />
            <div className="text-[12px]">
              <span className="font-semibold text-[#F3F0E9]">{hostName} + {seatsFilled - 1} others</span>
              <span className="block text-[#A6AAA4]">{area} · Small group</span>
            </div>
          </div>

          <span className="text-[12px] font-bold text-[#D49B4B]">
            Strong fit →
          </span>
        </div>
      </div>
    </article>
  );
}
