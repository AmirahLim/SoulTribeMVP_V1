'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bloom, RhythmStrip, Button, Chip } from '@soul-tribe/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { saveOnboardingToSupabase } from '../../lib/supabaseOnboarding';
import {
  getUserProfile,
  setUserProfile,
  validateHandle,
  deriveSuggestedHandle,
  validateDateOfBirth,
  calculateAge,
} from '../../lib/userStore';

import { AuthGuard } from '../../components/AuthGuard';
import { validateAvatarFile, uploadAvatar } from '../../lib/avatarUpload';

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingContent />
    </AuthGuard>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const { user, isSupabaseConfigured } = useAuth();

  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [userName, setUserName] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [userDob, setUserDob] = useState('');
  const [userPhoto, setUserPhoto] = useState<string>('');
  const [userCity, setUserCity] = useState<string>('Singapore');
  const [step1Error, setStep1Error] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedHandle = localStorage.getItem('soul_tribe_handle');
      const profile = getUserProfile();
      if (storedHandle) {
        setUserHandle(storedHandle);
      } else if (profile.handle) {
        setUserHandle(profile.handle);
      }
      if (profile.displayName && profile.displayName !== 'Priya Sharma') {
        setUserName(profile.displayName);
      }
    }
  }, []);

  const handleNameChange = (name: string) => {
    setUserName(name);
    if (!userHandle) {
      setUserHandle(deriveSuggestedHandle(name));
    }
  };

  // Q1: What are you hoping to find here? (Up to 3)
  const [q1Finding, setQ1Finding] = useState<string[]>([]);

  // Q2: What does a great friendship feel like to you? (Up to 4)
  const [q2Feelings, setQ2Feelings] = useState<string[]>([]);

  // Q3: Social Energy (Quiet & intimate <-> Big & energetic spectrum + Preferred group size)
  const [q3Energy, setQ3Energy] = useState<number | null>(null);
  const [q3GroupSize, setQ3GroupSize] = useState<string | null>(null);

  // Q4: How do you naturally stay connected with friends? (All that apply)
  const [q4Connected, setQ4Connected] = useState<string[]>([]);

  // Q5: How do you like making plans? (Planning rhythm & availability)
  const [q5PlanningRhythm, setQ5PlanningRhythm] = useState<string | null>(null);
  const [q5Availability, setQ5Availability] = useState<string[]>([]);

  // Q6: Pick the outings you'd actually say yes to
  const [q6Outings, setQ6Outings] = useState<string[]>([]);

  // Q7: When you're getting to know someone, which sounds most like you? (Emotional pacing)
  const [q7EmotionalPacing, setQ7EmotionalPacing] = useState<string | null>(null);

  // Q8: Who would you be excited to meet right now? (Up to 5 qualities)
  const [q8Qualities, setQ8Qualities] = useState<string[]>([]);

  const [isRevealing, setIsRevealing] = useState(false);

  // Initial Onboarding Step Progress (1 -> 8)
  const stepPct = Math.round((step / 8) * 100);

  const confidence = Math.min(0.95, 0.25 + step * 0.09);
  const bloomDimensions = [
    { key: 'intent', label: 'Intent', strength: q1Finding.length / 3, confidence, sentence: `Seeking ${q1Finding[0] || 'close friends'}.` },
    { key: 'feeling', label: 'Relational', strength: q2Feelings.length / 4, confidence, sentence: `Values friendships where ${q2Feelings[0] || 'we can be ourselves'}.` },
    { key: 'energy', label: 'Social Energy', strength: q3Energy !== null ? 1 - q3Energy : 0.5, confidence, sentence: `Thrives in ${q3GroupSize || 'intimate'} settings.` },
    { key: 'contact', label: 'Communication', strength: q4Connected.length / 4, confidence, sentence: `Connects via ${q4Connected[0] || 'thoughtful check-ins'}.` },
    { key: 'rhythm', label: 'Rhythm', strength: q5Availability.length / 4, confidence, sentence: `Available for ${q5PlanningRhythm ? q5PlanningRhythm.toLowerCase() : 'flexible'} meetups.` },
    { key: 'curiosity', label: 'Interests', strength: q6Outings.length / 8, confidence, sentence: `Enjoys ${q6Outings.length > 0 ? q6Outings.slice(0, 2).join(', ') : 'exploring new places'}.` },
    { key: 'pacing', label: 'Emotional', strength: 0.7, confidence, sentence: `Prefers to ${q7EmotionalPacing ? q7EmotionalPacing.toLowerCase() : 'unfold naturally'}.` },
  ];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const res = await uploadAvatar(user?.id || 'onboarding_user', file);
    if (res.success && res.avatarUrl) {
      setUserPhoto(res.avatarUrl);
    } else if (res.error) {
      alert(res.error);
    }
  };

  const handleNextStep = async () => {
    setSaveError(null);

    if (step === 1) {
      if (!userName.trim()) {
        setStep1Error('Please enter your display name.');
        return;
      }
      const hCheck = validateHandle(userHandle);
      if (!hCheck.valid) {
        setStep1Error(hCheck.error || 'Invalid username handle.');
        return;
      }
      const dobCheck = validateDateOfBirth(userDob);
      if (!dobCheck.valid) {
        setStep1Error(dobCheck.error || 'Date of birth is required.');
        return;
      }
      setStep1Error(null);
    }

    if (step < 8) {
      setStep(step + 1);
    } else {
      if (isSupabaseConfigured && !user) {
        router.push('/auth/signin?redirect=/onboarding');
        return;
      }

      const computedAge = calculateAge(userDob);
      const bYear = computedAge !== null ? new Date(userDob).getFullYear() : undefined;

      if (!bYear) {
        setStep(1);
        setStep1Error('Date of birth is required.');
        return;
      }

      setIsSaving(true);

      if (isSupabaseConfigured && user) {
        const saveRes = await saveOnboardingToSupabase(user.id, {
          displayName: userName.trim(),
          handle: userHandle.trim().toLowerCase(),
          homeArea: userCity.trim(),
          birthYear: bYear,
          avatarUrl: userPhoto || undefined,
          q1Finding,
          q2Feelings,
          q3Energy,
          q3GroupSize,
          q4Connected,
          q5PlanningRhythm,
          q5Availability,
          q6Outings,
          q7EmotionalPacing,
          q8Qualities,
        });

        if (!saveRes.success) {
          setIsSaving(false);
          if (saveRes.isDuplicateHandle) {
            setStep(1);
            setStep1Error(saveRes.error || 'That username is already taken. Please choose another.');
          } else {
            setSaveError(saveRes.error || 'Failed to save profile to database.');
          }
          return;
        }
      }

      setUserProfile({
        displayName: userName.trim() || 'You',
        handle: userHandle.trim().toLowerCase(),
        dateOfBirth: userDob,
        birthYear: bYear,
        avatarUrl: userPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        homeArea: userCity,
        hasCompletedOnboarding: true,
        completedCategoryNums: [],
      });

      setIsSaving(false);
      setIsRevealing(true);
    }
  };

  const toggleArrayItem = (arr: string[], item: string, max: number) => {
    if (arr.includes(item)) {
      return arr.filter((i) => i !== item);
    }
    if (arr.length >= max) {
      return arr;
    }
    return [...arr, item];
  };

  if (isRevealing) {
    return (
      <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] pb-16">
        <img
          src="/user-onboarding-bg.jpg"
          alt="Onboarding Canvas Background"
          className="fixed inset-0 h-full w-full object-cover z-0 opacity-80"
        />
        <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-12 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-2xl">
              <Sparkles className="h-7 w-7" />
            </div>

            <span className="mt-3 rounded-full border border-white/20 bg-white/20 px-3.5 py-1 text-[11.5px] font-bold text-white backdrop-blur-md">
              Part I Complete · 10% Tribal Pass
            </span>

            <h2 className="mt-3 text-[26px] font-extrabold text-white">
              Welcome, {userName || 'Friend'}!
            </h2>

            <p className="mt-2 max-w-[340px] text-[14px] font-medium leading-relaxed text-white/90">
              Your baseline Tribal Pass is live at <strong className="text-white">10% Complete</strong>. Complete each of the 10 Deeper Tribal Pass sections (+9% each) to reach 100%!
            </p>

            <div className="my-6 rounded-[24px] border border-white/20 bg-black/60 p-4 backdrop-blur-xl">
              <Bloom dimensions={bloomDimensions} size={210} interactive={true} />
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/home')}
              className="w-full max-w-[280px] py-4 text-[16px] font-bold"
            >
              Explore My Dashboard →
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] pb-16">
      {/* PAGE CANVAS BACKGROUND: YOUR UPLOADED TRAMPOLINE FEET MOTION PHOTO */}
      <img
        src="/user-onboarding-bg.jpg"
        alt="Onboarding Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-80"
      />

      {/* Dark Ambient Vignette Overlay for Readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      {/* PAGE CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-6">
        {/* Header with Tribal Pass Completion Status */}
        <header className="flex flex-col pt-2">
          <div className="flex w-full items-center justify-between text-[12px] font-bold text-white/80">
            <span>Part I: 8-Question Onboarding</span>
            <span className="text-white font-semibold">Step {step} of 8</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/60 border border-white/15">
            <div
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{ width: `${stepPct}%` }}
            />
          </div>
        </header>

        {/* Live Friendship DNA Preview */}
        <section className="mt-4 flex justify-center">
          <div className="rounded-full border border-white/20 bg-black/40 p-2 backdrop-blur-md">
            <Bloom dimensions={bloomDimensions} size={90} interactive={false} />
          </div>
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
              className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-6 shadow-2xl"
            >
              {/* STEP 1: NAME, HANDLE, DOB, PHOTO & FRIENDSHIP INTENT */}
              {step === 1 && (
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                    Step 1 of 8: Profile & Intent
                  </span>
                  <h3 className="mt-1 text-[21px] font-extrabold tracking-tight text-white">
                    Who are you & what are you hoping to find?
                  </h3>

                  {step1Error && (
                    <div className="mt-3 rounded-[12px] border border-rose-500/50 bg-rose-500/10 p-3 text-[13px] font-semibold text-rose-200">
                      {step1Error}
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-4">
                    {/* User Custom Name Field */}
                    <div>
                      <label className="text-[13px] font-semibold text-white">Your Name / Display Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priya Sharma"
                        value={userName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="mt-1 h-11 w-full rounded-[12px] border border-white/20 bg-black/60 px-4 text-[14px] font-medium text-white outline-none transition-all focus:border-white"
                      />
                    </div>


                    {/* Date of Birth Field */}
                    <div className="min-w-0 w-full">
                      <label className="text-[13px] font-semibold text-white">Date of Birth *</label>
                      <input
                        type="date"
                        required
                        value={userDob}
                        onChange={(e) => setUserDob(e.target.value)}
                        className="mt-1 h-11 w-full min-w-0 max-w-full rounded-[12px] border border-white/20 bg-black/60 px-3.5 text-[13.5px] font-medium text-white outline-none transition-all focus:border-white box-border text-left"
                      />
                      <p className="mt-1 text-[11.5px] text-white/60">
                        Soul Tribe is strictly for adults aged 18 and above.
                      </p>
                      {userDob && !validateDateOfBirth(userDob).valid && (
                        <p className="mt-1 text-[12px] font-medium text-rose-400">
                          {validateDateOfBirth(userDob).error}
                        </p>
                      )}
                    </div>

                    {/* Optional Photo Upload */}
                    <div>
                      <label className="text-[13px] font-semibold text-white">Profile Photo (Optional)</label>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/20 bg-black/60">
                          {userPhoto ? (
                            <img src={userPhoto} alt="Preview" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white/70">
                              <User className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <label className="cursor-pointer rounded-[12px] border border-white/20 bg-black/60 px-4 py-2 text-[13px] font-semibold text-white hover:bg-white/10">
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
                      <label className="text-[13px] font-semibold text-white">What are you hoping to find here? (Up to 3)</label>
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
                            onClick={() => setQ1Finding(toggleArrayItem(q1Finding, option, 3))}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: RELATIONAL FEELING */}
              {step === 2 && (
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                    Step 2 of 8: Relational Feeling
                  </span>
                  <h3 className="mt-1 text-[21px] font-extrabold tracking-tight text-white">
                    What does a great friendship feel like to you?
                  </h3>
                  <p className="mt-1 text-[13px] text-white/80">Select up to 4 that feel most true.</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      'We can talk about anything without judging',
                      'We can sit in silence and it feels natural',
                      'We make spontaneous plans easily',
                      'We can be ourselves without performing',
                      'We challenge each other to grow',
                      'We show up for each other when things get hard',
                      'We laugh a lot and keep things light',
                      'We go long periods without talking and pick right back up',
                    ].map((option) => (
                      <Chip
                        key={option}
                        label={option}
                        selected={q2Feelings.includes(option)}
                        onClick={() => setQ2Feelings(toggleArrayItem(q2Feelings, option, 4))}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: SOCIAL ENERGY & GROUP SIZE */}
              {step === 3 && (
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                    Step 3 of 8: Social Energy
                  </span>
                  <h3 className="mt-1 text-[21px] font-extrabold tracking-tight text-white">
                    How do you prefer to socialize?
                  </h3>

                  <div className="mt-6 flex flex-col gap-6">
                    <div>
                      <div className="flex justify-between text-[13px] font-semibold text-white">
                        <span>Quiet & Intimate</span>
                        <span className="text-[12px] font-normal text-white/70">
                          {q3Energy === null ? 'Not set (drag to select)' : `${Math.round(q3Energy * 100)}%`}
                        </span>
                        <span>High-Energy & Lively</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={q3Energy !== null ? q3Energy : 0.5}
                        onChange={(e) => setQ3Energy(parseFloat(e.target.value))}
                        className={`mt-2 w-full accent-white ${q3Energy === null ? 'opacity-50' : 'opacity-100'}`}
                      />
                    </div>

                    <div>
                      <label className="text-[13px] font-semibold text-white">Preferred Group Size</label>
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

              {/* STEP 4: COMMUNICATION STYLE */}
              {step === 4 && (
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                    Step 4 of 8: Communication
                  </span>
                  <h3 className="mt-1 text-[21px] font-extrabold tracking-tight text-white">
                    How do you naturally stay connected?
                  </h3>
                  <p className="mt-1 text-[13px] text-white/80">Select all that apply.</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      'Random messages throughout the day',
                      'Voice notes and quick updates',
                      'Deep conversations every few weeks',
                      'Mostly talk when we meet in person',
                      'Sending memes and articles back and forth',
                      'Checking in when someone seems quiet',
                      'Low-maintenance - no pressure to reply fast',
                    ].map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        selected={q4Connected.includes(item)}
                        onClick={() => setQ4Connected(toggleArrayItem(q4Connected, item, 5))}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: PLANNING RHYTHM & AVAILABILITY */}
              {step === 5 && (
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                    Step 5 of 8: Planning Rhythm
                  </span>
                  <h3 className="mt-1 text-[21px] font-extrabold tracking-tight text-white">
                    How do you like making plans?
                  </h3>

                  <div className="mt-4 flex flex-col gap-5">
                    <div>
                      <label className="text-[13px] font-semibold text-white">Planning Style</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[
                          'Spontaneous - today or tomorrow',
                          'Flexible - a couple of days ahead',
                          'Planned - a week or two in advance',
                          'Routine - fixed days work best',
                        ].map((mode) => (
                          <Chip
                            key={mode}
                            label={mode}
                            selected={q5PlanningRhythm === mode}
                            onClick={() => setQ5PlanningRhythm(mode)}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[13px] font-semibold text-white">General Availability (Singapore Rhythm)</label>
                      <div className="mt-2">
                        <RhythmStrip
                          userAvailability={q5Availability}
                          onToggleSlot={(slot) => {
                            if (q5Availability.includes(slot)) {
                              setQ5Availability(q5Availability.filter((s) => s !== slot));
                            } else {
                              setQ5Availability([...q5Availability, slot]);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: OUTINGS YOU'D ACTUALLY SAY YES TO */}
              {step === 6 && (
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                    Step 6 of 8: Outing DNA
                  </span>
                  <h3 className="mt-1 text-[21px] font-extrabold tracking-tight text-white">
                    Pick outings you'd actually say yes to
                  </h3>
                  <p className="mt-1 text-[13px] text-white/80">Select at least 5.</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      'Coffee & wandering',
                      'Brunch',
                      'Workshops',
                      'Food hunting',
                      'Bookshops',
                      'Museums & galleries',
                      'Live music',
                      'Quiet drinks',
                      'Outdoor walks & nature',
                      'Bouldering / movement',
                      'Board games',
                      'Cooking / dining at home',
                      'Pottery / ceramics',
                      'Natural wine',
                      'Film & cinema',
                    ].map((outing) => (
                      <Chip
                        key={outing}
                        label={outing}
                        selected={q6Outings.includes(outing)}
                        onClick={() => setQ6Outings(toggleArrayItem(q6Outings, outing, 10))}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7: EMOTIONAL PACING */}
              {step === 7 && (
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                    Step 7 of 8: Emotional Pacing
                  </span>
                  <h3 className="mt-1 text-[21px] font-extrabold tracking-tight text-white">
                    When getting to know someone...
                  </h3>

                  <div className="mt-4 flex flex-col gap-2.5">
                    {[
                      'Open book - I share openly right away',
                      'Let it unfold - I open up naturally over time',
                      'Observant first - I take time to build trust',
                      'Depends on the person and environment',
                    ].map((pace) => (
                      <button
                        key={pace}
                        type="button"
                        onClick={() => setQ7EmotionalPacing(pace)}
                        className={`rounded-[16px] border p-4 text-left text-[14px] font-semibold transition-all ${
                          q7EmotionalPacing === pace
                            ? 'border-white bg-white/20 text-white'
                            : 'border-white/15 bg-black/40 text-white/80 hover:border-white/30'
                        }`}
                      >
                        {pace}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 8: QUALITIES YOU'RE EXCITED TO MEET */}
              {step === 8 && (
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                    Step 8 of 8: Resonance Target
                  </span>
                  <h3 className="mt-1 text-[21px] font-extrabold tracking-tight text-white">
                    Who would you be excited to meet right now?
                  </h3>
                  <p className="mt-1 text-[13px] text-white/80">Select up to 5 qualities.</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      'Curious',
                      'Warm',
                      'Thoughtful',
                      'Grounded',
                      'Creative',
                      'Adventurous',
                      'Low-key',
                      'Introspective',
                      'Witty',
                      'Direct',
                      'Empathetic',
                      'Energetic',
                    ].map((quality) => (
                      <Chip
                        key={quality}
                        label={quality}
                        selected={q8Qualities.includes(quality)}
                        onClick={() => setQ8Qualities(toggleArrayItem(q8Qualities, quality, 5))}
                      />
                    ))}
                  </div>
                </div>
              )}

              {saveError && (
                <div className="mb-4 rounded-[16px] border border-rose-500/40 bg-rose-500/15 p-4 text-[13px] text-rose-200 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-rose-100">Unable to Save Profile</span>
                    <span className="leading-relaxed">{saveError}</span>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4">
                {step > 1 ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setStep(step - 1)}
                    disabled={isSaving}
                  >
                    ← Back
                  </Button>
                ) : (
                  <div />
                )}

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNextStep}
                  disabled={isSaving}
                >
                  {isSaving
                    ? 'Saving Profile...'
                    : step < 8
                    ? 'Next Step →'
                    : 'Meet Your Tribe ✨'}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
