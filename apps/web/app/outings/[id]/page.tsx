'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IllustratedGround, SeatRow, Button } from '@soul-tribe/ui';
import { MapPin, Calendar, Clock, ArrowLeft, Check, ExternalLink } from 'lucide-react';

export default function OutingDetailPage() {
  const router = useRouter();
  const [joined, setJoined] = useState(false);

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 flex items-center text-[14px] font-medium text-[#5C4E44] hover:text-[#2B211B]"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
      </button>

      {/* Top Location Vignette Header */}
      <div className="relative h-44 w-full overflow-hidden rounded-[28px] bg-[#EDF2F0] shadow-sm">
        <svg className="absolute inset-0 h-full w-full opacity-35" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 120 Q 150 40, 350 100 T 700 60" fill="none" stroke="#3E6B5C" strokeWidth="2.5" />
          <path d="M 0 160 Q 200 80, 450 140 T 800 90" fill="none" stroke="#A9C9D6" strokeWidth="3" />
        </svg>

        <div className="absolute top-4 left-4 rounded-[999px] bg-[#FFFDFA]/90 px-3.5 py-1 text-[11px] font-semibold tracking-wider text-[#3E6B5C] uppercase backdrop-blur-sm">
          Tiong Bahru · Singapore
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <span className="rounded-[999px] bg-[#FFFDFA]/90 px-3 py-1 text-[12px] font-semibold text-[#2B211B]">
            Confirmed Outing
          </span>
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            alt="Marcus"
            className="h-12 w-12 rounded-full border-2 border-[#FFFDFA] object-cover shadow-sm"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div>
          <span className="text-[12px] font-medium text-[#8A7D73]">
            Pitched by <strong className="text-[#2B211B]">Marcus Tan</strong>
          </span>
          <h1
            className="mt-1 text-[32px] font-semibold leading-[38px] text-[#2B211B]"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Saturday Pottery & Filter Coffee
          </h1>
        </div>

        {/* The Host's Pitch in their own words */}
        <div className="rounded-[20px] border border-[#2B211B]/10 bg-[#FFFDFA] p-5 shadow-sm">
          <p className="text-[16px] leading-[25px] text-[#5C4E44] italic">
            "Let's spend two hours throwing clay at Tiong Bahru Studios, followed by a quiet filter coffee to talk properly."
          </p>
        </div>

        {/* Practical Fact Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[16px] bg-[#F5EDE1] p-3 text-center">
            <span className="text-[11px] font-semibold text-[#8A7D73] uppercase">When</span>
            <p className="mt-0.5 text-[14px] font-medium text-[#2B211B]">Sat 14 Sep, 3pm</p>
          </div>
          <div className="rounded-[16px] bg-[#F5EDE1] p-3 text-center">
            <span className="text-[11px] font-semibold text-[#8A7D73] uppercase">Where</span>
            <p className="mt-0.5 text-[14px] font-medium text-[#2B211B]">Tiong Bahru</p>
          </div>
          <div className="rounded-[16px] bg-[#F5EDE1] p-3 text-center">
            <span className="text-[11px] font-semibold text-[#8A7D73] uppercase">Budget</span>
            <p className="mt-0.5 text-[14px] font-medium text-[#2B211B]">$20–50</p>
          </div>
          <div className="rounded-[16px] bg-[#F5EDE1] p-3 text-center">
            <span className="text-[11px] font-semibold text-[#8A7D73] uppercase">Shape</span>
            <p className="mt-0.5 text-[14px] font-medium text-[#2B211B]">Conv-first</p>
          </div>
        </div>

        {/* Confirmed Guest List & Chair Glyphs */}
        <div className="rounded-[24px] border border-[#2B211B]/10 bg-[#FFFDFA] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2
              className="text-[20px] font-semibold text-[#2B211B]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              Who's Coming
            </h2>
            <SeatRow totalSeats={6} filledSeats={4} />
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {[
              { name: 'Marcus (Host)', area: 'Tiong Bahru', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', reason: 'Pitched the pottery workshop' },
              { name: 'Priya', area: 'Tiong Bahru', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', reason: 'Loves specialty coffee and ceramic craft' },
              { name: 'Maya', area: 'Bishan', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', reason: 'High interest in hands-on pottery' },
              { name: 'Chen', area: 'Katong', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', reason: 'Enjoys low-key weekend afternoon catch-ups' },
            ].map((guest, i) => (
              <div key={i} className="flex items-center gap-3 rounded-[16px] bg-[#FCF8F3] p-3">
                <img src={guest.avatar} alt={guest.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-[14px] font-semibold text-[#2B211B]">{guest.name}</h4>
                  <p className="text-[12px] text-[#8A7D73]">{guest.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Join / Accept CTA */}
        {!joined ? (
          <Button variant="primary" size="lg" className="w-full" onClick={() => setJoined(true)}>
            Accept Invitation & Join Outing
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-[20px] bg-[#3E6B5C]/15 p-4 text-center">
            <div className="flex items-center text-[15px] font-semibold text-[#3E6B5C]">
              <Check className="mr-1.5 h-5 w-5" /> You are confirmed for this outing!
            </div>

            {/* Coordination Chat Hand-off */}
            <button
              type="button"
              onClick={() => alert('Opening group chat hand-off in WhatsApp / Telegram...')}
              className="inline-flex items-center text-[13px] font-semibold text-[#D9663F] hover:underline"
            >
              Open external group chat <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </IllustratedGround>
  );
}
