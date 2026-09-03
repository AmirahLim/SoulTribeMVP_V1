'use client';

import React, { useRef, useEffect } from 'react';

export interface ValueNode {
  label: string;
  x: number; // 0..1
  y: number; // 0..1
  weight: number; // 0..1
}

export interface ValuesConstellationCanvasProps {
  values?: ValueNode[];
  note?: string;
  className?: string;
}

export function ValuesConstellationCanvas({
  values = [
    { label: 'Curiosity', x: 0.50, y: 0.46, weight: 1.0 },
    { label: 'Growth', x: 0.24, y: 0.24, weight: 0.66 },
    { label: 'Freedom', x: 0.78, y: 0.28, weight: 0.62 },
    { label: 'Community', x: 0.72, y: 0.76, weight: 0.55 },
    { label: 'Authenticity', x: 0.22, y: 0.72, weight: 0.58 },
  ],
  note = 'Curiosity sits at the centre of most of your answers — the others orbit it.',
  className = '',
}: ValuesConstellationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const containerWidth = Math.min(400, canvas.parentElement?.clientWidth || 360);
    const containerHeight = 170;

    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    const W = containerWidth;
    const H = containerHeight;
    const AMBER = '239,185,78';
    const CREAM = '245,242,234';

    // Draw connection lines from central node to satellites
    ctx.strokeStyle = `rgba(${AMBER},0.20)`;
    ctx.lineWidth = 1;
    for (let i = 1; i < values.length; i++) {
      ctx.beginPath();
      ctx.moveTo(values[0].x * W, values[0].y * H);
      ctx.lineTo(values[i].x * W, values[i].y * H);
      ctx.stroke();
    }

    // Draw glowing nodes and text
    values.forEach((v, i) => {
      const px = v.x * W;
      const py = v.y * H;
      const r = 4 + v.weight * 7;

      const g = ctx.createRadialGradient(px, py, 0, px, py, r * 3);
      g.addColorStop(0, `rgba(${AMBER},0.55)`);
      g.addColorStop(1, `rgba(${AMBER},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, r * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = i === 0 ? `rgba(${CREAM},1)` : `rgba(${AMBER},0.95)`;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = `${i === 0 ? '600 13px' : '400 11.5px'} Inter, sans-serif`;
      ctx.fillStyle = i === 0 ? `rgba(${CREAM},0.97)` : `rgba(${CREAM},0.62)`;
      ctx.textAlign = 'center';
      ctx.fillText(v.label, px, py + r + 15);
    });
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
          background: 'radial-gradient(120% 80% at 12% 0%, rgba(239,185,78,0.10) 0%, transparent 62%)',
        }}
      />
      <div className="relative z-10">
        <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)] mb-2">
          What Matters
        </p>
        <div className="w-full overflow-hidden flex justify-center">
          <canvas ref={canvasRef} aria-label="Your values, sized by how often they surface" />
        </div>
        {note && (
          <p className="text-[12.5px] leading-relaxed text-[rgba(245,242,234,0.70)] mt-3">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}
