import type { ProfileVector, MatchContext, MatchResult } from '../domain/types.ts';
import {
  scorePersonality,
  scoreCommunication,
  scoreSocialRhythm,
  scoreIntent,
  scoreEmotional,
  scoreInterests,
  scoreValues,
  scoreLifestyle,
  scoreExperience,
  scoreGeography,
} from './dimensions.ts';
import { evaluateGates } from './gates.ts';
import { getOutingContextualWeights } from './reweighting.ts';

export function score(
  vecA: ProfileVector,
  vecB: ProfileVector,
  context?: MatchContext
): MatchResult {
  const gateCheck = evaluateGates(vecA, vecB, context);

  // Check if tagged interest matches
  let hasInterestMatch = false;
  if (context?.tagged_interest_node && vecB.interests) {
    hasInterestMatch = vecB.interests.some(
      (i) => i.node_path.includes(context.tagged_interest_node!)
    );
  }

  const weights = getOutingContextualWeights(context?.activity_category, hasInterestMatch);

  const sPersonality = scorePersonality(vecA, vecB);
  const sCommunication = scoreCommunication(vecA, vecB);
  const sSocialRhythm = scoreSocialRhythm(vecA, vecB);
  const sIntent = scoreIntent(vecA, vecB);
  const sEmotional = scoreEmotional(vecA, vecB);
  const sInterests = scoreInterests(vecA, vecB);
  const sValues = scoreValues(vecA, vecB);
  const sLifestyle = scoreLifestyle(vecA, vecB);
  const sExperience = scoreExperience(vecA, vecB);
  const sGeography = scoreGeography(vecA, vecB);

  const resDims: [number | null, number][] = [
    [sPersonality, weights.personality],
    [sCommunication, weights.communication],
    [sIntent, weights.intent],
    [sEmotional, weights.emotional],
    [sInterests, weights.interests],
    [sValues, weights.values],
  ];

  let resSum = 0;
  let resWeightTotal = 0;
  for (const [scoreVal, w] of resDims) {
    if (typeof scoreVal === 'number') {
      resSum += scoreVal * w;
      resWeightTotal += w;
    }
  }
  const resonance = resWeightTotal > 0 ? resSum / resWeightTotal : 0.5;

  const logDims: [number | null, number][] = [
    [sSocialRhythm, weights.social_rhythm],
    [sLifestyle, weights.lifestyle],
    [sExperience, weights.experience],
    [sGeography, weights.geography],
  ];

  let logSum = 0;
  let logWeightTotal = 0;
  for (const [scoreVal, w] of logDims) {
    if (typeof scoreVal === 'number') {
      logSum += scoreVal * w;
      logWeightTotal += w;
    }
  }
  const logistics = logWeightTotal > 0 ? logSum / logWeightTotal : 0.5;

  // Geometric rank score R^0.6 * L^0.4
  const baseRank = Math.pow(resonance, 0.6) * Math.pow(logistics, 0.4);
  const rank_score = gateCheck.passed ? baseRank : 0;

  const contributions: Record<string, number> = {};
  if (typeof sPersonality === 'number') contributions.personality = sPersonality;
  if (typeof sCommunication === 'number') contributions.communication = sCommunication;
  if (typeof sSocialRhythm === 'number') contributions.social_rhythm = sSocialRhythm;
  if (typeof sIntent === 'number') contributions.intent = sIntent;
  if (typeof sEmotional === 'number') contributions.emotional = sEmotional;
  if (typeof sInterests === 'number') contributions.interests = sInterests;
  if (typeof sValues === 'number') contributions.values = sValues;
  if (typeof sLifestyle === 'number') contributions.lifestyle = sLifestyle;
  if (typeof sExperience === 'number') contributions.experience = sExperience;
  if (typeof sGeography === 'number') contributions.geography = sGeography;

  return {
    resonance,
    logistics,
    rank_score,
    gated: !gateCheck.passed,
    gate_reasons: gateCheck.reasons,
    contributions,
    confidence_a: vecA.profile.confidence,
    confidence_b: vecB.profile.confidence,
  };
}
