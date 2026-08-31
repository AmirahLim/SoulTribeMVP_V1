'use client';

import React from 'react';

export interface RhythmStripProps {
  userAvailability?: string[]; // e.g. ['fri_eve', 'sat_midday']
  candidateAvailability?: string[];
  interactive?: boolean;
  onToggleSlot?: (slotId: string) => void;
  className?: string;
}

const DAYS = ['Fri', 'Sat', 'Sun'];
const TIMES = [
  { key: 'morn', label: 'Morn' },
  { key: 'midday', label: 'Mid' },
  { key: 'eve', label: 'Eve' },
];

export function RhythmStrip({
  userAvailability = [],
  candidateAvailability = [],
  interactive = false,
  onToggleSlot,
  className = '',
}: RhythmStripProps) {
  const isComparison = candidateAvailability.length > 0;

  return (
    <div className={`flex flex-col gap-2 rounded-[20px] border border-[#F3F0E9]/12 bg-[#2B1A17] p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
        <span>Rhythm Availability Strip</span>
        {isComparison && (
          <span className="flex items-center gap-3 text-[11px] font-medium text-[#A6AAA4]">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#016401]" /> Both
            </span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-1">
        {DAYS.map((day) => (
          <div key={day} className="flex flex-col gap-1 text-center">
            <span className="text-[11px] font-bold text-[#A6AAA4]">{day}</span>
            <div className="flex flex-col gap-1">
              {TIMES.map((time) => {
                const slotId = `${day.toLowerCase()}_${time.key}`;
                const hasUser = userAvailability.includes(slotId);
                const hasCandidate = candidateAvailability.includes(slotId);
                const isMatch = hasUser && hasCandidate;

                let cellBg = 'bg-[#0D1D15] border border-[#F3F0E9]/10 text-[#A6AAA4]';
                if (isComparison) {
                  if (isMatch) {
                    cellBg = 'bg-[#016401] text-[#F3F0E9] font-bold';
                  } else if (hasUser || hasCandidate) {
                    cellBg = 'bg-[#074710]/50 text-[#F3F0E9]';
                  }
                } else if (hasUser) {
                  cellBg = 'bg-[#016401] text-[#F3F0E9] font-bold';
                }

                return (
                  <button
                    key={time.key}
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && onToggleSlot?.(slotId)}
                    className={`rounded-[10px] py-1.5 text-[11px] font-medium transition-all ${cellBg} ${
                      interactive ? 'hover:border-[#016401]' : ''
                    }`}
                  >
                    {time.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
