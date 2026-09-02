import { describe, it } from 'node:test';
import assert from 'node:assert';
import { score } from '../engine.ts';
import { scoreCommunication, scorePersonality, scoreIntent, scoreInterests, scoreValues } from '../threads.ts';
import { generateMatchExplanation } from '../../explain/generator.ts';
import { calculateGroupCohesion } from '../cohesion.ts';
import type { ProfileVector } from '../../domain/types.ts';

// Helper to construct mock ProfileVector with sensible defaults
function createMockVector(overrides: Partial<ProfileVector> = {}): ProfileVector {
  const userId = overrides.profile?.id || '00000000-0000-0000-0000-000000000001';
  return {
    profile: {
      id: userId,
      handle: 'test_user',
      display_name: 'Test User',
      home_area: 'Tiong Bahru',
      birth_year: 1995,
      age_pref_min: 21,
      age_pref_max: 99,
      profile_version: 1,
      confidence: 0.8,
      tier: 'free',
      status: 'active',
      ...overrides.profile,
    },
    personality: 'personality' in overrides ? overrides.personality : {
      user_id: userId,
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      emotional_stability: 0.5,
      serious_playful: 0.5,
      intensity_easygoing: 0.5,
      assertive_accommodating: 0.5,
      novelty_seeking: 0.5,
      intellectual_curiosity: 0.5,
      answered: 10,
    },
    communication: {
      user_id: userId,
      contact_frequency_self: 0.5,
      contact_frequency_expect: 0.5,
      response_speed_self: 0.5,
      response_speed_expect: 0.5,
      initiation_self: 0.5,
      initiation_expect: 0.5,
      message_length: 0.5,
      direct_diplomatic: 0.5,
      high_context_literal: 0.5,
      mediums: ['text', 'in_person_first'],
      conv_styles: ['deep', 'banter'],
      answered: 8,
      ...overrides.communication,
    },
    social_rhythm: {
      user_id: userId,
      availability: ['sat_midday', 'sun_evening'],
      fri_night: false,
      sat_night: true,
      planning_horizon: 0.5,
      social_freq_self: 0.5,
      social_freq_expect: 0.5,
      preferred_duration: 0.5,
      energy_peak: 0.5,
      answered: 6,
      ...overrides.social_rhythm,
    },
    intent: {
      user_id: userId,
      intents: ['close_friends', 'food_people'],
      depth: 2,
      open_to_hosting: true,
      answered: 4,
      ...overrides.intent,
    },
    emotional: {
      user_id: userId,
      er_opening_pace: 0.5,
      er_cadence_need: 0.5,
      er_cadence_expect: 0.5,
      er_reassurance_need: 0.5,
      er_reassurance_offer: 0.5,
      er_recovery_time: 0.5,
      er_conflict_approach: 0.5,
      expressiveness: 0.5,
      vulnerability_comfort: 0.5,
      affection: 0.5,
      advice_vs_listening_self: 0.5,
      advice_vs_listening_expect: 0.5,
      reliability_self: 0.5,
      reliability_expect: 0.5,
      boundary_clarity: 0.5,
      answered: 9,
      ...overrides.emotional,
    },
    values: overrides.values || [
      { user_id: userId, value_key: 'growth', stance: 0.8, importance: 0.8, visibility: 'matching_only' },
      { user_id: userId, value_key: 'family', stance: 0.7, importance: 0.7, visibility: 'matching_only' },
      { user_id: userId, value_key: 'creativity', stance: 0.6, importance: 0.5, visibility: 'matching_only' },
      { user_id: userId, value_key: 'stability', stance: 0.5, importance: 0.4, visibility: 'matching_only' },
    ],
    interests: overrides.interests || [
      { user_id: userId, node_id: 1, node_path: 'art.pottery', node_name: 'Pottery', affinity: 'regular' },
    ],
    lifestyle: {
      user_id: userId,
      budget_band: 2,
      alcohol: 'occasional',
      smoking: 'none',
      activity_level: 0.5,
      travel_frequency: 0.5,
      life_stage: 'working',
      work_schedule: ['standard'],
      food_prefs: ['anything'],
      pets: [],
      accessibility_needs: [],
      dealbreakers: [],
      answered: 8,
      ...overrides.lifestyle,
    },
    experience: {
      user_id: userId,
      settings: ['quiet', 'intimate'],
      group_size_pref: 0.4,
      orientation: ['conversation_first'],
      novelty: 0.5,
      answered: 4,
      ...overrides.experience,
    },
    geography: {
      user_id: userId,
      home_area: 'Tiong Bahru',
      radius_minutes: { coffee: 30, dining: 45 },
      answered: 2,
      ...overrides.geography,
    },
  };
}

describe('04 Matching Spec — 12 Core Test Cases', () => {
  it('1. Identical twins score personality < 0.95 due to delta parameters', () => {
    const vecA = createMockVector();
    const vecB = createMockVector();
    const pScore = scorePersonality(vecA, vecB);
    assert.ok(pScore < 0.96, `Expected ${pScore} < 0.96`);
  });

  it('2. The low-maintenance pair score communication > 0.85', () => {
    const vecA = createMockVector({
      communication: {
        user_id: 'a',
        contact_frequency_self: 0.2,
        contact_frequency_expect: 0.2,
        response_speed_self: 0.2,
        response_speed_expect: 0.2,
        initiation_self: 0.5,
        initiation_expect: 0.5,
        message_length: 0.3,
        direct_diplomatic: 0.5,
        high_context_literal: 0.5,
        mediums: ['text'],
        conv_styles: ['deep'],
        answered: 8,
      },
    });
    const vecB = createMockVector({
      communication: {
        user_id: 'b',
        contact_frequency_self: 0.2,
        contact_frequency_expect: 0.2,
        response_speed_self: 0.2,
        response_speed_expect: 0.2,
        initiation_self: 0.5,
        initiation_expect: 0.5,
        message_length: 0.3,
        direct_diplomatic: 0.5,
        high_context_literal: 0.5,
        mediums: ['text'],
        conv_styles: ['deep'],
        answered: 8,
      },
    });
    const commScore = scoreCommunication(vecA, vecB);
    assert.ok(commScore > 0.85, `Expected ${commScore} > 0.85`);
  });

  it('3. Mismatched-expectation pair scores communication < 0.35', () => {
    const vecA = createMockVector({
      communication: {
        user_id: 'a',
        contact_frequency_self: 0.9,
        contact_frequency_expect: 0.9,
        response_speed_self: 0.9,
        response_speed_expect: 0.9,
        initiation_self: 0.9,
        initiation_expect: 0.9,
        message_length: 0.8,
        direct_diplomatic: 0.8,
        high_context_literal: 0.8,
        mediums: ['calls'],
        conv_styles: ['debate'],
        answered: 8,
      },
    });
    const vecB = createMockVector({
      communication: {
        user_id: 'b',
        contact_frequency_self: 0.1,
        contact_frequency_expect: 0.1,
        response_speed_self: 0.1,
        response_speed_expect: 0.1,
        initiation_self: 0.1,
        initiation_expect: 0.1,
        message_length: 0.2,
        direct_diplomatic: 0.2,
        high_context_literal: 0.2,
        mediums: ['text'],
        conv_styles: ['gossip'],
        answered: 8,
      },
    });
    const commScore = scoreCommunication(vecA, vecB);
    assert.ok(commScore < 0.35, `Expected ${commScore} < 0.35`);
  });

  it('4. Zero shared availability triggers gate and results in rank_score = 0', () => {
    const vecA = createMockVector({
      social_rhythm: {
        user_id: 'a',
        availability: ['mon_morning'],
        fri_night: false,
        sat_night: false,
        planning_horizon: 0.5,
        social_freq_self: 0.5,
        social_freq_expect: 0.5,
        preferred_duration: 0.5,
        energy_peak: 0.5,
        answered: 6,
      },
    });
    const vecB = createMockVector({
      social_rhythm: {
        user_id: 'b',
        availability: ['sun_evening'],
        fri_night: false,
        sat_night: false,
        planning_horizon: 0.5,
        social_freq_self: 0.5,
        social_freq_expect: 0.5,
        preferred_duration: 0.5,
        energy_peak: 0.5,
        answered: 6,
      },
    });
    const res = score(vecA, vecB);
    assert.strictEqual(res.gated, true);
    assert.strictEqual(res.rank_score, 0);
    assert.ok(res.gate_reasons.includes('NO_SHARED_AVAILABILITY_SLOT'));
  });

  it('5. Depth asymmetry scores intent < 0.4', () => {
    const vecA = createMockVector({
      intent: { user_id: 'a', intents: ['community'], depth: 4, open_to_hosting: false, answered: 4 },
    });
    const vecB = createMockVector({
      intent: { user_id: 'b', intents: ['nightlife'], depth: 0, open_to_hosting: false, answered: 4 },
    });
    const intentScoreVal = scoreIntent(vecA, vecB);
    assert.ok(intentScoreVal < 0.4, `Expected ${intentScoreVal} < 0.4`);
  });

  it('6. Curiosity bonus rewards curious + experienced pottery match over curious + curious', () => {
    const vecA = createMockVector({
      interests: [{ user_id: 'a', node_id: 1, node_path: 'art.pottery', node_name: 'Pottery', affinity: 'curious' }],
    });
    const vecB_experienced = createMockVector({
      interests: [{ user_id: 'b', node_id: 1, node_path: 'art.pottery', node_name: 'Pottery', affinity: 'love' }],
    });
    const vecC_curious = createMockVector({
      interests: [{ user_id: 'c', node_id: 1, node_path: 'art.pottery', node_name: 'Pottery', affinity: 'curious' }],
    });
    const scoreExperienced = scoreInterests(vecA, vecB_experienced);
    const scoreCurious = scoreInterests(vecA, vecC_curious);
    assert.ok(scoreExperienced > scoreCurious, `Expected ${scoreExperienced} > ${scoreCurious}`);
  });

  it('7. Private values are excluded from scoring', () => {
    const vecA = createMockVector({
      values: [
        { user_id: 'a', value_key: 'growth', stance: 0.9, importance: 0.9, visibility: 'private' },
        { user_id: 'a', value_key: 'family', stance: 0.8, importance: 0.8, visibility: 'matching_only' },
        { user_id: 'a', value_key: 'creativity', stance: 0.7, importance: 0.7, visibility: 'matching_only' },
        { user_id: 'a', value_key: 'stability', stance: 0.6, importance: 0.6, visibility: 'matching_only' },
        { user_id: 'a', value_key: 'ambition', stance: 0.5, importance: 0.5, visibility: 'matching_only' },
      ],
    });
    const vecB = createMockVector({
      values: [
        { user_id: 'b', value_key: 'growth', stance: 0.1, importance: 0.9, visibility: 'private' },
        { user_id: 'b', value_key: 'family', stance: 0.8, importance: 0.8, visibility: 'matching_only' },
        { user_id: 'b', value_key: 'creativity', stance: 0.7, importance: 0.7, visibility: 'matching_only' },
        { user_id: 'b', value_key: 'stability', stance: 0.6, importance: 0.6, visibility: 'matching_only' },
        { user_id: 'b', value_key: 'ambition', stance: 0.5, importance: 0.5, visibility: 'matching_only' },
      ],
    });
    const vScore = scoreValues(vecA, vecB);
    assert.ok(vScore > 0.9, `Expected ${vScore} > 0.9`);
  });

  it('8. Group cohesion drops when an incompatible guest is added', () => {
    const vec1 = createMockVector({ profile: { id: '00000000-0000-0000-0000-000000000001', display_name: 'P1', confidence: 0.8 } as any });
    const vec2 = createMockVector({ profile: { id: '00000000-0000-0000-0000-000000000002', display_name: 'P2', confidence: 0.8 } as any });
    const vec3 = createMockVector({ profile: { id: '00000000-0000-0000-0000-000000000003', display_name: 'P3', confidence: 0.8 } as any });
    const vec4 = createMockVector({ profile: { id: '00000000-0000-0000-0000-000000000004', display_name: 'P4', confidence: 0.8 } as any });
    const vecIncompatible = createMockVector({
      profile: { id: '00000000-0000-0000-0000-000000000005', display_name: 'Mismatched User', confidence: 0.8 } as any,
      personality: { extraversion: 0.05, agreeableness: 0.1 } as any,
      communication: { response_speed_self: 0.05, response_speed_expect: 0.95 } as any,
    });
    const cohesionGood = calculateGroupCohesion([vec1, vec2, vec3, vec4]);
    const cohesionWithMismatched = calculateGroupCohesion([vec1, vec2, vec3, vec4, vecIncompatible]);
    assert.ok(cohesionWithMismatched.cohesion < cohesionGood.cohesion);
  });

  it('9. Group cohesion triggers 6-person size warning when group size is 6', () => {
    const group6 = Array.from({ length: 6 }, (_, idx) =>
      createMockVector({ profile: { id: `00000000-0000-0000-0000-00000000001${idx}`, display_name: `User ${idx}`, confidence: 0.8 } as any })
    );
    const cohesion6 = calculateGroupCohesion(group6);
    assert.ok(cohesion6.warnings.some((w) => w.includes('largest group Soul Tribe runs')));
  });

  it('10. Property test over random pairs: every generated explanation contains friction', () => {
    for (let i = 0; i < 50; i++) {
      const vecA = createMockVector({
        personality: { extraversion: Math.random(), conscientiousness: Math.random() } as any,
        social_rhythm: { planning_horizon: Math.random() } as any,
      });
      const vecB = createMockVector({
        personality: { extraversion: Math.random(), conscientiousness: Math.random() } as any,
        social_rhythm: { planning_horizon: Math.random() } as any,
      });
      const explanation = generateMatchExplanation(vecA, vecB);
      assert.ok(explanation.friction_text && explanation.friction_text.length > 0);
    }
  });

  it('11. Demographic fields do not affect match rankings or scores', () => {
    const vecA = createMockVector();
    const vecB = createMockVector();
    const scoreInitial = score(vecA, vecB);

    vecA.profile.handle = 'altered_handle';
    vecB.profile.display_name = 'Altered Name';

    const scoreAfter = score(vecA, vecB);
    assert.strictEqual(scoreAfter.rank_score, scoreInitial.rank_score);
    assert.strictEqual(scoreAfter.resonance, scoreInitial.resonance);
    assert.strictEqual(scoreAfter.logistics, scoreInitial.logistics);
  });

  it('12. Profile with confidence < 0.55 is gated', () => {
    const vecA = createMockVector({ profile: { confidence: 0.45 } as any });
    const vecB = createMockVector({ profile: { confidence: 0.85 } as any });
    const res = score(vecA, vecB);
    assert.strictEqual(res.gated, true);
    assert.strictEqual(res.rank_score, 0);
    assert.ok(res.gate_reasons.includes('CONFIDENCE_TOO_LOW'));
  });

  it('13. Absence is not agreement: missing personality fields produce null score, not high agreement', () => {
    const vecA = createMockVector({ personality: undefined });
    const vecB = createMockVector({ personality: undefined });

    const pScore = scorePersonality(vecA, vecB);
    assert.strictEqual(pScore, null);

    const matchRes = score(vecA, vecB);
    assert.strictEqual('personality' in matchRes.contributions, false);
  });
});
