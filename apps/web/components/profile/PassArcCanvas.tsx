'use client';

import React, { useRef, useEffect } from 'react';

export interface PassArcCanvasProps {
  exploredPct: number; // e.g. 0.42
  signalsText?: string;
  className?: string;
}

export function PassArcCanvas({ exploredPct = 0.42, signalsText = 'Developing read · 34 signals', className = '' }: PassArcCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 75;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    const cx = size / 2;
    const cy = size / 2;
    const r = 30;

    const AMBER = '239,185,78';
    const EMERALD = '91,217,154';
    const CREAM = '245,242,234';

    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    // Faint base ring
    ctx.strokeStyle = `rgba(${CREAM},0.10)`;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Gradient progress arc
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, `rgba(${EMERALD},1)`);
    grad.addColorStop(1, `rgba(${AMBER},1)`);
    ctx.strokeStyle = grad;
    ctx.shadowColor = `rgba(${AMBER},0.65)`;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.05, Math.min(1, exploredPct)));
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 10 thread dots around arc
    const exploredCount = Math.round(exploredPct * 10);
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
      ctx.fillStyle = i < exploredCount ? `rgba(${AMBER},0.95)` : `rgba(${CREAM},0.16)`;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * (r - 13), cy + Math.sin(a) * (r - 13), 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [exploredPct]);

  const passPctInt = Math.round(exploredPct * 100);

  return (
    <div className={`flex items-center gap-4 py-1 ${className}`}>
      <canvas ref={canvasRef} aria-label={`Tribal Pass ${passPctInt} percent explored`} />
      <div>
        <p className="text-[11px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
          Tribal Pass
        </p>
        <p className="font-sans text-[19px] font-semibold text-[#F5F2EA] mt-0.5">
          {passPctInt}% explored
        </p>
        <p className="text-xs text-[rgba(245,242,234,0.44)] mt-0.5">
          {signalsText}
        </p>
      </div>
    </div>
  );
}
