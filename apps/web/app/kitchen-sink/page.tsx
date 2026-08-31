'use client';

import React from 'react';
import {
  IllustratedGround,
  Bloom,
  RhythmStrip,
  ResonanceRead,
  PitchCard,
  EmptyState,
  SeatRow,
  Button,
  Chip,
} from '@soul-tribe/ui';

export default function KitchenSinkPage() {
  const bloomDimensions = [
    { key: 'p', label: 'Personality', strength: 0.8, confidence: 0.9, sentence: 'You recharge in quiet spaces and go deep quickly.' },
    { key: 'c', label: 'Communication', strength: 0.7, confidence: 0.85, sentence: 'You reply within a day and prefer intentional messages.' },
    { key: 'r', label: 'Rhythm', strength: 0.6, confidence: 0.8, sentence: 'You prefer plans made a few days ahead on weekends.' },
    { key: 'i', label: 'Intent', strength: 0.9, confidence: 0.95, sentence: 'You are looking for a small, regular circle of close friends.' },
    { key: 'e', label: 'Emotional', strength: 0.75, confidence: 0.9, sentence: 'You open up gradually and stay loyal once comfortable.' },
    { key: 'int', label: 'Interests', strength: 0.85, confidence: 0.85, sentence: 'You love pottery, specialty coffee, and analog film.' },
    { key: 'v', label: 'Values', strength: 0.7, confidence: 0.8, sentence: 'Personal growth and creativity matter deeply to you.' },
    { key: 'l', label: 'Lifestyle', strength: 0.65, confidence: 0.75, sentence: 'You enjoy quiet dining and $20–50 low-key meetups.' },
  ];

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      <header className="py-6">
        <h1
          className="text-[36px] font-semibold text-[#2B211B]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          Design System Kitchen Sink
        </h1>
        <p className="text-[14px] text-[#5C4E44]">
          M3 verification suite for Soul Tribe UI primitives against 02-design-system.md
        </p>
      </header>

      <div className="flex flex-col gap-10">
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
            theirAvailability={['sat_midday', 'fri_night']}
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
            title="Saturday Pottery & Filter Coffee"
            pitch="Let's spend two hours throwing clay at Tiong Bahru Studios, followed by a quiet filter coffee to talk properly."
            hostName="Marcus Tan"
            hostAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            dateTime="Sat 14 Sep · 3:00pm"
            location="Tiong Bahru"
            budget="$20–50"
            orientation="Conversation-first"
            totalSeats={6}
            filledSeats={4}
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
            <Button variant="clay" size="md">Friction Clay</Button>
            <Button variant="ghost" size="md">Ghost Ink</Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Chip label="Specialty Coffee" selected={true} />
            <Chip label="Pottery & Ceramics" selected={false} />
            <Chip label="Analog Photography" selected={true} />
          </div>
        </section>
      </div>
    </IllustratedGround>
  );
}
