'use client';

import React from 'react';
import Link from 'next/link';
import { IllustratedGround, Bloom, SocialDnaBars, Button } from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../supabase/seed/seed';
import { Settings, RefreshCw, Clock, ShieldCheck, ArrowRight, Zap, Users, Award, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  const currentUser = SYNTHETIC_PROFILES[0]; // Priya Sharma

  const bloomDimensions = [
    { key: 'p', label: 'Personality', strength: 0.8, confidence: 0.9, sentence: 'You recharge in quiet spaces and go deep quickly.' },
    { key: 'c', label: 'Communication', strength: 0.7, confidence: 0.85, sentence: 'You reply within a day and prefer intentional messages.' },
    { key: 'r', label: 'Rhythm', strength: 0.6, confidence: 0.8, sentence: 'You prefer plans made a few days ahead on weekends.' },
    { key: 'i', label: 'Intent', strength: 0.9, confidence: 0.95, sentence: 'You are looking for a small, regular circle of close friends.' },
    { key: 'e', label: 'Emotional', strength: 0.75, confidence: 0.9, sentence: 'You open up gradually and stay loyal once comfortable.' },
    { key: 'int', label: 'Interests', strength: 0.85, confidence: 0.85, sentence: 'You love pottery, specialty coffee, and analog film.' },
    { key: 'v', label: 'Values', strength: 0.7, confidence: 0.8, sentence: 'Personal growth and creativity matter deeply to you.' },
    { key: 'l', label: 'Lifestyle', strength: 0.65, confidence: 0.75, sentence: 'You enjoy quiet dining and $20–50 low-key meetups.' },
  ];

  const socialDnaCategories = [
    { key: 'personality', name: 'Personality', score: 80 },
    { key: 'communication', name: 'Communication', score: 90 },
    { key: 'rhythm', name: 'Social Rhythm', score: 70 },
    { key: 'intent', name: 'Friendship Intent', score: 100 },
    { key: 'emotional', name: 'Emotional Style', score: 80 },
    { key: 'interests', name: 'Interests', score: 65 },
    { key: 'values', name: 'Values', score: 90 },
    { key: 'lifestyle', name: 'Lifestyle', score: 75 },
  ];

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      {/* Top Bar Header */}
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.profile.avatar_url || ''}
            alt={currentUser.profile.display_name}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-[#C85A32]"
          />
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#C85A32] uppercase">
              Tribal Pass · 72% Complete
            </span>
            <h1 className="text-[22px] font-extrabold tracking-tight text-[#3D2E24]">
              {currentUser.profile.display_name}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert('Settings: Visibility, Dealbreakers, Blocked People')}
          className="rounded-full border border-[#3D2E24]/10 bg-[#FFFDF9] p-2.5 text-[#4A3B30] hover:bg-[#EFE5D8]"
        >
          <Settings className="h-4.5 w-4.5" />
        </button>
      </header>

      {/* REPUTATION & STANDING METRIC CARD */}
      <section className="mt-4 flex items-center justify-between rounded-[24px] border border-[#2E5345]/15 bg-[#E1E8E3] p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E5345] text-[#FFFDF9]">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#3D2E24]">Standing & Vouches</span>
              <span className="rounded-full bg-[#2E5345] px-2 py-0.5 text-[10px] font-bold text-[#FFFDF9]">
                High Standing
              </span>
            </div>
            <p className="text-[12px] font-medium text-[#4A3B30]">6 Vouches & Kept RSVPs · 4 Bonds</p>
          </div>
        </div>

        <Link href="/mirror" className="text-[12px] font-bold text-[#2E5345] hover:underline">
          View Standing →
        </Link>
      </section>

      {/* PART II — DEEPER TRIBAL PASS CARD */}
      <section className="mt-4 rounded-[24px] border border-[#C85A32]/20 bg-[#EFE5D8]/70 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#C85A32]">
            <Sparkles className="h-4.5 w-4.5" />
            <span className="text-[12px] font-bold uppercase tracking-wider">
              Part II — Deeper Tribal Pass
            </span>
          </div>
          <Link href="/you/deeper">
            <Button variant="primary" size="sm">
              Deepen Pass <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <p className="mt-1.5 text-[13px] font-medium leading-[19px] text-[#4A3B30]">
          Enrich your profile at your own pace across 10 progressive categories (A through J) to continuously refine recommendations.
        </p>
      </section>

      {/* FRIENDSHIP DNA BLOOM */}
      <section className="mt-5 flex flex-col items-center rounded-[28px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-5 shadow-[0_8px_24px_-6px_rgba(61,46,36,0.06)]">
        <span className="text-[11px] font-bold tracking-wider text-[#7A6B5F] uppercase">
          Interactive Friendship DNA
        </span>
        <p className="text-[12px] text-[#7A6B5F]">Tap any petal to reveal your trait sentence</p>
        <div className="my-3">
          <Bloom dimensions={bloomDimensions} size={210} interactive={true} />
        </div>
      </section>

      {/* LAYER 2 PROFILE ARTIFACT NAVIGATION CARDS */}
      <section className="mt-5 grid grid-cols-2 gap-3">
        <Link href="/timeline" className="flex flex-col justify-between rounded-[24px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-4 shadow-sm transition-all hover:bg-[#EFE5D8]/60">
          <div className="flex items-center gap-1.5 text-[#C85A32]">
            <Clock className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase">Timeline</span>
          </div>
          <h3 className="mt-2 text-[15px] font-extrabold text-[#3D2E24]">
            Tribe's Timeline
          </h3>
          <p className="mt-1 text-[11px] font-medium text-[#7A6B5F]">Holds your history</p>
        </Link>

        <Link href="/mirror" className="flex flex-col justify-between rounded-[24px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-4 shadow-sm transition-all hover:bg-[#EFE5D8]/60">
          <div className="flex items-center gap-1.5 text-[#2E5345]">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase">Mirror</span>
          </div>
          <h3 className="mt-2 text-[15px] font-extrabold text-[#3D2E24]">
            Mirror-Profile
          </h3>
          <p className="mt-1 text-[11px] font-medium text-[#7A6B5F]">Behavioral patterns</p>
        </Link>
      </section>

      {/* SOCIAL DNA INDEX BARS */}
      <section className="mt-5">
        <SocialDnaBars categories={socialDnaCategories} />
      </section>
    </IllustratedGround>
  );
}
