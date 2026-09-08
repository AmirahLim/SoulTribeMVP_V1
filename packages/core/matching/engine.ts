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
} from './threads.ts';
import { evaluateGates } from './gates.ts';
import { getOutingContextualWeights } from './reweighting.ts';
import { calculateAsymmetricFit } from './asymmetric.ts';
import {lifeContextBoost} from './lifeContext.ts';
import {publicPreferenceBoost} from './publicPreferences.ts';
import {sameReportedTown,SAME_REPORTED_TOWN_BOOST} from '../geo/selfReportedTown.ts';
import {scoreRepair} from './repair.ts';

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

  const weights = {...getOutingContextualWeights(context?.activity_category, hasInterestMatch)};
  const sRepair=scoreRepair(vecA,vecB);
  let repairWeight=0;
  if(sRepair!==null){
    // Baseline transfer: 2 points each from personality, communication and intent.
    // Respect outing contextual multipliers; unmeasured repair leaves old weights intact.
    for(const key of ['personality','communication','intent'] as const){
      const transfer=weights[key]*2/15;weights[key]-=transfer;repairWeight+=transfer;
    }
  }

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

  const resThreads: [number | null, number][] = [
    [sRepair,repairWeight],
    [sPersonality, weights.personality],
    [sCommunication, weights.communication],
    [sIntent, weights.intent],
    [sEmotional, weights.emotional],
    [sInterests, weights.interests],
    [sValues, weights.values],
  ];

  let resSum = 0;
  let resWeightTotal = 0;
  for (const [scoreVal, w] of resThreads) {
    if (typeof scoreVal === 'number') {
      resSum += scoreVal * w;
      resWeightTotal += w;
    }
  }
  const resonance = resWeightTotal > 0 ? resSum / resWeightTotal : null;

  const logThreads: [number | null, number][] = [
    [sSocialRhythm, weights.social_rhythm],
    [sLifestyle, weights.lifestyle],
    [sExperience, weights.experience],
    [sGeography, weights.geography],
  ];

  let logSum = 0;
  let logWeightTotal = 0;
  for (const [scoreVal, w] of logThreads) {
    if (typeof scoreVal === 'number') {
      logSum += scoreVal * w;
      logWeightTotal += w;
    }
  }
  const logistics = logWeightTotal > 0 ? logSum / logWeightTotal : null;

  const asymmetric = calculateAsymmetricFit(vecA, vecB, resonance);

  // Geometric rank score R^0.6 * L^0.4
  let baseRank = 0;
  if (resonance !== null && logistics !== null) {
    baseRank = Math.pow(asymmetric.penalizedResonance ?? resonance, 0.6) * Math.pow(logistics, 0.4);
  } else if (resonance !== null) {
    baseRank = asymmetric.penalizedResonance ?? resonance;
  } else if (logistics !== null) {
    baseRank = logistics;
  } else {
    baseRank = 0;
  }
  const contextBoost=baseRank>0?lifeContextBoost(vecA.profile.life_contexts,vecB.profile.life_contexts)+publicPreferenceBoost(vecA.profile.public_onboarding,vecB.profile.public_onboarding)+(sameReportedTown(vecA.geography,vecB.geography)?SAME_REPORTED_TOWN_BOOST:0):0;
  const provisionalOnly = context?.allowProvisionalRanking === true &&
    gateCheck.reasons.length > 0 && gateCheck.reasons.every(reason => reason === 'CONFIDENCE_TOO_LOW');
  const rank_score = gateCheck.passed || provisionalOnly ? Math.min(1,baseRank+contextBoost) : 0;

  const contributions: Record<string, number> = {};
  if(sRepair!==null)contributions.repair=sRepair;
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
    fit_a_to_b: asymmetric.fitAtoB,
    fit_b_to_a: asymmetric.fitBtoA,
    imbalance_penalty: asymmetric.imbalance,
  };
}
