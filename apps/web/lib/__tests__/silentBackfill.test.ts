import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runSilentDeeperPassBackfill } from '../silentBackfill';
import * as userStoreModule from '../userStore';
import * as supabaseModule from '../supabase';
import * as supabaseOnboardingModule from '../supabaseOnboarding';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

if (typeof window === 'undefined' || !window.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
}

describe('One-Time Silent Deeper Pass Backfill', () => {
  const sampleUserId = '00000000-0000-0000-0000-000000000077';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('1. Skips execution if backfill flag is already set in localStorage', async () => {
    localStorage.setItem(`soul_tribe_deeper_pass_backfilled_v1_${sampleUserId}`, 'true');

    const saveSpy = vi.spyOn(supabaseOnboardingModule, 'saveDeeperPassToSupabase');

    await runSilentDeeperPassBackfill(sampleUserId);

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('2. Backfills missing server sections and preserves server values (server priority)', async () => {
    // Local storage has Section 2 (messagingStyle) and Section 5 (mbti)
    vi.spyOn(userStoreModule, 'getUserProfile').mockReturnValue({
      id: sampleUserId,
      deepProfile: {
        messagingStyle: 'local_messaging_value',
        mbti: 'INTJ',
      },
      completedCategoryNums: [2, 5],
    } as any);

    // Mock Supabase server returning server messagingStyle = 'server_messaging_value' (server wins)
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        deep_profile: {
          messagingStyle: 'server_messaging_value', // server has value
        },
        completed_categories: [2], // server already completed cat 2
      },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    });

    vi.spyOn(supabaseModule, 'checkIsSupabaseConfigured').mockReturnValue(true);
    vi.spyOn(supabaseModule, 'getSupabaseBrowserClient').mockReturnValue({
      from: mockFrom,
    } as any);

    const saveSpy = vi.spyOn(supabaseOnboardingModule, 'saveDeeperPassToSupabase').mockResolvedValue({
      success: true,
    });

    await runSilentDeeperPassBackfill(sampleUserId);

    // Assert saveDeeperPassToSupabase was called with merged data where server value won
    expect(saveSpy).toHaveBeenCalledWith(
      sampleUserId,
      expect.objectContaining({
        messagingStyle: 'server_messaging_value', // server priority verified
        mbti: 'INTJ', // backfilled from local
      }),
      [2, 5] // merged category numbers
    );

    // Assert one-time flag was set in localStorage
    expect(localStorage.getItem(`soul_tribe_deeper_pass_backfilled_v1_${sampleUserId}`)).toBe('true');
  });

  it('3. Fails quietly and sets flag on unexpected error without throwing', async () => {
    vi.spyOn(supabaseModule, 'checkIsSupabaseConfigured').mockReturnValue(true);
    vi.spyOn(supabaseModule, 'getSupabaseBrowserClient').mockImplementation(() => {
      throw new Error('Network error');
    });

    await expect(runSilentDeeperPassBackfill(sampleUserId)).resolves.not.toThrow();
    expect(localStorage.getItem(`soul_tribe_deeper_pass_backfilled_v1_${sampleUserId}`)).toBe('true');
  });
});
