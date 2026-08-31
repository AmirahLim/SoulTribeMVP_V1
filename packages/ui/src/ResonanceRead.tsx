'use client';

import React from 'react';

export interface ResonanceReadProps {
  clickText: string;
  rubText?: string;
  frictionText?: string;
  className?: string;
}

export function ResonanceRead({
  clickText,
  rubText,
  frictionText,
  className = '',
}: ResonanceReadProps) {
  const actualRubText = rubText || frictionText || '';

  return (
    <div className={`flex flex-col gap-3.5 py-1 ${className}`}>
      {/* 1. WHY YOU MIGHT CLICK */}
      <div>
        <span className="text-[10px] font-bold tracking-widest text-[#D49B4B] uppercase">
          Why you might click
        </span>
        <p className="mt-1 text-[14px] font-medium leading-relaxed text-[#F3F0E9]">
          {clickText}
        </p>
      </div>

      {/* 2. WHERE YOU MIGHT RUB */}
      {actualRubText && (
        <div className="border-t border-[#F3F0E9]/10 pt-3">
          <span className="text-[10px] font-bold tracking-widest text-[#A6AAA4] uppercase">
            Where you might rub
          </span>
          <p className="mt-1 text-[13.5px] font-medium leading-relaxed text-[#A6AAA4]">
            {actualRubText}
          </p>
        </div>
      )}
    </div>
  );
}
