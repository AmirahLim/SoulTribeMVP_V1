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
      className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-all ${
        selected
          ? 'bg-[#C85A32] text-[#FFFDF9] shadow-sm'
          : 'border border-[#1C3A27]/10 bg-[#FFFDF9] text-[#3A4D42] hover:bg-[#EBDDD0]'
      } ${className}`}
    >
      {label}
    </button>
  );
}
