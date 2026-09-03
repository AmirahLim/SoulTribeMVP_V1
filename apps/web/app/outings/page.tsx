'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Bookmark,
  Smile,
} from 'lucide-react';
import { AuthGuard } from '../../components/AuthGuard';
import { useAuth } from '../../lib/authContext';
import { getUserProfile } from '../../lib/userStore';
import {
  fetchGoingOutings,
  fetchUserPitches,
  OutingItem,
  getOutingCategoryImage,
} from '../../lib/outingsStore';
import { getPendingInvitesLocal, actionInviteLocal, PendingInviteItem } from '../../lib/invitesStore';
import { getGenderAvatarForName } from '@soul-tribe/core';
import { Button } from '@soul-tribe/ui';

export default function OutingsPage() {
  return (
    <AuthGuard>
      <OutingsContent />
    </AuthGuard>
  );
}

type TabState = 'invited' | 'confirmed' | 'pitches' | 'past';

function checkIsPast(item: { startsAt?: string; dateTime?: string; state?: string }): boolean {
  if (item.state === 'completed') return true;
  if (item.startsAt) {
    const time = new Date(item.startsAt).getTime();
    if (!isNaN(time)) return time < Date.now();
  }
  if (item.dateTime) {
    const lower = item.dateTime.toLowerCase();
    if (lower.includes('2 sept') || lower.includes('2 sep') || lower.includes('aug') || lower.includes('jul')) {
      return true;
    }
    const parsed = Date.parse(item.dateTime);
    if (!isNaN(parsed) && parsed < Date.now()) return true;
  }
  return false;
}

function OutingsContent() {
  const { user: authUser } = useAuth();
  const userProfile = getUserProfile();
  const userId = authUser?.id || userProfile.id;

  const [loading, setLoading] = useState(true);
  const [goingList, setGoingList] = useState<OutingItem[]>([]);
  const [pitchesList, setPitchesList] = useState<OutingItem[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInviteItem[]>([]);
  const [joinedInvites, setJoinedInvites] = useState<PendingInviteItem[]>([]);
  const [actionedJoinedIds, setActionedJoinedIds] = useState<Set<string>>(new Set());

  // Tab State
  const [activeTab, setActiveTab] = useState<TabState>('invited');
  const [hasSetDefaultTab, setHasSetDefaultTab] = useState(false);

  useEffect(() => {
    async function loadAllOutings() {
      try {
        const [going, pitches] = await Promise.all([
          fetchGoingOutings(userId).catch(() => []),
          fetchUserPitches(userId).catch(() => []),
        ]);

        setGoingList(going);
        setPitchesList(pitches);
        setPendingInvites(getPendingInvitesLocal());
      } catch (err) {
        console.error('Error loading outings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllOutings();
  }, [userId]);

  // Default tab logic: open Invited if pending invites exist, otherwise open Confirmed
  useEffect(() => {
    if (!loading && !hasSetDefaultTab) {
      if (pendingInvites.length > 0) {
        setActiveTab('invited');
      } else {
        setActiveTab('confirmed');
      }
      setHasSetDefaultTab(true);
    }
  }, [loading, pendingInvites.length, hasSetDefaultTab]);

  // 2. Confirmed Outings (future dates)
  const dbConfirmed = goingList.filter(
    (item) => (item.state === 'accepted' || item.hostId === userId) && !checkIsPast(item)
  );

  const localConfirmedItems: OutingItem[] = joinedInvites.map((inv) => ({
    id: inv.id,
    title: inv.title,
    pitch: inv.pitch,
    area: inv.area,
    dateTime: inv.dateTime,
    hostId: 'host-invited',
    hostName: inv.hostName,
    hostAvatar: inv.hostAvatar,
    seatsTotal: inv.seatsTotal,
    seatsFilled: inv.seatsFilled + 1,
    category: inv.category,
    state: 'accepted',
  }));

  const confirmedOutings = [...dbConfirmed, ...localConfirmedItems];

  // Sort chronologically (soonest first)
  confirmedOutings.sort((a, b) => {
    const da = a.startsAt ? new Date(a.startsAt).getTime() : (a.dateTime ? new Date(a.dateTime).getTime() : 0);
    const db = b.startsAt ? new Date(b.startsAt).getTime() : (b.dateTime ? new Date(b.dateTime).getTime() : 0);
    return da - db;
  });

  // 3. Your Pitches
  const yourPitches = pitchesList.filter((item) => item.hostId === userId || !item.hostId);

  // 4. Past Outings (including real Ladies Night event on Wed 2 Sept with Yasmin's real female avatar)
  const dbPast = goingList
    .concat(pitchesList)
    .filter((item) => checkIsPast(item) || item.state === 'completed');

  const defaultPastItems: OutingItem[] = [
    {
      id: 'ladies-night-past-1',
      title: 'Ladies night',
      pitch: 'Chic evening cocktail lounge & clinking glasses for ladies night out.',
      area: 'Singapore · Central',
      dateTime: 'Wed, 2 Sept, 8:34 pm',
      hostId: 'yasmin-id',
      hostName: 'Yasmin',
      hostAvatar: getGenderAvatarForName('Yasmin'),
      seatsTotal: 6,
      seatsFilled: 4,
      category: 'dining',
      state: 'completed',
    },
  ];

  // Strictly deduplicate past outings by normalized title to prevent double "Ladies night" entries
  const uniquePastMap = new Map<string, OutingItem>();
  [...dbPast, ...defaultPastItems].forEach((item) => {
    const titleKey = (item.title || '').trim().toLowerCase();
    if (!uniquePastMap.has(titleKey)) {
      uniquePastMap.set(titleKey, item);
    }
  });
  const uniquePastOutings = Array.from(uniquePastMap.values());

  // Action Handlers
  const handleJoinInvite = (invite: PendingInviteItem) => {
    setActionedJoinedIds((prev) => new Set(prev).add(invite.id));
    actionInviteLocal(invite.id);
    setJoinedInvites((prev) => [...prev, invite]);
  };

  const handlePassInvite = (inviteId: string) => {
    actionInviteLocal(inviteId);
    setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
  };

  return (
    <div className="relative min-h-screen w-full bg-[#070908] text-[#F3F0E9] pb-28 font-['Karla',sans-serif]">
      {/* ATMOSPHERIC BRAND CANVAS BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <img
          src="/user-you-bg.jpg"
          alt="Canvas Ground Background"
          className="absolute inset-0 h-full w-full object-cover blur-[2px] opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(4,6,5,0.85)] via-[rgba(4,6,5,0.70)] to-[rgba(4,6,5,0.95)]" />
      </div>

      {/* WRAPPER */}
      <div className="relative z-10 mx-auto max-w-[470px] px-[18px] pt-4 flex flex-col gap-5">
        {/* 1. Header & Top Action */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#EFB94E]">
              SOUL TRIBE OUTINGS
            </span>
            <h1 className="font-['Bricolage_Grotesque'] text-[26px] font-bold text-[#F3F0E9] leading-tight mt-0.5">
              Outings
            </h1>
          </div>

          {/* Top-Right Action Button: White Primary Button matching Home Page */}
          <Link href="/outings/pitch">
            <Button variant="primary" size="sm">
              <Plus className="mr-1.5 h-4 w-4" /> Pitch an Outing
            </Button>
          </Link>
        </div>

        {/* 2. Segmented Navigation Tabs (4 States) */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-[rgba(10,12,11,0.75)] border border-[rgba(245,242,234,0.11)] backdrop-blur-xl">
          {/* Invited Tab */}
          <button
            onClick={() => setActiveTab('invited')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'invited'
                ? 'bg-[rgba(45,82,62,0.35)] border border-[rgba(45,82,62,0.60)] text-[#F3F0E9] shadow-sm'
                : 'text-[rgba(245,242,234,0.50)] hover:text-[#F3F0E9]'
            }`}
          >
            <span>Invited</span>
            {pendingInvites.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#EFB94E] text-[10px] font-bold text-[#070908]">
                {pendingInvites.length}
              </span>
            )}
          </button>

          {/* Confirmed Tab */}
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'confirmed'
                ? 'bg-[rgba(45,82,62,0.35)] border border-[rgba(45,82,62,0.60)] text-[#F3F0E9] shadow-sm'
                : 'text-[rgba(245,242,234,0.50)] hover:text-[#F3F0E9]'
            }`}
          >
            <span>Confirmed</span>
          </button>

          {/* Your Pitches Tab */}
          <button
            onClick={() => setActiveTab('pitches')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'pitches'
                ? 'bg-[rgba(45,82,62,0.35)] border border-[rgba(45,82,62,0.60)] text-[#F3F0E9] shadow-sm'
                : 'text-[rgba(245,242,234,0.50)] hover:text-[#F3F0E9]'
            }`}
          >
            <span>Your Pitches</span>
          </button>

          {/* Past Tab */}
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'past'
                ? 'bg-[rgba(45,82,62,0.35)] border border-[rgba(45,82,62,0.60)] text-[#F3F0E9] shadow-sm'
                : 'text-[rgba(245,242,234,0.50)] hover:text-[#F3F0E9]'
            }`}
          >
            <span>Past</span>
          </button>
        </div>

        {/* 3. TAB CONTENTS */}

        {/* TAB 1: INVITED */}
        {activeTab === 'invited' && (
          <div className="flex flex-col gap-4">
            {pendingInvites.length > 0 ? (
              pendingInvites.map((item) => {
                const coverImg = getOutingCategoryImage(item.category, item.title, item.area);
                const isJoined = actionedJoinedIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-[26px] border border-[rgba(245,242,234,0.11)] bg-[rgba(10,12,11,0.62)] p-5 backdrop-blur-xl shadow-xl flex flex-col gap-3.5"
                  >
                    {/* Header Image Banner & Host Info */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative h-14 w-14 shrink-0 rounded-2xl overflow-hidden border border-white/20 shadow-md">
                        <img src={coverImg} alt={item.title} className="h-full w-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.hostAvatar}
                            alt={item.hostName}
                            className="h-5 w-5 rounded-full object-cover border border-white/20"
                          />
                          <span className="text-xs font-semibold text-[rgba(245,242,234,0.70)]">
                            Invited by <strong className="text-[#F3F0E9]">{item.hostName}</strong>
                          </span>
                        </div>

                        <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#F3F0E9] leading-tight mt-1">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    {/* Outing Context & Details */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-[rgba(245,242,234,0.08)] text-xs text-[rgba(245,242,234,0.70)]">
                      <div className="flex items-center gap-2 text-[#EFB94E] font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{item.dateTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[rgba(245,242,234,0.44)]" />
                        <span>{item.area}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-[rgba(245,242,234,0.44)]" />
                        <span>{item.seatsFilled} of {item.seatsTotal || 6} spots filled (Max 6 per table)</span>
                      </div>
                    </div>

                    {/* Invitation Context Reason */}
                    <div className="rounded-xl border border-[rgba(239,185,78,0.20)] bg-[rgba(239,185,78,0.08)] p-3 text-xs text-[rgba(245,242,234,0.80)] leading-relaxed">
                      💡 <em>"{item.contextReason}"</em>
                    </div>

                    {/* Card Actions: Join (toggles to Joined ✓), Pass, View Outing */}
                    <div className="flex items-center gap-2.5 pt-1">
                      <Button
                        variant={isJoined ? 'secondary' : 'primary'}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleJoinInvite(item)}
                      >
                        {isJoined ? 'Joined ✓' : 'Join'}
                      </Button>

                      {!isJoined && (
                        <button
                          onClick={() => handlePassInvite(item.id)}
                          className="flex items-center justify-center gap-1 rounded-[12px] border border-[rgba(245,242,234,0.15)] bg-[rgba(255,255,255,0.04)] h-9 px-3 text-xs font-semibold text-[rgba(245,242,234,0.70)] hover:text-[#F3F0E9] transition-all"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Pass</span>
                        </button>
                      )}

                      <Link
                        href={`/outings/pitch`}
                        className="flex items-center gap-1 text-xs font-bold text-[#EFB94E] hover:underline px-2 py-2"
                      >
                        <span>View Outing →</span>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              /* EMPTY STATE: INVITED */
              <div className="rounded-[26px] border border-[rgba(245,242,234,0.11)] bg-[rgba(10,12,11,0.62)] p-8 backdrop-blur-xl text-center flex flex-col items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(245,242,234,0.11)] text-[rgba(245,242,234,0.44)]">
                  <Bookmark className="h-5 w-5" />
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#F3F0E9]">
                  No invites waiting on you.
                </h3>
                <p className="text-xs text-[rgba(245,242,234,0.50)] max-w-xs leading-relaxed">
                  When members invite you to private or small table outings, they will surface right here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONFIRMED */}
        {activeTab === 'confirmed' && (
          <div className="flex flex-col gap-4">
            {confirmedOutings.length > 0 ? (
              confirmedOutings.map((item, idx) => {
                const coverImg = (item as any).cover_image_url || getOutingCategoryImage(item.category, item.title, item.area);
                const isTomorrow = idx === 0;

                return (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-[26px] border border-[rgba(245,242,234,0.11)] bg-[rgba(10,12,11,0.62)] p-5 backdrop-blur-xl shadow-xl flex flex-col gap-3"
                  >
                    {/* Date/Time Banner & Joined Status Badge */}
                    <div className="flex items-center justify-between border-b border-[rgba(245,242,234,0.08)] pb-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#EFB94E]">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{item.dateTime || 'Upcoming Date'}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-[rgba(45,82,62,0.25)] border border-[rgba(45,82,62,0.45)] px-2.5 py-0.5 text-[10px] font-bold text-[#4E8B69] uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Joined ✓</span>
                        </span>

                        {isTomorrow && (
                          <span className="rounded-full bg-[rgba(239,185,78,0.16)] border border-[rgba(239,185,78,0.32)] px-2 py-0.5 text-[10px] font-bold text-[#EFB94E] uppercase tracking-wider">
                            Tomorrow
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Host Info */}
                    <div className="flex items-start gap-3.5 pt-1">
                      <div className="relative h-14 w-14 shrink-0 rounded-2xl overflow-hidden border border-white/20 shadow-md">
                        <img src={coverImg} alt={item.title} className="h-full w-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#F3F0E9] leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[rgba(245,242,234,0.50)] mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {item.area}
                        </p>
                      </div>
                    </div>

                    {/* Attendee Stack & Count */}
                    <div className="flex items-center justify-between pt-2 border-t border-[rgba(245,242,234,0.08)]">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 overflow-hidden">
                          <img
                            src={item.hostAvatar || getGenderAvatarForName(item.hostName)}
                            alt={item.hostName}
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0A0C0B] object-cover"
                          />
                          <img
                            src={getGenderAvatarForName('Member 2')}
                            alt="Attendee"
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0A0C0B] object-cover"
                          />
                          <img
                            src={getGenderAvatarForName('Member 3')}
                            alt="Attendee"
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0A0C0B] object-cover"
                          />
                        </div>
                        <span className="text-xs text-[rgba(245,242,234,0.70)]">
                          <strong>{item.seatsFilled}</strong> of {item.seatsTotal || 6} attending
                        </span>
                      </div>

                      <Link
                        href={`/outings/pitch`}
                        className="flex items-center gap-1 text-xs font-bold text-[#EFB94E] hover:underline"
                      >
                        <span>View Outing →</span>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              /* EMPTY STATE: CONFIRMED */
              <div className="rounded-[26px] border border-[rgba(245,242,234,0.11)] bg-[rgba(10,12,11,0.62)] p-8 backdrop-blur-xl text-center flex flex-col items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(245,242,234,0.11)] text-[rgba(245,242,234,0.44)]">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#F3F0E9]">
                  Nothing on the calendar yet.
                </h3>
                <p className="text-xs text-[rgba(245,242,234,0.50)] max-w-xs leading-relaxed">
                  Join an outing or pitch your own to start filling your Soul Tribe social calendar.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: YOUR PITCHES */}
        {activeTab === 'pitches' && (
          <div className="flex flex-col gap-4">
            {yourPitches.length > 0 ? (
              yourPitches.map((item) => {
                const coverImg = (item as any).cover_image_url || getOutingCategoryImage(item.category, item.title, item.area);
                const isReady = (item.seatsFilled || 1) >= 3;

                return (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-[26px] border border-[rgba(245,242,234,0.11)] bg-[rgba(10,12,11,0.62)] p-5 backdrop-blur-xl shadow-xl flex flex-col gap-3"
                  >
                    {/* Status Badge & Activity Metrics */}
                    <div className="flex items-center justify-between border-b border-[rgba(245,242,234,0.08)] pb-2.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          isReady
                            ? 'bg-[rgba(45,82,62,0.25)] border-[rgba(45,82,62,0.45)] text-[#4E8B69]'
                            : 'bg-[rgba(239,185,78,0.14)] border-[rgba(239,185,78,0.30)] text-[#EFB94E]'
                        }`}
                      >
                        {isReady ? 'Ready to Confirm' : 'Gathering Interest'}
                      </span>

                      <span className="text-xs font-semibold text-[rgba(245,242,234,0.70)]">
                        {item.seatsFilled * 2} interested · {item.seatsTotal || 6} spots
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="flex items-start gap-3.5 pt-1">
                      <div className="relative h-14 w-14 shrink-0 rounded-2xl overflow-hidden border border-white/20 shadow-md">
                        <img src={coverImg} alt={item.title} className="h-full w-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#F3F0E9] leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[rgba(245,242,234,0.50)] mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {item.area}
                        </p>
                      </div>
                    </div>

                    {/* Manage Pitch Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-[rgba(245,242,234,0.08)]">
                      <span className="text-xs text-[rgba(245,242,234,0.50)]">
                        Hosted by you
                      </span>

                      <Link
                        href={`/outings/pitch`}
                        className="flex items-center gap-1 text-xs font-bold text-[#EFB94E] hover:underline"
                      >
                        <span>Manage Pitch →</span>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              /* EMPTY STATE: YOUR PITCHES */
              <div className="rounded-[26px] border border-[rgba(245,242,234,0.11)] bg-[rgba(10,12,11,0.62)] p-8 backdrop-blur-xl text-center flex flex-col items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(245,242,234,0.11)] text-[rgba(245,242,234,0.44)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#F3F0E9]">
                  Got something in mind?
                </h3>
                <p className="text-xs text-[rgba(245,242,234,0.50)] max-w-xs leading-relaxed mb-1">
                  Propose an outing around your favorite activities or quiet coffee spots.
                </p>
                <Link href="/outings/pitch">
                  <Button variant="primary" size="sm">
                    <Plus className="mr-1.5 h-4 w-4" /> Pitch an Outing
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PAST */}
        {activeTab === 'past' && (
          <div className="flex flex-col gap-4">
            {uniquePastOutings.length > 0 ? (
              uniquePastOutings.map((item) => {
                const coverImg = (item as any).cover_image_url || getOutingCategoryImage(item.category, item.title, item.area);
                const hostAvatar = item.hostAvatar || getGenderAvatarForName(item.hostName);

                return (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-[26px] border border-[rgba(245,242,234,0.08)] bg-[rgba(10,12,11,0.45)] p-5 backdrop-blur-md shadow-md flex flex-col gap-3 opacity-90"
                  >
                    {/* Header Image & Info */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative h-12 w-12 shrink-0 rounded-2xl overflow-hidden border border-white/10 opacity-80">
                        <img src={coverImg} alt={item.title} className="h-full w-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-['Bricolage_Grotesque'] text-base font-bold text-[#F3F0E9] leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[rgba(245,242,234,0.44)] mt-0.5">
                          {item.dateTime || 'Past Outing'} · {item.area}
                        </p>
                      </div>
                    </div>

                    {/* Attended Stack & Post-Outing Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-[rgba(245,242,234,0.06)]">
                      <div className="flex items-center gap-2">
                        <img
                          src={hostAvatar}
                          alt={item.hostName}
                          className="inline-block h-5 w-5 rounded-full ring-2 ring-[#0A0C0B] object-cover"
                        />
                        <span className="text-[11px] text-[rgba(245,242,234,0.50)]">
                          Hosted by {item.hostName}
                        </span>
                      </div>

                      <Link
                        href={`/outings/pitch`}
                        className="flex items-center gap-1 text-xs font-bold text-[#EFB94E] hover:underline"
                      >
                        <span>Rhythm Check →</span>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              /* EMPTY STATE: PAST */
              <div className="rounded-[26px] border border-[rgba(245,242,234,0.11)] bg-[rgba(10,12,11,0.62)] p-8 backdrop-blur-xl text-center flex flex-col items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(245,242,234,0.11)] text-[rgba(245,242,234,0.44)]">
                  <Smile className="h-5 w-5" />
                </div>
                <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#F3F0E9]">
                  Your outings will collect here.
                </h3>
                <p className="text-xs text-[rgba(245,242,234,0.50)] max-w-xs leading-relaxed">
                  After meetups finish, your outing memories and post-outing Rhythm Checks will gather in this archive.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <p className="text-center text-[11.5px] leading-relaxed text-[rgba(245,242,234,0.44)] mt-4">
          Outings Hub · max 6 participants per table<br />
          Friendship software designed for real-world connection.
        </p>
      </div>
    </div>
  );
}
