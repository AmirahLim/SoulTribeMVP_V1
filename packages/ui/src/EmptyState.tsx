'use client';

import React from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  illustration?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  illustration,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-[28px] border border-[#2D2118]/10 bg-[#FFFDF9] p-8 text-center shadow-sm ${className}`}>
      {illustration ? (
        <div className="mb-4">{illustration}</div>
      ) : (
        /* Default illustrated scene */
        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#EFE5D8]">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C85A32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 3 12 h 18" />
            <path d="M 5 12 v 8" />
            <path d="M 19 12 v 8" />
            <path d="M 8 7 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0" />
            <path d="M 14 7 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0" />
          </svg>
        </div>
      )}

      <h3
        className="text-[24px] font-semibold text-[#2D2118]"
        style={{ fontFamily: 'var(--font-fraunces), serif' }}
      >
        {title}
      </h3>

      <p className="mt-2 max-w-[320px] text-[15px] leading-[23px] text-[#4A3B30]">
        {description}
      </p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-[16px] bg-[#C85A32] px-6 py-2.5 text-[15px] font-medium text-[#FFFDF9] shadow-sm transition-all hover:bg-[#a84723]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
