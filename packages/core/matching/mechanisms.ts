import type { ProfileVector } from '../domain/types.ts';
import type { ThreadKey } from './evaluation.ts';

export type RelationshipMechanism = 'ALIGNMENT' | 'COMPLEMENTARITY' | 'FRICTION' | 'CONTEXT';

export type FrictionLevel = 'LOW' | 'PRODUCTIVE' | 'CONTEXTUAL' | 'RECURRING' | 'STRUCTURAL';

export type ThreadOutputState =
  | 'Strong alignment'
  | 'Moderate'
  | 'Complementary'
  | 'Potential friction'
  | 'Not measured';

export interface MechanismAnalysis {
  mechanism: RelationshipMechanism;
  frictionLevel?: FrictionLevel;
  outputState: ThreadOutputState;
  score: number | null;
}

/**
 * Classifies the relationship mechanism for a connection thread.
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

  let mechanism: RelationshipMechanism = 'ALIGNMENT';
  let frictionLevel: FrictionLevel | undefined;

  if (score >= 0.75) {
    mechanism = 'ALIGNMENT';
  } else if (score < 0.40) {
    mechanism = 'FRICTION';
  } else {
    // Check for complementarity traits vs friction
    if (key === 'personality') {
      const extA = vecA.personality?.extraversion;
      const extB = vecB.personality?.extraversion;
      if (typeof extA === 'number' && typeof extB === 'number' && Math.abs(extA - extB) >= 0.3) {
        mechanism = 'COMPLEMENTARITY';
      } else {
        mechanism = 'ALIGNMENT';
      }
    } else if (key === 'communication') {
      mechanism = score < 0.55 ? 'FRICTION' : 'COMPLEMENTARITY';
    } else if (key === 'experience' || key === 'lifestyle') {
      mechanism = 'CONTEXT';
    } else {
      mechanism = 'ALIGNMENT';
    }
  }

  // Classify friction level if friction is present
  if (mechanism === 'FRICTION' || score < 0.55) {
    if (key === 'intent' || key === 'geography') {
      frictionLevel = 'STRUCTURAL';
    } else if (key === 'communication') {
      frictionLevel = 'RECURRING';
    } else if (key === 'experience' || key === 'lifestyle') {
      frictionLevel = 'CONTEXTUAL';
    } else if (key === 'interests' || key === 'personality') {
      frictionLevel = 'PRODUCTIVE';
    } else {
      frictionLevel = 'LOW';
    }
  }

  let outputState: ThreadOutputState = 'Moderate';
  if (score >= 0.75 && mechanism === 'ALIGNMENT') {
    outputState = 'Strong alignment';
  } else if (mechanism === 'COMPLEMENTARITY') {
    outputState = 'Complementary';
  } else if (mechanism === 'FRICTION' || score < 0.40) {
    outputState = 'Potential friction';
  } else {
    outputState = 'Moderate';
  }

  return {
    mechanism,
    frictionLevel,
    outputState,
    score,
  };
}
