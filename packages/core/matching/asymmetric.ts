import type { ProfileVector } from '../domain/types.ts';

export interface AsymmetricFitResult {
  fitAtoB: number | null;
  fitBtoA: number | null;
  imbalance: number;
  penalizedResonance: number | null;
}

/**
 * Calculates directional compatibility fitAtoB and fitBtoA between two profiles.
 */
export function calculateAsymmetricFit(
  vecA: ProfileVector,
  vecB: ProfileVector,
  baseResonance: number | null
): AsymmetricFitResult {
  if (baseResonance === null) {
    return {
      fitAtoB: null,
      fitBtoA: null,
      imbalance: 0,
      penalizedResonance: null,
    };
  }

  let scoreAtoB = baseResonance;
  let scoreBtoA = baseResonance;

  // Communication expectation fit: A expects X, B delivers X vs B expects Y, A delivers Y
  const cA = vecA.communication;
  const cB = vecB.communication;
  if (cA && cB) {
    if (typeof cA.contact_frequency_expect === 'number' && typeof cB.contact_frequency_self === 'number') {
      const deltaAtoB = Math.abs(cA.contact_frequency_expect - cB.contact_frequency_self);
      scoreAtoB = Math.max(0.1, scoreAtoB - 0.2 * deltaAtoB);
    }
    if (typeof cB.contact_frequency_expect === 'number' && typeof cA.contact_frequency_self === 'number') {
      const deltaBtoA = Math.abs(cB.contact_frequency_expect - cA.contact_frequency_self);
      scoreBtoA = Math.max(0.1, scoreBtoA - 0.2 * deltaBtoA);
    }
  }

  // Intent depth fit
  const iA = vecA.intent;
  const iB = vecB.intent;
  if (iA && iB && typeof iA.depth === 'number' && typeof iB.depth === 'number') {
    const depthDelta = Math.abs(iA.depth - iB.depth);
    if (iA.depth > iB.depth) {
      scoreAtoB = Math.max(0.1, scoreAtoB - 0.15 * depthDelta);
    } else if (iB.depth > iA.depth) {
      scoreBtoA = Math.max(0.1, scoreBtoA - 0.15 * depthDelta);
    }
  }

  const imbalance = Math.abs(scoreAtoB - scoreBtoA);
  const minFit = Math.min(scoreAtoB, scoreBtoA);
  const penalizedResonance = Math.max(0, minFit * (1.0 - 0.2 * imbalance));

  return {
    fitAtoB: Math.round(scoreAtoB * 1000) / 1000,
    fitBtoA: Math.round(scoreBtoA * 1000) / 1000,
    imbalance: Math.round(imbalance * 1000) / 1000,
    penalizedResonance: Math.round(penalizedResonance * 1000) / 1000,
  };
}
