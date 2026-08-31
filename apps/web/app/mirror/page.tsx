'use client';

import React from 'react';
import Link from 'next/link';
import { IllustratedGround } from '@soul-tribe/ui';
import { ArrowLeft, Award, CheckCircle2 } from 'lucide-react';

export default function MirrorProfilePage() {
  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      <header className="py-2 border-b border-[#F3F0E9]/12 pb-4">
        <Link href="/you" className="flex items-center text-[13.5px] font-semibold text-[#A6AAA4] hover:text-[#F3F0E9]">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Profile
        </Link>

        <span className="mt-3 block text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
          Layer 2 Mirror-Profile Artifact
        </span>

        <h1 className="text-[26px] font-bold tracking-tight text-[#F3F0E9]">
          Your Mirror-Profile
        </h1>
        <p className="mt-1 text-[14px] text-[#A6AAA4]">
          Your friendship patterns & standing rendered back to you from real behavior over time.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-6">
        {/* REPUTATION & STANDING METRIC CARD */}
        <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#2B1A17] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#F3F0E9]">
              <Award className="h-5 w-5 text-[#016401]" />
              <span className="text-[12px] font-bold tracking-widest uppercase text-[#8F998D]">
                Reputation & Standing
              </span>
            </div>
            <span className="rounded-full bg-[#074710] px-3 py-0.5 text-[11px] font-bold text-[#F3F0E9]">
              High Standing
            </span>
          </div>

          <h2 className="mt-2 text-[20px] font-bold text-[#F3F0E9]">
            6 Kept RSVPs & Vouches · 0 Flakes
          </h2>

          <p className="mt-1 text-[13.5px] leading-relaxed text-[#A6AAA4]">
            Every RSVP kept, outing hosted, and vouch received feeds your standing in the tribe.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[12px]">
            <div className="rounded-[14px] bg-[#15261C] p-3 border border-[#F3F0E9]/10">
              <span className="font-bold text-[#F3F0E9] text-[16px]">6</span>
              <p className="text-[11px] text-[#A6AAA4]">Vouches / RSVPs</p>
            </div>
            <div className="rounded-[14px] bg-[#15261C] p-3 border border-[#F3F0E9]/10">
              <span className="font-bold text-[#F3F0E9] text-[16px]">4</span>
              <p className="text-[11px] text-[#A6AAA4]">New Bonds</p>
            </div>
            <div className="rounded-[14px] bg-[#15261C] p-3 border border-[#F3F0E9]/10">
              <span className="font-bold text-[#016401] text-[16px]">0</span>
              <p className="text-[11px] text-[#A6AAA4]">Flakes</p>
            </div>
          </div>
        </div>

        {/* BEHAVIORAL PATTERNS */}
        <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#2B1A17] p-5 shadow-lg">
          <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
            Observed Friendship Rhythms
          </span>

          <div className="mt-3 flex flex-col gap-3">
            {[
              'You keep RSVPs 100% of the time (High Reliability)',
              'You prefer 3-4 person quiet coffee and craft outings',
              'You check in every 2 weeks with established bonds',
            ].map((pattern) => (
              <div key={pattern} className="flex items-start gap-2.5 text-[13.5px] text-[#F3F0E9]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#016401]" />
                <span>{pattern}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </IllustratedGround>
  );
}
