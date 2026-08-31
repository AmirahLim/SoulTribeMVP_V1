'use client';

import React, { useState } from 'react';
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

export default function PitchComposerPage() {
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
  const [duration, setDuration] = useState(120);
  const [groupSize, setGroupSize] = useState(6); // Max 6 hard cap!
  const [budgetBand, setBudgetBand] = useState(2); // $20-50
  const [setting, setSetting] = useState('quiet');
  const [orientation, setOrientation] = useState('conversation_first');
  const [visibility, setVisibility] = useState<'invite_only' | 'requestable'>('invite_only');

  const hostProfile = SYNTHETIC_PROFILES[0]; // Priya

  // Guest list state
  const initialGuests = initialInviteId
    ? [SYNTHETIC_PROFILES.find((p) => p.profile.id === initialInviteId) || SYNTHETIC_PROFILES[1]]
    : [SYNTHETIC_PROFILES[1], SYNTHETIC_PROFILES[2]];

  const [selectedGuests, setSelectedGuests] = useState<ProfileVector[]>(initialGuests);

  // Group Cohesion calculation for current candidate list
  const cohesionData = calculateGroupCohesion([hostProfile, ...selectedGuests]);

  const candidatePool = SYNTHETIC_PROFILES.slice(3, 10);

  const toggleGuest = (candidate: ProfileVector) => {
    if (selectedGuests.some((g) => g.profile.id === candidate.profile.id)) {
      setSelectedGuests(selectedGuests.filter((g) => g.profile.id !== candidate.profile.id));
    } else {
      if (selectedGuests.length + 1 >= 6) {
        alert('Free-tier outings are hard-capped at 6 participants total (including host).');
        return;
      }
      setSelectedGuests([...selectedGuests, candidate]);
    }
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else {
      alert('Outing pitched! Invitations sent to guests.');
      router.push('/home');
    }
  };

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      {/* Step Header */}
      <header className="py-4">
        <div className="flex items-center justify-between text-[12px] font-semibold text-[#8A7D73]">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
            className="flex items-center text-[#5C4E44] hover:text-[#2B211B]"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </button>
          <span>Step {step} of 5</span>
        </div>

        <h1
          className="mt-2 text-[30px] font-semibold text-[#2B211B]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          Pitch an Outing
        </h1>
      </header>

      {/* Step Form Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="mt-2 rounded-[28px] border border-[#2B211B]/10 bg-[#FFFDFA] p-6 shadow-sm"
        >
          {/* STEP 1: WHAT */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-semibold tracking-wider text-[#D9663F] uppercase">
                Step 1 — What
              </span>

              <div>
                <label className="text-[14px] font-semibold text-[#2B211B]">Outing Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 h-12 w-full rounded-[16px] border border-[#2B211B]/15 bg-[#FCF8F3] px-4 text-[15px] font-medium text-[#2B211B] outline-none"
                  placeholder="e.g. Saturday Pottery & Filter Coffee"
                />
              </div>

              <div>
                <label className="text-[14px] font-semibold text-[#2B211B]">The Pitch (In your own words)</label>
                <textarea
                  rows={4}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="mt-1.5 w-full rounded-[16px] border border-[#2B211B]/15 bg-[#FCF8F3] p-4 text-[15px] text-[#2B211B] outline-none"
                  placeholder="What is it, and why this? A sentence about what you're picturing does more work than a perfect plan."
                />
              </div>

              <div>
                <label className="text-[14px] font-semibold text-[#2B211B]">Activity Category</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['creative', 'coffee', 'dining', 'active', 'cultural', 'nightlife'] as const).map((cat) => (
                    <Chip
                      key={cat}
                      label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                      selected={category === cat}
                      onClick={() => setCategory(cat)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: WHEN AND WHERE */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <span className="text-[11px] font-semibold tracking-wider text-[#D9663F] uppercase">
                Step 2 — When & Where
              </span>

              <div>
                <label className="text-[14px] font-semibold text-[#2B211B]">Singapore Planning Area</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="mt-1.5 h-12 w-full rounded-[16px] border border-[#2B211B]/15 bg-[#FCF8F3] px-4 text-[15px] font-medium text-[#2B211B] outline-none"
                />
              </div>

              <div>
                <label className="text-[14px] font-semibold text-[#2B211B]">Date & Time</label>
                <input
                  type="text"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="mt-1.5 h-12 w-full rounded-[16px] border border-[#2B211B]/15 bg-[#FCF8F3] px-4 text-[15px] font-medium text-[#2B211B] outline-none"
                />
              </div>

              <div>
                <label className="text-[14px] font-semibold text-[#2B211B]">Your Rhythm Strip Availability</label>
                <p className="mb-2 text-[12px] text-[#8A7D73]">Pitch into a slot you're actually free in</p>
                <RhythmStrip userAvailability={hostProfile.social_rhythm.availability} interactive={false} />
              </div>
            </div>
          )}

          {/* STEP 3: SHAPE (With Hard 6 Participant Cap) */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <span className="text-[11px] font-semibold tracking-wider text-[#D9663F] uppercase">
                Step 3 — Outing Shape
              </span>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[14px] font-semibold text-[#2B211B]">
                    Max Participants: <strong className="text-[#D9663F]">{groupSize}</strong> (includes host)
                  </label>
                  <SeatRow totalSeats={groupSize} filledSeats={selectedGuests.length + 1} />
                </div>

                <input
                  type="range"
                  min="2"
                  max="6"
                  value={groupSize}
                  onChange={(e) => setGroupSize(parseInt(e.target.value))}
                  className="mt-3 w-full accent-[#D9663F]"
                />

                <div className="mt-2 rounded-[14px] border border-[#B0836A]/20 bg-[#F5EDE1]/60 p-3 text-[13px] text-[#5C4E44]">
                  💡 <em>"Six is where conversation splits. Soul Tribe stops here on purpose."</em>
                </div>
              </div>

              <div>
                <label className="text-[14px] font-semibold text-[#2B211B]">Budget Band</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    [0, 'Free'],
                    [1, 'Under $20'],
                    [2, '$20–50'],
                    [3, '$50–100'],
                    [4, '$100+'],
                  ].map(([val, label]) => (
                    <Chip
                      key={String(val)}
                      label={label as string}
                      selected={budgetBand === val}
                      onClick={() => setBudgetBand(Number(val))}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[14px] font-semibold text-[#2B211B]">Orientation</label>
                <div className="mt-2 flex gap-2">
                  <Chip
                    label="Conversation-first"
                    selected={orientation === 'conversation_first'}
                    onClick={() => setOrientation('conversation_first')}
                  />
                  <Chip
                    label="Activity-first"
                    selected={orientation === 'activity_first'}
                    onClick={() => setOrientation('activity_first')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: WHO (HOST CONTROLS THIS SCREEN) */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-[#D9663F] uppercase">
                  Step 4 — Who (Host Guest List Control)
                </span>
                <h3 className="mt-1 text-[20px] font-semibold text-[#2B211B]">
                  Select Invited Guests
                </h3>
                <p className="mt-0.5 text-[13px] text-[#8A7D73]">
                  Soul Tribe suggests candidates ranked by outing compatibility. Host owns the final list.
                </p>
              </div>

              {/* Selected Guest Seats */}
              <div>
                <span className="text-[12px] font-semibold text-[#5C4E44]">
                  Current Guest List ({selectedGuests.length + 1} of {groupSize} seats)
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 rounded-[999px] bg-[#D9663F] px-3 py-1.5 text-[13px] font-medium text-[#FFFDFA]">
                    <span>Priya (Host)</span>
                  </div>
                  {selectedGuests.map((guest) => (
                    <div
                      key={guest.profile.id}
                      className="flex items-center gap-1.5 rounded-[999px] border border-[#2B211B]/15 bg-[#F5EDE1] px-3 py-1.5 text-[13px] font-medium text-[#2B211B]"
                    >
                      <span>{guest.profile.display_name.split(' ')[0]}</span>
                      <button type="button" onClick={() => toggleGuest(guest)}>
                        <X className="h-3.5 w-3.5 text-[#8A7D73] hover:text-[#B3453A]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Advisory Cohesion Strip (§8) */}
              <div className="rounded-[18px] border border-[#B0836A]/30 bg-[#F5EDE1]/70 p-4">
                <div className="flex items-center justify-between text-[12px] font-semibold text-[#B0836A]">
                  <span>Group Cohesion Advisory</span>
                  <span>Cohesion: {(cohesionData.cohesion * 100).toFixed(0)}%</span>
                </div>

                {cohesionData.warnings.length > 0 ? (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {cohesionData.warnings.map((warn, i) => (
                      <p key={i} className="flex items-start text-[13px] leading-[18px] text-[#5C4E44]">
                        <AlertTriangle className="mr-1.5 h-4 w-4 flex-shrink-0 text-[#EFA93C]" />
                        <span>{warn}</span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-[13px] text-[#3E6B5C]">
                    ✨ Highly cohesive group! All guest vectors align smoothly.
                  </p>
                )}
              </div>

              {/* Suggested Candidates List */}
              <div>
                <span className="text-[12px] font-semibold text-[#5C4E44]">
                  Suggested Compatible Candidates
                </span>
                <div className="mt-2 flex flex-col gap-2">
                  {candidatePool.map((cand) => {
                    const isSelected = selectedGuests.some((g) => g.profile.id === cand.profile.id);
                    return (
                      <div
                        key={cand.profile.id}
                        className="flex items-center justify-between rounded-[16px] border border-[#2B211B]/10 bg-[#FCF8F3] p-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={cand.profile.avatar_url || ''}
                            alt={cand.profile.display_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="text-[14px] font-semibold text-[#2B211B]">
                              {cand.profile.display_name}
                            </h4>
                            <p className="text-[12px] text-[#8A7D73]">
                              {cand.profile.home_area} · {cand.interests[0]?.node_name} ({cand.interests[0]?.affinity})
                            </p>
                          </div>
                        </div>

                        <Button
                          variant={isSelected ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={() => toggleGuest(cand)}
                        >
                          {isSelected ? 'Remove' : 'Invite'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PREVIEW & SEND */}
          {step === 5 && (
            <div className="flex flex-col gap-5">
              <span className="text-[11px] font-semibold tracking-wider text-[#D9663F] uppercase">
                Step 5 — Preview Invitation
              </span>

              <PitchCard
                title={title}
                pitch={pitch}
                hostName={hostProfile.profile.display_name}
                hostAvatar={hostProfile.profile.avatar_url || ''}
                dateTime={dateTime}
                location={area}
                budget={budgetBand === 2 ? '$20–50' : 'Low-key'}
                orientation={orientation === 'conversation_first' ? 'Conversation-first' : 'Activity-first'}
                totalSeats={groupSize}
                filledSeats={selectedGuests.length + 1}
              />
            </div>
          )}

          {/* Forward Button */}
          <div className="mt-8 flex justify-end">
            <Button variant="primary" size="md" onClick={handleNext}>
              {step === 5 ? 'Confirm & Send Invitations' : 'Next Step'}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </IllustratedGround>
  );
}
