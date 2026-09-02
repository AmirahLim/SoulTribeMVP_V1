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
    <div className={`rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-6 shadow-xl ${className}`}>
      <h3 className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
        Boundaries & Privacy Controls
      </h3>
      <p className="mt-1 text-xs text-[#A6AAA4]">
        Clear distinction between what other members can see and what is kept private.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Visible on Profile */}
        <div className="rounded-[18px] border border-[#D9E4D2]/30 bg-[#0D1D15] p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#D9E4D2]" />
            <h4 className="text-xs font-bold text-[#D9E4D2]">Visible on Profile</h4>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs text-[#F3F0E9]/90">
            {visibleFields.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-[#D9E4D2]">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Used Privately for Matching */}
        <div className="rounded-[18px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#8F998D]" />
            <h4 className="text-xs font-bold text-[#8F998D]">Used Privately for Matching</h4>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs text-[#A6AAA4]">
            {privateFields.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-[#8F998D]">🔒</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
