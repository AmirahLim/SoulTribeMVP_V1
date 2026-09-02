'use client';

import React from 'react';

export interface InterestItem {
  name: string;
  isRabbitHole?: boolean;
}

export interface OutingDnaData {
  descriptors: string[]; // e.g. ["Low-key", "Creative", "Exploratory"]
  instantYes?: string;
  usuallyYes?: string[];
  convinceMe?: string[];
  probablyNot?: string[]; // ONLY render if member supplied it!
}

export interface RealWorldSocialSelfProps {
  interests?: InterestItem[];
  outingDna?: OutingDnaData;
  youShouldKnow?: string[];
  availabilityText?: string;
  hostedOutingsCount?: number;
  className?: string;
}

export function RealWorldSocialSelf({
  interests = [],
  outingDna,
  youShouldKnow = [],
  availabilityText,
  hostedOutingsCount = 0,
  className = '',
}: RealWorldSocialSelfProps) {
  const rabbitHole = interests.find((i) => i.isRabbitHole) || interests[0];
  const otherInterests = interests.filter((i) => i !== rabbitHole);

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* I'm Into Interest Constellation */}
      {interests.length > 0 && (
        <div
          className="rounded-[26px] p-5 backdrop-blur-xl transition-all"
          style={{
            backgroundColor: 'rgba(10,12,11,0.62)',
            border: '1px solid rgba(245,242,234,0.11)',
            boxShadow: '0 22px 48px -26px rgba(0,0,0,0.9), inset 0 1px 0 rgba(245,242,234,0.22)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold tracking-widest text-[rgba(245,242,234,0.44)] uppercase">
              I'm Into
            </h3>
            <span className="text-[10px] font-bold tracking-widest text-[#EFB94E] uppercase">
              Rabbit Hole
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {rabbitHole && (
              <div className="rounded-xl border border-[rgba(239,185,78,0.34)] bg-[rgba(239,185,78,0.13)] px-3.5 py-1.5 text-xs font-bold text-[#EFB94E]">
                {rabbitHole.name}
              </div>
            )}

            {otherInterests.map((item, idx) => (
              <span
                key={idx}
                className="rounded-xl border border-[rgba(245,242,234,0.11)] bg-[rgba(255,255,255,0.045)] px-3 py-1.5 text-xs font-medium text-[rgba(245,242,234,0.70)]"
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* You Should Know & Availability */}
      <div className="grid gap-4 md:grid-cols-2">
        {youShouldKnow.length > 0 && (
          <div
            className="rounded-[26px] p-5 backdrop-blur-xl transition-all"
            style={{
              backgroundColor: 'rgba(10,12,11,0.62)',
              border: '1px solid rgba(245,242,234,0.11)',
              boxShadow: '0 22px 48px -26px rgba(0,0,0,0.9), inset 0 1px 0 rgba(245,242,234,0.22)',
            }}
          >
            <h3 className="text-[10px] font-bold tracking-widest text-[rgba(245,242,234,0.44)] uppercase mb-3">
              You Should Know
            </h3>
            <ul className="flex flex-col gap-2 text-xs text-[#F5F2EA]">
              {youShouldKnow.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#5BD99A] font-bold">•</span>
                  <span className="font-medium leading-relaxed text-[rgba(245,242,234,0.70)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {availabilityText && (
          <div
            className="rounded-[26px] p-5 backdrop-blur-xl transition-all"
            style={{
              backgroundColor: 'rgba(10,12,11,0.62)',
              border: '1px solid rgba(245,242,234,0.11)',
              boxShadow: '0 22px 48px -26px rgba(0,0,0,0.9), inset 0 1px 0 rgba(245,242,234,0.22)',
            }}
          >
            <h3 className="text-[10px] font-bold tracking-widest text-[rgba(245,242,234,0.44)] uppercase mb-2">
              Availability &amp; Pitches
            </h3>
            <p className="text-xs leading-relaxed text-[rgba(245,242,234,0.70)]">
              {availabilityText}
            </p>

            <div className="mt-3 flex items-center justify-between border-t border-[rgba(245,242,234,0.08)] pt-2.5 text-xs text-[rgba(245,242,234,0.44)]">
              <span>Hosted Outings</span>
              <span className="font-bold text-[#5BD99A]">{hostedOutingsCount} hosted</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
