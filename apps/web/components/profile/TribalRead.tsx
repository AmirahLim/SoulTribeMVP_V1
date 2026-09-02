'use client';

import React, { useState } from 'react';
import { getThreadColor } from '@soul-tribe/tokens';

export interface SynthesisSection {
  title: string; // e.g. "Who you are socially"
  content: string;
  markerCount: number; // Must be >= 2 for synthesis!
}

export interface TribalReadData {
  headline: string; // e.g. "Selective, curious & quietly adventurous"
  summary: string;
  pills: string[];
  topThreads: [string, string]; // Thread keys for gradient/wash
  sections: SynthesisSection[]; // Up to 6 synthesis sections
}

export interface TribalReadProps {
  data?: TribalReadData;
  label?: string; // e.g. "Mervyn's Tribal Read"
  tone?: 'amber' | 'emerald';
  showReadMore?: boolean;
  className?: string;
}

export function TribalRead({
  data,
  label = 'Your Tribal Read',
  tone = 'amber',
  showReadMore = true,
  className = '',
}: TribalReadProps) {
  const [openSheet, setOpenSheet] = useState(false);

  if (!data) return null;

  // Filter sections that synthesise at least 2 markers
  const validSections = data.sections.filter((s) => s.markerCount >= 2);
  if (validSections.length === 0) return null;

  const isEmerald = tone === 'emerald';
  const accentColor = isEmerald ? '#5BD99A' : '#EFB94E';
  const washColor = isEmerald ? 'rgba(91,217,154,0.13)' : 'rgba(239,185,78,0.13)';

  return (
    <>
      {/* Dark Glass Card with Radial Wash */}
      <div
        className={`relative rounded-[26px] p-6 backdrop-blur-xl transition-all ${className}`}
        style={{
          backgroundColor: 'rgba(10,12,11,0.62)',
          border: '1px solid rgba(245,242,234,0.11)',
          boxShadow: '0 22px 48px -26px rgba(0,0,0,0.9), inset 0 1px 0 rgba(245,242,234,0.22)',
          padding: '24px 22px',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-85"
          style={{
            background: `radial-gradient(120% 80% at 12% 0%, ${washColor} 0%, transparent 62%)`,
          }}
        />

        <div className="relative z-10">
          <p
            className="text-[10px] font-bold tracking-widest uppercase mb-1"
            style={{ color: accentColor }}
          >
            {label}
          </p>
          <h2 className="font-['Bricolage_Grotesque'] text-[25px] font-semibold text-[#F5F2EA] leading-[1.18] mt-0.5">
            {data.headline}
          </h2>
          <p className="text-[13.5px] leading-relaxed text-[rgba(245,242,234,0.75)] mt-2">
            {data.summary}
          </p>

          {/* Pills */}
          <div className="mt-3.5 flex flex-wrap gap-2">
            {data.pills.map((pill, idx) => (
              <span
                key={idx}
                className="text-[11.5px] px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: idx === 0 ? (isEmerald ? 'rgba(91,217,154,0.16)' : 'rgba(239,185,78,0.16)') : 'rgba(255,255,255,0.06)',
                  borderColor: idx === 0 ? (isEmerald ? 'rgba(91,217,154,0.32)' : 'rgba(239,185,78,0.32)') : 'rgba(245,242,234,0.11)',
                  color: idx === 0 ? accentColor : 'rgba(245,242,234,0.75)',
                }}
              >
                {pill}
              </span>
            ))}
          </div>

          {showReadMore && (
            <button
              onClick={() => setOpenSheet(true)}
              className="mt-4 text-xs font-bold hover:underline"
              style={{ color: accentColor }}
            >
              Read More About Me →
            </button>
          )}
        </div>
      </div>

      {/* Expanded Sheet Modal */}
      {openSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(7,9,8,0.85)] p-4 backdrop-blur-md">
          <div className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-[rgba(245,242,234,0.2)] bg-[#0A0C0B] p-6 text-[#F5F2EA] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[rgba(245,242,234,0.1)] pb-4">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: accentColor }}>
                  {label}
                </p>
                <h3 className="font-['Bricolage_Grotesque'] text-2xl font-bold">{data.headline}</h3>
              </div>
              <button
                onClick={() => setOpenSheet(false)}
                className="rounded-full bg-white/10 p-2 text-[rgba(245,242,234,0.7)] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm leading-relaxed text-[rgba(245,242,234,0.8)]">
              {validSections.map((sec, i) => (
                <div key={i} className="rounded-xl border border-[rgba(245,242,234,0.08)] bg-white/5 p-4">
                  <h4 className="font-bold text-white mb-1">{sec.title}</h4>
                  <p>{sec.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
