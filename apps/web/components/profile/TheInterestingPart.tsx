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
    <div className={`rounded-[24px] border border-[#F0DBD0]/30 bg-[#F0DBD0] p-6 shadow-xl text-[#3E2A22] ${className}`}>
      <span className="text-[10px] font-bold tracking-widest uppercase opacity-75">
        The Interesting Part
      </span>

      <h3 className="mt-1 text-2xl font-bold tracking-tight">
        {tension.headline}
      </h3>

      <p className="mt-2 text-xs leading-relaxed font-medium opacity-90">
        {tension.explanation}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold opacity-75">
        {tension.threadsInvolved.map((t, idx) => (
          <span key={idx} className="rounded-full border border-[#3E2A22]/20 bg-[#3E2A22]/10 px-2.5 py-0.5">
            Cross-thread: {t}
          </span>
        ))}
      </div>
    </div>
  );
}
