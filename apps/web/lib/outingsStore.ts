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

export function getOutingCategoryImage(category?: string, title?: string, area?: string): string {
  const t = (title || '').toLowerCase();
  const a = (area || '').toLowerCase();
  const cat = (category || '').toLowerCase();
  const combined = `${t} ${a} ${cat}`;

  // 1. Hyper-Specific Location & Landmark Matching (Distinct, accurate SG landmarks)
  if (combined.includes('fort canning') || combined.includes('canning')) {
    // Lush green heritage park trees & sunlit botanical lawn (Fort Canning Park)
    return 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=1080&auto=format&fit=crop&q=85';
  }
  if (combined.includes('ubin') || combined.includes('pulau ubin')) {
    // Serene tropical forest & rustic quarry lake waters (Pulau Ubin)
    return 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1080&auto=format&fit=crop&q=85';
  }
  if (combined.includes('gardens by the bay') || combined.includes('supertree')) {
    // Gardens by the Bay Supertree Grove (Singapore)
    return 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1080&auto=format&fit=crop&q=85';
  }
  if (combined.includes('sentosa') || combined.includes('tanjong') || combined.includes('siloso')) {
    // Sentosa island tropical beach & palm trees
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=85';
  }
  if (combined.includes('marina bay') || combined.includes('mbs') || combined.includes('bayfront')) {
    // Marina Bay Sands & Singapore waterfront skyline
    return 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1080&auto=format&fit=crop&q=85';
  }

  // 2. Dating Apps / Mobile App Discussions vs Romance
  if (
    combined.includes('dating app') ||
    combined.includes('online dating') ||
    combined.includes('mobile dating') ||
    combined.includes('app') ||
    combined.includes('swipe') ||
    combined.includes('tinder') ||
    combined.includes('bumble') ||
    combined.includes('hinge')
  ) {
    // Smartphone in hand displaying mobile app UI
    return 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1080&auto=format&fit=crop&q=85';
  }
  if (
    combined.includes('dating') ||
    combined.includes('singles') ||
    combined.includes('romance') ||
    combined.includes('match') ||
    combined.includes('relationship') ||
    combined.includes('speed date')
  ) {
    // Intimate lounge seating for dating discussions
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1080&auto=format&fit=crop&q=85';
  }

  // 3. Iconic Singapore City Skyline (Default for "Singapore" / "SG")
  if (combined.includes('singapore') || combined.includes('sg') || combined.includes('cbd') || combined.includes('city')) {
    // Iconic Singapore skyline waterfront view
    return 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1080&auto=format&fit=crop&q=85';
  }

  // 4. Activity Specific High-Resolution Photography
  if (combined.includes('board game') || combined.includes('catan') || combined.includes('chess') || combined.includes('tabletop')) {
    return 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=1080&auto=format&fit=crop&q=85';
  }
  if (combined.includes('ramen') || combined.includes('sushi') || combined.includes('japanese') || combined.includes('noodle')) {
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1080&auto=format&fit=crop&q=85';
  }
  if (combined.includes('book') || combined.includes('reading') || combined.includes('library') || combined.includes('literature')) {
    return 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1080&auto=format&fit=crop&q=85';
  }
  if (combined.includes('coffee') || combined.includes('cafe') || combined.includes('latte') || combined.includes('matcha')) {
    return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&auto=format&fit=crop&q=85';
  }
  if (combined.includes('cocktail') || combined.includes('wine') || combined.includes('drinks') || combined.includes('speakeasy') || combined.includes('bar')) {
    return 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1080&auto=format&fit=crop&q=85';
  }
  if (combined.includes('pottery') || combined.includes('ceramic') || combined.includes('craft') || combined.includes('clay') || combined.includes('paint')) {
    return 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1080&auto=format&fit=crop&q=85';
  }
  if (combined.includes('hike') || combined.includes('walk') || combined.includes('trail') || combined.includes('nature') || combined.includes('park')) {
    return 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1080&auto=format&fit=crop&q=85';
  }
  if (combined.includes('museum') || combined.includes('gallery') || combined.includes('art') || combined.includes('exhibition')) {
    return 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&auto=format&fit=crop&q=85';
  }

  // 5. Category Fallbacks with Distinct Photography
  if (cat.includes('coffee')) return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&auto=format&fit=crop&q=85';
  if (cat.includes('dining') || cat.includes('food')) return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1080&auto=format&fit=crop&q=85';
  if (cat.includes('active') || cat.includes('outdoor')) return 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1080&auto=format&fit=crop&q=85';
  if (cat.includes('intellectual')) return 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1080&auto=format&fit=crop&q=85';
  if (cat.includes('cultural') || cat.includes('art')) return 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&auto=format&fit=crop&q=85';
  if (cat.includes('nightlife') || cat.includes('drinks')) return 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1080&auto=format&fit=crop&q=85';
  if (cat.includes('creative') || cat.includes('craft')) return 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1080&auto=format&fit=crop&q=85';

  return 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1080&auto=format&fit=crop&q=85';
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
          activity_category,
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
          category: out.activity_category || 'coffee',
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
          activity_category,
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
            category: out.activity_category || 'coffee',
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
        category: out.activity_category || 'coffee',
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
