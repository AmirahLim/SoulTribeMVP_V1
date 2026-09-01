import {
  score,
  softGate,
  generateMatchExplanation,
  DEMO_PROFILES,
  getGenderAvatarForName,
  buildMatchSurfacedEvent,
  recordEvent,
} from '@soul-tribe/core';
import type { ProfileVector, MatchContext } from '@soul-tribe/core';
import type { UserProfileData } from './userStore';
import { toProfileVector } from './profileAdapter';
export { toProfileVector };
import { initTelemetry } from './telemetryInit';
import { getSupabaseBrowserClient, checkIsSupabaseConfigured } from './supabase';

export type CandidateMode = 'real' | 'demo' | 'mixed';

/**
 * Resolves the active candidate source mode.
 * Defaults to 'real' when NEXT_PUBLIC_CANDIDATE_MODE is missing or unrecognized.
 * Production must never fall into 'demo' or 'mixed' by accident.
 */
export function getCandidateMode(): CandidateMode {
  const envMode = process.env.NEXT_PUBLIC_CANDIDATE_MODE;
  if (envMode === 'demo' || envMode === 'mixed') {
    return envMode;
  }
  return 'real'; // Fail-closed default for production security
}

// SAFEGUARD 5: Log a clear console warning on startup when mode is not 'real'
if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'test') {
  const mode = getCandidateMode();
  if (mode !== 'real') {
    console.warn(
      `[SoulTribe WARNING] Candidate source mode set to non-production mode: "${mode}". Demo profiles will be included.`
    );
  }
}

export interface CandidateVector extends ProfileVector {
  isDemo?: boolean;
}

/** Swappable data source interface */
export interface CandidateSource {
  getCandidates(opts?: { area?: string; limit?: number }): Promise<CandidateVector[]>;
}

export const realCandidateSource: CandidateSource = {
  async getCandidates(_opts?: { area?: string; limit?: number }): Promise<CandidateVector[]> {
    if (!checkIsSupabaseConfigured()) {
      return [];
    }

    try {
      const client = getSupabaseBrowserClient();
      const { data: dbProfiles, error } = await client
        .from('profiles')
        .select('*');

      if (error || !dbProfiles) return [];

      return dbProfiles.map((p) => {
        const vec = toProfileVector(
          {
            displayName: p.display_name,
            homeArea: p.home_area,
            avatarUrl: p.avatar_url,
            bio: p.bio,
            birthYear: p.birth_year,
          },
          p.id
        );
        return {
          ...vec,
          isDemo: false,
        };
      });
    } catch {
      return [];
    }
  },
};

export const demoCandidateSource: CandidateSource = {
  async getCandidates(opts?: { area?: string; limit?: number; all?: boolean }): Promise<CandidateVector[]> {
    // Cap demo bots to 5 max (within requested 3-5 range) to make room for real members
    const pool = (opts as any)?.all ? DEMO_PROFILES : DEMO_PROFILES.slice(0, 5);
    return pool.map((vec) => ({
      ...vec,
      isDemo: true,
    }));
  },
};

export const mixedCandidateSource: CandidateSource = {
  async getCandidates(opts?: { area?: string; limit?: number }): Promise<CandidateVector[]> {
    const real = await realCandidateSource.getCandidates(opts);
    const demo = await demoCandidateSource.getCandidates(opts);
    return [...real, ...demo];
  },
};

let customActiveSource: CandidateSource | null = null;

export function getActiveCandidateSource(): CandidateSource {
  if (customActiveSource) return customActiveSource;

  const mode = getCandidateMode();
  if (mode === 'demo') return demoCandidateSource;
  if (mode === 'mixed') return mixedCandidateSource;
  return realCandidateSource;
}

export function setCandidateSource(src: CandidateSource | null): void {
  customActiveSource = src;
}

export interface RankedMatch {
  id: string;
  name: string;
  avatarUrl: string;
  homeArea: string;
  bio: string;
  rankScore: number;
  resonance: number;
  logistics: number;
  clickText: string;
  rubText: string;    // GENERATED, not hardcoded
  fitLabel: string;
  provisional: boolean;                  // thin-profile match
  isDemo: boolean;                       // SAFEGUARD 1: Flag carried to UI
}

export function getFitLabel(rankScore: number): string {
  if (rankScore >= 0.90) return 'Rare Resonance';
  if (rankScore >= 0.80) return 'Strong Resonance';
  if (rankScore >= 0.70) return 'Natural Resonance';
  if (rankScore >= 0.60) return 'Some Resonance';
  return '';
}

export function getSmallCommunityThreshold(): number {
  const envVal = process.env.NEXT_PUBLIC_SMALL_COMMUNITY_THRESHOLD;
  if (envVal !== undefined && envVal !== null && envVal.trim() !== '') {
    const parsed = parseInt(envVal, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return 30;
}

export async function countRealMembers(area?: string): Promise<number> {
  if (customActiveSource) {
    const candidates = await customActiveSource.getCandidates({ area });
    return candidates.filter((c) => !c.isDemo).length;
  }

  if (checkIsSupabaseConfigured()) {
    try {
      const client = getSupabaseBrowserClient();
      let query = client.from('profiles').select('id', { count: 'exact', head: true });
      if (area) {
        query = query.eq('home_area', area);
      }
      const { count, error } = await query;
      if (!error && typeof count === 'number') {
        return count;
      }
    } catch {
      // fallback
    }
  }

  const realCandidates = await realCandidateSource.getCandidates({ area });
  return realCandidates.filter((c) => !c.isDemo).length;
}

export function isSmallCommunityMode(realMemberCount: number): boolean {
  const threshold = getSmallCommunityThreshold();
  return realMemberCount <= threshold;
}

export function getMondayOfWeek(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export interface SurfacedRecord {
  viewer_id: string;
  shown_id: string;
  week_of: string;
  shown_at: string;
  action: 'none' | 'saved' | 'pitched_to' | 'hidden';
}

export interface SharedOutingRecord {
  viewer_id: string;
  peer_id: string;
  completed: boolean;
}

let mockSurfacedRecords: SurfacedRecord[] = [];
let mockSharedOutings: SharedOutingRecord[] = [];

export function getMockSurfacedRecords(): SurfacedRecord[] {
  return mockSurfacedRecords;
}

export function setMockSurfacedRecords(records: SurfacedRecord[]): void {
  mockSurfacedRecords = [...records];
}

export function setMockSharedOutings(records: SharedOutingRecord[]): void {
  mockSharedOutings = [...records];
}

export function clearMockSuppressionData(): void {
  mockSurfacedRecords = [];
  mockSharedOutings = [];
}

export async function recordSurfacedMatches(
  viewerId: string,
  matches: RankedMatch[]
): Promise<void> {
  const realMatches = matches.filter((m) => !m.isDemo);
  if (realMatches.length === 0 || !viewerId) return;

  const currentMonday = getMondayOfWeek();
  const nowStr = new Date().toISOString();

  // Save to mock store for local tracking / unit testing
  for (const m of realMatches) {
    const existingIdx = mockSurfacedRecords.findIndex(
      (r) => r.viewer_id === viewerId && r.shown_id === m.id && r.week_of === currentMonday
    );
    if (existingIdx >= 0) {
      mockSurfacedRecords[existingIdx].shown_at = nowStr;
    } else {
      mockSurfacedRecords.push({
        viewer_id: viewerId,
        shown_id: m.id,
        week_of: currentMonday,
        shown_at: nowStr,
        action: 'none',
      });
    }
  }

  // Database upsert if Supabase is connected
  if (checkIsSupabaseConfigured()) {
    try {
      const client = getSupabaseBrowserClient();
      const rows = realMatches.map((m, idx) => ({
        viewer_id: viewerId,
        shown_id: m.id,
        week_of: currentMonday,
        shown_at: nowStr,
        action: 'none',
        rank_position: idx + 1,
        rank_score: m.rankScore,
      }));

      await client
        .from('match_surfaced')
        .upsert(rows, { onConflict: 'viewer_id,shown_id,week_of' });
    } catch {
      // Fail-safe
    }
  }
}

export async function getSuppressionData(viewerId: string): Promise<{
  hiddenIds: Set<string>;
  softSuppressedMap: Map<string, { reason: 'outing' | 'recent_shown'; shownAt?: string }>;
}> {
  const hiddenIds = new Set<string>();
  const softSuppressedMap = new Map<string, { reason: 'outing' | 'recent_shown'; shownAt?: string }>();

  const twoWeeksAgoDate = new Date(Date.now() - 13 * 86400 * 1000);
  const twoWeeksAgoMonday = getMondayOfWeek(twoWeeksAgoDate);

  // 1. Process mock records
  for (const rec of mockSurfacedRecords) {
    if (rec.viewer_id === viewerId) {
      if (rec.action === 'hidden') {
        hiddenIds.add(rec.shown_id);
      } else if (rec.action === 'none') {
        if (rec.week_of >= twoWeeksAgoMonday) {
          softSuppressedMap.set(rec.shown_id, {
            reason: 'recent_shown',
            shownAt: rec.shown_at,
          });
        }
      }
    }
  }

  for (const outing of mockSharedOutings) {
    if (outing.completed && outing.viewer_id === viewerId) {
      softSuppressedMap.set(outing.peer_id, { reason: 'outing' });
    }
  }

  // 2. Query Supabase if connected
  if (checkIsSupabaseConfigured() && viewerId) {
    try {
      const client = getSupabaseBrowserClient();

      const { data: surfacedRows } = await client
        .from('match_surfaced')
        .select('shown_id, week_of, action, shown_at')
        .eq('viewer_id', viewerId);

      if (surfacedRows) {
        for (const row of surfacedRows) {
          if (row.action === 'hidden') {
            hiddenIds.add(row.shown_id);
          } else if (row.action === 'none') {
            if (row.week_of >= twoWeeksAgoMonday) {
              if (!softSuppressedMap.has(row.shown_id)) {
                softSuppressedMap.set(row.shown_id, {
                  reason: 'recent_shown',
                  shownAt: row.shown_at,
                });
              }
            }
          }
        }
      }

      const { data: myOutings } = await client
        .from('outing_members')
        .select('outing_id, outings!inner(state)')
        .eq('user_id', viewerId)
        .eq('state', 'accepted')
        .eq('outings.state', 'completed');

      if (myOutings && myOutings.length > 0) {
        const outingIds = myOutings.map((o: any) => o.outing_id);
        const { data: peerMembers } = await client
          .from('outing_members')
          .select('user_id')
          .in('outing_id', outingIds)
          .eq('state', 'accepted')
          .neq('user_id', viewerId);

        if (peerMembers) {
          for (const peer of peerMembers) {
            softSuppressedMap.set(peer.user_id, { reason: 'outing' });
          }
        }
      }
    } catch {
      // Fail-safe
    }
  }

  return { hiddenIds, softSuppressedMap };
}

export async function getRankedMatches(
  user: UserProfileData & { id?: string },
  opts?: { area?: string; limit?: number; activityCategory?: string; userId?: string }
): Promise<RankedMatch[]> {
  initTelemetry();

  let viewerId = user.id || opts?.userId;
  const currentMode = getCandidateMode();

  // If in real mode and viewer ID is not passed, attempt to get it from browser session
  if (!viewerId && currentMode === 'real' && checkIsSupabaseConfigured() && typeof window !== 'undefined') {
    try {
      const client = getSupabaseBrowserClient();
      const { data: { session } } = await client.auth.getSession();
      if (session?.user?.id) {
        viewerId = session.user.id;
      }
    } catch {
      // fallback
    }
  }

  // SELF-EXCLUSION GUARANTEE: If in real mode and real viewer ID is unavailable, return [] rather than risking showing the user themselves
  if (currentMode === 'real' && !viewerId && checkIsSupabaseConfigured()) {
    return [];
  }

  const effectiveId = viewerId || '00000000-0000-0000-0000-000000000099';
  const limit = opts?.limit ?? 6;
  const viewerVec = toProfileVector(user, effectiveId);
  const source = getActiveCandidateSource();
  const candidateVecs = await source.getCandidates({ area: opts?.area });

  const context: MatchContext = {
    activity_category: opts?.activityCategory as any,
  };

  const { hiddenIds, softSuppressedMap } = await getSuppressionData(effectiveId);

  const freshPool: (RankedMatch & { lastShownAt?: string })[] = [];
  const suppressedPool: (RankedMatch & { lastShownAt?: string })[] = [];
  let positionCounter = 1;

  for (const candVec of candidateVecs) {
    // HARD EXCLUSION 1: Self-exclusion
    if (candVec.profile.id === viewerVec.profile.id) continue;
    if (viewerId && candVec.profile.id === viewerId) continue;
    if (user.handle && candVec.profile.handle === user.handle.toLowerCase()) continue;

    // HARD EXCLUSION 2: Hidden candidates
    if (hiddenIds.has(candVec.profile.id)) continue;

    const isDemo =
      candVec.isDemo ??
      DEMO_PROFILES.some((d) => d.profile.id === candVec.profile.id);

    const matchRes = score(viewerVec, candVec, context);
    const softRes = softGate(matchRes, { provisionalFloor: 0.0 });

    // HARD GATE: Drop anything eligible === false
    if (!softRes.eligible) continue;

    const explanation = generateMatchExplanation(viewerVec, candVec);
    const fitLabel = getFitLabel(softRes.adjustedScore);

    if (!isDemo) {
      const surfacedEvent = buildMatchSurfacedEvent(
        viewerVec,
        candVec,
        matchRes,
        positionCounter++,
        context,
        softRes.provisional
      );
      recordEvent(surfacedEvent);
    }

    const matchItem: RankedMatch & { lastShownAt?: string } = {
      id: candVec.profile.id,
      name: candVec.profile.display_name,
      avatarUrl: candVec.profile.avatar_url || getGenderAvatarForName(candVec.profile.display_name),
      homeArea: user.homeArea || 'Singapore',
      bio: candVec.profile.bio || 'Singapore-based member.',
      rankScore: softRes.adjustedScore,
      resonance: matchRes.resonance,
      logistics: matchRes.logistics,
      clickText: explanation.click_text,
      rubText: explanation.friction_text,
      fitLabel,
      provisional: softRes.provisional,
      isDemo,
    };

    if (!isDemo && softSuppressedMap.has(candVec.profile.id)) {
      const info = softSuppressedMap.get(candVec.profile.id);
      matchItem.lastShownAt = info?.shownAt;
      suppressedPool.push(matchItem);
    } else {
      freshPool.push(matchItem);
    }
  }

  // Sort fresh pool by rankScore descending
  freshPool.sort((a, b) => b.rankScore - a.rankScore);

  // Sort suppressed pool by least-recently-shown first (oldest shownAt first)
  suppressedPool.sort((a, b) => {
    if (a.lastShownAt && b.lastShownAt) {
      const tA = new Date(a.lastShownAt).getTime();
      const tB = new Date(b.lastShownAt).getTime();
      if (tA !== tB) return tA - tB;
    } else if (a.lastShownAt) {
      return -1;
    } else if (b.lastShownAt) {
      return 1;
    }
    return b.rankScore - a.rankScore;
  });

  const realMemberCount = await countRealMembers(opts?.area || user.homeArea);
  const isSmall = isSmallCommunityMode(realMemberCount);

  let finalResults: RankedMatch[] = [];

  if (isSmall) {
    const combined = [...freshPool, ...suppressedPool];
    if (opts?.limit === undefined || opts?.limit === 6) {
      finalResults = combined;
    } else {
      finalResults = combined.slice(0, limit);
    }
  } else {
    const freshEligible = freshPool.filter((m) => m.rankScore >= 0.60);
    const suppressedEligible = suppressedPool.filter((m) => m.rankScore >= 0.60);

    if (freshEligible.length >= limit) {
      finalResults = freshEligible.slice(0, limit);
    } else {
      const needed = limit - freshEligible.length;
      finalResults = [...freshEligible, ...suppressedEligible.slice(0, needed)];
    }
  }

  if (viewerId) {
    await recordSurfacedMatches(viewerId, finalResults);
  }

  return finalResults;
}
