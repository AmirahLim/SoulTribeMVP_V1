'use client';

import React, { useRef, useEffect, useState } from 'react';

export interface BloomThread {
  key: string;
  label: string;
  strength: number; // 0..1
  confidence: number; // 0..1
  sentence: string;
}

export interface BloomProps {
  threads: BloomThread[];
  size?: number;
  interactive?: boolean;
  onSelectThread?: (key: string) => void;
  className?: string;
}

export function Bloom({
  threads,
  size = 280,
  interactive = true,
  onSelectThread,
  className = '',
}: BloomProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const renderSize = Math.min(300, size);
    canvas.width = renderSize * dpr;
    canvas.height = renderSize * dpr;
    canvas.style.width = `${renderSize}px`;
    canvas.style.height = `${renderSize}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    const cx = renderSize / 2;
    const cy = renderSize / 2;
    const maxRadius = renderSize * 0.42;

    const AMBER = '239,185,78';
    const EMERALD = '91,217,154';
    const CREAM = '245,242,234';

    function mixColor(t: number, alpha: number) {
      const r = Math.round(91 + (239 - 91) * t);
      const g = Math.round(217 + (185 - 217) * t);
      const b = Math.round(154 + (78 - 154) * t);
      return `rgba(${r},${g},${b},${alpha})`;
    }

    function drawPetal(ang: number, len: number, wid: number, tone: number, alpha: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);

      const grad = ctx.createLinearGradient(0, 0, 0, -len);
      grad.addColorStop(0, mixColor(tone, alpha * 0.1));
      grad.addColorStop(0.5, mixColor(tone, alpha));
      grad.addColorStop(1, mixColor(tone, alpha * 0.08));

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(wid, -len * 0.27, wid * 0.9, -len * 0.72, 0, -len);
      ctx.bezierCurveTo(-wid * 0.9, -len * 0.72, -wid, -len * 0.27, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Guide rings
    ctx.strokeStyle = `rgba(${CREAM},0.05)`;
    ctx.lineWidth = 1;
    [0.3, 0.52, 0.74].forEach((k) => {
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * k, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.globalCompositeOperation = 'lighter';
    const totalPetals = 10;

    // Map threads or default 10
    for (let i = 0; i < totalPetals; i++) {
      const th = threads[i] || { strength: 0, confidence: 0 };
      const depth = th.confidence > 0 ? Math.max(0.1, th.strength * th.confidence) : 0;
      const tone = (i / totalPetals); // Color distribution between emerald and amber
      const ang = (i / totalPetals) * Math.PI * 2 + Math.sin(i * 2.399) * 0.06;

      if (depth <= 0) {
        // Unexplored: ghost outline petal
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ang);
        ctx.strokeStyle = `rgba(${CREAM},0.13)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(11, -maxRadius * 0.16, 10, -maxRadius * 0.42, 0, -maxRadius * 0.56);
        ctx.bezierCurveTo(-10, -maxRadius * 0.42, -11, -maxRadius * 0.16, 0, 0);
        ctx.stroke();
        ctx.restore();
        continue;
      }

      // Explored petals: 3 layers with lighter composite
      const len = maxRadius * (0.3 + depth * 0.7);
      const wid = 10 + depth * 11;
      drawPetal(ang, len * 1.07, wid * 1.6, tone, 0.09); // Wide soft underglow
      drawPetal(ang, len, wid, tone, 0.6);             // Body
      drawPetal(ang, len * 0.6, wid * 0.4, tone, 0.34); // Inner highlight
    }

    // Glowing Radial Core
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26);
    cg.addColorStop(0, 'rgba(255,252,244,0.95)');
    cg.addColorStop(0.45, `rgba(${AMBER},0.30)`);
    cg.addColorStop(1, `rgba(${AMBER},0)`);
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
  }, [threads, size]);

  const selectedDim = threads.find((d) => d.key === selectedKey);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        onClick={() => {
          if (!interactive || threads.length === 0) return;
          const nextIndex = Math.floor(Math.random() * Math.min(threads.length, 6));
          const target = threads[nextIndex];
          if (target) {
            setSelectedKey(selectedKey === target.key ? null : target.key);
            onSelectThread?.(target.key);
          }
        }}
        className={`block ${interactive ? 'cursor-pointer' : ''}`}
      />

      {selectedDim && (
        <div className="mt-3 max-w-[280px] rounded-xl border border-[rgba(245,242,234,0.15)] bg-[rgba(10,12,11,0.85)] p-3 text-center shadow-xl backdrop-blur-md">
          <p className="text-[10px] font-bold tracking-widest text-[#EFB94E] uppercase">
            {selectedDim.label}
          </p>
          <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-[#F5F2EA]">
            {selectedDim.sentence}
          </p>
        </div>
      )}
    </div>
  );
}
