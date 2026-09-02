'use client';

import React, { useState } from 'react';
import { getThreadColor } from '@soul-tribe/tokens';

export interface BloomThread {
  key: string;
  label: string;
  strength: number; // 0..1
  confidence: number; // 0..1
  sentence: string;
}

export interface BloomProps {
  threads: BloomThread[];
  size?: number;
  interactive?: boolean;
  onSelectThread?: (key: string) => void;
  className?: string;
}

export function Bloom({
  threads,
  size = 240,
  interactive = true,
  onSelectThread,
  className = '',
}: BloomProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const center = size / 2;
  const maxRadius = size * 0.38;
  const total = Math.max(1, threads.length);

  const handlePetalClick = (key: string) => {
    if (!interactive) return;
    const nextKey = selectedKey === key ? null : key;
    setSelectedKey(nextKey);
    if (onSelectThread) {
      onSelectThread(key);
    }
  };

  const selectedDim = threads.find((d) => d.key === selectedKey);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          {threads.map((dim) => {
            const spec = getThreadColor(dim.key || dim.label);
            return (
              <linearGradient
                key={`grad-${dim.key}`}
                id={`bloom-grad-${dim.key}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={spec.surface} stopOpacity="0.95" />
                <stop offset="100%" stopColor={spec.surface} stopOpacity="0.65" />
              </linearGradient>
            );
          })}
        </defs>

        {/* Concentric organic guide rings */}
        <circle cx={center} cy={center} r={maxRadius * 0.35} fill="none" stroke="#F3F0E9" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.12" />
        <circle cx={center} cy={center} r={maxRadius * 0.70} fill="none" stroke="#F3F0E9" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.1" />
        <circle cx={center} cy={center} r={maxRadius} fill="none" stroke="#F3F0E9" strokeWidth="0.8" strokeDasharray="5 5" opacity="0.08" />

        {/* Petals */}
        {threads.map((dim, idx) => {
          const angleDeg = (idx * 360) / total - 90;
          const angleRad = (angleDeg * Math.PI) / 180;

          // Emerging bloom scaling: minimum length 0.35 so 10% looks complete & elegant
          const effectiveScale = 0.35 + 0.65 * (dim.confidence > 0 ? Math.max(dim.strength, dim.confidence) : 0.2);
          const petalLength = maxRadius * effectiveScale;
          const petalWidth = Math.max(12, size * 0.065);

          const tipX = center + petalLength * Math.cos(angleRad);
          const tipY = center + petalLength * Math.sin(angleRad);

          const perpAngleRad = angleRad + Math.PI / 2;
          const cp1X = center + (petalLength * 0.55) * Math.cos(angleRad) + (petalWidth / 2) * Math.cos(perpAngleRad);
          const cp1Y = center + (petalLength * 0.55) * Math.sin(angleRad) + (petalWidth / 2) * Math.sin(perpAngleRad);

          const cp2X = center + (petalLength * 0.55) * Math.cos(angleRad) - (petalWidth / 2) * Math.cos(perpAngleRad);
          const cp2Y = center + (petalLength * 0.55) * Math.sin(angleRad) - (petalWidth / 2) * Math.sin(perpAngleRad);

          const pathData = `M ${center} ${center} Q ${cp1X} ${cp1Y} ${tipX} ${tipY} Q ${cp2X} ${cp2Y} ${center} ${center} Z`;

          const isSelected = selectedKey === dim.key;
          const spec = getThreadColor(dim.key || dim.label);

          return (
            <path
              key={dim.key}
              d={pathData}
              fill={`url(#bloom-grad-${dim.key})`}
              opacity={isSelected ? 1 : 0.88}
              stroke={isSelected ? spec.ink : spec.surface}
              strokeWidth={isSelected ? 2.5 : 1}
              className={`transition-all duration-300 ${interactive ? 'cursor-pointer hover:opacity-100 hover:scale-105' : ''}`}
              onClick={() => handlePetalClick(dim.key)}
            >
              <title>{`${spec.name}: ${dim.sentence || dim.label}`}</title>
            </path>
          );
        })}

        {/* Core center node */}
        <circle cx={center} cy={center} r={size * 0.045} fill="#F3F0E9" stroke="#15261C" strokeWidth="2" />
      </svg>

      {/* Selected Thread Tooltip */}
      {selectedDim && (
        <div className="mt-3 max-w-[280px] rounded-[16px] border border-[#F3F0E9]/15 bg-[#15261C] p-3 text-center shadow-lg transition-all duration-300">
          <p className="text-[10px] font-bold tracking-widest text-[#8F998D] uppercase">
            {selectedDim.label}
          </p>
          <p className="mt-1 text-[13px] font-medium leading-relaxed text-[#F3F0E9]">
            {selectedDim.sentence}
          </p>
        </div>
      )}
    </div>
  );
}
