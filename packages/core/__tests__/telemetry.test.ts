import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import type { ProfileVector, MatchResult } from '../domain/types.ts';
import {
  buildMatchSurfacedEvent,
  buildRhythmCheckEvent,
  toOutcomeSamples,
} from '../telemetry/events.ts';
import {
  MemorySink,
  setTelemetrySink,
  recordEvent,
} from '../telemetry/sink.ts';
import { ENGINE_VERSION, WEIGHTS_VERSION } from '../telemetry/version.ts';

function createMockVector(id: string, name: string): ProfileVector {
  return {
    profile: {
      id,
      handle: name.toLowerCase(),
      display_name: name,
      bio: 'Secret bio text',
      avatar_url: 'https://example.com/avatar.jpg',
      home_area: 'Singapore',
      birth_year: 1995,
      age_pref_min: 18,
      age_pref_max: 99,
      profile_version: 2,
      confidence: 0.85,
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

describe('Module 4 — Telemetry & Interaction Logging', () => {
  let memorySink: MemorySink;

  beforeEach(() => {
    memorySink = new MemorySink();
    setTelemetrySink(memorySink);
  });

  it('1. buildMatchSurfacedEvent captures contributions, versions, and scores', () => {
    const actor = createMockVector('user_a', 'Alice');
    const subject = createMockVector('user_b', 'Bob');
    const matchResult: MatchResult = {
      resonance: 0.82,
      logistics: 0.78,
      rank_score: 0.804,
      gated: false,
      gate_reasons: [],
      contributions: { personality: 0.8, communication: 0.9 },
      confidence_a: 0.85,
      confidence_b: 0.85,
    };

    const event = buildMatchSurfacedEvent(actor, subject, matchResult, 1);
    assert.strictEqual(event.event_type, 'match_surfaced');
    assert.strictEqual(event.actor_id, 'user_a');
    assert.strictEqual(event.subject_id, 'user_b');
    assert.strictEqual(event.position, 1);
    assert.strictEqual(event.rank_score, 0.804);
    assert.strictEqual(event.engine_version, ENGINE_VERSION);
    assert.strictEqual(event.weights_version, WEIGHTS_VERSION);
    assert.strictEqual(event.contributions.personality, 0.8);
  });

  it('2. Built events contain NO PII or free-text fields', () => {
    const actor = createMockVector('user_a', 'Alice');
    const subject = createMockVector('user_b', 'Bob');
    const matchResult: MatchResult = {
      resonance: 0.8,
      logistics: 0.8,
      rank_score: 0.8,
      gated: false,
      gate_reasons: [],
      contributions: { personality: 0.8 },
      confidence_a: 0.8,
      confidence_b: 0.8,
    };

    const event = buildMatchSurfacedEvent(actor, subject, matchResult, 1);
    const jsonStr = JSON.stringify(event);

    assert.strictEqual(jsonStr.includes('Secret bio text'), false);
    assert.strictEqual(jsonStr.includes('Alice'), false);
    assert.strictEqual(jsonStr.includes('Bob'), false);
    assert.strictEqual(jsonStr.includes('avatar.jpg'), false);
  });

  it('3. MemorySink records events in order and throwing sink does not propagate error', () => {
    const actor = createMockVector('user_a', 'Alice');
    const subject = createMockVector('user_b', 'Bob');
    const matchResult: MatchResult = {
      resonance: 0.8,
      logistics: 0.8,
      rank_score: 0.8,
      gated: false,
      gate_reasons: [],
      contributions: {},
      confidence_a: 0.8,
      confidence_b: 0.8,
    };

    const event = buildMatchSurfacedEvent(actor, subject, matchResult, 1);
    recordEvent(event);

    assert.strictEqual(memorySink.events.length, 1);

    // Test throwing sink
    const throwingSink = {
      record: () => {
        throw new Error('Database connection failed');
      },
    };
    setTelemetrySink(throwingSink);

    assert.doesNotThrow(() => {
      recordEvent(event);
    });
  });

  it('4. toOutcomeSamples joins surfaced event to rhythm check label and drops unlabelled events', () => {
    const actor = createMockVector('user_a', 'Alice');
    const subject = createMockVector('user_b', 'Bob');
    const matchResult: MatchResult = {
      resonance: 0.8,
      logistics: 0.8,
      rank_score: 0.8,
      gated: false,
      gate_reasons: [],
      contributions: { personality: 0.85, intent: 0.9 },
      confidence_a: 0.8,
      confidence_b: 0.8,
    };

    const surfacedEvent = buildMatchSurfacedEvent(actor, subject, matchResult, 1);
    const rhythmEvent = buildRhythmCheckEvent('user_a', 'user_b', 'outing_101', 5);

    const samples = toOutcomeSamples([surfacedEvent, rhythmEvent]);
    assert.strictEqual(samples.length, 1);
    assert.strictEqual(samples[0].userA, 'user_a');
    assert.strictEqual(samples[0].userB, 'user_b');
    assert.strictEqual(samples[0].outcome, 1.0); // 5 mapped to 1.0
    assert.strictEqual(samples[0].dims.personality, 0.85);
  });

  it('5. Events for matches shown but never acted on are retained in log', () => {
    const actor = createMockVector('user_a', 'Alice');
    const subject = createMockVector('user_b', 'Bob');
    const matchResult: MatchResult = {
      resonance: 0.8,
      logistics: 0.8,
      rank_score: 0.8,
      gated: false,
      gate_reasons: [],
      contributions: { personality: 0.8 },
      confidence_a: 0.8,
      confidence_b: 0.8,
    };

    const surfacedEvent = buildMatchSurfacedEvent(actor, subject, matchResult, 1);
    recordEvent(surfacedEvent);

    assert.strictEqual(memorySink.events.length, 1);
    const samples = toOutcomeSamples(memorySink.events);
    assert.strictEqual(samples.length, 0); // Not joined because no rhythm check label, but event is retained in sink
  });
});
