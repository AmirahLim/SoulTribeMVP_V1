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
    <div className={`flex flex-col gap-4 rounded-[24px] border border-[#F3F0E9]/12 bg-[#2B1A17] p-5 shadow-lg ${className}`}>
      <div className="flex items-center justify-between border-b border-[#F3F0E9]/10 pb-3">
        <h3 className="text-[17px] font-bold text-[#F3F0E9]">Social DNA Index</h3>
        <span className="rounded-full bg-[#074710] px-3 py-1 text-[11px] font-bold text-[#F3F0E9]">
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

              {/* Progress Bar in Emerald Green to Dark Wood */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#4A2C2A]/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#016401] via-[#074710] to-[#654422]"
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
