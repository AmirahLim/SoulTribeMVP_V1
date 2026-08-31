'use client';

export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  IllustratedGround,
  PitchCard,
  RhythmStrip,
  SeatRow,
  Button,
  Chip,
} from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../../supabase/seed/seed';
import { calculateGroupCohesion } from '../../../../../packages/core/matching/cohesion';
import { ProfileVector } from '../../../../../packages/core/domain/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, ArrowLeft, Users, Plus, X } from 'lucide-react';

function PitchComposerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialInviteId = searchParams.get('inviteId');

  const [step, setStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('Saturday Pottery & Filter Coffee');
  const [pitch, setPitch] = useState(
    "Let's spend two hours throwing clay at Tiong Bahru Studios, followed by a quiet filter coffee to talk properly."
  );
  const [category, setCategory] = useState<'coffee' | 'dining' | 'active' | 'cultural' | 'nightlife' | 'creative'>('creative');
  const [area, setArea] = useState('Tiong Bahru');
  const [dateTime, setDateTime] = useState('Sat 14 Sep · 3:00pm');
  const [budget, setBudget] = useState('$20–50');
  const [orientation, setOrientation] = useState<'conversation' | 'activity' | 'balanced'>('conversation');
  const [totalSeats, setTotalSeats] = useState(6); // ENFORCED MAX 6 CAP

  const hostUser = SYNTHETIC_PROFILES[0]; // Priya Sharma
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
        className="mb-4 flex items-center text-[14px] font-medium text-[#7A6B5F] hover:text-[#3D2E24]"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Cancel Proposal
      </button>

      {!created ? (
        <form onSubmit={handleCreateOuting} className="flex flex-col gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#C85A32] uppercase">
              Host Proposal Composer
            </span>
            <h1
              className="mt-1 text-[30px] font-semibold text-[#3D2E24]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              Pitch an Outing
            </h1>
            <p className="mt-1 text-[14px] text-[#4A3B30]">
              Design a small-group meetup for up to 6 people.
            </p>
          </div>

          {/* STEP 1: ACTIVITY & LOCATION */}
          <div className="rounded-[28px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-5 shadow-sm">
            <h3 className="text-[17px] font-bold text-[#3D2E24]">
              1. Title & Details
            </h3>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label className="text-[13px] font-bold text-[#3D2E24]">Outing Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 h-11 w-full rounded-[14px] border border-[#3D2E24]/15 bg-[#F8F3ED] px-4 text-[14px] font-medium text-[#3D2E24] outline-none"
                  placeholder="e.g. Saturday Pottery & Coffee"
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-[#3D2E24]">Host Pitch (Your own words)</label>
                <textarea
                  rows={3}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="mt-1 w-full rounded-[14px] border border-[#3D2E24]/15 bg-[#F8F3ED] p-3 text-[14px] font-medium text-[#3D2E24] outline-none"
                  placeholder="Describe what you want to do..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-bold text-[#3D2E24]">Area</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="mt-1 h-11 w-full rounded-[14px] border border-[#3D2E24]/15 bg-[#F8F3ED] px-4 text-[14px] font-medium text-[#3D2E24] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-bold text-[#3D2E24]">When</label>
                  <input
                    type="text"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="mt-1 h-11 w-full rounded-[14px] border border-[#3D2E24]/15 bg-[#F8F3ED] px-4 text-[14px] font-medium text-[#3D2E24] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: GUEST SELECTION & LIVE COHESION STRIP */}
          <div className="rounded-[28px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-[#3D2E24]">
                2. Invite Candidates
              </h3>
              <span className="text-[12px] font-bold text-[#C85A32]">
                {selectedGuests.length + 1} / {totalSeats} seats
              </span>
            </div>

            {/* LIVE GROUP ADVISORY COHESION STRIP */}
            <div className="mt-3 rounded-[18px] border border-[#2E5345]/20 bg-[#E1E8E3] p-3.5">
              <div className="flex items-center justify-between text-[12px] font-bold">
                <span className="text-[#2E5345]">Group Cohesion Indicator</span>
                <span className="text-[#3D2E24]">
                  {Math.round(cohesionResult.cohesion * 100)}% Cohesion
                </span>
              </div>
              {cohesionResult.warnings.length > 0 && (
                <div className="mt-1 flex items-center gap-1.5 text-[11.5px] font-bold text-[#C85A32]">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
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
                    className={`flex cursor-pointer items-center justify-between rounded-[18px] p-3 transition-all ${
                      isSelected
                        ? 'border-2 border-[#C85A32] bg-[#EFE5D8]'
                        : 'border border-[#3D2E24]/10 bg-[#F8F3ED] hover:bg-[#EFE5D8]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={candidate.profile.avatar_url || ''}
                        alt={candidate.profile.display_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-[14px] font-bold text-[#3D2E24]">
                          {candidate.profile.display_name}
                        </h4>
                        <p className="text-[11.5px] font-medium text-[#7A6B5F]">
                          {candidate.profile.home_area} · High availability overlap
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                        isSelected ? 'bg-[#C85A32] text-[#FFFDF9]' : 'bg-[#FFFDF9] text-[#7A6B5F]'
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
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-8 text-center shadow-sm">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#2E5345]/15 text-[#2E5345]">
            <Check className="h-7 w-7" />
          </div>

          <h2
            className="text-[26px] font-semibold text-[#3D2E24]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Outing Proposal Published!
          </h2>

          <p className="mt-2 text-[14px] text-[#4A3B30]">
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
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-[#7A6B5F]">Loading pitch composer...</div>}>
      <PitchComposerContent />
    </Suspense>
  );
}
