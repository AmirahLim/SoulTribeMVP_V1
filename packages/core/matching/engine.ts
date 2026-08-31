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

  // Resonance Group (Personality 15, Communication 15, Intent 15, Emotional 10, Interests 10, Values 8 = 73 total)
  const resSum =
    sPersonality * weights.personality +
    sCommunication * weights.communication +
    sIntent * weights.intent +
    sEmotional * weights.emotional +
    sInterests * weights.interests +
    sValues * weights.values;
  const resWeightTotal =
    weights.personality +
    weights.communication +
    weights.intent +
    weights.emotional +
    weights.interests +
    weights.values;
  const resonance = resSum / resWeightTotal;

  // Logistics Group (Social Rhythm 15, Lifestyle 7, Experience 3, Geography 2 = 27 total)
  const logSum =
    sSocialRhythm * weights.social_rhythm +
    sLifestyle * weights.lifestyle +
    sExperience * weights.experience +
    sGeography * weights.geography;
  const logWeightTotal =
    weights.social_rhythm +
    weights.lifestyle +
    weights.experience +
    weights.geography;
  const logistics = logSum / logWeightTotal;

  // Geometric rank score R^0.6 * L^0.4
  const baseRank = Math.pow(resonance, 0.6) * Math.pow(logistics, 0.4);
  const rank_score = gateCheck.passed ? baseRank : 0;

  const contributions: Record<string, number> = {
    personality: sPersonality,
    communication: sCommunication,
    social_rhythm: sSocialRhythm,
    intent: sIntent,
    emotional: sEmotional,
    interests: sInterests,
    values: sValues,
    lifestyle: sLifestyle,
    experience: sExperience,
    geography: sGeography,
  };

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
