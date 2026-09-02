'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { IllustratedGround, SeatRow, Button } from '@soul-tribe/ui';
import { MapPin, Calendar, Clock, ArrowLeft, Check, AlertTriangle, UserCheck, ShieldCheck, UserPlus, XCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../../lib/authContext';
import { getUserProfile } from '../../../lib/userStore';
import { checkIsSupabaseConfigured, getSupabaseBrowserClient } from '../../../lib/supabase';
import { AuthGuard } from '../../../components/AuthGuard';

export default function OutingDetailPage() {
  return (
    <AuthGuard>
      <OutingDetailContent />
    </AuthGuard>
  );
}

interface OutingMember {
  user_id: string;
  role: 'host' | 'guest';
  state: 'invited' | 'requested' | 'accepted' | 'declined';
  display_name: string;
  avatar_url: string;
  home_area: string;
  isDemo?: boolean;
}

interface OutingData {
  id: string;
  host_id: string;
  title: string;
  pitch: string;
  activity_category: string;
  area: string;
  starts_at: string;
  duration_minutes: number;
  budget_band: number;
  orientation: string;
  visibility: string;
  max_participants: number;
  state: string;
  hostName: string;
  hostAvatar: string;
  isHostDemo?: boolean;
}

function OutingDetailContent() {
  const router = useRouter();
  const params = useParams();
  const outingId = params?.id as string;

  const { user: authUser } = useAuth();
  const profile = getUserProfile();
  const viewerId = profile.id || authUser?.id || '00000000-0000-0000-0000-000000000099';

  const [outing, setOuting] = useState<OutingData | null>(null);
  const [members, setMembers] = useState<OutingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    async function loadOutingDetails() {
      setLoading(true);
      setErrorMessage('');

      if (checkIsSupabaseConfigured() && outingId) {
        try {
          const client = getSupabaseBrowserClient();

          // 1. Load real outing by ID from outings table
          const { data: dbOuting, error: outingErr } = await client
            .from('outings')
            .select('*')
            .eq('id', outingId)
            .single();

          if (outingErr || !dbOuting) {
            setOuting(null);
            setLoading(false);
            return;
          }

          // 2. Load host profile from profiles table
          const { data: hostProfile } = await client
            .from('profiles')
            .select('display_name, avatar_url, home_area')
            .eq('id', dbOuting.host_id)
            .single();

          const isHostDemo = Boolean((dbOuting as any).is_demo || (hostProfile as any)?.is_demo);

          const loadedOuting: OutingData = {
            ...dbOuting,
            hostName: hostProfile?.display_name || 'Host',
            hostAvatar: hostProfile?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
            isHostDemo,
          };

          setOuting(loadedOuting);

          // 3. Load real members joined with profiles from outing_members table
          const { data: dbMembers } = await client
            .from('outing_members')
            .select('user_id, role, state, profiles(id, display_name, avatar_url, home_area)')
            .eq('outing_id', outingId);

          if (dbMembers) {
            const formattedMembers: OutingMember[] = dbMembers.map((m: any) => ({
              user_id: m.user_id,
              role: m.role,
              state: m.state,
              display_name: m.profiles?.display_name || 'Member',
              avatar_url: m.profiles?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
              home_area: m.profiles?.home_area || 'Singapore',
              isDemo: Boolean(m.is_demo || m.profiles?.is_demo),
            }));
            setMembers(formattedMembers);
          }

          setLoading(false);
          return;
        } catch {
          setOuting(null);
          setMembers([]);
        }
      }

      setOuting(null);
      setMembers([]);
      setLoading(false);
    }

    loadOutingDetails();
  }, [outingId]);

  if (loading) {
    return (
      <IllustratedGround variant="paper" className="min-h-screen pb-24">
        <div className="flex items-center justify-center p-12 text-[#F3F0E9]">
          Loading outing record...
        </div>
      </IllustratedGround>
    );
  }

  // 6. PROPER "OUTING NOT FOUND" STATE
  if (!outing) {
    return (
      <IllustratedGround variant="paper" className="min-h-screen pb-24">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center text-[13.5px] font-semibold text-[#A6AAA4] hover:text-[#F3F0E9]"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
        </button>

        <div className="mt-8 flex flex-col items-center justify-center rounded-[28px] border border-white/15 bg-[#15261C] p-8 text-center shadow-xl space-y-4">
          <AlertTriangle className="h-12 w-12 text-amber-400" />
          <h2 className="text-[22px] font-bold text-[#F3F0E9]">Outing Not Found</h2>
          <p className="text-[13.5px] text-[#A6AAA4] max-w-[300px]">
            The outing record you are looking for does not exist or has been removed.
          </p>
          <Link href="/home">
            <Button variant="primary" size="md">Return to Home Feed</Button>
          </Link>
        </div>
      </IllustratedGround>
    );
  }

  const isHost = outing.host_id === viewerId;
  const myMemberRecord = members.find((m) => m.user_id === viewerId);
  const myState = myMemberRecord?.state || null;

  const acceptedMembers = members.filter((m) => m.state === 'accepted');
  const pendingRequests = members.filter((m) => m.state === 'requested');

  const filledCount = acceptedMembers.length;
  const isFull = filledCount >= outing.max_participants;

  // Request to Join Outing
  const handleRequestJoin = async () => {
    setErrorMessage('');
    setActionMessage('');

    if (isFull) {
      setErrorMessage('This outing is full (capped at 6 participants).');
      return;
    }

    if (checkIsSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient();
        const { error } = await client
          .from('outing_members')
          .insert({
            outing_id: outingId,
            user_id: viewerId,
            role: 'guest',
            state: 'requested',
          });

        if (error) {
          // Catch 6-person cap trigger failure
          if (error.message.includes('cap') || error.message.includes('exceed') || error.code === 'P0001') {
            setErrorMessage('This outing is full (capped at 6 participants).');
          } else {
            setErrorMessage(error.message);
          }
          return;
        }

        setMembers((prev) => [
          ...prev.filter((m) => m.user_id !== viewerId),
          {
            user_id: viewerId,
            role: 'guest',
            state: 'requested',
            display_name: profile.displayName || 'You',
            avatar_url: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            home_area: profile.homeArea || 'Singapore',
          },
        ]);
        setActionMessage('Join request sent to host!');
        return;
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to send join request');
        return;
      }
    }

    // Local fallback
    setMembers((prev) => [
      ...prev.filter((m) => m.user_id !== viewerId),
      {
        user_id: viewerId,
        role: 'guest',
        state: 'requested',
        display_name: profile.displayName || 'You',
        avatar_url: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        home_area: profile.homeArea || 'Singapore',
      },
    ]);
    setActionMessage('Join request sent to host!');
  };

  // Leave Outing / Cancel Request
  const handleLeaveOuting = async () => {
    setErrorMessage('');
    setActionMessage('');

    if (checkIsSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient();
        await client
          .from('outing_members')
          .delete()
          .eq('outing_id', outingId)
          .eq('user_id', viewerId);

        setMembers((prev) => prev.filter((m) => m.user_id !== viewerId));
        setActionMessage('You have left this outing.');
        return;
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to leave outing');
        return;
      }
    }

    setMembers((prev) => prev.filter((m) => m.user_id !== viewerId));
    setActionMessage('You have left this outing.');
  };

  // Host Action: Accept Request
  const handleHostAccept = async (applicantId: string) => {
    setErrorMessage('');
    setActionMessage('');

    if (isFull) {
      setErrorMessage('Cannot accept request: Outing is full (capped at 6 participants).');
      return;
    }

    if (checkIsSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient();
        const { error } = await client
          .from('outing_members')
          .update({ state: 'accepted' })
          .eq('outing_id', outingId)
          .eq('user_id', applicantId);

        if (error) {
          if (error.message.includes('cap') || error.message.includes('exceed') || error.code === 'P0001') {
            setErrorMessage('Cannot accept request: Outing is full (capped at 6 participants).');
          } else {
            setErrorMessage(error.message);
          }
          return;
        }

        setMembers((prev) =>
          prev.map((m) => (m.user_id === applicantId ? { ...m, state: 'accepted' } : m))
        );
        setActionMessage('Member accepted!');
        return;
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to accept member');
        return;
      }
    }

    setMembers((prev) =>
      prev.map((m) => (m.user_id === applicantId ? { ...m, state: 'accepted' } : m))
    );
    setActionMessage('Member accepted!');
  };

  // Host Action: Decline Request
  const handleHostDecline = async (applicantId: string) => {
    setErrorMessage('');
    setActionMessage('');

    if (checkIsSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient();
        await client
          .from('outing_members')
          .update({ state: 'declined' })
          .eq('outing_id', outingId)
          .eq('user_id', applicantId);

        setMembers((prev) =>
          prev.map((m) => (m.user_id === applicantId ? { ...m, state: 'declined' } : m))
        );
        setActionMessage('Request declined.');
        return;
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to decline request');
        return;
      }
    }

    setMembers((prev) =>
      prev.map((m) => (m.user_id === applicantId ? { ...m, state: 'declined' } : m))
    );
    setActionMessage('Request declined.');
  };

  const formattedDate = new Date(outing.starts_at).toLocaleDateString('en-SG', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(outing.starts_at).toLocaleTimeString('en-SG', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <IllustratedGround variant="paper" className="min-h-screen pb-24">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 flex items-center text-[13.5px] font-semibold text-[#A6AAA4] hover:text-[#F3F0E9]"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
      </button>

      {/* Top Location Header */}
      <div className="relative h-44 w-full overflow-hidden rounded-[24px] bg-[#15261C] border border-[#F3F0E9]/12 shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80"
          alt={outing.title}
          className="h-full w-full object-cover opacity-70"
        />

        <div className="absolute top-4 left-4 rounded-full bg-[#0D1D15]/90 px-3 py-1 text-[11px] font-bold tracking-widest text-[#F3F0E9] uppercase backdrop-blur-sm">
          {outing.area}
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <span className="rounded-full bg-[#0D1D15] border border-[#F3F0E9]/20 px-3.5 py-1 text-[12px] font-bold text-[#F3F0E9] capitalize">
            {outing.state} Outing
          </span>
          <img
            src={outing.hostAvatar}
            alt={outing.hostName}
            className="h-11 w-11 rounded-full border-2 border-[#F3F0E9] object-cover shadow-sm"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {/* Messages */}
        {errorMessage && (
          <div className="rounded-[16px] border border-red-500/40 bg-red-500/20 p-4 text-[13px] font-semibold text-red-200 backdrop-blur-md flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {actionMessage && (
          <div className="rounded-[16px] border border-emerald-400/40 bg-emerald-500/20 p-3.5 text-[13px] font-semibold text-emerald-200 backdrop-blur-md flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-300" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* 2. REAL HOST & TITLE */}
        <div className="border-b border-[#F3F0E9]/12 pb-4">
          <span className="text-[12px] font-semibold text-[#A6AAA4] flex items-center gap-1.5">
            Pitched by <strong className="text-[#F3F0E9]">{outing.hostName}</strong>
            {outing.isHostDemo && (
              <span className="rounded-full bg-amber-400 text-black px-2 py-0.5 text-[9.5px] font-extrabold uppercase shrink-0 whitespace-nowrap">
                Demo
              </span>
            )}
          </span>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight text-[#F3F0E9]">
            {outing.title}
          </h1>
        </div>

        {/* DETAILS CARD */}
        <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg flex flex-col gap-3">
          <div className="flex items-center text-[13.5px] text-[#F3F0E9]">
            <Calendar className="mr-2 h-4 w-4 text-[#8F998D]" /> {formattedDate}
          </div>
          <div className="flex items-center text-[13.5px] text-[#F3F0E9]">
            <Clock className="mr-2 h-4 w-4 text-[#8F998D]" /> {formattedTime} ({outing.duration_minutes} mins)
          </div>
          <div className="flex items-center text-[13.5px] text-[#F3F0E9]">
            <MapPin className="mr-2 h-4 w-4 text-[#8F998D]" /> {outing.area}
          </div>
        </div>

        {/* HOST PITCH */}
        <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg">
          <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
            Host Pitch
          </span>
          <p className="mt-2 text-[14px] leading-relaxed text-[#F3F0E9]">
            “{outing.pitch}”
          </p>
        </div>

        {/* 3. SEAT ROSTER & REAL MEMBERS */}
        <div className="rounded-[24px] border border-[#F3F0E9]/12 bg-[#15261C] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
              Seat Roster (Max {outing.max_participants})
            </span>
            <span className="text-[12px] font-bold text-[#F3F0E9]">
              {filledCount} / {outing.max_participants} Seats Filled
            </span>
          </div>

          <SeatRow seatsTotal={outing.max_participants} seatsFilled={filledCount} />

          {/* Member List */}
          <div className="pt-2 space-y-2.5 border-t border-white/10">
            <span className="text-[11px] font-bold text-[#A6AAA4] uppercase tracking-wider block">
              Accepted Members
            </span>
            {acceptedMembers.map((m) => (
              <div key={m.user_id} className="flex items-center justify-between rounded-[16px] border border-white/10 bg-[#0D1D15] p-2.5">
                <div className="flex items-center gap-2.5">
                  <img
                    src={m.avatar_url}
                    alt={m.display_name}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20"
                  />
                  <div>
                    <span className="text-[13px] font-bold text-[#F3F0E9] flex items-center gap-1.5">
                      {m.display_name}
                      {m.role === 'host' && <span className="text-[9.5px] text-amber-300 uppercase font-extrabold">(Host)</span>}
                      {m.isDemo && <span className="rounded-full bg-amber-400 text-black px-1.5 py-0.2 text-[8.5px] font-extrabold uppercase">Demo</span>}
                    </span>
                    <span className="text-[11px] text-[#A6AAA4]">{m.home_area}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/people/${m.user_id}/bond`}>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200 hover:border-emerald-400">
                      <Sparkles className="h-3 w-3 text-emerald-400" /> View Bond
                    </span>
                  </Link>
                  <span className="text-[10.5px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-2.5 py-0.5">
                    Accepted ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HOST PENDING REQUESTS CONTROL PANEL */}
        {isHost && pendingRequests.length > 0 && (
          <div className="rounded-[24px] border border-amber-400/30 bg-amber-500/10 p-5 shadow-lg space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-amber-300 uppercase flex items-center gap-1.5">
              <UserPlus className="h-4 w-4" /> Pending Join Requests ({pendingRequests.length})
            </span>

            <div className="space-y-2.5 pt-1">
              {pendingRequests.map((m) => (
                <div key={m.user_id} className="flex items-center justify-between rounded-[16px] border border-white/15 bg-[#0D1D15] p-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={m.avatar_url}
                      alt={m.display_name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div>
                      <span className="text-[13.5px] font-bold text-[#F3F0E9] block">{m.display_name}</span>
                      <span className="text-[11px] text-[#A6AAA4]">{m.home_area} · Requested to join</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => handleHostAccept(m.user_id)}>
                      Accept
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleHostDecline(m.user_id)}>
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. REAL JOIN / LEAVE ACTIONS */}
        {!isHost && (
          <div className="pt-2">
            {myState === 'accepted' ? (
              <div className="space-y-3 text-center">
                <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#15261C] border border-emerald-400/40 p-4 text-[#F3F0E9] shadow-lg">
                  <span className="flex items-center text-[15px] font-bold text-emerald-300">
                    <Check className="mr-1.5 h-5 w-5" /> Seat Confirmed!
                  </span>
                  <p className="mt-1 text-[12.5px] text-[#A6AAA4]">
                    Host details & group chat link have been unlocked for you.
                  </p>
                </div>

                <Button variant="secondary" size="sm" onClick={handleLeaveOuting} className="w-full text-red-300">
                  Leave Outing
                </Button>
              </div>
            ) : myState === 'requested' ? (
              <div className="space-y-3 text-center">
                <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#15261C] border border-amber-400/40 p-4 text-[#F3F0E9] shadow-lg">
                  <span className="flex items-center text-[15px] font-bold text-amber-300">
                    <Clock className="mr-1.5 h-5 w-5" /> Request Pending Host Approval
                  </span>
                  <p className="mt-1 text-[12.5px] text-[#A6AAA4]">
                    Your join request was sent to {outing.hostName}. You will be notified when accepted.
                  </p>
                </div>

                <Button variant="secondary" size="sm" onClick={handleLeaveOuting} className="w-full">
                  Cancel Request
                </Button>
              </div>
            ) : outing.visibility === 'requestable' ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full py-4 font-extrabold text-[15.5px]"
                disabled={isFull}
                onClick={handleRequestJoin}
              >
                {isFull ? 'Outing Full (6 / 6 Seats Filled)' : 'Request to Join Outing →'}
              </Button>
            ) : (
              <div className="rounded-[16px] border border-white/15 bg-[#15261C] p-4 text-center text-[13px] text-[#A6AAA4]">
                This outing is invite-only.
              </div>
            )}
          </div>
        )}
      </div>
    </IllustratedGround>
  );
}
