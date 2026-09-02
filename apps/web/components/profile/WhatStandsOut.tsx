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
    <div className={`rounded-[26px] border border-white/12 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl ${className}`}>
      <h3 className="text-[11px] font-bold tracking-widest text-[#D9E4D2] uppercase">
        What Stands Out
      </h3>
      <p className="mt-1 text-xs text-[#A6AAA4]">
        Qualitative highlights synthesised directly from your Tribal Pass.
      </p>

      <div className="mt-4 grid gap-3.5 md:grid-cols-2">
        {standouts.map((item, idx) => (
          <div
            key={idx}
            className="rounded-[20px] border border-[#D9E4D2]/30 bg-[#D9E4D2]/10 p-5 backdrop-blur-md transition-all hover:bg-[#D9E4D2]/15"
          >
            <span className="inline-block rounded-full bg-[#D9E4D2]/20 px-3.5 py-0.5 text-xs font-extrabold text-[#D9E4D2]">
              {item.trait}
            </span>
            <p className="mt-2 text-xs leading-relaxed font-medium text-[#F3F0E9]/95">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
