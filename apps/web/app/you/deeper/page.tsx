'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IllustratedGround, Button, Chip } from '@soul-tribe/ui';
import { ArrowLeft, Sparkles, Check, Heart, Compass, ShieldCheck, Zap } from 'lucide-react';

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
    { id: 'A', title: 'A. Friendship Intent & Depth', subtitle: 'How many close friends, meeting frequency & closeness' },
    { id: 'B', title: 'B. Personality & Social Energy', subtitle: 'Restoration mode, novelty & room entry style' },
    { id: 'C', title: 'C. Communication Style', subtitle: 'Reply rhythm, messaging medium & directness' },
    { id: 'D', title: 'D. Social Rhythm & Availability', subtitle: 'Outing length, group size & spontaneous plans' },
    { id: 'E', title: 'E. Emotional & Relational Style', subtitle: 'Opening pace, conflict repair & boundaries' },
    { id: 'F', title: 'F. Values & Worldview', subtitle: 'Core values & disagreement comfort' },
    { id: 'G', title: 'G. Lifestyle Compatibility', subtitle: 'Weekend rhythm, activity level & budget' },
    { id: 'H', title: 'H. Interests & Curiosity Graph', subtitle: 'What you talk about & want to learn' },
    { id: 'I', title: 'I. Outing DNA', subtitle: 'Conversation-first vs activity-first & environment' },
    { id: 'J', title: 'J. Matching Boundaries', subtitle: 'Priority factors & non-negotiables' },
  ];

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      {/* Header */}
      <header className="py-2">
        <Link href="/you" className="flex items-center text-[13px] font-medium text-[#7A6B5F] hover:text-[#3D2E24]">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Profile
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#C85A32] uppercase">
              Part II — Progressive Profiling
            </span>
            <h1 className="text-[24px] font-extrabold tracking-tight text-[#3D2E24]">
              Deeper Tribal Pass
            </h1>
          </div>
          <span className="rounded-full bg-[#2E5345]/10 px-3 py-1 text-[11px] font-bold text-[#2E5345]">
            User Editable
          </span>
        </div>

        <p className="mt-1 text-[13px] text-[#4A3B30]">
          Complete high-value questions progressively at your own pace to continuously refine your matches.
        </p>
      </header>

      {/* Category Pills Switcher */}
      <section className="mt-4 flex gap-2 overflow-x-auto pb-2 pt-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-[12.5px] font-bold transition-all ${
              activeCategory === cat.id
                ? 'bg-[#3D2E24] text-[#FFFDF9] shadow-sm'
                : 'border border-[#3D2E24]/10 bg-[#FFFDF9] text-[#7A6B5F] hover:bg-[#EFE5D8]'
            }`}
          >
            {cat.title.split('.')[0]}. {cat.title.split('—')[0].split('.')[1]}
          </button>
        ))}
      </section>

      {/* Progressive Form Section */}
      <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
        {/* A. FRIENDSHIP INTENT & DEPTH */}
        {activeCategory === 'A' && (
          <div className="rounded-[28px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-5 shadow-sm">
            <h3 className="text-[17px] font-bold text-[#3D2E24]">
              A. Friendship Intent & Depth
            </h3>
            <p className="mt-0.5 text-[12px] text-[#7A6B5F]">
              How many genuinely close friendships would you ideally like in your life?
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-[13px] font-bold text-[#3D2E24]">Close Friendships Target:</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['1-2', '3-5', '6-10', 'Broad circle', 'No target'].map((opt) => (
                    <Chip
                      key={opt}
                      label={opt}
                      selected={closeFriendsTarget === opt}
                      onClick={() => setCloseFriendsTarget(opt)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-2">
                <label className="text-[13px] font-bold text-[#3D2E24]">Ideal Meeting Frequency:</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Several times a week', 'Weekly', 'Every 2 weeks', 'Monthly', 'Quality over frequency'].map((opt) => (
                    <Chip
                      key={opt}
                      label={opt}
                      selected={seeFrequency === opt}
                      onClick={() => setSeeFrequency(opt)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* B. PERSONALITY & SOCIAL ENERGY */}
        {activeCategory === 'B' && (
          <div className="rounded-[28px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-5 shadow-sm">
            <h3 className="text-[17px] font-bold text-[#3D2E24]">
              B. Personality & Social Energy
            </h3>
            <p className="mt-0.5 text-[12px] text-[#7A6B5F]">
              After a busy week, what restores you most?
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-[13px] font-bold text-[#3D2E24]">Restoration Mode:</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Time alone', 'One close friend', 'Small group', 'Lively social setting', 'Depends'].map((opt) => (
                    <Chip
                      key={opt}
                      label={opt}
                      selected={restorationMode === opt}
                      onClick={() => setRestorationMode(opt)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-2">
                <label className="text-[13px] font-bold text-[#3D2E24]">Entering a Room of Strangers:</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['I initiate', 'Warm up gradually', 'Wait for approach', 'Find one person', 'Depends'].map((opt) => (
                    <Chip
                      key={opt}
                      label={opt}
                      selected={roomEntryStyle === opt}
                      onClick={() => setRoomEntryStyle(opt)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* C. COMMUNICATION STYLE */}
        {activeCategory === 'C' && (
          <div className="rounded-[28px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-5 shadow-sm">
            <h3 className="text-[17px] font-bold text-[#3D2E24]">
              C. Communication Style
            </h3>
            <p className="mt-0.5 text-[12px] text-[#7A6B5F]">
              What is your natural reply rhythm & preferred medium?
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-[13px] font-bold text-[#3D2E24]">Natural Reply Rhythm:</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Minutes', 'Hours', 'Same day', '1-2 days', 'Whenever bandwidth'].map((opt) => (
                    <Chip
                      key={opt}
                      label={opt}
                      selected={replyRhythm === opt}
                      onClick={() => setReplyRhythm(opt)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-2">
                <label className="text-[13px] font-bold text-[#3D2E24]">Preferred Communication Medium:</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Text', 'Voice note', 'Call', 'Video', 'Mostly in person'].map((opt) => (
                    <Chip
                      key={opt}
                      label={opt}
                      selected={preferredMedium === opt}
                      onClick={() => setPreferredMedium(opt)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OTHER CATEGORIES FALLBACK */}
        {!['A', 'B', 'C'].includes(activeCategory) && (
          <div className="rounded-[28px] border border-[#3D2E24]/08 bg-[#FFFDF9] p-5 shadow-sm">
            <h3 className="text-[17px] font-bold text-[#3D2E24]">
              {categories.find((c) => c.id === activeCategory)?.title}
            </h3>
            <p className="mt-1 text-[13px] text-[#7A6B5F]">
              {categories.find((c) => c.id === activeCategory)?.subtitle}
            </p>

            <div className="mt-4 text-[13px] text-[#4A3B30]">
              💡 Questions for this category are progressively surfaced after outings and between browsing sessions to continuously enrich your Tribal Pass.
            </div>
          </div>
        )}

        {savedMessage && (
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#2E5345]">
            <Check className="h-4 w-4" /> Tribal Pass updated successfully!
          </div>
        )}

        <Button type="submit" variant="primary" size="md" className="w-full">
          Save Section to Tribal Pass
        </Button>
      </form>
    </IllustratedGround>
  );
}
