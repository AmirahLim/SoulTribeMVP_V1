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
        backgroundColor: 'rgba(10,12,11,0.62)',
        border: '1px solid rgba(245,242,234,0.11)',
        boxShadow: '0 22px 48px -26px rgba(0,0,0,0.9), inset 0 1px 0 rgba(245,242,234,0.22)',
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
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#EFB94E]">
          The Interesting Part
        </span>

        <h3 className="font-sans mt-1 text-2xl font-bold tracking-tight text-[#F5F2EA]">
          {tension.headline}
        </h3>

        <p className="mt-2 text-xs leading-relaxed font-normal text-[rgba(245,242,234,0.70)]">
          {tension.explanation}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold text-[rgba(245,242,234,0.70)]">
          {tension.threadsInvolved.map((t, idx) => (
            <span
              key={idx}
              className="rounded-full border border-[rgba(245,242,234,0.15)] bg-[rgba(255,255,255,0.04)] px-2.5 py-0.5 text-[11px] font-medium text-[#F5F2EA]"
            >
              Cross-thread: {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
