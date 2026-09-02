'use client';

import React from 'react';

export interface GlassCardProps {
  children: React.ReactNode;
  wash?: string; // e.g. "rgba(239,185,78,0.14)"
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function GlassCard({
  children,
  wash,
  className = '',
  style = {},
  onClick,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-[26px] p-5 backdrop-blur-xl transition-all ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        backgroundColor: 'rgba(10,12,11,0.62)',
        border: '1px solid rgba(245,242,234,0.11)',
        boxShadow: '0 22px 48px -26px rgba(0,0,0,0.9), inset 0 1px 0 rgba(245,242,234,0.22)',
        ...style,
      }}
    >
      {wash && (
        <div
          className="absolute inset-0 pointer-events-none opacity-85"
          style={{
            background: `radial-gradient(120% 80% at 12% 0%, ${wash} 0%, transparent 62%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
