'use client';

import React from 'react';
import { Settings, Sparkles, ArrowUpRight, Calendar, Bookmark, Info } from 'lucide-react';

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
  onDeepenPass?: () => void;
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
  onDeepenPass,
}: ProfileHeroProps) {
  const passExploredPct = Math.round(confidence * 100);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Header Row */}
      <div className="flex items-center gap-3.5 pt-2">
        <div className="relative h-[60px] w-[60px] shrink-0 rounded-full bg-gradient-to-br from-[#5A4030] to-[#2A211A] shadow-[0_8px_24px_rgba(0,0,0,0.6)] p-[2px]">
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

        <div>
          <div className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
            TRIBAL PASS · {passExploredPct}% COMPLETE
          </div>
          <h1 className="font-['Bricolage_Grotesque'] text-[25px] font-bold text-[#F5F2EA] leading-tight mt-0.5">
            {displayName}
          </h1>
        </div>

        <button
          onClick={onEditProfile}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(245,242,234,0.11)] bg-[rgba(255,255,255,0.06)] text-[rgba(245,242,234,0.70)] hover:text-[#F5F2EA] transition-all"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Tribe Standing */}
      <div className="flex items-center justify-between pt-1 border-t border-[rgba(245,242,234,0.08)]">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[rgba(245,242,234,0.44)]">
          TRIBE STANDING
        </span>
        <button
          onClick={onEditProfile}
          className="flex items-center gap-1 text-xs text-[rgba(245,242,234,0.70)] hover:text-[#F5F2EA] underline decoration-white/20"
        >
          <Info className="h-3.5 w-3.5" />
          <span>How Standing Works</span>
        </button>
      </div>

      {/* ✨ SHARPEN YOUR MATCHES Section */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 text-[#EFB94E] text-[11px] font-bold tracking-widest uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          <span>SHARPEN YOUR MATCHES</span>
        </div>

        <div className="grid gap-2.5">
          {/* Card 1: Interests & Passions */}
          <button
            onClick={() => onExploreThread?.('interests')}
            className="flex items-center justify-between rounded-[18px] border border-[rgba(239,185,78,0.25)] bg-[rgba(10,12,11,0.62)] p-4 text-left backdrop-blur-xl shadow-lg transition-all hover:border-[rgba(239,185,78,0.4)]"
            style={{
              background: 'radial-gradient(120% 80% at 12% 0%, rgba(239,185,78,0.12) 0%, rgba(10,12,11,0.62) 62%)',
            }}
          >
            <div>
              <h4 className="font-['Bricolage_Grotesque'] text-sm font-semibold text-[#EFB94E]">
                Interests &amp; Passions
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[rgba(245,242,234,0.70)]">
                Adding a couple more interests unlocks shared-activity matches.
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-[#EFB94E] ml-3" />
          </button>

          {/* Card 2: Core Values */}
          <button
            onClick={() => onExploreThread?.('values')}
            className="flex items-center justify-between rounded-[18px] border border-[rgba(239,185,78,0.25)] bg-[rgba(10,12,11,0.62)] p-4 text-left backdrop-blur-xl shadow-lg transition-all hover:border-[rgba(239,185,78,0.4)]"
            style={{
              background: 'radial-gradient(120% 80% at 12% 0%, rgba(239,185,78,0.12) 0%, rgba(10,12,11,0.62) 62%)',
            }}
          >
            <div>
              <h4 className="font-['Bricolage_Grotesque'] text-sm font-semibold text-[#EFB94E]">
                Core Values
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[rgba(245,242,234,0.70)]">
                Highlighting your core friendship values sharpens your fit score.
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-[#EFB94E] ml-3" />
          </button>
        </div>
      </div>

      {/* Social Instinct Card: Connector */}
      <div className="flex items-center justify-between rounded-[20px] border border-[rgba(245,242,234,0.11)] bg-[rgba(10,12,11,0.62)] p-4 backdrop-blur-xl shadow-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-base">🤝</span>
            <h3 className="font-['Bricolage_Grotesque'] text-base font-bold text-[#F5F2EA]">
              Connector
            </h3>
            <span className="rounded-full border border-[rgba(91,217,154,0.30)] bg-[rgba(91,217,154,0.14)] px-2.5 py-0.5 text-[10px] font-bold text-[#5BD99A] uppercase tracking-wider">
              ACTIVE LEVEL
            </span>
          </div>
          <p className="text-xs text-[rgba(245,242,234,0.70)]">
            Actively brings people together
          </p>
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[rgba(245,242,234,0.70)]">
          <Bookmark className="h-4 w-4" />
        </button>
      </div>

      {/* Member Bio & Location */}
      <div className="flex flex-col gap-1 pt-1">
        {bio && (
          <p className="text-sm font-normal leading-relaxed text-[#F5F2EA]">
            {bio}
          </p>
        )}
        <p className="text-xs font-semibold text-[rgba(245,242,234,0.44)] mt-0.5">
          {homeArea}
        </p>
      </div>

      {/* Action Buttons: Edit Availability & Deepen Pass */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onEditProfile}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[rgba(245,242,234,0.20)] bg-[rgba(255,255,255,0.05)] py-3 px-4 text-xs font-bold text-[#F5F2EA] backdrop-blur-md transition-all hover:bg-white/10"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Edit Availability &amp; Answers</span>
        </button>

        <button
          onClick={onDeepenPass}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#5BD99A] py-3 px-4 text-xs font-bold text-[#070908] shadow-[0_4px_16px_rgba(91,217,154,0.3)] transition-all hover:brightness-110"
        >
          <span>Deepen Pass →</span>
        </button>
      </div>
    </div>
  );
}
