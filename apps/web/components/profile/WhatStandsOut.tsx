'use client';

import React from 'react';

export interface StandoutItem {
  trait: string; // e.g. "Socially selective"
  description: string; // e.g. "You consistently favour smaller, higher-quality interactions."
}

export interface WhatStandsOutProps {
  standouts: StandoutItem[];
  className?: string;
}

export function WhatStandsOut({ standouts, className = '' }: WhatStandsOutProps) {
  if (!standouts || standouts.length === 0) return null;

  return (
    <div className={`rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-6 shadow-xl ${className}`}>
      <h3 className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
        What Stands Out
      </h3>
      <p className="mt-1 text-xs text-[#A6AAA4]">
        Qualitative highlights synthesised directly from your Tribal Pass.
      </p>

      <div className="mt-4 grid gap-3.5 md:grid-cols-2">
        {standouts.map((item, idx) => (
          <div
            key={idx}
            className="rounded-[18px] border border-[#D9E4D2]/15 bg-[#0D1D15] p-4.5 transition-all hover:border-[#D9E4D2]/30"
          >
            <span className="inline-block rounded-full bg-[#D9E4D2]/15 px-3 py-0.5 text-xs font-bold text-[#D9E4D2]">
              {item.trait}
            </span>
            <p className="mt-2 text-xs leading-relaxed font-normal text-[#F3F0E9]/90">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
