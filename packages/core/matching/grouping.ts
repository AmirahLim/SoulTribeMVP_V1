import type { ProfileVector, MatchContext } from '../domain/types.ts';
import { score } from './engine.ts';
import { calculateGroupCohesion } from './cohesion.ts';

export interface GroupFormationOptions {
  size?: number;              // default 6 (hard max 6)
  mustInclude?: string[];     // profile ids that must be in the group
  context?: MatchContext;     // passed through to score()
  restarts?: number;          // default 5 multi-start attempts
  maxSwapPasses?: number;     // default 20 local-search passes
  requireTimeFeasible?: boolean; // default true
}

export interface FormedGroup {
  members: ProfileVector[];
  cohesion: number;        // authoritative value from calculateGroupCohesion()
  minPairwise: number;
  meanPairwise: number;
  warnings: string[];      // from calculateGroupCohesion()
  timeFeasible: boolean;
}

export function buildPairwiseMatrix(
  pool: ProfileVector[],
  context?: MatchContext
): { resonance: number[][]; gated: boolean[][]; index: Map<string, number> } {
  // Deduplicate by profile.id
  const uniquePool: ProfileVector[] = [];
  const seen = new Set<string>();
  for (const p of pool) {
    if (p.profile && p.profile.id && !seen.has(p.profile.id)) {
      seen.add(p.profile.id);
      uniquePool.push(p);
    }
  }

  const n = uniquePool.length;
  const index = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    index.set(uniquePool[i].profile.id, i);
  }

  const resonance: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const gated: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));

  for (let i = 0; i < n; i++) {
    resonance[i][i] = 1.0;
    gated[i][i] = false;
    for (let j = i + 1; j < n; j++) {
      const res = score(uniquePool[i], uniquePool[j], context);
      const resVal = res.resonance ?? 0;
      resonance[i][j] = resVal;
      resonance[j][i] = resVal;
      gated[i][j] = res.gated;
      gated[j][i] = res.gated;
    }
  }

  return { resonance, gated, index };
}

function checkTimeFeasibility(members: ProfileVector[]): boolean {
  if (members.length === 0) return true;
  
  let sharedSlots = new Set(members[0].social_rhythm?.availability || []);
  if (members[0].social_rhythm?.fri_night) sharedSlots.add('fri_night');
  if (members[0].social_rhythm?.sat_night) sharedSlots.add('sat_night');

  for (let i = 1; i < members.length; i++) {
    const memberSlots = new Set(members[i].social_rhythm?.availability || []);
    if (members[i].social_rhythm?.fri_night) memberSlots.add('fri_night');
    if (members[i].social_rhythm?.sat_night) memberSlots.add('sat_night');

    const nextShared = new Set<string>();
    for (const slot of sharedSlots) {
      if (memberSlots.has(slot)) nextShared.add(slot);
    }
    sharedSlots = nextShared;
  }

  return sharedSlots.size > 0;
}

export function formBestGroup(
  pool: ProfileVector[],
  options?: GroupFormationOptions
): FormedGroup | null {
  const targetSize = Math.min(6, Math.max(1, options?.size ?? 6));
  const mustIncludeIds = options?.mustInclude || [];
  const restarts = options?.restarts ?? 5;
  const maxSwapPasses = options?.maxSwapPasses ?? 20;
  const requireTimeFeasible = options?.requireTimeFeasible ?? true;

  // Deduplicate pool
  const uniquePool: ProfileVector[] = [];
  const seen = new Set<string>();
  for (const p of pool) {
    if (p.profile && p.profile.id && !seen.has(p.profile.id)) {
      seen.add(p.profile.id);
      uniquePool.push(p);
    }
  }

  if (uniquePool.length < targetSize) {
    return null;
  }

  const { resonance, gated, index } = buildPairwiseMatrix(uniquePool, options?.context);
  const n = uniquePool.length;

  // Validate mustInclude IDs exist in matrix and are not mutually gated
  const mustIncludeIndices: number[] = [];
  for (const id of mustIncludeIds) {
    const idx = index.get(id);
    if (idx === undefined) {
      return null; // Must include member not found in pool
    }
    mustIncludeIndices.push(idx);
  }

  for (let i = 0; i < mustIncludeIndices.length; i++) {
    for (let j = i + 1; j < mustIncludeIndices.length; j++) {
      if (gated[mustIncludeIndices[i]][mustIncludeIndices[j]]) {
        return null; // Must include members are gated against each other
      }
    }
  }

  const mustIncludeSet = new Set(mustIncludeIndices);

  // Helper to calculate objective for a group of indices
  const calcObjective = (group: number[]): number => {
    if (group.length < 2) return 1.0;
    let minR = 1.0;
    let sumR = 0;
    let count = 0;
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const r = resonance[group[i]][group[j]];
        if (r < minR) minR = r;
        sumR += r;
        count++;
      }
    }
    const meanR = count > 0 ? sumR / count : 1.0;
    return 0.5 * minR + 0.5 * meanR;
  };

  // Helper to check if adding idx to group violates any gates
  const canAdd = (group: number[], candidate: number): boolean => {
    for (const member of group) {
      if (gated[candidate][member]) return false;
    }
    return true;
  };

  // Sort candidate seed indices by average ungated resonance
  const seedScores: { idx: number; score: number }[] = [];
  for (let i = 0; i < n; i++) {
    if (mustIncludeSet.has(i)) continue;
    let total = 0;
    let count = 0;
    for (let j = 0; j < n; j++) {
      if (i !== j && !gated[i][j]) {
        total += resonance[i][j];
        count++;
      }
    }
    seedScores.push({ idx: i, score: count > 0 ? total / count : 0 });
  }
  seedScores.sort((a, b) => b.score - a.score);

  const candidateGroups: { indices: number[]; obj: number }[] = [];

  for (let r = 0; r < restarts; r++) {
    const currentGroup: number[] = [...mustIncludeIndices];

    // Seed if mustInclude is empty
    if (currentGroup.length === 0) {
      if (seedScores.length === 0) break;
      const seedIdx = seedScores[r % seedScores.length].idx;
      currentGroup.push(seedIdx);
    } else {
      // If mustInclude non-empty and r > 0, pick a seed to add to mustInclude
      if (r > 0 && seedScores.length > 0) {
        const seedIdx = seedScores[(r - 1) % seedScores.length].idx;
        if (!currentGroup.includes(seedIdx) && canAdd(currentGroup, seedIdx)) {
          currentGroup.push(seedIdx);
        }
      }
    }

    // Greedy expansion
    while (currentGroup.length < targetSize) {
      let bestCandidate = -1;
      let bestObj = -1;

      for (let c = 0; c < n; c++) {
        if (currentGroup.includes(c)) continue;
        if (!canAdd(currentGroup, c)) continue;

        const obj = calcObjective([...currentGroup, c]);
        if (obj > bestObj) {
          bestObj = obj;
          bestCandidate = c;
        }
      }

      if (bestCandidate === -1) break; // Cannot fill group without gating
      currentGroup.push(bestCandidate);
    }

    if (currentGroup.length < targetSize) continue;

    // Swap local search
    for (let pass = 0; pass < maxSwapPasses; pass++) {
      let improved = false;
      const curObj = calcObjective(currentGroup);

      for (let i = 0; i < currentGroup.length; i++) {
        const member = currentGroup[i];
        if (mustIncludeSet.has(member)) continue; // Never swap out mustInclude

        for (let c = 0; c < n; c++) {
          if (currentGroup.includes(c)) continue;

          // Check if replacing currentGroup[i] with c is valid
          const tempGroup = [...currentGroup];
          tempGroup[i] = c;

          let validSwap = true;
          for (let k = 0; k < tempGroup.length; k++) {
            for (let l = k + 1; l < tempGroup.length; l++) {
              if (gated[tempGroup[k]][tempGroup[l]]) {
                validSwap = false;
                break;
              }
            }
            if (!validSwap) break;
          }

          if (!validSwap) continue;

          const newObj = calcObjective(tempGroup);
          if (newObj > curObj + 1e-6) {
            currentGroup[i] = c;
            improved = true;
            break;
          }
        }
        if (improved) break;
      }

      if (!improved) break;
    }

    candidateGroups.push({
      indices: [...currentGroup],
      obj: calcObjective(currentGroup),
    });
  }

  if (candidateGroups.length === 0) return null;

  // Sort candidate groups by objective descending
  candidateGroups.sort((a, b) => b.obj - a.obj);

  for (const candidate of candidateGroups) {
    const members = candidate.indices.map((i) => uniquePool[i]);
    const cohesionResult = calculateGroupCohesion(members);
    const timeFeasible = checkTimeFeasibility(members);

    if (requireTimeFeasible && !timeFeasible) {
      continue;
    }

    return {
      members,
      cohesion: cohesionResult.cohesion,
      minPairwise: cohesionResult.minPairwiseResonance,
      meanPairwise: cohesionResult.meanPairwiseResonance,
      warnings: cohesionResult.warnings,
      timeFeasible,
    };
  }

  // If requireTimeFeasible was true but no feasible group found, fall back to best infeasible if allowed or return null
  if (requireTimeFeasible) {
    // Optionally retry best candidate if fallback is desired, but specification states:
    // "If requireTimeFeasible is true and the group is not feasible, try the next-best group from the restarts before giving up. Return null if no valid group of size can be formed."
    return null;
  }

  return null;
}

export function formGroups(
  pool: ProfileVector[],
  options?: GroupFormationOptions
): FormedGroup[] {
  const result: FormedGroup[] = [];
  let remainingPool = [...pool];
  const targetSize = Math.min(6, Math.max(1, options?.size ?? 6));

  while (remainingPool.length >= targetSize) {
    const group = formBestGroup(remainingPool, options);
    if (!group) break;

    result.push(group);
    const memberIds = new Set(group.members.map((m) => m.profile.id));
    remainingPool = remainingPool.filter((p) => !memberIds.has(p.profile.id));
  }

  return result;
}
