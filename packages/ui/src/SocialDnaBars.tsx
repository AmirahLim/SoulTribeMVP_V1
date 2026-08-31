'use client';

import React from 'react';
import Link from 'next/link';

export interface SocialDnaCategory {
  key: string;
  name: string;
  score: number; // 0..100
  catNum?: number;
}

export interface SocialDnaBarsProps {
  categories: SocialDnaCategory[];
  className?: string;
}

export function SocialDnaBars({ categories, className = '' }: SocialDnaBarsProps) {
  return (
    <div className={`flex flex-col gap-4 rounded-[24px] border border-white/20 bg-black/60 p-5 shadow-lg backdrop-blur-xl ${className}`}>
      <div className="flex items-center justify-between border-b border-white/15 pb-3">
        <div>
          <h3 className="text-[17px] font-bold text-white">Social DNA Index</h3>
          <p className="text-[11.5px] text-white/70">Calculated live from completed Deeper Tribal Pass sections</p>
        </div>
        <span className="rounded-full bg-white/20 border border-white/30 px-3 py-1 text-[11px] font-bold text-white">
          Dynamic Vectors
        </span>
      </div>

      <div className="flex flex-col gap-3.5 mt-1">
        {categories.map((cat) => {
          const pct = Math.round(cat.score);
          const isFilled = pct > 0;

          return (
            <div key={cat.key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-white font-bold flex items-center gap-1.5">
                  {cat.name}
                  {!isFilled && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/60 border border-white/15">
                      Section {cat.catNum} Unfilled
                    </span>
                  )}
                </span>
                <span className={`text-[12px] font-bold ${isFilled ? 'text-white' : 'text-white/40'}`}>
                  {isFilled ? `${pct}%` : '0%'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-black/60 border border-white/15">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFilled ? 'bg-white shadow-sm' : 'bg-white/10 w-0'
                  }`}
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
