'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IllustratedGround, Button, Chip } from '@soul-tribe/ui';
import { ArrowLeft, Check } from 'lucide-react';

export default function DeeperTribalPassPage() {
  const [activeCategory, setActiveCategory] = useState<string>('A');
  const [savedMessage, setSavedMessage] = useState(false);

  // Sample Deeper Form State
  const [closeFriendsTarget, setCloseFriendsTarget] = useState('3-5');
  const [seeFrequency, setSeeFrequency] = useState('Every 2 weeks');
  const [restorationMode, setRestorationMode] = useState('Time alone');
  const [roomEntryStyle, setRoomEntryStyle] = useState('Warm up gradually');
  const [replyRhythm, setReplyRhythm] = useState('Same day');
  const [preferredMedium, setPreferredMedium] = useState('Text');
  const [valuesShareImportance, setValuesShareImportance] = useState('Important');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const categories = [
    { id: 'A', name: 'Friendship Intent', title: 'Friendship Intent & Depth', subtitle: 'How many close friends, meeting frequency & closeness' },
    { id: 'B', name: 'Personality & Social Energy', title: 'Personality & Social Energy', subtitle: 'Restoration mode, novelty & room entry style' },
    { id: 'C', name: 'Communication Style', title: 'Communication Style', subtitle: 'Reply rhythm, messaging medium & directness' },
    { id: 'D', name: 'Social Rhythm & Availability', title: 'Social Rhythm & Availability', subtitle: 'Outing length, group size & spontaneous plans' },
    { id: 'E', name: 'Emotional Style', title: 'Emotional & Relational Style', subtitle: 'Opening pace, conflict repair & boundaries' },
    { id: 'F', name: 'Values & Worldview', title: 'Values & Worldview', subtitle: 'Core values & disagreement comfort' },
    { id: 'G', name: 'Lifestyle', title: 'Lifestyle Compatibility', subtitle: 'Weekend rhythm, activity level & budget' },
    { id: 'H', name: 'Interests Graph', title: 'Interests & Curiosity Graph', subtitle: 'What you talk about & want to learn' },
    { id: 'I', name: 'Outing DNA', title: 'Outing DNA', subtitle: 'Conversation-first vs activity-first & environment' },
    { id: 'J', name: 'Matching Boundaries', title: 'Matching Boundaries', subtitle: 'Priority factors & non-negotiables' },
  ];

  const activeCategoryItem = categories.find((c) => c.id === activeCategory) || categories[0];

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
              Part II — Progressive Profiling
            </span>
            <h1 className="text-[24px] font-bold tracking-tight text-[#F3F0E9]">
              Deeper Tribal Pass
            </h1>
          </div>
          <span className="rounded-full bg-[#0D1D15] border border-[#F3F0E9]/20 px-3 py-1 text-[11px] font-bold text-[#F3F0E9]">
            User Editable
          </span>
        </div>
      </header>

      {/* Category Titles Selector Pills */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 rounded-[12px] px-4 py-2 text-[13px] font-bold transition-all ${
              activeCategory === cat.id
                ? 'bg-[#F3F0E9] text-[#0D1D15] shadow-sm'
                : 'border border-[#F3F0E9]/15 bg-[#15261C] text-[#A6AAA4] hover:text-[#F3F0E9]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Progressive Form Section */}
      <form onSubmit={handleSave} className="mt-4 flex flex-col gap-6">
        <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg">
          <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
            {activeCategoryItem.name}
          </span>
          <h3 className="mt-1 text-[20px] font-bold text-[#F3F0E9]">
            {activeCategoryItem.title}
          </h3>
          <p className="mt-0.5 text-[13px] text-[#A6AAA4]">
            {activeCategoryItem.subtitle}
          </p>

          <div className="mt-5 flex flex-col gap-4">
            {activeCategory === 'A' && (
              <>
                <div>
                  <label className="text-[13px] font-semibold text-[#F3F0E9]">
                    How many close friends are you hoping to cultivate?
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['1-2 close friends', '3-5 inner circle', '6-10 solid friends', 'Open'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={closeFriendsTarget === opt}
                        onClick={() => setCloseFriendsTarget(opt)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-[#F3F0E9]">
                    Ideal meeting frequency once connected:
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Weekly', 'Every 2 weeks', 'Monthly', 'A few times a year'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={seeFrequency === opt}
                        onClick={() => setSeeFrequency(opt)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeCategory === 'B' && (
              <>
                <div>
                  <label className="text-[13px] font-semibold text-[#F3F0E9]">Social restoration mode:</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Time alone', 'Quiet 1-on-1', 'Active group', 'Nature'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={restorationMode === opt}
                        onClick={() => setRestorationMode(opt)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-[#F3F0E9]">Room entry style:</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Warm up gradually', 'Jump straight in', 'Observe first'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={roomEntryStyle === opt}
                        onClick={() => setRoomEntryStyle(opt)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeCategory === 'C' && (
              <>
                <div>
                  <label className="text-[13px] font-semibold text-[#F3F0E9]">Default text reply rhythm:</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Immediate', 'Same day', 'Within 2-3 days', 'Slow replier'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={replyRhythm === opt}
                        onClick={() => setReplyRhythm(opt)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-[#F3F0E9]">Preferred contact medium:</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Text', 'Voice notes', 'In person only', 'Calls'].map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={preferredMedium === opt}
                        onClick={() => setPreferredMedium(opt)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {['D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(activeCategory) && (
              <div>
                <label className="text-[13px] font-semibold text-[#F3F0E9]">
                  Importance of shared alignment in {activeCategoryItem.name}:
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Essential', 'Important', 'Nice to have', 'Not important'].map((opt) => (
                    <Chip
                      key={opt}
                      label={opt}
                      selected={valuesShareImportance === opt}
                      onClick={() => setValuesShareImportance(opt)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {savedMessage && (
            <span className="flex items-center text-[13px] font-bold text-[#F3F0E9]">
              <Check className="mr-1 h-4 w-4" /> {activeCategoryItem.name} Saved!
            </span>
          )}

          <Button type="submit" variant="primary" size="md" className="ml-auto">
            Save {activeCategoryItem.name}
          </Button>
        </div>
      </form>
    </IllustratedGround>
  );
}
