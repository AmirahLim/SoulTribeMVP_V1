import { getSupabaseBrowserClient, checkIsSupabaseConfigured } from './supabase';
import { getGenderAvatarForName } from '@soul-tribe/core';

export interface OutingItem {
  id: string;
  title: string;
  pitch: string;
  area: string;
  dateTime: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  isHostDemo?: boolean;
  seatsTotal: number;
  seatsFilled: number;
  category?: string;
  orientation?: string;
  cohesionScore?: number;
  state?: string;
  visibility?: string;
  fitBadge?: string;
}

export async function fetchGoingOutings(userId?: string): Promise<OutingItem[]> {
  if (!checkIsSupabaseConfigured() || !userId) {
    return [];
  }

  try {
    const client = getSupabaseBrowserClient();
    const { data: memberRows, error } = await client
      .from('outing_members')
      .select(`
        outing_id,
        state,
        role,
        outings (
          id,
          host_id,
          title,
          pitch,
          area,
          starts_at,
          max_participants,
          profiles!outings_host_id_fkey (display_name, avatar_url),
          outing_members (user_id, state)
        )
      `)
      .eq('user_id', userId)
      .eq('state', 'accepted')
      .neq('role', 'host');

    if (error || !memberRows || memberRows.length === 0) {
      return [];
    }

    return memberRows
      .map((row: any) => {
        const out = row.outings;
        if (!out) return null;
        const hostProfile = Array.isArray(out.profiles) ? out.profiles[0] : out.profiles;
        const hostName = hostProfile?.display_name || '';
        const hostAvatar = hostProfile?.avatar_url || (hostName ? getGenderAvatarForName(hostName) : '');
        const members = Array.isArray(out.outing_members) ? out.outing_members : [];
        const seatsFilled = members.filter((m: any) => m.state === 'accepted').length;

        let dateTimeStr = '';
        if (out.starts_at) {
          const d = new Date(out.starts_at);
          if (!isNaN(d.getTime())) {
            dateTimeStr = d.toLocaleDateString('en-SG', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: '2-digit',
            });
          }
        }

        return {
          id: out.id,
          title: out.title,
          pitch: out.pitch || '',
          area: out.area || 'Singapore',
          dateTime: dateTimeStr,
          hostId: out.host_id,
          hostName,
          hostAvatar,
          seatsTotal: out.max_participants || 6,
          seatsFilled,
        };
      })
      .filter(Boolean) as OutingItem[];
  } catch {
    return [];
  }
}

export async function fetchRadarOutings(userId?: string): Promise<OutingItem[]> {
  if (!checkIsSupabaseConfigured() || !userId) {
    return [];
  }

  try {
    const client = getSupabaseBrowserClient();
    const { data: outingRows, error } = await client
      .from('outings')
      .select(`
        id,
        host_id,
        title,
        pitch,
        activity_category,
        area,
        starts_at,
        max_participants,
        visibility,
        state,
        profiles!outings_host_id_fkey (display_name, avatar_url),
        outing_members (user_id, state)
      `)
      .eq('visibility', 'requestable')
      .eq('state', 'open')
      .neq('host_id', userId);

    if (error || !outingRows || outingRows.length === 0) {
      return [];
    }

    return outingRows.map((out: any) => {
      const hostProfile = Array.isArray(out.profiles) ? out.profiles[0] : out.profiles;
      const hostName = hostProfile?.display_name || '';
      const hostAvatar = hostProfile?.avatar_url || (hostName ? getGenderAvatarForName(hostName) : '');
      const members = Array.isArray(out.outing_members) ? out.outing_members : [];
      const seatsFilled = members.filter((m: any) => m.state === 'accepted').length;

      let dateTimeStr = '';
      if (out.starts_at) {
        const d = new Date(out.starts_at);
        if (!isNaN(d.getTime())) {
          dateTimeStr = d.toLocaleDateString('en-SG', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
          });
        }
      }

      return {
        id: out.id,
        title: out.title,
        pitch: out.pitch || '',
        area: out.area || 'Singapore',
        dateTime: dateTimeStr,
        hostId: out.host_id,
        hostName,
        hostAvatar,
        seatsTotal: out.max_participants || 6,
        seatsFilled,
        fitBadge: undefined,
      };
    });
  } catch {
    return [];
  }
}

import { getUserPitches } from './userStore';

export async function fetchUserPitches(userId?: string): Promise<OutingItem[]> {
  const localPitches = getUserPitches();
  const localItems: OutingItem[] = localPitches.map((p) => ({
    id: p.id,
    title: p.title,
    pitch: p.pitch,
    area: p.area,
    dateTime: p.dateTime,
    hostId: userId || 'user',
    hostName: p.hostName,
    hostAvatar: p.hostAvatar,
    seatsTotal: p.seatsTotal,
    seatsFilled: p.seatsFilled,
  }));

  if (!checkIsSupabaseConfigured() || !userId) {
    return localItems;
  }

  try {
    const client = getSupabaseBrowserClient();
    const { data: dbOutings, error } = await client
      .from('outings')
      .select(`
        id,
        host_id,
        title,
        pitch,
        activity_category,
        area,
        starts_at,
        max_participants,
        visibility,
        state,
        profiles!outings_host_id_fkey (display_name, avatar_url),
        outing_members (user_id, state)
      `)
      .eq('host_id', userId);

    if (error || !dbOutings || dbOutings.length === 0) {
      return localItems;
    }

    const dbItems: OutingItem[] = dbOutings.map((out: any) => {
      const hostProfile = Array.isArray(out.profiles) ? out.profiles[0] : out.profiles;
      const hostName = hostProfile?.display_name || '';
      const hostAvatar = hostProfile?.avatar_url || (hostName ? getGenderAvatarForName(hostName) : '');
      const members = Array.isArray(out.outing_members) ? out.outing_members : [];
      const seatsFilled = Math.max(1, members.filter((m: any) => m.state === 'accepted').length);

      let dateTimeStr = '';
      if (out.starts_at) {
        const d = new Date(out.starts_at);
        if (!isNaN(d.getTime())) {
          dateTimeStr = d.toLocaleDateString('en-SG', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
          });
        }
      }

      return {
        id: out.id,
        title: out.title,
        pitch: out.pitch || '',
        area: out.area || 'Singapore',
        dateTime: dateTimeStr,
        hostId: out.host_id,
        hostName,
        hostAvatar,
        seatsTotal: out.max_participants || 6,
        seatsFilled,
      };
    });

    const dbIds = new Set(dbItems.map((i) => i.id));
    const uniqueLocal = localItems.filter((i) => !dbIds.has(i.id));

    return [...dbItems, ...uniqueLocal];
  } catch {
    return localItems;
  }
}
