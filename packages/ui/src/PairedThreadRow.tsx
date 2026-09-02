'use client';

import React from 'react';

export type MechanismType = 'Aligned' | 'Complementary' | 'Planning friction' | 'Friction' | 'Not measured';

export interface PairedThreadRowProps {
  threadName: string;
  mechanism: MechanismType;
  youPos?: number; // 0..100 %
  themPos?: number; // 0..100 %
  leftEndLabel?: string;
  rightEndLabel?: string;
  consequenceSentence: string;
  themName?: string;
  className?: string;
}

export function PairedThreadRow({
  threadName,
  mechanism,
  youPos,
  themPos,
  leftEndLabel,
  rightEndLabel,
  consequenceSentence,
  themName = 'Mervyn',
  className = '',
}: PairedThreadRowProps) {
  const isUnmeasured = mechanism === 'Not measured' || youPos === undefined || themPos === undefined;

  let badgeClass = 'bg-[rgba(245,242,234,0.06)] text-[rgba(245,242,234,0.44)] border border-[rgba(245,242,234,0.11)]';
  if (mechanism === 'Aligned') {
    badgeClass = 'bg-[rgba(91,217,154,0.14)] text-[#5BD99A] border border-[rgba(91,217,154,0.30)]';
  } else if (mechanism === 'Complementary') {
    badgeClass = 'bg-[rgba(150,190,255,0.13)] text-[#9FC3FF] border border-[rgba(150,190,255,0.30)]';
  } else if (mechanism === 'Planning friction' || mechanism === 'Friction') {
    badgeClass = 'bg-[rgba(239,185,78,0.14)] text-[#EFB94E] border border-[rgba(239,185,78,0.32)]';
  }

  // Calculate track span
  let minPos = 0;
  let maxPos = 0;
  let spanGradient = 'linear-gradient(90deg, rgba(239,185,78,0.6), rgba(91,217,154,0.6))';

  if (!isUnmeasured && youPos !== undefined && themPos !== undefined) {
    minPos = Math.min(youPos, themPos);
    maxPos = Math.max(youPos, themPos);

    if (mechanism === 'Complementary') {
      spanGradient = 'linear-gradient(90deg, rgba(239,185,78,0.5), rgba(159,195,255,0.45), rgba(91,217,154,0.5))';
    } else if (mechanism === 'Planning friction' || mechanism === 'Friction') {
      spanGradient = 'linear-gradient(90deg, rgba(239,185,78,0.55), rgba(239,185,78,0.18), rgba(91,217,154,0.55))';
    }
  }

  return (
    <div className={`py-4 border-t border-[rgba(245,242,234,0.08)] first-of-type:border-t-0 ${className}`}>
      {/* Header & Mechanism Badge */}
      <div className="flex items-baseline justify-between gap-2.5 mb-2.5">
        <span className="text-[14.5px] font-semibold text-[#F5F2EA]">{threadName}</span>
        <span className={`text-[9.5px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full whitespace-nowrap ${badgeClass}`}>
          {mechanism}
        </span>
      </div>

      {/* Paired Track & Dots */}
      {!isUnmeasured && youPos !== undefined && themPos !== undefined ? (
        <>
          <div className="relative h-6.5 my-1">
            <div className="absolute left-0 right-0 top-2.75 h-1 rounded-full bg-[rgba(245,242,234,0.09)]" />
            <div
              className="absolute top-2.75 h-1 rounded-full"
              style={{
                left: `${minPos}%`,
                width: `${Math.max(4, maxPos - minPos)}%`,
                background: spanGradient,
              }}
            />
            {/* You Dot (Amber) */}
            <div
              className="absolute top-3.25 w-3.25 h-3.25 rounded-full -translate-x-1/2 -translate-y-1/2 bg-[#EFB94E] shadow-[0_0_0_4px_rgba(239,185,78,0.16),0_0_12px_rgba(239,185,78,0.85)]"
              style={{ left: `${youPos}%` }}
              title="You"
            />
            {/* Them Dot (Emerald) */}
            <div
              className="absolute top-3.25 w-3.25 h-3.25 rounded-full -translate-x-1/2 -translate-y-1/2 bg-[#5BD99A] shadow-[0_0_0_4px_rgba(91,217,154,0.16),0_0_12px_rgba(91,217,154,0.85)]"
              style={{ left: `${themPos}%` }}
              title={themName}
            />
          </div>

          {(leftEndLabel || rightEndLabel) && (
            <div className="flex justify-between text-[10px] text-[rgba(245,242,234,0.22)] mt-0.5 tracking-wide">
              <span>{leftEndLabel}</span>
              <span>{rightEndLabel}</span>
            </div>
          )}
        </>
      ) : null}

      {/* Consequence sentence */}
      <p className="text-[12.5px] leading-relaxed text-[rgba(245,242,234,0.70)] mt-2">
        {consequenceSentence}
      </p>
    </div>
  );
}
