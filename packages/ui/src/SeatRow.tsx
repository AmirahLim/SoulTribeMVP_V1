'use client';

import React from 'react';

export interface SeatRowProps {
  seatsTotal?: number; // Cap enforced max 6
  seatsFilled: number;
  className?: string;
}

export function SeatRow({ seatsTotal = 6, seatsFilled, className = '' }: SeatRowProps) {
  // Cap at 6 total
  const capTotal = Math.min(seatsTotal, 6);
  const seats = Array.from({ length: capTotal }, (_, i) => i < seatsFilled);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {seats.map((isFilled, idx) => (
        <div
          key={idx}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition-all ${
            isFilled
              ? 'bg-[#016401] text-[#F3F0E9] shadow-sm'
              : 'border border-[#F3F0E9]/20 bg-[#0D1D15] text-[#A6AAA4]'
          }`}
        >
          {idx + 1}
        </div>
      ))}
    </div>
  );
}
