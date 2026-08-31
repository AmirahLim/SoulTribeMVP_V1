'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IllustratedGround, Button, Chip } from '@soul-tribe/ui';
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
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      {/* Header */}
      <header className="py-2 border-b border-[#F3F0E9]/12 pb-4">
        <Link href="/you" className="flex items-center text-[13.5px] font-semibold text-[#A6AAA4] hover:text-[#F3F0E9]">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Profile
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
              Deep Profile & Matching System
            </span>
            <h1 className="text-[24px] font-bold tracking-tight text-[#F3F0E9]">
              Deeper Tribal Pass
            </h1>
          </div>
          <span className="rounded-full bg-[#0D1D15] border border-[#F3F0E9]/20 px-3 py-1 text-[11px] font-bold text-[#F3F0E9]">
            Questions → Open-ended → Profile
          </span>
        </div>
      </header>

      {/* Category Pills (PDF Specification: 10 Categories) */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.num}
            type="button"
            onClick={() => setActiveCategoryNum(cat.num)}
            className={`flex-shrink-0 rounded-[12px] px-3.5 py-2 text-[12.5px] font-bold transition-all ${
              activeCategoryNum === cat.num
                ? 'bg-[#F3F0E9] text-[#0D1D15] shadow-sm'
                : 'border border-[#F3F0E9]/15 bg-[#15261C] text-[#A6AAA4] hover:text-[#F3F0E9]'
            }`}
          >
            {cat.num}. {cat.name}
          </button>
        ))}
      </div>

      {/* Progressive Questionnaire & Open Answer Form */}
      <form onSubmit={handleSave} className="mt-4 flex flex-col gap-6">
        <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
              Category {currentCat.num} of 10
            </span>
            {currentCat.num === 10 ? (
              <span className="flex items-center text-[11px] font-bold text-[#A6AAA4]">
                <Lock className="mr-1 h-3 w-3" /> Private Matching Signals
              </span>
            ) : (
              <span className="flex items-center text-[11px] font-bold text-[#F3F0E9]">
                <Globe className="mr-1 h-3 w-3" /> Appears on Profile
              </span>
            )}
          </div>

          <h3 className="mt-1 text-[20px] font-bold text-[#F3F0E9]">
            {currentCat.name}
          </h3>
          <p className="mt-0.5 text-[13px] text-[#A6AAA4]">
            {currentCat.subtitle}
          </p>

          <div className="mt-6 flex flex-col gap-6 border-t border-[#F3F0E9]/10 pt-5">
            {/* 1. SOCIAL ENERGY */}
            {activeCategoryNum === 1 && (
              <>
                <div>
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    Your ideal social setting?
                  </label>
                  <p className="text-[12px] text-[#A6AAA4] mt-0.5">Quick structured answer:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['One-on-one', '3–4 people', '5–8 people', 'Big group', 'Depends'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.socialSetting === opt}
                        onClick={() => updateField('socialSetting', opt)}
                      />
                    ))}
                  </div>

                  <div className="mt-3">
                    <label className="text-[12.5px] font-semibold text-[#A6AAA4]">
                      Optional open answer: What makes that setting work for you?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add your own words... e.g. I usually find one person I click with before I open up to the room."
                      value={formState.socialEnergyOpen || ''}
                      onChange={(e) => updateField('socialEnergyOpen', e.target.value)}
                      className="mt-1.5 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-3 text-[13.5px] text-[#F3F0E9] outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-[#F3F0E9]/10 pt-4">
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    What atmosphere brings you alive?
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Intimate', 'Playful-chaotic', 'Intellectual', 'Adventurous', 'Calm', 'High-energy', 'Creative'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.groupEnergy === opt}
                        onClick={() => updateField('groupEnergy', opt)}
                      />
                    ))}
                  </div>

                  <div className="mt-3">
                    <label className="text-[12.5px] font-semibold text-[#A6AAA4]">
                      Optional open answer: Describe your perfect social atmosphere.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Intimate, curious, slightly chaotic."
                      value={formState.atmosphereOpen || ''}
                      onChange={(e) => updateField('atmosphereOpen', e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] px-4 text-[13.5px] text-[#F3F0E9] outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 2. HOW I CONNECT */}
            {activeCategoryNum === 2 && (
              <>
                <div>
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    How do you naturally keep friendships alive?
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Random thoughts', 'Memes', 'Check-ins', 'Voice notes', 'Calls', 'Making plans', 'Mostly IRL'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.connectionMode === opt}
                        onClick={() => updateField('connectionMode', opt)}
                      />
                    ))}
                  </div>

                  <div className="mt-3">
                    <label className="text-[12.5px] font-semibold text-[#A6AAA4]">
                      Optional open answer: Anything you want people to know about your texting style?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. I don't need to talk every day to feel close, but when we talk I like actually talking."
                      value={formState.messagingStyleOpen || ''}
                      onChange={(e) => updateField('messagingStyleOpen', e.target.value)}
                      className="mt-1.5 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-3 text-[13.5px] text-[#F3F0E9] outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-[#F3F0E9]/10 pt-4">
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    When you're venting, what do you want?
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Listen', 'Reassure', 'Make sense of it', 'Advice', 'Solve it', 'Ask me'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.replyRhythm === opt}
                        onClick={() => updateField('replyRhythm', opt)}
                      />
                    ))}
                  </div>

                  <div className="mt-3">
                    <label className="text-[12.5px] font-semibold text-[#A6AAA4]">
                      Optional open answer: In your own words, what does good support feel like?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Listen first. Advice is welcome once I feel understood."
                      value={formState.supportOpen || ''}
                      onChange={(e) => updateField('supportOpen', e.target.value)}
                      className="mt-1.5 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-3 text-[13.5px] text-[#F3F0E9] outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 3. FRIENDSHIP STYLE */}
            {activeCategoryNum === 3 && (
              <>
                <div>
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    You know someone's becoming a real friend when...
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['We tell each other everything', 'Inside jokes', 'Spontaneous plans', 'Comfortable silence', 'Show up in hard times'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.bringsToFriendship === opt}
                        onClick={() => updateField('bringsToFriendship', opt)}
                      />
                    ))}
                  </div>

                  <div className="mt-3">
                    <label className="text-[12.5px] font-semibold text-[#A6AAA4]">
                      Optional open answer: Finish this prompt in your own words.
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. We can disappear into our own lives and reconnect without it feeling weird."
                      value={formState.realFriendOpen || ''}
                      onChange={(e) => updateField('realFriendOpen', e.target.value)}
                      className="mt-1.5 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-3 text-[13.5px] text-[#F3F0E9] outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-[#F3F0E9]/10 pt-4">
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    What makes you feel cared for?
                  </label>
                  <div className="mt-3">
                    <label className="text-[12.5px] font-semibold text-[#A6AAA4]">
                      Optional open answer: Something small a friend can do that means a lot to you?
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Making time, remembering small details, showing up."
                      value={formState.caredForOpen || ''}
                      onChange={(e) => updateField('caredForOpen', e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] px-4 text-[13.5px] text-[#F3F0E9] outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 4. MY RHYTHM */}
            {activeCategoryNum === 4 && (
              <>
                <div>
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    Your ideal Saturday?
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Slow coffee', 'Outdoors', 'Hobbies', 'Exploring', 'Social all day', 'Dinner-drinks', 'Home', 'Spontaneous'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.timeAlive === opt}
                        onClick={() => updateField('timeAlive', opt)}
                      />
                    ))}
                  </div>

                  <div className="mt-3">
                    <label className="text-[12.5px] font-semibold text-[#A6AAA4]">
                      Optional open answer: Describe your ideal free Saturday in your own words.
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Slow morning, something interesting in the afternoon, dinner if the energy is right."
                      value={formState.idealSaturdayOpen || ''}
                      onChange={(e) => updateField('idealSaturdayOpen', e.target.value)}
                      className="mt-1.5 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-3 text-[13.5px] text-[#F3F0E9] outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 5. PERSONALITY */}
            {activeCategoryNum === 5 && (
              <>
                <div>
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    Your friend texts: 'Flights are cheap. Bali this weekend?'
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Already packing', 'Convince me', '24 hours notice needed', 'Not without itinerary'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.baliTextResponse === opt}
                        onClick={() => updateField('baliTextResponse', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#F3F0E9]/10 pt-4">
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    Which describe you best?
                  </label>
                  <div className="mt-3">
                    <label className="text-[12.5px] font-semibold text-[#A6AAA4]">
                      Optional open answer: Describe yourself in 1–2 sentences without using job titles.
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Curious, reflective, and independent with a dry humor."
                      value={formState.selfDescriptionOpen || ''}
                      onChange={(e) => updateField('selfDescriptionOpen', e.target.value)}
                      className="mt-1.5 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-3 text-[13.5px] text-[#F3F0E9] outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 6. VALUES & WORLDVIEW */}
            {activeCategoryNum === 6 && (
              <>
                <div>
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    What matters most to the life you're building?
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Family', 'Freedom', 'Adventure', 'Community', 'Achievement', 'Creativity', 'Growth', 'Stability', 'Curiosity'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.mattersMost === opt}
                        onClick={() => updateField('mattersMost', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#F3F0E9]/10 pt-4">
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    What quality makes you respect someone?
                  </label>
                  <div className="mt-3">
                    <label className="text-[12.5px] font-semibold text-[#A6AAA4]">
                      Optional open answer: Finish this: "I really respect people who..."
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. I really respect people who can change their mind when presented with better information."
                      value={formState.respectPeopleOpen || ''}
                      onChange={(e) => updateField('respectPeopleOpen', e.target.value)}
                      className="mt-1.5 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-3 text-[13.5px] text-[#F3F0E9] outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 7. I'M INTO */}
            {activeCategoryNum === 7 && (
              <>
                <div>
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    What could you lose hours talking about?
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Design history, why people make irrational choices, and filter coffee roast notes."
                    value={formState.talkForHoursOpen || ''}
                    onChange={(e) => updateField('talkForHoursOpen', e.target.value)}
                    className="mt-1.5 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-3 text-[13.5px] text-[#F3F0E9] outline-none"
                  />
                </div>

                <div className="border-t border-[#F3F0E9]/10 pt-4">
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    What's your current rabbit hole?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Japanese woodworking joints and Studio Ghibli food aesthetics."
                    value={formState.currentRabbitHoleOpen || ''}
                    onChange={(e) => updateField('currentRabbitHoleOpen', e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] px-4 text-[13.5px] text-[#F3F0E9] outline-none"
                  />
                </div>

                <div className="border-t border-[#F3F0E9]/10 pt-4">
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    What would you love someone to introduce you to?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pottery throwing, ceramics, bouldering."
                    value={formState.wantToTryOpen || ''}
                    onChange={(e) => updateField('wantToTryOpen', e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] px-4 text-[13.5px] text-[#F3F0E9] outline-none"
                  />
                </div>
              </>
            )}

            {/* 8. OUTING DNA */}
            {activeCategoryNum === 8 && (
              <>
                <div>
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    Describe an outing you'd say yes to instantly.
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. A quiet pottery workshop followed by filter coffee in Tiong Bahru."
                    value={formState.instantYesOutingOpen || ''}
                    onChange={(e) => updateField('instantYesOutingOpen', e.target.value)}
                    className="mt-1.5 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-3 text-[13.5px] text-[#F3F0E9] outline-none"
                  />
                </div>

                <div className="border-t border-[#F3F0E9]/10 pt-4">
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    Typical comfortable spend?
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Free', '<$20', '$20–50', '$50–100', '$100+'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.comfortableSpend === opt}
                        onClick={() => updateField('comfortableSpend', opt)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 9. YOU SHOULD KNOW */}
            {activeCategoryNum === 9 && (
              <>
                <div>
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    I'll probably like you if...
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. ...you can go from discussing something stupid to something existential in 5 minutes."
                    value={formState.likeYouIfOpen || ''}
                    onChange={(e) => updateField('likeYouIfOpen', e.target.value)}
                    className="mt-1.5 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] p-3 text-[13.5px] text-[#F3F0E9] outline-none"
                  />
                </div>

                <div className="border-t border-[#F3F0E9]/10 pt-4">
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    The quickest way to get me out of the house is...
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A quiet coffee walk or an invitation to an independent bookstore."
                    value={formState.quickestOutHouseOpen || ''}
                    onChange={(e) => updateField('quickestOutHouseOpen', e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] px-4 text-[13.5px] text-[#F3F0E9] outline-none"
                  />
                </div>

                <div className="border-t border-[#F3F0E9]/10 pt-4">
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    A weirdly specific thing I love...
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The smell of old books and watching pottery glaze dry."
                    value={formState.weirdThingILoveOpen || ''}
                    onChange={(e) => updateField('weirdThingILoveOpen', e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[12px] border border-[#F3F0E9]/15 bg-[#0D1D15] px-4 text-[13.5px] text-[#F3F0E9] outline-none"
                  />
                </div>
              </>
            )}

            {/* 10. BOUNDARIES & MATCHING PREFERENCES */}
            {activeCategoryNum === 10 && (
              <>
                <div>
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    How important is punctuality to you?
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Low', 'Flexible', 'Important', 'Essential'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.punctualityImportance === opt}
                        onClick={() => updateField('punctualityImportance', opt)}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#F3F0E9]/10 pt-4">
                  <label className="text-[13.5px] font-bold text-[#F3F0E9]">
                    How do you feel about last-minute cancellations?
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Fine', 'Context matters', 'Dislike', 'Dealbreaker'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={formState.cancellationFeeling === opt}
                        onClick={() => updateField('cancellationFeeling', opt)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Live Profile Output Preview Box */}
        <div className="rounded-[20px] border border-[#F3F0E9]/12 bg-[#0D1D15] p-4">
          <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
            Live Public Profile Render Preview
          </span>
          <p className="mt-1.5 text-[13px] italic text-[#F3F0E9]">
            {activeCategoryNum === 1 && (formState.socialEnergyOpen || formState.atmosphereOpen || '"Small groups · Warms up gradually"')}
            {activeCategoryNum === 2 && (formState.messagingStyleOpen || formState.supportOpen || '"I don\'t need to talk every day to feel close..."')}
            {activeCategoryNum === 3 && (formState.realFriendOpen || formState.caredForOpen || '"We can disappear into our own lives..."')}
            {activeCategoryNum === 4 && (formState.idealSaturdayOpen || '"Slow morning, filter coffee, quiet afternoon."')}
            {activeCategoryNum === 5 && (formState.selfDescriptionOpen || '"Curious, reflective, and independent."')}
            {activeCategoryNum === 6 && (formState.respectPeopleOpen || '"I really respect people who can change their mind..."')}
            {activeCategoryNum === 7 && (formState.talkForHoursOpen || '"Design history, psychology, and ceramics."')}
            {activeCategoryNum === 8 && (formState.instantYesOutingOpen || '"A quiet pottery workshop followed by filter coffee."')}
            {activeCategoryNum === 9 && (formState.likeYouIfOpen || '"I\'ll probably like you if you can go from stupid to existential in 5m."')}
            {activeCategoryNum === 10 && '"Private matching signals — used strictly by algorithm."'}
          </p>
        </div>

        <div className="flex items-center justify-between">
          {savedMessage && (
            <span className="flex items-center text-[13px] font-bold text-[#F3F0E9]">
              <Check className="mr-1 h-4 w-4" /> Category {currentCat.num} Saved!
            </span>
          )}

          <Button type="submit" variant="primary" size="md" className="ml-auto">
            Save & Update Profile
          </Button>
        </div>
      </form>
    </IllustratedGround>
  );
}
