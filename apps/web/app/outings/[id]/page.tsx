'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IllustratedGround, SeatRow, Button } from '@soul-tribe/ui';
import { MapPin, Calendar, Clock, ArrowLeft, Check, AlertTriangle, UserCheck, ShieldCheck, UserPlus, XCircle, Sparkles, Edit3, Plus, X, Trash2 } from 'lucide-react';
import { useAuth } from '../../../lib/authContext';
import { getUserProfile, removeUserPitchLocal, removeJoinedOutingLocal } from '../../../lib/userStore';
import { getRankedMatches, RankedMatch } from '../../../lib/matching';
import { checkIsSupabaseConfigured, getSupabaseBrowserClient } from '../../../lib/supabase';
import { getOutingCategoryImage } from '../../../lib/outingsStore';
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
  hostName: string;
  hostAvatar: string;
  isHostDemo?: boolean;
  title: string;
  pitch: string;
  area: string;
  activity_category: string;
  starts_at: string;
  duration_minutes: number;
  budget_band: number;
  orientation: string;
  setting: string;
  visibility?: string;
  max_participants: number;
  state: string;
}

function OutingDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const outingId = params?.id as string;
  const shouldOpenEdit = searchParams?.get('edit') === 'true';

  const { user: authUser } = useAuth();
  const profile = getUserProfile();
  const viewerId = authUser?.id || profile.id || '00000000-0000-0000-0000-000000000099';

  const [outing, setOuting] = useState<OutingData | null>(null);
  const [members, setMembers] = useState<OutingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Host Edit Pitch State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editPitch, setEditPitch] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editCategory, setEditCategory] = useState<string>('coffee');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editMaxParticipants, setEditMaxParticipants] = useState<number>(6);

  // Host Delete Confirmation State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Host Add User State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [candidateList, setCandidateList] = useState<RankedMatch[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const startEditing = () => {
    if (!outing) return;
    setEditTitle(outing.title);
    setEditPitch(outing.pitch);
    setEditArea(outing.area);
    setEditCategory(outing.activity_category || 'coffee');

    if (outing.starts_at) {
      const d = new Date(outing.starts_at);
      if (!isNaN(d.getTime())) {
        const pad = (n: number) => String(n).padStart(2, '0');
        setEditDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        setEditTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
      }
    }

    setEditMaxParticipants(outing.max_participants || 6);
    setIsEditing(true);
  };

  const handleSavePitchEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outing) return;

    const cleanTitle = editTitle.trim();
    const cleanPitch = editPitch.trim();
    const cleanArea = editArea.trim();

    if (cleanTitle.length < 4 || cleanTitle.length > 80) {
      setErrorMessage('Outing title must be between 4 and 80 characters.');
      return;
    }
    if (cleanPitch.length < 20 || cleanPitch.length > 600) {
      setErrorMessage('Pitch description must be between 20 and 600 characters.');
      return;
    }
    if (editMaxParticipants > 6) {
      setErrorMessage('Free tier outings are capped at 6 participants maximum.');
      return;
    }

    let isoDate = outing.starts_at;
    if (editDate && editTime) {
      const parsed = new Date(`${editDate}T${editTime}`);
      if (!isNaN(parsed.getTime())) {
        isoDate = parsed.toISOString();
      }
    }

    if (checkIsSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient();
        const { error } = await client
          .from('outings')
          .update({
            title: cleanTitle,
            pitch: cleanPitch,
            area: cleanArea,
            activity_category: editCategory,
            starts_at: isoDate,
            max_participants: editMaxParticipants,
          })
          .eq('id', outingId);

        if (error) {
          setErrorMessage(error.message);
          return;
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to update pitch details');
        return;
      }
    }

    setOuting((prev) =>
      prev
        ? {
            ...prev,
            title: cleanTitle,
            pitch: cleanPitch,
            area: cleanArea,
            activity_category: editCategory,
            starts_at: isoDate,
            max_participants: editMaxParticipants,
          }
        : null
    );

    setIsEditing(false);
    setActionMessage('Pitch details updated successfully!');
  };

  const handleDeleteOuting = async () => {
    setErrorMessage('');
    setActionMessage('');

    if (checkIsSupabaseConfigured()) {
      try {
        const client = getSupabaseBrowserClient();
        await client.from('outing_members').delete().eq('outing_id', outingId);
        await client.from('outings').delete().eq('id', outingId);
      } catch (err: any) {
        console.error('[SoulTribe Error] Failed to delete outing from DB:', err);
      }
    }

    removeUserPitchLocal(outingId);
    removeJoinedOutingLocal(outingId);

    router.push('/home');
  };

  const openAddUserModal = async () => {
    setIsAddUserOpen(true);
    setLoadingCandidates(true);
    try {
      const userProf = getUserProfile();
      const list = await getRankedMatches(userProf, { limit: 30 });
      setCandidateList(list);
    } catch {
      setCandidateList([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleAddMemberLater = async (cand: RankedMatch) => {
    setErrorMessage('');
    setActionMessage('');

    if (members.filter((m) => m.state === 'accepted').length >= (outing?.max_participants || 6)) {
      setErrorMessage('Cannot add member: Outing is full (capped at 6 participants).');
      return;
    }

    if (checkIsSupabaseConfigured() && cand.id && !cand.isDemo) {
      try {
        const client = getSupabaseBrowserClient();
        const { error } = await client
          .from('outing_members')
          .insert({
            outing_id: outingId,
            user_id: cand.id,
            role: 'guest',
            state: 'accepted',
          });

        if (error) {
          if (error.message.includes('cap') || error.message.includes('exceed') || error.code === 'P0001') {
            setErrorMessage('Cannot add member: Outing is full (capped at 6 participants).');
          } else {
            setErrorMessage(error.message);
          }
          return;
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to add member');
        return;
      }
    }

    const newMember: OutingMember = {
      user_id: cand.id,
      role: 'guest',
      state: 'accepted',
      display_name: cand.name,
      avatar_url: cand.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      home_area: cand.homeArea || 'Singapore',
      isDemo: cand.isDemo,
    };

    setMembers((prev) => [...prev.filter((m) => m.user_id !== cand.id), newMember]);
    setActionMessage(`${cand.name} added to outing!`);
    setIsAddUserOpen(false);
  };

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
            const formattedMembers: OutingMember[] = dbMembers.map((m: any) => {
              const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
              const isViewer = m.user_id === viewerId;
              return {
                user_id: m.user_id,
                role: m.role,
                state: m.state,
                display_name: p?.display_name || (isViewer ? profile.displayName || 'You' : 'Member'),
                avatar_url: p?.avatar_url || (isViewer ? profile.avatarUrl : '') || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
                home_area: p?.home_area || (isViewer ? profile.homeArea : '') || 'Singapore',
                isDemo: Boolean(m.is_demo || p?.is_demo),
              };
            });
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

  useEffect(() => {
    if (shouldOpenEdit && outing && !loading) {
      startEditing();
    }
  }, [shouldOpenEdit, outing, loading]);

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

  const isHost =
    outing.host_id === viewerId ||
    (Boolean(authUser?.id) && outing.host_id === authUser?.id) ||
    (Boolean(profile.id) && outing.host_id === profile.id);

  const myMemberRecord = members.find(
    (m) => m.user_id === viewerId || (authUser?.id && m.user_id === authUser.id) || (profile.id && m.user_id === profile.id)
  );
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
          src={getOutingCategoryImage(outing.activity_category, outing.title)}
          alt={outing.title}
          className="h-full w-full object-cover opacity-70"
        />

        <div className="absolute top-4 left-4 rounded-full bg-[#0D1D15]/90 px-3 py-1 text-[11px] font-bold tracking-widest text-[#F3F0E9] uppercase backdrop-blur-sm flex items-center gap-1.5">
          <span>{outing.area}</span>
          <span>·</span>
          <span className="capitalize">{outing.activity_category}</span>
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
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[12px] font-semibold text-[#A6AAA4] flex items-center gap-1.5">
              Pitched by <strong className="text-[#F3F0E9]">{outing.hostName}</strong>
              {outing.isHostDemo && (
                <span className="rounded-full bg-amber-400 text-black px-2 py-0.5 text-[9.5px] font-extrabold uppercase shrink-0 whitespace-nowrap">
                  Demo
                </span>
              )}
            </span>
            {isHost && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startEditing}
                  className="text-[12px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Pitch
                </button>

                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="text-[12px] font-bold text-red-300 hover:text-red-200 flex items-center gap-1 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Pitch
                </button>
              </div>
            )}
          </div>
          <h1 className="mt-2 text-[26px] font-bold tracking-tight text-[#F3F0E9]">
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
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-[#8F998D] uppercase">
              Host Pitch
            </span>
            {isHost && (
              <button
                type="button"
                onClick={startEditing}
                className="text-[11px] font-semibold text-amber-300 hover:underline"
              >
                Edit Proposal
              </button>
            )}
          </div>
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
            <div className="flex items-center gap-3">
              {isHost && !isFull && (
                <button
                  type="button"
                  onClick={openAddUserModal}
                  className="text-[11.5px] font-extrabold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-0.5"
                >
                  <UserPlus className="h-3.5 w-3.5" /> + Add Member
                </button>
              )}
              <span className="text-[12px] font-bold text-[#F3F0E9]">
                {filledCount} / {outing.max_participants} Seats Filled
              </span>
            </div>
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

      {/* EDIT PITCH MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-[28px] border border-white/20 bg-[#15261C] p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-[18px] font-bold text-[#F3F0E9] flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-400" /> Edit Outing Pitch
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePitchEdit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#A6AAA4] mb-1">
                  Outing Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-[14px] border border-white/20 bg-[#0D1D15] p-3 text-[14px] text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#A6AAA4] mb-1">
                  Pitch Description
                </label>
                <textarea
                  rows={4}
                  value={editPitch}
                  onChange={(e) => setEditPitch(e.target.value)}
                  className="w-full rounded-[14px] border border-white/20 bg-[#0D1D15] p-3 text-[14px] text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#A6AAA4] mb-1">
                    Activity Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-[14px] border border-white/20 bg-[#0D1D15] p-3 text-[13.5px] text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="coffee">Coffee & Cafe</option>
                    <option value="dining">Dining & Food</option>
                    <option value="intellectual">Intellectual & Deep Talk</option>
                    <option value="cultural">Cultural & Arts</option>
                    <option value="creative">Creative & Craft</option>
                    <option value="active">Active & Outdoor</option>
                    <option value="nightlife">Nightlife & Drinks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#A6AAA4] mb-1">
                    Neighbourhood / Area
                  </label>
                  <input
                    type="text"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="w-full rounded-[14px] border border-white/20 bg-[#0D1D15] p-3 text-[14px] text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              {/* SEPARATE DATE & TIME INPUTS */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#A6AAA4] mb-1">
                    Outing Date
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-[14px] border border-white/20 bg-[#0D1D15] p-3 text-[13.5px] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#A6AAA4] mb-1">
                    Outing Time
                  </label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full rounded-[14px] border border-white/20 bg-[#0D1D15] p-3 text-[13.5px] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#A6AAA4] mb-1">
                  Max Participants (Cap 6)
                </label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={editMaxParticipants}
                  onChange={(e) => setEditMaxParticipants(Math.min(6, Math.max(2, parseInt(e.target.value) || 6)))}
                  className="w-full rounded-[14px] border border-white/20 bg-[#0D1D15] p-3 text-[14px] text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="secondary" size="md" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PITCH CONFIRMATION MODAL */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-[28px] border border-red-500/30 bg-[#15261C] p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#F3F0E9]">Delete Outing Pitch?</h3>
                <p className="text-[12px] text-[#A6AAA4]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-[13.5px] text-[#F3F0E9] leading-relaxed">
              Are you sure you want to cancel and delete <strong className="text-white">“{outing.title}”</strong>? It will be removed from member feeds and your pitched outings.
            </p>

            <div className="pt-2 flex justify-end gap-2.5">
              <Button type="button" variant="secondary" size="md" onClick={() => setIsDeleteConfirmOpen(false)}>
                Keep Pitch
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                className="bg-red-600 hover:bg-red-700 border-red-500 text-white"
                onClick={handleDeleteOuting}
              >
                Delete Pitch
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-[28px] border border-white/20 bg-[#15261C] p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-[18px] font-bold text-[#F3F0E9] flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-400" /> Add Member to Outing
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[13px] text-[#A6AAA4]">
              Select a community member or match to invite directly into your seat roster:
            </p>

            {loadingCandidates ? (
              <div className="p-6 text-center text-[13.5px] text-[#F3F0E9]">
                Loading community members...
              </div>
            ) : candidateList.filter((c) => !members.some((m) => m.user_id === c.id)).length === 0 ? (
              <div className="p-6 text-center text-[13px] text-[#A6AAA4]">
                All matches are already added or no additional candidates found.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {candidateList
                  .filter((c) => !members.some((m) => m.user_id === c.id))
                  .map((cand) => (
                    <div
                      key={cand.id}
                      className="flex items-center justify-between rounded-[16px] border border-white/10 bg-[#0D1D15] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={cand.avatarUrl}
                          alt={cand.name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <div>
                          <span className="text-[14px] font-bold text-[#F3F0E9] block">{cand.name}</span>
                          <span className="text-[11.5px] text-[#A6AAA4]">{cand.homeArea}</span>
                        </div>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => handleAddMemberLater(cand)}>
                        Add Member
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </IllustratedGround>
  );
}
