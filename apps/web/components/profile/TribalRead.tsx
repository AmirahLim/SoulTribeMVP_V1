'use client';
import React from 'react';
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

export function TribalRead({ data, label = 'Your Social Signature', showReadMore = true, className = '' }: TribalReadProps) {
  if (!data?.headline) return null;
  const sections = (data.sections || []).filter(section => section.markerCount >= 2);
  return <section className={`rounded-3xl border border-[#203B30]/10 bg-[#E3EADF] p-6 text-[#203B30] ${className}`}>
    <p className="text-xs uppercase tracking-widest text-[#536657]">{label}</p>
    <h2 className="text-3xl leading-tight font-semibold mt-3">{data.headline}</h2>
    <p className="mt-4 text-sm leading-relaxed">{data.summary}</p>
    <div className="mt-4 flex flex-wrap gap-2">{data.pills.map(pill => <span key={pill} className="rounded-full bg-[#F8F5EE] px-3 py-1 text-xs">{pill}</span>)}</div>
    {showReadMore && sections.length > 0 && <details className="mt-5 border-t border-[#203B30]/15 pt-4">
      <summary className="cursor-pointer text-sm font-semibold py-2 focus-visible:outline focus-visible:outline-2">Explore this Social Signature</summary>
      <div className="space-y-5 mt-4">{sections.map(section => <section key={section.title}>
        <h3 className="font-semibold">{section.title}</h3><p className="mt-2 text-sm leading-relaxed">{section.content}</p>
      </section>)}</div>
      <p className="mt-5 text-xs text-[#536657]">A developing portrait based on shared answers, with room to change.</p>
    </details>}
  </section>;
}
