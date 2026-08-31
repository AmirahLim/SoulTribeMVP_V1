'use client';

import React from 'react';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function Chip({
  label,
  selected = false,
  onClick,
  icon,
  className = '',
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-[999px] px-3.5 py-1.5 text-[14px] font-medium transition-all duration-150 ${
        selected
          ? 'bg-[#C85A32] text-[#FFFDF9] shadow-sm ring-1 ring-[#C85A32]'
          : 'border border-[#2D2118]/10 bg-[#FFFDF9] text-[#2D2118] hover:bg-[#EFE5D8]'
      } ${className}`}
    >
      {icon && <span className="text-[14px]">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
