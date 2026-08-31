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
    paper: 'bg-[#F8F3ED]',
    sand: 'bg-[#EBDDD0]',
    mist: 'bg-[#E1E8E3]',
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#E5D7C7] p-2 sm:p-6 md:p-10">
      {/* Sleek Opal-Style Device Frame Container */}
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-[50px] border-[6px] border-[#2A1E17] bg-[#F8F3ED] shadow-[0_32px_64px_-16px_rgba(42,30,23,0.35)] ring-1 ring-black/5">
        {/* Dynamic Island Notch */}
        <div className="absolute top-3 left-1/2 z-50 h-4.5 w-28 -translate-x-1/2 rounded-full bg-[#2A1E17]" />

        <div className={`relative min-h-[840px] w-full ${bgMap[variant]} text-[#3D2E24] ${className}`}>
          {/* Subtle Ambient Radial Gradients (Opal-style background glow) */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background: `
                radial-gradient(circle at 10% 5%, rgba(214, 147, 54, 0.15) 0%, transparent 45%),
                radial-gradient(circle at 90% 90%, rgba(46, 83, 69, 0.12) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(200, 90, 50, 0.05) 0%, transparent 70%)
              `,
            }}
            aria-hidden="true"
          />

          {/* Ultra-fine Grain Texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
            aria-hidden="true"
          />

          {/* Sleek App View Content */}
          <div className="relative z-10 px-5 pt-8 pb-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
