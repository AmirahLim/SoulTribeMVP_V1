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
  description: string; // e.g. "bringing people together around shared crafts and quiet, quality experiences"
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
    <div
      className={`relative rounded-[26px] p-5 backdrop-blur-xl transition-all ${className}`}
      style={{
        backgroundColor: 'rgba(10,12,11,0.62)',
        border: '1px solid rgba(245,242,234,0.11)',
        boxShadow: '0 22px 48px -26px rgba(0,0,0,0.9), inset 0 1px 0 rgba(245,242,234,0.22)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-85"
        style={{
          background: 'radial-gradient(120% 80% at 12% 0%, rgba(239,185,78,0.11) 0%, transparent 62%)',
        }}
      />

      <div className="relative z-10">
        <p className="text-[10px] font-bold tracking-widest uppercase text-[#EFB94E] mb-2">
          Social Instincts
        </p>

        {/* Prominent Primary Instinct (Behavioral Copy) */}
        <div>
          <h4 className="font-['Bricolage_Grotesque'] text-xl font-semibold text-[#F5F2EA]">
            You often show up as a <span className="text-[#EFB94E] underline decoration-[#EFB94E]/40">{primaryInstinct.type}</span>
          </h4>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[rgba(245,242,234,0.70)]">
            In group settings and 1-on-1s, your patterns suggest a natural flow toward {primaryInstinct.description}.
          </p>
        </div>

        {/* Secondary Instincts */}
        {secondaryInstincts.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {secondaryInstincts.map((sec, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[rgba(245,242,234,0.08)] bg-[rgba(255,255,255,0.04)] p-3.5"
              >
                <span className="text-[10px] font-bold text-[rgba(245,242,234,0.44)] uppercase block">
                  Secondary Instinct
                </span>
                <p className="mt-1 text-sm font-semibold text-[#5BD99A]">
                  Also showing as {sec.type}
                </p>
                <p className="mt-1 text-xs text-[rgba(245,242,234,0.70)]">
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
