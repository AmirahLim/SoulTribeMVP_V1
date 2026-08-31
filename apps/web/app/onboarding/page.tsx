'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IllustratedGround, Bloom, RhythmStrip, Button, Chip } from '@soul-tribe/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, User } from 'lucide-react';
import { getUserProfile, setUserProfile } from '../../lib/userStore';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // USER CUSTOM NAME & PHOTO STATE
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string>('');

  // Q1: What are you hoping to find here? (Up to 3)
  const [q1Finding, setQ1Finding] = useState<string[]>(['A close inner circle', 'People who share my interests']);

  // Q2: What does a great friendship feel like to you? (Up to 4)
  const [q2Feelings, setQ2Feelings] = useState<string[]>(['We can talk about anything', 'We can be ourselves without performing']);

  // Q3: Social Energy (Quiet & intimate <-> Big & energetic spectrum + Preferred group size)
  const [q3Energy, setQ3Energy] = useState<number>(0.3);
  const [q3GroupSize, setQ3GroupSize] = useState<string>('3-4 people');

  // Q4: How do you naturally stay connected with friends? (All that apply)
  const [q4Connected, setQ4Connected] = useState<string[]>(['Random messages throughout the day', 'Mostly talk when we meet']);

  // Q5: How do you like making plans? (Planning rhythm & availability)
  const [q5PlanningRhythm, setQ5PlanningRhythm] = useState<string>('Flexible - a couple of days ahead');
  const [q5Availability, setQ5Availability] = useState<string[]>(['sat_midday', 'sun_evening']);

  // Q6: Pick the outings you'd actually say yes to (Pick at least 5)
  const [q6Outings, setQ6Outings] = useState<string[]>([
    'Coffee & wandering',
    'Brunch',
    'Workshops',
    'Food hunting',
    'Bookshops',
  ]);

  // Q7: When you're getting to know someone, which sounds most like you? (Emotional pacing)
  const [q7EmotionalPacing, setQ7EmotionalPacing] = useState<string>('Let it unfold - I open up naturally over time');

  // Q8: Who would you be excited to meet right now? (Up to 5 qualities)
  const [q8Qualities, setQ8Qualities] = useState<string[]>(['Curious', 'Warm', 'Thoughtful', 'Grounded', 'Creative']);

  const [isRevealing, setIsRevealing] = useState(false);

  // Tribal Pass Completion %
  const passCompletionPct = Math.round((step / 8) * 100);

  const confidence = Math.min(0.95, 0.25 + step * 0.09);
  const bloomDimensions = [
    { key: 'intent', label: 'Intent', strength: q1Finding.length / 3, confidence, sentence: `Seeking ${q1Finding[0] || 'close friends'}.` },
    { key: 'feeling', label: 'Relational', strength: q2Feelings.length / 4, confidence, sentence: `Values friendships where ${q2Feelings[0] || 'we can be ourselves'}.` },
    { key: 'energy', label: 'Social Energy', strength: 1 - q3Energy, confidence, sentence: `Thrives in ${q3GroupSize} settings.` },
    { key: 'contact', label: 'Communication', strength: q4Connected.length / 4, confidence, sentence: `Connects via ${q4Connected[0] || 'thoughtful check-ins'}.` },
    { key: 'rhythm', label: 'Social Rhythm', strength: 0.7, confidence, sentence: `Prefers ${q5PlanningRhythm.toLowerCase()}.` },
    { key: 'outings', label: 'Outing DNA', strength: q6Outings.length / 10, confidence, sentence: `Enjoys ${q6Outings.slice(0, 2).join(', ')}.` },
    { key: 'pacing', label: 'Emotional Pacing', strength: 0.75, confidence, sentence: q7EmotionalPacing },
    { key: 'qualities', label: 'Desired Traits', strength: q8Qualities.length / 5, confidence, sentence: `Drawn to ${q8Qualities.slice(0, 3).join(', ')} people.` },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step === 1 && !userName.trim()) {
      alert('Please enter your name to personalize your Tribal Pass.');
      return;
    }

    if (step < 8) {
      setStep(step + 1);
    } else {
      setUserProfile({
        displayName: userName.trim() || 'You',
        avatarUrl: userPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        passCompletionPct: 100,
      });
      setIsRevealing(true);
    }
  };

  const toggleChip = (list: string[], item: string, setter: (val: string[]) => void, max = 5) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else if (list.length < max) {
      setter([...list, item]);
    }
  };

  const toggleSlot = (slotId: string) => {
    if (q5Availability.includes(slotId)) {
      setQ5Availability(q5Availability.filter((s) => s !== slotId));
    } else {
      setQ5Availability([...q5Availability, slotId]);
    }
  };

  if (isRevealing) {
    return (
      <IllustratedGround variant="paper" className="flex min-h-screen flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center px-4"
        >
          <div className="mb-3 rounded-full bg-[#15261C] p-3.5 text-[#F3F0E9] ring-1 ring-[#F3F0E9]/20">
            <Sparkles className="h-7 w-7" />
          </div>

          <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
            Tribal Pass Active · 100% Complete
          </span>

          <h2 className="mt-1 text-[28px] font-bold tracking-tight text-[#F3F0E9]">
            Welcome, {userName || 'Friend'}
          </h2>

          <p className="mt-2 max-w-[340px] text-[14px] font-medium leading-relaxed text-[#A6AAA4]">
            Your custom Tribal Pass is live. We've learned your baseline rhythm, outings, and relational style. 6 people look like a strong fit!
          </p>

          <div className="my-6">
            <Bloom dimensions={bloomDimensions} size={210} interactive={true} />
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/home')}
            className="w-full max-w-[280px]"
          >
            Explore My Matches & Outings <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </IllustratedGround>
    );
  }

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-16">
      {/* Header with Tribal Pass Completion Status */}
      <header className="flex flex-col pt-2">
        <div className="flex w-full items-center justify-between text-[12px] font-bold text-[#A6AAA4]">
          <span>Part I: Quick Onboarding</span>
          <span className="text-[#F3F0E9]">{passCompletionPct}% Complete</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#15261C]">
          <div
            className="h-full rounded-full bg-[#F3F0E9] transition-all duration-300"
            style={{ width: `${passCompletionPct}%` }}
          />
        </div>
      </header>

      {/* Live Friendship DNA Preview */}
      <section className="mt-4 flex justify-center">
        <Bloom dimensions={bloomDimensions} size={90} interactive={false} />
      </section>

      {/* Question Card */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-6 shadow-xl"
          >
            {/* STEP 1: NAME, PHOTO & FRIENDSHIP INTENT */}
            {step === 1 && (
              <div>
                <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
                  Step 1 of 8 — Profile & Intent
                </span>
                <h3 className="mt-1 text-[21px] font-bold tracking-tight text-[#F3F0E9]">
                  Who are you & what are you hoping to find?
                </h3>

                <div className="mt-5 flex flex-col gap-4">
                  {/* Name Input */}
                  <div>
                    <label className="text-[13px] font-semibold text-[#F3F0E9]">Your Name / Display Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amirah"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="mt-1 h-11 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] px-4 text-[14px] font-medium text-[#F3F0E9] outline-none transition-all focus:border-[#F3F0E9]"
                    />
                  </div>

                  {/* Optional Photo Upload */}
                  <div>
                    <label className="text-[13px] font-semibold text-[#F3F0E9]">Profile Photo (Optional)</label>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[#F3F0E9]/20 bg-[#0D1D15]">
                        {userPhoto ? (
                          <img src={userPhoto} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#A6AAA4]">
                            <User className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <label className="cursor-pointer rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] px-4 py-2 text-[13px] font-semibold text-[#F3F0E9] hover:bg-[#1C3325]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        {userPhoto ? 'Change Photo' : 'Upload Photo'}
                      </label>
                    </div>
                  </div>

                  {/* Intent Chips */}
                  <div>
                    <label className="text-[13px] font-semibold text-[#F3F0E9]">What are you hoping to find here? (Up to 3)</label>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {[
                        'A close inner circle',
                        'New people to hang out with',
                        'Activity buddies',
                        'Deep, meaningful friendships',
                        'People who share my interests',
                        'Adventure / travel friends',
                        'Creative or intellectual friends',
                        "I'm open - surprise me",
                      ].map((option) => (
                        <Chip
                          key={option}
                          label={option}
                          selected={q1Finding.includes(option)}
                          onClick={() => toggleChip(q1Finding, option, setQ1Finding, 3)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Q2: WHAT DOES A GREAT FRIENDSHIP FEEL LIKE TO YOU? */}
            {step === 2 && (
              <div>
                <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
                  Step 2 of 8 — Relational Feeling
                </span>
                <h3 className="mt-1 text-[21px] font-bold tracking-tight text-[#F3F0E9]">
                  What does a great friendship feel like to you?
                </h3>
                <p className="mt-1 text-[12px] font-medium text-[#A6AAA4]">Choose up to 4.</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    'We can talk about anything',
                    'We laugh constantly',
                    'We experience new things together',
                    'We can be ourselves without performing',
                    "We challenge each other's thinking",
                    "We're there when it matters",
                    "We don't need constant contact to stay close",
                    'We share everyday life',
                    'Comfortable silence is enough',
                  ].map((option) => (
                    <Chip
                      key={option}
                      label={option}
                      selected={q2Feelings.includes(option)}
                      onClick={() => toggleChip(q2Feelings, option, setQ2Feelings, 4)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Q3: SOCIAL ENERGY */}
            {step === 3 && (
              <div>
                <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
                  Step 3 of 8 — Social Energy
                </span>
                <h3 className="mt-1 text-[21px] font-bold tracking-tight text-[#F3F0E9]">
                  What kind of social energy feels most like you?
                </h3>

                <div className="mt-5 flex flex-col gap-4">
                  <div>
                    <div className="flex items-center justify-between text-[12px] font-semibold text-[#A6AAA4]">
                      <span>Quiet & intimate</span>
                      <span>Big & energetic</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={q3Energy}
                      onChange={(e) => setQ3Energy(parseFloat(e.target.value))}
                      className="mt-2 w-full accent-[#F3F0E9]"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-[#F3F0E9]">Preferred group size:</label>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {['One-on-one', '3-4 people', '5-8 people', 'Bigger groups', 'Depends on the situation'].map((size) => (
                        <Chip
                          key={size}
                          label={size}
                          selected={q3GroupSize === size}
                          onClick={() => setQ3GroupSize(size)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Q4: CONNECTEDNESS */}
            {step === 4 && (
              <div>
                <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
                  Step 4 of 8 — Communication Style
                </span>
                <h3 className="mt-1 text-[21px] font-bold tracking-tight text-[#F3F0E9]">
                  How do you naturally stay connected with friends?
                </h3>
                <p className="mt-1 text-[12px] font-medium text-[#A6AAA4]">Choose all that apply.</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    'Random messages throughout the day',
                    'Long text conversations',
                    'Memes / reels are communication',
                    'Voice notes',
                    'Calls',
                    'Mostly talk when we meet',
                    "Occasional check-ins, but we're still close",
                    "I'm slow at replying but I care",
                  ].map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      selected={q4Connected.includes(item)}
                      onClick={() => toggleChip(q4Connected, item, setQ4Connected, 8)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Q5: MAKING PLANS */}
            {step === 5 && (
              <div>
                <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
                  Step 5 of 8 — Planning & Rhythm
                </span>
                <h3 className="mt-1 text-[21px] font-bold tracking-tight text-[#F3F0E9]">
                  How do you like making plans?
                </h3>

                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    {[
                      "Spontaneous - I'm free tonight, let's go",
                      'Flexible - a couple of days ahead',
                      'Planner - give me about a week',
                      'Calendar person - well in advance',
                      'Depends on the activity',
                    ].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setQ5PlanningRhythm(mode)}
                        className={`rounded-[14px] p-3 text-left text-[13.5px] font-semibold transition-all ${
                          q5PlanningRhythm === mode
                            ? 'bg-[#F3F0E9] text-[#0D1D15]'
                            : 'border border-[#F3F0E9]/15 bg-[#0D1D15] text-[#F3F0E9] hover:bg-[#1C3325]'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2">
                    <label className="text-[13px] font-semibold text-[#F3F0E9]">Usual Availability:</label>
                    <RhythmStrip userAvailability={q5Availability} interactive={true} onToggleSlot={toggleSlot} className="mt-2" />
                  </div>
                </div>
              </div>
            )}

            {/* Q6: OUTINGS */}
            {step === 6 && (
              <div>
                <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
                  Step 6 of 8 — Outing Preferences
                </span>
                <h3 className="mt-1 text-[21px] font-bold tracking-tight text-[#F3F0E9]">
                  Pick the outings you'd actually say yes to
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    'Coffee & wandering',
                    'Brunch',
                    'Hiking',
                    'Galleries',
                    'Dinner',
                    'Running',
                    'Fitness class',
                    'Board games',
                    'Live music',
                    'Workshops',
                    'Nightlife',
                    'Picnics',
                    'Bookshops',
                    'Food hunting',
                    'Wellness',
                  ].map((outing) => (
                    <Chip
                      key={outing}
                      label={outing}
                      selected={q6Outings.includes(outing)}
                      onClick={() => toggleChip(q6Outings, outing, setQ6Outings, 10)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Q7: EMOTIONAL PACING */}
            {step === 7 && (
              <div>
                <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
                  Step 7 of 8 — Emotional Pacing
                </span>
                <h3 className="mt-1 text-[21px] font-bold tracking-tight text-[#F3F0E9]">
                  When getting to know someone, which sounds most like you?
                </h3>

                <div className="mt-4 flex flex-col gap-2">
                  {[
                    'Dive deep - meaningful conversations pretty quickly',
                    'Let it unfold - I open up naturally over time',
                    'Keep it light first - humour and shared experiences first',
                    'Activity first - I connect while doing something',
                    'It depends on the person',
                  ].map((pace) => (
                    <button
                      key={pace}
                      type="button"
                      onClick={() => setQ7EmotionalPacing(pace)}
                      className={`rounded-[14px] p-3 text-left text-[13.5px] font-semibold transition-all ${
                        q7EmotionalPacing === pace
                          ? 'bg-[#F3F0E9] text-[#0D1D15]'
                          : 'border border-[#F3F0E9]/15 bg-[#0D1D15] text-[#F3F0E9] hover:bg-[#1C3325]'
                      }`}
                    >
                      {pace}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q8: DESIRED QUALITIES */}
            {step === 8 && (
              <div>
                <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
                  Step 8 of 8 — Desired Qualities
                </span>
                <h3 className="mt-1 text-[21px] font-bold tracking-tight text-[#F3F0E9]">
                  Who would you be excited to meet right now?
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    'Curious',
                    'Warm',
                    'Funny',
                    'Adventurous',
                    'Thoughtful',
                    'Ambitious',
                    'Creative',
                    'Grounded',
                    'Spontaneous',
                    'Reliable',
                    'Independent',
                    'Community-minded',
                  ].map((quality) => (
                    <Chip
                      key={quality}
                      label={quality}
                      selected={q8Qualities.includes(quality)}
                      onClick={() => toggleChip(q8Qualities, quality, setQ8Qualities, 5)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Next Button */}
            <div className="mt-7 flex justify-end">
              <Button variant="primary" size="md" onClick={handleNext}>
                {step === 8 ? 'Activate My Tribal Pass' : 'Next Step'}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </IllustratedGround>
  );
}
