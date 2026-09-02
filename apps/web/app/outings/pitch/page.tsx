'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@soul-tribe/ui';
import { Check, AlertTriangle, ArrowLeft, Plus } from 'lucide-react';
import { getUserProfile, PitchedOuting, JoinedGuest, addUserPitch } from '../../../lib/userStore';
import { getRankedMatches, RankedMatch } from '../../../lib/matching';
import { getGenderAvatarForName } from '@soul-tribe/core';
import { checkIsSupabaseConfigured, getSupabaseBrowserClient } from '../../../lib/supabase';
import { useAuth } from '../../../lib/authContext';
import { AuthGuard } from '../../../components/AuthGuard';

function PitchComposerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialInviteId = searchParams.get('inviteId');
  const { user: authUser } = useAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [pitch, setPitch] = useState('');
  const [area, setArea] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = getUserProfile();
      return p.homeArea || '';
    }
    return '';
  });
  const [activityCategory, setActivityCategory] = useState<'coffee' | 'dining' | 'active' | 'cultural' | 'nightlife' | 'creative'>('coffee');
  const [budgetBand, setBudgetBand] = useState<number>(2);
  const [orientation, setOrientation] = useState<'conversation_first' | 'activity_first' | 'either'>('conversation_first');
  const [visibility, setVisibility] = useState<'invite_only' | 'requestable'>('requestable');
  const [startsAt, setStartsAt] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [maxParticipants] = useState<number>(6);
  const [setting, setSetting] = useState<string>('General');

  const [candidates, setCandidates] = useState<RankedMatch[]>([]);
  const [selectedGuests, setSelectedGuests] = useState<RankedMatch[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Suggested Date & Time Generator
  const suggestedDates = React.useMemo(() => {
    const now = new Date();
    const suggestions = [];

    const toLocalIso = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // Fri Eve (7:30 PM)
    const fri = new Date(now);
    const distFri = (5 - fri.getDay() + 7) % 7 || 7;
    fri.setDate(fri.getDate() + distFri);
    fri.setHours(19, 30, 0, 0);
    suggestions.push({
      label: `${fri.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' })} · 7:30 PM`,
      isoValue: toLocalIso(fri),
    });

    // Sat Midday (3:00 PM)
    const satMid = new Date(now);
    const distSat = (6 - satMid.getDay() + 7) % 7 || 7;
    satMid.setDate(satMid.getDate() + distSat);
    satMid.setHours(15, 0, 0, 0);
    suggestions.push({
      label: `${satMid.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' })} · 3:00 PM`,
      isoValue: toLocalIso(satMid),
    });

    // Sat Eve (7:30 PM)
    const satEve = new Date(now);
    satEve.setDate(satEve.getDate() + distSat);
    satEve.setHours(19, 30, 0, 0);
    suggestions.push({
      label: `${satEve.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' })} · 7:30 PM`,
      isoValue: toLocalIso(satEve),
    });

    // Sun Midday (2:00 PM)
    const sunMid = new Date(now);
    const distSun = (0 - sunMid.getDay() + 7) % 7 || 7;
    sunMid.setDate(sunMid.getDate() + distSun);
    sunMid.setHours(14, 0, 0, 0);
    suggestions.push({
      label: `${sunMid.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' })} · 2:00 PM`,
      isoValue: toLocalIso(sunMid),
    });

    return suggestions;
  }, []);

  useEffect(() => {
    async function loadCandidates() {
      const userProfile = getUserProfile();
      const list = await getRankedMatches(userProfile, { limit: 30 });
      setCandidates(list);

      if (initialInviteId) {
        const match = list.find((m) => m.id === initialInviteId);
        if (match) setSelectedGuests([match]);
      } else if (list.length > 0) {
        const maxGuests = maxParticipants - 1;
        setSelectedGuests(list.slice(0, maxGuests));
      }
    }
    loadCandidates();
  }, [initialInviteId]);

  const toggleGuest = (candidate: RankedMatch) => {
    if (selectedGuests.some((g) => g.id === candidate.id)) {
      setSelectedGuests(selectedGuests.filter((g) => g.id !== candidate.id));
    } else {
      if (selectedGuests.length + 1 >= maxParticipants) {
        alert(`Free tier outings are capped at ${maxParticipants} total participants including host.`);
        return;
      }
      setSelectedGuests([...selectedGuests, candidate]);
    }
  };

  const parseSafeDate = (dateStr: string): { valid: boolean; iso?: string; error?: string } => {
    if (!dateStr || !dateStr.trim()) {
      return { valid: false, error: 'Start date and time are required.' };
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return { valid: false, error: 'Please enter a valid date and time.' };
    }
    const yr = d.getFullYear();
    if (yr < 2024 || yr > 2050) {
      return { valid: false, error: 'Please select a valid year (e.g. 2026).' };
    }
    return { valid: true, iso: d.toISOString() };
  };

  const validateForm = (): string | null => {
    const cleanTitle = title.trim();
    if (cleanTitle.length < 4 || cleanTitle.length > 80) {
      return 'Outing title must be between 4 and 80 characters.';
    }

    const cleanPitch = pitch.trim();
    if (cleanPitch.length < 20 || cleanPitch.length > 600) {
      return 'Pitch description must be between 20 and 600 characters.';
    }

    if (!area.trim()) {
      return 'Please specify an area or neighbourhood.';
    }

    if (budgetBand < 0 || budgetBand > 4) {
      return 'Budget band must be between 0 and 4.';
    }

    if (maxParticipants > 6) {
      return 'Free tier outings are capped at 6 participants maximum.';
    }

    const dateCheck = parseSafeDate(startsAt);
    if (!dateCheck.valid) {
      return dateCheck.error || 'Please enter a valid date and time.';
    }

    return null;
  };

  const handleCreateOuting = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const validationErr = validateForm();
    if (validationErr) {
      setErrorMessage(validationErr);
      return;
    }

    const dateCheck = parseSafeDate(startsAt);
    if (!dateCheck.valid || !dateCheck.iso) {
      setErrorMessage(dateCheck.error || 'Please enter a valid date and time.');
      return;
    }

    setIsSubmitting(true);

    try {
      const profile = getUserProfile();
      let hostId = profile.id || authUser?.id;
      const startsAtIso = dateCheck.iso;

      // 1. Supabase database insert if configured
      if (checkIsSupabaseConfigured()) {
        const client = getSupabaseBrowserClient();

        // Get session hostId if missing
        if (!hostId) {
          const { data: { session } } = await client.auth.getSession();
          hostId = session?.user?.id;
        }

        if (!hostId) {
          setErrorMessage('You must be signed in to create an outing.');
          setIsSubmitting(false);
          return;
        }

        // Insert into outings table
        const { data: newOuting, error: outingError } = await client
          .from('outings')
          .insert({
            host_id: hostId,
            title: title.trim(),
            pitch: pitch.trim(),
            activity_category: activityCategory,
            area: area.trim(),
            setting: setting.trim() || 'General',
            starts_at: startsAtIso,
            duration_minutes: durationMinutes,
            budget_band: budgetBand,
            orientation: orientation,
            visibility: visibility,
            max_participants: maxParticipants,
            state: 'open',
          })
          .select('*')
          .single();

        if (outingError || !newOuting) {
          setErrorMessage(outingError?.message || 'Failed to insert outing into database');
          setIsSubmitting(false);
          return;
        }

        // Insert host's own row into outing_members (role: host, state: accepted)
        const { error: memberError } = await client
          .from('outing_members')
          .insert({
            outing_id: newOuting.id,
            user_id: hostId,
            role: 'host',
            state: 'accepted',
          });

        if (memberError) {
          setErrorMessage(`Outing created, but failed to insert host membership: ${memberError.message}`);
          setIsSubmitting(false);
          return;
        }

        // Insert invited guests into outing_members if any
        for (const guest of selectedGuests) {
          if (guest.id && !guest.isDemo) {
            await client.from('outing_members').insert({
              outing_id: newOuting.id,
              user_id: guest.id,
              role: 'guest',
              state: 'invited',
            });
          }
        }

        const newPitchObj: PitchedOuting = {
          id: newOuting.id,
          title: title.trim(),
          pitch: pitch.trim(),
          area: area.trim(),
          dateTime: new Date(startsAtIso).toLocaleString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
          hostName: profile.displayName || 'You',
          hostAvatar: profile.avatarUrl || getGenderAvatarForName(profile.displayName || 'You'),
          seatsTotal: maxParticipants,
          seatsFilled: 1 + selectedGuests.length,
          cohesionScore: 85,
          joinedGuests: selectedGuests.map((g) => ({
            id: g.id,
            name: g.name,
            avatarUrl: g.avatarUrl || getGenderAvatarForName(g.name),
            homeArea: g.homeArea,
            status: 'Pending',
            isDemo: g.isDemo,
          })),
          createdAt: new Date().toISOString(),
        };

        addUserPitch(newPitchObj);

        // Route to the created outing's detail page using real id!
        router.push(`/outings/${newOuting.id}`);
        return;
      }

      // 2. Fallback local store if Supabase not configured
      const fallbackId = `pitch-${Date.now()}`;
      const joinedGuestsList: JoinedGuest[] = selectedGuests.map((g) => ({
        id: g.id,
        name: g.name,
        avatarUrl: g.avatarUrl || getGenderAvatarForName(g.name),
        homeArea: g.homeArea,
        status: 'Pending',
        isDemo: g.isDemo,
      }));

      const newPitchObj: PitchedOuting = {
        id: fallbackId,
        title: title.trim(),
        pitch: pitch.trim(),
        area: area.trim(),
        dateTime: new Date(startsAt).toLocaleString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
        hostName: profile.displayName || 'You',
        hostAvatar: profile.avatarUrl || getGenderAvatarForName(profile.displayName || 'You'),
        seatsTotal: maxParticipants,
        seatsFilled: joinedGuestsList.length + 1,
        cohesionScore: 80,
        joinedGuests: joinedGuestsList,
        createdAt: new Date().toISOString(),
      };

      addUserPitch(newPitchObj);
      router.push(`/outings/${fallbackId}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while creating the outing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0D1D15] text-[#FFFDF9] pb-24">
      {/* PAGE CANVAS BACKGROUND */}
      <img
        src="/user-outing-bg.jpg"
        alt="Outing Canvas Background"
        className="fixed inset-0 h-full w-full object-cover z-0 opacity-45"
      />

      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      {/* PAGE CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-[440px] px-5 pt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center text-[13.5px] font-semibold text-white/80 hover:text-white"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Cancel Proposal
        </button>

        <form onSubmit={handleCreateOuting} className="flex flex-col gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
              Host Proposal Composer
            </span>
            <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-white drop-shadow-md">
              Pitch an Outing
            </h1>
            <p className="mt-1 text-[14px] text-white/80">
              Design a small-group meetup for up to 6 people.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-[16px] border border-red-500/40 bg-red-500/20 p-4 text-[13px] font-semibold text-red-200 backdrop-blur-md flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: TITLE & PITCH DETAILS */}
          <div className="rounded-[24px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl space-y-4">
            <h3 className="text-[17px] font-bold text-white">
              1. Title & Pitch
            </h3>

            <div>
              <label className="text-[13px] font-semibold text-white">Outing Title (4–80 chars)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                className="mt-1 h-11 w-full rounded-[12px] border border-white/20 bg-black/60 px-4 text-[14px] text-white outline-none focus:border-white/50"
                placeholder="e.g. Saturday Pottery & Filter Coffee"
              />
              <span className="text-[10.5px] text-white/60 text-right block mt-1">{title.length}/80</span>
            </div>

            <div>
              <label className="text-[13px] font-semibold text-white">Host Pitch (20–600 chars)</label>
              <textarea
                rows={3}
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                maxLength={600}
                className="mt-1 w-full rounded-[12px] border border-white/20 bg-black/60 p-3 text-[14px] text-white outline-none focus:border-white/50"
                placeholder="Describe what you want to do..."
              />
              <span className="text-[10.5px] text-white/60 text-right block mt-1">{pitch.length}/600</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="min-w-0">
                <label className="text-[13px] font-semibold text-white">Category</label>
                <select
                  value={activityCategory}
                  onChange={(e) => setActivityCategory(e.target.value as any)}
                  className="mt-1 h-11 w-full min-w-0 rounded-[12px] border border-white/20 bg-black/60 px-3 text-[13px] text-white outline-none focus:border-white/50"
                >
                  <option value="coffee">Coffee</option>
                  <option value="dining">Dining</option>
                  <option value="creative">Creative</option>
                  <option value="cultural">Cultural</option>
                  <option value="active">Active</option>
                  <option value="nightlife">Nightlife</option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="text-[13px] font-semibold text-white">Area</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="mt-1 h-11 w-full min-w-0 rounded-[12px] border border-white/20 bg-black/60 px-4 text-[14px] text-white outline-none focus:border-white/50"
                  placeholder="e.g. Tiong Bahru"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-white">Date & Time (Calendar Format)</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="mt-1 h-11 w-full min-w-0 max-w-full rounded-[12px] border border-white/20 bg-black/60 px-3 text-[13px] text-white outline-none focus:border-white/50"
              />

              <div className="pt-1">
                <span className="text-[11.5px] font-semibold text-amber-300/90 block mb-1.5">
                  Suggested Upcoming Date & Time Slots:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedDates.map((sug) => (
                    <button
                      key={sug.isoValue}
                      type="button"
                      onClick={() => setStartsAt(sug.isoValue)}
                      className={`rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-all ${
                        startsAt === sug.isoValue
                          ? 'border-amber-300 bg-amber-400/25 text-amber-200 shadow-md ring-1 ring-amber-300/40'
                          : 'border-white/20 bg-black/40 text-white/80 hover:border-white/40 hover:bg-white/10'
                      }`}
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
              <div className="min-w-0">
                <label className="text-[13px] font-semibold text-white">Duration (mins)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 120)}
                  className="mt-1 h-11 w-full min-w-0 rounded-[12px] border border-white/20 bg-black/60 px-4 text-[14px] text-white outline-none focus:border-white/50"
                />
              </div>

              <div className="min-w-0">
                <label className="text-[13px] font-semibold text-white">Setting / Environment</label>
                <input
                  type="text"
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                  className="mt-1 h-11 w-full min-w-0 rounded-[12px] border border-white/20 bg-black/60 px-4 text-[13.5px] text-white outline-none focus:border-white/50"
                  placeholder="e.g. Cozy Cafe, Studio, Park"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
              <div className="min-w-0">
                <label className="text-[13px] font-semibold text-white">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="mt-1 h-11 w-full min-w-0 rounded-[12px] border border-white/20 bg-black/60 px-3 text-[12.5px] text-white outline-none focus:border-white/50"
                >
                  <option value="conversation_first">Conversation First</option>
                  <option value="activity_first">Activity First</option>
                  <option value="either">Either</option>
                </select>
              </div>

              <div className="min-w-0">
                <label className="text-[13px] font-semibold text-white">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="mt-1 h-11 w-full min-w-0 rounded-[12px] border border-white/20 bg-black/60 px-3 text-[12.5px] text-white outline-none focus:border-white/50"
                >
                  <option value="requestable">Requestable</option>
                  <option value="invite_only">Invite Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: INVITE MEMBERS */}
          <div className="rounded-[24px] border border-white/20 bg-black/50 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-white">
                  2. Invite Guests ({selectedGuests.length + 1} / {maxParticipants} Seats)
                </h3>
                <p className="text-[12px] text-white/80 mt-0.5">
                  Select matches to invite to your outing proposal.
                </p>
              </div>

              {candidates.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const maxAllowedGuests = maxParticipants - 1;
                    if (selectedGuests.length >= Math.min(candidates.length, maxAllowedGuests)) {
                      setSelectedGuests([]);
                    } else {
                      setSelectedGuests(candidates.slice(0, maxAllowedGuests));
                    }
                  }}
                  className="rounded-full border border-amber-300/40 bg-amber-500/20 px-3 py-1.5 text-[12px] font-bold text-amber-200 hover:bg-amber-500/30 transition-all shrink-0"
                >
                  {selectedGuests.length >= Math.min(candidates.length, maxParticipants - 1)
                    ? 'Deselect All'
                    : 'Select All Matches'}
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
              {candidates.map((candidate) => {
                const isSelected = selectedGuests.some((g) => g.id === candidate.id);

                return (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => toggleGuest(candidate)}
                    className={`flex items-center justify-between rounded-[16px] border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-white bg-white/20 text-white'
                        : 'border-white/15 bg-black/40 text-white/80 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={candidate.avatarUrl || getGenderAvatarForName(candidate.name)}
                        alt={candidate.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-[14px] font-bold text-white flex items-center gap-1.5">
                          {candidate.name}
                          {candidate.isDemo && (
                            <span className="rounded-full bg-amber-400 text-black px-2 py-0.5 text-[9px] font-extrabold uppercase shrink-0 whitespace-nowrap">
                              Demo
                            </span>
                          )}
                        </h4>
                        <span className="text-[11.5px] text-white/70">
                          {candidate.homeArea}
                        </span>
                      </div>
                    </div>

                    <div className={`flex h-7 w-7 items-center justify-center rounded-full border ${isSelected ? 'border-white bg-white text-black' : 'border-white/30 bg-black/40 text-white'}`}>
                      {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 text-[16px] font-bold"
          >
            {isSubmitting ? 'Publishing Outing...' : 'Publish Outing Proposal →'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function PitchOutingPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="min-h-screen bg-[#0D1D15] p-6 text-[#FFFDF9]">Loading composer...</div>}>
        <PitchComposerContent />
      </Suspense>
    </AuthGuard>
  );
}
