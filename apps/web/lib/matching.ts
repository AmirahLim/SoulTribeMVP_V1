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
import type { UserProfileData } from './userStore.ts';
import { toProfileVector } from './profileAdapter.ts';
import { initTelemetry } from './telemetryInit.ts';

/** Swappable data source: DEMO_PROFILES today, Supabase after the backend lands. */
export interface CandidateSource {
  getCandidates(opts: { area?: string; limit?: number }): Promise<ProfileVector[]>;
}

export const demoCandidateSource: CandidateSource = {
  async getCandidates(_opts?: { area?: string; limit?: number }): Promise<ProfileVector[]> {
    return DEMO_PROFILES;
  },
};

let activeSource: CandidateSource = demoCandidateSource;

export function setCandidateSource(src: CandidateSource): void {
  activeSource = src;
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
  const candidateVecs = await activeSource.getCandidates({ area: opts?.area, limit });

  const context: MatchContext = {
    activity_category: opts?.activityCategory as any,
  };

  const results: RankedMatch[] = [];
  let positionCounter = 1;

  for (const candVec of candidateVecs) {
    if (candVec.profile.id === viewerVec.profile.id) continue;

    const matchRes = score(viewerVec, candVec, context);
    const softRes = softGate(matchRes, { provisionalFloor: 0.0 });

    // Drop anything eligible === false
    if (!softRes.eligible) continue;

    const explanation = generateMatchExplanation(viewerVec, candVec);
    const fitLabel = getFitLabel(softRes.adjustedScore);

    const surfacedEvent = buildMatchSurfacedEvent(
      viewerVec,
      candVec,
      matchRes,
      positionCounter++,
      context,
      softRes.provisional
    );
    recordEvent(surfacedEvent);

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
    });
  }

  results.sort((a, b) => b.rankScore - a.rankScore);
  return results.slice(0, limit);
}
