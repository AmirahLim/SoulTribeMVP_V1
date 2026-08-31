'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  IllustratedGround,
  ResonanceRead,
  Bloom,
  Button,
} from '@soul-tribe/ui';
import { SYNTHETIC_PROFILES } from '../../../../../supabase/seed/seed';
import { generateMatchExplanation } from '../../../../../packages/core/explain/generator';
import { MapPin, ArrowLeft } from 'lucide-react';

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
        className="mb-4 flex items-center text-[13.5px] font-semibold text-[#A6AAA4] hover:text-[#F3F0E9]"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to People
      </button>

      {/* Person Header */}
      <section className="flex flex-col items-center text-center pb-6 border-b border-[#F3F0E9]/12">
        <div className="relative">
          <img
            src={person.profile.avatar_url || ''}
            alt={person.profile.display_name}
            className="h-24 w-24 rounded-full object-cover shadow-lg ring-2 ring-[#F3F0E9]/20"
          />
        </div>

        <h1 className="mt-3 text-[26px] font-bold text-[#F3F0E9] tracking-tight">
          {person.profile.display_name}
        </h1>

        <p className="flex items-center text-[13px] text-[#A6AAA4]">
          <MapPin className="mr-1 h-3.5 w-3.5" /> {person.profile.home_area} · Singapore
        </p>

        <div className="mt-4 flex gap-2">
          <Link href={`/outings/pitch?inviteId=${person.profile.id}`}>
            <Button variant="primary" size="md">
              Invite to Outing
            </Button>
          </Link>
        </div>
      </section>

      {/* Resonance Read */}
      <section className="py-6 border-b border-[#F3F0E9]/12">
        <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
          Match Resonance Read
        </span>
        <div className="mt-3">
          <ResonanceRead
            clickText={explanation.click_text}
            rubText={explanation.rub_text}
          />
        </div>
      </section>

      {/* Friendship DNA */}
      <section className="py-6 flex flex-col items-center">
        <span className="text-[11px] font-bold tracking-widest text-[#A6AAA4] uppercase">
          Friendship DNA Bloom
        </span>
        <div className="my-4">
          <Bloom dimensions={bloomDimensions} size={210} interactive={true} />
        </div>
      </section>
    </IllustratedGround>
  );
}
