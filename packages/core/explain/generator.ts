import type { ProfileVector, OnboardingAnswers } from '../domain/types.ts';
import { extractMarkers, type Marker } from './markers.ts';
import { composeWithinPerson } from './withinPerson.ts';
import { composeDyad, type DyadicStatement } from './dyad.ts';
import { evaluateMechanism, type NamedFrictionType, type FrictionSeverity } from '../matching/mechanisms.ts';
import { assertNoLevel5Violations } from './blocklist.ts';
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
} from '../matching/threads.ts';

export interface ExplanationText {
  click_text: string;
  friction_text: string;
  generated_by: string;
  headline?: string;
  why_click?: string[];
  conversation_feel?: string[];
  friendship_path?: string[];
  potential_friction?: string[];
  dyadic_statements?: DyadicStatement[];
}

function isThreadAnswered(vec: ProfileVector, key: string): boolean {
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

function formatInterestName(item: any): string {
  if (!item) return '';
  let str = '';
  if (typeof item === 'string') str = item;
  else if (typeof item === 'object') {
    str = item.node_name || item.node_path || item.name || item.interest_name || '';
  } else {
    str = String(item);
  }
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatValueName(item: any): string {
  if (!item) return '';
  let str = '';
  if (typeof item === 'string') str = item;
  else if (typeof item === 'object') {
    str = item.value_name || item.name || item.label || item.value_key || '';
  } else {
    str = String(item);
  }
  if (!str) return '';
  str = str.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  if (str.toLowerCase().startsWith('i really respect people who ')) {
    str = str.substring('i really respect people who '.length);
  }
  return str;
}

const THREAD_LABELS: Record<string, string> = {
  personality: 'personality & social energy',
  communication: 'messaging & response pace',
  social_rhythm: 'planning style',
  intent: 'friendship depth expectations',
  emotional: 'emotional opening pace',
  interests: 'activity interests',
  values: 'underlying core values',
  lifestyle: 'lifestyle habits',
  experience: 'outing preferences',
  geography: 'preferred neighbourhoods',
};

const CLICK_THREAD_PRIORITY: Record<string, number> = {
  interests: 10,
  values: 9,
  intent: 8,
  personality: 7,
  communication: 6,
  emotional: 5,
  lifestyle: 4,
  experience: 3,
  social_rhythm: 2,
};

export function generateMatchExplanation(
  vecA: ProfileVector,
  vecB: ProfileVector
): ExplanationText {
  const nameA = vecA.profile.display_name;
  const nameB = vecB.profile.display_name;

  // Layer 1: Marker Extraction (Using raw onboarding answers as primary source when available)
  const rawMarkersA = extractMarkers(vecA, vecA.answers);
  const rawMarkersB = extractMarkers(vecB, vecB.answers);

  // Layer 2: Within-Person Composition
  const markersA = composeWithinPerson(rawMarkersA);
  const markersB = composeWithinPerson(rawMarkersB);

  // Layer 3: Dyadic Composition
  const dyadicStatements = composeDyad(markersA, markersB, nameA, nameB);

  const clickStatements = dyadicStatements.filter((s) => s.section === 'click');
  const convStatements = dyadicStatements.filter((s) => s.section === 'conversation');
  const pathStatements = dyadicStatements.filter((s) => s.section === 'friendship_path');
  const frictionStatements = dyadicStatements.filter((s) => s.section === 'friction');

  const hasRawAnswers = (vecA.answers && Object.keys(vecA.answers).length > 0) || (vecB.answers && Object.keys(vecB.answers).length > 0);

  // PREFERENTIAL DYADIC OUTPUT ASSEMBLY FOR RAW ANSWERS
  let click_text = '';
  if (hasRawAnswers && (clickStatements.length > 0 || convStatements.length > 0 || pathStatements.length > 0)) {
    const combined = [...clickStatements, ...convStatements, ...pathStatements];
    click_text = Array.from(new Set(combined.map((s) => s.text))).join(' ');
  }

  let friction_text = '';
  if (hasRawAnswers && frictionStatements.length > 0) {
    friction_text = Array.from(new Set(frictionStatements.map((s) => s.text))).join(' ');
  }

  // THREAD FALLBACK FOR THIN PROFILES OR VECTOR-ONLY SYNTHETIC FIXTURES
  const threadScores = [
    { key: 'personality', score: scorePersonality(vecA, vecB), weight: 15 },
    { key: 'communication', score: scoreCommunication(vecA, vecB), weight: 15 },
    { key: 'social_rhythm', score: scoreSocialRhythm(vecA, vecB), weight: 15 },
    { key: 'intent', score: scoreIntent(vecA, vecB), weight: 15 },
    { key: 'emotional', score: scoreEmotional(vecA, vecB), weight: 10 },
    { key: 'interests', score: scoreInterests(vecA, vecB), weight: 10 },
    { key: 'values', score: scoreValues(vecA, vecB), weight: 8 },
    { key: 'lifestyle', score: scoreLifestyle(vecA, vecB), weight: 7 },
    { key: 'experience', score: scoreExperience(vecA, vecB), weight: 3 },
  ].filter((d): d is { key: string; score: number; weight: number } => typeof d.score === 'number');

  const evaluated = threadScores.map((d) => ({
    ...d,
    contrib: d.weight * (d.score - 0.5),
  }));

  if (!click_text) {
    const eligibleClickThreads = evaluated.filter(
      (d) => isThreadAnswered(vecA, d.key) && isThreadAnswered(vecB, d.key)
    );

    if (eligibleClickThreads.length === 0) {
      click_text = `Shared community member in Singapore with ${nameB}.`;
    } else {
      eligibleClickThreads.sort((a, b) => {
        const priorityA = (CLICK_THREAD_PRIORITY[a.key] || 1) + a.score;
        const priorityB = (CLICK_THREAD_PRIORITY[b.key] || 1) + b.score;
        return priorityB - priorityA;
      });

      const clickParts: string[] = [];
      const candidateClickThreads = eligibleClickThreads.filter((d) => d.score >= 0.40);

      for (const d of candidateClickThreads) {
        if (clickParts.length >= 2) break;

        const isStrong = d.score >= 0.70;

        if (d.key === 'interests') {
          const rawInterests = vecB.interests || [];
          const formattedInterests = rawInterests.map(formatInterestName).filter(Boolean);
          if (isStrong && formattedInterests.length > 0) {
            clickParts.push(`Shared curiosity with ${nameB} in ${formattedInterests.slice(0, 2).join(' and ')}.`);
          } else if (formattedInterests.length > 0) {
            clickParts.push(`Overlap with ${nameB} in ${formattedInterests[0]}.`);
          } else {
            clickParts.push(`Shared curiosity across several outing activity themes.`);
          }
        } else if (d.key === 'values') {
          const rawValues = vecB.values || [];
          const formattedValues = rawValues.map(formatValueName).filter(Boolean);
          if (isStrong && formattedValues.length > 0) {
            clickParts.push(`Aligned core values with ${nameB} around ${formattedValues.slice(0, 2).join(' and ')}.`);
          } else if (formattedValues.length > 0) {
            clickParts.push(`Shared value focus with ${nameB} on ${formattedValues[0]}.`);
          } else {
            clickParts.push(`Steady alignment with ${nameB} on underlying core values.`);
          }
        } else if (d.key === 'intent') {
          const valB = vecB.intent?.depth ?? 2;
          if (isStrong) {
            clickParts.push(`Strong alignment on friendship intent with ${nameB}: ${PHRASES.depth(valB)}.`);
          } else {
            clickParts.push(`Comfortable overlap with ${nameB} on friendship intent (${PHRASES.depth(valB)}).`);
          }
        } else if (d.key === 'personality') {
          const valB = vecB.personality?.extraversion ?? 0.5;
          if (isStrong) {
            clickParts.push(`Social energy and curiosity align with ${nameB}; ${PHRASES.extraversion(valB)}.`);
          } else {
            clickParts.push(`Social energy levels with ${nameB} complement each other comfortably.`);
          }
        } else if (d.key === 'communication') {
          const valB = vecB.communication?.contact_frequency_self ?? 0.5;
          const respB = vecB.communication?.response_speed_self ?? 0.5;
          if (isStrong) {
            clickParts.push(`Compatible messaging rhythms with ${nameB}; ${PHRASES.responseSpeed(respB)} and ${PHRASES.cadenceNeed(valB)}.`);
          } else {
            clickParts.push(`Messaging expectations with ${nameB} are easy-going; ${PHRASES.responseSpeed(respB)}.`);
          }
        } else if (d.key === 'emotional') {
          const valB = vecB.emotional?.er_opening_pace ?? 0.5;
          if (isStrong) {
            clickParts.push(`Emotional opening pace matches well; ${nameB} ${PHRASES.openingPace(valB)}.`);
          } else {
            clickParts.push(`Comfortable opening pace with ${nameB} as you get to know each other.`);
          }
        } else if (d.key === 'lifestyle') {
          const valB = vecB.lifestyle?.budget_band ?? 2;
          if (isStrong) {
            clickParts.push(`Similar lifestyle tempo; ${nameB} ${PHRASES.budgetBand(valB)}.`);
          } else {
            clickParts.push(`Balanced lifestyle habits with ${nameB}.`);
          }
        } else if (d.key === 'experience') {
          clickParts.push(`Shared preferences for outing formats with ${nameB}.`);
        } else if (d.key === 'social_rhythm') {
          clickParts.push(`Compatible schedule availability with ${nameB}.`);
        }
      }

      click_text = clickParts.join(' ');
    }
  }

  if (!friction_text) {
    const eligibleThreads = evaluated.filter(
      (d) => isThreadAnswered(vecA, d.key) && isThreadAnswered(vecB, d.key)
    );

    eligibleThreads.sort((a, b) => a.score - b.score);

    const frictionParts: string[] = [];
    const candidateFrictionThreads = eligibleThreads.filter((d) => d.score < 0.75);

    for (const d of candidateFrictionThreads) {
      if (frictionParts.length >= 2) break;

      const isClearFriction = d.score < 0.40;

      if (d.key === 'personality') {
        const contrast = frictionParts.length > 0 ? 'while you' : 'whereas you';
        if (isClearFriction) {
          const valA = vecA.personality?.extraversion ?? 0.5;
          const valB = vecB.personality?.extraversion ?? 0.5;
          const extA = PHRASES_YOU.extraversion(valA);
          const extB = PHRASES.extraversion(valB);
          frictionParts.push(`${nameB} ${extB}, ${contrast} ${extA}.`);
        } else {
          const valA = vecA.personality?.conscientiousness ?? 0.5;
          const valB = vecB.personality?.conscientiousness ?? 0.5;
          if (PHRASES.extraversion(valA) === PHRASES.extraversion(valB)) continue;
          const consA = PHRASES_YOU.extraversion(valA);
          const consB = PHRASES.extraversion(valB);
          frictionParts.push(`In day-to-day structure, ${nameB} ${consB}, while you ${consA}.`);
        }
      } else if (d.key === 'communication') {
        const valA = vecA.communication?.contact_frequency_self ?? 0.5;
        const valB = vecB.communication?.contact_frequency_self ?? 0.5;
        if (PHRASES.cadenceNeed(valA) === PHRASES.cadenceNeed(valB)) continue;
        const contrast = frictionParts.length > 0 ? 'while you' : 'whereas you';
        const cadenceA = PHRASES_YOU.cadenceNeed(valA);
        const cadenceB = PHRASES.cadenceNeed(valB);
        if (isClearFriction) {
          frictionParts.push(`On contact cadence, ${nameB} ${cadenceB}, ${contrast} ${cadenceA}.`);
        } else {
          frictionParts.push(`In message pacing, ${nameB} ${cadenceB}, while you ${cadenceA}.`);
        }
      } else if (d.key === 'social_rhythm') {
        const valA = vecA.social_rhythm?.planning_horizon ?? 0.5;
        const valB = vecB.social_rhythm?.planning_horizon ?? 0.5;
        if (PHRASES.planningHorizon(valA) === PHRASES.planningHorizon(valB)) continue;
        const contrast = frictionParts.length > 0 ? 'while you' : 'whereas you';
        const planA = PHRASES_YOU.planningHorizon(valA);
        const planB = PHRASES.planningHorizon(valB);
        if (isClearFriction) {
          frictionParts.push(`On planning outings, ${nameB} ${planB}, ${contrast} ${planA}.`);
        } else {
          frictionParts.push(`In planning rhythm, ${nameB} ${planB}, while you ${planA}.`);
        }
      } else if (d.key === 'emotional') {
        const valA = vecA.emotional?.er_opening_pace ?? 0.5;
        const valB = vecB.emotional?.er_opening_pace ?? 0.5;
        if (PHRASES.openingPace(valA) === PHRASES.openingPace(valB)) continue;
        const contrast = frictionParts.length > 0 ? 'while you' : 'whereas you';
        const paceA = PHRASES_YOU.openingPace(valA);
        const paceB = PHRASES.openingPace(valB);
        if (isClearFriction) {
          frictionParts.push(`On emotional opening pace, ${nameB} ${paceB}, ${contrast} ${paceA}.`);
        } else {
          frictionParts.push(`In sharing personal details, ${nameB} ${paceB}, while you ${paceA}.`);
        }
      } else if (d.key === 'intent') {
        const valA = vecA.intent?.depth ?? 2;
        const valB = vecB.intent?.depth ?? 2;
        if (PHRASES.depth(valA) === PHRASES.depth(valB)) continue;
        const contrast = frictionParts.length > 0 ? 'while you' : 'whereas you';
        const depthA = PHRASES_YOU.depth(valA);
        const depthB = PHRASES.depth(valB);
        if (isClearFriction) {
          frictionParts.push(`On friendship depth, ${nameB} ${depthB}, ${contrast} ${depthA}.`);
        } else {
          frictionParts.push(`In friendship intent, ${nameB} ${depthB}, while you ${depthA}.`);
        }
      } else if (d.key === 'lifestyle') {
        const contrast = frictionParts.length > 0 ? 'while you' : 'whereas you';
        if (isClearFriction) {
          const valA = vecA.lifestyle?.budget_band ?? 2;
          const valB = vecB.lifestyle?.budget_band ?? 2;
          if (PHRASES.budgetBand(valA) !== PHRASES.budgetBand(valB)) {
            const budgetA = PHRASES_YOU.budgetBand(valA);
            const budgetB = PHRASES.budgetBand(valB);
            frictionParts.push(`${nameB} ${budgetB}, ${contrast} ${budgetA}.`);
          }
        } else {
          const valA = vecA.lifestyle?.activity_level ?? 0.5;
          const valB = vecB.lifestyle?.activity_level ?? 0.5;
          if (PHRASES.activityLevel(valA) !== PHRASES.activityLevel(valB)) {
            const actA = PHRASES_YOU.activityLevel(valA);
            const actB = PHRASES.activityLevel(valB);
            frictionParts.push(`In activity style, ${nameB} ${actB}, while you ${actA}.`);
          }
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
      }
    }

    if (frictionParts.length === 0) {
      const weakest = eligibleThreads.filter((d) => d.key !== 'geography')[0];
      if (!weakest || eligibleThreads.length <= 1) {
        frictionParts.push(`${nameB} is still completing their Tribal Pass - specific friction points will sharpen as more answers are shared.`);
      } else {
        const label = THREAD_LABELS[weakest.key] || 'social rhythm';
        frictionParts.push(`Nothing much to flag - the mildest difference is around ${label}, and it's small.`);
      }
    }

    friction_text = frictionParts.join(' ');
  }

  // Headline (Dual phrase pair without percentages)
  const clickHeadline = clickStatements[0]?.headline || convStatements[0]?.headline || 'Conversational resonance';
  const frictionHeadline = frictionStatements[0]?.headline || 'Harmonious social rhythm';
  const headline = `${clickHeadline} · ${frictionHeadline}`;

  // Assert Level 5 blocklist on all output strings
  assertNoLevel5Violations(click_text);
  assertNoLevel5Violations(friction_text);
  assertNoLevel5Violations(headline);

  return {
    click_text,
    friction_text,
    generated_by: 'deterministic_compositional_layer',
    headline,
    why_click: clickStatements.length > 0 ? clickStatements.map((s) => s.text) : undefined,
    conversation_feel: convStatements.length > 0 ? convStatements.map((s) => s.text) : undefined,
    friendship_path: pathStatements.length > 0 ? pathStatements.map((s) => s.text) : undefined,
    potential_friction: frictionStatements.length > 0 ? frictionStatements.map((s) => s.text) : undefined,
    dyadic_statements: dyadicStatements,
  };
}
