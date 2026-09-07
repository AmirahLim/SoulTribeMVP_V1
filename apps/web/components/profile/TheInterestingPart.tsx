'use client';

import React from 'react';

export interface ContradictionTension {
  headline: string; // e.g. "Adventurous, but not chaotic."
  explanation: string; // e.g. "You actively seek unfamiliar experiences, but prefer knowing they're happening ahead of time. Novelty energizes you; logistical uncertainty doesn't."
  threadsInvolved: string[]; // e.g. ["interests", "social_rhythm"]
}

export interface TheInterestingPartProps {
  tension?: ContradictionTension;
  className?: string;
}

export function TheInterestingPart({ tension, className = '' }: TheInterestingPartProps) {
  // Renders ONLY when a genuine cross-thread contradiction is present!
  if (!tension || !tension.headline || !tension.explanation || tension.threadsInvolved.length < 2) {
    return null;
  }

  return (
    <div
      className={`relative rounded-[26px] p-5 backdrop-blur-xl transition-all ${className}`}
      style={{
        backgroundColor: '#F2EEE5',
        border: '1px solid rgba(32,59,48,0.18)',
        boxShadow: '0 4px 16px rgba(32,59,48,0.04)',
      }}
    >
      {/* Subtle Amber Wash Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-85"
        style={{
          background: 'radial-gradient(120% 80% at 12% 0%, rgba(239,185,78,0.14) 0%, transparent 62%)',
        }}
      />

      <div className="relative z-10">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#826044]">
          The Interesting Part
        </span>

        <h3 className="font-sans mt-1 text-2xl font-bold tracking-tight text-[#203B30]">
          {tension.headline}
        </h3>

        <p className="mt-2 text-xs leading-relaxed font-normal text-[#536657]">
          {tension.explanation}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold text-[#536657]">
          {tension.threadsInvolved.map((t, idx) => (
            <span
              key={idx}
              className="rounded-full border border-[rgba(32,59,48,0.18)] bg-[rgba(255,255,255,0.04)] px-2.5 py-0.5 text-[11px] font-medium text-[#203B30]"
            >
              Cross-thread: {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
