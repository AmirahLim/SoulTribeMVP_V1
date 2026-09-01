'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import {
  IllustratedGround,
  Bloom,
  RhythmStrip,
  ResonanceRead,
  PitchCard,
  EmptyState,
  Button,
  Chip,
} from '@soul-tribe/ui';
import { AuthGuard } from '../../components/AuthGuard';

export default function KitchenSinkPage() {
  return (
    <AuthGuard>
      <KitchenSinkContent />
    </AuthGuard>
  );
}

function KitchenSinkContent() {
  const bloomDimensions = [
    { key: 'energy', label: 'Social Energy', strength: 0.8, confidence: 0.9, sentence: 'Prefers small groups' },
    { key: 'size', label: 'Group Size', strength: 0.4, confidence: 0.8, sentence: 'Ideal size is 3 to 4' },
    { key: 'planning', label: 'Planning Horizon', strength: 0.9, confidence: 0.85, sentence: 'Plans days ahead' },
    { key: 'depth', label: 'Conversation Depth', strength: 0.85, confidence: 0.9, sentence: 'Enjoys deep topics' },
    { key: 'activity', label: 'Activity Focus', strength: 0.6, confidence: 0.7, sentence: 'Balanced activities' },
    { key: 'vulnerability', label: 'Vulnerability', strength: 0.75, confidence: 0.8, sentence: 'Opens up steadily' },
    { key: 'frequency', label: 'Frequency', strength: 0.5, confidence: 0.7, sentence: 'Weekly cadence' },
  ];

  return (
    <IllustratedGround variant="paper" className="min-h-screen p-6 pb-24">
      <div className="mx-auto max-w-[600px] space-y-8">
        <div>
          <span className="text-[12px] font-bold tracking-widest text-[#8F998D] uppercase">
            Internal Component Showcase
          </span>
          <h1 className="text-[32px] font-bold text-[#2B211B]">
            Design Primitives Kitchen Sink
          </h1>
          <p className="text-[14px] text-[#5C534E]">
            Living styleguide for Soul Tribe custom components.
          </p>
        </div>

        {/* 1. Bloom */}
        <section className="rounded-[24px] border border-[#2B211B]/10 bg-[#FFFDFA] p-6 shadow-sm">
          <h2 className="mb-4 text-[20px] font-semibold text-[#2B211B]">1. Friendship DNA Bloom</h2>
          <div className="flex justify-center">
            <Bloom dimensions={bloomDimensions} size={240} interactive={true} />
          </div>
        </section>

        {/* 2. Rhythm Strip */}
        <section className="rounded-[24px] border border-[#2B211B]/10 bg-[#FFFDFA] p-6 shadow-sm">
          <h2 className="mb-4 text-[20px] font-semibold text-[#2B211B]">2. Rhythm Strip (7x4 Availability Matrix)</h2>
          <RhythmStrip
            userAvailability={['sat_midday', 'sun_evening']}
            interactive={true}
          />
        </section>

        {/* 3. Resonance Read Card */}
        <section className="rounded-[24px] border border-[#2B211B]/10 bg-[#FFFDFA] p-6 shadow-sm">
          <h2 className="mb-4 text-[20px] font-semibold text-[#2B211B]">3. Resonance Read Card (Mandatory Friction)</h2>
          <ResonanceRead
            clickText="You both want a small circle of close friendships rather than a big social network, and neither of you expects constant texting."
            frictionText="Maya is considerably more spontaneous than you and enjoys larger groups. You tend to prefer plans in advance and groups of three or four."
          />
        </section>

        {/* 4. Pitch Card & Seat Row */}
        <section className="rounded-[24px] border border-[#2B211B]/10 bg-[#FFFDFA] p-6 shadow-sm">
          <h2 className="mb-4 text-[20px] font-semibold text-[#2B211B]">4. Pitch Card & Chair Glyphs</h2>
          <PitchCard
            id="pitch-ks"
            title="Saturday Pottery & Filter Coffee"
            pitch="Let's spend two hours throwing clay at Tiong Bahru Studios, followed by a quiet filter coffee to talk properly."
            hostName="Marcus Tan"
            hostAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            dateTime="Sat 14 Sep · 3:00pm"
            area="Tiong Bahru"
            category="creative"
            orientation="conversation"
            seatsTotal={6}
            seatsFilled={4}
          />
        </section>

        {/* 5. Empty State */}
        <section className="rounded-[24px] border border-[#2B211B]/10 bg-[#FFFDFA] p-6 shadow-sm">
          <h2 className="mb-4 text-[20px] font-semibold text-[#2B211B]">5. Illustrated Empty State</h2>
          <EmptyState
            title="We're reading your rhythm"
            description="Your first few surfaced matches land Thursday. We ensure every match explanation is accurate."
            actionText="Complete Profile Deepening"
            onAction={() => alert('Empty state action triggered')}
          />
        </section>

        {/* 6. Buttons & Chips */}
        <section className="rounded-[24px] border border-[#2B211B]/10 bg-[#FFFDFA] p-6 shadow-sm">
          <h2 className="mb-4 text-[20px] font-semibold text-[#2B211B]">6. Buttons & Chips</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="md">Primary Terracotta</Button>
            <Button variant="secondary" size="md">Secondary Sand</Button>
            <Button variant="ghost" size="md">Ghost Ink</Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Chip label="Specialty Coffee" selected={true} />
            <Chip label="Pottery & Ceramics" selected={false} />
            <Chip label="Quiet Courtyards" selected={true} />
          </div>
        </section>
      </div>
    </IllustratedGround>
  );
}
