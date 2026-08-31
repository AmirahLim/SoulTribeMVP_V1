import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { MatchResult, ProfileVector } from '../../domain/types.ts';
import {
  shrinkToPrior,
  softGate,
  explorationBoost,
  nextBestQuestions,
  confidenceFromCompleteness,
} from '../coldstart.ts';

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
    personality: { user_id: id, openness: 0.8, conscientiousness: 0.7, extraversion: 0.6, agreeableness: 0.8, emotional_stability: 0.7, serious_playful: 0.5, intensity_easygoing: 0.5, assertive_accommodating: 0.5, novelty_seeking: 0.6, intellectual_curiosity: 0.7, answered: 0 },
    communication: { user_id: id, contact_frequency_self: 0.5, contact_frequency_expect: 0.5, response_speed_self: 0.5, response_speed_expect: 0.5, initiation_self: 0.5, initiation_expect: 0.5, message_length: 0.5, direct_diplomatic: 0.5, high_context_literal: 0.5, mediums: ['text'], conv_styles: ['deep'], answered: 0 },
    social_rhythm: { user_id: id, availability: ['sat_midday'], fri_night: true, sat_night: true, planning_horizon: 0.5, social_freq_self: 0.5, social_freq_expect: 0.5, preferred_duration: 120, energy_peak: 0.5, answered: 0 },
    intent: { user_id: id, intents: ['friendship'], depth: 3, open_to_hosting: false, answered: 0 },
    emotional: { user_id: id, er_opening_pace: 0.5, er_cadence_need: 0.5, er_cadence_expect: 0.5, er_reassurance_need: 0.5, er_reassurance_offer: 0.5, er_recovery_time: 0.5, er_conflict_approach: 0.5, expressiveness: 0.5, vulnerability_comfort: 0.5, affection: 0.5, advice_vs_listening_self: 0.5, advice_vs_listening_expect: 0.5, reliability_self: 0.8, reliability_expect: 0.8, boundary_clarity: 0.5, answered: 0 },
    values: [],
    interests: [],
    lifestyle: { user_id: id, budget_band: 2, alcohol: 'occasional', smoking: 'none', activity_level: 0.5, travel_frequency: 0.5, life_stage: 'working', work_schedule: [], food_prefs: [], pets: [], accessibility_needs: [], dealbreakers: [], answered: 0 },
    experience: { user_id: id, settings: ['cafe'], group_size_pref: 0.5, orientation: ['conversation'], novelty: 0.5, answered: 0 },
    geography: { user_id: id, home_area: 'Singapore', radius_minutes: { coffee: 30 }, answered: 0 },
  };
}

describe('Module 3 — Cold start & exposure fairness', () => {
  it('1. shrinkToPrior shrinks raw score toward prior based on confidence', () => {
    const raw = 0.9;
    const prior = 0.5;

    const atHighConf = shrinkToPrior(raw, 1.0, { prior, priorStrength: 0.5 });
    const atLowConf = shrinkToPrior(raw, 0.05, { prior, priorStrength: 0.5 });
    const atMidConf = shrinkToPrior(raw, 0.5, { prior, priorStrength: 0.5 });

    assert.ok(Math.abs(atHighConf - 0.766) < 0.01, 'High confidence shrinkage');
    assert.ok(Math.abs(atLowConf - 0.536) < 0.01, 'Low confidence shrinkage');
    assert.ok(atLowConf < atMidConf && atMidConf < atHighConf, 'Monotonicity check');
  });

  it('2. A result gated for a block stays eligible: false even with high confidence', () => {
    const matchResult: MatchResult = {
      resonance: 0.85,
      logistics: 0.8,
      rank_score: 0,
      gated: true,
      gate_reasons: ['BLOCKED_OR_REPORTED'],
      contributions: {},
      confidence_a: 0.9,
      confidence_b: 0.9,
    };

    const res = softGate(matchResult);
    assert.strictEqual(res.eligible, false);
    assert.strictEqual(res.provisional, false);
  });

  it('3. A result gated for age preference stays eligible: false', () => {
    const matchResult: MatchResult = {
      resonance: 0.85,
      logistics: 0.8,
      rank_score: 0,
      gated: true,
      gate_reasons: ['AGE_PREFERENCE_MISMATCH'],
      contributions: {},
      confidence_a: 0.9,
      confidence_b: 0.9,
    };

    const res = softGate(matchResult);
    assert.strictEqual(res.eligible, false);
  });

  it('4. A result gated ONLY for low confidence returns eligible: true, provisional: true', () => {
    const matchResult: MatchResult = {
      resonance: 0.8,
      logistics: 0.7,
      rank_score: 0,
      gated: true,
      gate_reasons: ['CONFIDENCE_TOO_LOW'],
      contributions: {},
      confidence_a: 0.45,
      confidence_b: 0.45,
    };

    const res = softGate(matchResult);
    assert.strictEqual(res.eligible, true);
    assert.strictEqual(res.provisional, true);
    assert.ok(res.adjustedScore > 0);
  });

  it('5. Both users below provisionalFloor -> eligible: false', () => {
    const matchResult: MatchResult = {
      resonance: 0.8,
      logistics: 0.7,
      rank_score: 0,
      gated: true,
      gate_reasons: ['CONFIDENCE_TOO_LOW'],
      contributions: {},
      confidence_a: 0.15,
      confidence_b: 0.15,
    };

    const res = softGate(matchResult, { provisionalFloor: 0.30 });
    assert.strictEqual(res.eligible, false);
  });

  it('6. explorationBoost decreases as timesSurfaced rises and never exceeds explorationBonus', () => {
    const bonus = 0.05;
    const b0 = explorationBoost(0, { explorationBonus: bonus });
    const b5 = explorationBoost(5, { explorationBonus: bonus });
    const b10 = explorationBoost(10, { explorationBonus: bonus });

    assert.ok(Math.abs(b0 - bonus) < 1e-4);
    assert.ok(b5 < b0);
    assert.ok(b10 < b5);
  });

  it('7. nextBestQuestions returns the heaviest under-answered dimension first', () => {
    const vec = createMockVector('1', 'Alice');
    // Personality answered 10/10 (100% complete)
    vec.personality.answered = 10;
    // Communication answered 0/10 (0% complete, baseline weight 15)
    vec.communication.answered = 0;
    // Intent answered 0/3 (0% complete, baseline weight 15)
    vec.intent.answered = 0;

    const questions = nextBestQuestions(vec, 3);
    assert.ok(questions.includes('communication'));
    assert.ok(questions.includes('intent'));
    assert.strictEqual(questions.includes('personality'), false);
  });

  it('8. Unknown or unrecognised gate reasons fail closed (eligible: false)', () => {
    const matchResult: MatchResult = {
      resonance: 0.8,
      logistics: 0.7,
      rank_score: 0,
      gated: true,
      gate_reasons: ['UNKNOWN_CUSTOM_REASON'],
      contributions: {},
      confidence_a: 0.9,
      confidence_b: 0.9,
    };

    const res = softGate(matchResult);
    assert.strictEqual(res.eligible, false);
  });
});
