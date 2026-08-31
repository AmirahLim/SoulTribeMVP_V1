'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IllustratedGround, Button, Chip } from '@soul-tribe/ui';
import { Check, ArrowLeft } from 'lucide-react';

export default function OutingRecordPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [wouldMeetAgain, setWouldMeetAgain] = useState(5);
  const [energyRead, setEnergyRead] = useState<'quieter' | 'as_expected' | 'livelier'>('as_expected');
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
        className="mb-4 flex items-center text-[13.5px] font-semibold text-[#A6AAA4] hover:text-[#F3F0E9]"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </button>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
              24-Hour Post-Outing Artifact
            </span>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-[#F3F0E9]">
              Rhythm Check & Record
            </h1>
            <p className="mt-1 text-[14px] text-[#A6AAA4]">
              Saturday Pottery & Filter Coffee · 14 Sep
            </p>
          </div>

          {/* 1. RHYTHM CHECK */}
          <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg">
            <h3 className="text-[18px] font-bold text-[#F3F0E9]">
              1. Rhythm Check — How did that land?
            </h3>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label className="text-[13px] font-semibold text-[#F3F0E9]">
                  Would meet people from this outing again: <strong className="text-[#F3F0E9]">{wouldMeetAgain} / 5</strong>
                </label>
                <div className="mt-2 flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setWouldMeetAgain(val)}
                      className={`flex h-10 w-10 items-center justify-center rounded-[12px] text-[14px] font-bold transition-all ${
                        wouldMeetAgain === val
                          ? 'bg-[#F3F0E9] text-[#0D1D15]'
                          : 'border border-[#F3F0E9]/15 bg-[#0D1D15] text-[#F3F0E9]'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#F3F0E9]">Social energy felt:</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['quieter', 'as_expected', 'livelier'].map((opt) => (
                    <Chip
                      key={opt}
                      label={opt.replace('_', ' ')}
                      selected={energyRead === opt}
                      onClick={() => setEnergyRead(opt as any)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. OUTING RECORD */}
          <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg">
            <h3 className="text-[18px] font-bold text-[#F3F0E9]">
              2. Outing Record (Timeline Artifact)
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <label className="text-[13px] font-semibold text-[#F3F0E9]">
                One headline / memory from this outing:
              </label>
              <textarea
                rows={3}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-3 text-[14px] text-[#F3F0E9] outline-none"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Submit Post-Outing Record
          </Button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-8 text-center shadow-lg">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#0D1D15] border border-[#F3F0E9]/20 text-[#F3F0E9]">
            <Check className="h-7 w-7" />
          </div>

          <h2 className="text-[26px] font-bold text-[#F3F0E9]">
            Record Saved to Tribe's Timeline!
          </h2>

          <p className="mt-2 text-[14px] text-[#A6AAA4]">
            Your Rhythm Check has recalibrated your matching weights for future outings.
          </p>

          <Button variant="primary" size="md" className="mt-6" onClick={() => router.push('/timeline')}>
            View Tribe's Timeline
          </Button>
        </div>
      )}
    </IllustratedGround>
  );
}
