'use client';

import React from 'react';

export interface BoundariesMatchingProps {
  visibleFields?: string[];
  privateFields?: string[];
  className?: string;
}

export function BoundariesMatching({
  visibleFields = ['Display Name & Handle', 'Home Neighbourhood', 'Pass Signal Summaries', 'Hosted Pitches'],
  privateFields = ['Exact Age Preferences', 'Availability Calendar Slots', 'Rhythm Check Feedback', 'Psychometric Trait Vectors'],
  className = '',
}: BoundariesMatchingProps) {
  return (
    <div className={`rounded-[26px] border border-white/12 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl ${className}`}>
      <h3 className="text-[11px] font-bold tracking-widest text-[#D9E4D2] uppercase">
        Boundaries & Privacy Controls
      </h3>
      <p className="mt-1 text-xs text-[#A6AAA4]">
        Clear distinction between what other members can see and what is kept private.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Visible on Profile */}
        <div className="rounded-[20px] border border-[#D9E4D2]/30 bg-[#D9E4D2]/10 p-4.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D9E4D2]" />
            <h4 className="text-xs font-bold text-[#D9E4D2]">Visible on Profile</h4>
          </div>
          <ul className="mt-3 space-y-2 text-xs font-medium text-[#F3F0E9]">
            {visibleFields.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-[#D9E4D2] font-bold">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Used Privately for Matching */}
        <div className="rounded-[20px] border border-white/12 bg-white/5 p-4.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#A6AAA4]" />
            <h4 className="text-xs font-bold text-[#A6AAA4]">Used Privately for Matching</h4>
          </div>
          <ul className="mt-3 space-y-2 text-xs font-medium text-[#A6AAA4]">
            {privateFields.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span>🔒</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
