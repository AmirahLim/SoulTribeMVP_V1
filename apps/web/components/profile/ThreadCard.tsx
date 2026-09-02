'use client';

import React, { useState } from 'react';
import { getThreadColor, ThreadColorSpec } from '@soul-tribe/tokens';

export interface SignalItem {
  key: string;
  label: string;
  source?: string;
  evidenceLevel?: 'DIRECT' | 'SUPPORTED INFERENCE' | 'CROSS-THREAD PATTERN';
}

export interface ThreadData {
  key: string;
  name: string;
  heroDescriptor: string[]; // 3 words, e.g. ["Intimate", "Selective", "Calm"]
  strength: number; // 0..1
  confidence: number; // 0..1
  naturalSetting?: string;
  socialMeaning?: string;
  thriveWhen?: string;
  potentialFriction?: string;
  signals?: SignalItem[];
  // Data for thread visualizers
  extraVisualData?: Record<string, any>;
}

export interface ThreadCardProps {
  thread: ThreadData;
  className?: string;
}

export function ThreadCard({ thread, className = '' }: ThreadCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colorSpec: ThreadColorSpec = getThreadColor(thread.key || thread.name);

  const descriptorText = thread.heroDescriptor.join(' · ');

  return (
    <div
      className={`relative rounded-[22px] p-6 transition-all duration-300 ${className}`}
      style={{
        backgroundColor: colorSpec.surface,
        color: colorSpec.ink,
      }}
    >
      {/* Collapsed Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">
            Connection Thread
          </span>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: colorSpec.ink }}>
            {colorSpec.name}
          </h2>
          <p className="mt-1 text-xs font-semibold tracking-wide opacity-85">
            {descriptorText}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded-full border px-3 py-1 text-xs font-semibold transition-all hover:opacity-80"
          style={{
            borderColor: `${colorSpec.ink}33`,
            color: colorSpec.ink,
          }}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Thread Visualisation */}
      <div className="my-4 border-t border-b py-3 opacity-90" style={{ borderColor: `${colorSpec.ink}20` }}>
        {renderThreadVisual(thread, colorSpec)}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 flex flex-col gap-4 border-t pt-4 text-xs leading-relaxed" style={{ borderColor: `${colorSpec.ink}25` }}>
          {thread.naturalSetting && (
            <div>
              <p className="font-bold uppercase tracking-wider text-[10px] opacity-75">Your Natural Setting</p>
              <p className="mt-0.5 font-medium">{thread.naturalSetting}</p>
            </div>
          )}

          {thread.socialMeaning && (
            <div>
              <p className="font-bold uppercase tracking-wider text-[10px] opacity-75">What This Means Socially</p>
              <p className="mt-0.5 font-medium">{thread.socialMeaning}</p>
            </div>
          )}

          {thread.thriveWhen && (
            <div>
              <p className="font-bold uppercase tracking-wider text-[10px] opacity-75">You May Thrive When</p>
              <p className="mt-0.5 font-medium">{thread.thriveWhen}</p>
            </div>
          )}

          {thread.potentialFriction && (
            <div>
              <p className="font-bold uppercase tracking-wider text-[10px] opacity-75">Potential Friction</p>
              <p className="mt-0.5 font-medium">{thread.potentialFriction}</p>
            </div>
          )}

          {thread.signals && thread.signals.length > 0 && (
            <div className="mt-1">
              <p className="font-bold uppercase tracking-wider text-[10px] opacity-75">
                Signals Behind This ({thread.signals.length})
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {thread.signals.map((sig, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      borderColor: `${colorSpec.ink}30`,
                      backgroundColor: `${colorSpec.ink}10`,
                      color: colorSpec.ink,
                    }}
                  >
                    <span>{sig.label}</span>
                    {sig.evidenceLevel && (
                      <span className="opacity-60 text-[9px]">[{sig.evidenceLevel}]</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderThreadVisual(thread: ThreadData, colorSpec: ThreadColorSpec) {
  const val = Math.max(0.1, Math.min(0.9, thread.strength));

  switch (thread.key) {
    case 'personality':
    case 'Social Energy':
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] font-semibold opacity-75">
            <span>Selective 1-on-1</span>
            <span>Expansive Groups</span>
          </div>
          <div className="relative h-2.5 w-full rounded-full" style={{ backgroundColor: `${colorSpec.ink}20` }}>
            <div
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 shadow-sm transition-all"
              style={{
                left: `${val * 100}%`,
                backgroundColor: colorSpec.ink,
                borderColor: colorSpec.surface,
              }}
            />
          </div>
        </div>
      );

    case 'communication':
    case 'Communication':
      return (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold opacity-75">Async Rhythm</span>
          <div className="flex flex-1 gap-1">
            {[0.8, 0.4, 0.9, 0.3, 0.7, 0.5, 0.85].map((height, i) => (
              <div
                key={i}
                className="h-4 flex-1 rounded-sm transition-all"
                style={{
                  backgroundColor: colorSpec.ink,
                  opacity: i % 2 === 0 ? height : height * 0.4,
                }}
              />
            ))}
          </div>
          <span className="text-[11px] font-semibold opacity-75">Real-time</span>
        </div>
      );

    case 'social_rhythm':
    case 'Social Rhythm':
      return (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-semibold opacity-75">
            <span>Weekly Availability</span>
            <span>{thread.extraVisualData?.slotsCount || '3 slots'}</span>
          </div>
          <div className="flex gap-1.5">
            {['Mon', 'Wed', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div
                key={day}
                className="flex flex-1 flex-col items-center rounded-md p-1 text-[10px] font-bold"
                style={{
                  backgroundColor: idx % 2 === 1 ? `${colorSpec.ink}25` : `${colorSpec.ink}10`,
                  color: colorSpec.ink,
                }}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="opacity-75">Thread Strength</span>
          <div className="h-2 w-36 rounded-full" style={{ backgroundColor: `${colorSpec.ink}20` }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${val * 100}%`,
                backgroundColor: colorSpec.ink,
              }}
            />
          </div>
        </div>
      );
  }
}
