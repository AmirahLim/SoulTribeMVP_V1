import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { ProfileVector } from '../../domain/types.ts';
import { score } from '../engine.ts';
import type { OutcomeSample, DimensionKey } from '../evaluation.ts';
import {
  normalizeOutcome,
  recombine,
  dimensionVector,
  evaluate,
  tuneWeights,
  BASELINE_WEIGHTS,
} from '../evaluation.ts';

function createMockVector(id: string, name: string): ProfileVector {
  return {
    profile: {
      id,
      handle: name.toLowerCase(),
      display_name: name,
      home_area: 'Singapore',
      birth_year: 1995,
      age_pref_min: 18,
      age_pref_max: 99,
      profile_version: 1,
      confidence: 0.8,
      tier: 'free',
      status: 'active',
    },
    personality: { user_id: id, openness: 0.8, conscientiousness: 0.7, extraversion: 0.6, agreeableness: 0.8, emotional_stability: 0.7, serious_playful: 0.5, intensity_easygoing: 0.5, assertive_accommodating: 0.5, novelty_seeking: 0.6, intellectual_curiosity: 0.7, answered: 10 },
    communication: { user_id: id, contact_frequency_self: 0.5, contact_frequency_expect: 0.5, response_speed_self: 0.5, response_speed_expect: 0.5, initiation_self: 0.5, initiation_expect: 0.5, message_length: 0.5, direct_diplomatic: 0.5, high_context_literal: 0.5, mediums: ['text'], conv_styles: ['deep'], answered: 10 },
    social_rhythm: { user_id: id, availability: ['sat_midday'], fri_night: true, sat_night: true, planning_horizon: 0.5, social_freq_self: 0.5, social_freq_expect: 0.5, preferred_duration: 120, energy_peak: 0.5, answered: 5 },
    intent: { user_id: id, intents: ['friendship'], depth: 3, open_to_hosting: false, answered: 3 },
    emotional: { user_id: id, er_opening_pace: 0.5, er_cadence_need: 0.5, er_cadence_expect: 0.5, er_reassurance_need: 0.5, er_reassurance_offer: 0.5, er_recovery_time: 0.5, er_conflict_approach: 0.5, expressiveness: 0.5, vulnerability_comfort: 0.5, affection: 0.5, advice_vs_listening_self: 0.5, advice_vs_listening_expect: 0.5, reliability_self: 0.8, reliability_expect: 0.8, boundary_clarity: 0.5, answered: 10 },
    values: [],
    interests: [],
    lifestyle: { user_id: id, budget_band: 2, alcohol: 'occasional', smoking: 'none', activity_level: 0.5, travel_frequency: 0.5, life_stage: 'working', work_schedule: [], food_prefs: [], pets: [], accessibility_needs: [], dealbreakers: [], answered: 5 },
    experience: { user_id: id, settings: ['cafe'], group_size_pref: 0.5, orientation: ['conversation'], novelty: 0.5, answered: 5 },
    geography: { user_id: id, home_area: 'Singapore', radius_minutes: { coffee: 30 }, answered: 2 },
  };
}

describe('Module 2 — Evaluation & weight tuning', () => {
  it('1. normalizeOutcome maps 1..5 to 0..1', () => {
    assert.strictEqual(normalizeOutcome(1), 0);
    assert.strictEqual(normalizeOutcome(5), 1);
    assert.strictEqual(normalizeOutcome(3), 0.5);
  });

  it('2. recombine with baseline weights reproduces score() resonance and rank_score within tolerance', () => {
    const vecA = createMockVector('1', 'Alice');
    const vecB = createMockVector('2', 'Bob');

    const realScore = score(vecA, vecB);
    const dims = dimensionVector(vecA, vecB);
    const recombined = recombine(dims, BASELINE_WEIGHTS);

    assert.ok(Math.abs(realScore.resonance - recombined.resonance) < 0.02, 'Resonance mismatch');
    assert.ok(Math.abs(realScore.rank_score - recombined.rank) < 0.02, 'Rank score mismatch');
  });

  it('3. Pearson and Spearman return 1.0 for perfectly correlated data', () => {
    const samples: OutcomeSample[] = Array.from({ length: 60 }, (_, i) => {
      const val = (i + 1) / 60;
      const dims: Record<DimensionKey, number> = {
        personality: val, communication: val, social_rhythm: val, intent: val,
        emotional: val, interests: val, values: val, lifestyle: val, experience: val, geography: val,
      };
      return { userA: `a_${i}`, userB: `b_${i}`, dims, outcome: val };
    });

    const metrics = evaluate(samples, BASELINE_WEIGHTS);
    assert.ok(metrics.pearson > 0.99, `Expected Pearson ~1.0, got ${metrics.pearson}`);
    assert.ok(metrics.spearman > 0.99, `Expected Spearman ~1.0, got ${metrics.spearman}`);
  });

  it('4. tuneWeights on dimension-dominated outcome shifts weight toward that dimension', () => {
    // Generate samples where outcome is strictly determined by personality, with random noise in other dims
    let seed = 123;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const samples: OutcomeSample[] = Array.from({ length: 100 }, (_, i) => {
      const pVal = (i + 1) / 100;
      const dims: Record<DimensionKey, number> = {
        personality: pVal,
        communication: rng(),
        social_rhythm: rng(),
        intent: rng(),
        emotional: rng(),
        interests: rng(),
        values: rng(),
        lifestyle: rng(),
        experience: rng(),
        geography: rng(),
      };
      return { userA: `a_${i}`, userB: `b_${i}`, dims, outcome: pVal };
    });

    const tuning = tuneWeights(samples, BASELINE_WEIGHTS, { iterations: 30, seed: 42, stepSizes: [15, 10, 5] });
    assert.ok(tuning.weights.personality > BASELINE_WEIGHTS.personality, `Personality weight (${tuning.weights.personality}) should be > baseline (${BASELINE_WEIGHTS.personality})`);
  });

  it('5. Weights always sum to ~100 after tuning', () => {
    const samples: OutcomeSample[] = Array.from({ length: 60 }, (_, i) => ({
      userA: `a_${i}`,
      userB: `b_${i}`,
      dims: { personality: 0.5, communication: 0.5, social_rhythm: 0.5, intent: 0.5, emotional: 0.5, interests: 0.5, values: 0.5, lifestyle: 0.5, experience: 0.5, geography: 0.5 },
      outcome: 0.5,
    }));

    const tuning = tuneWeights(samples, BASELINE_WEIGHTS);
    const sum = Object.values(tuning.weights).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 100) < 0.01, `Expected weight sum ~100, got ${sum}`);
  });

  it('6. samples.length < 50 sets improved = false and includes warning', () => {
    const smallSamples: OutcomeSample[] = Array.from({ length: 20 }, (_, i) => ({
      userA: `a_${i}`,
      userB: `b_${i}`,
      dims: { personality: 0.8, communication: 0.8, social_rhythm: 0.8, intent: 0.8, emotional: 0.8, interests: 0.8, values: 0.8, lifestyle: 0.8, experience: 0.8, geography: 0.8 },
      outcome: 0.8,
    }));

    const tuning = tuneWeights(smallSamples, BASELINE_WEIGHTS);
    assert.strictEqual(tuning.improved, false);
    assert.ok(tuning.warning !== undefined);
  });
});
