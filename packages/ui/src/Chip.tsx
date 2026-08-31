'use client';

import React from 'react';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ label, selected = false, onClick, className = '' }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-[12px] px-3.5 py-1.5 text-[13px] font-semibold transition-all ${
        selected
          ? 'bg-[#F3F0E9] text-[#0D1D15] shadow-sm'
          : 'border border-[#F3F0E9]/15 bg-[#15261C] text-[#F3F0E9] hover:border-[#F3F0E9]/40'
      } ${className}`}
    >
      {label}
    </button>
  );
}
