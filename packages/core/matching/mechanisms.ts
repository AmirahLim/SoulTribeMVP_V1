import type { ProfileVector } from '../domain/types.ts';
import type { ThreadKey } from './evaluation.ts';
import { extractMarkers } from '../explain/markers.ts';

export type RelationshipMechanism = 'ALIGNMENT' | 'COMPLEMENTARITY' | 'FRICTION' | 'CONTEXT';

export type NamedFrictionType =
  | 'TEMPO'
  | 'CONTACT'
  | 'PLANNING'
  | 'ENERGY'
  | 'DEPTH'
  | 'INITIATION'
  | 'SETTING'
  | 'ACTIVITY'
  | 'EXPECTATION'
  | 'RECIPROCITY'
  | 'NOVELTY'
  | 'INTENSITY';

export type FrictionSeverity =
  | 'COMPLEMENTARY'
  | 'NEGOTIABLE'
  | 'NOTICEABLE'
  | 'STRUCTURAL';

export type ThreadOutputState =
  | 'Strong alignment'
  | 'Moderate'
  | 'Complementary'
  | 'Potential friction'
  | 'Not measured';

export interface MechanismAnalysis {
  mechanism: RelationshipMechanism;
  frictionType?: NamedFrictionType;
  severity?: FrictionSeverity;
  outputState: ThreadOutputState;
  score: number | null;
  headline?: string;
}

export interface FrictionRule {
  keyA: string;
  keyB: string;
  type: NamedFrictionType;
  severity: FrictionSeverity;
  headline: string;
  perspectiveA: string;
  perspectiveB: string;
}

export const FRICTION_RULES: FrictionRule[] = [
  {
    keyA: 'advance-planning',
    keyB: 'spontaneous',
    type: 'PLANNING',
    severity: 'NOTICEABLE',
    headline: 'Different planning rhythms',
    perspectiveA: 'You like having lock-in dates early to feel organized.',
    perspectiveB: 'They prefer keeping plans open until closer to the day.',
  },
  {
    keyA: 'spontaneous',
    keyB: 'advance-planning',
    type: 'PLANNING',
    severity: 'NOTICEABLE',
    headline: 'Different planning rhythms',
    perspectiveA: 'You enjoy impromptu hangouts when free.',
    perspectiveB: 'They feel more relaxed when plans are locked in advance.',
  },
  {
    keyA: 'frequent-touchpoints',
    keyB: 'low-contact',
    type: 'CONTACT',
    severity: 'NOTICEABLE',
    headline: 'Asymmetric message frequency',
    perspectiveA: 'You maintain a steady stream of casual updates.',
    perspectiveB: 'They prefer lower text frequency between meetups.',
  },
  {
    keyA: 'low-contact',
    keyB: 'frequent-touchpoints',
    type: 'CONTACT',
    severity: 'NOTICEABLE',
    headline: 'Asymmetric message frequency',
    perspectiveA: 'You prefer light messaging between outings.',
    perspectiveB: 'They appreciate regular daily check-ins.',
  },
  {
    keyA: 'rapid-responder',
    keyB: 'async-pacer',
    type: 'TEMPO',
    severity: 'NEGOTIABLE',
    headline: 'Differing reply pacing',
    perspectiveA: 'You tend to reply in real-time when active.',
    perspectiveB: 'They batch process messages when downtime allows.',
  },
  {
    keyA: 'async-pacer',
    keyB: 'rapid-responder',
    type: 'TEMPO',
    severity: 'NEGOTIABLE',
    headline: 'Differing reply pacing',
    perspectiveA: 'You prefer asynchronous text threads.',
    perspectiveB: 'They are accustomed to quick back-and-forth messaging.',
  },
  {
    keyA: 'depth-oriented',
    keyB: 'casual-vibe',
    type: 'DEPTH',
    severity: 'STRUCTURAL',
    headline: 'Divergent depth expectations',
    perspectiveA: 'You seek vulnerable, meaningful dialogue early on.',
    perspectiveB: 'They prefer keeping conversations light and fun initially.',
  },
  {
    keyA: 'casual-vibe',
    keyB: 'depth-oriented',
    type: 'DEPTH',
    severity: 'STRUCTURAL',
    headline: 'Divergent depth expectations',
    perspectiveA: 'You value low-pressure social interactions.',
    perspectiveB: 'They look for deep personal sharing.',
  },
  {
    keyA: 'proactive-initiator',
    keyB: 'responsive-joiner',
    type: 'INITIATION',
    severity: 'COMPLEMENTARY',
    headline: 'Natural initiation balance',
    perspectiveA: 'You naturally suggest dates and places.',
    perspectiveB: 'They gladly join and follow through on invited plans.',
  },
  {
    keyA: 'responsive-joiner',
    keyB: 'proactive-initiator',
    type: 'INITIATION',
    severity: 'COMPLEMENTARY',
    headline: 'Natural initiation balance',
    perspectiveA: 'You enjoy responding to well-planned invitations.',
    perspectiveB: 'They naturally take charge of organizing.',
  },
  {
    keyA: 'socially-expansive',
    keyB: 'socially-selective',
    type: 'ENERGY',
    severity: 'NEGOTIABLE',
    headline: 'Social battery contrast',
    perspectiveA: 'You recharge in active, multi-person gatherings.',
    perspectiveB: 'They thrive best in smaller, quieter setups.',
  },
  {
    keyA: 'socially-selective',
    keyB: 'socially-expansive',
    type: 'ENERGY',
    severity: 'NEGOTIABLE',
    headline: 'Social battery contrast',
    perspectiveA: 'You protect your social energy for selective meetups.',
    perspectiveB: 'They draw energy from lively group settings.',
  },
];

/**
 * Evaluates relationship mechanisms and named friction types for a specific connection thread key.
 * Severity comes from the rule table / marker pair, never from a score threshold.
 */
export function evaluateMechanism(
  key: ThreadKey,
  score: number | null,
  vecA: ProfileVector,
  vecB: ProfileVector
): MechanismAnalysis {
  if (score === null) {
    return {
      mechanism: 'CONTEXT',
      outputState: 'Not measured',
      score: null,
    };
  }

  // Filter markers specifically for this connection thread key
  const threadMarkersA = extractMarkers(vecA).filter((m) => m.thread === key);
  const threadMarkersB = extractMarkers(vecB).filter((m) => m.thread === key);

  // Check rule table for matching pair on this thread
  for (const rule of FRICTION_RULES) {
    const hasA = threadMarkersA.some((m) => m.key === rule.keyA);
    const hasB = threadMarkersB.some((m) => m.key === rule.keyB);
    if (hasA && hasB) {
      const mech: RelationshipMechanism = rule.severity === 'COMPLEMENTARY' ? 'COMPLEMENTARITY' : 'FRICTION';
      return {
        mechanism: mech,
        frictionType: rule.type,
        severity: rule.severity,
        outputState: mech === 'COMPLEMENTARITY' ? 'Complementary' : 'Potential friction',
        score,
        headline: rule.headline,
      };
    }
  }

  // Fallback check for initiation complementarity in communication thread
  if (key === 'communication' && vecA.communication && vecB.communication) {
    const initA = vecA.communication.initiation_self;
    const initB = vecB.communication.initiation_self;
    if (typeof initA === 'number' && typeof initB === 'number' && Math.abs(initA - initB) >= 0.4) {
      return {
        mechanism: 'COMPLEMENTARITY',
        frictionType: 'INITIATION',
        severity: 'COMPLEMENTARY',
        outputState: 'Complementary',
        score,
        headline: 'Natural initiation balance',
      };
    }
  }

  if (score >= 0.75) {
    return {
      mechanism: 'ALIGNMENT',
      outputState: 'Strong alignment',
      score,
    };
  }

  if (score < 0.40) {
    return {
      mechanism: 'FRICTION',
      frictionType: 'TEMPO',
      severity: 'NOTICEABLE',
      outputState: 'Potential friction',
      score,
      headline: 'Differing preferences',
    };
  }

  return {
    mechanism: 'ALIGNMENT',
    outputState: 'Moderate',
    score,
  };
}
