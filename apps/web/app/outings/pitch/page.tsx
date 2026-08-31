'use client';

export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../../supabase/seed/seed';
import { calculateGroupCohesion } from '../../../../../packages/core/matching/cohesion';
import { ProfileVector } from '../../../../../packages/core/domain/types';
import { Check, AlertTriangle, ArrowLeft, Plus } from 'lucide-react';
import { addUserPitch, PitchedOuting, JoinedGuest } from '../../../lib/userStore';

function PitchComposerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialInviteId = searchParams.get('inviteId');

  // Form State
  const [title, setTitle] = useState('Saturday Pottery & Filter Coffee');
  const [pitch, setPitch] = useState(
    "Let's spend two hours throwing clay at Tiong Bahru Studios, followed by a quiet filter coffee to talk properly."
  );
  const [area, setArea] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = getUserProfile();
      return p.homeArea || 'Singapore';
    }
    return 'Singapore';
  });
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

    const joinedGuestsList: JoinedGuest[] = selectedGuests.map((g) => ({
      id: g.profile.id,
      name: g.profile.display_name,
      avatarUrl: g.profile.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      homeArea: g.profile.home_area,
      status: 'Confirmed',
    }));

    const newPitchObj: PitchedOuting = {
      id: `pitch-${Date.now()}`,
      title: title.trim() || 'Custom Outing Pitch',
      pitch: pitch.trim(),
      area: area.trim() || 'Tiong Bahru',
      dateTime: dateTime.trim() || 'This Saturday',
      hostName: hostUser.profile.display_name || 'Priya Sharma',
      hostAvatar: hostUser.profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      seatsTotal: totalSeats,
      seatsFilled: joinedGuestsList.length + 1,
      cohesionScore: Math.round(cohesionResult.cohesion * 100),
      joinedGuests: joinedGuestsList,
      createdAt: new Date().toISOString(),
    };

    addUserPitch(newPitchObj);
    setCreated(true);
  };

  const cohesionScore = (cohesionResult.cohesion * 100).toFixed(0);
  const isFeasible = cohesionResult.feasibility;
  const warningsList = cohesionResult.warnings || [];

  return (
    <div className="relative min-h-screen w-full bg-[#0D1D15] text-[#FFFDF9] pb-24">
      {/* PAGE CANVAS BACKGROUND: YOUR UPLOADED ARTSY GOLDEN-HOUR MOTION PHOTO */}
      <img
        src="/user-outing-bg.jpg"
        alt="Outing Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-45"
      />

      {/* Dark Ambient Vignette Overlay for Crisp Readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      {/* PAGE CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center text-[13.5px] font-semibold text-white/80 hover:text-white"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Cancel Proposal
        </button>

        {!created ? (
          <form onSubmit={handleCreateOuting} className="flex flex-col gap-6">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                Host Proposal Composer
              </span>
              <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-white drop-shadow-md">
                Pitch an Outing
              </h1>
              <p className="mt-1 text-[14px] text-white/80">
                Design a small-group meetup for up to 6 people.
              </p>
            </div>

            {/* STEP 1: TITLE & DETAILS */}
            <div className="rounded-[24px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
              <h3 className="text-[17px] font-bold text-white">
                1. Title & Details
              </h3>

              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-white">Outing Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 h-11 w-full rounded-[12px] border border-white/20 bg-black/60 px-4 text-[14px] text-white outline-none"
                    placeholder="e.g. Saturday Pottery & Coffee"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-white">Host Pitch (Your own words)</label>
                  <textarea
                    rows={3}
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    className="mt-1 w-full rounded-[12px] border border-white/20 bg-black/60 p-3 text-[14px] text-white outline-none"
                    placeholder="Describe what you want to do..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[13px] font-semibold text-white">Area</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="mt-1 h-11 w-full rounded-[12px] border border-white/20 bg-black/60 px-4 text-[14px] text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-white">When</label>
                    <input
                      type="text"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      className="mt-1 h-11 w-full rounded-[12px] border border-white/20 bg-black/60 px-4 text-[14px] text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: INVITE CANDIDATES */}
            <div className="rounded-[24px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-white">
                  2. Select Guests ({selectedGuests.length + 1} / {totalSeats} Seats)
                </h3>
                <span className="text-[11px] font-bold text-white/80">
                  Max 6 Seats
                </span>
              </div>

              <p className="mt-1 text-[12.5px] text-white/80">
                Select high-resonance matches to invite. Cohesion is calculated dynamically.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                {candidatePool.slice(0, 4).map((candidate) => {
                  const isSelected = selectedGuests.some((g) => g.profile.id === candidate.profile.id);

                  return (
                    <button
                      key={candidate.profile.id}
                      type="button"
                      onClick={() => toggleGuest(candidate)}
                      className={`flex items-center justify-between rounded-[16px] border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-white bg-white/20 text-white'
                          : 'border-white/15 bg-black/40 text-white/80 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={candidate.profile.avatar_url || ''}
                          alt={candidate.profile.display_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="text-[14px] font-bold text-white">
                            {candidate.profile.display_name}
                          </h4>
                          <span className="text-[11.5px] text-white/70">
                            {candidate.profile.home_area}
                          </span>
                        </div>
                      </div>

                      <div className={`flex h-7 w-7 items-center justify-center rounded-full border ${isSelected ? 'border-white bg-white text-black' : 'border-white/30 bg-black/40 text-white'}`}>
                        {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: GROUP COHESION READOUT */}
            <div className="rounded-[24px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
              <h3 className="text-[17px] font-bold text-white">
                3. Group Cohesion Calculation
              </h3>

              <div className="mt-3 flex items-center justify-between rounded-[16px] border border-white/15 bg-black/60 p-3.5">
                <div>
                  <span className="text-[11px] font-bold text-white/70 uppercase">Cohesion Score</span>
                  <p className="text-[16px] font-bold text-white">
                    {cohesionScore} / 100
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-white/70 uppercase">Feasibility</span>
                  <p className="text-[14px] font-bold text-white capitalize">
                    {isFeasible ? 'High Alignment' : 'Schedule Friction'}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[13px] text-white/90 leading-relaxed">
                  Calculated based on social energy balance, shared weekend availability, and communication style resonance across all {selectedGuests.length + 1} group members.
                </p>
              </div>

              {warningsList.length > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-[14px] border border-white/20 bg-black/60 p-3 text-[12.5px] text-white">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <div>
                    {warningsList.map((w, idx) => (
                      <p key={idx}>{String(w)}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button variant="primary" size="lg" type="submit" className="w-full py-4 text-[16px] font-bold">
              Publish Outing Proposal →
            </Button>
          </form>
        ) : (
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-black">
              <Check className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-[24px] font-bold text-white">
              Outing Proposed!
            </h2>
            <p className="mt-2 text-[14px] text-white/80 leading-relaxed">
              Your outing proposal <strong className="text-white">"{title}"</strong> has been saved and connected to your Home Pitches tab!
            </p>

            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/home')}
              className="mt-6 w-full"
            >
              View My Pitches on Home Dashboard →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PitchOutingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D1D15] p-6 text-[#FFFDF9]">Loading composer...</div>}>
      <PitchComposerContent />
    </Suspense>
  );
}
