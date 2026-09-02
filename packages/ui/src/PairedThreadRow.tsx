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
    badgeClass = 'bg-[rgba(45,82,62,0.25)] text-[#4E8B69] border border-[rgba(45,82,62,0.45)]';
  } else if (mechanism === 'Complementary') {
    badgeClass = 'bg-[rgba(150,190,255,0.13)] text-[#9FC3FF] border border-[rgba(150,190,255,0.30)]';
  } else if (mechanism === 'Planning friction' || mechanism === 'Friction') {
    badgeClass = 'bg-[rgba(239,185,78,0.14)] text-[#EFB94E] border border-[rgba(239,185,78,0.32)]';
  }

  // Calculate track span
  let minPos = 0;
  let maxPos = 0;
  let spanGradient = 'linear-gradient(90deg, rgba(239,185,78,0.6), rgba(45,82,62,0.6))';

  if (!isUnmeasured && youPos !== undefined && themPos !== undefined) {
    minPos = Math.min(youPos, themPos);
    maxPos = Math.max(youPos, themPos);

    if (mechanism === 'Complementary') {
      spanGradient = 'linear-gradient(90deg, rgba(239,185,78,0.5), rgba(159,195,255,0.45), rgba(45,82,62,0.5))';
    } else if (mechanism === 'Planning friction' || mechanism === 'Friction') {
      spanGradient = 'linear-gradient(90deg, rgba(239,185,78,0.55), rgba(239,185,78,0.18), rgba(45,82,62,0.55))';
    }
  }

  return (
    <div className={`py-6 border-t border-[rgba(245,242,234,0.10)] first-of-type:border-t-0 ${className}`}>
      {/* Header & Mechanism Badge */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="font-['Bricolage_Grotesque'] text-[16px] font-bold text-[#F5F2EA]">{threadName}</span>
        <span className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full whitespace-nowrap ${badgeClass}`}>
          {mechanism}
        </span>
      </div>

      {/* Paired Track & Dots */}
      {!isUnmeasured && youPos !== undefined && themPos !== undefined ? (
        <div className="my-2.5">
          {/* End Labels above track for high contrast readability */}
          {(leftEndLabel || rightEndLabel) && (
            <div className="flex justify-between text-[11px] font-semibold text-[rgba(245,242,234,0.60)] mb-1.5 tracking-wide">
              <span>{leftEndLabel}</span>
              <span>{rightEndLabel}</span>
            </div>
          )}

          <div className="relative h-7 my-1">
            <div className="absolute left-0 right-0 top-3 h-1 rounded-full bg-[rgba(245,242,234,0.12)]" />
            <div
              className="absolute top-3 h-1 rounded-full"
              style={{
                left: `${minPos}%`,
                width: `${Math.max(4, maxPos - minPos)}%`,
                background: spanGradient,
              }}
            />
            {/* You Dot (Amber) */}
            <div
              className="absolute top-3.5 w-3.5 h-3.5 rounded-full -translate-x-1/2 -translate-y-1/2 bg-[#EFB94E] shadow-[0_0_0_4px_rgba(239,185,78,0.22),0_0_14px_rgba(239,185,78,0.90)]"
              style={{ left: `${youPos}%` }}
              title="You"
            />
            {/* Them Dot (Deep Forest Green) */}
            <div
              className="absolute top-3.5 w-3.5 h-3.5 rounded-full -translate-x-1/2 -translate-y-1/2 bg-[#3D7A5A] shadow-[0_0_0_4px_rgba(45,82,62,0.30),0_0_14px_rgba(45,82,62,0.90)]"
              style={{ left: `${themPos}%` }}
              title={themName}
            />
          </div>
        </div>
      ) : null}

      {/* Consequence sentence */}
      <p className="text-[13.5px] leading-relaxed text-[rgba(245,242,234,0.80)] mt-3">
        {consequenceSentence}
      </p>
    </div>
  );
}
