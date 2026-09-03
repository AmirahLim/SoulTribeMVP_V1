'use client';

import React from 'react';
import { Clock, Shield, Users, MapPin, CheckCircle2 } from 'lucide-react';

export interface BoundariesMatchingProps {
  punctualityStance?: string;
  cancellationStance?: string;
  groupSizeBoundary?: string;
  locationBoundary?: string;
  voice?: 'first' | 'third';
  memberName?: string;
  className?: string;
}

export function BoundariesMatching({
  punctualityStance,
  cancellationStance,
  groupSizeBoundary,
  locationBoundary,
  voice = 'first',
  memberName = 'Member',
  className = '',
}: BoundariesMatchingProps) {
  // If no boundary value is provided at all, return null
  const hasAnyBoundary = Boolean(
    punctualityStance || cancellationStance || groupSizeBoundary || locationBoundary
  );
  if (!hasAnyBoundary) return null;

  const isThirdPerson = voice === 'third';
  const name = memberName.trim() || 'This member';

  return (
    <div
      className={`rounded-[26px] p-5 backdrop-blur-xl transition-all ${className}`}
      style={{
        backgroundColor: 'rgba(10,12,11,0.62)',
        border: '1px solid rgba(245,242,234,0.11)',
        boxShadow: '0 22px 48px -26px rgba(0,0,0,0.9), inset 0 1px 0 rgba(245,242,234,0.22)',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[10px] font-bold tracking-widest text-[#4E8B69] uppercase">
          {isThirdPerson ? `${name}'s Boundaries & Principles` : 'Boundaries & Social Principles'}
        </h3>
        <span className="text-[10px] font-bold tracking-wider uppercase text-[#4E8B69] bg-[rgba(45,82,62,0.25)] border border-[rgba(45,82,62,0.45)] px-2.5 py-0.5 rounded-full">
          Shared On Profile
        </span>
      </div>

      <p className="text-xs text-[rgba(245,242,234,0.70)] mb-4">
        {isThirdPerson
          ? `${name} shares clear social expectations for comfortable meetups.`
          : 'Clear social expectations that create predictable, comfortable meetups.'}
      </p>

      {/* Visual Principles Grid — only render cards that have a value */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* 1. Punctuality Stance Card */}
        {punctualityStance && (
          <div className="rounded-xl border border-[rgba(239,185,78,0.25)] bg-[rgba(239,185,78,0.08)] p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Clock className="h-4 w-4 text-[#EFB94E]" />
                <h4 className="text-xs font-bold text-[#EFB94E]">
                  {isThirdPerson ? `${name} on Punctuality` : 'Punctuality Stance'}
                </h4>
              </div>
              <p className="text-xs font-semibold text-[#F5F2EA]">
                {punctualityStance}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="h-1.5 flex-1 rounded-full bg-[#EFB94E]" />
              <span className="h-1.5 flex-1 rounded-full bg-[#EFB94E]" />
              <span className="h-1.5 flex-1 rounded-full bg-[rgba(245,242,234,0.15)]" />
              <span className="h-1.5 flex-1 rounded-full bg-[rgba(245,242,234,0.15)]" />
            </div>
          </div>
        )}

        {/* 2. Cancellation Stance Card */}
        {cancellationStance && (
          <div className="rounded-xl border border-[rgba(45,82,62,0.40)] bg-[rgba(45,82,62,0.20)] p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Shield className="h-4 w-4 text-[#4E8B69]" />
                <h4 className="text-xs font-bold text-[#4E8B69]">
                  {isThirdPerson ? `${name} on Cancellations` : 'Cancellation Stance'}
                </h4>
              </div>
              <p className="text-xs font-semibold text-[#F5F2EA]">
                {cancellationStance}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#4E8B69]" />
              <span className="text-[11px] text-[rgba(245,242,234,0.70)]">Graceful &amp; low pressure</span>
            </div>
          </div>
        )}

        {/* 3. Group Size Boundary Card */}
        {groupSizeBoundary && (
          <div className="rounded-xl border border-[rgba(245,242,234,0.11)] bg-[rgba(255,255,255,0.04)] p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <Users className="h-4 w-4 text-[rgba(245,242,234,0.70)]" />
              <h4 className="text-xs font-bold text-[#F5F2EA]">Table Limit</h4>
            </div>
            <p className="text-xs text-[rgba(245,242,234,0.70)]">
              {groupSizeBoundary}
            </p>
          </div>
        )}

        {/* 4. Geography Boundary Card */}
        {locationBoundary && (
          <div className="rounded-xl border border-[rgba(245,242,234,0.11)] bg-[rgba(255,255,255,0.04)] p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <MapPin className="h-4 w-4 text-[rgba(245,242,234,0.70)]" />
              <h4 className="text-xs font-bold text-[#F5F2EA]">Match Area</h4>
            </div>
            <p className="text-xs text-[rgba(245,242,234,0.70)]">
              {locationBoundary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
