'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface SocialDnaCategory {
  key: string;
  name: string;
  score: number; // 0..100
  filledBlocks?: number;
}

export interface SocialDnaBarsProps {
  categories?: SocialDnaCategory[];
  className?: string;
}

export const DEFAULT_SOCIAL_DNA_CATEGORIES: SocialDnaCategory[] = [
  { key: 'personality', name: 'Personality', score: 80 },
  { key: 'communication', name: 'Communication', score: 90 },
  { key: 'rhythm', name: 'Social Rhythm', score: 70 },
  { key: 'intent', name: 'Friendship Intent', score: 100 },
  { key: 'emotional', name: 'Emotional Style', score: 80 },
  { key: 'interests', name: 'Interests', score: 65 },
  { key: 'values', name: 'Values', score: 90 },
  { key: 'lifestyle', name: 'Lifestyle', score: 75 },
];

export function SocialDnaBars({
  categories = DEFAULT_SOCIAL_DNA_CATEGORIES,
  className = '',
}: SocialDnaBarsProps) {
  return (
    <div className={`w-full rounded-[28px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-5 shadow-[0_8px_24px_-6px_rgba(61,46,36,0.06)] backdrop-blur-md ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[16px] font-bold tracking-tight text-[#3D2E24]">
          Social DNA Index
        </h3>
        <span className="rounded-full bg-[#2E5345]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#2E5345]">
          Active Vector
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {categories.map((cat, idx) => {
          const pct = typeof cat.score === 'number' && cat.score <= 1 ? Math.round(cat.score * 100) : cat.score;
          
          return (
            <div key={cat.key || idx} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[13px] font-semibold text-[#3D2E24]">
                <span className="tracking-tight">{cat.name}</span>
                <span className="text-[12px] font-bold text-[#C85A32]">{pct}%</span>
              </div>

              {/* Sleek Opal-Style Progress Track */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#EFE5D8]/80 p-0.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#C85A32] via-[#D69336] to-[#2E5345]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
