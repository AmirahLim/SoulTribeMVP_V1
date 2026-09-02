'use client';

import React from 'react';

export interface ProfileHeroProps {
  displayName: string;
  handle: string;
  homeArea: string;
  bio?: string;
  avatarUrl?: string;
  tier?: string;
  standingText?: string;
  confidence: number; // 0..1
  nextQuestions?: Array<{ thread: string; question: string; prompt: string }>;
  onEditProfile?: () => void;
  onExploreThread?: (threadKey: string) => void;
}

export function ProfileHero({
  displayName,
  handle,
  homeArea,
  bio,
  avatarUrl,
  tier = 'Member',
  standingText = 'Good Standing',
  confidence,
  nextQuestions = [],
  onEditProfile,
  onExploreThread,
}: ProfileHeroProps) {
  // Derive Tribal Pass exploration % directly from engine confidence (never passCompletionPct)
  const passExploredPct = Math.round(confidence * 100);

  // Surface at most 2 recommendations chosen by nextBestQuestions
  const topRecommendations = nextQuestions.slice(0, 2);

  return (
    <div className="w-full rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-6 shadow-xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        {/* User Identity & Info */}
        <div className="flex items-start gap-4">
          <div className="relative h-18 w-18 overflow-hidden rounded-full border-2 border-[#F3F0E9]/20 bg-[#0D1D15] shadow-md">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#2D523E] text-xl font-bold text-[#F3F0E9]">
                {displayName.charAt(0)}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#F3F0E9]">{displayName}</h1>
              <span className="rounded-full bg-[#2D523E]/60 px-2.5 py-0.5 text-[11px] font-semibold text-[#D9E4D2]">
                {tier}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-[#A6AAA4]">
              @{handle} · {homeArea}
            </p>

            {/* Tribal Pass & Standing Badges */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#D9E4D2]/30 bg-[#D9E4D2]/10 px-3 py-1 text-xs font-semibold text-[#D9E4D2]">
                Tribal Pass · {passExploredPct}% explored
              </span>
              <span className="rounded-full border border-[#F3F0E9]/15 bg-[#0D1D15] px-3 py-1 text-xs font-medium text-[#A6AAA4]">
                {standingText}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        {onEditProfile && (
          <button
            onClick={onEditProfile}
            className="self-start rounded-xl border border-[#F3F0E9]/20 bg-[#0D1D15] px-4 py-2 text-xs font-semibold text-[#F3F0E9] transition-all hover:bg-[#2D523E]/40"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Member Bio */}
      {bio && (
        <p className="mt-5 border-t border-[#F3F0E9]/10 pt-4 text-sm font-normal leading-relaxed text-[#F3F0E9]/90">
          "{bio}"
        </p>
      )}

      {/* Sharpen Your Matches Section (Max 2 value-driven recommendations) */}
      {topRecommendations.length > 0 && (
        <div className="mt-6 border-t border-[#F3F0E9]/10 pt-5">
          <p className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
            Sharpen Your Matches
          </p>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {topRecommendations.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-[16px] border border-[#D9E4D2]/20 bg-[#0D1D15] p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-[#F3F0E9]">
                    {item.prompt || `Sharpen your ${item.thread} signals`}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#A6AAA4]">
                    {item.question || 'Explore your preferences to sharpen how Soul Tribe understands compatibility.'}
                  </p>
                </div>

                <button
                  onClick={() => onExploreThread?.(item.thread)}
                  className="mt-3 self-start text-xs font-semibold text-[#D9E4D2] hover:underline"
                >
                  Explore {item.thread} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
