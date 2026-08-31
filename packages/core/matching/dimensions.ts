import type { ProfileVector } from '../domain/types.ts';
import {
  gauss,
  expectationFit,
  setOverlap,
  graphAffinity,
  bandGap,
  depthScore,
} from './functions.ts';
import { getTravelTimeMinutes } from '../geo/matrix.ts';

/**
 * 4.1 Personality — Weight 15
 */
export function scorePersonality(vecA: ProfileVector, vecB: ProfileVector): number {
  const pA = vecA.personality;
  const pB = vecB.personality;

  if (!pA || !pB) return 0.5;

  const openness = gauss(pA.openness, pB.openness, 0, 0.28);
  const intellectual_curiosity = gauss(pA.intellectual_curiosity, pB.intellectual_curiosity, 0, 0.25);
  const conscientiousness = gauss(pA.conscientiousness, pB.conscientiousness, 0.15, 0.30);
  const extraversion = gauss(pA.extraversion, pB.extraversion, 0.12, 0.32);
  const agreeableness = gauss(pA.agreeableness, pB.agreeableness, 0, 0.30);
  const emotional_stability = gauss(pA.emotional_stability, pB.emotional_stability, 0, 0.35);
  const serious_playful = gauss(pA.serious_playful, pB.serious_playful, 0.10, 0.28);
  const intensity_easygoing = gauss(pA.intensity_easygoing, pB.intensity_easygoing, 0.15, 0.28);
  const assertive_accommodating = gauss(pA.assertive_accommodating, pB.assertive_accommodating, 0.20, 0.28);
  const novelty_seeking = gauss(pA.novelty_seeking, pB.novelty_seeking, 0, 0.30);

  return (
    openness * 0.15 +
    intellectual_curiosity * 0.15 +
    conscientiousness * 0.10 +
    extraversion * 0.12 +
    agreeableness * 0.10 +
    emotional_stability * 0.10 +
    serious_playful * 0.10 +
    intensity_easygoing * 0.08 +
    assertive_accommodating * 0.05 +
    novelty_seeking * 0.05
  );
}

/**
 * 4.2 Communication — Weight 15
 */
export function scoreCommunication(vecA: ProfileVector, vecB: ProfileVector): number {
  const cA = vecA.communication;
  const cB = vecB.communication;

  if (!cA || !cB) return 0.5;

  const contact_freq = expectationFit(
    cA.contact_frequency_self,
    cB.contact_frequency_expect,
    cB.contact_frequency_self,
    cA.contact_frequency_expect,
    0.18
  );

  const medium_pref = setOverlap(cA.mediums, cB.mediums);
  const conv_style = setOverlap(cA.conv_styles, cB.conv_styles);

  const response_speed = expectationFit(
    cA.response_speed_self,
    cB.response_speed_expect,
    cB.response_speed_self,
    cA.response_speed_expect,
    0.22
  );

  const message_length = gauss(cA.message_length, cB.message_length, 0, 0.30);
  const direct_diplomatic = gauss(cA.direct_diplomatic, cB.direct_diplomatic, 0.12, 0.25);
  const high_context = gauss(cA.high_context_literal, cB.high_context_literal, 0, 0.28);

  const initiation = expectationFit(
    cA.initiation_self,
    cB.initiation_expect,
    cB.initiation_self,
    cA.initiation_expect,
    0.25
  );

  return (
    contact_freq * 0.25 +
    medium_pref * 0.15 +
    conv_style * 0.20 +
    response_speed * 0.12 +
    message_length * 0.08 +
    direct_diplomatic * 0.10 +
    high_context * 0.05 +
    initiation * 0.05
  );
}

/**
 * 4.3 Social Rhythm — Weight 15 (Logistics)
 */
export function scoreSocialRhythm(vecA: ProfileVector, vecB: ProfileVector): number {
  const rA = vecA.social_rhythm;
  const rB = vecB.social_rhythm;

  if (!rA || !rB) return 0.5;

  // Combine availability array + explicitly declared fri_night/sat_night flags
  const availA = new Set(rA.availability);
  const availB = new Set(rB.availability);
  if (rA.fri_night) availA.add('fri_night');
  if (rA.sat_night) availA.add('sat_night');
  if (rB.fri_night) availB.add('fri_night');
  if (rB.sat_night) availB.add('sat_night');

  const availOverlap = setOverlap(availA, availB);
  const planning_horizon = gauss(rA.planning_horizon, rB.planning_horizon, 0.10, 0.28);
  const social_freq = expectationFit(
    rA.social_freq_self,
    rB.social_freq_expect,
    rB.social_freq_self,
    rA.social_freq_expect,
    0.22
  );
  const preferred_duration = gauss(rA.preferred_duration, rB.preferred_duration, 0, 0.30);
  const energy_peak = gauss(rA.energy_peak, rB.energy_peak, 0, 0.30);

  return (
    availOverlap * 0.40 +
    planning_horizon * 0.20 +
    social_freq * 0.20 +
    preferred_duration * 0.12 +
    energy_peak * 0.08
  );
}

/**
 * 4.4 Intent & Depth — Weight 15
 */
export function scoreIntent(vecA: ProfileVector, vecB: ProfileVector): number {
  const iA = vecA.intent;
  const iB = vecB.intent;

  if (!iA || !iB) return 0.5;

  const intentOverlap = setOverlap(iA.intents, iB.intents);
  
  // Depth alignment: mean of depthScore both ways
  const depthAtoB = depthScore(iA.depth, iB.depth);
  const depthBtoA = depthScore(iB.depth, iA.depth);
  const depthAlign = (depthAtoB + depthBtoA) / 2;

  return intentOverlap * 0.60 + depthAlign * 0.40;
}

/**
 * 4.5 Emotional Rhythm & Style — Weight 10
 */
export function scoreEmotional(vecA: ProfileVector, vecB: ProfileVector): number {
  const eA = vecA.emotional;
  const eB = vecB.emotional;

  if (!eA || !eB) return 0.5;

  // Emotional Rhythm (70%)
  const er1_opening_pace = gauss(eA.er_opening_pace, eB.er_opening_pace, 0.15, 0.26);
  const er2_cadence_need = expectationFit(
    eA.er_cadence_need,
    eB.er_cadence_expect,
    eB.er_cadence_need,
    eA.er_cadence_expect,
    0.18
  );
  
  // ER3 Reassurance cross-fit
  const er3_reassurance = Math.sqrt(
    gauss(eA.er_reassurance_need, eB.er_reassurance_offer, 0, 0.22) *
    gauss(eB.er_reassurance_need, eA.er_reassurance_offer, 0, 0.22)
  );

  const er4_recovery = gauss(eA.er_recovery_time, eB.er_recovery_time, 0, 0.32);
  const er5_conflict = gauss(eA.er_conflict_approach, eB.er_conflict_approach, 0, 0.20);

  const erTotal =
    er1_opening_pace * 0.22 +
    er2_cadence_need * 0.28 +
    er3_reassurance * 0.18 +
    er4_recovery * 0.14 +
    er5_conflict * 0.18;

  // Static style (30%)
  const expressiveness = gauss(eA.expressiveness, eB.expressiveness, 0, 0.30);
  const vulnerability = gauss(eA.vulnerability_comfort, eB.vulnerability_comfort, 0, 0.28);
  const affection = gauss(eA.affection, eB.affection, 0, 0.30);
  const advice_vs_listening = expectationFit(
    eA.advice_vs_listening_self,
    eB.advice_vs_listening_expect,
    eB.advice_vs_listening_self,
    eA.advice_vs_listening_expect,
    0.25
  );
  const reliability = expectationFit(
    eA.reliability_self,
    eB.reliability_expect,
    eB.reliability_self,
    eA.reliability_expect,
    0.20
  );
  const boundary_clarity = gauss(eA.boundary_clarity, eB.boundary_clarity, 0, 0.30);

  const staticTotal =
    expressiveness * 0.15 +
    vulnerability * 0.20 +
    affection * 0.15 +
    advice_vs_listening * 0.20 +
    reliability * 0.15 +
    boundary_clarity * 0.15;

  return erTotal * 0.70 + staticTotal * 0.30;
}

/**
 * 4.6 Interests Graph — Weight 10
 */
export function scoreInterests(vecA: ProfileVector, vecB: ProfileVector): number {
  return graphAffinity(vecA.interests, vecB.interests);
}

/**
 * 4.7 Values & Worldview — Weight 8
 * Rules: 'private' values are EXCLUDED from scoring entirely.
 */
export function scoreValues(vecA: ProfileVector, vecB: ProfileVector): number {
  const valuesA = (vecA.values || []).filter((v) => v.visibility !== 'private');
  const valuesB = (vecB.values || []).filter((v) => v.visibility !== 'private');

  if (valuesA.length === 0 || valuesB.length === 0) return 0.5;

  const mapB = new Map(valuesB.map((v) => [v.value_key, v]));
  const sharedScores: number[] = [];

  for (const valA of valuesA) {
    const valB = mapB.get(valA.value_key);
    if (!valB) continue;

    const maxImp = Math.max(valA.importance, valB.importance);
    const stanceDiff = Math.abs(valA.stance - valB.stance);
    const score = 1 - maxImp * stanceDiff;
    sharedScores.push(score);
  }

  if (sharedScores.length < 4) return 0.5;
  return sharedScores.reduce((sum, s) => sum + s, 0) / sharedScores.length;
}

/**
 * 4.8 Lifestyle — Weight 7 (Logistics)
 */
export function scoreLifestyle(vecA: ProfileVector, vecB: ProfileVector): number {
  const lA = vecA.lifestyle;
  const lB = vecB.lifestyle;

  if (!lA || !lB) return 0.5;

  const budget = bandGap(lA.budget_band, lB.budget_band);
  const alcoholScore = lA.alcohol === 'none' && lB.alcohol === 'regular' ? 0.5 : 1.0;
  const smokingScore = lA.smoking !== lB.smoking ? 0.7 : 1.0;
  const activity = gauss(lA.activity_level, lB.activity_level, 0, 0.30);
  const food = setOverlap(lA.food_prefs, lB.food_prefs);
  const pets = gauss(lA.pets.length > 0 ? 1 : 0, lB.pets.length > 0 ? 1 : 0, 0, 0.35);
  const travel = gauss(lA.travel_frequency, lB.travel_frequency, 0, 0.35);

  return (
    budget * 0.25 +
    alcoholScore * 0.15 +
    smokingScore * 0.10 +
    activity * 0.15 +
    food * 0.15 +
    pets * 0.10 +
    travel * 0.10
  );
}

/**
 * 4.9 Experience / Outing Compatibility — Weight 3 (Logistics)
 */
export function scoreExperience(vecA: ProfileVector, vecB: ProfileVector): number {
  const eA = vecA.experience;
  const eB = vecB.experience;

  if (!eA || !eB) return 0.5;

  const settingsScore = setOverlap(eA.settings, eB.settings);
  const groupSizeScore = gauss(eA.group_size_pref, eB.group_size_pref, 0, 0.25);
  const orientationScore = setOverlap(eA.orientation, eB.orientation);
  const noveltyScore = gauss(eA.novelty, eB.novelty, 0.10, 0.30);

  return (
    settingsScore * 0.30 +
    groupSizeScore * 0.30 +
    orientationScore * 0.25 +
    noveltyScore * 0.15
  );
}

/**
 * 4.10 Geography — Weight 2 + Gate (Logistics)
 */
export function scoreGeography(vecA: ProfileVector, vecB: ProfileVector): number {
  const gA = vecA.geography;
  const gB = vecB.geography;

  if (!gA || !gB) return 1.0;

  const travelMinutes = getTravelTimeMinutes(gA.home_area, gB.home_area);
  
  // Use coffee radius as general activity fallback
  const radA = gA.radius_minutes?.coffee ?? 30;
  const radB = gB.radius_minutes?.coffee ?? 30;
  const minRad = Math.min(radA, radB);

  if (travelMinutes <= minRad) return 1.0;
  return gauss(0, (travelMinutes - minRad) / 60, 0, 0.35);
}
