'use client';

import React from 'react';

export interface IllustratedGroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'paper' | 'sand' | 'mist';
}

export function IllustratedGround({
  children,
  className = '',
  variant = 'paper',
}: IllustratedGroundProps) {
  const bgMap = {
    paper: 'bg-[#F6F1EA]',
    sand: 'bg-[#EBDDD0]',
    mist: 'bg-[#E1E8E3]',
  };

  return (
    <div className={`relative min-h-screen w-full overflow-x-hidden ${bgMap[variant]} text-[#1C2B22] ${className}`}>
      {/* Ambient Radial Background Glows (Sleek Opal Ambient Atmosphere) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-50"
        style={{
          background: `
            radial-gradient(circle at 15% 10%, rgba(214, 147, 54, 0.15) 0%, transparent 45%),
            radial-gradient(circle at 85% 90%, rgba(28, 58, 39, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 50% 40%, rgba(200, 90, 50, 0.06) 0%, transparent 65%)
          `,
        }}
        aria-hidden="true"
      />

      {/* Subtle Texture Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* App Content Layer: Edge-to-Edge Responsive Container (Max-Width 440px centered for desktop, 100% full width on mobile) */}
      <div className="relative z-10 mx-auto max-w-[440px] px-4 pt-4 pb-12 sm:px-6">
        {children}
      </div>
    </div>
  );
}
