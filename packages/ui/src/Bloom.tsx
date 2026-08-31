'use client';

import React, { useState } from 'react';

export interface BloomDimension {
  key: string;
  label: string;
  strength: number; // 0..1
  confidence: number; // 0..1
  sentence: string;
}

export interface BloomProps {
  dimensions: BloomDimension[];
  size?: number;
  interactive?: boolean;
  className?: string;
}

export function Bloom({
  dimensions,
  size = 220,
  interactive = true,
  className = '',
}: BloomProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const center = size / 2;
  const maxRadius = size * 0.38;
  const total = dimensions.length;

  const selectedDim = dimensions.find((d) => d.key === selectedKey);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          <radialGradient id="bloom-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#016401" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#074710" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#654422" stopOpacity="0.85" />
          </radialGradient>
        </defs>

        {/* Concentric guide rings */}
        <circle cx={center} cy={center} r={maxRadius * 0.35} fill="none" stroke="#F3F0E9" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.15" />
        <circle cx={center} cy={center} r={maxRadius * 0.70} fill="none" stroke="#F3F0E9" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.12" />
        <circle cx={center} cy={center} r={maxRadius} fill="none" stroke="#F3F0E9" strokeWidth="0.8" strokeDasharray="5 5" opacity="0.1" />

        {/* Petals */}
        {dimensions.map((dim, idx) => {
          const angleDeg = (idx * 360) / total - 90;
          const angleRad = (angleDeg * Math.PI) / 180;

          const petalLength = Math.max(18, maxRadius * dim.strength * Math.max(0.4, dim.confidence));
          const petalWidth = Math.max(10, size * 0.055);

          const tipX = center + petalLength * Math.cos(angleRad);
          const tipY = center + petalLength * Math.sin(angleRad);

          const perpAngleRad = angleRad + Math.PI / 2;
          const cp1X = center + (petalLength * 0.5) * Math.cos(angleRad) + (petalWidth / 2) * Math.cos(perpAngleRad);
          const cp1Y = center + (petalLength * 0.5) * Math.sin(angleRad) + (petalWidth / 2) * Math.sin(perpAngleRad);

          const cp2X = center + (petalLength * 0.5) * Math.cos(angleRad) - (petalWidth / 2) * Math.cos(perpAngleRad);
          const cp2Y = center + (petalLength * 0.5) * Math.sin(angleRad) - (petalWidth / 2) * Math.sin(perpAngleRad);

          const pathData = `M ${center} ${center} Q ${cp1X} ${cp1Y} ${tipX} ${tipY} Q ${cp2X} ${cp2Y} ${center} ${center} Z`;

          const isSelected = selectedKey === dim.key;

          return (
            <path
              key={dim.key}
              d={pathData}
              fill="url(#bloom-gradient)"
              opacity={isSelected ? 1 : 0.85}
              stroke={isSelected ? '#F3F0E9' : '#016401'}
              strokeWidth={isSelected ? 2 : 1}
              className={`transition-all duration-300 ${interactive ? 'cursor-pointer hover:opacity-100 hover:scale-105' : ''}`}
              onClick={() => interactive && setSelectedKey(isSelected ? null : dim.key)}
            />
          );
        })}

        {/* Center organic core */}
        <circle cx={center} cy={center} r={size * 0.04} fill="#F3F0E9" />
      </svg>

      {/* Trait Sentence Tooltip */}
      {selectedDim && (
        <div className="mt-3 max-w-[260px] rounded-[14px] border border-[#F3F0E9]/15 bg-[#2B1A17] p-3 text-center shadow-lg">
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
