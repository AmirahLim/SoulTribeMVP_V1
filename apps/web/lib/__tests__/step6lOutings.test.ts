import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchRadarOutings, fetchGoingOutings, fetchUserPitches } from '../outingsStore';
import * as supabaseModule from '../supabase';

vi.mock('../supabase', async () => {
  const actual = await vi.importActual<any>('../supabase');
  return {
    ...actual,
    checkIsSupabaseConfigured: vi.fn(() => true),
    getSupabaseBrowserClient: vi.fn(),
  };
});

describe('Step 6l — Outings Store Invariants & Hard Demo Rule', () => {
  const mockUserId = '00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseModule.checkIsSupabaseConfigured as any).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. With a real userId and a mocked client returning zero rows, all three functions return [] — never demo items', async () => {
    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'outings') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }
      if (table === 'outing_members') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    (supabaseModule.getSupabaseBrowserClient as any).mockReturnValue({ from: mockFrom });

    const radar = await fetchRadarOutings(mockUserId);
    const going = await fetchGoingOutings(mockUserId);
    const pitches = await fetchUserPitches(mockUserId);

    expect(radar).toEqual([]);
    expect(going).toEqual([]);
    expect(pitches).toEqual([]);

    expect(radar.some((i) => i.isHostDemo)).toBe(false);
    expect(going.some((i) => i.isHostDemo)).toBe(false);
    expect(pitches.some((i) => i.isHostDemo)).toBe(false);
  });

  it('2. With a real userId and a mocked client returning an error, the error propagates — never demo items', async () => {
    const mockDbError = { code: 'PGRST116', message: 'Database query execution failed' };

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'outings') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: mockDbError }),
          }),
        };
      }
      if (table === 'outing_members') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({ data: null, error: mockDbError }),
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    (supabaseModule.getSupabaseBrowserClient as any).mockReturnValue({ from: mockFrom });

    await expect(fetchRadarOutings(mockUserId)).rejects.toThrow(/PGRST116/);
    await expect(fetchGoingOutings(mockUserId)).rejects.toThrow(/PGRST116/);
    await expect(fetchUserPitches(mockUserId)).rejects.toThrow(/PGRST116/);
  });

  it('3. No item with isHostDemo: true is ever returned when a real userId is present', async () => {
    const mockRows = [
      {
        id: 'real-outing-1',
        host_id: '00000000-0000-0000-0000-000000000002',
        title: 'Real Outing',
        pitch: 'Real pitch',
        activity_category: 'coffee',
        area: 'Orchard',
        starts_at: '2026-09-10T10:00:00Z',
        max_participants: 6,
        state: 'open',
        is_demo: false,
        profiles: { display_name: 'Real Host', avatar_url: '', is_demo: false },
        outing_members: [],
      },
      {
        id: 'demo-outing-1',
        host_id: '00000000-0000-0000-0000-000000000099',
        title: 'Demo Outing',
        pitch: 'Demo pitch',
        activity_category: 'coffee',
        area: 'Tiong Bahru',
        starts_at: '2026-09-10T10:00:00Z',
        max_participants: 6,
        state: 'open',
        is_demo: true,
        profiles: { display_name: 'Demo Host', avatar_url: '', is_demo: true },
        outing_members: [],
      },
    ];

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'outings') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    (supabaseModule.getSupabaseBrowserClient as any).mockReturnValue({ from: mockFrom });

    const radar = await fetchRadarOutings(mockUserId);
    expect(radar).toHaveLength(1);
    expect(radar[0].id).toBe('real-outing-1');
    expect(radar.every((i) => !i.isHostDemo)).toBe(true);
  });

  it('4. A real outing with no engine-computed fit renders with fitBadge: undefined', async () => {
    const mockRows = [
      {
        id: 'real-outing-2',
        host_id: '00000000-0000-0000-0000-000000000003',
        title: 'Botanical Walk',
        pitch: 'Walk around Fort Canning',
        activity_category: 'active',
        area: 'Fort Canning',
        starts_at: '2026-09-10T10:00:00Z',
        max_participants: 6,
        state: 'open',
        is_demo: false,
        profiles: { display_name: 'Sarah', avatar_url: '', is_demo: false },
        outing_members: [],
      },
    ];

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'outings') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    (supabaseModule.getSupabaseBrowserClient as any).mockReturnValue({ from: mockFrom });

    const radar = await fetchRadarOutings(mockUserId);
    expect(radar).toHaveLength(1);
    expect(radar[0].fitBadge).toBeUndefined();
  });
});
