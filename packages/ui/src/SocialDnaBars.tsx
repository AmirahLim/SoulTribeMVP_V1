'use client';

import React from 'react';

export interface SocialDnaCategory {
  key: string;
  name: string;
  score: number; // 0..100
}

export interface SocialDnaBarsProps {
  categories: SocialDnaCategory[];
  className?: string;
}

export function SocialDnaBars({ categories, className = '' }: SocialDnaBarsProps) {
  return (
    <div className={`flex flex-col gap-4 rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg ${className}`}>
      <div className="flex items-center justify-between border-b border-[#F3F0E9]/10 pb-3">
        <h3 className="text-[17px] font-bold text-[#F3F0E9]">Social DNA Index</h3>
        <span className="rounded-full bg-[#0D1D15] border border-[#F3F0E9]/20 px-3 py-1 text-[11px] font-bold text-[#F3F0E9]">
          Active Vector
        </span>
      </div>

      <div className="flex flex-col gap-3.5 mt-1">
        {categories.map((cat) => {
          const pct = Math.round(cat.score);
          return (
            <div key={cat.key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[13px] font-medium">
                <span className="text-[#F3F0E9] font-semibold">{cat.name}</span>
                <span className="text-[12px] font-bold text-[#F3F0E9]">{pct}%</span>
              </div>

              {/* Progress Bar in Monochromatic Dark Green & White */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#0D1D15]">
                <div
                  className="h-full rounded-full bg-[#F3F0E9]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
