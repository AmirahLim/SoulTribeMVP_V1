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
  return (
    <div className={`min-h-screen w-full overflow-x-hidden bg-[#0D1D15] text-[#F3F0E9] ${className}`}>
      {/* Luxury Dark Forest Background Ambient Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          background: `
            radial-gradient(circle at 20% 15%, rgba(45, 82, 62, 0.35) 0%, transparent 50%),
            radial-gradient(circle at 80% 85%, rgba(212, 155, 75, 0.12) 0%, transparent 45%)
          `,
        }}
        aria-hidden="true"
      />

      {/* Editorial Canvas Container: Max-width 440px centered */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-6 pb-24 sm:px-6">
        {children}
      </div>
    </div>
  );
}
