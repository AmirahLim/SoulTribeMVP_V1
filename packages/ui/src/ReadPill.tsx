'use client';

import React from 'react';

export interface ReadPillProps {
  label: string; // e.g. "Deep read · 61 signals"
  tone?: 'amber' | 'emerald';
  className?: string;
}

export function ReadPill({ label, tone = 'emerald', className = '' }: ReadPillProps) {
  const isEmerald = tone === 'emerald';

  return (
    <span
      className={`inline-flex items-center gap-1.75 px-3 py-1 rounded-full text-[11px] font-semibold border ${
        isEmerald
          ? 'bg-[rgba(91,217,154,0.12)] border-[rgba(91,217,154,0.28)] text-[#5BD99A]'
          : 'bg-[rgba(239,185,78,0.12)] border-[rgba(239,185,78,0.28)] text-[#EFB94E]'
      } ${className}`}
    >
      <i
        className="w-1.25 h-1.25 rounded-full"
        style={{
          backgroundColor: isEmerald ? '#5BD99A' : '#EFB94E',
          boxShadow: `0 0 8px ${isEmerald ? '#5BD99A' : '#EFB94E'}`,
        }}
      />
      <span>{label}</span>
    </span>
  );
}
