'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IllustratedGround,
  Bloom,
  ResonanceRead,
  SocialDnaBars,
  Button,
} from '@soul-tribe/ui';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Compass, Check, Users } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const sampleBloomDimensions = [
    { key: 'p', label: 'Personality', strength: 0.8, confidence: 0.9, sentence: 'You recharge in quiet spaces and go deep quickly.' },
    { key: 'c', label: 'Communication', strength: 0.7, confidence: 0.85, sentence: 'You reply within a day and prefer intentional messages.' },
    { key: 'r', label: 'Rhythm', strength: 0.6, confidence: 0.8, sentence: 'You prefer plans made a few days ahead on weekends.' },
    { key: 'i', label: 'Intent', strength: 0.9, confidence: 0.95, sentence: 'You are looking for a small, regular circle of close friends.' },
    { key: 'e', label: 'Emotional', strength: 0.75, confidence: 0.9, sentence: 'You open up gradually and stay loyal once comfortable.' },
    { key: 'int', label: 'Interests', strength: 0.85, confidence: 0.85, sentence: 'You love pottery, specialty coffee, and analog film.' },
    { key: 'v', label: 'Values', strength: 0.7, confidence: 0.8, sentence: 'Personal growth and creativity matter deeply to you.' },
    { key: 'l', label: 'Lifestyle', strength: 0.65, confidence: 0.75, sentence: 'You enjoy quiet dining and $20–50 low-key meetups.' },
  ];

  const sampleCategories = [
    { key: 'personality', name: 'Personality', score: 80, filledBlocks: 8 },
    { key: 'communication', name: 'Communication', score: 90, filledBlocks: 9 },
    { key: 'rhythm', name: 'Social Rhythm', score: 70, filledBlocks: 7 },
    { key: 'intent', name: 'Friendship Intent', score: 100, filledBlocks: 10 },
    { key: 'emotional', name: 'Emotional Style', score: 80, filledBlocks: 8 },
    { key: 'interests', name: 'Interests', score: 60, filledBlocks: 6 },
    { key: 'values', name: 'Values', score: 90, filledBlocks: 9 },
    { key: 'lifestyle', name: 'Lifestyle', score: 70, filledBlocks: 7 },
  ];

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-16">
      {/* Botanical Header */}
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C85A32] text-[#FFFDF9] shadow-sm">
            <Compass className="h-5 w-5" />
          </div>
          <h1
            className="text-[26px] font-semibold tracking-tight text-[#3D2E24]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Soul Tribe
          </h1>
        </div>
        <Link href="/onboarding">
          <Button variant="secondary" size="sm">
            Start Pass
          </Button>
        </Link>
      </header>

      {/* Overlapping Mobile Device Layering Hero (Ref: 99 Peaks & Sonar) */}
      <section className="mt-4 flex flex-col items-center text-center">
        <span className="rounded-[999px] border border-[#2E5345]/20 bg-[#E1E8E3] px-3.5 py-1 text-[11px] font-semibold tracking-wider text-[#2E5345] uppercase shadow-sm">
          Friendship-First Social Coordination · Singapore
        </span>

        <h2
          className="mt-3 text-[40px] font-semibold leading-[44px] tracking-tight text-[#3D2E24]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          Six people. <br />
          One good Saturday. <br />
          <span className="text-[#C85A32]">Start there.</span>
        </h2>

        <p className="mt-2.5 max-w-[340px] text-[15px] leading-[23px] text-[#4A3B30]">
          Not a dating app, not an endless feed. A coordination layer that surfaces the right handful of people.
        </p>

        <Link href="/onboarding" className="mt-5 w-full max-w-[280px]">
          <Button variant="primary" size="lg" className="w-full">
            Begin 8-Category Social DNA Pass <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Layered Overlapping Phone Mockup Displays (Ref: 99 Peaks & Sonar) */}
      <section className="relative my-10 flex items-center justify-center">
        {/* Rear Card (Angled Left -3deg) */}
        <motion.div
          initial={{ rotate: -6, y: 20, opacity: 0 }}
          animate={{ rotate: -3, y: 0, opacity: 0.9 }}
          transition={{ duration: 0.6 }}
          className="absolute -left-3 top-2 w-[240px] rounded-[32px] border border-[#3D2E24]/10 bg-[#EBDDD0] p-4 shadow-md"
        >
          <div className="text-[11px] font-semibold text-[#7A6B5F] uppercase">Social DNA Map</div>
          <div className="my-2">
            <Bloom dimensions={sampleBloomDimensions} size={110} interactive={false} />
          </div>
        </motion.div>

        {/* Front Featured Card (Angled Right 2deg) */}
        <motion.div
          initial={{ rotate: 4, scale: 0.95, opacity: 0 }}
          animate={{ rotate: 1.5, scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-20 w-[290px] rounded-[32px] border border-[#3D2E24]/12 bg-[#FFFDF9] p-5 shadow-[0_16px_36px_-10px_rgba(61,46,36,0.22)]"
        >
          <div className="flex items-center gap-2.5">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Priya"
              className="h-12 w-12 rounded-full object-cover shadow-sm ring-2 ring-[#C85A32]"
            />
            <div>
              <h3 className="text-[17px] font-semibold text-[#3D2E24]">Priya Sharma</h3>
              <p className="text-[12px] text-[#7A6B5F]">Tiong Bahru · Singapore</p>
            </div>
          </div>

          <div className="mt-3">
            <SocialDnaBars categories={sampleCategories} className="p-3" />
          </div>
        </motion.div>
      </section>

      {/* SPECIMEN RESONANCE READ CARD WITH MANDATORY FRICTION */}
      <section className="mt-6">
        <h3
          className="mb-3 text-[22px] font-semibold text-[#3D2E24]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          Sample Resonance Read
        </h3>
        <ResonanceRead
          clickText="You both want a small circle of close friendships rather than a big social network, and neither of you expects constant texting — but you both want conversations that go somewhere when you do meet."
          frictionText="Maya is considerably more spontaneous than you and enjoys larger groups. You tend to prefer plans in advance and groups of three or four."
        />
      </section>

      {/* INLINE SIGN-IN / WAITLIST FORM */}
      <section className="mt-10 rounded-[32px] border border-[#3D2E24]/10 bg-[#FFFDF9] p-6 text-center shadow-[0_4px_16px_rgba(61,46,36,0.06)]">
        <h3
          className="text-[26px] font-semibold text-[#3D2E24]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          Join the 30-Person Singapore Test Cohort
        </h3>
        <p className="mt-1 text-[14px] text-[#4A3B30]">
          Experience coordination built for adults in Singapore.
        </p>

        {!submitted ? (
          <form onSubmit={handleWaitlist} className="mt-5 flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-[16px] border border-[#3D2E24]/15 bg-[#F5ECE3] px-4 text-[15px] text-[#3D2E24] outline-none transition-all focus:border-[#C85A32]"
            />
            <Link href="/onboarding" className="w-full">
              <Button type="button" variant="primary" size="lg" className="w-full">
                Begin 8-Category Social DNA <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </form>
        ) : (
          <div className="mt-5 flex items-center justify-center gap-2 text-[#2E5345]">
            <Check className="h-5 w-5" />
            <span className="font-medium">Waitlist joined! Redirecting to onboarding...</span>
          </div>
        )}
      </section>
    </IllustratedGround>
  );
}
