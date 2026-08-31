'use client';

import React from 'react';
import Link from 'next/link';
import { IllustratedGround, SocialDnaBars, Button } from '@soul-tribe/ui';
import { ShieldCheck, RefreshCw, ArrowLeft, Heart, Sparkles, CheckCircle2, Award } from 'lucide-react';

export default function MirrorProfilePage() {
  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      <header className="py-4">
        <Link href="/you" className="flex items-center text-[13px] font-medium text-[#7A6B5F] hover:text-[#3D2E24]">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Profile
        </Link>

        <span className="mt-2 block text-[11px] font-bold tracking-wider text-[#2E5345] uppercase">
          Layer 2 Mirror-Profile Artifact
        </span>

        <h1 className="text-[28px] font-extrabold tracking-tight text-[#3D2E24]">
          Your Mirror-Profile
        </h1>
        <p className="mt-1 text-[14px] text-[#4A3B30]">
          Your friendship patterns & standing rendered back to you from real behavior over time.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-5">
        {/* REPUTATION & STANDING METRIC CARD */}
        <div className="rounded-[28px] border border-[#2E5345]/20 bg-[#E1E8E3] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#2E5345]">
              <Award className="h-5 w-5" />
              <span className="text-[12px] font-bold tracking-wider uppercase">
                Reputation & Standing
              </span>
            </div>
            <span className="rounded-full bg-[#2E5345] px-3 py-0.5 text-[11px] font-bold text-[#FFFDF9]">
              High Standing
            </span>
          </div>

          <h2 className="mt-2 text-[20px] font-extrabold text-[#3D2E24]">
            6 Kept RSVPs & Vouches · 0 Flakes
          </h2>

          <p className="mt-1 text-[13.5px] font-medium leading-[20px] text-[#4A3B30]">
            Every RSVP kept, outing hosted, and vouch received feeds your standing in the tribe.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[12px]">
            <div className="rounded-[14px] bg-[#FFFDF9] p-2.5">
              <span className="font-extrabold text-[#C85A32]">6</span>
              <p className="text-[11px] font-bold text-[#7A6B5F]">Vouches / RSVPs</p>
            </div>
            <div className="rounded-[14px] bg-[#FFFDF9] p-2.5">
              <span className="font-extrabold text-[#2E5345]">4</span>
              <p className="text-[11px] font-bold text-[#7A6B5F]">New Bonds</p>
            </div>
            <div className="rounded-[14px] bg-[#FFFDF9] p-2.5">
              <span className="font-extrabold text-[#D69336]">3</span>
              <p className="text-[11px] font-bold text-[#7A6B5F]">Outings Done</p>
            </div>
          </div>
        </div>

        {/* OBSERVED FRIENDSHIP PATTERNS */}
        <div className="rounded-[28px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-5 shadow-sm">
          <h3 className="text-[18px] font-bold text-[#3D2E24]">
            Observed Behavioral Patterns
          </h3>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-start gap-3 rounded-[18px] bg-[#F8F3ED] p-3.5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C85A32]" />
              <div>
                <h4 className="text-[14px] font-bold text-[#3D2E24]">Group Size Preference</h4>
                <p className="text-[13px] text-[#4A3B30]">
                  You consistently rate 4-person Sunday catch-ups highest in post-outing Rhythm Checks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[18px] bg-[#F8F3ED] p-3.5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2E5345]" />
              <div>
                <h4 className="text-[14px] font-bold text-[#3D2E24]">Opening Pace Shift</h4>
                <p className="text-[13px] text-[#4A3B30]">
                  Your opening pace has recalibrated +0.12 based on positive feedback from your Katong & Tiong Bahru meetups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </IllustratedGround>
  );
}
