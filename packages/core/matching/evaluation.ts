import type { ProfileVector, MatchContext } from '../domain/types.ts';
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
} from './dimensions.ts';

export type DimensionKey =
  | 'personality'
  | 'communication'
  | 'social_rhythm'
  | 'intent'
  | 'emotional'
  | 'interests'
  | 'values'
  | 'lifestyle'
  | 'experience'
  | 'geography';

export type WeightVector = Record<DimensionKey, number>;

export const RESONANCE_DIMS: DimensionKey[] = [
  'personality',
  'communication',
  'intent',
  'emotional',
  'interests',
  'values',
];

export const LOGISTICS_DIMS: DimensionKey[] = [
  'social_rhythm',
  'lifestyle',
  'experience',
  'geography',
];

export const BASELINE_WEIGHTS: WeightVector = {
  personality: 15,
  communication: 15,
  intent: 15,
  emotional: 10,
  interests: 10,
  values: 8,
  social_rhythm: 15,
  lifestyle: 7,
  experience: 3,
  geography: 2,
};

export function dimensionVector(
  vecA: ProfileVector,
  vecB: ProfileVector,
  _context?: MatchContext
): Record<DimensionKey, number> {
  return {
    personality: scorePersonality(vecA, vecB),
    communication: scoreCommunication(vecA, vecB),
    social_rhythm: scoreSocialRhythm(vecA, vecB),
    intent: scoreIntent(vecA, vecB),
    emotional: scoreEmotional(vecA, vecB),
    interests: scoreInterests(vecA, vecB),
    values: scoreValues(vecA, vecB),
    lifestyle: scoreLifestyle(vecA, vecB),
    experience: scoreExperience(vecA, vecB),
    geography: scoreGeography(vecA, vecB),
  };
}

export function recombine(
  dims: Record<DimensionKey, number>,
  weights: WeightVector
): { resonance: number; logistics: number; rank: number } {
  let resSum = 0;
  let resWeightTotal = 0;
  for (const d of RESONANCE_DIMS) {
    const w = weights[d] ?? 0;
    resSum += (dims[d] ?? 0) * w;
    resWeightTotal += w;
  }
  const resonance = resWeightTotal > 0 ? resSum / resWeightTotal : 0;

  let logSum = 0;
  let logWeightTotal = 0;
  for (const d of LOGISTICS_DIMS) {
    const w = weights[d] ?? 0;
    logSum += (dims[d] ?? 0) * w;
    logWeightTotal += w;
  }
  const logistics = logWeightTotal > 0 ? logSum / logWeightTotal : 0;

  const rank = Math.pow(resonance, 0.6) * Math.pow(logistics, 0.4);
  return { resonance, logistics, rank };
}

export interface OutcomeSample {
  userA: string;
  userB: string;
  dims: Record<DimensionKey, number>;
  outcome: number; // 0..1
}

export function normalizeOutcome(wouldMeetAgain: number): number {
  return Math.max(0, Math.min(1, (wouldMeetAgain - 1) / 4));
}

export interface EvaluationMetrics {
  n: number;
  pearson: number;
  spearman: number;
  auc: number;
  precisionAtK: number;
  ndcg: number;
}

function computePearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  return den > 1e-9 ? num / den : 0;
}

function computeRanks(arr: number[]): number[] {
  const sorted = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const ranks = new Array(arr.length);
  for (let r = 0; r < sorted.length; r++) {
    ranks[sorted[r].i] = r + 1;
  }
  return ranks;
}

function computeSpearman(x: number[], y: number[]): number {
  if (x.length < 2) return 0;
  const rx = computeRanks(x);
  const ry = computeRanks(y);
  return computePearson(rx, ry);
}

function computeAUC(predictions: number[], binaryLabels: boolean[]): number {
  const n = predictions.length;
  if (n === 0) return 0.5;

  let posCount = 0;
  let negCount = 0;
  for (const b of binaryLabels) {
    if (b) posCount++;
    else negCount++;
  }

  if (posCount === 0 || negCount === 0) return 0.5;

  const items = predictions.map((p, i) => ({ p, label: binaryLabels[i] }));
  items.sort((a, b) => b.p - a.p);

  let numConcordant = 0;
  let numTies = 0;

  for (let i = 0; i < n; i++) {
    if (items[i].label) {
      for (let j = 0; j < n; j++) {
        if (!items[j].label) {
          if (items[i].p > items[j].p) {
            numConcordant++;
          } else if (items[i].p === items[j].p) {
            numTies++;
          }
        }
      }
    }
  }

  return (numConcordant + 0.5 * numTies) / (posCount * negCount);
}

function computeNDCG(predictions: number[], outcomes: number[], k: number): number {
  const n = predictions.length;
  if (n === 0) return 0;

  const actualK = Math.min(k, n);
  const items = predictions.map((p, i) => ({ p, rel: outcomes[i] }));
  items.sort((a, b) => b.p - a.p);

  let dcg = 0;
  for (let i = 0; i < actualK; i++) {
    dcg += (Math.pow(2, items[i].rel) - 1) / Math.log2(i + 2);
  }

  const idealItems = [...outcomes].sort((a, b) => b - a);
  let idcg = 0;
  for (let i = 0; i < actualK; i++) {
    idcg += (Math.pow(2, idealItems[i]) - 1) / Math.log2(i + 2);
  }

  return idcg > 0 ? dcg / idcg : 0;
}

export function evaluate(
  samples: OutcomeSample[],
  weights: WeightVector,
  k: number = 10
): EvaluationMetrics {
  const n = samples.length;
  if (n === 0) {
    return { n: 0, pearson: 0, spearman: 0, auc: 0.5, precisionAtK: 0, ndcg: 0 };
  }

  const predictions: number[] = [];
  const outcomes: number[] = [];
  const binaryLabels: boolean[] = [];

  for (const s of samples) {
    const rec = recombine(s.dims, weights);
    predictions.push(rec.rank);
    outcomes.push(s.outcome);
    binaryLabels.push(s.outcome >= 0.5);
  }

  const pearson = computePearson(predictions, outcomes);
  const spearman = computeSpearman(predictions, outcomes);
  const auc = computeAUC(predictions, binaryLabels);

  const actualK = Math.min(k, n);
  const rankedIndices = predictions
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p - a.p)
    .slice(0, actualK);

  let relevantCount = 0;
  for (const item of rankedIndices) {
    if (binaryLabels[item.i]) relevantCount++;
  }
  const precisionAtK = actualK > 0 ? relevantCount / actualK : 0;

  const ndcg = computeNDCG(predictions, outcomes, k);

  return { n, pearson, spearman, auc, precisionAtK, ndcg };
}

export interface TuningResult {
  weights: WeightVector;
  trainMetrics: EvaluationMetrics;
  testMetrics: EvaluationMetrics;
  baselineMetrics: EvaluationMetrics;
  improved: boolean;
  warning?: string;
}

// Simple LCG pseudo-random generator for deterministic train/test split
function createRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function normalizeWeightsTo100(weights: WeightVector): WeightVector {
  const copy = { ...weights };
  const total = Object.values(copy).reduce((a, b) => a + b, 0);
  if (total <= 0) return { ...BASELINE_WEIGHTS };

  const keys = Object.keys(copy) as DimensionKey[];
  const normalized: WeightVector = { ...copy };
  for (const k of keys) {
    normalized[k] = (copy[k] / total) * 100;
  }
  return normalized;
}

export function tuneWeights(
  samples: OutcomeSample[],
  baseline: WeightVector = BASELINE_WEIGHTS,
  options?: { iterations?: number; testFraction?: number; seed?: number; stepSizes?: number[] }
): TuningResult {
  const iterations = options?.iterations ?? 50;
  const testFraction = options?.testFraction ?? 0.3;
  const seed = options?.seed ?? 42;
  const stepSizes = options?.stepSizes ?? [8, 4, 2, 1];

  const rng = createRandom(seed);

  // Train / Test split
  const trainSamples: OutcomeSample[] = [];
  const testSamples: OutcomeSample[] = [];

  for (const s of samples) {
    if (rng() < testFraction) {
      testSamples.push(s);
    } else {
      trainSamples.push(s);
    }
  }

  // Ensure non-empty sets if samples exist
  if (samples.length > 0 && trainSamples.length === 0) {
    trainSamples.push(samples[0]);
  }

  const baselineMetrics = evaluate(testSamples.length > 0 ? testSamples : samples, baseline);
  const isSmallSample = samples.length < 50;

  let currentWeights = normalizeWeightsTo100(baseline);
  let bestTrainScore = evaluate(trainSamples, currentWeights).spearman;

  const dimensions: DimensionKey[] = [
    ...RESONANCE_DIMS,
    ...LOGISTICS_DIMS,
  ];

  for (let iter = 0; iter < iterations; iter++) {
    let improvedInPass = false;

    for (const step of stepSizes) {
      for (const dim of dimensions) {
        for (const dir of [1, -1]) {
          const candidateWeights = { ...currentWeights };
          candidateWeights[dim] = Math.max(0.1, candidateWeights[dim] + dir * step);

          const normalizedCandidate = normalizeWeightsTo100(candidateWeights);
          const score = evaluate(trainSamples, normalizedCandidate).spearman;

          if (score > bestTrainScore + 1e-4) {
            bestTrainScore = score;
            currentWeights = normalizedCandidate;
            improvedInPass = true;
          }
        }
      }
    }

    if (!improvedInPass) break;
  }

  const trainMetrics = evaluate(trainSamples, currentWeights);
  const testMetrics = evaluate(testSamples.length > 0 ? testSamples : samples, currentWeights);

  const improved = !isSmallSample && testMetrics.spearman > baselineMetrics.spearman;

  return {
    weights: currentWeights,
    trainMetrics,
    testMetrics,
    baselineMetrics,
    improved,
    warning: isSmallSample ? 'Sample size is less than 50. Results may not be statistically significant.' : undefined,
  };
}
