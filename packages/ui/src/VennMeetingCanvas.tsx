'use client';

import React, { useRef, useEffect } from 'react';

export interface VennMeetingCanvasProps {
  yourInterests?: string[];
  sharedInterests?: string[];
  theirInterests?: string[];
  noteSentence?: string;
  className?: string;
}

export function VennMeetingCanvas({
  yourInterests = ['Ceramics', 'Analog film'],
  sharedInterests = ['Specialty coffee'],
  theirInterests = ['Trail running', 'Vinyl'],
  noteSentence = 'Specialty coffee is the obvious first move. An activity gives this pairing somewhere to begin.',
  className = '',
}: VennMeetingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const containerWidth = Math.min(380, window.innerWidth - 76);
    const containerHeight = 168;

    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    const W = containerWidth;
    const H = containerHeight;
    const r = H * 0.40;
    const cy = H * 0.46;
    const o = r * 0.52;

    const AMBER = '239,185,78';
    const EMERALD = '91,217,154';
    const CREAM = '245,242,234';

    ctx.globalCompositeOperation = 'lighter';

    // Left Circle (Amber - You)
    const g1 = ctx.createRadialGradient(W / 2 - o, cy, 0, W / 2 - o, cy, r);
    g1.addColorStop(0, `rgba(${AMBER},0.30)`);
    g1.addColorStop(1, `rgba(${AMBER},0.06)`);
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.arc(W / 2 - o, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Right Circle (Emerald - Them)
    const g2 = ctx.createRadialGradient(W / 2 + o, cy, 0, W / 2 + o, cy, r);
    g2.addColorStop(0, `rgba(${EMERALD},0.30)`);
    g2.addColorStop(1, `rgba(${EMERALD},0.06)`);
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.arc(W / 2 + o, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';

    ctx.strokeStyle = `rgba(${AMBER},0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(W / 2 - o, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(${EMERALD},0.5)`;
    ctx.beginPath();
    ctx.arc(W / 2 + o, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Text labels inside circles
    ctx.textAlign = 'center';
    ctx.font = '400 11px Inter, sans-serif';
    ctx.fillStyle = `rgba(${CREAM},0.62)`;

    if (yourInterests[0]) ctx.fillText(yourInterests[0], W / 2 - o - r * 0.42, cy - 6);
    if (yourInterests[1]) ctx.fillText(yourInterests[1], W / 2 - o - r * 0.42, cy + 12);

    if (theirInterests[0]) ctx.fillText(theirInterests[0], W / 2 + o + r * 0.44, cy - 6);
    if (theirInterests[1]) ctx.fillText(theirInterests[1], W / 2 + o + r * 0.44, cy + 12);

    ctx.font = '600 12.5px Karla, sans-serif';
    ctx.fillStyle = 'rgba(255,250,238,0.98)';
    if (sharedInterests[0]) {
      const parts = sharedInterests[0].split(' ');
      if (parts.length >= 2) {
        ctx.fillText(parts[0], W / 2, cy - 3);
        ctx.fillText(parts.slice(1).join(' '), W / 2, cy + 13);
      } else {
        ctx.fillText(sharedInterests[0], W / 2, cy + 4);
      }
    }
  }, [yourInterests, sharedInterests, theirInterests]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <canvas ref={canvasRef} aria-label="Shared and separate interests" />
      <div className="flex justify-center gap-4 text-[11px] text-[rgba(245,242,234,0.44)] mt-1">
        <span>Yours</span>
        <span className="text-[#F5F2EA] font-semibold">Shared</span>
        <span>His</span>
      </div>
      {noteSentence && (
        <p className="text-[12.5px] leading-relaxed text-[rgba(245,242,234,0.70)] mt-3 text-left w-full">
          {noteSentence}
        </p>
      )}
    </div>
  );
}
