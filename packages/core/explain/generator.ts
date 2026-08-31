import type { ProfileVector } from '../domain/types.ts';
import { PHRASES } from './phrases.ts';
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
  // Top negative divergent dimensions
  const divergent = [...evaluated].sort((a, b) => a.contrib - b.contrib).slice(0, 2);

  // Build positive click text
  const clickParts: string[] = [];

  for (const d of aligned) {
    if (d.key === 'intent') {
      clickParts.push(`You both share alignment on friendship intent — ${PHRASES.depth(vecB.intent?.depth ?? 2)}.`);
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

  // Build mandatory friction text ("Where you might rub")
  const frictionParts: string[] = [];

  for (const d of divergent) {
    if (d.score < 0.55) {
      if (d.key === 'experience' || d.key === 'personality') {
        const sizeA = PHRASES.groupSize(vecA.experience?.group_size_pref ?? 0.5);
        const sizeB = PHRASES.groupSize(vecB.experience?.group_size_pref ?? 0.5);
        frictionParts.push(`${nameB} ${sizeB}, while you tend toward ${sizeA}.`);
      } else if (d.key === 'social_rhythm') {
        const planA = PHRASES.planningHorizon(vecA.social_rhythm?.planning_horizon ?? 0.5);
        const planB = PHRASES.planningHorizon(vecB.social_rhythm?.planning_horizon ?? 0.5);
        frictionParts.push(`${nameB} ${planB}, whereas you usually ${planA}.`);
      } else if (d.key === 'emotional') {
        const confA = PHRASES.conflictApproach(vecA.emotional?.er_conflict_approach ?? 0.5);
        const confB = PHRASES.conflictApproach(vecB.emotional?.er_conflict_approach ?? 0.5);
        frictionParts.push(`On tension, ${nameB} ${confB}, while you ${confA}.`);
      } else if (d.key === 'communication') {
        const respA = PHRASES.responseSpeed(vecA.communication?.response_speed_self ?? 0.5);
        const respB = PHRASES.responseSpeed(vecB.communication?.response_speed_self ?? 0.5);
        frictionParts.push(`In messaging, ${nameB} ${respB}, whereas you ${respA}.`);
      }
    }
  }

  const friction_text =
    frictionParts.length > 0
      ? frictionParts.join(' ')
      : "Nothing obvious to flag here — you're aligned on most of what usually causes friction.";

  return {
    click_text,
    friction_text, // NON-NEGOTIABLE: MUST ALWAYS BE NON-EMPTY
    generated_by: 'deterministic_template',
  };
}
