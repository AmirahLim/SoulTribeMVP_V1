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
        <div className="rounded-[26px] border border-white/12 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
          <h3 className="text-[11px] font-bold tracking-widest text-[#D9E4D2] uppercase">
            I'm Into
          </h3>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {rabbitHole && (
              <div className="rounded-2xl border border-[#D9E4D2]/40 bg-[#2D523E] px-4 py-2 text-xs font-bold text-[#F3F0E9] shadow-lg">
                <span className="text-[10px] uppercase text-[#D9E4D2] block font-medium">Current Rabbit Hole</span>
                {rabbitHole.name}
              </div>
            )}

            {otherInterests.map((item, idx) => (
              <span
                key={idx}
                className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-[#F3F0E9] backdrop-blur-md"
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Outing DNA */}
      {outingDna && (
        <div className="rounded-[26px] border border-white/12 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
          <h3 className="text-[11px] font-bold tracking-widest text-[#D9E4D2] uppercase">
            Outing DNA
          </h3>

          {/* Descriptors pill */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-base font-extrabold tracking-wide text-[#D9E4D2]">
              {outingDna.descriptors.join(' × ')}
            </span>
          </div>

          <div className="mt-4 grid gap-3 text-xs md:grid-cols-2">
            {outingDna.instantYes && (
              <div className="rounded-2xl border border-[#D9E4D2]/30 bg-[#D9E4D2]/10 p-4 backdrop-blur-md">
                <p className="text-[10px] font-bold text-[#D9E4D2] uppercase">Your Instant Yes</p>
                <p className="mt-1 font-bold text-[#F3F0E9]">{outingDna.instantYes}</p>
              </div>
            )}

            {outingDna.usuallyYes && outingDna.usuallyYes.length > 0 && (
              <div className="rounded-2xl border border-white/12 bg-white/5 p-4 backdrop-blur-md">
                <p className="text-[10px] font-bold text-[#A6AAA4] uppercase">Usually Yes</p>
                <p className="mt-1 font-medium text-[#F3F0E9]">{outingDna.usuallyYes.join(', ')}</p>
              </div>
            )}

            {outingDna.convinceMe && outingDna.convinceMe.length > 0 && (
              <div className="rounded-2xl border border-white/12 bg-white/5 p-4 backdrop-blur-md">
                <p className="text-[10px] font-bold text-[#A6AAA4] uppercase">Convince Me</p>
                <p className="mt-1 font-medium text-[#F3F0E9]">{outingDna.convinceMe.join(', ')}</p>
              </div>
            )}

            {/* Renders ONLY if explicitly supplied by member */}
            {outingDna.probablyNot && outingDna.probablyNot.length > 0 && (
              <div className="rounded-2xl border border-white/12 bg-white/5 p-4 backdrop-blur-md">
                <p className="text-[10px] font-bold text-[#A6AAA4] uppercase">Probably Not</p>
                <p className="mt-1 text-[#A6AAA4] font-medium">{outingDna.probablyNot.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* You Should Know & Availability */}
      <div className="grid gap-6 md:grid-cols-2">
        {youShouldKnow.length > 0 && (
          <div className="rounded-[26px] border border-white/12 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-[11px] font-bold tracking-widest text-[#D9E4D2] uppercase">
              You Should Know
            </h3>
            <ul className="mt-3 flex flex-col gap-2.5 text-xs text-[#F3F0E9]">
              {youShouldKnow.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#D9E4D2] font-bold">•</span>
                  <span className="font-medium leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {availabilityText && (
          <div className="rounded-[26px] border border-white/12 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-[11px] font-bold tracking-widest text-[#D9E4D2] uppercase">
              Availability & Pitches
            </h3>
            <p className="mt-2 text-xs leading-relaxed font-medium text-[#F3F0E9]">
              {availabilityText}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-[#A6AAA4]">
              <span>Hosted Outings</span>
              <span className="font-bold text-[#F3F0E9]">{hostedOutingsCount} hosted</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
