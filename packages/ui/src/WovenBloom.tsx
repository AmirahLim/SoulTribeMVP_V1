'use client';

import React, { useRef, useEffect } from 'react';

export interface WovenBloomProps {
  youDepths: number[]; // 10 depths 0..1
  themDepths: number[]; // 10 depths 0..1
  youName?: string;
  themName?: string;
  className?: string;
}

export function WovenBloom({
  youDepths = [0.92, 0.80, 0.66, 0.88, 0.58, 0.95, 0, 0.72, 0, 0.84],
  themDepths = [0.86, 0.74, 0.70, 0.60, 0.62, 0.40, 0, 0.66, 0.55, 0.78],
  youName = 'You',
  themName = 'Mervyn',
  className = '',
}: WovenBloomProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const containerWidth = Math.min(360, window.innerWidth - 52);
    const containerHeight = containerWidth * 0.62;

    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    const W = containerWidth;
    const H = containerHeight;
    const maxRadius = H * 0.40;
    const offset = W * 0.13;
    const cy = H / 2;

    const AMBER = '239,185,78';
    const EMERALD = '91,217,154';
    const CREAM = '245,242,234';

    function drawPetal(cx: number, cy: number, ang: number, len: number, wid: number, rgb: string, alpha: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      const g = ctx.createLinearGradient(0, 0, 0, -len);
      g.addColorStop(0, `rgba(${rgb},${alpha * 0.10})`);
      g.addColorStop(0.5, `rgba(${rgb},${alpha})`);
      g.addColorStop(1, `rgba(${rgb},${alpha * 0.08})`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(wid, -len * 0.27, wid * 0.9, -len * 0.72, 0, -len);
      ctx.bezierCurveTo(-wid * 0.9, -len * 0.72, -wid, -len * 0.27, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function renderBloomInstance(cx: number, cy: number, depths: number[], rgb: string, max: number, rot: number) {
      if (!ctx) return;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 10; i++) {
        const d = depths[i] || 0;
        const ang = (i / 10) * Math.PI * 2 + rot + Math.sin(i * 2.399) * 0.06;
        if (d <= 0) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(ang);
          ctx.strokeStyle = `rgba(${CREAM},0.10)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(9, -max * 0.15, 8, -max * 0.38, 0, -max * 0.50);
          ctx.bezierCurveTo(-8, -max * 0.38, -9, -max * 0.15, 0, 0);
          ctx.stroke();
          ctx.restore();
          continue;
        }
        const len = max * (0.30 + d * 0.70);
        const wid = 8 + d * 9;
        drawPetal(cx, cy, ang, len * 1.06, wid * 1.55, rgb, 0.07);
        drawPetal(cx, cy, ang, len, wid, rgb, 0.46);
        drawPetal(cx, cy, ang, len * 0.60, wid * 0.40, rgb, 0.26);
      }
    }

    // Background field rings
    ctx.strokeStyle = `rgba(${CREAM},0.05)`;
    ctx.lineWidth = 1;
    [0.45, 0.72, 1].forEach((k) => {
      ctx.beginPath();
      ctx.ellipse(W / 2, cy, maxRadius * 1.25 * k, maxRadius * 1.02 * k, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // You Bloom (Amber) on Left
    renderBloomInstance(W / 2 - offset, cy, youDepths, AMBER, maxRadius, -0.10);

    // Them Bloom (Emerald) on Right
    renderBloomInstance(W / 2 + offset, cy, themDepths, EMERALD, maxRadius, 0.10);

    // Woven Intersection Radial Cream Glow Overlay (Light, not 3rd color!)
    const g = ctx.createRadialGradient(W / 2, cy, 0, W / 2, cy, maxRadius * 0.62);
    g.addColorStop(0, 'rgba(255,248,232,0.60)');
    g.addColorStop(0.45, 'rgba(255,246,224,0.16)');
    g.addColorStop(1, 'rgba(255,246,224,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(W / 2, cy, maxRadius * 0.62, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
  }, [youDepths, themDepths]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <canvas ref={canvasRef} aria-label="Your two social signatures, woven" />
      <div className="flex justify-center gap-4 text-[11px] text-[rgba(245,242,234,0.44)] mt-1 font-medium">
        <span className="flex items-center gap-1.5">
          <b className="inline-block w-2 h-2 rounded-full bg-[#EFB94E]" />
          {youName}
        </span>
        <span className="flex items-center gap-1.5">
          <b className="inline-block w-2 h-2 rounded-full bg-[#3D7A5A]" />
          {themName}
        </span>
        <span className="flex items-center gap-1.5">
          <b className="inline-block w-2 h-2 rounded-full bg-[#FFF6E0]" />
          Where you overlap
        </span>
      </div>
    </div>
  );
}
