'use client';

import React from 'react';

export interface RhythmStripProps {
  userAvailability?: string[]; // e.g. ['fri_eve', 'sat_midday']
  candidateAvailability?: string[];
  interactive?: boolean;
  onToggleSlot?: (slotId: string) => void;
  className?: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = [
  { key: 'morn', label: 'Morn' },
  { key: 'midday', label: 'Mid' },
  { key: 'eve', label: 'Eve' },
];

function isSlotActive(availability: string[], day: string, timeKey: string): boolean {
  if (!Array.isArray(availability)) return false;
  const dayPrefix = day.toLowerCase();
  return availability.some((slot) => {
    if (typeof slot !== 'string') return false;
    const s = slot.toLowerCase();

    // Canonical slot match (e.g. mon_morn, fri_eve)
    if (s.includes(dayPrefix)) {
      if (timeKey === 'morn') return s.includes('morn');
      if (timeKey === 'midday') return s.includes('mid') || s.includes('afternoon') || s.includes('day');
      if (timeKey === 'eve') return s.includes('eve') || s.includes('night');
    }

    // Legacy slot fallback match
    if (s.includes('weekday') && ['mon', 'tue', 'wed', 'thu'].includes(dayPrefix) && timeKey === 'eve') return true;
    if (s.includes('fri') && s.includes('night') && dayPrefix === 'fri' && timeKey === 'eve') return true;
    if (s.includes('sat') && (s.includes('day') || s.includes('mid')) && dayPrefix === 'sat' && timeKey === 'midday') return true;
    if (s.includes('sat') && s.includes('night') && dayPrefix === 'sat' && timeKey === 'eve') return true;
    if (s.includes('sun') && (s.includes('day') || s.includes('mid')) && dayPrefix === 'sun' && timeKey === 'midday') return true;
    if (s.includes('sun') && s.includes('night') && dayPrefix === 'sun' && timeKey === 'eve') return true;

    return false;
  });
}

export function RhythmStrip({
  userAvailability = [],
  candidateAvailability = [],
  interactive = false,
  onToggleSlot,
  className = '',
}: RhythmStripProps) {
  const isInteractive = interactive || Boolean(onToggleSlot);
  const isComparison = candidateAvailability.length > 0;

  return (
    <div className={`flex flex-col gap-2 rounded-[20px] border border-[#F3F0E9]/15 bg-[#15261C] p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
        <span>Weekly Availability Strip</span>
        {isComparison ? (
          <span className="flex items-center gap-3 text-[11px] font-medium text-[#A6AAA4]">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#F3F0E9]" /> Both
            </span>
          </span>
        ) : isInteractive ? (
          <span className="text-[10.5px] font-semibold text-emerald-400/90 lowercase tracking-normal">
            tap to toggle slots
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-1 overflow-x-auto min-w-[320px]">
        {DAYS.map((day) => (
          <div key={day} className="flex flex-col gap-1 text-center">
            <span className="text-[11px] font-bold text-[#A6AAA4]">{day}</span>
            <div className="flex flex-col gap-1">
              {TIMES.map((time) => {
                const slotId = `${day.toLowerCase()}_${time.key}`;
                const hasUser = isSlotActive(userAvailability, day, time.key);
                const hasCandidate = isSlotActive(candidateAvailability, day, time.key);
                const isMatch = hasUser && hasCandidate;

                let cellBg = 'bg-[#0D1D15] border border-[#F3F0E9]/15 text-[#A6AAA4]';
                if (isComparison) {
                  if (isMatch) {
                    cellBg = 'bg-[#F3F0E9] text-[#0D1D15] font-bold border-[#F3F0E9] shadow-sm';
                  } else if (hasUser || hasCandidate) {
                    cellBg = 'bg-[#1C3325] text-[#F3F0E9] border-[#F3F0E9]/30';
                  }
                } else if (hasUser) {
                  cellBg = 'bg-[#F3F0E9] text-[#0D1D15] font-extrabold border-[#F3F0E9] shadow-md scale-[1.02]';
                }

                return (
                  <button
                    key={time.key}
                    type="button"
                    disabled={!isInteractive}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isInteractive && onToggleSlot) {
                        onToggleSlot(slotId);
                      }
                    }}
                    className={`rounded-[10px] py-2 text-[11.5px] font-semibold transition-all duration-150 ${cellBg} ${
                      isInteractive
                        ? 'cursor-pointer hover:border-[#F3F0E9]/60 active:scale-95'
                        : 'cursor-default'
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
