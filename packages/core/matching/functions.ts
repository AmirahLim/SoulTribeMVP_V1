import type { UserInterest } from '../domain/types.ts';

/**
 * 3.1 gauss(a, b, delta, sigma) - similarity and complementarity unified
 */
export const gauss = (a: number, b: number, delta = 0, sigma = 0.3): number => {
  const absDiff = Math.abs(a - b);
  return Math.exp(-Math.pow(absDiff - delta, 2) / (2 * sigma * sigma));
};

/**
 * 3.2 expectationFit(bA, eB, bB, eA, sigma)
 * Geometric mean of two-sided behavior vs expectation fit
 */
export const expectationFit = (
  bA: number,
  eB: number,
  bB: number,
  eA: number,
  sigma = 0.2
): number => {
  return Math.sqrt(gauss(bA, eB, 0, sigma) * gauss(bB, eA, 0, sigma));
};

/**
 * 3.3 setOverlap(A, B) for multi-select sets
 */
export const setOverlap = (
  A: Set<string> | string[],
  B: Set<string> | string[]
): number => {
  const setA = A instanceof Set ? A : new Set(A);
  const setB = B instanceof Set ? B : new Set(B);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }
  return intersectionCount / Math.min(setA.size, setB.size);
};

/**
 * Node proximity for interest tree (path hierarchy matching)
 * path e.g. 'art.contemporary.installation.teamlab'
 */
export const nodeProximity = (pathA: string, pathB: string): number => {
  if (pathA === pathB) return 1.0;
  const partsA = pathA.split('.');
  const partsB = pathB.split('.');
  
  if (partsA[0] !== partsB[0]) return 0; // Different roots
  
  // Same sibling (shares immediate parent)
  if (partsA.length > 1 && partsB.length > 1 && partsA.slice(0, -1).join('.') === partsB.slice(0, -1).join('.')) {
    return 0.6;
  }
  // Shares grandparent or secondary path
  if (partsA.length > 2 && partsB.length > 2 && partsA[1] === partsB[1]) {
    return 0.35;
  }
  // Shares root
  return 0.15;
};

const affinityNumeric: Record<string, number> = {
  love: 1.0,
  regular: 0.9,
  learning: 0.6,
  curious: 0.5,
};

/**
 * 3.4 graphAffinity(interestsA, interestsB)
 */
export const graphAffinity = (
  interestsA: UserInterest[],
  interestsB: UserInterest[]
): number => {
  if (!interestsA || !interestsB || interestsA.length === 0 || interestsB.length === 0) {
    return 0.5; // neutral baseline when thin
  }

  const pairScores: number[] = [];

  for (const a of interestsA) {
    for (const b of interestsB) {
      const prox = nodeProximity(a.node_path, b.node_path);
      if (prox === 0) continue;

        const affA = affinityNumeric[a.affinity] ?? 0.5;
      const affB = affinityNumeric[b.affinity] ?? 0.5;
      const avgAff = (affA + affB) / 2;

      // Curiosity bonus: 1.15 when one side is curious/learning and other is love/regular on same or sibling node
      let bonus = 1.0;
      const isACurious = a.affinity === 'curious' || a.affinity === 'learning';
      const isBCurious = b.affinity === 'curious' || b.affinity === 'learning';
      const isAExperienced = a.affinity === 'love' || a.affinity === 'regular';
      const isBExperienced = b.affinity === 'love' || b.affinity === 'regular';

      if (prox >= 0.6 && ((isACurious && isBExperienced) || (isBCurious && isAExperienced))) {
        bonus = 1.15;
      }

      pairScores.push(prox * avgAff * bonus);
    }
  }

  if (pairScores.length === 0) return 0;

  // Top 8 pairScores mean, capped at 1.0
  pairScores.sort((x, y) => y - x);
  const top8 = pairScores.slice(0, 8);
  const meanScore = top8.reduce((sum, val) => sum + val, 0) / top8.length;
  return Math.min(1.0, meanScore);
};

/**
 * 3.5 bandGap(a, b, table)
 */
export const bandGap = (
  a: number,
  b: number,
  table = [1.0, 0.85, 0.5, 0.2, 0.1]
): number => {
  const diff = Math.abs(Math.round(a) - Math.round(b));
  return table[Math.min(diff, table.length - 1)];
};

/**
 * Depth score with asymmetric penalty (§4.4)
 * mine vs theirs in 0..4
 */
export const depthScore = (mine: number, theirs: number): number => {
  const gap = mine - theirs; // normalized to 0..1 scale /4
  return gap > 0
    ? gauss(0, gap / 4, 0, 0.22) // I want more than they offer - painful
    : gauss(0, -gap / 4, 0, 0.34); // I want less - mildly awkward, survivable
};
