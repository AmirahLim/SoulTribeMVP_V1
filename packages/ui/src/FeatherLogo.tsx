'use client';

import React from 'react';

export interface FeatherLogoProps {
  size?: number;
  className?: string;
}

export function FeatherLogo({ size = 32, className = '' }: FeatherLogoProps) {
  return (
    <svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 100 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
    >
      {/* Stem */}
      <path
        d="M50 145 C50 110 50 60 50 10"
        stroke="#C78838"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Feather Base Tip */}
      <path
        d="M50 145 L45 132 L50 128 L55 132 Z"
        fill="#C78838"
      />

      {/* Right Upper Frond - Warm Ochre */}
      <path
        d="M50 20 C68 28 78 45 74 65 C70 78 58 84 50 88 C50 65 50 40 50 20 Z"
        fill="#D49B4B"
      />

      {/* Left Upper Frond - Ochre */}
      <path
        d="M50 30 C34 38 24 55 28 75 C32 88 44 94 50 98 C50 75 50 50 50 30 Z"
        fill="#C78838"
      />

      {/* Right Middle Frond - Deep Botanical Green */}
      <path
        d="M50 50 C68 62 76 80 72 98 C68 108 58 114 50 118 C50 95 50 70 50 50 Z"
        fill="#2D523E"
      />

      {/* Left Lower Frond - Deep Botanical Green */}
      <path
        d="M50 75 C36 85 28 98 32 112 C36 122 44 126 50 130 C50 112 50 92 50 75 Z"
        fill="#1F3D2C"
      />

      {/* Right Lower Frond - Earthy Mocha */}
      <path
        d="M50 95 C64 105 72 116 68 128 C64 134 56 138 50 140 C50 126 50 110 50 95 Z"
        fill="#8C5A37"
      />

      {/* Inner Leaf Vane Details */}
      <path
        d="M50 35 Q60 45 66 55"
        stroke="#F8F3EA"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M50 65 Q62 75 66 85"
        stroke="#F8F3EA"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M50 45 Q40 55 34 65"
        stroke="#F8F3EA"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M50 90 Q38 98 34 106"
        stroke="#F8F3EA"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
