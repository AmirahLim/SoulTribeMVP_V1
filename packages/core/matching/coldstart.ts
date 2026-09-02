import type { ProfileVector, MatchResult } from '../domain/types.ts';
import { BASELINE_WEIGHTS, RESONANCE_THREADS, LOGISTICS_THREADS } from './evaluation.ts';
import type { ThreadKey } from './evaluation.ts';

export interface ColdStartOptions {
  prior?: number;            // neutral score to shrink toward, default 0.5
  priorStrength?: number;    // default 0.5 — higher = more shrinkage
  provisionalFloor?: number; // default 0.30 — below this, not eligible at all
  explorationBonus?: number; // default 0.05 — max boost for under-exposed users
}

export function confidenceFromCompleteness(vec: ProfileVector): number {
  if (!vec) return 0;

  const personalityRatio = Math.min(1, Math.max(0, (vec.personality?.answered ?? 0) / 10));
  const communicationRatio = Math.min(1, Math.max(0, (vec.communication?.answered ?? 0) / 10));
  const socialRhythmRatio = Math.min(1, Math.max(0, (vec.social_rhythm?.answered ?? 0) / 5));
  const intentRatio = Math.min(1, Math.max(0, (vec.intent?.answered ?? 0) / 3));
  const emotionalRatio = Math.min(1, Math.max(0, (vec.emotional?.answered ?? 0) / 10));
  const interestsRatio = Math.min(1, Math.max(0, (vec.interests?.length ?? 0) / 3));
  const valuesRatio = Math.min(1, Math.max(0, (vec.values?.length ?? 0) / 3));
  const lifestyleRatio = Math.min(1, Math.max(0, (vec.lifestyle?.answered ?? 0) / 5));
  const experienceRatio = Math.min(1, Math.max(0, (vec.experience?.answered ?? 0) / 5));
  const geographyRatio = Math.min(1, Math.max(0, (vec.geography?.answered ?? 0) / 2));

  const ratios: Record<ThreadKey, number> = {
    personality: personalityRatio,
    communication: communicationRatio,
    social_rhythm: socialRhythmRatio,
    intent: intentRatio,
    emotional: emotionalRatio,
    interests: interestsRatio,
    values: valuesRatio,
    lifestyle: lifestyleRatio,
    experience: experienceRatio,
    geography: geographyRatio,
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const k of Object.keys(BASELINE_WEIGHTS) as ThreadKey[]) {
    const w = BASELINE_WEIGHTS[k];
    weightedSum += ratios[k] * w;
    totalWeight += w;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

export function shrinkToPrior(
  raw: number,
  confidence: number,
  options?: ColdStartOptions
): number {
  const prior = options?.prior ?? 0.5;
  const priorStrength = options?.priorStrength ?? 0.5;

  const clampedConf = Math.max(0, Math.min(1, confidence));
  const denom = clampedConf + priorStrength * (1 - clampedConf);
  const weight = denom > 0 ? clampedConf / denom : 0;
  return weight * raw + (1 - weight) * prior;
}

export interface SoftGateResult {
  eligible: boolean;
  provisional: boolean;   // true = matched despite a thin profile
  adjustedScore: number;
  reason?: string;
}

/** The complete set of gate reason codes emitted by gates.ts.
 *  Any reason outside this set is treated as an unknown safety failure. */
export const KNOWN_GATE_REASONS: ReadonlySet<string> = new Set([
  'ACCOUNT_NOT_ACTIVE',
  'CONFIDENCE_TOO_LOW',
  'BLOCKED_OR_REPORTED',
  'AGE_PREFERENCE_MISMATCH',
  'NO_SHARED_AVAILABILITY_SLOT',
  'GEOGRAPHY_TOO_FAR',
  'DEALBREAKER_VIOLATED',
]);

export function softGate(
  result: MatchResult,
  options?: ColdStartOptions
): SoftGateResult {
  const reasons = result.gate_reasons ?? [];

  // --- FAIL-CLOSED GUARDS (must run first) ---

  // Gated, but we were given no reason why → we cannot prove it is safe. Reject.
  if (result.gated && reasons.length === 0) {
    return {
      eligible: false,
      provisional: false,
      adjustedScore: 0,
      reason: 'GATED_REASON_UNKNOWN',
    };
  }

  // A reason we do not recognise may be a new safety gate. Reject.
  if (reasons.some((r) => !KNOWN_GATE_REASONS.has(r))) {
    return {
      eligible: false,
      provisional: false,
      adjustedScore: 0,
      reason: 'UNRECOGNISED_GATE_REASON',
    };
  }

  const provisionalFloor = options?.provisionalFloor ?? 0.30;
  const confA = result.confidence_a ?? 0;
  const confB = result.confidence_b ?? 0;
  const minConf = Math.min(confA, confB);

  // If both users are below provisional floor, not eligible
  if (confA < provisionalFloor || confB < provisionalFloor) {
    return {
      eligible: false,
      provisional: false,
      adjustedScore: 0,
      reason: 'CONFIDENCE_BELOW_PROVISIONAL_FLOOR',
    };
  }

  const nonConfidenceReasons = reasons.filter((r) => r !== 'CONFIDENCE_TOO_LOW');

  // Any safety/hard gate failure -> stay ineligible
  if (nonConfidenceReasons.length > 0) {
    return {
      eligible: false,
      provisional: false,
      adjustedScore: 0,
      reason: nonConfidenceReasons.join(', '),
    };
  }

  const isProvisional = reasons.includes('CONFIDENCE_TOO_LOW');

  // Compute base rank score if it was gated only for confidence
  let rawRankScore = result.rank_score;
  if (isProvisional && rawRankScore === 0) {
    rawRankScore = Math.pow(result.resonance, 0.6) * Math.pow(result.logistics, 0.4);
  }

  const adjustedScore = shrinkToPrior(rawRankScore, minConf, options);

  return {
    eligible: true,
    provisional: isProvisional,
    adjustedScore,
  };
}

export function explorationBoost(
  timesSurfaced: number,
  options?: ColdStartOptions
): number {
  const explorationBonus = options?.explorationBonus ?? 0.05;
  const count = Math.max(0, timesSurfaced);
  return explorationBonus * Math.exp(-count / 5);
}

export function nextBestQuestions(vec: ProfileVector, limit: number = 3): ThreadKey[] {
  const allThreads: ThreadKey[] = [...RESONANCE_THREADS, ...LOGISTICS_THREADS];

  const personalityRatio = Math.min(1, Math.max(0, (vec.personality?.answered ?? 0) / 10));
  const communicationRatio = Math.min(1, Math.max(0, (vec.communication?.answered ?? 0) / 10));
  const socialRhythmRatio = Math.min(1, Math.max(0, (vec.social_rhythm?.answered ?? 0) / 5));
  const intentRatio = Math.min(1, Math.max(0, (vec.intent?.answered ?? 0) / 3));
  const emotionalRatio = Math.min(1, Math.max(0, (vec.emotional?.answered ?? 0) / 10));
  const interestsRatio = Math.min(1, Math.max(0, (vec.interests?.length ?? 0) / 3));
  const valuesRatio = Math.min(1, Math.max(0, (vec.values?.length ?? 0) / 3));
  const lifestyleRatio = Math.min(1, Math.max(0, (vec.lifestyle?.answered ?? 0) / 5));
  const experienceRatio = Math.min(1, Math.max(0, (vec.experience?.answered ?? 0) / 5));
  const geographyRatio = Math.min(1, Math.max(0, (vec.geography?.answered ?? 0) / 2));

  const ratios: Record<ThreadKey, number> = {
    personality: personalityRatio,
    communication: communicationRatio,
    social_rhythm: socialRhythmRatio,
    intent: intentRatio,
    emotional: emotionalRatio,
    interests: interestsRatio,
    values: valuesRatio,
    lifestyle: lifestyleRatio,
    experience: experienceRatio,
    geography: geographyRatio,
  };

  const scores = allThreads.map((thread) => {
    const w = BASELINE_WEIGHTS[thread] ?? 10;
    const incompleteness = 1 - ratios[thread];
    return { thread, score: w * incompleteness };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, Math.max(1, limit)).map((s) => s.thread);
}
