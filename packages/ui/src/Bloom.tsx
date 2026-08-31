'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface BloomDimension {
  key: string;
  label: string;
  strength: number; // 0..1 (length)
  confidence: number; // 0..1 (width/opacity)
  sentence: string;
}

export interface BloomProps {
  dimensions: BloomDimension[];
  size?: number; // default 240px
  interactive?: boolean;
  overlayDimensions?: BloomDimension[]; // Second bloom for match comparison
  className?: string;
}

const DIMENSION_LABELS = [
  'Personality',
  'Communication',
  'Social Rhythm',
  'Intent & Depth',
  'Emotional Tempo',
  'Interests',
  'Values',
  'Lifestyle',
];

export function Bloom({
  dimensions,
  size = 240,
  interactive = true,
  overlayDimensions,
  className = '',
}: BloomProps) {
  const [selectedPetal, setSelectedPetal] = useState<BloomDimension | null>(null);

  const center = size / 2;
  const maxRadius = (size / 2) * 0.85;

  // Build SVG bezier path for a lobe/petal at a specific angle (0..7 => 45 deg intervals)
  const createPetalPath = (
    index: number,
    strength: number,
    confidence: number,
    totalPetals = 8
  ) => {
    const angleRad = (index * 2 * Math.PI) / totalPetals - Math.PI / 2;
    const len = Math.max(0.2, strength) * maxRadius;

    const tipX = center + len * Math.cos(angleRad);
    const tipY = center + len * Math.sin(angleRad);

    // Width of lobe depends on confidence
    const spreadAngle = (Math.PI / totalPetals) * (0.4 + confidence * 0.45);
    const leftAngle = angleRad - spreadAngle;
    const rightAngle = angleRad + spreadAngle;

    const ctrlDist = len * 0.55;
    const ctrl1X = center + ctrlDist * Math.cos(leftAngle);
    const ctrl1Y = center + ctrlDist * Math.sin(leftAngle);
    const ctrl2X = center + ctrlDist * Math.cos(rightAngle);
    const ctrl2Y = center + ctrlDist * Math.sin(rightAngle);

    return `M ${center} ${center} Q ${ctrl1X} ${ctrl1Y} ${tipX} ${tipY} Q ${ctrl2X} ${ctrl2Y} ${center} ${center} Z`;
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible drop-shadow-sm"
      >
        <defs>
          <radialGradient id="bloom-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EFA93C" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#D9663F" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#3E6B5C" stopOpacity="0.85" />
          </radialGradient>
          <radialGradient id="overlay-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A9C9D6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3E6B5C" stopOpacity="0.5" />
          </radialGradient>
        </defs>

        {/* Concentric guide rings (subtle terrain mapping) */}
        <circle cx={center} cy={center} r={maxRadius * 0.35} fill="none" stroke="#8A7D73" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.25" />
        <circle cx={center} cy={center} r={maxRadius * 0.70} fill="none" stroke="#8A7D73" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.2" />
        <circle cx={center} cy={center} r={maxRadius} fill="none" stroke="#8A7D73" strokeWidth="0.8" strokeDasharray="5 5" opacity="0.15" />

        {/* Overlay Bloom if present */}
        {overlayDimensions &&
          overlayDimensions.map((dim, i) => {
            const path = createPetalPath(i, dim.strength, dim.confidence);
            return (
              <motion.path
                key={`overlay-${i}`}
                d={path}
                fill="url(#overlay-gradient)"
                stroke="#3E6B5C"
                strokeWidth="1.2"
                opacity="0.4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
              />
            );
          })}

        {/* Primary Friendship DNA Bloom */}
        {dimensions.map((dim, i) => {
          const path = createPetalPath(i, dim.strength, dim.confidence);
          const isSelected = selectedPetal?.key === dim.key;

          return (
            <motion.path
              key={dim.key || i}
              d={path}
              fill="url(#bloom-gradient)"
              stroke={isSelected ? '#2B211B' : '#FFFDFA'}
              strokeWidth={isSelected ? '2' : '1.2'}
              opacity={0.3 + dim.confidence * 0.65}
              className={interactive ? 'cursor-pointer transition-opacity hover:opacity-100' : ''}
              onClick={() => interactive && setSelectedPetal(dim)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 + dim.confidence * 0.65 }}
              transition={{ duration: 0.9, delay: i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
            />
          );
        })}

        {/* Core Center Pulse */}
        <circle cx={center} cy={center} r="7" fill="#2B211B" stroke="#FFFDFA" strokeWidth="2" />
      </svg>

      {/* Selected Petal Sentence Reveal */}
      {interactive && selectedPetal && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 max-w-[280px] rounded-[16px] border border-[#2B211B]/10 bg-[#FFFDFA] p-3 text-center shadow-[0_2px_4px_rgba(74,55,42,.06)]"
        >
          <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#D9663F]">
            {selectedPetal.label}
          </p>
          <p className="mt-1 text-[14px] leading-[20px] text-[#2B211B]">
            "{selectedPetal.sentence}"
          </p>
        </motion.div>
      )}
    </div>
  );
}
