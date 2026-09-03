'use client';

import React, { useRef, useEffect } from 'react';

export interface OutingTriadCanvasProps {
  descriptors?: string[]; // ["Low-key", "Creative", "Exploratory"]
  values?: [number, number, number]; // [0.85, 0.78, 0.72]
  instantYes?: string;
  usuallyYes?: string[];
  convinceMe?: string[];
  className?: string;
}

export function OutingTriadCanvas({
  descriptors = ['Low-key', 'Creative', 'Exploratory'],
  values = [0.85, 0.78, 0.72],
  instantYes = "Pottery somewhere you've never been, then coffee that runs long",
  usuallyYes = ['Quiet museums', 'acoustic sets', 'neighbourhood walks'],
  convinceMe = ['Rooftop mixers'],
  className = '',
}: OutingTriadCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 118;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    const cx = size / 2;
    const cy = size / 2 + 4;
    const R = size * 0.36;

    const AMBER = '239,185,78';
    const EMERALD = '91,217,154';
    const CREAM = '245,242,234';

    // Concentric guide triangles
    [1, 0.66, 0.33].forEach((k) => {
      ctx.strokeStyle = `rgba(${CREAM},0.07)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
        const px = cx + Math.cos(a) * R * k;
        const py = cy + Math.sin(a) * R * k;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    });

    // Polygon fill
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
      const px = cx + Math.cos(a) * R * values[i];
      const py = cy + Math.sin(a) * R * values[i];
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    const g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    g.addColorStop(0, `rgba(${EMERALD},0.42)`);
    g.addColorStop(1, `rgba(${AMBER},0.42)`);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.strokeStyle = `rgba(${AMBER},0.85)`;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Node points
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
      ctx.fillStyle = `rgba(${AMBER},0.95)`;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * R * values[i], cy + Math.sin(a) * R * values[i], 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [values]);

  return (
    <div
      className={`relative rounded-[26px] p-5 backdrop-blur-xl transition-all ${className}`}
      style={{
        backgroundColor: 'rgba(10,12,11,0.62)',
        border: '1px solid rgba(245,242,234,0.11)',
        boxShadow: '0 22px 48px -26px rgba(0,0,0,0.9), inset 0 1px 0 rgba(245,242,234,0.22)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-85"
        style={{
          background: 'radial-gradient(120% 80% at 12% 0%, rgba(239,185,78,0.12) 0%, transparent 62%)',
        }}
      />
      <div className="relative z-10">
        <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)] mb-3">
          Outing DNA
        </p>

        <div className="flex items-center gap-4">
          <canvas ref={canvasRef} aria-label={`Outing DNA triad: ${descriptors.join(', ')}`} />
          <div>
            <h3 className="font-sans text-lg font-semibold text-[#F5F2EA] leading-tight">
              {descriptors.join(' × ')}
            </h3>
          </div>
        </div>

        {/* Preference Rows */}
        <div className="mt-4 flex flex-col border-t border-[rgba(245,242,234,0.08)]">
          {instantYes && (
            <div className="flex gap-3 items-baseline py-2.5 border-b border-[rgba(245,242,234,0.08)]">
              <span className="w-20 shrink-0 text-[9.5px] font-bold tracking-wider uppercase text-[#5BD99A]">
                Instant yes
              </span>
              <span className="text-[13.5px] text-[#F5F2EA]">
                {instantYes}
              </span>
            </div>
          )}

          {usuallyYes && usuallyYes.length > 0 && (
            <div className="flex gap-3 items-baseline py-2.5 border-b border-[rgba(245,242,234,0.08)]">
              <span className="w-20 shrink-0 text-[9.5px] font-bold tracking-wider uppercase text-[rgba(245,242,234,0.44)]">
                Usually yes
              </span>
              <span className="text-[13.5px] text-[rgba(245,242,234,0.70)]">
                {usuallyYes.join(' · ')}
              </span>
            </div>
          )}

          {convinceMe && convinceMe.length > 0 && (
            <div className="flex gap-3 items-baseline py-2.5">
              <span className="w-20 shrink-0 text-[9.5px] font-bold tracking-wider uppercase text-[rgba(245,242,234,0.44)]">
                Convince me
              </span>
              <span className="text-[13.5px] text-[rgba(245,242,234,0.70)]">
                {convinceMe.join(' · ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
