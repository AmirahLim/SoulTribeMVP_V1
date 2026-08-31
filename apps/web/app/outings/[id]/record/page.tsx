'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IllustratedGround, Button, Chip } from '@soul-tribe/ui';
import { Sparkles, Check, ArrowLeft, Lock } from 'lucide-react';

export default function OutingRecordPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [wouldMeetAgain, setWouldMeetAgain] = useState(5);
  const [energyRead, setEnergyRead] = useState<'quieter' | 'as_expected' | 'livelier'>('as_expected');
  const [paceRead, setPaceRead] = useState<'slower' | 'as_expected' | 'faster'>('as_expected');
  const [headline, setHeadline] = useState('Discovered the quiet courtyard behind the vintage shop and agreed 4 people is the ideal group size.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 flex items-center text-[14px] font-medium text-[#5C4E44] hover:text-[#2B211B]"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </button>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <span className="text-[12px] font-semibold tracking-wider text-[#3E6B5C] uppercase">
              24-Hour Post-Outing Artifact
            </span>
            <h1
              className="mt-1 text-[30px] font-semibold text-[#2B211B]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              Rhythm Check & Record
            </h1>
            <p className="mt-1 text-[14px] text-[#5C4E44]">
              Saturday Pottery & Filter Coffee · 14 Sep
            </p>
          </div>

          {/* 1. RHYTHM CHECK */}
          <div className="rounded-[24px] border border-[#2B211B]/10 bg-[#FFFDFA] p-5 shadow-sm">
            <h3
              className="text-[20px] font-semibold text-[#2B211B]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              1. Rhythm Check — How did that land?
            </h3>

            {/* Would meet again 1-5 */}
            <div className="mt-4">
              <label className="text-[14px] font-medium text-[#2B211B]">
                Would meet people from this outing again: <strong className="text-[#D9663F]">{wouldMeetAgain} / 5</strong>
              </label>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setWouldMeetAgain(val)}
                    className={`h-11 w-11 rounded-[14px] text-[16px] font-bold transition-all ${
                      wouldMeetAgain === val
                        ? 'bg-[#D9663F] text-[#FFFDFA] shadow-sm'
                        : 'border border-[#2B211B]/10 bg-[#F5EDE1] text-[#5C4E44]'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Read */}
            <div className="mt-5">
              <label className="text-[14px] font-medium text-[#2B211B]">Energy Read</label>
              <div className="mt-2 flex gap-2">
                {(['quieter', 'as_expected', 'livelier'] as const).map((read) => (
                  <Chip
                    key={read}
                    label={read === 'as_expected' ? 'As Expected' : read.charAt(0).toUpperCase() + read.slice(1)}
                    selected={energyRead === read}
                    onClick={() => setEnergyRead(read)}
                  />
                ))}
              </div>
            </div>

            {/* Pace Read */}
            <div className="mt-5">
              <label className="text-[14px] font-medium text-[#2B211B]">Pace Read</label>
              <div className="mt-2 flex gap-2">
                {(['slower', 'as_expected', 'faster'] as const).map((read) => (
                  <Chip
                    key={read}
                    label={read === 'as_expected' ? 'As Expected' : read.charAt(0).toUpperCase() + read.slice(1)}
                    selected={paceRead === read}
                    onClick={() => setPaceRead(read)}
                  />
                ))}
              </div>
            </div>

            {/* MANDATORY PRIVACY GUARANTEE COPY */}
            <div className="mt-5 flex items-start gap-2 rounded-[16px] border border-[#3E6B5C]/20 bg-[#EDF2F0] p-3.5 text-[13px] text-[#3E6B5C]">
              <Lock className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                <strong>Only we see this.</strong> It shapes who we suggest next — nobody gets rated, and nothing is shown to anyone who was there.
              </p>
            </div>
          </div>

          {/* 2. THE HEADLINE ARTIFACT */}
          <div className="rounded-[24px] border border-[#2B211B]/10 bg-[#FFFDFA] p-5 shadow-sm">
            <h3
              className="text-[20px] font-semibold text-[#2B211B]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              2. The Headline — One line worth keeping
            </h3>
            <p className="mt-1 text-[13px] text-[#8A7D73]">
              This headline becomes the durable Outing Record on your profile.
            </p>

            <textarea
              rows={3}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="mt-3 w-full rounded-[16px] border border-[#2B211B]/15 bg-[#FCF8F3] p-4 text-[15px] text-[#2B211B] outline-none"
              placeholder="One line you'd want to remember..."
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Save Outing Record & Rhythm Check
          </Button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-[#2B211B]/10 bg-[#FFFDFA] p-8 text-center shadow-sm">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#3E6B5C]/15 text-[#3E6B5C]">
            <Sparkles className="h-7 w-7" />
          </div>

          <h2
            className="text-[28px] font-semibold text-[#2B211B]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Outing Record Created
          </h2>

          <p className="mt-2 text-[15px] text-[#5C4E44]">
            Your Rhythm Check has recalibrated your matching vector. Your Outing Record is now preserved on your profile.
          </p>

          <Button variant="primary" size="md" className="mt-6" onClick={() => router.push('/you')}>
            View Profile & Tribe Trail
          </Button>
        </div>
      )}
    </IllustratedGround>
  );
}
