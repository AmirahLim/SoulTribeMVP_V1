'use client';

import React from 'react';
import { SeatRow } from './SeatRow';

export interface PitchCardProps {
  title: string;
  pitch: string;
  hostName: string;
  hostAvatar?: string;
  dateTime: string;
  location: string;
  budget: string;
  orientation: string;
  totalSeats?: number;
  filledSeats?: number;
  onAction?: () => void;
  actionText?: string;
  className?: string;
}

export function PitchCard({
  title,
  pitch,
  hostName,
  hostAvatar,
  dateTime,
  location,
  budget,
  orientation,
  totalSeats = 6,
  filledSeats = 2,
  onAction,
  actionText = "I'm in",
  className = '',
}: PitchCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-0 shadow-[0_8px_24px_-6px_rgba(61,46,36,0.08)] transition-all hover:shadow-[0_12px_32px_-8px_rgba(61,46,36,0.12)] ${className}`}
    >
      {/* Top Location Header Strip */}
      <div className="relative flex h-24 w-full items-center justify-between bg-[#E1E8E3] px-5">
        <div className="rounded-full bg-[#FFFDF9]/90 px-3 py-1 text-[11px] font-bold tracking-wider text-[#2E5345] uppercase shadow-sm backdrop-blur-sm">
          {location}
        </div>

        {/* Host Avatar */}
        <div className="flex items-center gap-2 rounded-full bg-[#FFFDF9]/90 py-1 pl-1 pr-3 shadow-sm backdrop-blur-sm">
          <img
            src={hostAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
            alt={hostName}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="text-[12px] font-bold text-[#3D2E24]">{hostName}</span>
        </div>
      </div>

      <div className="p-5 pt-4">
        <h3 className="text-[20px] font-bold tracking-tight text-[#3D2E24]">
          {title}
        </h3>

        <p className="mt-2 text-[14px] leading-[21px] text-[#4A3B30]">
          "{pitch}"
        </p>

        {/* Fact Pills */}
        <div className="mt-4 flex flex-wrap gap-2 text-[11.5px] font-semibold">
          <span className="rounded-full bg-[#EFE5D8] px-3 py-1 text-[#3D2E24]">
            {dateTime}
          </span>
          <span className="rounded-full bg-[#EFE5D8] px-3 py-1 text-[#3D2E24]">
            {budget}
          </span>
          <span className="rounded-full bg-[#EFE5D8] px-3 py-1 text-[#3D2E24]">
            {orientation}
          </span>
        </div>

        {/* Seat Row & Action CTA */}
        <div className="mt-5 flex items-center justify-between border-t border-[#3D2E24]/08 pt-4">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#7A6B5F] uppercase">
              Seats ({filledSeats}/{totalSeats})
            </span>
            <SeatRow totalSeats={totalSeats} filledSeats={filledSeats} className="mt-1" />
          </div>

          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className="rounded-[16px] bg-[#C85A32] px-5 py-2.5 text-[14px] font-bold text-[#FFFDF9] shadow-sm transition-all hover:bg-[#a84723]"
            >
              {actionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
