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
        <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-6 shadow-xl">
          <h3 className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
            I'm Into
          </h3>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {rabbitHole && (
              <div className="rounded-2xl border border-[#D9E4D2]/40 bg-[#2D523E] px-4 py-2 text-xs font-bold text-[#F3F0E9] shadow-md">
                <span className="text-[10px] uppercase text-[#D9E4D2] block font-medium">Current Rabbit Hole</span>
                {rabbitHole.name}
              </div>
            )}

            {otherInterests.map((item, idx) => (
              <span
                key={idx}
                className="rounded-xl border border-[#F3F0E9]/15 bg-[#0D1D15] px-3.5 py-1.5 text-xs font-semibold text-[#F3F0E9]"
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Outing DNA */}
      {outingDna && (
        <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-6 shadow-xl">
          <h3 className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
            Outing DNA
          </h3>

          {/* Descriptors pill */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-sm font-bold tracking-wide text-[#D9E4D2]">
              {outingDna.descriptors.join(' × ')}
            </span>
          </div>

          <div className="mt-4 grid gap-3 text-xs md:grid-cols-2">
            {outingDna.instantYes && (
              <div className="rounded-xl border border-[#D9E4D2]/20 bg-[#0D1D15] p-3.5">
                <p className="text-[10px] font-bold text-[#8F998D] uppercase">Your Instant Yes</p>
                <p className="mt-1 font-semibold text-[#F3F0E9]">{outingDna.instantYes}</p>
              </div>
            )}

            {outingDna.usuallyYes && outingDna.usuallyYes.length > 0 && (
              <div className="rounded-xl border border-[#F3F0E9]/10 bg-[#0D1D15] p-3.5">
                <p className="text-[10px] font-bold text-[#8F998D] uppercase">Usually Yes</p>
                <p className="mt-1 text-[#F3F0E9]">{outingDna.usuallyYes.join(', ')}</p>
              </div>
            )}

            {outingDna.convinceMe && outingDna.convinceMe.length > 0 && (
              <div className="rounded-xl border border-[#F3F0E9]/10 bg-[#0D1D15] p-3.5">
                <p className="text-[10px] font-bold text-[#8F998D] uppercase">Convince Me</p>
                <p className="mt-1 text-[#F3F0E9]">{outingDna.convinceMe.join(', ')}</p>
              </div>
            )}

            {/* Renders ONLY if explicitly supplied by member */}
            {outingDna.probablyNot && outingDna.probablyNot.length > 0 && (
              <div className="rounded-xl border border-[#F3F0E9]/10 bg-[#0D1D15] p-3.5">
                <p className="text-[10px] font-bold text-[#8F998D] uppercase">Probably Not</p>
                <p className="mt-1 text-[#A6AAA4]">{outingDna.probablyNot.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* You Should Know & Availability */}
      <div className="grid gap-6 md:grid-cols-2">
        {youShouldKnow.length > 0 && (
          <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-6 shadow-xl">
            <h3 className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
              You Should Know
            </h3>
            <ul className="mt-3 flex flex-col gap-2 text-xs text-[#F3F0E9]">
              {youShouldKnow.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#D9E4D2] font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {availabilityText && (
          <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-6 shadow-xl">
            <h3 className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
              Availability & Pitches
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#F3F0E9]">
              {availabilityText}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-[#F3F0E9]/10 pt-3 text-xs text-[#A6AAA4]">
              <span>Hosted Outings</span>
              <span className="font-bold text-[#F3F0E9]">{hostedOutingsCount} hosted</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
