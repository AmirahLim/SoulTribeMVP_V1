'use client';

import React from 'react';
import Link from 'next/link';
import { IllustratedGround, ResonanceRead, Button, FeatherLogo } from '@soul-tribe/ui';
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
      {/* HEADER WITH OFFICIAL FEATHER LOGO */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <FeatherLogo size={24} />
          <span className="text-[22px] font-extrabold tracking-tight text-[#1F3D2C]">
            Soul Tribe
          </span>
        </div>

        <Link href="/onboarding">
          <Button variant="emerald" size="sm">
            Start Pass
          </Button>
        </Link>
      </header>

      {/* HERO INTRODUCTION */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-6 flex flex-col items-center text-center"
      >
        <span className="rounded-full border border-[#2D523E]/15 bg-[#E1E8E3] px-3.5 py-1 text-[11px] font-bold tracking-wider text-[#2D523E] uppercase">
          Friendship-First Social Coordination · Singapore
        </span>

        <h1 className="mt-4 text-[34px] font-extrabold tracking-tight text-[#1F3D2C] leading-[40px]">
          Six people.<br />One good Saturday.<br />
          <span className="text-[#D49B4B]">Start there.</span>
        </h1>

        <p className="mt-3 max-w-[320px] text-[15px] font-medium leading-[22px] text-[#4A3B30]">
          Not a dating app, not an endless feed. A coordination layer that surfaces the right handful of people.
        </p>

        <Link href="/onboarding" className="mt-6 w-full max-w-[320px]">
          <Button variant="primary" size="lg" className="w-full shadow-md">
            Begin 8-Question Social DNA Pass <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </motion.section>

      {/* SAMPLE MATCH CARD PREVIEW */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-8 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between px-1">
          <span className="text-[12px] font-bold tracking-wider text-[#7A6B5F] uppercase">
            Sample Tribal Pass Match
          </span>
          <span className="text-[12px] font-bold text-[#2D523E]">
            Strong Fit
          </span>
        </div>

        {/* CANDIDATE CARD */}
        <div className="rounded-[28px] border border-[#2D523E]/08 bg-[#FFFDF9] p-5 shadow-[0_8px_24px_-6px_rgba(45,82,62,0.06)]">
          <div className="flex items-center gap-3">
            <img
              src={p2.profile.avatar_url || ''}
              alt={p2.profile.display_name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-[#D49B4B]"
            />
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1F3D2C]">
                {p2.profile.display_name}
              </h3>
              <p className="text-[12px] font-medium text-[#7A6B5F]">
                {p2.profile.home_area} · Singapore
              </p>
            </div>
          </div>

          <div className="mt-3.5">
            <ResonanceRead
              clickText={sampleExplanation.click_text}
              rubText={sampleExplanation.rub_text}
            />
          </div>
        </div>
      </motion.section>

      {/* Singapore Cohort CTA */}
      <section className="mt-8 rounded-[28px] border border-[#2D523E]/10 bg-[#EFE6D8] p-6 text-center shadow-sm">
        <h3 className="text-[20px] font-extrabold text-[#1F3D2C]">
          Join the Singapore Test Cohort
        </h3>
        <p className="mt-1 text-[13.5px] font-medium text-[#4A3B30]">
          Experience coordination built for adults in Singapore.
        </p>

        <Link href="/onboarding" className="mt-4 block">
          <Button variant="primary" size="md" className="w-full">
            Begin 8-Question Social DNA <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>
    </IllustratedGround>
  );
}
