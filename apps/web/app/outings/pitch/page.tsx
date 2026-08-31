'use client';

export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  IllustratedGround,
  Button,
} from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../../supabase/seed/seed';
import { calculateGroupCohesion } from '../../../../../packages/core/matching/cohesion';
import { ProfileVector } from '../../../../../packages/core/domain/types';
import { Check, AlertTriangle, ArrowLeft, Plus } from 'lucide-react';

function PitchComposerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialInviteId = searchParams.get('inviteId');

  // Form State
  const [title, setTitle] = useState('Saturday Pottery & Filter Coffee');
  const [pitch, setPitch] = useState(
    "Let's spend two hours throwing clay at Tiong Bahru Studios, followed by a quiet filter coffee to talk properly."
  );
  const [area, setArea] = useState('Tiong Bahru');
  const [dateTime, setDateTime] = useState('Sat 14 Sep · 3:00pm');
  const [totalSeats] = useState(6);

  const hostUser = SYNTHETIC_PROFILES[0];
  const candidatePool = SYNTHETIC_PROFILES.slice(1);

  const [selectedGuests, setSelectedGuests] = useState<ProfileVector[]>(() => {
    if (initialInviteId) {
      const match = candidatePool.find((p) => p.profile.id === initialInviteId);
      return match ? [match] : [candidatePool[0], candidatePool[1]];
    }
    return [candidatePool[0], candidatePool[1]];
  });

  const [created, setCreated] = useState(false);

  const cohesionResult = calculateGroupCohesion([hostUser, ...selectedGuests]);

  const toggleGuest = (candidate: ProfileVector) => {
    if (selectedGuests.some((g) => g.profile.id === candidate.profile.id)) {
      setSelectedGuests(selectedGuests.filter((g) => g.profile.id !== candidate.profile.id));
    } else {
      if (selectedGuests.length + 1 >= totalSeats) {
        alert(`Free tier outings are capped at ${totalSeats} total seats including host.`);
        return;
      }
      setSelectedGuests([...selectedGuests, candidate]);
    }
  };

  const handleCreateOuting = (e: React.FormEvent) => {
    e.preventDefault();
    setCreated(true);
  };

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 flex items-center text-[13.5px] font-semibold text-[#A6AAA4] hover:text-[#F3F0E9]"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Cancel Proposal
      </button>

      {!created ? (
        <form onSubmit={handleCreateOuting} className="flex flex-col gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
              Host Proposal Composer
            </span>
            <h1 className="mt-1 text-[28px] font-bold tracking-tight text-[#F3F0E9]">
              Pitch an Outing
            </h1>
            <p className="mt-1 text-[14px] text-[#A6AAA4]">
              Design a small-group meetup for up to 6 people.
            </p>
          </div>

          {/* STEP 1: TITLE & DETAILS */}
          <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#2B1A17] p-5 shadow-lg">
            <h3 className="text-[17px] font-bold text-[#F3F0E9]">
              1. Title & Details
            </h3>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label className="text-[13px] font-semibold text-[#F3F0E9]">Outing Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 h-11 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] px-4 text-[14px] text-[#F3F0E9] outline-none"
                  placeholder="e.g. Saturday Pottery & Coffee"
                />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-[#F3F0E9]">Host Pitch (Your own words)</label>
                <textarea
                  rows={3}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="mt-1 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-3 text-[14px] text-[#F3F0E9] outline-none"
                  placeholder="Describe what you want to do..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-semibold text-[#F3F0E9]">Area</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="mt-1 h-11 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] px-4 text-[14px] text-[#F3F0E9] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-[#F3F0E9]">When</label>
                  <input
                    type="text"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="mt-1 h-11 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] px-4 text-[14px] text-[#F3F0E9] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: INVITE CANDIDATES */}
          <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#2B1A17] p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-[#F3F0E9]">
                2. Invite Candidates
              </h3>
              <span className="text-[12px] font-bold text-[#F3F0E9]">
                {selectedGuests.length + 1} / {totalSeats} seats
              </span>
            </div>

            {/* LIVE GROUP ADVISORY COHESION STRIP */}
            <div className="mt-3.5 rounded-[16px] border border-[#016401]/30 bg-[#074710]/40 p-3.5">
              <div className="flex items-center justify-between text-[12px] font-semibold">
                <span className="text-[#F3F0E9]">Group Cohesion Indicator</span>
                <span className="text-[#F3F0E9]">
                  {Math.round(cohesionResult.cohesion * 100)}% Cohesion
                </span>
              </div>
              {cohesionResult.warnings.length > 0 && (
                <div className="mt-1 flex items-center gap-1.5 text-[11.5px] font-medium text-[#A6AAA4]">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-[#F3F0E9]" />
                  <span>{cohesionResult.warnings[0]}</span>
                </div>
              )}
            </div>

            {/* Candidate List */}
            <div className="mt-4 flex flex-col gap-2.5">
              {candidatePool.slice(0, 5).map((candidate) => {
                const isSelected = selectedGuests.some((g) => g.profile.id === candidate.profile.id);
                return (
                  <div
                    key={candidate.profile.id}
                    onClick={() => toggleGuest(candidate)}
                    className={`flex cursor-pointer items-center justify-between rounded-[16px] p-3 transition-all ${
                      isSelected
                        ? 'border-2 border-[#016401] bg-[#074710]/60'
                        : 'border border-[#F3F0E9]/12 bg-[#0D1D15] hover:bg-[#15261C]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={candidate.profile.avatar_url || ''}
                        alt={candidate.profile.display_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-[14px] font-bold text-[#F3F0E9]">
                          {candidate.profile.display_name}
                        </h4>
                        <p className="text-[11.5px] font-medium text-[#A6AAA4]">
                          {candidate.profile.home_area} · High availability overlap
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                        isSelected ? 'bg-[#016401] text-[#F3F0E9]' : 'bg-[#15261C] text-[#A6AAA4]'
                      }`}
                    >
                      {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Publish Outing Proposal
          </Button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#F3F0E9]/12 bg-[#2B1A17] p-8 text-center shadow-lg">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#016401]/30 text-[#F3F0E9]">
            <Check className="h-7 w-7" />
          </div>

          <h2 className="text-[26px] font-bold text-[#F3F0E9]">
            Outing Proposal Published!
          </h2>

          <p className="mt-2 text-[14px] text-[#A6AAA4]">
            Invitations have been sent to your selected candidates. You can track RSVPs in your dashboard.
          </p>

          <Button variant="primary" size="md" className="mt-6" onClick={() => router.push('/home')}>
            Back to Home Dashboard
          </Button>
        </div>
      )}
    </IllustratedGround>
  );
}

export default function PitchComposerPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-[#A6AAA4]">Loading pitch composer...</div>}>
      <PitchComposerContent />
    </Suspense>
  );
}
