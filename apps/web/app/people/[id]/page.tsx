'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  IllustratedGround,
  ResonanceRead,
  RhythmStrip,
  Bloom,
  Button,
  Chip,
} from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../../supabase/seed/seed';
import { generateMatchExplanation } from '../../../../../packages/core/explain/generator';
import { MapPin, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const personId = params.id as string;

  const currentUser = SYNTHETIC_PROFILES[0]; // Priya
  const person = SYNTHETIC_PROFILES.find((p) => p.profile.id === personId) || SYNTHETIC_PROFILES[1];

  const explanation = generateMatchExplanation(currentUser, person);

  const bloomDimensions = [
    { key: 'p', label: 'Personality', strength: person.personality.openness, confidence: person.profile.confidence, sentence: 'Open to fresh ideas and quiet rabbit holes.' },
    { key: 'c', label: 'Communication', strength: person.communication.contact_frequency_self, confidence: person.profile.confidence, sentence: 'Prefers text check-ins every few days.' },
    { key: 'r', label: 'Rhythm', strength: person.social_rhythm.planning_horizon, confidence: person.profile.confidence, sentence: 'Plans about a week ahead for weekend meetups.' },
    { key: 'i', label: 'Intent', strength: person.intent.depth / 4, confidence: person.profile.confidence, sentence: 'Wants regular, meaningful friendships.' },
    { key: 'e', label: 'Emotional', strength: person.emotional.er_opening_pace, confidence: person.profile.confidence, sentence: 'Takes a few meetings to relax into friendship.' },
    { key: 'int', label: 'Interests', strength: 0.85, confidence: person.profile.confidence, sentence: 'Passionate about specialty coffee and pottery.' },
    { key: 'v', label: 'Values', strength: 0.75, confidence: person.profile.confidence, sentence: 'Values personal growth and creative pursuits.' },
    { key: 'l', label: 'Lifestyle', strength: person.lifestyle.budget_band / 4, confidence: person.profile.confidence, sentence: 'Enjoys $20–50 low-key coffee and dining.' },
  ];

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 flex items-center text-[14px] font-medium text-[#5C4E44] hover:text-[#2B211B]"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to People
      </button>

      {/* Person Header */}
      <section className="flex flex-col items-center text-center">
        <div className="relative">
          <img
            src={person.profile.avatar_url || ''}
            alt={person.profile.display_name}
            className="h-28 w-28 rounded-full object-cover shadow-md ring-4 ring-[#FFFDFA]"
          />
        </div>

        <h1
          className="mt-3 text-[34px] font-semibold text-[#2B211B]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          {person.profile.display_name}
        </h1>

        <div className="mt-1 flex items-center gap-1.5 text-[14px] text-[#8A7D73]">
          <MapPin className="h-4 w-4 text-[#D9663F]" />
          <span>{person.profile.home_area}, Singapore</span>
        </div>

        <p className="mt-3 max-w-[420px] text-[16px] leading-[24px] text-[#5C4E44] italic">
          "{person.profile.bio}"
        </p>
      </section>

      {/* DNA Bloom Overlay Comparison */}
      <section className="mt-8 flex flex-col items-center rounded-[24px] border border-[#2B211B]/10 bg-[#FFFDFA] p-5 shadow-sm">
        <span className="text-[11px] font-semibold tracking-wider text-[#8A7D73] uppercase">
          Friendship DNA Read
        </span>
        <div className="my-2">
          <Bloom dimensions={bloomDimensions} size={200} interactive={true} />
        </div>
      </section>

      {/* RESONANCE READ (Click + Friction) */}
      <section className="mt-8">
        <ResonanceRead
          clickText={explanation.click_text}
          frictionText={explanation.friction_text}
        />
      </section>

      {/* RHYTHM OVERLAY */}
      <section className="mt-8">
        <h2
          className="mb-2 text-[20px] font-semibold text-[#2B211B]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          Schedule & Rhythm Touchpoints
        </h2>
        <RhythmStrip
          userAvailability={currentUser.social_rhythm.availability}
          theirAvailability={person.social_rhythm.availability}
          interactive={false}
        />
        <p className="mt-2 text-center text-[13px] font-medium text-[#3E6B5C]">
          ✨ You're both usually free Sunday afternoons in central Singapore.
        </p>
      </section>

      {/* WHAT THEY'RE UP FOR (Interest Nodes) */}
      <section className="mt-8 rounded-[24px] border border-[#2B211B]/10 bg-[#FFFDFA] p-5 shadow-sm">
        <h2
          className="text-[20px] font-semibold text-[#2B211B]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          What {person.profile.display_name.split(' ')[0]}'s Up For
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {person.interests.map((interest) => (
            <Chip
              key={interest.node_id}
              label={`${interest.node_name} (${interest.affinity === 'curious' ? 'curious to try' : interest.affinity})`}
              selected={interest.affinity === 'curious' || interest.affinity === 'love'}
            />
          ))}
        </div>
      </section>

      {/* PRIMARY ACTIONS */}
      <section className="mt-8 flex flex-col gap-3">
        <Link href={`/outings/pitch?inviteId=${person.profile.id}`}>
          <Button variant="primary" size="lg" className="w-full">
            Pitch something to {person.profile.display_name.split(' ')[0]}
          </Button>
        </Link>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={() => alert('Saved for later')}>
            Save for Later
          </Button>
          <Button variant="ghost" size="md" className="flex-1" onClick={() => router.push('/people')}>
            Not For Me
          </Button>
        </div>

        {/* Safety & Report Spine */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => alert(`Report or Block ${person.profile.display_name}. Block is bidirectional and takes effect immediately.`)}
            className="inline-flex items-center text-[12px] font-medium text-[#8A7D73] hover:text-[#B3453A]"
          >
            <ShieldAlert className="mr-1 h-3.5 w-3.5" /> Report or Block User
          </button>
        </div>
      </section>
    </IllustratedGround>
  );
}
