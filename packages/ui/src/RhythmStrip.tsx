'use client';

import React from 'react';

export interface RhythmStripProps {
  userAvailability: string[]; // e.g. ['mon_evening', 'sat_midday']
  theirAvailability?: string[]; // for match overlay comparison
  interactive?: boolean;
  onToggleSlot?: (slotId: string) => void;
  className?: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BLOCKS = ['morning', 'midday', 'evening', 'late'];

export function RhythmStrip({
  userAvailability = [],
  theirAvailability,
  interactive = false,
  onToggleSlot,
  className = '',
}: RhythmStripProps) {
  const userSet = new Set(userAvailability);
  const typeSet = theirAvailability ? new Set(theirAvailability) : null;

  return (
    <div className={`w-full overflow-hidden rounded-[20px] border border-[#2B211B]/10 bg-[#FFFDFA] p-3.5 shadow-sm ${className}`}>
      <div className="mb-2 flex items-center justify-between text-[12px] font-medium text-[#5C4E44]">
        <span>Rhythm Availability</span>
        {theirAvailability && (
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#EFA93C]" /> Mine
            <span className="inline-block h-2 w-2 rounded-full bg-[#3E6B5C]" /> Theirs
            <span className="inline-block h-2 w-2 rounded-full bg-[#D9663F] ring-2 ring-[#EFA93C]" /> Both
          </span>
        )}
      </div>

      {/* 7 Columns (Days) x 4 Rows (Blocks) */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((day, dIdx) => (
          <div key={day} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold tracking-wider text-[#8A7D73] uppercase">
              {day}
            </span>
            <div className="flex w-full flex-col gap-1">
              {BLOCKS.map((block) => {
                const dayCode = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][dIdx];
                const slotId = `${dayCode}_${block}`;
                const hasMine = userSet.has(slotId);
                const hasTheirs = typeSet ? typeSet.has(slotId) : false;
                const isOverlap = hasMine && hasTheirs;

                let cellBg = 'bg-[#F5EDE1]/50';
                if (isOverlap) {
                  cellBg = 'bg-[#D9663F] shadow-[0_0_8px_rgba(217,102,63,0.6)] ring-1 ring-[#EFA93C]';
                } else if (hasMine && hasTheirs === false) {
                  cellBg = 'bg-[#EFA93C]/85';
                } else if (!hasMine && hasTheirs) {
                  cellBg = 'bg-[#3E6B5C]/85';
                } else if (hasMine && !typeSet) {
                  cellBg = 'bg-[#EFA93C]';
                }

                return (
                  <button
                    key={slotId}
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && onToggleSlot?.(slotId)}
                    title={`${day} ${block}`}
                    className={`h-5 w-full rounded-[6px] transition-all duration-200 ${cellBg} ${
                      interactive ? 'hover:ring-2 hover:ring-[#D9663F]' : ''
                    }`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
