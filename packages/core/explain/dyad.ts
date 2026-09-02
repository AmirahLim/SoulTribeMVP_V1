import type { Marker } from './markers.ts';
import type { NamedFrictionType, FrictionSeverity } from '../matching/mechanisms.ts';
import { containsLevel5Violation } from './blocklist.ts';

export interface DyadicStatement {
  id: string;
  section: 'click' | 'conversation' | 'friendship_path' | 'friction';
  level: 1 | 2 | 3 | 4; // Evidence Level
  sources: string[];    // Answer sources from Person A & B
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
  // 1. PLANNING — Friction
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
  // 1. PLANNING — Alignment
  {
    id: 'dyad-planning-shared-advance',
    section: 'click',
    level: 3,
    requiredA: ['advance-planning'],
    requiredB: ['advance-planning'],
    generateText: (_nameA, _nameB) => ({
      headline: 'Shared planning rhythm',
      text: 'Both of you like locking in dates well ahead of time, making organizing catch-ups effortless.',
    }),
  },

  // 2. CONTACT — Friction
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
  // 2. CONTACT — Alignment (The Quiet-Week Rule for Marcus & Amirah!)
  {
    id: 'dyad-quiet-week-alignment',
    section: 'click',
    level: 4,
    requiredA: ['low-contact'],
    requiredB: ['low-contact'],
    generateText: (_nameA, _nameB) => ({
      headline: 'Low-pressure social pace',
      text: 'Neither of you will read a quiet week as rejection.',
    }),
  },

  // 3. TEMPO — Friction
  {
    id: 'dyad-tempo-rapid-async',
    section: 'friction',
    level: 3,
    requiredA: ['rapid-responder'],
    requiredB: ['async-pacer'],
    frictionType: 'TEMPO',
    severity: 'NEGOTIABLE',
    generateText: (_nameA, nameB) => ({
      headline: 'Differing reply pacing',
      text: `You tend to reply in real time when free, whereas ${nameB} batch-processes messages when downtime allows.`,
    }),
  },
  // 3. TEMPO — Alignment
  {
    id: 'dyad-tempo-shared-async',
    section: 'click',
    level: 3,
    requiredA: ['async-pacer'],
    requiredB: ['async-pacer'],
    generateText: (_nameA, _nameB) => ({
      headline: 'Easy-going response pace',
      text: 'Neither of you expects instant replies, keeping messaging low-stress.',
    }),
  },

  // 4. ENERGY — Friction
  {
    id: 'dyad-energy-expansive-selective',
    section: 'friction',
    level: 3,
    requiredA: ['socially-expansive'],
    requiredB: ['socially-selective'],
    frictionType: 'ENERGY',
    severity: 'NEGOTIABLE',
    generateText: (_nameA, nameB) => ({
      headline: 'Social battery contrast',
      text: `You draw energy from lively group environments, while ${nameB} recharges in smaller, quieter catch-ups.`,
    }),
  },
  // 4. ENERGY — Alignment
  {
    id: 'dyad-energy-shared-selective',
    section: 'click',
    level: 3,
    requiredA: ['socially-selective'],
    requiredB: ['socially-selective'],
    generateText: (_nameA, _nameB) => ({
      headline: 'Grounded social energy',
      text: 'You both protect your social battery for high-quality, intimate meetups.',
    }),
  },

  // 5. DEPTH — Friction
  {
    id: 'dyad-depth-oriented-casual',
    section: 'friction',
    level: 3,
    requiredA: ['depth-oriented'],
    requiredB: ['casual-vibe'],
    frictionType: 'DEPTH',
    severity: 'STRUCTURAL',
    generateText: (_nameA, nameB) => ({
      headline: 'Divergent depth expectations',
      text: `You look for deep personal sharing early, while ${nameB} prefers keeping initial hangouts light and low-pressure.`,
    }),
  },
  // 5. DEPTH — Alignment
  {
    id: 'dyad-depth-shared-meaningful',
    section: 'click',
    level: 3,
    requiredA: ['depth-oriented'],
    requiredB: ['depth-oriented'],
    generateText: (_nameA, _nameB) => ({
      headline: 'Shared depth expectation',
      text: 'Both of you value meaningful, authentic conversation over surface-level small talk.',
    }),
  },

  // 6. INITIATION — Alignment / Complementarity
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
  // 6. INITIATION — Friction
  {
    id: 'dyad-initiation-dual-responsive',
    section: 'friction',
    level: 3,
    requiredA: ['responsive-joiner'],
    requiredB: ['responsive-joiner'],
    frictionType: 'INITIATION',
    severity: 'NEGOTIABLE',
    generateText: (_nameA, nameB) => ({
      headline: 'Dual invitation hesitation',
      text: `Both of you tend to wait for invitations, so setting a first date might require one of you to take the first step.`,
    }),
  },

  // 7. SETTING — Friction
  {
    id: 'dyad-setting-quiet-active',
    section: 'friction',
    level: 3,
    requiredA: ['quiet-setting'],
    requiredB: ['active-setting'],
    frictionType: 'SETTING',
    severity: 'NEGOTIABLE',
    generateText: (_nameA, nameB) => ({
      headline: 'Environment preference contrast',
      text: `You prefer cozy, low-noise venues, whereas ${nameB} feels energized in bustling, active settings.`,
    }),
  },
  // 7. SETTING — Alignment
  {
    id: 'dyad-setting-shared-quiet',
    section: 'click',
    level: 3,
    requiredA: ['quiet-setting'],
    requiredB: ['quiet-setting'],
    generateText: (_nameA, _nameB) => ({
      headline: 'Quiet venue alignment',
      text: 'You both enjoy calm, comfortable spaces where conversation takes center stage.',
    }),
  },

  // 8. ACTIVITY — Friction
  {
    id: 'dyad-activity-focused-casual',
    section: 'friction',
    level: 3,
    requiredA: ['activity-oriented'],
    requiredB: ['table-talk-enthusiast'],
    frictionType: 'ACTIVITY',
    severity: 'NEGOTIABLE',
    generateText: (_nameA, nameB) => ({
      headline: 'Focus format difference',
      text: `You prefer structured activities as conversation anchors, while ${nameB} prefers unstructured table conversation.`,
    }),
  },
  // 8. ACTIVITY — Alignment
  {
    id: 'dyad-activity-shared-anchor',
    section: 'friendship_path',
    level: 3,
    requiredA: ['activity-oriented'],
    requiredB: ['activity-oriented'],
    generateText: (_nameA, _nameB) => ({
      headline: 'Shared activity anchor',
      text: 'Doing something interactive together gives your connection an easy, natural starting point.',
    }),
  },

  // 9. EXPECTATION — Friction
  {
    id: 'dyad-expectation-commitment-casual',
    section: 'friction',
    level: 3,
    requiredA: ['commitment-seeking'],
    requiredB: ['casual-vibe'],
    frictionType: 'EXPECTATION',
    severity: 'STRUCTURAL',
    generateText: (_nameA, nameB) => ({
      headline: 'Friendship commitment gap',
      text: `You seek regular, long-term friendship bonds, whereas ${nameB} approaches new connections with casual openness.`,
    }),
  },
  // 9. EXPECTATION — Alignment
  {
    id: 'dyad-expectation-shared-commitment',
    section: 'click',
    level: 3,
    requiredA: ['commitment-seeking'],
    requiredB: ['commitment-seeking'],
    generateText: (_nameA, _nameB) => ({
      headline: 'Shared friendship intention',
      text: 'You are both looking to invest time into building a durable, regular friendship.',
    }),
  },

  // 10. RECIPROCITY — Friction
  {
    id: 'dyad-reciprocity-high-informal',
    section: 'friction',
    level: 3,
    requiredA: ['vulnerable-sharer'],
    requiredB: ['emotionally-private'],
    frictionType: 'RECIPROCITY',
    severity: 'NOTICEABLE',
    generateText: (_nameA, nameB) => ({
      headline: 'Sharing balance contrast',
      text: `You open up early, while ${nameB} takes more time to build trust before sharing personal experiences.`,
    }),
  },
  // 10. RECIPROCITY — Alignment
  {
    id: 'dyad-reciprocity-shared-trust',
    section: 'conversation',
    level: 3,
    requiredA: ['trust-first'],
    requiredB: ['trust-first'],
    generateText: (_nameA, _nameB) => ({
      headline: 'Paced mutual trust',
      text: 'Neither of you rushes emotional intimacy, allowing trust to develop naturally over time.',
    }),
  },

  // 11. NOVELTY — Friction
  {
    id: 'dyad-novelty-seeking-familiarity',
    section: 'friction',
    level: 3,
    requiredA: ['novelty-seeking'],
    requiredB: ['familiarity-comfort'],
    frictionType: 'NOVELTY',
    severity: 'NEGOTIABLE',
    generateText: (_nameA, nameB) => ({
      headline: 'Novelty preference difference',
      text: `You enjoy exploring new places and activities, whereas ${nameB} finds comfort in familiar spots.`,
    }),
  },
  // 11. NOVELTY — Alignment
  {
    id: 'dyad-novelty-shared-explorers',
    section: 'friendship_path',
    level: 3,
    requiredA: ['novelty-seeking'],
    requiredB: ['novelty-seeking'],
    generateText: (_nameA, _nameB) => ({
      headline: 'Shared exploratory spirit',
      text: 'Both of you love trying new venues and outing ideas, keeping meetups fresh.',
    }),
  },

  // 12. INTENSITY — Friction
  {
    id: 'dyad-intensity-high-easygoing',
    section: 'friction',
    level: 3,
    requiredA: ['high-expressiveness'],
    requiredB: ['emotionally-private'],
    frictionType: 'INTENSITY',
    severity: 'NOTICEABLE',
    generateText: (_nameA, nameB) => ({
      headline: 'Expressive intensity contrast',
      text: `You bring high emotional energy to conversations, while ${nameB} maintains a calmer, understated presence.`,
    }),
  },
  // 12. INTENSITY — Alignment
  {
    id: 'dyad-intensity-shared-expressive',
    section: 'conversation',
    level: 3,
    requiredA: ['high-expressiveness'],
    requiredB: ['high-expressiveness'],
    generateText: (_nameA, _nameB) => ({
      headline: 'Vibrant conversational energy',
      text: 'Conversations between you are animated, expressive, and full of energy.',
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
