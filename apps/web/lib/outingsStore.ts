import { getGenderAvatarForName } from '@soul-tribe/core';
import { checkIsSupabaseConfigured, getSupabaseBrowserClient } from './supabase';
import { getUserPitches, PitchedOuting } from './userStore';

export interface OutingItem {
  id: string;
  title: string;
  pitch: string;
  area: string;
  category: string;
  dateTime: string;
  startsAt?: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  isHostDemo?: boolean;
  seatsTotal: number;
  seatsFilled: number;
  state?: string;
  fitBadge?: string;
  cover_image_url?: string;
  cover_image_thumb_url?: string;
  cover_image_alt?: string;
  cover_photographer_name?: string;
  cover_photographer_url?: string;
  cover_download_location?: string;
}

export function getOutingCategoryImage(category: string, title?: string, area?: string): string {
  const cat = (category || '').toLowerCase();
  const t = (title || '').toLowerCase();
  const a = (area || '').toLowerCase();

  if (t.includes('craft') || t.includes('beer') || t.includes('saloon') || t.includes('night') || cat === 'nightlife') {
    return 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80';
  }
  if (t.includes('ubin') || t.includes('cycle') || t.includes('cycling') || t.includes('trail') || t.includes('hike') || cat === 'active' || cat === 'outdoor') {
    return 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&auto=format&fit=crop&q=80';
  }
  if (t.includes('coffee') || t.includes('cafe') || t.includes('espresso') || cat === 'coffee') {
    return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80';
  }
  if (t.includes('pottery') || t.includes('ceramic') || t.includes('art') || cat === 'arts') {
    return 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80';
  }
  if (t.includes('dinner') || t.includes('food') || t.includes('ramen') || cat === 'dining') {
    return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80';
}

/**
 * Fetch outings the user is participating in (accepted or requested).
 * Propagates query errors so UI can render explicit error state.
 * Hard demo rule: if userId is present, never returns any demo item.
 */
export async function fetchGoingOutings(userId?: string): Promise<OutingItem[]> {
  const localPitches = getUserPitches();
  const localJoinedItems: OutingItem[] = localPitches
    .filter((p) => (p as any).state === 'accepted' || (p as any).state === 'requested')
    .filter((p) => !userId || !(p as any).isDemo)
    .map((p) => ({
      id: p.id,
      title: p.title,
      pitch: p.pitch,
      area: p.area,
      dateTime: p.dateTime,
      hostId: p.hostId || userId || 'user',
      hostName: p.hostName,
      hostAvatar: p.hostAvatar,
      isHostDemo: Boolean((p as any).isDemo || (p.hostId && p.hostId.startsWith('00000000-0000-0000-0000-'))),
      seatsTotal: p.seatsTotal,
      seatsFilled: p.seatsFilled,
      state: 'requested',
      category: (p as any).category,
      cover_image_url: p.cover_image_url,
      cover_image_thumb_url: p.cover_image_thumb_url,
      cover_image_alt: p.cover_image_alt,
      cover_photographer_name: p.cover_photographer_name,
      cover_photographer_url: p.cover_photographer_url,
      cover_download_location: p.cover_download_location,
    }));

  if (!checkIsSupabaseConfigured() || !userId) {
    return localJoinedItems;
  }

  const client = getSupabaseBrowserClient();
  const { data: memberRows, error } = await client
    .from('outing_members')
    .select(`
      outing_id,
      state,
      role,
      is_demo,
      outings (
        id,
        host_id,
        title,
        pitch,
        activity_category,
        area,
        starts_at,
        max_participants,
        is_demo,
        profiles!outings_host_id_fkey (display_name, avatar_url, is_demo),
        outing_members (user_id, state, is_demo)
      )
    `)
    .eq('user_id', userId)
    .in('state', ['accepted', 'requested']);

  if (error) {
    console.error('[SoulTribe] Supabase query error in fetchGoingOutings:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`[Supabase ${error.code || 'ERROR'}] ${error.message}`);
  }

  const dbItems: OutingItem[] = (memberRows || [])
    .filter((row: any) => {
      const out = row.outings;
      if (!out) return false;
      const hostProfile = Array.isArray(out.profiles) ? out.profiles[0] : out.profiles;
      const isDemo = Boolean(
        row.is_demo ||
        out.is_demo ||
        hostProfile?.is_demo ||
        (out.host_id && String(out.host_id).startsWith('00000000-0000-0000-0000-'))
      );
      if (userId && isDemo) return false;
      return true;
    })
    .map((row: any) => {
      const out = row.outings;
      const hostProfile = Array.isArray(out.profiles) ? out.profiles[0] : out.profiles;
      const hostName = hostProfile?.display_name || '';
      const hostAvatar = hostProfile?.avatar_url || (hostName ? getGenderAvatarForName(hostName) : '');
      const members = Array.isArray(out.outing_members) ? out.outing_members : [];
      const seatsFilled = Math.max(1, members.filter((m: any) => m.state === 'accepted').length);
      const isHostDemo = Boolean(
        hostProfile?.is_demo ||
        out.is_demo ||
        (out.host_id && String(out.host_id).startsWith('00000000-0000-0000-0000-'))
      );

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
        category: out.activity_category || 'coffee',
        dateTime: dateTimeStr,
        startsAt: out.starts_at,
        hostId: out.host_id,
        hostName,
        hostAvatar,
        isHostDemo,
        seatsTotal: out.max_participants || 6,
        seatsFilled,
        state: row.state,
        cover_image_url: out.cover_image_url,
        cover_image_thumb_url: out.cover_image_thumb_url,
        cover_image_alt: out.cover_image_alt,
        cover_photographer_name: out.cover_photographer_name,
        cover_photographer_url: out.cover_photographer_url,
        cover_download_location: out.cover_download_location,
      };
    });

  // Also query outings hosted by the user where host_id = userId
  const { data: hostedOutings } = await client
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
      is_demo,
      profiles!outings_host_id_fkey (display_name, avatar_url, is_demo),
      outing_members (user_id, state, is_demo)
    `)
    .eq('host_id', userId);

  if (hostedOutings) {
    const dbItemIds = new Set(dbItems.map((i) => i.id));
    hostedOutings.forEach((out: any) => {
      if (!dbItemIds.has(out.id)) {
        const hostProfile = Array.isArray(out.profiles) ? out.profiles[0] : out.profiles;
        const isDemo = Boolean(
          out.is_demo ||
          hostProfile?.is_demo ||
          (out.host_id && String(out.host_id).startsWith('00000000-0000-0000-0000-'))
        );
        if (userId && isDemo) return;

        const hostName = hostProfile?.display_name || '';
        const hostAvatar = hostProfile?.avatar_url || (hostName ? getGenderAvatarForName(hostName) : '');
        const members = Array.isArray(out.outing_members) ? out.outing_members : [];
        const seatsFilled = Math.max(1, members.filter((m: any) => m.state === 'accepted').length);
        const isHostDemo = Boolean(
          hostProfile?.is_demo ||
          out.is_demo ||
          (out.host_id && String(out.host_id).startsWith('00000000-0000-0000-0000-'))
        );

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

        dbItems.push({
          id: out.id,
          title: out.title,
          pitch: out.pitch || '',
          area: out.area || 'Singapore',
          category: out.activity_category || 'coffee',
          dateTime: dateTimeStr,
          startsAt: out.starts_at,
          hostId: out.host_id,
          hostName,
          hostAvatar,
          isHostDemo,
          seatsTotal: out.max_participants || 6,
          seatsFilled,
          state: 'requested',
          cover_image_url: out.cover_image_url,
          cover_image_thumb_url: out.cover_image_thumb_url,
          cover_image_alt: out.cover_image_alt,
          cover_photographer_name: out.cover_photographer_name,
          cover_photographer_url: out.cover_photographer_url,
          cover_download_location: out.cover_download_location,
        });
      }
    });
  }

  const dbIds = new Set(dbItems.map((i) => i.id));
  const uniqueLocalJoined = localJoinedItems.filter((i) => !dbIds.has(i.id));

  return [...dbItems, ...uniqueLocalJoined];
}

/**
 * Fetch outings the user has been invited to (state = 'invited').
 * Propagates query errors so UI can render explicit error state.
 * Hard demo rule: if userId is missing, returns []. Never falls back to local or default list.
 */
export async function fetchInvitedOutings(userId?: string): Promise<OutingItem[]> {
  if (!checkIsSupabaseConfigured() || !userId) {
    return [];
  }

  const client = getSupabaseBrowserClient();
  const { data: memberRows, error } = await client
    .from('outing_members')
    .select(`
      outing_id,
      state,
      role,
      is_demo,
      outings (
        id,
        host_id,
        title,
        pitch,
        activity_category,
        area,
        starts_at,
        max_participants,
        is_demo,
        profiles!outings_host_id_fkey (display_name, avatar_url, is_demo),
        outing_members (user_id, state, is_demo)
      )
    `)
    .eq('user_id', userId)
    .eq('state', 'invited');

  if (error) {
    console.error('[SoulTribe] Supabase query error in fetchInvitedOutings:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`[Supabase ${error.code || 'ERROR'}] ${error.message}`);
  }

  if (!memberRows || memberRows.length === 0) {
    return [];
  }

  return (memberRows || [])
    .filter((row: any) => {
      const out = row.outings;
      if (!out) return false;
      const hostProfile = Array.isArray(out.profiles) ? out.profiles[0] : out.profiles;
      const isDemo = Boolean(
        row.is_demo ||
        out.is_demo ||
        hostProfile?.is_demo ||
        (out.host_id && String(out.host_id).startsWith('00000000-0000-0000-0000-'))
      );
      if (isDemo) return false;
      return true;
    })
    .map((row: any) => {
      const out = row.outings;
      const hostProfile = Array.isArray(out.profiles) ? out.profiles[0] : out.profiles;
      const hostName = hostProfile?.display_name || '';
      const hostAvatar = hostProfile?.avatar_url || '';
      const members = Array.isArray(out.outing_members) ? out.outing_members : [];
      const seatsFilled = Math.max(1, members.filter((m: any) => m.state === 'accepted').length);
      const isHostDemo = Boolean(
        hostProfile?.is_demo ||
        out.is_demo ||
        (out.host_id && String(out.host_id).startsWith('00000000-0000-0000-0000-'))
      );

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
        category: out.activity_category || 'coffee',
        dateTime: dateTimeStr,
        startsAt: out.starts_at,
        hostId: out.host_id,
        hostName,
        hostAvatar,
        isHostDemo,
        seatsTotal: out.max_participants || 6,
        seatsFilled,
        state: 'invited',
        cover_image_url: out.cover_image_url,
        cover_image_thumb_url: out.cover_image_thumb_url,
        cover_image_alt: out.cover_image_alt,
        cover_photographer_name: out.cover_photographer_name,
        cover_photographer_url: out.cover_photographer_url,
        cover_download_location: out.cover_download_location,
      };
    });
}

export async function acceptInvite(outingId: string, userId: string): Promise<void> {
  if (!checkIsSupabaseConfigured() || !userId || !outingId) return;
  const client = getSupabaseBrowserClient();
  const { error } = await client
    .from('outing_members')
    .update({ state: 'accepted', responded_at: new Date().toISOString() })
    .eq('outing_id', outingId)
    .eq('user_id', userId);

  if (error) {
    console.error('[SoulTribe] Failed to accept invitation:', error);
    throw new Error(`[Supabase ${error.code || 'ERROR'}] ${error.message}`);
  }
}

export async function declineInvite(outingId: string, userId: string): Promise<void> {
  if (!checkIsSupabaseConfigured() || !userId || !outingId) return;
  const client = getSupabaseBrowserClient();
  const { error } = await client
    .from('outing_members')
    .update({ state: 'declined', responded_at: new Date().toISOString() })
    .eq('outing_id', outingId)
    .eq('user_id', userId);

  if (error) {
    console.error('[SoulTribe] Failed to decline invitation:', error);
    throw new Error(`[Supabase ${error.code || 'ERROR'}] ${error.message}`);
  }
}

/**
 * Fetch open outings for "On Your Radar".
 * Propagates query errors so UI can render explicit error state.
 * Hard demo rule: if userId is present, never returns any demo item.
 */
export async function fetchRadarOutings(userId?: string): Promise<OutingItem[]> {
  if (!checkIsSupabaseConfigured() || !userId) {
    return [];
  }

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
      is_demo,
      profiles!outings_host_id_fkey (display_name, avatar_url, is_demo),
      outing_members (user_id, state, is_demo)
    `)
    .eq('state', 'open');

  if (error) {
    console.error('[SoulTribe] Supabase query error in fetchRadarOutings:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`[Supabase ${error.code || 'ERROR'}] ${error.message}`);
  }

  if (!outingRows || outingRows.length === 0) {
    return [];
  }

  // Hard demo rule: filter out own outings AND any demo outings
  const filteredRows = (outingRows || []).filter((out: any) => {
    if (out.host_id === userId) return false;
    const hostProfile = Array.isArray(out.profiles) ? out.profiles[0] : out.profiles;
    const isDemo = Boolean(out.is_demo || hostProfile?.is_demo);
    if (userId && isDemo) return false;
    return true;
  });

  return filteredRows.map((out: any) => {
    const hostProfile = Array.isArray(out.profiles) ? out.profiles[0] : out.profiles;
    const hostName = hostProfile?.display_name || '';
    const hostAvatar = hostProfile?.avatar_url || (hostName ? getGenderAvatarForName(hostName) : '');
    const members = Array.isArray(out.outing_members) ? out.outing_members : [];
    const seatsFilled = members.filter((m: any) => m.state === 'accepted').length;
    const isHostDemo = Boolean(hostProfile?.is_demo || out.is_demo);

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
      category: out.activity_category || 'coffee',
      dateTime: dateTimeStr,
      startsAt: out.starts_at,
      hostId: out.host_id,
      hostName,
      hostAvatar,
      isHostDemo,
      seatsTotal: out.max_participants || 6,
      seatsFilled,
      cover_image_url: out.cover_image_url,
      cover_image_thumb_url: out.cover_image_thumb_url,
      cover_image_alt: out.cover_image_alt,
      cover_photographer_name: out.cover_photographer_name,
      cover_photographer_url: out.cover_photographer_url,
      cover_download_location: out.cover_download_location,
      fitBadge: undefined, // Fit badge is ONLY calculated by engine, never typed or hardcoded
    };
  });
}

/**
 * Fetch pitches hosted by the user.
 * Propagates query errors so UI can render explicit error state.
 * Hard demo rule: if userId is present, never returns any demo item.
 */
export async function fetchUserPitches(userId?: string): Promise<OutingItem[]> {
  const localPitches = getUserPitches();
  const localItems: OutingItem[] = localPitches
    .filter((p) => !userId || !(p as any).isDemo)
    .map((p) => ({
      id: p.id,
      title: p.title,
      pitch: p.pitch,
      area: p.area,
      dateTime: p.dateTime,
      hostId: userId || 'user',
      hostName: p.hostName,
      hostAvatar: p.hostAvatar,
      isHostDemo: Boolean((p as any).isDemo || (p.hostId && p.hostId.startsWith('00000000-0000-0000-0000-'))),
      seatsTotal: p.seatsTotal,
      seatsFilled: p.seatsFilled,
      category: (p as any).category,
      cover_image_url: p.cover_image_url,
      cover_image_thumb_url: p.cover_image_thumb_url,
      cover_image_alt: p.cover_image_alt,
      cover_photographer_name: p.cover_photographer_name,
      cover_photographer_url: p.cover_photographer_url,
      cover_download_location: p.cover_download_location,
    }));

  if (!checkIsSupabaseConfigured() || !userId) {
    return localItems;
  }

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
      is_demo,
      profiles!outings_host_id_fkey (display_name, avatar_url, is_demo),
      outing_members (user_id, state, is_demo)
    `)
    .eq('host_id', userId);

  if (error) {
    console.error('[SoulTribe] Supabase query error in fetchUserPitches:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`[Supabase ${error.code || 'ERROR'}] ${error.message}`);
  }

  if (!dbOutings || dbOutings.length === 0) {
    return localItems;
  }

  const dbItems: OutingItem[] = (dbOutings || [])
    .filter((out: any) => {
      const hostProfile = Array.isArray(out.profiles) ? out.profiles[0] : out.profiles;
      const isDemo = Boolean(
        out.is_demo ||
        hostProfile?.is_demo ||
        (out.host_id && String(out.host_id).startsWith('00000000-0000-0000-0000-'))
      );
      if (userId && isDemo) return false;
      return true;
    })
    .map((out: any) => {
      const hostProfile = Array.isArray(out.profiles) ? out.profiles[0] : out.profiles;
      const hostName = hostProfile?.display_name || '';
      const hostAvatar = hostProfile?.avatar_url || (hostName ? getGenderAvatarForName(hostName) : '');
      const members = Array.isArray(out.outing_members) ? out.outing_members : [];
      const seatsFilled = Math.max(1, members.filter((m: any) => m.state === 'accepted').length);
      const isHostDemo = Boolean(
        hostProfile?.is_demo ||
        out.is_demo ||
        (out.host_id && String(out.host_id).startsWith('00000000-0000-0000-0000-'))
      );

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
        category: out.activity_category || 'coffee',
        dateTime: dateTimeStr,
        startsAt: out.starts_at,
        hostId: out.host_id,
        hostName,
        hostAvatar,
        isHostDemo,
        seatsTotal: out.max_participants || 6,
        seatsFilled,
        cover_image_url: out.cover_image_url,
        cover_image_thumb_url: out.cover_image_thumb_url,
        cover_image_alt: out.cover_image_alt,
        cover_photographer_name: out.cover_photographer_name,
        cover_photographer_url: out.cover_photographer_url,
        cover_download_location: out.cover_download_location,
      };
    });

  const dbIds = new Set(dbItems.map((i) => i.id));
  const uniqueLocal = localItems.filter((i) => !dbIds.has(i.id));

  return [...dbItems, ...uniqueLocal];
}
