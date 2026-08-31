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
    <div className={`flex flex-col gap-3 rounded-[24px] border border-[#1C3A27]/08 bg-[#F6F1EA] p-4 ${className}`}>
      {/* 1. WHY YOU MIGHT CLICK */}
      <div>
        <div className="mb-1 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#C85A32]" />
          <h4 className="text-[10px] font-bold tracking-wider text-[#C85A32] uppercase">
            Why you might click
          </h4>
        </div>
        <p className="text-[13.5px] font-medium leading-[20px] text-[#1C2B22]">
          {clickText}
        </p>
      </div>

      {/* 2. WHERE YOU MIGHT RUB */}
      {actualRubText && (
        <div className="rounded-[18px] border border-[#1C3A27]/10 bg-[#FFFDF9] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[#3A4D42]">
            <span className="text-[12px] font-bold text-[#3A4D42]">✕</span>
            <h4 className="text-[10px] font-bold tracking-wider text-[#3A4D42] uppercase">
              Where you might rub
            </h4>
          </div>
          <p className="text-[13px] font-medium leading-[19px] text-[#3A4D42]">
            {actualRubText}
          </p>
        </div>
      )}
    </div>
  );
}
