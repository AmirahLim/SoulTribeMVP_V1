'use client';

import React from 'react';
import Link from 'next/link';
import { IllustratedGround, Button } from '@soul-tribe/ui';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SYNTHETIC_PROFILES } from '../../../supabase/seed/seed';
import { generateMatchExplanation } from '../../../packages/core/explain/generator';

export default function LandingPage() {
  const p1 = SYNTHETIC_PROFILES[0];
  const p2 = SYNTHETIC_PROFILES[1];
  const sampleExplanation = generateMatchExplanation(p1, p2);

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-20">
      {/* EDITORIAL BRAND HEADER */}
      <header className="flex items-center justify-between pb-6 border-b border-[#F3F0E9]/12">
        <div className="flex items-center gap-2">
          <span className="text-[22px] font-bold tracking-tight text-[#F3F0E9]">
            SOUL TRIBE
          </span>
        </div>

        <Link href="/onboarding">
          <Button variant="primary" size="sm">
            Start Pass
          </Button>
        </Link>
      </header>

      {/* HERO INTRODUCTION — LUXURY MINIMALIST */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 flex flex-col text-left"
      >
        <span className="text-[11px] font-bold tracking-widest text-[#D49B4B] uppercase">
          Friendship-First Social Coordination · Singapore
        </span>

        <h1 className="mt-4 text-[38px] font-extrabold tracking-tight text-[#F3F0E9] leading-[44px]">
          Six people.<br />
          One good Saturday.<br />
          <span className="text-[#D49B4B]">Start there.</span>
        </h1>

        <p className="mt-4 max-w-[340px] text-[15px] font-medium leading-relaxed text-[#A6AAA4]">
          Not a dating app, not an endless feed. A coordination layer that surfaces the right handful of people.
        </p>

        <div className="mt-8">
          <Link href="/onboarding" className="inline-block w-full max-w-[320px]">
            <Button variant="primary" size="lg" className="w-full">
              Begin 8-Category Social DNA Pass <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.section>

      {/* SAMPLE MATCH OBJECT */}
      <section className="mt-12 pt-8 border-t border-[#F3F0E9]/12">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-[#A6AAA4] uppercase">
            Sample Tribal Pass Resonance Read
          </span>
          <span className="text-[12px] font-bold text-[#D49B4B]">
            Strong Fit
          </span>
        </div>

        {/* CANDIDATE OBJECT */}
        <div className="mt-4 rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <img
              src={p2.profile.avatar_url || ''}
              alt={p2.profile.display_name}
              className="h-12 w-12 rounded-full object-cover ring-1 ring-[#D49B4B]/40"
            />
            <div>
              <h3 className="text-[18px] font-bold text-[#F3F0E9]">
                {p2.profile.display_name}
              </h3>
              <p className="text-[12.5px] text-[#A6AAA4]">
                {p2.profile.home_area} · Singapore
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-[13.5px] leading-relaxed border-t border-[#F3F0E9]/10 pt-3.5">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#D49B4B] uppercase">
                Why you might click
              </span>
              <p className="mt-1 text-[#F3F0E9]">{sampleExplanation.click_text}</p>
            </div>

            <div className="pt-2 border-t border-[#F3F0E9]/10">
              <span className="text-[10px] font-bold tracking-widest text-[#A6AAA4] uppercase">
                Where you might rub
              </span>
              <p className="mt-1 text-[#A6AAA4]">{sampleExplanation.rub_text}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SINGAPORE COHORT INVITATION */}
      <section className="mt-10 pt-6 border-t border-[#F3F0E9]/12">
        <h3 className="text-[22px] font-bold text-[#F3F0E9] tracking-tight">
          Join the 30-Person Singapore Test Cohort
        </h3>
        <p className="mt-2 text-[14px] text-[#A6AAA4] leading-relaxed max-w-[340px]">
          Experience coordination built for adults in Singapore.
        </p>

        <div className="mt-6">
          <Link href="/onboarding" className="inline-block w-full max-w-[320px]">
            <Button variant="primary" size="md" className="w-full">
              Begin 8-Category Social DNA <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </IllustratedGround>
  );
}
