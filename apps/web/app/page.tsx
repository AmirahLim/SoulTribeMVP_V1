'use client';

import React from 'react';
import Link from 'next/link';
import { IllustratedGround, Bloom, ResonanceRead, PitchCard, Button } from '@soul-tribe/ui';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Users, Calendar, MapPin } from 'lucide-react';
import { SYNTHETIC_PROFILES } from '../../../supabase/seed/seed';
import { generateMatchExplanation } from '../../../packages/core/explain/generator';

export default function LandingPage() {
  const p1 = SYNTHETIC_PROFILES[0];
  const p2 = SYNTHETIC_PROFILES[1];
  const sampleExplanation = generateMatchExplanation(p1, p2);

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-20">
      {/* OPAL HERO HEADER */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1C3A27] text-[#FFFDF9]">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span className="text-[20px] font-extrabold tracking-tight text-[#1C2B22]">
            Soul Tribe
          </span>
        </div>

        <Link href="/onboarding">
          <Button variant="primary" size="sm">
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
        <span className="rounded-full border border-[#1C3A27]/15 bg-[#E1E8E3] px-3.5 py-1 text-[11px] font-bold tracking-wider text-[#1C3A27] uppercase">
          Friendship-First Social Coordination · Singapore
        </span>

        <h1 className="mt-4 text-[34px] font-extrabold tracking-tight text-[#1C2B22] leading-[40px]">
          Six people.<br />One good Saturday.<br />
          <span className="text-[#C85A32]">Start there.</span>
        </h1>

        <p className="mt-3 max-w-[320px] text-[15px] font-medium leading-[22px] text-[#3A4D42]">
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
          <span className="text-[12px] font-bold tracking-wider text-[#6E7F75] uppercase">
            Sample Tribal Pass Match
          </span>
          <span className="text-[12px] font-bold text-[#1C3A27]">
            Strong Fit
          </span>
        </div>

        {/* CANDIDATE CARD */}
        <div className="rounded-[28px] border border-[#1C3A27]/08 bg-[#FFFDF9] p-5 shadow-[0_8px_24px_-6px_rgba(28,58,39,0.06)]">
          <div className="flex items-center gap-3">
            <img
              src={p2.profile.avatar_url || ''}
              alt={p2.profile.display_name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-[#C85A32]"
            />
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1C2B22]">
                {p2.profile.display_name}
              </h3>
              <p className="text-[12px] font-medium text-[#6E7F75]">
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
      <section className="mt-8 rounded-[28px] border border-[#1C3A27]/10 bg-[#EBDDD0] p-6 text-center shadow-sm">
        <h3 className="text-[20px] font-extrabold text-[#1C2B22]">
          Join the Singapore Test Cohort
        </h3>
        <p className="mt-1 text-[13.5px] font-medium text-[#3A4D42]">
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
