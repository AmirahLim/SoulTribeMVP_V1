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
  topThreads: [string, string]; // Thread keys for gradient
  sections: SynthesisSection[]; // Up to 6 synthesis sections
}

export interface TribalReadProps {
  data?: TribalReadData;
  className?: string;
}

export function TribalRead({ data, className = '' }: TribalReadProps) {
  const [openSheet, setOpenSheet] = useState(false);

  if (!data) return null;

  // Filter sections that synthesise at least 2 markers
  const validSections = data.sections.filter((s) => s.markerCount >= 2);
  if (validSections.length === 0) return null;

  const color1 = getThreadColor(data.topThreads[0]).surface;
  const color2 = getThreadColor(data.topThreads[1]).surface;
  const inkColor = getThreadColor(data.topThreads[0]).ink;

  return (
    <>
      {/* Collapsed Gradient Card */}
      <div
        className={`relative overflow-hidden rounded-[24px] p-6 shadow-xl transition-all duration-300 ${className}`}
        style={{
          background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
          color: inkColor,
        }}
      >
        <p className="text-[10px] font-bold tracking-widest uppercase opacity-75">
          Your Tribal Read
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight">{data.headline}</h2>
        <p className="mt-2 text-xs leading-relaxed font-medium opacity-90">{data.summary}</p>

        {/* Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {data.pills.map((pill, idx) => (
            <span
              key={idx}
              className="rounded-full border px-3 py-1 text-[11px] font-semibold"
              style={{
                borderColor: `${inkColor}35`,
                backgroundColor: `${inkColor}12`,
                color: inkColor,
              }}
            >
              {pill}
            </span>
          ))}
        </div>

        <button
          onClick={() => setOpenSheet(true)}
          className="mt-5 inline-flex items-center gap-1 text-xs font-bold hover:underline"
          style={{ color: inkColor }}
        >
          Read More About Me →
        </button>
      </div>

      {/* Expanded Full-Screen Modal/Sheet */}
      {openSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1D15]/80 p-4 backdrop-blur-md">
          <div
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[28px] p-8 shadow-2xl transition-all"
            style={{
              background: `linear-gradient(140deg, ${color1} 0%, #F0E7D6 100%)`,
              color: inkColor,
            }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: `${inkColor}20` }}>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-75">Full Tribal Read</p>
                <h3 className="text-2xl font-bold">{data.headline}</h3>
              </div>
              <button
                onClick={() => setOpenSheet(false)}
                className="rounded-full border px-3.5 py-1 text-xs font-bold transition-all hover:opacity-80"
                style={{ borderColor: `${inkColor}40` }}
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {validSections.map((sec, idx) => (
                <div key={idx} className="rounded-2xl border p-4" style={{ borderColor: `${inkColor}20`, backgroundColor: `${inkColor}08` }}>
                  <h4 className="text-xs font-bold tracking-wider uppercase opacity-80">{sec.title}</h4>
                  <p className="mt-2 text-xs leading-relaxed font-medium">{sec.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
