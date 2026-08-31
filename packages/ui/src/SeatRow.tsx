'use client';

import React from 'react';

export interface SeatRowProps {
  totalSeats?: number; // max 6
  filledSeats?: number;
  className?: string;
}

export function SeatRow({
  totalSeats = 6,
  filledSeats = 1,
  className = '',
}: SeatRowProps) {
  const seats = Array.from({ length: totalSeats });

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {seats.map((_, i) => {
        const isFilled = i < filledSeats;
        return (
          <div
            key={i}
            className={`flex h-8 w-8 items-center justify-center rounded-[10px] transition-all ${
              isFilled
                ? 'bg-[#C85A32] text-[#FFFDF9] shadow-sm'
                : 'border border-[#7A6B5F]/30 bg-[#EFE5D8]/70 text-[#7A6B5F]'
            }`}
            title={isFilled ? `Seat ${i + 1} taken` : `Seat ${i + 1} open`}
          >
            {/* Chair glyph */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
              <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z" />
              <path d="M5 18v3" />
              <path d="M19 18v3" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
