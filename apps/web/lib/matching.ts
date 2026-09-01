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
  async getCandidates(_opts?: { area?: string; limit?: number }): Promise<CandidateVector[]> {
    return DEMO_PROFILES.map((vec) => ({
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
  if (rankScore >= 0.75) return 'Strong Fit';
  if (rankScore >= 0.55) return 'Good Fit';
  return 'Worth Exploring';
}

export async function getRankedMatches(
  user: UserProfileData,
  opts?: { area?: string; limit?: number; activityCategory?: string }
): Promise<RankedMatch[]> {
  initTelemetry();

  const limit = opts?.limit ?? 6;
  const viewerVec = toProfileVector(user);
  const source = getActiveCandidateSource();
  const candidateVecs = await source.getCandidates({ area: opts?.area, limit });

  const context: MatchContext = {
    activity_category: opts?.activityCategory as any,
  };

  const results: RankedMatch[] = [];
  let positionCounter = 1;

  for (const candVec of candidateVecs) {
    if (candVec.profile.id === viewerVec.profile.id) continue;

    // SAFEGUARD 1: Every demo candidate carries isDemo: true
    const isDemo =
      candVec.isDemo ??
      DEMO_PROFILES.some((d) => d.profile.id === candVec.profile.id);

    const matchRes = score(viewerVec, candVec, context);
    const softRes = softGate(matchRes, { provisionalFloor: 0.0 });

    // Drop anything eligible === false
    if (!softRes.eligible) continue;

    const explanation = generateMatchExplanation(viewerVec, candVec);
    const fitLabel = getFitLabel(softRes.adjustedScore);

    // SAFEGUARD 4: Do NOT log demo matches to interaction_events. Telemetry records real members only.
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

    results.push({
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
      isDemo, // SAFEGUARD 1
    });
  }

  results.sort((a, b) => b.rankScore - a.rankScore);
  return results.slice(0, limit);
}
