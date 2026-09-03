/**
 * Self-Profile Synthesizer Tests
 *
 * Test-first per AGENTS.md: these tests define what generateSelfProfile must produce.
 * Uses node:test / node:assert to match the core package's test runner.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateSelfProfile } from '../../explain/selfProfile.ts';
import type { ProfileVector } from '../../domain/types.ts';

function makeFilledVector(): ProfileVector {
  return {
    profile: {
      id: 'test-user-1',
      display_name: 'Test User',
      home_area: 'Singapore',
      confidence: 0.85,
    },
    personality: {
      extraversion: 0.3,
      openness: 0.7,
      conscientiousness: 0.6,
      agreeableness: 0.65,
      serious_playful: 0.4,
      intensity_easygoing: 0.5,
      assertive_accommodating: 0.5,
      novelty_seeking: 0.7,
      emotional_stability: 0.6,
      answered: 5,
    },
    communication: {
      contact_frequency_self: 0.3,
      response_speed_self: 0.3,
      direct_diplomatic: 0.6,
      initiation_self: 0.3,
      message_length: 0.5,
      conv_styles: ['deep'],
      mediums: ['text'],
      high_context_literal: 0.5,
      answered: 4,
    },
    social_rhythm: {
      planning_horizon: 0.8,
      social_freq_self: 0.4,
      availability: [
        'wed_evening', 'fri_evening', 'sat_morning', 'sat_afternoon', 'sun_morning',
      ],
      fri_sat_night: true,
      answered: 3,
    },
    intent: {
      intents: ['close_friends'],
      depth: 3,
      open_to_hosting: true,
      answered: 3,
    },
    emotional: {
      er_opening_pace: 0.3,
      vulnerability_comfort: 0.4,
      cadence_need: 0.3,
      reassurance_need: 0.3,
      recovery_time: 0.5,
      conflict_approach: 0.4,
      advice_listening: 0.7,
      reliability: 0.8,
      answered: 5,
    },
    interests: [
      { node_id: 1, node_path: 'coffee', node_name: 'Specialty Coffee', weight: 0.9 },
      { node_id: 2, node_path: 'ceramics', node_name: 'Ceramics', weight: 0.8 },
      { node_id: 3, node_path: 'film', node_name: 'Analog Film', weight: 0.7 },
    ],
    values: [
      { value_key: 'curiosity', stance: 4, importance: 5, visibility: 'public' },
      { value_key: 'authenticity', stance: 3, importance: 4, visibility: 'public' },
    ],
    lifestyle: {
      budget_band: 2,
      activity_level: 0.5,
      travel_openness: 0.6,
      alcohol: 'social',
      smoking: 'no',
      food_preferences: [],
      pets: [],
      answered: 3,
    },
    experience: {
      group_size_pref: 0.3,
      novelty: 0.7,
      setting_prefs: ['quiet_cafe', 'studio'],
      answered: 3,
    },
    geography: {
      home_area: 'Singapore',
      travel_time_max: 45,
      answered: 2,
    },
    answers: {
      q3GroupSize: '3-4',
      q3Energy: 0.3,
      q4Social: 'Low-maintenance, no pressure texting',
      q5PlanningRhythm: 'Planned a week or two ahead',
      q7Trust: 'Observant first — I take time',
    },
  };
}

function makeEmptyVector(): ProfileVector {
  return {
    profile: {
      id: 'empty-user',
      display_name: 'New User',
      home_area: 'Singapore',
      confidence: 0.1,
    },
    personality: { answered: 0 },
    communication: { answered: 0 },
    social_rhythm: { answered: 0 },
    intent: { answered: 0 },
    emotional: { answered: 0 },
    interests: [],
    values: [],
    lifestyle: { answered: 0 },
    experience: { answered: 0 },
    geography: { answered: 0 },
    answers: {},
  };
}

describe('Self-Profile Synthesizer', () => {
  it('1. Filled profile returns 10 bloom threads with non-zero strengths for answered threads', () => {
    const result = generateSelfProfile(makeFilledVector());
    assert.strictEqual(result.bloomThreads.length, 10);

    const answeredThreads = result.bloomThreads.filter((t) => t.strength > 0);
    assert.ok(answeredThreads.length >= 4, `Expected >= 4 answered threads, got ${answeredThreads.length}`);

    // Every bloom thread has a sentence (never empty)
    result.bloomThreads.forEach((t) => {
      assert.strictEqual(typeof t.sentence, 'string');
    });
  });

  it('2. Empty profile returns valid structure with zero-strength blooms', () => {
    const result = generateSelfProfile(makeEmptyVector());
    assert.strictEqual(result.bloomThreads.length, 10);

    const nonZero = result.bloomThreads.filter((t) => t.strength > 0);
    assert.strictEqual(nonZero.length, 0);

    assert.ok(result.tribalRead.headline, 'headline should be truthy');
    assert.strictEqual(result.connectionThreads.length, 0);
  });

  it('3. Tribal read headline never contains a percentage number', () => {
    const result = generateSelfProfile(makeFilledVector());
    assert.ok(!result.tribalRead.headline.match(/\d+%/), 'headline should not contain percentage');
    assert.ok(!result.tribalRead.summary.match(/\d+%/), 'summary should not contain percentage');
  });

  it('4. Connection threads are derived from markers, not hardcoded', () => {
    const result = generateSelfProfile(makeFilledVector());
    assert.ok(result.connectionThreads.length >= 2, `Expected >= 2 connection threads, got ${result.connectionThreads.length}`);

    result.connectionThreads.forEach((t) => {
      assert.ok(t.key, 'thread key should be truthy');
      assert.ok(t.name, 'thread name should be truthy');
      assert.ok(t.heroDescriptor.length >= 1, 'should have at least 1 descriptor');
      assert.strictEqual(typeof t.strength, 'number');
      assert.strictEqual(typeof t.note, 'string');
      assert.ok(t.note.length > 0, 'note should not be empty');
    });
  });

  it('5. Contradiction is only present when opposing markers exist', () => {
    const vec = makeFilledVector();
    // This vector has high openness/novelty (0.7) + high planning (0.8) = contradiction
    const result = generateSelfProfile(vec);
    if (result.contradiction) {
      assert.ok(result.contradiction.headline, 'contradiction headline should be truthy');
      assert.ok(result.contradiction.explanation, 'contradiction explanation should be truthy');
      assert.ok(result.contradiction.threadsInvolved.length >= 2, 'should involve at least 2 threads');
    }
  });

  it('6. Connection notes are generated when markers exist', () => {
    const result = generateSelfProfile(makeFilledVector());
    assert.ok(result.connectionNotes.length >= 1, `Expected >= 1 note, got ${result.connectionNotes.length}`);

    result.connectionNotes.forEach((n) => {
      assert.ok(n.id, 'note id should be truthy');
      assert.ok(n.hook, 'note hook should be truthy');
      assert.ok(n.statement, 'note statement should be truthy');
      assert.ok(n.explanation, 'note explanation should be truthy');
    });
  });

  it('7. Primary instinct is derived, not hardcoded to Connector', () => {
    const result = generateSelfProfile(makeFilledVector());
    assert.ok(result.primaryInstinct.type, 'instinct type should be truthy');
    assert.ok(result.primaryInstinct.description, 'instinct description should be truthy');
    const validTypes = [
      'Connector', 'Anchor', 'Explorer', 'Deep Diver',
      'Spark', 'Gatherer', 'Bridge', 'Cultivator', 'Catalyst', 'Keeper',
    ];
    assert.ok(validTypes.includes(result.primaryInstinct.type), `Expected valid instinct type, got ${result.primaryInstinct.type}`);
  });

  it('8. Bloom thread labels are human-readable, not raw keys', () => {
    const result = generateSelfProfile(makeFilledVector());
    const labels = result.bloomThreads.map((t) => t.label);
    // Should use human names like "Social Energy", not "personality"
    assert.ok(!labels.includes('personality'), 'should not contain raw key "personality"');
    assert.ok(!labels.includes('social_rhythm'), 'should not contain raw key "social_rhythm"');
    assert.ok(labels.includes('Social Energy'), 'should contain "Social Energy"');
    assert.ok(labels.includes('Social Rhythm'), 'should contain "Social Rhythm"');
  });

  it('9. Two different vectors produce different self-profile data', () => {
    const vec1 = makeFilledVector();
    const vec2 = makeFilledVector();
    // Make vec2 substantially different
    vec2.personality!.extraversion = 0.9;
    vec2.communication!.contact_frequency_self = 0.9;
    vec2.social_rhythm!.planning_horizon = 0.2;
    vec2.answers = {
      q3GroupSize: '6+',
      q3Energy: 0.9,
      q4Social: 'Daily memes and check-ins',
      q5PlanningRhythm: 'Spontaneous, same day',
      q7Trust: 'Open book right away',
    };

    const result1 = generateSelfProfile(vec1);
    const result2 = generateSelfProfile(vec2);

    // They must produce different headlines
    assert.notStrictEqual(result1.tribalRead.headline, result2.tribalRead.headline);

    // Different connection thread content
    const notes1 = result1.connectionThreads.map((t) => t.note).join('|');
    const notes2 = result2.connectionThreads.map((t) => t.note).join('|');
    assert.notStrictEqual(notes1, notes2);
  });

  it('10. Boundaries are derived from vector data', () => {
    const result = generateSelfProfile(makeFilledVector());
    assert.ok(result.boundaries, 'boundaries should be defined');
    assert.strictEqual(typeof result.boundaries.groupSizeBoundary, 'string');
    assert.strictEqual(typeof result.boundaries.locationBoundary, 'string');
  });
});
