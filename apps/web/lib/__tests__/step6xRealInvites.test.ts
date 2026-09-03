import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fetchInvitedOutings, acceptInvite, declineInvite } from '../outingsStore';
import * as supabaseModule from '../supabase';

vi.mock('../supabase', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    checkIsSupabaseConfigured: () => true,
    getSupabaseBrowserClient: vi.fn(),
  };
});

describe('Step 6x — Real Invitations Path & Zero Fabricated Content', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Assertion 1: The fabricated file is gone
  it('1. Asserts apps/web/lib/invitesStore.ts is deleted from disk', () => {
    const fileExists = fs.existsSync(path.resolve(__dirname, '../invitesStore.ts'));
    expect(fileExists).toBe(false);
  });

  // Assertion 2: No invented content remains in page.tsx or Nav.tsx
  it('2. Asserts no fabricated strings or names exist in page.tsx or Nav.tsx', () => {
    const pagePath = path.resolve(__dirname, '../../app/outings/page.tsx');
    const navPath = path.resolve(__dirname, '../../components/Nav.tsx');

    const pageContent = fs.readFileSync(pagePath, 'utf8');
    const navContent = fs.readFileSync(navPath, 'utf8');
    const combined = pageContent + '\n' + navContent;

    const forbidden = [
      'Cowboy Night',
      'Pulau Ubin',
      'Ladies night',
      'Yasmin',
      'Samuel Nair',
      'Mervyn Tang',
      'contextReason',
      'DEFAULT_INVITES',
      '2 sept',
    ];

    forbidden.forEach((term) => {
      expect(combined.includes(term)).toBe(false);
    });
  });

  // Assertion 3: Invitations come from the database
  it('3. fetchInvitedOutings filters out demo hosts and non-invited states from database query', async () => {
    const mockClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation((col: string, val: any) => {
        if (col === 'state' && val === 'invited') {
          return Promise.resolve({
            data: [
              {
                outing_id: 'real-invited-outing-1',
                state: 'invited',
                role: 'guest',
                is_demo: false,
                outings: {
                  id: 'real-invited-outing-[#1]',
                  host_id: 'real-host-uuid-777',
                  title: 'Real Coffee Tasting',
                  pitch: 'Exploring specialty espresso roasts',
                  activity_category: 'coffee',
                  area: 'Tiong Bahru',
                  starts_at: '2026-09-15T14:00:00Z',
                  max_participants: 6,
                  is_demo: false,
                  profiles: { display_name: 'Clara Lim', avatar_url: 'https://example.com/clara.jpg', is_demo: false },
                  outing_members: [{ user_id: 'real-host-uuid-777', state: 'accepted', is_demo: false }],
                },
              },
              {
                outing_id: 'demo-invited-outing-2',
                state: 'invited',
                role: 'guest',
                is_demo: true,
                outings: {
                  id: 'demo-invited-outing-2',
                  host_id: '00000000-0000-0000-0000-000000000010',
                  title: 'Demo Outing',
                  pitch: 'Demo pitch',
                  activity_category: 'coffee',
                  area: 'Orchard',
                  starts_at: '2026-09-16T14:00:00Z',
                  max_participants: 6,
                  is_demo: true,
                  profiles: { display_name: 'Demo Host', avatar_url: '', is_demo: true },
                  outing_members: [],
                },
              },
            ],
            error: null,
          });
        }
        return mockClient;
      }),
    };

    vi.spyOn(supabaseModule, 'getSupabaseBrowserClient').mockReturnValue(mockClient as any);

    const invited = await fetchInvitedOutings('real-user-uuid-999');
    expect(invited).toHaveLength(1);
    expect(invited[0].title).toBe('Real Coffee Tasting');
    expect(invited[0].hostName).toBe('Clara Lim');
    expect(invited[0].hostAvatar).toBe('https://example.com/clara.jpg');
  });

  // Assertion 4: No user, no invitations
  it('4. fetchInvitedOutings(undefined) returns [] without calling Supabase', async () => {
    const mockClient = { from: vi.fn() };
    vi.spyOn(supabaseModule, 'getSupabaseBrowserClient').mockReturnValue(mockClient as any);

    const results = await fetchInvitedOutings(undefined);
    expect(results).toEqual([]);
    expect(mockClient.from).not.toHaveBeenCalled();
  });

  // Assertion 5: Accept writes to the database and throws on failure
  it('5. acceptInvite updates outing_members to state accepted and throws on database error', async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq1 = vi.fn().mockReturnThis();
    const mockEq2 = vi.fn().mockResolvedValue({ error: { code: '42501', message: 'RLS policy violation' } });

    const mockClient = {
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
      }),
    };
    mockUpdate.mockReturnValue({ eq: mockEq1 });
    mockEq1.mockReturnValue({ eq: mockEq2 });

    vi.spyOn(supabaseModule, 'getSupabaseBrowserClient').mockReturnValue(mockClient as any);

    await expect(acceptInvite('outing-123', 'user-456')).rejects.toThrow('[Supabase 42501] RLS policy violation');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'accepted' })
    );
  });

  // Assertion 6: Failures are not swallowed in page.tsx
  it('6. Asserts app/outings/page.tsx contains no .catch(() => [])', () => {
    const pagePath = path.resolve(__dirname, '../../app/outings/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf8');

    expect(content.includes('.catch(() => [])')).toBe(false);
  });

  // Assertion 7: The tab is wired to fetchInvitedOutings and does not import invitesStore
  it('7. Asserts app/outings/page.tsx imports fetchInvitedOutings and does not import invitesStore', () => {
    const pagePath = path.resolve(__dirname, '../../app/outings/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf8');

    expect(content).toContain('fetchInvitedOutings');
    expect(content.includes('invitesStore')).toBe(false);
  });
});
