'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import story from '../app/home/HomeStory.module.css';

const tabs = ['Matches', 'Your Pitches', 'Going', 'On your Radar'] as const;

/** Layout only: no auth, database requests, cached profiles, or invented members. */
export function StagingHomePreview() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Matches');
  return (
    <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] pb-24">
      <img src="/user-home-bg.jpg" alt="" className="fixed inset-0 h-full w-full object-cover z-0 opacity-80" />
      <div className={story.overlay} />
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-8">
        <aside className="mb-6 rounded-xl border border-white/25 bg-[#f5efdf] p-4 text-[#244438]">
          <strong>Staging · no sign-in needed</strong>
          <p className="mt-1 text-sm">Home layout preview. Member data and account actions are not loaded here.</p>
        </aside>
        <header className={story.header}>
          <div className={story.name}>
            <span className="text-xs tracking-widest uppercase">Soul Tribe</span>
            <h1>Home</h1>
          </div>
          <button type="button" disabled className={`${story.pitch} opacity-50`} title="Account action unavailable in layout preview">
            <Plus className="mr-1 h-4 w-4" /> Pitch Outing
          </button>
        </header>
        <section className={story.status}>
          <h2 className="text-xs font-bold tracking-widest uppercase">Tribal Pass Status</h2>
          <p className="mt-3">No member profile loaded in this preview.</p>
          <p className="mt-2 text-sm text-white/75">Completion, matches and outings are not calculated without a member account.</p>
        </section>
        <div role="tablist" aria-label="Home sections" className={`${story.navigation} mt-5 flex gap-3 overflow-x-auto border-b border-white/15`}>
          {tabs.map((tab, index) => (
            <button key={tab} id={`preview-tab-${index}`} type="button" role="tab" aria-selected={activeTab === tab} aria-controls="preview-panel"
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-3 text-sm ${activeTab === tab ? 'border-b-2 border-white font-bold' : 'text-white/60'}`}>
              {tab}
            </button>
          ))}
        </div>
        <section id="preview-panel" role="tabpanel" aria-labelledby={`preview-tab-${tabs.indexOf(activeTab)}`} className="mt-6 rounded-[28px] border border-white/20 bg-black/65 p-8 text-center">
          <Users className="mx-auto h-10 w-10" />
          <h2 className="mt-4 text-xl font-bold">{activeTab}</h2>
          <p className="mt-3 text-sm text-white/75">Not loaded in this layout preview. No sample people, outings or results have been added.</p>
        </section>
        <section className="mt-6 rounded-xl bg-[#f5efdf] p-5 text-[#244438]">
          <h2 className="font-semibold">About the 8a reads</h2>
          <p className="mt-2 text-sm">Personal readings and Connection Notes need actual answers. This screen previews Home, not a completed member read.</p>
          <Link href="/onboarding" className="mt-4 inline-block underline">Explore onboarding and your Early Read</Link>
        </section>
      </div>
    </div>
  );
}
