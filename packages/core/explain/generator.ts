import type { ProfileVector } from '../domain/types.ts';
import { PHRASES, PHRASES_YOU } from './phrases.ts';
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
} from '../matching/dimensions.ts';

export interface ExplanationText {
  click_text: string;
  friction_text: string;
  generated_by: string;
}

function isDimensionAnswered(vec: ProfileVector, key: string): boolean {
  if (!vec) return false;
  if (key === 'personality') return (vec.personality?.answered ?? 0) > 0;
  if (key === 'communication') return (vec.communication?.answered ?? 0) > 0;
  if (key === 'social_rhythm') return (vec.social_rhythm?.answered ?? 0) > 0;
  if (key === 'intent') return (vec.intent?.answered ?? 0) > 0;
  if (key === 'emotional') return (vec.emotional?.answered ?? 0) > 0;
  if (key === 'interests') return (vec.interests?.length ?? 0) > 0;
  if (key === 'values') return (vec.values?.length ?? 0) > 0;
  if (key === 'lifestyle') return (vec.lifestyle?.answered ?? 0) > 0;
  if (key === 'experience') return (vec.experience?.answered ?? 0) > 0;
  if (key === 'geography') return (vec.geography?.answered ?? 0) > 0;
  return false;
}

const DIM_LABELS: Record<string, string> = {
  personality: 'personality & social energy',
  communication: 'messaging & response pace',
  social_rhythm: 'planning style',
  intent: 'friendship depth expectations',
  emotional: 'emotional opening pace',
  interests: 'interest overlap',
  values: 'core values',
  lifestyle: 'outing budget & activity style',
  experience: 'group size preference',
  geography: 'neighbourhood proximity',
};

export function generateMatchExplanation(
  vecA: ProfileVector,
  vecB: ProfileVector
): ExplanationText {
  const nameA = vecA.profile.display_name;
  const nameB = vecB.profile.display_name;

  const dimScores = [
    { key: 'personality', score: scorePersonality(vecA, vecB), weight: 15 },
    { key: 'communication', score: scoreCommunication(vecA, vecB), weight: 15 },
    { key: 'social_rhythm', score: scoreSocialRhythm(vecA, vecB), weight: 15 },
    { key: 'intent', score: scoreIntent(vecA, vecB), weight: 15 },
    { key: 'emotional', score: scoreEmotional(vecA, vecB), weight: 10 },
    { key: 'interests', score: scoreInterests(vecA, vecB), weight: 10 },
    { key: 'values', score: scoreValues(vecA, vecB), weight: 8 },
    { key: 'lifestyle', score: scoreLifestyle(vecA, vecB), weight: 7 },
    { key: 'experience', score: scoreExperience(vecA, vecB), weight: 3 },
    { key: 'geography', score: scoreGeography(vecA, vecB), weight: 2 },
  ];

  // Calculate contribution above baseline
  const evaluated = dimScores.map((d) => ({
    ...d,
    contrib: d.weight * (d.score - 0.5),
  }));

  // Top positive aligned dimensions
  const aligned = [...evaluated].sort((a, b) => b.contrib - a.contrib).slice(0, 3);

  // Build positive click text
  const clickParts: string[] = [];

  for (const d of aligned) {
    if (d.key === 'intent') {
      clickParts.push(`You both share alignment on friendship intent: ${PHRASES.depth(vecB.intent?.depth ?? 2)}.`);
    } else if (d.key === 'social_rhythm') {
      clickParts.push(`Your schedules touch well; ${nameB} ${PHRASES.planningHorizon(vecB.social_rhythm?.planning_horizon ?? 0.5)}.`);
    } else if (d.key === 'communication') {
      clickParts.push(`You have compatible communication rhythms and ${PHRASES.cadenceNeed(vecB.emotional?.er_cadence_need ?? 0.5)}.`);
    } else if (d.key === 'emotional') {
      clickParts.push(`${nameB} ${PHRASES.openingPace(vecB.emotional?.er_opening_pace ?? 0.5)}.`);
    } else if (d.key === 'personality') {
      clickParts.push(`You share similar energy balance and curiosity.`);
    } else if (d.key === 'interests') {
      clickParts.push(`You have overlapping curiosity in topics you'd enjoy exploring together.`);
    }
  }

  if (clickParts.length === 0) {
    clickParts.push(`You both share grounded expectations for low-pressure, regular catch-ups in Singapore.`);
  }

  const click_text = clickParts.join(' ');

  // --- HONEST FRICTION SELECTION WITHOUT TAUTOLOGIES ---

  // Filter to ONLY dimensions where BOTH sides actually have answered data
  const eligibleDims = evaluated.filter((d) =>
    isDimensionAnswered(vecA, d.key) && isDimensionAnswered(vecB, d.key)
  );

  // If no dimension is eligible (very thin profile), emit exact thin-profile sentence
  if (eligibleDims.length === 0) {
    return {
      click_text,
      friction_text: "There isn't enough in your pass yet to flag friction honestly — add more and this will sharpen.",
      generated_by: 'deterministic_template',
    };
  }

  // Sort eligible dimensions by score ascending (lowest score first)
  eligibleDims.sort((a, b) => a.score - b.score);

  const frictionParts: string[] = [];
  const candidateDims = eligibleDims.filter((d) => d.score < 0.70);

  for (const d of candidateDims) {
    if (frictionParts.length >= 2) break;

    const isClearFriction = d.score < 0.55; // Tier 1 vs Tier 2

    if (d.key === 'experience') {
      const valA = vecA.experience?.group_size_pref ?? 0.5;
      const valB = vecB.experience?.group_size_pref ?? 0.5;
      if (PHRASES.groupSize(valA) === PHRASES.groupSize(valB)) continue;

      const sizeA = PHRASES_YOU.groupSize(valA);
      const sizeB = PHRASES.groupSize(valB);
      if (isClearFriction) {
        frictionParts.push(`${nameB} ${sizeB}, while you ${sizeA}.`);
      } else {
        frictionParts.push(`Only a small gap in group size preference: ${nameB} ${sizeB}, while you ${sizeA}.`);
      }
    } else if (d.key === 'personality') {
      const valA = vecA.personality?.extraversion ?? 0.5;
      const valB = vecB.personality?.extraversion ?? 0.5;
      if (PHRASES.extraversion(valA) === PHRASES.extraversion(valB)) continue;

      const extA = PHRASES_YOU.extraversion(valA);
      const extB = PHRASES.extraversion(valB);
      if (isClearFriction) {
        frictionParts.push(`${nameB} ${extB}, while you ${extA}.`);
      } else {
        frictionParts.push(`In social energy, ${nameB} ${extB}, while you ${extA}.`);
      }
    } else if (d.key === 'social_rhythm') {
      const valA = vecA.social_rhythm?.planning_horizon ?? 0.5;
      const valB = vecB.social_rhythm?.planning_horizon ?? 0.5;
      if (PHRASES.planningHorizon(valA) === PHRASES.planningHorizon(valB)) continue;

      const planA = PHRASES_YOU.planningHorizon(valA);
      const planB = PHRASES.planningHorizon(valB);
      if (isClearFriction) {
        frictionParts.push(`${nameB} ${planB}, whereas you usually ${planA}.`);
      } else {
        frictionParts.push(`Only a small thing: ${nameB} ${planB}, while you ${planA}.`);
      }
    } else if (d.key === 'emotional') {
      if (isClearFriction) {
        const valA = vecA.emotional?.er_conflict_approach ?? 0.5;
        const valB = vecB.emotional?.er_conflict_approach ?? 0.5;
        if (PHRASES.conflictApproach(valA) === PHRASES.conflictApproach(valB)) continue;

        const confA = PHRASES_YOU.conflictApproach(valA);
        const confB = PHRASES.conflictApproach(valB);
        frictionParts.push(`On tension, ${nameB} ${confB}, while you ${confA}.`);
      } else {
        const valA = vecA.emotional?.er_opening_pace ?? 0.5;
        const valB = vecB.emotional?.er_opening_pace ?? 0.5;
        if (PHRASES.openingPace(valA) === PHRASES.openingPace(valB)) continue;

        const openA = PHRASES_YOU.openingPace(valA);
        const openB = PHRASES.openingPace(valB);
        frictionParts.push(`In opening pace, ${nameB} ${openB}, while you ${openA}.`);
      }
    } else if (d.key === 'communication') {
      if (isClearFriction) {
        const valA = vecA.communication?.response_speed_self ?? 0.5;
        const valB = vecB.communication?.response_speed_self ?? 0.5;
        if (PHRASES.responseSpeed(valA) === PHRASES.responseSpeed(valB)) continue;

        const respA = PHRASES_YOU.responseSpeed(valA);
        const respB = PHRASES.responseSpeed(valB);
        frictionParts.push(`In messaging, ${nameB} ${respB}, whereas you ${respA}.`);
      } else {
        const valA = vecA.communication?.contact_frequency_self ?? 0.5;
        const valB = vecB.communication?.contact_frequency_self ?? 0.5;
        if (PHRASES.cadenceNeed(valA) === PHRASES.cadenceNeed(valB)) continue;

        const cadA = PHRASES_YOU.cadenceNeed(valA);
        const cadB = PHRASES.cadenceNeed(valB);
        frictionParts.push(`On communication pace, ${nameB} ${cadB}, while you ${cadA}.`);
      }
    } else if (d.key === 'intent') {
      const valA = vecA.intent?.depth ?? 2;
      const valB = vecB.intent?.depth ?? 2;
      if (PHRASES.depth(valA) === PHRASES.depth(valB)) continue;

      const depthA = PHRASES_YOU.depth(valA);
      const depthB = PHRASES.depth(valB);
      if (isClearFriction) {
        frictionParts.push(`On friendship depth, ${nameB} ${depthB}, whereas you ${depthA}.`);
      } else {
        frictionParts.push(`In friendship intent, ${nameB} ${depthB}, while you ${depthA}.`);
      }
    } else if (d.key === 'lifestyle') {
      if (isClearFriction) {
        const valA = vecA.lifestyle?.budget_band ?? 2;
        const valB = vecB.lifestyle?.budget_band ?? 2;
        if (PHRASES.budgetBand(valA) === PHRASES.budgetBand(valB)) continue;

        const budgetA = PHRASES_YOU.budgetBand(valA);
        const budgetB = PHRASES.budgetBand(valB);
        frictionParts.push(`${nameB} ${budgetB}, whereas you ${budgetA}.`);
      } else {
        const valA = vecA.lifestyle?.activity_level ?? 0.5;
        const valB = vecB.lifestyle?.activity_level ?? 0.5;
        if (PHRASES.activityLevel(valA) === PHRASES.activityLevel(valB)) continue;

        const actA = PHRASES_YOU.activityLevel(valA);
        const actB = PHRASES.activityLevel(valB);
        frictionParts.push(`In activity style, ${nameB} ${actB}, while you ${actA}.`);
      }
    } else if (d.key === 'interests') {
      if (isClearFriction) {
        frictionParts.push(`You have different core interest focus areas, which may require exploring new shared topics.`);
      } else {
        frictionParts.push(`Your interests overlap only moderately, so outing themes might take a little extra alignment.`);
      }
    } else if (d.key === 'values') {
      if (isClearFriction) {
        frictionParts.push(`You have different core value priorities, so some worldviews may contrast.`);
      } else {
        frictionParts.push(`Your underlying value stances have slight nuance differences.`);
      }
    } else if (d.key === 'geography') {
      const areaA = vecA.geography?.home_area || 'Singapore';
      const areaB = vecB.geography?.home_area || 'Singapore';
      if (areaA === areaB) continue;

      if (isClearFriction) {
        frictionParts.push(`${nameB} is based in ${areaB}, while you are in ${areaA}, so travel time requires planning.`);
      } else {
        frictionParts.push(`You live in different neighbourhoods in Singapore, so meetup spots will need mutual travel.`);
      }
    }
  }

  // Fallback if no candidate dimension produced a sentence
  if (frictionParts.length === 0) {
    const weakest = eligibleDims[0];
    const label = DIM_LABELS[weakest.key] || 'social rhythm';
    frictionParts.push(`Nothing much to flag — the mildest difference is around ${label}, and it's small.`);
  }

  const friction_text = frictionParts.join(' ');

  return {
    click_text,
    friction_text,
    generated_by: 'deterministic_template',
  };
}
