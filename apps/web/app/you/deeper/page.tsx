'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Chip } from '@soul-tribe/ui';
import { ArrowLeft, Check, Sparkles, Lock, Globe } from 'lucide-react';
import { getUserProfile, setUserProfile, DeepProfileAnswers } from '../../../lib/userStore';

export default function DeeperTribalPassPage() {
  const [activeCategoryNum, setActiveCategoryNum] = useState<number>(1);
  const [savedMessage, setSavedMessage] = useState(false);

  // Form State
  const [formState, setFormState] = useState<DeepProfileAnswers>({});

  useEffect(() => {
    const profile = getUserProfile();
    if (profile.deepProfile) {
      setFormState(profile.deepProfile);
    }
  }, []);

  const updateField = (key: keyof DeepProfileAnswers, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile({
      deepProfile: formState,
      passCompletionPct: 100,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const categories = [
    { num: 1, name: 'Social Energy', subtitle: 'What being around me feels like' },
    { num: 2, name: 'How I Connect', subtitle: 'Communication compatibility and expectations' },
    { num: 3, name: 'Friendship Style', subtitle: 'What kind of friend I am and what I want to build' },
    { num: 4, name: 'My Rhythm', subtitle: 'Whether two lives can practically fit together' },
    { num: 5, name: 'Personality', subtitle: 'Behavioural personality signals' },
    { num: 6, name: 'Values & Worldview', subtitle: 'What matters beneath hobbies' },
    { num: 7, name: "I'm Into", subtitle: 'Interest graph + curiosity, not flat tags' },
    { num: 8, name: 'Outing DNA', subtitle: 'Connected to Soul Tribe flagship outings' },
    { num: 9, name: 'You Should Know', subtitle: 'Human prompts that create conversation hooks' },
    { num: 10, name: 'Boundaries & Matching', subtitle: 'Mostly private signals for matching algorithm' },
  ];

  const currentCat = categories.find((c) => c.num === activeCategoryNum) || categories[0];

  return (
    <div className="relative min-h-screen w-full bg-[#0D1D15] text-[#FFFDF9] pb-24">
      {/* PAGE CANVAS BACKGROUND: YOUR UPLOADED CANDID CLIFF JUMP MOTION PHOTO */}
      <img
        src="/user-deeper-bg.jpg"
        alt="Deeper Pass Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-45"
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
                Soul Tribe Spec · 10 Categories
              </span>
              <h1 className="text-[26px] font-extrabold text-white tracking-tight drop-shadow-md">
                Deeper Tribal Pass
              </h1>
            </div>

            <Button variant="primary" size="sm" onClick={handleSave}>
              Save All
            </Button>
          </div>
        </header>

        {savedMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-[16px] border border-white/30 bg-black/70 p-3 text-[13.5px] font-bold text-white shadow-xl backdrop-blur-md">
            <Check className="h-4 w-4" />
            <span>Deep profile answers saved successfully!</span>
          </div>
        )}

        {/* CATEGORY TABS STRIP */}
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isActive = cat.num === activeCategoryNum;
            return (
              <button
                key={cat.num}
                type="button"
                onClick={() => setActiveCategoryNum(cat.num)}
                className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-all backdrop-blur-md ${
                  isActive
                    ? 'border-white bg-white text-black font-bold'
                    : 'border-white/20 bg-black/40 text-white/80 hover:border-white/40'
                }`}
              >
                {cat.num}. {cat.name}
              </button>
            );
          })}
        </nav>

        {/* ACTIVE CATEGORY CARD */}
        <form onSubmit={handleSave} className="mt-6 flex flex-col gap-6">
          <div className="rounded-[28px] border border-white/20 bg-black/60 backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                  Category {currentCat.num} of 10
                </span>
                <h2 className="text-[22px] font-extrabold text-white">
                  {currentCat.name}
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
                    {['One-on-one', '3–4 people', '5–8 people', 'Big group', 'Depends'].map((opt) => (
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
                  <label className="text-[13.5px] font-bold text-white">Social Vibe</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Intimate', 'Playful-chaotic', 'Intellectual', 'Adventurous', 'Calm', 'High-energy', 'Creative'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.socialVibe === opt}
                        onClick={() => updateField('socialVibe', opt)}
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
                  <label className="text-[13.5px] font-bold text-white">Messaging Style</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Random thoughts', 'Memes', 'Check-ins', 'Voice notes', 'Calls', 'Making plans', 'Mostly IRL'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.messagingStyle === opt}
                        onClick={() => updateField('messagingStyle', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[13.5px] font-bold text-white">When someone is going through a hard time</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Listen', 'Reassure', 'Make sense of it', 'Advice', 'Solve it', 'Ask me'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.supportStyle === opt}
                        onClick={() => updateField('supportStyle', opt)}
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
                  <label className="text-[13.5px] font-bold text-white">Friendship Pillars</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['We tell each other everything', 'Inside jokes', 'Spontaneous plans', 'Comfortable silence', 'Show up in hard times'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.friendshipPillars === opt}
                        onClick={() => updateField('friendshipPillars', opt)}
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
                  <label className="text-[13.5px] font-bold text-white">Ideal Free Saturday</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Slow coffee', 'Outdoors', 'Hobbies', 'Exploring', 'Social all day', 'Dinner-drinks', 'Home', 'Spontaneous'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.idealSaturday === opt}
                        onClick={() => updateField('idealSaturday', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[13.5px] font-bold text-white">Spontaneous Weekend Trip?</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Already packing', 'Convince me', '24 hours notice needed', 'Not without itinerary'].map((opt) => (
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

            {/* CATEGORY 5: PERSONALITY */}
            {activeCategoryNum === 5 && (
              <div className="mt-5 flex flex-col gap-5">
                <div>
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
                  <label className="text-[13.5px] font-bold text-white">Life Priorities</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Family', 'Freedom', 'Adventure', 'Community', 'Achievement', 'Creativity', 'Growth', 'Stability', 'Curiosity'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.coreValues === opt}
                        onClick={() => updateField('coreValues', opt)}
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
                    {['Free', '<$20', '$20–50', '$50–100', '$100+'].map((opt) => (
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
                    {['Low', 'Flexible', 'Important', 'Essential'].map((opt) => (
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
                    {['Fine', 'Context matters', 'Dislike', 'Dealbreaker'].map((opt) => (
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
            <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-5">
              {activeCategoryNum > 1 ? (
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setActiveCategoryNum((prev) => prev - 1)}
                >
                  ← Previous
                </Button>
              ) : (
                <div />
              )}

              {activeCategoryNum < 10 ? (
                <Button
                  variant="primary"
                  size="sm"
                  type="button"
                  onClick={() => setActiveCategoryNum((prev) => prev + 1)}
                >
                  Next Category ({activeCategoryNum + 1}/10) →
                </Button>
              ) : (
                <Button variant="primary" size="sm" type="submit">
                  Save All 10 Categories
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
