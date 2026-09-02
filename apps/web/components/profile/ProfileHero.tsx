'use client';

import React from 'react';
import { Settings, Info, Calendar, Bookmark } from 'lucide-react';

export interface ProfileHeroProps {
  displayName: string;
  handle: string;
  homeArea: string;
  bio?: string;
  avatarUrl?: string;
  passCompletionPct: number;
  standingText?: string;
  instinctType?: string;
  instinctDescription?: string;
  onEditProfile?: () => void;
  onDeepenPass?: () => void;
}

export function ProfileHero({
  displayName,
  handle,
  homeArea,
  bio,
  avatarUrl,
  passCompletionPct = 100,
  standingText = 'Good Standing',
  instinctType = 'Connector',
  instinctDescription = 'Actively brings people together around shared crafts and quiet, quality experiences',
  onEditProfile,
  onDeepenPass,
}: ProfileHeroProps) {
  return (
    <div className="flex flex-col gap-5 w-full pt-1">
      {/* 1. Identity Header Row */}
      <div className="flex items-center gap-4 pb-1">
        <div className="relative h-[64px] w-[64px] shrink-0 rounded-full bg-gradient-to-br from-[#5A4030] to-[#2A211A] shadow-[0_8px_24px_rgba(0,0,0,0.6)] p-[2px]">
          <div className="relative h-full w-full overflow-hidden rounded-full border border-white/20">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#2D523E] text-xl font-bold text-[#F5F2EA]">
                {displayName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="text-[10.5px] font-bold tracking-widest uppercase text-[#EFB94E]">
            TRIBAL PASS · {passCompletionPct}% COMPLETE
          </div>
          <h1 className="font-['Bricolage_Grotesque'] text-[26px] font-bold text-[#F5F2EA] leading-tight">
            {displayName}
          </h1>
          <p className="text-[12.5px] text-[rgba(245,242,234,0.50)]">
            @{handle} · {homeArea}
          </p>
        </div>

        <button
          onClick={onEditProfile}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(245,242,234,0.12)] bg-[rgba(255,255,255,0.06)] text-[rgba(245,242,234,0.70)] hover:text-[#F5F2EA] transition-all"
          title="Settings"
        >
          <Settings className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* 2. Tribe Standing & Connector Active Level */}
      <div className="flex flex-col gap-3 pt-3 border-t border-[rgba(245,242,234,0.12)]">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.50)]">
            TRIBE STANDING
          </span>
          <button
            onClick={onEditProfile}
            className="flex items-center gap-1.5 text-xs text-[rgba(245,242,234,0.70)] hover:text-[#F5F2EA] underline decoration-white/20"
          >
            <Info className="h-3.5 w-3.5" />
            <span>How Standing Works</span>
          </button>
        </div>

        {/* Connector Active Level Card with Spacious Padding */}
        <div
          className="flex items-start justify-between rounded-[22px] border border-[rgba(245,242,234,0.12)] bg-[rgba(10,12,11,0.62)] p-5 backdrop-blur-xl shadow-md"
          style={{ padding: '20px 20px' }}
        >
          <div className="flex flex-col gap-2 flex-1 pr-4 pl-1.5 py-0.5">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🤝</span>
              <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#F5F2EA]">
                {instinctType}
              </h3>
              <span className="rounded-full border border-[rgba(45,82,62,0.45)] bg-[rgba(45,82,62,0.25)] px-3 py-0.5 text-[10px] font-bold text-[#4E8B69] uppercase tracking-wider">
                ACTIVE LEVEL
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-[rgba(245,242,234,0.75)]">
              {instinctDescription}
            </p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[rgba(245,242,234,0.70)] shrink-0 mt-0.5">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Member Bio (ONLY rendered if explicitly provided by user!) */}
      {bio && bio.trim().length > 0 && (
        <div className="pt-1">
          <p className="text-sm font-normal leading-relaxed text-[#F5F2EA]">
            {bio}
          </p>
        </div>
      )}

      {/* Action Buttons: Dark Forest Green Deepen Pass Button */}
      <div className="flex items-center gap-3.5 pt-1">
        <button
          onClick={onEditProfile}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[rgba(245,242,234,0.20)] bg-[rgba(255,255,255,0.05)] py-3.5 px-4 text-xs font-bold text-[#F5F2EA] backdrop-blur-md transition-all hover:bg-white/10"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Edit Availability &amp; Answers</span>
        </button>

        <button
          onClick={onDeepenPass}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#2D523E] border border-[rgba(239,185,78,0.30)] py-3.5 px-4 text-xs font-bold text-[#F5F2EA] shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all hover:bg-[#38654D]"
        >
          <span>Deepen Pass →</span>
        </button>
      </div>
    </div>
  );
}
