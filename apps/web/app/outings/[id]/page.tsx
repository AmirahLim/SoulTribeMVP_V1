'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IllustratedGround, SeatRow, Button } from '@soul-tribe/ui';
import { MapPin, Calendar, Clock, ArrowLeft, Check } from 'lucide-react';

export default function OutingDetailPage() {
  const router = useRouter();
  const [joined, setJoined] = useState(false);

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 flex items-center text-[13.5px] font-semibold text-[#A6AAA4] hover:text-[#F3F0E9]"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
      </button>

      {/* Top Location Vignette Header */}
      <div className="relative h-44 w-full overflow-hidden rounded-[24px] bg-[#15261C] border border-[#F3F0E9]/12 shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80"
          alt="Pottery"
          className="h-full w-full object-cover opacity-70"
        />

        <div className="absolute top-4 left-4 rounded-full bg-[#0D1D15]/90 px-3 py-1 text-[11px] font-bold tracking-widest text-[#F3F0E9] uppercase backdrop-blur-sm">
          Tiong Bahru · Singapore
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <span className="rounded-full bg-[#0D1D15] border border-[#F3F0E9]/20 px-3.5 py-1 text-[12px] font-bold text-[#F3F0E9]">
            Confirmed Outing
          </span>
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            alt="Marcus"
            className="h-11 w-11 rounded-full border-2 border-[#F3F0E9] object-cover shadow-sm"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div className="border-b border-[#F3F0E9]/12 pb-4">
          <span className="text-[12px] font-semibold text-[#A6AAA4]">
            Pitched by <strong className="text-[#F3F0E9]">Marcus Tan</strong>
          </span>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight text-[#F3F0E9]">
            Saturday Pottery & Filter Coffee
          </h1>
        </div>

        <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg flex flex-col gap-3">
          <div className="flex items-center text-[13.5px] text-[#F3F0E9]">
            <Calendar className="mr-2 h-4 w-4 text-[#8F998D]" /> Saturday, 14 Sep 2026
          </div>
          <div className="flex items-center text-[13.5px] text-[#F3F0E9]">
            <Clock className="mr-2 h-4 w-4 text-[#8F998D]" /> 3:00pm – 5:30pm (2.5 hrs)
          </div>
          <div className="flex items-center text-[13.5px] text-[#F3F0E9]">
            <MapPin className="mr-2 h-4 w-4 text-[#8F998D]" /> Tiong Bahru Studios & Forty Hands
          </div>
        </div>

        <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg">
          <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
            Host Pitch
          </span>
          <p className="mt-2 text-[14px] leading-relaxed text-[#F3F0E9]">
            Let's spend two hours throwing clay at Tiong Bahru Studios, followed by a quiet filter coffee to talk properly. No loud music, just good conversation.
          </p>
        </div>

        <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
              Seat Roster (Max 6)
            </span>
            <span className="text-[12px] font-bold text-[#F3F0E9]">4 / 6 Seats Filled</span>
          </div>
          <SeatRow seatsTotal={6} seatsFilled={joined ? 5 : 4} className="mt-3" />
        </div>

        {!joined ? (
          <Button variant="primary" size="lg" className="w-full" onClick={() => setJoined(true)}>
            Reserve My Seat in this Outing
          </Button>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#15261C] border border-[#F3F0E9]/20 p-4 text-center text-[#F3F0E9]">
            <span className="flex items-center text-[15px] font-bold">
              <Check className="mr-1.5 h-5 w-5" /> Seat Reserved!
            </span>
            <p className="mt-1 text-[12.5px] opacity-90">
              Host details & group chat link have been unlocked for you.
            </p>
          </div>
        )}
      </div>
    </IllustratedGround>
  );
}
