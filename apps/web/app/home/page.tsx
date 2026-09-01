'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PitchCard, Button, ResonanceRead } from '@soul-tribe/ui';
import { getRankedMatches, RankedMatch, countRealMembers, isSmallCommunityMode } from '../../lib/matching';
import { fetchGoingOutings, fetchRadarOutings, OutingItem } from '../../lib/outingsStore';
import { motion } from 'framer-motion';
import { Plus, Users, MapPin, Calendar, CheckCircle2, Sparkles, Compass, AlertCircle } from 'lucide-react';
import { getUserProfile, setUserProfile, UserProfileData, getUserPitches, PitchedOuting, DEFAULT_PITCHES, DEFAULT_USER_PROFILE } from '../../lib/userStore';
import { useAuth } from '../../lib/authContext';
import { getSupabaseBrowserClient } from '../../lib/supabase';
import { AuthGuard } from '../../components/AuthGuard';

export default function HomeDashboardPage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}

function HomeContent() {
  const { user, isSupabaseConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState<'matches' | 'pitches' | 'going' | 'radar'>('matches');
  const [profile, setProfileState] = useState<UserProfileData>(DEFAULT_USER_PROFILE);

  // Dynamic Tab Data State
  const [matches, setMatches] = useState<RankedMatch[]>([]);
  const [pitches, setPitches] = useState<PitchedOuting[]>([]);
  const [goingOutings, setGoingOutings] = useState<OutingItem[]>([]);
  const [radarOutings, setRadarOutings] = useState<OutingItem[]>([]);
  const [isSmallCommunity, setIsSmallCommunity] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);
  const [radarJoined, setRadarJoined] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        let userProf = getUserProfile();

        if (user?.id && isSupabaseConfigured) {
          try {
            const client = getSupabaseBrowserClient();
            const { data: remoteProfile } = await client
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();

            if (remoteProfile) {
              userProf = setUserProfile({
                ...userProf,
                displayName: remoteProfile.display_name || userProf.displayName,
                homeArea: remoteProfile.home_area || userProf.homeArea,
                avatarUrl: remoteProfile.avatar_url || userProf.avatarUrl,
                bio: remoteProfile.bio || userProf.bio,
                handle: remoteProfile.handle || userProf.handle,
              });
            } else if (userProf.avatarUrl) {
              await client
                .from('profiles')
                .update({
                  display_name: userProf.displayName,
                  home_area: userProf.homeArea,
                  bio: userProf.bio,
                  avatar_url: userProf.avatarUrl,
                })
                .eq('id', user.id);
            }
          } catch {
            // Ignore DB sync errors
          }
        }

        setProfileState(userProf);

        const userPitchesData = getUserPitches();
        setPitches(userPitchesData);

        const realCount = await countRealMembers(userProf.homeArea || 'Singapore');
        const smallMode = isSmallCommunityMode(realCount);

        const [rankedMatchesData, goingData, radarData] = await Promise.all([
          getRankedMatches(userProf),
          fetchGoingOutings(user?.id),
          fetchRadarOutings(user?.id),
        ]);

        if (cancelled) return;

        setIsSmallCommunity(smallMode);
        setMatches(rankedMatchesData);
        setGoingOutings(goingData);
        setRadarOutings(radarData);
      } catch (err) {
        console.error('Failed to load home dashboard data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleToggleRadarJoin = (id: string) => {
    setRadarJoined((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-[#FFFDF9] pb-24">
      {/* PAGE CANVAS BACKGROUND */}
      <img
        src="/user-home-bg.jpg"
        alt="Home Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-80"
      />

      {/* Dark Ambient Vignette Overlay for Readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/95 z-0 pointer-events-none" />

      {/* PAGE CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-8">
        {/* TOP BAR */}
        <header className="flex items-center justify-between pb-6 border-b border-white/15">
          <div className="flex items-center gap-3">
            <Link href="/you">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-white/30"
              />
            </Link>
            <div>
              <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                {profile.homeArea || 'Singapore'} Cohort
              </span>
              <h1 className="text-[22px] font-extrabold text-white tracking-tight drop-shadow-md">
                Hey, {profile.displayName}
              </h1>
            </div>
          </div>

          <Link href="/outings/pitch">
            <Button variant="primary" size="sm">
              <Plus className="mr-1 h-4 w-4" /> Pitch Outing
            </Button>
          </Link>
        </header>

        {/* EDITORIAL SUMMARY */}
        <section className="py-5 border-b border-white/15">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              Tribal Pass Status
            </span>
            <span className="text-[12px] font-semibold text-white">
              {profile.passCompletionPct}% Complete
            </span>
          </div>

          <p className="mt-2 text-[14.5px] leading-relaxed text-white drop-shadow-sm">
            We’ve learned your social rhythm and communication style. {matches.length > 0 ? `${matches.length} ${matches.length === 1 ? 'person looks' : 'people look'} like a strong fit.` : 'Complete more pass questions to surface matches.'}
          </p>

          {/* Dynamic Hairline Data Points */}
          <div className="mt-3.5 flex items-center gap-5 text-[12.5px] text-white/80">
            <div><strong className="text-white font-bold">{matches.length}</strong> {matches.length === 1 ? 'Match' : 'Matches'}</div>
            <div><strong className="text-white font-bold">{pitches.length}</strong> Pitched</div>
            <div><strong className="text-white font-bold">{goingOutings.length}</strong> Going</div>
            <div><strong className="text-white font-bold">{radarOutings.length}</strong> On Radar</div>
          </div>
        </section>

        {/* SEGMENTED TAB SWITCHER (Matches | Your Pitches | Going | On your radar) */}
        <section className="mt-5">
          <div className="flex border-b border-white/15 overflow-x-auto scrollbar-none gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('matches')}
              className={`pb-3 pr-3 text-[13px] font-semibold transition-all whitespace-nowrap ${
                activeTab === 'matches'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Matches ({matches.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pitches')}
              className={`px-3 pb-3 text-[13px] font-semibold transition-all whitespace-nowrap ${
                activeTab === 'pitches'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Your Pitches ({pitches.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('going')}
              className={`px-3 pb-3 text-[13px] font-semibold transition-all whitespace-nowrap ${
                activeTab === 'going'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Going ({goingOutings.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={`px-3 pb-3 text-[13px] font-semibold transition-all text-left leading-tight ${
                activeTab === 'radar'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              On your<br />Radar ({radarOutings.length})
            </button>
          </div>
        </section>

        {/* TAB 1: MATCHES */}
        {activeTab === 'matches' && (
          <section className="mt-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                  Matched Connections
                </span>
                <h3 className="text-[18px] font-bold text-white">
                  People Matched With You
                </h3>
              </div>
              <span className="text-[12px] text-white/70">{matches.length} {matches.length === 1 ? 'Match' : 'Matches'}</span>
            </div>

            {loading ? (
              <div className="p-8 text-center rounded-[24px] border border-white/20 bg-black/60 backdrop-blur-xl">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto" />
                <p className="mt-3 text-[13px] text-white/70">Calculating matches...</p>
              </div>
            ) : matches.length === 0 ? (
              /* REAL EMPTY STATE FOR MATCHES */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center p-8 rounded-[28px] border border-white/20 bg-black/70 backdrop-blur-xl shadow-2xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white border border-white/20">
                  <Users className="h-7 w-7" />
                </div>
                <h4 className="mt-4 text-[18px] font-extrabold text-white">No Matches Yet</h4>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/75 max-w-[300px]">
                  Complete more of your Social DNA pass so the matching engine can surface intentional compatibility.
                </p>
                <Link href="/you/deeper" className="mt-6">
                  <Button variant="primary" size="sm">
                    <Sparkles className="mr-1.5 h-4 w-4" /> Deepen Your Pass →
                  </Button>
                </Link>
              </motion.div>
            ) : (
              matches.map((person) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[24px] border border-white/20 bg-black/65 backdrop-blur-xl p-5 shadow-2xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <img
                        src={person.avatarUrl}
                        alt={person.name}
                        className="h-12 w-12 rounded-full object-cover ring-1 ring-white/30 shrink-0 mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-[17px] font-bold text-white leading-tight">
                            {person.name}
                          </h3>
                          {person.isDemo && (
                            <span className="shrink-0 rounded-full bg-amber-400 text-black px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
                              Demo
                            </span>
                          )}
                        </div>
                        <p className="text-[12.5px] text-white/80 mt-1">
                          {person.homeArea}
                        </p>
                      </div>
                    </div>

                    {person.fitLabel ? (
                      <span className="shrink-0 whitespace-nowrap text-[12px] font-bold text-white bg-white/20 px-3 py-1 rounded-full border border-white/30 backdrop-blur-md self-start">
                        {person.fitLabel}
                      </span>
                    ) : null}
                  </div>

                  {/* Editorial Resonance Read */}
                  <div className="mt-4 border-t border-white/15 pt-3.5">
                    <ResonanceRead
                      clickText={person.clickText}
                      rubText={person.rubText}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-white/15">
                    <p className="text-[12.5px] text-white/80 line-clamp-2 flex-1 min-w-0 pr-2">
                      {person.bio}
                    </p>

                    <Link href={`/people/${person.id}`} className="shrink-0">
                      <Button variant="secondary" size="sm" className="whitespace-nowrap">
                        View Profile →
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </section>
        )}

        {/* TAB 2: YOUR PITCHES */}
        {activeTab === 'pitches' && (
          <section className="mt-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                  Pitched Proposals
                </span>
                <h3 className="text-[18px] font-bold text-white">
                  Pitches You Sent Out
                </h3>
              </div>

              <Link href="/outings/pitch">
                <Button variant="primary" size="sm">
                  <Plus className="mr-1 h-3.5 w-3.5" /> Pitch New
                </Button>
              </Link>
            </div>

            {pitches.length === 0 ? (
              /* REAL EMPTY STATE FOR YOUR PITCHES */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center p-8 rounded-[28px] border border-white/20 bg-black/70 backdrop-blur-xl shadow-2xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white border border-white/20">
                  <Plus className="h-7 w-7" />
                </div>
                <h4 className="mt-4 text-[18px] font-extrabold text-white">You Haven't Pitched Anything Yet</h4>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/75 max-w-[300px]">
                  Pitch a quiet coffee walk, pottery session, or indie bookshop crawl to gather your cohort.
                </p>
                <Link href="/outings/pitch" className="mt-6">
                  <Button variant="primary" size="sm">
                    <Plus className="mr-1.5 h-4 w-4" /> Pitch an Outing +
                  </Button>
                </Link>
              </motion.div>
            ) : (
              pitches.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-[28px] border border-white/20 bg-black/65 backdrop-blur-xl p-5 shadow-2xl"
                >
                  {/* Header Badge */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                      Your Hosted Pitch
                    </span>
                    <span className="text-[12px] font-bold text-white bg-white/20 px-3 py-1 rounded-full border border-white/30">
                      {item.seatsFilled} / {item.seatsTotal} Seats Filled
                    </span>
                  </div>

                  {/* Title & Pitch */}
                  <h2 className="mt-3 text-[20px] font-extrabold text-white">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-[13.5px] text-white/90 leading-relaxed">
                    “{item.pitch}”
                  </p>

                  {/* Area, Time & Cohesion Readout */}
                  <div className="mt-4 flex items-center justify-between border-t border-b border-white/15 py-3 text-[12.5px] text-white/80">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-white" />
                      <span>{item.area}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-white" />
                      <span>{item.dateTime}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white font-bold">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                      <span>{item.cohesionScore}/100 Cohesion</span>
                    </div>
                  </div>

                  {/* WHO JOINED / GUEST ROSTER */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                        Who Joined ({(item.joinedGuests?.length || 0) + 1} Members)
                      </span>
                      <span className="text-[11.5px] text-white/70">
                        Cap: 6 Seats Max
                      </span>
                    </div>

                    {/* Joined Guests List */}
                    <div className="mt-3 flex flex-col gap-2.5">
                      {/* Host item */}
                      <div className="flex items-center justify-between rounded-[16px] border border-white/20 bg-white/10 p-2.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.hostAvatar}
                            alt={item.hostName}
                            className="h-9 w-9 rounded-full object-cover ring-1 ring-white/30"
                          />
                          <div>
                            <h4 className="text-[13.5px] font-bold text-white flex items-center gap-1.5">
                              {item.hostName}
                              <span className="rounded-full bg-white text-black text-[9.5px] font-extrabold px-1.5 py-0.5 uppercase">You (Host)</span>
                            </h4>
                            <span className="text-[11px] text-white/70">{profile.homeArea} · Organizer</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-white flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" /> Confirmed
                        </span>
                      </div>

                      {/* Guest Items */}
                      {(item.joinedGuests || []).map((guest) => {
                        const isGuestDemo = Boolean(guest.isDemo);
                        return (
                          <div
                            key={guest.id}
                            className="flex items-center justify-between rounded-[16px] border border-white/15 bg-black/40 p-2.5"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={guest.avatarUrl}
                                alt={guest.name}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="text-[13.5px] font-bold text-white flex items-center gap-1.5">
                                  {guest.name}
                                  {isGuestDemo && (
                                    <span className="rounded-full bg-amber-400 text-black px-2 py-0.5 text-[9.5px] font-extrabold uppercase shrink-0 whitespace-nowrap">
                                      Demo
                                    </span>
                                  )}
                                </h4>
                                <span className="text-[11px] text-white/70">
                                  {guest.homeArea} · Joined
                                </span>
                              </div>
                            </div>

                            <span className="text-[11px] font-bold text-white flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-white/80" /> {guest.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </section>
        )}

        {/* TAB 3: GOING (ACCEPTED OUTINGS) */}
        {activeTab === 'going' && (
          <section className="mt-6 flex flex-col gap-5">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                Upcoming Outings
              </span>
              <h3 className="text-[18px] font-bold text-white leading-tight">
                Outings You're<br />Attending
              </h3>
              <p className="mt-1 text-[13px] text-white/70">
                Outings where your seat is confirmed & accepted.
              </p>
            </div>

            {goingOutings.length === 0 ? (
              /* REAL EMPTY STATE FOR GOING */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center p-8 rounded-[28px] border border-white/20 bg-black/70 backdrop-blur-xl shadow-2xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white border border-white/20">
                  <Users className="h-7 w-7" />
                </div>
                <h4 className="mt-4 text-[18px] font-extrabold text-white">No Upcoming Outings Yet</h4>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/75 max-w-[300px]">
                  When you join a pitched outing or accept an invite, your confirmed meetups will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('radar')}
                  className="mt-6 text-[13px] font-bold text-amber-300 hover:underline"
                >
                  Explore On Your Radar →
                </button>
              </motion.div>
            ) : (
              goingOutings.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-[28px] border border-white/20 bg-black/65 backdrop-blur-xl p-5 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300 backdrop-blur-md">
                      ✓ Confirmed Seat
                    </span>
                    <span className="text-[11.5px] font-bold text-white/70">
                      {item.seatsFilled} / {item.seatsTotal} Seats
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[19px] font-extrabold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] text-white/90 leading-relaxed">
                      “{item.pitch}”
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-b border-white/15 py-3 text-[12.5px] text-white/80">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-white" />
                      <span>{item.area}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-white" />
                      <span>{item.dateTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/15">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <img
                        src={item.hostAvatar}
                        alt={item.hostName}
                        className="h-8 w-8 rounded-full object-cover ring-1 ring-white/30 shrink-0"
                      />
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <span className="text-[12px] text-white/80 whitespace-nowrap">Pitched by</span>
                        <span className="text-[12.5px] font-bold text-white whitespace-nowrap">{item.hostName}</span>
                        {Boolean(item.isHostDemo) && (
                          <span className="rounded-full bg-amber-400 text-black px-2 py-0.5 text-[9.5px] font-extrabold uppercase shrink-0 whitespace-nowrap">
                            Demo
                          </span>
                        )}
                      </div>
                    </div>

                    <Link href={`/outings/${item.id}`} className="shrink-0">
                      <Button variant="secondary" size="sm" className="whitespace-nowrap">
                        View Record →
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </section>
        )}

        {/* TAB 4: ON YOUR RADAR */}
        {activeTab === 'radar' && (
          <section className="mt-6 flex flex-col gap-5">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                Curated Recommendations
              </span>
              <h3 className="text-[18px] font-bold text-white leading-tight">
                On your<br />Radar
              </h3>
              <p className="mt-1 text-[13px] text-white/70">
                Suggested pitches and events suited to your social rhythm & interests.
              </p>
            </div>

            {radarOutings.length === 0 ? (
              /* REAL EMPTY STATE FOR RADAR */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center p-8 rounded-[28px] border border-white/20 bg-black/70 backdrop-blur-xl shadow-2xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white border border-white/20">
                  <Compass className="h-7 w-7" />
                </div>
                <h4 className="mt-4 text-[18px] font-extrabold text-white">Nothing On Your Radar Right Now</h4>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/75 max-w-[300px]">
                  New outings pitched by members in Singapore will appear here when posted.
                </p>
                <Link href="/outings/pitch" className="mt-6">
                  <Button variant="primary" size="sm">
                    <Plus className="mr-1.5 h-4 w-4" /> Pitch an Outing +
                  </Button>
                </Link>
              </motion.div>
            ) : (
              radarOutings.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-[28px] border border-white/20 bg-black/65 backdrop-blur-xl p-5 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> {item.fitBadge || 'Recommended Fit'}
                    </span>
                    <span className="text-[11.5px] font-bold text-white/70">
                      {item.seatsFilled} / {item.seatsTotal} Seats
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[19px] font-extrabold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] text-white/90 leading-relaxed">
                      “{item.pitch}”
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-b border-white/15 py-3 text-[12.5px] text-white/80">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-white" />
                      <span>{item.area}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-white" />
                      <span>{item.dateTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/15">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <img
                        src={item.hostAvatar}
                        alt={item.hostName}
                        className="h-8 w-8 rounded-full object-cover ring-1 ring-white/30 shrink-0"
                      />
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <span className="text-[12px] text-white/80 whitespace-nowrap">Pitched by</span>
                        <span className="text-[12.5px] font-bold text-white whitespace-nowrap">{item.hostName}</span>
                        {Boolean(item.isHostDemo) && (
                          <span className="rounded-full bg-amber-400 text-black px-2 py-0.5 text-[9.5px] font-extrabold uppercase shrink-0 whitespace-nowrap">
                            Demo
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant={radarJoined[item.id] ? 'secondary' : 'primary'}
                      size="sm"
                      className="whitespace-nowrap shrink-0"
                      onClick={() => handleToggleRadarJoin(item.id)}
                    >
                      {radarJoined[item.id] ? 'Joined ✓' : 'Join Pitch →'}
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </section>
        )}
      </div>
    </div>
  );
}
