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
  note?: string;
  naturalSetting?: string;
  socialMeaning?: string;
  thriveWhen?: string;
  potentialFriction?: string;
  signals?: SignalItem[];
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
      className={`relative rounded-[26px] p-5 backdrop-blur-xl transition-all duration-300 ${className}`}
      style={{
        backgroundColor: 'rgba(10,12,11,0.62)',
        border: '1px solid rgba(245,242,234,0.11)',
        boxShadow: '0 22px 48px -26px rgba(0,0,0,0.9), inset 0 1px 0 rgba(245,242,234,0.22)',
      }}
    >
      {/* Thread Radial Color Wash */}
      <div
        className="absolute inset-0 pointer-events-none opacity-85"
        style={{
          background: `radial-gradient(120% 80% at 12% 0%, ${colorSpec.wash} 0%, transparent 62%)`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-['Bricolage_Grotesque'] text-xl font-semibold text-[#F5F2EA]">
              {colorSpec.name}
            </h3>
            <p className="text-xs text-[rgba(245,242,234,0.44)] mt-0.5 tracking-wide">
              {descriptorText}
            </p>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-full border border-[rgba(245,242,234,0.11)] bg-[rgba(255,255,255,0.04)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[rgba(245,242,234,0.44)] transition-all hover:text-[#F5F2EA]"
          >
            {expanded ? 'Collapse' : 'Open'}
          </button>
        </div>

        {/* Drawn Visualisation Object */}
        <div className="my-3">
          {renderThreadVisual(thread, colorSpec)}
        </div>

        {/* Note copy */}
        {thread.note && (
          <p className="text-[12.5px] leading-relaxed text-[rgba(245,242,234,0.70)] mt-3">
            {thread.note}
          </p>
        )}

        {/* Expanded Signals Details */}
        {expanded && (
          <div className="mt-4 border-t border-[rgba(245,242,234,0.08)] pt-3.5 flex flex-col gap-3 text-xs leading-relaxed text-[rgba(245,242,234,0.70)]">
            {thread.naturalSetting && (
              <div>
                <p className="font-bold uppercase tracking-wider text-[10px] text-[rgba(245,242,234,0.44)]">Natural Setting</p>
                <p className="mt-0.5 text-[#F5F2EA]">{thread.naturalSetting}</p>
              </div>
            )}

            {thread.thriveWhen && (
              <div>
                <p className="font-bold uppercase tracking-wider text-[10px] text-[rgba(245,242,234,0.44)]">You Thrive When</p>
                <p className="mt-0.5 text-[#F5F2EA]">{thread.thriveWhen}</p>
              </div>
            )}

            {thread.signals && thread.signals.length > 0 && (
              <div>
                <p className="font-bold uppercase tracking-wider text-[10px] text-[rgba(245,242,234,0.44)] mb-1.5">
                  Signals ({thread.signals.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {thread.signals.map((sig, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-[rgba(245,242,234,0.15)] bg-[rgba(255,255,255,0.04)] px-2.5 py-0.5 text-[11px] font-medium text-[#F5F2EA]"
                    >
                      {sig.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function renderThreadVisual(thread: ThreadData, colorSpec: ThreadColorSpec) {
  switch (thread.key) {
    case 'personality':
    case 'Social Energy':
      // Room diagram: four dot-clusters (1:1 / 3-4 / 5-8 / Crowd), member's setting lit in emerald
      const activeGroup = thread.extraVisualData?.activeGroup || '3–4';

      return (
        <div className="flex items-end gap-5 pt-2 pb-1">
          {/* 1:1 */}
          <div className={`flex flex-col items-center gap-2 flex-1 ${activeGroup === '1:1' ? 'text-[#5BD99A]' : 'text-[rgba(245,242,234,0.22)]'}`}>
            <div className="flex flex-wrap gap-1 w-11 justify-center items-end min-h-[34px]">
              <span className={`w-1.75 h-1.75 rounded-full ${activeGroup === '1:1' ? 'bg-[#5BD99A] shadow-[0_0_7px_rgba(91,217,154,0.8)]' : 'bg-[rgba(245,242,234,0.16)]'}`} />
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase">1:1</span>
          </div>

          {/* 3-4 */}
          <div className={`flex flex-col items-center gap-2 flex-1 ${activeGroup === '3–4' || activeGroup === '3-4' ? 'text-[#5BD99A]' : 'text-[rgba(245,242,234,0.22)]'}`}>
            <div className="flex flex-wrap gap-1 w-11 justify-center items-end min-h-[34px]">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className={`w-1.75 h-1.75 rounded-full ${activeGroup === '3–4' || activeGroup === '3-4' ? 'bg-[#5BD99A] shadow-[0_0_7px_rgba(91,217,154,0.8)]' : 'bg-[rgba(245,242,234,0.16)]'}`} />
              ))}
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase">3–4</span>
          </div>

          {/* 5-8 */}
          <div className={`flex flex-col items-center gap-2 flex-1 ${activeGroup === '5–8' || activeGroup === '5-8' ? 'text-[#5BD99A]' : 'text-[rgba(245,242,234,0.22)]'}`}>
            <div className="flex flex-wrap gap-1 w-11 justify-center items-end min-h-[34px]">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <span key={i} className={`w-1.75 h-1.75 rounded-full ${activeGroup === '5–8' || activeGroup === '5-8' ? 'bg-[#5BD99A] shadow-[0_0_7px_rgba(91,217,154,0.8)]' : 'bg-[rgba(245,242,234,0.16)]'}`} />
              ))}
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase">5–8</span>
          </div>

          {/* Crowd */}
          <div className={`flex flex-col items-center gap-2 flex-1 ${activeGroup === 'Crowd' ? 'text-[#5BD99A]' : 'text-[rgba(245,242,234,0.22)]'}`}>
            <div className="flex flex-wrap gap-1 w-11 justify-center items-end min-h-[34px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <span key={i} className={`w-1.75 h-1.75 rounded-full ${activeGroup === 'Crowd' ? 'bg-[#5BD99A] shadow-[0_0_7px_rgba(91,217,154,0.8)]' : 'bg-[rgba(245,242,234,0.16)]'}`} />
              ))}
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase">Crowd</span>
          </div>
        </div>
      );

    case 'communication':
    case 'Communication':
      // Rhythm wave SVG path with area fill and marked peaks
      return (
        <div>
          <svg viewBox="0 0 320 62" preserveAspectRatio="none" className="w-full h-[62px] block" aria-hidden="true">
            <defs>
              <linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#5BD99A" stopOpacity=".9"/>
                <stop offset="1" stopColor="#5BD99A" stopOpacity=".25"/>
              </linearGradient>
              <linearGradient id="wf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5BD99A" stopOpacity=".22"/>
                <stop offset="1" stopColor="#5BD99A" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0,48 C26,48 26,18 52,18 C78,18 78,50 104,50 C130,50 130,26 156,26 C182,26 182,52 208,52 C234,52 234,32 260,32 C286,32 286,44 320,44 L320,62 L0,62 Z" fill="url(#wf)"/>
            <path d="M0,48 C26,48 26,18 52,18 C78,18 78,50 104,50 C130,50 130,26 156,26 C182,26 182,52 208,52 C234,52 234,32 260,32 C286,32 286,44 320,44" fill="none" stroke="url(#wg)" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="52" cy="18" r="4" fill="#5BD99A"/>
            <circle cx="156" cy="26" r="4" fill="#5BD99A"/>
            <circle cx="260" cy="32" r="3.4" fill="#5BD99A" opacity=".55"/>
          </svg>
          <div className="flex justify-between text-[10.5px] text-[rgba(245,242,234,0.22)] mt-2 font-medium tracking-wide">
            <span>Weeks between</span>
            <span>Constant contact</span>
          </div>
        </div>
      );

    case 'intent':
    case 'Friendship Style':
      // 2-axis map: Close ↕ Independent × Few ↔ Many with glowing amber dot
      const posX = thread.extraVisualData?.mapX || 34; // %
      const posY = thread.extraVisualData?.mapY || 36; // %

      return (
        <div className="relative h-[150px] rounded-xl bg-gradient-to-b from-[rgba(255,255,255,0.035)] to-[rgba(255,255,255,0.012)] border border-[rgba(245,242,234,0.11)] overflow-hidden">
          {/* Vertical axis line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[rgba(245,242,234,0.07)]" />
          {/* Horizontal axis line */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[rgba(245,242,234,0.07)]" />

          {/* Corrected Axis Labels */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9.5px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
            Close
          </span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9.5px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
            Independent
          </span>
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9.5px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
            Few
          </span>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9.5px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
            Many
          </span>

          {/* Glowing amber dot at member position */}
          <div
            className="absolute w-3.5 h-3.5 rounded-full -translate-x-1/2 -translate-y-1/2 bg-[#EFB94E] shadow-[0_0_0_5px_rgba(239,185,78,0.18),0_0_18px_rgba(239,185,78,0.9)]"
            style={{ left: `${posX}%`, top: `${posY}%` }}
          />
        </div>
      );

    case 'social_rhythm':
    case 'Social Rhythm':
      // Week strip with intensity bar under each; peak days in amber with glow
      const activeDays = thread.extraVisualData?.activeDays || ['W', 'S', 'S'];

      return (
        <div className="flex gap-1.5 pt-1">
          {[
            { label: 'M', active: activeDays.includes('M') },
            { label: 'T', active: activeDays.includes('T') },
            { label: 'W', active: activeDays.includes('W') },
            { label: 'T', active: activeDays.includes('T2') },
            { label: 'F', active: activeDays.includes('F') },
            { label: 'S', active: activeDays.includes('S') },
            { label: 'S', active: activeDays.includes('S2') || activeDays.includes('S') },
          ].map((d, idx) => (
            <div
              key={idx}
              className={`flex-1 text-center rounded-xl py-2 px-0 transition-all ${
                d.active
                  ? 'bg-[rgba(239,185,78,0.13)] border border-[rgba(239,185,78,0.34)]'
                  : 'bg-[rgba(255,255,255,0.045)] border border-transparent'
              }`}
            >
              <div className={`text-[10px] font-bold ${d.active ? 'text-[#EFB94E]' : 'text-[rgba(245,242,234,0.44)]'}`}>
                {d.label}
              </div>
              <div
                className={`h-1 mx-1.5 mt-1.5 rounded-full transition-all ${
                  d.active
                    ? 'bg-[#EFB94E] shadow-[0_0_8px_rgba(239,185,78,0.7)]'
                    : 'bg-[rgba(245,242,234,0.12)]'
                }`}
              />
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}
