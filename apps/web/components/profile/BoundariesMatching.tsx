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
    <div
      className={`rounded-[26px] p-5 backdrop-blur-xl transition-all ${className}`}
      style={{
        backgroundColor: 'rgba(10,12,11,0.62)',
        border: '1px solid rgba(245,242,234,0.11)',
        boxShadow: '0 22px 48px -26px rgba(0,0,0,0.9), inset 0 1px 0 rgba(245,242,234,0.22)',
      }}
    >
      <h3 className="text-[10px] font-bold tracking-widest text-[rgba(245,242,234,0.44)] uppercase">
        Boundaries &amp; Privacy Controls
      </h3>
      <p className="mt-1 text-xs text-[rgba(245,242,234,0.70)]">
        Clear distinction between what other members can see and what is kept private.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {/* Visible on Profile */}
        <div className="rounded-xl border border-[rgba(91,217,154,0.25)] bg-[rgba(91,217,154,0.08)] p-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#5BD99A]" />
            <h4 className="text-xs font-bold text-[#5BD99A]">Visible on Profile</h4>
          </div>
          <ul className="mt-2.5 space-y-1.5 text-xs text-[#F5F2EA]">
            {visibleFields.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-[#5BD99A] font-bold">✓</span>
                <span className="text-[rgba(245,242,234,0.70)]">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Used Privately for Matching */}
        <div className="rounded-xl border border-[rgba(245,242,234,0.11)] bg-[rgba(255,255,255,0.03)] p-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[rgba(245,242,234,0.44)]" />
            <h4 className="text-xs font-bold text-[rgba(245,242,234,0.44)]">Used Privately for Matching</h4>
          </div>
          <ul className="mt-2.5 space-y-1.5 text-xs text-[rgba(245,242,234,0.44)]">
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
