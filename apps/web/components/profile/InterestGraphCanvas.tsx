'use client';

import React, { useRef, useEffect } from 'react';

export interface InterestNode {
  name: string;
  x: number; // 0..1
  y: number; // 0..1
  weight: number; // 0..1
  isRabbitHole?: boolean;
}

export interface InterestGraphCanvasProps {
  nodes?: InterestNode[];
  edges?: Array<[number, number]>;
  className?: string;
}

export function InterestGraphCanvas({
  nodes = [
    { name: 'Specialty Coffee', x: 0.50, y: 0.30, weight: 1.0, isRabbitHole: true },
    { name: 'Ceramics & Craft', x: 0.20, y: 0.58, weight: 0.7 },
    { name: 'Japanese Joinery', x: 0.76, y: 0.56, weight: 0.75 },
    { name: 'Analog Film', x: 0.38, y: 0.83, weight: 0.6 },
    { name: 'Architecture Walks', x: 0.82, y: 0.20, weight: 0.55 },
  ],
  edges = [[0, 1], [0, 2], [1, 3], [2, 4], [0, 4]],
  className = '',
}: InterestGraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const containerWidth = Math.min(400, canvas.parentElement?.clientWidth || 360);
    const containerHeight = 180;

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
    const EMERALD = '91,217,154';
    const CREAM = '245,242,234';

    // Draw connection edges
    ctx.strokeStyle = `rgba(${EMERALD},0.22)`;
    ctx.lineWidth = 1;
    edges.forEach(([i, j]) => {
      if (nodes[i] && nodes[j]) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x * W, nodes[i].y * H);
        ctx.lineTo(nodes[j].x * W, nodes[j].y * H);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach((n) => {
      const px = n.x * W;
      const py = n.y * H;
      const hot = n.isRabbitHole;
      const r = 4 + n.weight * 6;
      const col = hot ? AMBER : EMERALD;

      const g = ctx.createRadialGradient(px, py, 0, px, py, r * 3.2);
      g.addColorStop(0, `rgba(${col},0.5)`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, r * 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${col},0.98)`;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = `${hot ? '600 12.5px' : '400 11px'} Karla, sans-serif`;
      ctx.fillStyle = hot ? 'rgba(255,250,238,0.98)' : `rgba(${CREAM},0.60)`;
      ctx.textAlign = 'center';
      const ty = py < H * 0.5 ? py - r - 9 : py + r + 14;
      ctx.fillText(n.name, Math.max(52, Math.min(W - 52, px)), ty);
    });
  }, [nodes, edges]);

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
          background: 'radial-gradient(120% 80% at 12% 0%, rgba(91,217,154,0.10) 0%, transparent 62%)',
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
            I'm Into
          </p>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#EFB94E]">
            Rabbit Hole
          </span>
        </div>
        <div className="w-full overflow-hidden flex justify-center">
          <canvas ref={canvasRef} aria-label="Your interests and how they connect" />
        </div>
      </div>
    </div>
  );
}
