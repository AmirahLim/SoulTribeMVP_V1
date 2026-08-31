import type { ProfileVector } from '../domain/types.ts';
import { scorePersonality } from './dimensions.ts';
import { scoreCommunication, scoreIntent, scoreEmotional, scoreInterests, scoreValues } from './dimensions.ts';

export interface GroupCohesionResult {
  cohesion: number;
  minPairwiseResonance: number;
  meanPairwiseResonance: number;
  feasibility: boolean;
  warnings: string[];
}

export function calculateResonancePair(vecA: ProfileVector, vecB: ProfileVector): number {
  const p = scorePersonality(vecA, vecB);
  const c = scoreCommunication(vecA, vecB);
  const i = scoreIntent(vecA, vecB);
  const e = scoreEmotional(vecA, vecB);
  const int = scoreInterests(vecA, vecB);
  const v = scoreValues(vecA, vecB);

  const rawResonance = (p * 15 + c * 15 + i * 15 + e * 10 + int * 10 + v * 8) / 73;
  return rawResonance;
}

export function calculateGroupCohesion(group: ProfileVector[]): GroupCohesionResult {
  if (group.length < 2) {
    return {
      cohesion: 1.0,
      minPairwiseResonance: 1.0,
      meanPairwiseResonance: 1.0,
      feasibility: true,
      warnings: [],
    };
  }

  const rScores: { pairNames: [string, string]; score: number }[] = [];
  
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const r = calculateResonancePair(group[i], group[j]);
      rScores.push({
        pairNames: [group[i].profile.display_name, group[j].profile.display_name],
        score: r,
      });
    }
  }

  const minPair = rScores.reduce((min, cur) => (cur.score < min.score ? cur : min), rScores[0]);
  const minR = minPair.score;
  const meanR = rScores.reduce((sum, cur) => sum + cur.score, 0) / rScores.length;
  const cohesion = 0.5 * minR + 0.5 * meanR;

  // Feasibility check: shared slot across all group members
  let sharedSlots = new Set(group[0].social_rhythm?.availability || []);
  if (group[0].social_rhythm?.fri_night) sharedSlots.add('fri_night');
  if (group[0].social_rhythm?.sat_night) sharedSlots.add('sat_night');

  for (let i = 1; i < group.length; i++) {
    const memberSlots = new Set(group[i].social_rhythm?.availability || []);
    if (group[i].social_rhythm?.fri_night) memberSlots.add('fri_night');
    if (group[i].social_rhythm?.sat_night) memberSlots.add('sat_night');

    const nextShared = new Set<string>();
    for (const slot of sharedSlots) {
      if (memberSlots.has(slot)) nextShared.add(slot);
    }
    sharedSlots = nextShared;
  }
  const feasibility = sharedSlots.size > 0;

  // Standard deviation calculation helper
  const stdev = (vals: number[]) => {
    const avg = vals.reduce((sum, v) => sum + v, 0) / vals.length;
    const sqDiffs = vals.map((v) => Math.pow(v - avg, 2));
    const avgSqDiff = sqDiffs.reduce((sum, v) => sum + v, 0) / vals.length;
    return Math.sqrt(avgSqDiff);
  };

  const warnings: string[] = [];

  if (minR < 0.35) {
    warnings.push(
      `${minPair.pairNames[0]} and ${minPair.pairNames[1]} are quite different: that can work, but this group may need you to bridge them.`
    );
  }

  const extraversionVals = group.map((g) => g.personality?.extraversion ?? 0.5);
  if (stdev(extraversionVals) > 0.30) {
    warnings.push(
      "This group's energy range is wide. Two people prefer quiet settings and one thrives in high-energy ones."
    );
  }

  const budgetBands = group.map((g) => g.lifestyle?.budget_band ?? 2);
  const maxBudget = Math.max(...budgetBands);
  const minBudget = Math.min(...budgetBands);
  if (maxBudget - minBudget >= 2) {
    warnings.push("Budget expectations vary here. Naming the likely spend in your pitch will help.");
  }

  const groupSizePrefs = group.map((g) => g.experience?.group_size_pref ?? 0.5);
  if (stdev(groupSizePrefs) > 0.30) {
    warnings.push("Two guests prefer 1:1 or small groups: six may feel like a lot for them.");
  }

  if (!feasibility) {
    warnings.push("There's no time slot that works for everyone yet.");
  }

  if (group.length === 6) {
    warnings.push(
      "This is the largest group Soul Tribe runs. Six is where conversation splits: that's fine, just expect it."
    );
  }

  return {
    cohesion,
    minPairwiseResonance: minR,
    meanPairwiseResonance: meanR,
    feasibility,
    warnings,
  };
}
