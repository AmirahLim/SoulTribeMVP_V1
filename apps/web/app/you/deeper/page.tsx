'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Chip } from '@soul-tribe/ui';
import { ArrowLeft, Check, Sparkles, Lock, Globe, CheckCircle2 } from 'lucide-react';
import { getUserProfile, setUserProfile, DeepProfileAnswers, calculatePassCompletion } from '../../../lib/userStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { getActiveNextBestPrompts } from '../../../lib/threadPrompts';
import { AuthGuard } from '../../../components/AuthGuard';
import { saveDeeperPassToSupabase } from '../../../lib/supabaseOnboarding';
import { checkIsSupabaseConfigured, getSupabaseBrowserClient } from '../../../lib/supabase';

export default function DeeperTribalPassPage() {
  return (
    <AuthGuard>
      <React.Suspense fallback={null}>
        <DeeperTribalPassContent />
      </React.Suspense>
    </AuthGuard>
  );
}

function DeeperTribalPassContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catParam = searchParams.get('cat');

  const [activeCategoryNum, setActiveCategoryNum] = useState<number>(1);
  const [savedMessage, setSavedMessage] = useState(false);
  const [completedCats, setCompletedCats] = useState<number[]>([]);
  const [passPct, setPassPct] = useState<number>(10);
  const [profile, setProfileState] = useState(getUserProfile());

  // Form State
  const [formState, setFormState] = useState<DeepProfileAnswers>({});

  useEffect(() => {
    const loaded = getUserProfile();
    setProfileState(loaded);
    if (loaded.deepProfile) {
      setFormState(loaded.deepProfile);
    }
    const cats = loaded.completedCategoryNums || [];
    setCompletedCats(cats);
    setPassPct(loaded.passCompletionPct);
  }, []);

  useEffect(() => {
    if (catParam) {
      const num = parseInt(catParam, 10);
      if (!isNaN(num) && num >= 1 && num <= 10) {
        setActiveCategoryNum(num);
      }
    }
  }, [catParam]);

  const updateField = (key: keyof DeepProfileAnswers, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMultiField = (key: keyof DeepProfileAnswers, opt: string) => {
    const currentRaw = (formState[key] as string) || '';
    const currentArr = currentRaw
      .split(/·|,/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (currentArr.includes(opt)) {
      const updated = currentArr.filter((i) => i !== opt);
      updateField(key, updated.join(' · '));
    } else if (currentArr.length < 3) {
      const updated = [...currentArr, opt];
      updateField(key, updated.join(' · '));
    }
  };

  const isMultiSelected = (key: keyof DeepProfileAnswers, opt: string): boolean => {
    const currentRaw = (formState[key] as string) || '';
    return currentRaw
      .split(/·|,/)
      .map((s) => s.trim())
      .includes(opt);
  };

  const handleSaveCurrentCategory = async (catNum: number) => {
    const updatedCats = Array.from(new Set([...completedCats, catNum]));
    setCompletedCats(updatedCats);
    const updated = setUserProfile({
      deepProfile: formState,
      completedCategoryNums: updatedCats,
      hasCompletedOnboarding: true,
    });
    setPassPct(updated.passCompletionPct);
    setSavedMessage(true);

    if (checkIsSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient();
        const { data: authSession } = await client.auth.getSession();
        const userId = authSession?.session?.user?.id || profile.id;
        if (userId) {
          await saveDeeperPassToSupabase(userId, formState, updatedCats);
        }
      } catch (err) {
        console.error('Error syncing deeper pass section to Supabase:', err);
      }
    }

    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleSaveAllTen = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const allTen = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    setCompletedCats(allTen);
    const updated = setUserProfile({
      deepProfile: formState,
      completedCategoryNums: allTen,
      hasCompletedOnboarding: true,
    });
    setPassPct(updated.passCompletionPct);
    setSavedMessage(true);

    if (checkIsSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient();
        const { data: authSession } = await client.auth.getSession();
        const userId = authSession?.session?.user?.id || profile.id;
        if (userId) {
          await saveDeeperPassToSupabase(userId, formState, allTen);
        }
      } catch (err) {
        console.error('Error syncing all 10 deeper pass sections to Supabase:', err);
      }
    }

    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleSaveAndReturnToProfile = async () => {
    await handleSaveCurrentCategory(activeCategoryNum);
    router.push('/you');
  };

  const handleSaveAllTenAndReturn = async () => {
    await handleSaveAllTen();
    router.push('/you');
  };

  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces', 'Prefer not to say'
  ];

  const mbtiTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP', 'Prefer not to say'
  ];

  const categories = [
    { num: 1, name: 'Social Energy', subtitle: 'What being around me feels like' },
    { num: 2, name: 'How I Connect', subtitle: 'Communication compatibility and expectations' },
    { num: 3, name: 'Friendship Style', subtitle: 'What kind of friend I am and what I want to build' },
    { num: 4, name: 'My Rhythm', subtitle: 'Whether two lives can practically fit together' },
    { num: 5, name: 'Personality', subtitle: 'MBTI, Horoscope Big 3 (Sun, Moon, Rising), & Signals' },
    { num: 6, name: 'Values & Worldview', subtitle: 'What matters beneath hobbies' },
    { num: 7, name: "I'm Into", subtitle: 'Interest graph + curiosity, not flat tags' },
    { num: 8, name: 'Outing DNA', subtitle: 'Connected to Soul Tribe flagship outings' },
    { num: 9, name: 'You Should Know', subtitle: 'Human prompts that create conversation hooks' },
    { num: 10, name: 'Boundaries & Matching', subtitle: 'Mostly private signals for matching algorithm' },
  ];

  const currentCat = categories.find((c) => c.num === activeCategoryNum) || categories[0];

  return (
    <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] pb-24">
      {/* PAGE CANVAS BACKGROUND: YOUR UPLOADED CANDID CLIFF JUMP MOTION PHOTO */}
      <img
        src="/user-deeper-bg.jpg"
        alt="Deeper Pass Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-80"
      />

      {/* Dark Ambient Vignette Overlay for Readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      {/* PAGE CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-8">
        {/* Header */}
        <header className="py-2 border-b border-white/15 pb-4">
          <Link href="/you" className="flex items-center text-[13.5px] font-semibold text-white/80 hover:text-white">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Profile
          </Link>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                Tribal Pass · {passPct}% Complete
              </span>
              <h1 className="text-[26px] font-extrabold text-white tracking-tight drop-shadow-md">
                Deeper Tribal Pass
              </h1>
            </div>

            <Button variant="primary" size="sm" onClick={() => handleSaveAllTen()}>
              Save All
            </Button>
          </div>
        </header>

        {savedMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-[16px] border border-white/30 bg-black/70 p-3 text-[13.5px] font-bold text-white shadow-xl backdrop-blur-md">
            <Check className="h-4 w-4" />
            <span>Section saved! Tribal Pass updated to {passPct}% Complete!</span>
          </div>
        )}

        {/* CATEGORY TABS STRIP */}
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isActive = cat.num === activeCategoryNum;
            const isCompleted = completedCats.includes(cat.num);

            return (
              <button
                key={cat.num}
                type="button"
                onClick={() => setActiveCategoryNum(cat.num)}
                className={`flex items-center gap-1.5 flex-shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-all backdrop-blur-md ${
                  isActive
                    ? 'border-white bg-white text-black font-bold'
                    : isCompleted
                    ? 'border-white/40 bg-white/10 text-white font-semibold'
                    : 'border-white/20 bg-black/40 text-white/80 hover:border-white/40'
                }`}
              >
                {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                {cat.num}. {cat.name}
              </button>
            );
          })}
        </nav>

        {/* ACTIVE CATEGORY CARD */}
        <form onSubmit={(e) => { e.preventDefault(); handleSaveCurrentCategory(activeCategoryNum); }} className="mt-6 flex flex-col gap-6">
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                  Section {currentCat.num} of 10
                </span>
                <h2 className="text-[22px] font-extrabold text-white flex items-center gap-2">
                  {currentCat.name}
                  {completedCats.includes(currentCat.num) && (
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white border border-white/30">
                      Completed
                    </span>
                  )}
                </h2>
                <p className="mt-0.5 text-[13px] text-white/80">
                  {currentCat.subtitle}
                </p>
              </div>

              {currentCat.num === 10 ? (
                <span className="flex items-center gap-1 rounded-full border border-white/30 bg-black/60 px-3 py-1 text-[11px] font-bold text-white">
                  <Lock className="h-3 w-3" /> Private
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full border border-white/30 bg-black/60 px-3 py-1 text-[11px] font-bold text-white">
                  <Globe className="h-3 w-3" /> Public
                </span>
              )}
            </div>

            {/* CATEGORY 1: SOCIAL ENERGY */}
            {activeCategoryNum === 1 && (
              <div className="mt-5 flex flex-col gap-5">
                <div>
                  <label className="text-[13.5px] font-bold text-white">Ideal Group Size</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['One-on-one', '3–4 people', '5–8 people', 'Big group', 'Depends', 'Prefer not to say'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.groupSize === opt}
                        onClick={() => updateField('groupSize', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[13.5px] font-bold text-white">Social Vibe (Choose up to 3)</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Intimate', 'Playful-chaotic', 'Intellectual', 'Adventurous', 'Calm', 'High-energy', 'Creative', 'Prefer not to say'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={isMultiSelected('socialVibe', opt)}
                        onClick={() => toggleMultiField('socialVibe', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/15 pt-4">
                  <label className="text-[13.5px] font-bold text-white">
                    Add your own words (Optional Open-Ended)
                  </label>
                  <p className="text-[12px] text-white/80">
                    What makes that setting work for you? Or describe your perfect social atmosphere.
                  </p>
                  <textarea
                    rows={3}
                    value={formState.socialAtmosphereOpen || ''}
                    onChange={(e) => updateField('socialAtmosphereOpen', e.target.value)}
                    placeholder="e.g. I find large parties draining, but give me 3 people around a kitchen table and I'll talk until 2am."
                    className="mt-2 w-full rounded-[14px] border border-white/20 bg-black/60 p-3 text-[13.5px] text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* CATEGORY 2: HOW I CONNECT */}
            {activeCategoryNum === 2 && (
              <div className="mt-5 flex flex-col gap-5">
                <div>
                  <label className="text-[13.5px] font-bold text-white">Messaging Style (Choose up to 3)</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Random thoughts', 'Memes', 'Check-ins', 'Voice notes', 'Calls', 'Making plans', 'Mostly IRL', 'Prefer not to say'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={isMultiSelected('messagingStyle', opt)}
                        onClick={() => toggleMultiField('messagingStyle', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[13.5px] font-bold text-white">When someone is going through a hard time (Choose up to 3)</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Listen', 'Reassure', 'Make sense of it', 'Advice', 'Solve it', 'Ask me', 'Prefer not to say'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={isMultiSelected('supportStyle', opt)}
                        onClick={() => toggleMultiField('supportStyle', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/15 pt-4">
                  <label className="text-[13.5px] font-bold text-white">
                    Add your own words (Optional Open-Ended)
                  </label>
                  <p className="text-[12px] text-white/80">
                    In your own words, what does good support or good communication feel like to you?
                  </p>
                  <textarea
                    rows={3}
                    value={formState.messagingStyleOpen || ''}
                    onChange={(e) => updateField('messagingStyleOpen', e.target.value)}
                    placeholder="e.g. I don't need to talk every day to feel close, but when we talk I like actually talking."
                    className="mt-2 w-full rounded-[14px] border border-white/20 bg-black/60 p-3 text-[13.5px] text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* CATEGORY 3: FRIENDSHIP STYLE */}
            {activeCategoryNum === 3 && (
              <div className="mt-5 flex flex-col gap-5">
                <div>
                  <label className="text-[13.5px] font-bold text-white">Friendship Pillars (Choose up to 3)</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['We tell each other everything', 'Inside jokes', 'Spontaneous plans', 'Comfortable silence', 'Show up in hard times', 'Prefer not to say'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={isMultiSelected('friendshipPillars', opt)}
                        onClick={() => toggleMultiField('friendshipPillars', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/15 pt-4">
                  <label className="text-[13.5px] font-bold text-white">
                    Prompt: I know we're actually friends when...
                  </label>
                  <textarea
                    rows={3}
                    value={formState.realFriendOpen || ''}
                    onChange={(e) => updateField('realFriendOpen', e.target.value)}
                    placeholder="e.g. We can sit in silence without anyone feeling obligated to fill it."
                    className="mt-2 w-full rounded-[14px] border border-white/20 bg-black/60 p-3 text-[13.5px] text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* CATEGORY 4: MY RHYTHM */}
            {activeCategoryNum === 4 && (
              <div className="mt-5 flex flex-col gap-5">
                <div>
                  <label className="text-[13.5px] font-bold text-white">Ideal Free Saturday (Choose up to 3)</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Slow coffee', 'Outdoors', 'Hobbies', 'Exploring', 'Social all day', 'Dinner-drinks', 'Home', 'Spontaneous', 'Prefer not to say'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={isMultiSelected('idealSaturday', opt)}
                        onClick={() => toggleMultiField('idealSaturday', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[13.5px] font-bold text-white">Spontaneous Weekend Trip?</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Already packing', 'Convince me', '24 hours notice needed', 'Not without itinerary', 'Prefer not to say'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.spontaneousTrip === opt}
                        onClick={() => updateField('spontaneousTrip', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/15 pt-4">
                  <label className="text-[13.5px] font-bold text-white">
                    Describe your ideal free Saturday in your own words
                  </label>
                  <textarea
                    rows={3}
                    value={formState.idealSaturdayOpen || ''}
                    onChange={(e) => updateField('idealSaturdayOpen', e.target.value)}
                    placeholder="e.g. Slow morning, something interesting in the afternoon, dinner if the energy is right."
                    className="mt-2 w-full rounded-[14px] border border-white/20 bg-black/60 p-3 text-[13.5px] text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* CATEGORY 5: PERSONALITY, MBTI & HOROSCOPE BIG 3 */}
            {activeCategoryNum === 5 && (
              <div className="mt-5 flex flex-col gap-5">
                <div>
                  <label className="text-[13.5px] font-bold text-white">MBTI Personality Type (Optional)</label>
                  <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {mbtiTypes.map((type) => (
                      <Chip
                        key={type}
                        label={type}
                        selected={formState.mbti === type}
                        onClick={() => updateField('mbti', formState.mbti === type ? '' : type)}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/15 pt-4 flex flex-col gap-3">
                  <label className="text-[13.5px] font-bold text-white">Horoscope / Astrology Big Three (Optional)</label>

                  <div>
                    <span className="text-[12px] font-semibold text-white/80">☀️ Sun Sign (Core Identity)</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {zodiacSigns.map((sign) => (
                        <Chip
                          key={`sun-${sign}`}
                          label={sign}
                          selected={formState.sunSign === sign}
                          onClick={() => updateField('sunSign', formState.sunSign === sign ? '' : sign)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-2">
                    <span className="text-[12px] font-semibold text-white/80">🌙 Moon Sign (Inner Emotional World)</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {zodiacSigns.map((sign) => (
                        <Chip
                          key={`moon-${sign}`}
                          label={sign}
                          selected={formState.moonSign === sign}
                          onClick={() => updateField('moonSign', formState.moonSign === sign ? '' : sign)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-2">
                    <span className="text-[12px] font-semibold text-white/80">🌅 Rising / Ascendant Sign (First Impression)</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {zodiacSigns.map((sign) => (
                        <Chip
                          key={`rising-${sign}`}
                          label={sign}
                          selected={formState.risingSign === sign}
                          onClick={() => updateField('risingSign', formState.risingSign === sign ? '' : sign)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/15 pt-4">
                  <label className="text-[13.5px] font-bold text-white">Describe yourself in 1-2 sentences</label>
                  <textarea
                    rows={3}
                    value={formState.selfDescriptionOpen || ''}
                    onChange={(e) => updateField('selfDescriptionOpen', e.target.value)}
                    placeholder="e.g. Curious about people's backstories, slow to judge, and easily drawn into spontaneous craft projects."
                    className="mt-2 w-full rounded-[14px] border border-white/20 bg-black/60 p-3 text-[13.5px] text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* CATEGORY 6: VALUES & WORLDVIEW */}
            {activeCategoryNum === 6 && (
              <div className="mt-5 flex flex-col gap-5">
                <div>
                  <label className="text-[13.5px] font-bold text-white">Life Priorities (Choose up to 3)</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Family', 'Freedom', 'Adventure', 'Community', 'Achievement', 'Creativity', 'Growth', 'Stability', 'Curiosity', 'Prefer not to say'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={isMultiSelected('coreValues', opt)}
                        onClick={() => toggleMultiField('coreValues', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/15 pt-4">
                  <label className="text-[13.5px] font-bold text-white">
                    Prompt: I really respect people who...
                  </label>
                  <textarea
                    rows={3}
                    value={formState.respectPeopleOpen || ''}
                    onChange={(e) => updateField('respectPeopleOpen', e.target.value)}
                    placeholder="e.g. Can change their mind when presented with better information."
                    className="mt-2 w-full rounded-[14px] border border-white/20 bg-black/60 p-3 text-[13.5px] text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* CATEGORY 7: I'M INTO */}
            {activeCategoryNum === 7 && (
              <div className="mt-5 flex flex-col gap-5">
                <div>
                  <label className="text-[13.5px] font-bold text-white">What could you lose hours talking about?</label>
                  <textarea
                    rows={2}
                    value={formState.talkForHoursOpen || ''}
                    onChange={(e) => updateField('talkForHoursOpen', e.target.value)}
                    placeholder="e.g. Architecture history, specialty coffee processing, and film photography."
                    className="mt-2 w-full rounded-[14px] border border-white/20 bg-black/60 p-3 text-[13.5px] text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[13.5px] font-bold text-white">Current rabbit hole</label>
                  <input
                    type="text"
                    value={formState.currentRabbitHoleOpen || ''}
                    onChange={(e) => updateField('currentRabbitHoleOpen', e.target.value)}
                    placeholder="e.g. Fermentation & natural sourdough"
                    className="mt-1 h-11 w-full rounded-[12px] border border-white/20 bg-black/60 px-4 text-[13.5px] text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* CATEGORY 8: OUTING DNA */}
            {activeCategoryNum === 8 && (
              <div className="mt-5 flex flex-col gap-5">
                <div>
                  <label className="text-[13.5px] font-bold text-white">Outing Budget Preference</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Free', '<$20', '$20–50', '$50–100', '$100+', 'Prefer not to say'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.budgetPref === opt}
                        onClick={() => updateField('budgetPref', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/15 pt-4">
                  <label className="text-[13.5px] font-bold text-white">
                    Describe an outing you'd say yes to instantly
                  </label>
                  <textarea
                    rows={3}
                    value={formState.instantYesOutingOpen || ''}
                    onChange={(e) => updateField('instantYesOutingOpen', e.target.value)}
                    placeholder="e.g. 5km botanical garden walk at 8am followed by cold brew coffee."
                    className="mt-2 w-full rounded-[14px] border border-white/20 bg-black/60 p-3 text-[13.5px] text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* CATEGORY 9: YOU SHOULD KNOW */}
            {activeCategoryNum === 9 && (
              <div className="mt-5 flex flex-col gap-5">
                <div>
                  <label className="text-[13.5px] font-bold text-white">I'll probably like you if...</label>
                  <input
                    type="text"
                    value={formState.likeMeIfPrompt || ''}
                    onChange={(e) => updateField('likeMeIfPrompt', e.target.value)}
                    placeholder="e.g. You can switch from silly memes to deep existential topics in 5 minutes."
                    className="mt-1 h-11 w-full rounded-[12px] border border-white/20 bg-black/60 px-4 text-[13.5px] text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[13.5px] font-bold text-white">Quickest way to get me out of the house...</label>
                  <input
                    type="text"
                    value={formState.quickestWayPrompt || ''}
                    onChange={(e) => updateField('quickestWayPrompt', e.target.value)}
                    placeholder="e.g. Mention a quiet coffee shop or pottery workshop."
                    className="mt-1 h-11 w-full rounded-[12px] border border-white/20 bg-black/60 px-4 text-[13.5px] text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* CATEGORY 10: BOUNDARIES & MATCHING */}
            {activeCategoryNum === 10 && (
              <div className="mt-5 flex flex-col gap-5">
                <div>
                  <label className="text-[13.5px] font-bold text-white">Punctuality Importance</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Low', 'Flexible', 'Important', 'Essential', 'Prefer not to say'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.punctualityPref === opt}
                        onClick={() => updateField('punctualityPref', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[13.5px] font-bold text-white">Last-minute cancellation stance</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Fine', 'Context matters', 'Dislike', 'Dealbreaker', 'Prefer not to say'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.cancellationStance === opt}
                        onClick={() => updateField('cancellationStance', opt)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* NEXT CATEGORY / SAVE FOOTER BUTTONS */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/15 pt-5">
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                {activeCategoryNum > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveCurrentCategory(activeCategoryNum);
                      setActiveCategoryNum((prev) => prev - 1);
                    }}
                    className="rounded-[14px] border border-white/20 bg-white/10 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-white/20 transition-all"
                  >
                    ← Previous
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveAndReturnToProfile}
                  className="rounded-[14px] border border-amber-400/40 bg-amber-500/20 px-4 py-2.5 text-[13px] font-bold text-amber-200 hover:bg-amber-500/30 transition-all"
                >
                  Save & Back to Profile
                </button>
              </div>

              {activeCategoryNum < 10 ? (
                <button
                  type="button"
                  onClick={() => {
                    handleSaveCurrentCategory(activeCategoryNum);
                    setActiveCategoryNum((prev) => prev + 1);
                  }}
                  className="w-full sm:w-auto rounded-[14px] bg-[#F3F0E9] px-5 py-2.5 text-[13.5px] font-extrabold text-[#0D1D15] shadow-md hover:bg-white transition-all text-center"
                >
                  Save Section {activeCategoryNum} & Next →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveAllTenAndReturn}
                  className="w-full sm:w-auto rounded-[14px] bg-gradient-to-r from-amber-300 via-emerald-300 to-amber-200 px-5 py-2.5 text-[13.5px] font-extrabold text-[#0D1D15] shadow-md hover:opacity-95 transition-all text-center"
                >
                  Save All & Finish Pass ✨
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
