'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@soul-tribe/ui';
import { motion } from 'framer-motion';
import { ArrowRight, Feather } from 'lucide-react';
import { SYNTHETIC_PROFILES } from '../../../supabase/seed/seed';
import { generateMatchExplanation } from '../../../packages/core/explain/generator';

export default function LandingPage() {
  const p1 = SYNTHETIC_PROFILES[0];
  const p2 = SYNTHETIC_PROFILES[1];
  const sampleExplanation = generateMatchExplanation(p1, p2);

  return (
    <div className="relative min-h-screen w-full bg-[#0D1D15] text-[#FFFDF9] pb-20">
      {/* PAGE CANVAS BACKGROUND: YOUR UPLOADED STYLISH MOTION-BLUR PORTRAIT PHOTO */}
      <img
        src="/user-intro-bg.jpg"
        alt="Intro Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-45"
      />

      {/* Dark Ambient Vignette Overlay for Crisp Legibility */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      {/* PAGE CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-8">
        {/* EDITORIAL BRAND HEADER */}
        <header className="flex items-center justify-between pb-6 border-b border-white/15">
          <div className="flex items-center gap-2">
            <Feather className="h-6 w-6 text-white" />
            <span className="text-[22px] font-extrabold tracking-tight text-white drop-shadow-md">
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
          <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
            Friendship-First Social Coordination · Singapore
          </span>

          <h1 className="mt-4 text-[38px] font-extrabold tracking-tight text-white leading-[44px] drop-shadow-md">
            Six people.<br />
            One good Saturday.<br />
            <span className="text-white/90 underline decoration-white/30 underline-offset-4">Start there.</span>
          </h1>

          <p className="mt-4 max-w-[340px] text-[15px] font-medium leading-relaxed text-white/90 drop-shadow-sm">
            Not a dating app, not an endless feed. A coordination layer that surfaces the right handful of people.
          </p>

          <div className="mt-8">
            <Link href="/onboarding" className="inline-block w-full max-w-[320px]">
              <Button variant="primary" size="lg" className="w-full py-4 text-[15.5px] font-bold">
                Begin 8-Category Social DNA Pass <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.section>

        {/* SAMPLE EDITORIAL RESONANCE READ CARD */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-12 overflow-hidden rounded-[28px] border border-white/20 bg-black/50 backdrop-blur-xl p-6 shadow-2xl"
        >
          <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">
            Editorial Resonance Read Sample
          </span>

          <div className="mt-3 flex items-center justify-between">
            <h3 className="text-[18px] font-bold text-white">
              Priya Sharma & Marcus Tan
            </h3>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white border border-white/30 backdrop-blur-md">
              Strong Fit
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-white/15 pt-4">
            <div>
              <span className="text-[11px] font-bold text-white/70 uppercase">Where You Click</span>
              <p className="mt-1 text-[13.5px] leading-relaxed text-white font-medium">
                “{sampleExplanation.click_text}”
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-white/70 uppercase">Where You Might Rub</span>
              <p className="mt-1 text-[13.5px] leading-relaxed text-white/90">
                “{sampleExplanation.rub_text}”
              </p>
            </div>
          </div>
        </motion.section>

        {/* THREE CORE PRINCIPLES */}
        <section className="mt-12 flex flex-col gap-6">
          <div className="rounded-[20px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
            <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">
              01 / Persistent Artifacts
            </span>
            <h3 className="mt-1 text-[16px] font-bold text-white">
              Outings produce Outing Records, not lost chat logs
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-white/80">
              Post-outing feedback forms a persistent memory strip that visibly changes future matching and builds genuine trust.
            </p>
          </div>

          <div className="rounded-[20px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
            <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">
              02 / Zero Swiping Or Scoring
            </span>
            <h3 className="mt-1 text-[16px] font-bold text-white">
              Human language and shape, never numbers or hot-or-not
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-white/80">
              We never expose compatibility percentages or red/green human ratings. Every match includes honest click and rub explanations.
            </p>
          </div>

          <div className="rounded-[20px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
            <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">
              03 / 6-Person Cap Enforced
            </span>
            <h3 className="mt-1 text-[16px] font-bold text-white">
              Intimate small groups for real adult conversations
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-white/80">
              Free-tier outings are capped strictly at 6 participants including the host, dynamically checked in the matching engine.
            </p>
          </div>
        </section>

        {/* BOTTOM CTA FOOTER */}
        <footer className="mt-12 text-center">
          <Link href="/onboarding">
            <Button variant="primary" size="lg" className="w-full py-4 text-[16px] font-bold">
              Begin 8-Category Social DNA Pass →
            </Button>
          </Link>
          <p className="mt-3 text-[12px] text-white/70">
            Takes ~3 minutes · Strictly confidential vector scoring
          </p>
        </footer>
      </div>
    </div>
  );
}
