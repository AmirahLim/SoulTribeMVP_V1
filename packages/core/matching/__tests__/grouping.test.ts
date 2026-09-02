import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { ProfileVector } from '../../domain/types.ts';
import { formBestGroup, formGroups, buildPairwiseMatrix } from '../grouping.ts';

function createMockVector(id: string, name: string, availabilitySlot: string = 'sat_midday'): ProfileVector {
  return {
    profile: {
      id,
      handle: name.toLowerCase().replace(/\s+/g, '_'),
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
    personality: {
      user_id: id,
      openness: 0.8,
      conscientiousness: 0.7,
      extraversion: 0.6,
      agreeableness: 0.8,
      emotional_stability: 0.7,
      serious_playful: 0.5,
      intensity_easygoing: 0.5,
      assertive_accommodating: 0.5,
      novelty_seeking: 0.6,
      intellectual_curiosity: 0.7,
      answered: 10,
    },
    communication: {
      user_id: id,
      contact_frequency_self: 0.5,
      contact_frequency_expect: 0.5,
      response_speed_self: 0.5,
      response_speed_expect: 0.5,
      initiation_self: 0.5,
      initiation_expect: 0.5,
      message_length: 0.5,
      direct_diplomatic: 0.5,
      high_context_literal: 0.5,
      mediums: ['text'],
      conv_styles: ['deep'],
      answered: 10,
    },
    social_rhythm: {
      user_id: id,
      availability: [availabilitySlot],
      fri_night: true,
      sat_night: true,
      planning_horizon: 0.5,
      social_freq_self: 0.5,
      social_freq_expect: 0.5,
      preferred_duration: 120,
      energy_peak: 0.5,
      answered: 5,
    },
    intent: {
      user_id: id,
      intents: ['friendship'],
      depth: 3,
      open_to_hosting: false,
      answered: 3,
    },
    emotional: {
      user_id: id,
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
      reliability_self: 0.8,
      reliability_expect: 0.8,
      boundary_clarity: 0.5,
      answered: 10,
    },
    values: [],
    interests: [],
    lifestyle: {
      user_id: id,
      budget_band: 2,
      alcohol: 'occasional',
      smoking: 'none',
      activity_level: 0.5,
      travel_frequency: 0.5,
      life_stage: 'working',
      work_schedule: [],
      food_prefs: [],
      pets: [],
      accessibility_needs: [],
      dealbreakers: [],
      answered: 5,
    },
    experience: {
      user_id: id,
      settings: ['cafe'],
      group_size_pref: 0.5,
      orientation: ['conversation'],
      novelty: 0.5,
      answered: 5,
    },
    geography: {
      user_id: id,
      home_area: 'Singapore',
      radius_minutes: { coffee: 30 },
      answered: 2,
    },
  };
}

describe('Module 1 — Group-forming optimiser', () => {
  it('1. Pool smaller than size returns null', () => {
    const pool = [
      createMockVector('1', 'User 1'),
      createMockVector('2', 'User 2'),
      createMockVector('3', 'User 3'),
    ];
    const result = formBestGroup(pool, { size: 6 });
    assert.strictEqual(result, null);
  });

  it('2. Returned members.length === size whenever a group is returned', () => {
    const pool = Array.from({ length: 10 }, (_, i) => createMockVector(`user_${i}`, `User ${i}`));
    const result = formBestGroup(pool, { size: 6, requireTimeFeasible: false });
    assert.notStrictEqual(result, null);
    if (result) {
      assert.strictEqual(result.members.length, 6);
    }
  });

  it('3. mustInclude members are always present in the result', () => {
    const pool = Array.from({ length: 10 }, (_, i) => createMockVector(`user_${i}`, `User ${i}`));
    const mustIncludeHost = 'user_3';
    const result = formBestGroup(pool, { size: 6, mustInclude: [mustIncludeHost], requireTimeFeasible: false });
    assert.notStrictEqual(result, null);
    if (result) {
      const hasHost = result.members.some((m) => m.profile.id === mustIncludeHost);
      assert.strictEqual(hasHost, true);
    }
  });

  it('4. A gated pair (mutual block) never appears together in a returned group', () => {
    const pool = Array.from({ length: 10 }, (_, i) => createMockVector(`user_${i}`, `User ${i}`));
    const userA = pool[0].profile.id;
    const userB = pool[1].profile.id;

    // Block userB for userA
    const context = { blockedUserIds: [userB] };
    const result = formBestGroup(pool, { size: 6, context, requireTimeFeasible: false });
    assert.notStrictEqual(result, null);
    if (result) {
      const hasA = result.members.some((m) => m.profile.id === userA);
      const hasB = result.members.some((m) => m.profile.id === userB);
      assert.strictEqual(hasA && hasB, false, 'Gated pair must not be in the same group');
    }
  });

  it('5. formGroups returns non-overlapping groups (no profile id appears twice)', () => {
    const pool = Array.from({ length: 14 }, (_, i) => createMockVector(`user_${i}`, `User ${i}`));
    const groups = formGroups(pool, { size: 6, requireTimeFeasible: false });
    assert.ok(groups.length >= 2);

    const seenIds = new Set<string>();
    for (const g of groups) {
      assert.strictEqual(g.members.length, 6);
      for (const m of g.members) {
        assert.strictEqual(seenIds.has(m.profile.id), false, `Duplicate member found: ${m.profile.id}`);
        seenIds.add(m.profile.id);
      }
    }
  });

  it('6. Matrix builder deduplicates pool and constructs correct threads', () => {
    const p1 = createMockVector('1', 'User 1');
    const p2 = createMockVector('2', 'User 2');
    const pool = [p1, p2, p1]; // duplicate p1
    const matrix = buildPairwiseMatrix(pool);
    assert.strictEqual(matrix.index.size, 2);
    assert.strictEqual(matrix.resonance.length, 2);
  });
});
