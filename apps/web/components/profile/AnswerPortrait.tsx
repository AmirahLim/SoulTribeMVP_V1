'use client';
import React from 'react';
import type { UserProfileData } from '../../lib/userStore';
export function AnswerPortrait({ profile }: { profile: UserProfileData }) {
  const d = profile.deepProfile || {};
  const sections = [
    ['What I’m looking for', profile.q1Finding?.join(' · ')],
    ['A great friendship feels like', profile.q2Feelings?.join(' · ')],
    ['How I stay connected', profile.q4Connected?.join(' · ')],
    ['My rhythm', profile.q5PlanningRhythm],
    ['I would say yes to', profile.q6Outings?.join(' · ')],
    ['How I open up', profile.q7EmotionalPacing],
    ['Who I’d love to meet', profile.q8Qualities?.join(' · ')],
    ['In my own words', d.selfDescriptionOpen],
    ['What matters to me', d.coreValues],
    ['My current curiosity', d.currentRabbitHoleOpen],
    ['You should know', d.likeMeIfPrompt],
  ].filter((s): s is [string, string] => Boolean(s[1]));
  return (
    <section className="rounded-3xl bg-ground-paper text-ink-espresso p-6 shadow-e1 space-y-4">
      <p className="text-xs uppercase tracking-widest text-accent-sage font-semibold">
        Social Signature
      </p>
      <h2 className="font-serif text-2xl">In your own words</h2>
      <p className="text-sm text-ink-bark">
        Your saved answers. These notes are private; you can edit them as you
        change.
      </p>
      {sections.length ? (
        sections.map(([label, answer], i) => (
          <details
            key={label}
            className={`p-4 rounded-2xl ${i % 2 ? 'bg-ground-mist' : 'bg-ground-sand'}`}
          >
            <summary className="cursor-pointer font-semibold">{label}</summary>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
              {answer}
            </p>
          </details>
        ))
      ) : (
        <p>Your portrait begins with what you choose to share.</p>
      )}
      <a className="inline-block py-3 underline text-sm" href="/onboarding">
        Edit your baseline answers
      </a>
    </section>
  );
}
