'use client';
import React, { useRef, useId } from 'react';
export interface SynthesisSection {
  title: string; // e.g. "Who you are socially"
  content: string;
  markerCount: number; // Must be >= 2 for synthesis!
}

export interface TribalReadData {
  headline: string; // e.g. "Selective, curious & quietly adventurous"
  summary: string;
  pills: string[];
  topThreads: [string, string]; // Thread keys for gradient/wash
  sections: SynthesisSection[]; // Up to 6 synthesis sections
}

export interface TribalReadProps {
  data?: TribalReadData;
  label?: string; // e.g. "Mervyn's Tribal Read"
  tone?: 'amber' | 'emerald';
  showReadMore?: boolean;
  className?: string;
}

export function TribalRead({ data, label = 'Your Tribal Read', showReadMore = true, className = '' }: TribalReadProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  if (!data?.headline) return null;
  const sections = (data.sections || []).filter(section => section.markerCount >= 2);
  return <section className={`rounded-3xl border border-[#203B30]/10 bg-[#E3EADF] p-6 text-[#203B30] ${className}`}>
    <p className="text-xs uppercase tracking-widest text-[#536657]">{label}</p>
    <h2 className="text-3xl leading-tight font-semibold mt-3">{data.headline}</h2>
    <p className="mt-4 text-sm leading-relaxed">{data.summary}</p>
    <div className="mt-4 flex flex-wrap gap-2">{data.pills.map(pill => <span key={pill} className="rounded-full bg-[#F8F5EE] px-3 py-1 text-xs">{pill}</span>)}</div>
    {showReadMore && sections.length > 0 && <>
      <button type="button" onClick={() => dialog.current?.showModal()} className="mt-6 rounded-full bg-[#203B30] px-5 py-3 text-sm text-white">Read More About Me →</button>
      <dialog ref={dialog} aria-labelledby={titleId} className="max-h-[90dvh] w-[90vw] max-w-2xl overflow-y-auto rounded-3xl bg-[#f4f2e9] p-8 text-[#203B30] backdrop:bg-black/70">
      <form method="dialog" className="flex justify-end"><button className="rounded-full bg-white px-4 py-2">Close ×</button></form>
      <h2 id={titleId} className="mt-6 text-4xl font-semibold">Your Tribal Read</h2>
      <p className="my-6 text-sm leading-6">A living read on how you connect, built from what you've shared across your Tribal Pass.</p>
      <div className="space-y-5 mt-4">{sections.map(section => <section key={section.title}>
        <h3 className="font-semibold">{section.title}</h3><p className="mt-2 text-sm leading-relaxed">{section.content}</p>
      </section>)}</div>
      <p className="mt-5 text-xs text-[#536657]">A developing portrait based on shared answers, with room to change.</p>
      </dialog>
    </>}
  </section>;
}
