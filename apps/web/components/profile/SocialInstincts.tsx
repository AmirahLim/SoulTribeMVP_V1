'use client';

import React from 'react';

export type InstinctType =
  | 'Connector'
  | 'Anchor'
  | 'Explorer'
  | 'Deep Diver'
  | 'Spark'
  | 'Gatherer'
  | 'Bridge'
  | 'Cultivator'
  | 'Catalyst'
  | 'Keeper';

export interface InstinctItem {
  type: InstinctType;
  description: string; // e.g. "bringing people together around shared interests"
}

export interface SocialInstinctsProps {
  primaryInstinct?: InstinctItem;
  secondaryInstincts?: InstinctItem[];
  className?: string;
}

export function SocialInstincts({
  primaryInstinct,
  secondaryInstincts = [],
  className = '',
}: SocialInstinctsProps) {
  if (!primaryInstinct) return null;

  return (
    <div className={`rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-6 shadow-xl ${className}`}>
      <div>
        <h3 className="text-xl font-bold text-[#F3F0E9]">Social Instincts</h3>
        <p className="mt-0.5 text-xs text-[#A6AAA4]">
          The energy you naturally bring into a tribe based on your Pass patterns.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {/* Prominent Primary Instinct (Behavioral Copy) */}
        <div className="rounded-[20px] border border-[#DFDAEC]/40 bg-[#DFDAEC] p-5 text-[#2E2A40]">
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-75">
            Primary Social Instinct
          </span>
          <h4 className="mt-1 text-2xl font-bold">
            You often show up as a <span className="underline decoration-[#2E2A40]/40">{primaryInstinct.type}</span>
          </h4>
          <p className="mt-2 text-xs leading-relaxed font-medium opacity-90">
            In group settings and 1-on-1s, your patterns suggest a natural flow toward {primaryInstinct.description}.
          </p>
        </div>

        {/* Secondary Instincts */}
        {secondaryInstincts.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {secondaryInstincts.map((sec, idx) => (
              <div
                key={idx}
                className="rounded-[16px] border border-[#F3F0E9]/12 bg-[#0D1D15] p-4 text-[#F3F0E9]"
              >
                <span className="text-[10px] font-bold text-[#8F998D] uppercase block">
                  Secondary Instinct
                </span>
                <p className="mt-1 text-sm font-bold text-[#D9E4D2]">
                  Also showing as {sec.type}
                </p>
                <p className="mt-1 text-xs text-[#A6AAA4] font-normal">
                  {sec.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
