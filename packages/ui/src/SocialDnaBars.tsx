'use client';

import React from 'react';

export interface SocialDnaCategory {
  key: string;
  name: string;
  score: number; // 0..100
  catNum?: number;
}

export interface SocialDnaBarsProps {
  categories: SocialDnaCategory[];
  title?: string;
  className?: string;
}

export function SocialDnaBars({ categories, title = 'Your Tribal Print', className = '' }: SocialDnaBarsProps) {
  return (
    <div className={`flex flex-col gap-4 rounded-[28px] border border-emerald-500/30 bg-[#112519]/90 p-5 shadow-2xl backdrop-blur-xl ${className}`}>
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
        <div>
          <h3 className="text-[18px] font-extrabold text-[#FFFDF9] tracking-tight">{title}</h3>
          <p className="text-[11.5px] text-emerald-200/80 mt-0.5">Calculated live from completed Deeper Tribal Pass sections</p>
        </div>
        <span className="rounded-full bg-emerald-900/60 border border-emerald-400/40 px-3 py-1 text-[11px] font-bold text-emerald-100">
          Live Vectors
        </span>
      </div>

      <div className="flex flex-col gap-3.5 mt-1">
        {categories.map((cat) => {
          const pct = Math.round(cat.score);
          const isFilled = pct > 0;

          return (
            <div key={cat.key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#FFFDF9] font-bold flex items-center gap-1.5">
                  {cat.name}
                  {!isFilled && (
                    <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-300/60 border border-emerald-500/20">
                      Section {cat.catNum} Unfilled
                    </span>
                  )}
                </span>
                <span className={`text-[12px] font-bold ${isFilled ? 'text-[#FFFDF9]' : 'text-emerald-300/40'}`}>
                  {isFilled ? `${pct}%` : '0%'}
                </span>
              </div>

              {/* Progress Bar in Crisp White & Deep Green Base */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#0D1D15] border border-emerald-500/20">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFilled ? 'bg-[#FFFDF9] shadow-sm' : 'bg-emerald-500/20 w-0'
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
