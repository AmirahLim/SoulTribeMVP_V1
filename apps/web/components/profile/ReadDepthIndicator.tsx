'use client';

import React from 'react';

export interface ReadDepthIndicatorProps {
  signalCount: number;
  className?: string;
}

export function computeEvidenceReadLevel(count: number): { label: string; tier: 'early' | 'developing' | 'deep' } {
  if (count >= 55) {
    return { label: `Deep read · ${count} signals`, tier: 'deep' };
  }
  if (count >= 25) {
    return { label: `Developing read · ${count} signals`, tier: 'developing' };
  }
  return { label: `Early read · based on ${count} signals`, tier: 'early' };
}

export function ReadDepthIndicator({ signalCount, className = '' }: ReadDepthIndicatorProps) {
  const { label, tier } = computeEvidenceReadLevel(signalCount);

  const tierStyles = {
    early: 'bg-[#F0E7D6]/20 text-[#3A3020] border-[#3A3020]/20',
    developing: 'bg-[#D9E4D2]/25 text-[#24352A] border-[#24352A]/20',
    deep: 'bg-[#D2E8E0]/30 text-[#1E3A33] border-[#1E3A33]/20',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-semibold tracking-wide ${tierStyles[tier]} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {label}
    </span>
  );
}
