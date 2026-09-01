import { getSupabaseBrowserClient, checkIsSupabaseConfigured } from './supabase';

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

export const FALLBACK_GOING_OUTINGS: OutingItem[] = [
  {
    id: 'out-102',
    title: 'Sunday Morning Botanical Walk & Matcha',
    pitch: 'A gentle 5km loop around Botanic Gardens at 8am before the heat hits, followed by iced matcha.',
    area: 'Botanic Gardens, SG',
    dateTime: 'Sun 15 Sep · 8:00am',
    hostId: 'm1',
    hostName: 'Marcus Tan',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    isHostDemo: true,
    seatsTotal: 6,
    seatsFilled: 3,
    cohesionScore: 84,
  },
  {
    id: 'out-103',
    title: 'Katong Peranakan Walk & Tea',
    pitch: 'Exploring vintage shophouses and quiet courtyards in Katong followed by traditional tea.',
    area: 'Katong, Singapore',
    dateTime: 'Sat 21 Sep · 2:30pm',
    hostId: 'm2',
    hostName: 'Maya Lin',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    isHostDemo: true,
    seatsTotal: 6,
    seatsFilled: 4,
    cohesionScore: 78,
  },
];

export const FALLBACK_RADAR_OUTINGS: OutingItem[] = [
  {
    id: 'radar-101',
    title: 'Analog Vinyl Listening & Filter Coffee',
    pitch: 'Bringing 3 vintage jazz & soul records to sample on a valve amp while trying micro-lot pour overs.',
    area: 'Tiong Bahru, SG',
    dateTime: 'Fri 20 Sep · 7:00pm',
    hostId: 'r1',
    hostName: 'Sarah Chen',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    isHostDemo: true,
    seatsTotal: 4,
    seatsFilled: 2,
    fitBadge: 'Natural Resonance',
  },
  {
    id: 'radar-102',
    title: 'Sunday Morning Bouldering & Acai Bowls',
    pitch: 'Casual indoor bouldering session for all experience levels, followed by fresh acai bowls next door.',
    area: 'Kallang, SG',
    dateTime: 'Sun 22 Sep · 10:00am',
    hostId: 'r2',
    hostName: 'Daniel K.',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    isHostDemo: true,
    seatsTotal: 6,
    seatsFilled: 3,
    fitBadge: 'Strong Resonance',
  },
  {
    id: 'radar-103',
    title: 'Late Afternoon Indie Bookshop Crawl',
    pitch: 'Browsing second-hand art and poetry books across 3 quiet stores in Bras Basah, ending with coffee.',
    area: 'Bras Basah, SG',
    dateTime: 'Sat 27 Sep · 4:00pm',
    hostId: 'r3',
    hostName: 'Elena R.',
    hostAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    isHostDemo: true,
    seatsTotal: 4,
    seatsFilled: 3,
    fitBadge: 'Rare Resonance',
  },
];

export async function fetchGoingOutings(userId?: string): Promise<OutingItem[]> {
  if (!checkIsSupabaseConfigured() || !userId) {
    return [];
  }

  try {
    const client = getSupabaseBrowserClient();
    const { data: memberRows, error } = await client
      .from('outing_members')
      .select('outing_id, state, role, outings(*)')
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
        return {
          id: out.id,
          title: out.title,
          pitch: out.pitch || '',
          area: out.area || 'Singapore',
          dateTime: out.date_time || 'Upcoming',
          hostId: out.host_id,
          hostName: out.host_name || 'Member',
          hostAvatar: out.host_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          seatsTotal: out.seats_total || 6,
          seatsFilled: out.seats_filled || 1,
          cohesionScore: out.cohesion_score || 80,
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
      .select('*')
      .eq('visibility', 'requestable')
      .eq('state', 'open')
      .neq('host_id', userId);

    if (error || !outingRows || outingRows.length === 0) {
      return [];
    }

    return outingRows.map((out: any) => ({
      id: out.id,
      title: out.title,
      pitch: out.pitch || '',
      area: out.area || 'Singapore',
      dateTime: out.date_time || 'Upcoming',
      hostId: out.host_id,
      hostName: out.host_name || 'Member',
      hostAvatar: out.host_avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
      seatsTotal: out.seats_total || 6,
      seatsFilled: out.seats_filled || 1,
      fitBadge: out.fit_badge || 'Recommended Fit',
    }));
  } catch {
    return [];
  }
}
