'use client';

import React from 'react';

export interface ResonanceReadProps {
  clickText: string;
  frictionText: string;
  className?: string;
}

export function ResonanceRead({
  clickText,
  frictionText,
  className = '',
}: ResonanceReadProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-5.5 shadow-[0_8px_24px_-6px_rgba(61,46,36,0.08)] ${className}`}
    >
      {/* 1. WHY YOU MIGHT CLICK */}
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#C85A32]" />
          <h4 className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#C85A32]">
            Why you might click
          </h4>
        </div>
        <p className="text-[15px] font-medium leading-[23px] text-[#3D2E24]">
          {clickText}
        </p>
      </div>

      {/* 2. WHERE YOU MIGHT RUB (Mandatory Friction in Earthy Clay) */}
      <div className="rounded-[20px] border border-[#9E6B55]/20 bg-[#EFE5D8]/60 p-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-[#9E6B55]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="2" y1="2" x2="14" y2="14" />
            <line x1="14" y1="2" x2="2" y2="14" />
          </svg>
          <span className="text-[11px] font-bold tracking-[0.08em] uppercase">
            Where you might rub
          </span>
        </div>
        <p className="text-[14px] leading-[21px] text-[#4A3B30]">
          {frictionText}
        </p>
      </div>
    </div>
  );
}
