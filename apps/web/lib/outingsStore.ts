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

export function getOutingCategoryImage(category?: string, title?: string): string {
  const t = (title || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // 1. Title Specific High-Resolution Photography Matching
  if (t.includes('dating') || t.includes('singles') || t.includes('romance') || t.includes('match') || t.includes('relationship')) {
    // Cozy candlelit discussion lounge atmosphere
    return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1080&auto=format&fit=crop&q=85';
  }
  if (t.includes('board game') || t.includes('game') || t.includes('catan') || t.includes('chess') || t.includes('tabletop')) {
    // Tabletop board games setting
    return 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=1080&auto=format&fit=crop&q=85';
  }
  if (t.includes('ramen') || t.includes('sushi') || t.includes('japanese') || t.includes('noodle')) {
    // Japanese dining bar
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1080&auto=format&fit=crop&q=85';
  }
  if (t.includes('book') || t.includes('reading') || t.includes('library') || t.includes('literature') || t.includes('novel')) {
    // Bookshop library
    return 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1080&auto=format&fit=crop&q=85';
  }
  if (t.includes('coffee') || t.includes('cafe') || t.includes('latte') || t.includes('matcha') || t.includes('espresso')) {
    // Specialty coffee & latte art
    return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&auto=format&fit=crop&q=85';
  }
  if (t.includes('cocktail') || t.includes('wine') || t.includes('drinks') || t.includes('speakeasy') || t.includes('bar') || t.includes('pub') || t.includes('beer')) {
    // Speakeasy lounge bar
    return 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1080&auto=format&fit=crop&q=85';
  }
  if (t.includes('pottery') || t.includes('ceramic') || t.includes('craft') || t.includes('clay') || t.includes('paint')) {
    // Pottery studio workshop
    return 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1080&auto=format&fit=crop&q=85';
  }
  if (t.includes('hike') || t.includes('walk') || t.includes('bouldering') || t.includes('climb') || t.includes('run') || t.includes('park')) {
    // Nature hiking trail
    return 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1080&auto=format&fit=crop&q=85';
  }
  if (t.includes('museum') || t.includes('gallery') || t.includes('art') || t.includes('exhibition')) {
    // Modern art gallery
    return 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&auto=format&fit=crop&q=85';
  }

  // 2. Category Fallbacks with Ultra High-Res Photography
  if (cat.includes('coffee')) {
    return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&auto=format&fit=crop&q=85';
  }
  if (cat.includes('dining') || cat.includes('food')) {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1080&auto=format&fit=crop&q=85';
  }
  if (cat.includes('active') || cat.includes('outdoor')) {
    return 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1080&auto=format&fit=crop&q=85';
  }
  if (cat.includes('intellectual')) {
    return 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1080&auto=format&fit=crop&q=85';
  }
  if (cat.includes('cultural') || cat.includes('art')) {
    return 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1080&auto=format&fit=crop&q=85';
  }
  if (cat.includes('nightlife') || cat.includes('drinks')) {
    return 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1080&auto=format&fit=crop&q=85';
  }
  if (cat.includes('creative') || cat.includes('craft')) {
    return 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1080&auto=format&fit=crop&q=85';
  }
  return 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1080&auto=format&fit=crop&q=85';
}

import { getUserPitches, getJoinedOutingsLocal } from './userStore';

export async function fetchGoingOutings(userId?: string): Promise<OutingItem[]> {
  const localJoinedIds = new Set(getJoinedOutingsLocal());

  if (!checkIsSupabaseConfigured() || !userId) {
    const localPitches = getUserPitches();
    return localPitches
      .filter((p) => localJoinedIds.has(p.id))
      .map((p) => ({
        id: p.id,
        title: p.title,
        pitch: p.pitch,
        area: p.area,
        dateTime: p.dateTime,
        hostId: p.hostId || 'host',
        hostName: p.hostName,
        hostAvatar: p.hostAvatar,
        seatsTotal: p.seatsTotal,
        seatsFilled: p.seatsFilled,
        state: 'requested',
      }));
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
      .in('state', ['accepted', 'requested']);

    const dbItems: OutingItem[] = (memberRows || [])
      .map((row: any) => {
        const out = row.outings;
        if (!out) return null;
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
          state: row.state,
        };
      })
      .filter(Boolean) as OutingItem[];

    // Fetch details for any locally joined outing IDs not yet returned from DB
    const dbOutingIds = new Set(dbItems.map((item) => item.id));
    const missingJoinedIds = Array.from(localJoinedIds).filter((id) => !dbOutingIds.has(id));

    if (missingJoinedIds.length > 0) {
      const { data: missingOutings } = await client
        .from('outings')
        .select(`
          id,
          host_id,
          title,
          pitch,
          area,
          starts_at,
          max_participants,
          profiles!outings_host_id_fkey (display_name, avatar_url),
          outing_members (user_id, state)
        `)
        .in('id', missingJoinedIds);

      if (missingOutings) {
        missingOutings.forEach((out: any) => {
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

          dbItems.push({
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
            state: 'requested',
          });
        });
      }
    }

    return dbItems;
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
      .eq('state', 'open');
    if (userId) {
      // Exclude own outings from radar
    }

    const filteredRows = (outingRows || []).filter((out: any) => out.host_id !== userId);

    if (error || filteredRows.length === 0) {
      return [];
    }

    return filteredRows.map((out: any) => {
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
