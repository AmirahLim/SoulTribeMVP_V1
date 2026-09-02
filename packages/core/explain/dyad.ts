import type { Marker } from './markers.ts';
import type { NamedFrictionType, FrictionSeverity } from '../matching/mechanisms.ts';
import { containsLevel5Violation } from './blocklist.ts';

export interface DyadicStatement {
  id: string;
  section: 'click' | 'conversation' | 'friendship_path' | 'friction';
  level: 1 | 2 | 3 | 4; // Evidence Level: 1=Direct, 2=Cross-signal, 3=Dyadic, 4=Contextual prediction
  sources: string[];    // Answers behind the statement (sources from Person A & Person B)
  headline?: string;
  text: string;
  frictionType?: NamedFrictionType;
  severity?: FrictionSeverity;
}

export interface DyadicRule {
  id: string;
  section: DyadicStatement['section'];
  level: 1 | 2 | 3 | 4;
  requiredA: string[];
  requiredB: string[];
  generateText: (nameA: string, nameB: string) => { headline?: string; text: string };
  frictionType?: NamedFrictionType;
  severity?: FrictionSeverity;
}

export const DYADIC_RULES: DyadicRule[] = [
  // 1. Planning Rhythm Friction (A: advance-planning x B: spontaneous)
  {
    id: 'dyad-planning-advance-spontaneous',
    section: 'friction',
    level: 3,
    requiredA: ['advance-planning'],
    requiredB: ['spontaneous'],
    frictionType: 'PLANNING',
    severity: 'NOTICEABLE',
    generateText: (_nameA, nameB) => ({
      headline: 'Different planning rhythms',
      text: `Getting the outing into the calendar may be harder than enjoying it once you're there. You like dates locked in early; ${nameB} prefers keeping plans flexible until closer to the day.`,
    }),
  },
  // 2. Planning Rhythm Friction (A: spontaneous x B: advance-planning)
  {
    id: 'dyad-planning-spontaneous-advance',
    section: 'friction',
    level: 3,
    requiredA: ['spontaneous'],
    requiredB: ['advance-planning'],
    frictionType: 'PLANNING',
    severity: 'NOTICEABLE',
    generateText: (_nameA, nameB) => ({
      headline: 'Different planning rhythms',
      text: `You may prefer impromptu hangouts when free, while ${nameB} feels more relaxed when plans are locked in advance.`,
    }),
  },
  // 3. Message Frequency Friction (A: frequent-touchpoints x B: low-contact)
  {
    id: 'dyad-contact-frequent-low',
    section: 'friction',
    level: 3,
    requiredA: ['frequent-touchpoints'],
    requiredB: ['low-contact'],
    frictionType: 'CONTACT',
    severity: 'NOTICEABLE',
    generateText: (_nameA, nameB) => ({
      headline: 'Asymmetric message frequency',
      text: `You could read their quiet periods as low effort; ${nameB} simply finds messaging less central between meetups.`,
    }),
  },
  // 4. Low-contact Alignment (Both socially-selective + low-contact)
  {
    id: 'dyad-quiet-week-alignment',
    section: 'click',
    level: 4,
    requiredA: ['socially-selective', 'low-contact'],
    requiredB: ['socially-selective', 'low-contact'],
    generateText: (_nameA, _nameB) => ({
      headline: 'Low-pressure social pace',
      text: 'Neither of you will read a quiet week as rejection.',
    }),
  },
  // 5. Playful Depth Dynamic (Both depth-oriented + playful)
  {
    id: 'dyad-playful-depth-dynamic',
    section: 'conversation',
    level: 4,
    requiredA: ['depth-oriented', 'playful'],
    requiredB: ['depth-oriented', 'playful'],
    generateText: (_nameA, _nameB) => ({
      headline: 'Playful banter turning deep',
      text: 'Joking around is likely to turn into a longer conversation than either of you planned.',
    }),
  },
  // 6. Initiation Balance (A: proactive-initiator x B: responsive-joiner)
  {
    id: 'dyad-initiation-balance',
    section: 'click',
    level: 3,
    requiredA: ['proactive-initiator'],
    requiredB: ['responsive-joiner'],
    generateText: (_nameA, nameB) => ({
      headline: 'Natural initiation balance',
      text: `You naturally take charge of organizing outings, and ${nameB} gladly responds and follows through on invited plans.`,
    }),
  },
  // 7. Social Energy Complementarity
  {
    id: 'dyad-energy-complementarity',
    section: 'conversation',
    level: 3,
    requiredA: ['socially-expansive'],
    requiredB: ['socially-selective'],
    generateText: (_nameA, nameB) => ({
      headline: 'Balanced social energy',
      text: `Your expansive social energy brings lively topics to the group, while ${nameB} brings grounded, attentive listening.`,
    }),
  },
  // 8. Depth Alignment
  {
    id: 'dyad-depth-alignment',
    section: 'click',
    level: 3,
    requiredA: ['depth-oriented'],
    requiredB: ['depth-oriented'],
    generateText: (_nameA, _nameB) => ({
      headline: 'Shared depth expectation',
      text: 'Both of you value meaningful, authentic conversation over surface-level small talk.',
    }),
  },
];

/**
 * Layer 3 — Dyadic composition.
 * Takes markers from BOTH people and evaluates dyadic rules.
 * Emits statements only when ALL required markers from Person A and Person B are present.
 */
export function composeDyad(
  markersA: Marker[],
  markersB: Marker[],
  nameA: string,
  nameB: string
): DyadicStatement[] {
  if (!markersA || !markersB || markersA.length === 0 || markersB.length === 0) {
    return [];
  }

  const setA = new Set(markersA.map((m) => m.key));
  const setB = new Set(markersB.map((m) => m.key));
  const statements: DyadicStatement[] = [];

  for (const rule of DYADIC_RULES) {
    const hasAllA = rule.requiredA.every((k) => setA.has(k));
    const hasAllB = rule.requiredB.every((k) => setB.has(k));

    if (hasAllA && hasAllB) {
      const matchA = markersA.filter((m) => rule.requiredA.includes(m.key));
      const matchB = markersB.filter((m) => rule.requiredB.includes(m.key));

      const sourcesA = matchA.map((m) => m.source);
      const sourcesB = matchB.map((m) => m.source);
      const allSources = Array.from(new Set([...sourcesA, ...sourcesB]));

      const generated = rule.generateText(nameA, nameB);

      // Level 5 blocklist safety check
      if (containsLevel5Violation(generated.text) || (generated.headline && containsLevel5Violation(generated.headline))) {
        continue;
      }

      statements.push({
        id: rule.id,
        section: rule.section,
        level: rule.level,
        sources: allSources,
        headline: generated.headline,
        text: generated.text,
        frictionType: rule.frictionType,
        severity: rule.severity,
      });
    }
  }

  // Dynamic Shared Interest Rules
  const interestsA = markersA.filter((m) => m.key.startsWith('interest-'));
  const interestsB = markersB.filter((m) => m.key.startsWith('interest-'));

  for (const intA of interestsA) {
    const matchingB = interestsB.find((intB) => intB.key === intA.key);
    if (matchingB) {
      const interestName = intA.key.replace('interest-', '').replace(/-/g, ' ');
      const text = `You both share a passion for ${interestName}. Meeting around a shared activity gives your connection an easy starting point.`;
      if (!containsLevel5Violation(text)) {
        statements.push({
          id: `shared-interest-${intA.key}`,
          section: 'friendship_path',
          level: 3,
          sources: [intA.source, matchingB.source],
          headline: `Shared interest in ${interestName}`,
          text,
        });
      }
    }
  }

  return statements;
}
