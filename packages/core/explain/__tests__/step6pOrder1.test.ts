import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateMatchExplanation, HONEST_EMPTY_FRICTION } from '../generator.ts';
import type { ProfileVector } from '../../domain/types.ts';

describe('Step 6p — Order 1: Delete Manufactured Friction & Prevent Self-Contradiction', () => {
  const mervyn: ProfileVector = {
    profile: { id: 'mervyn', handle: 'mervyn', display_name: 'Mervyn', home_area: 'Tiong Bahru', birth_year: 1992, age_pref_min: 24, age_pref_max: 38, profile_version: 1, confidence: 0.8, tier: 'free', status: 'active' },
    answers: {
      q3GroupSize: '1-on-1',
      q4Social: 'Low-maintenance - no pressure to reply fast',
      q5PlanningRhythm: 'Planned - a week or two in advance',
      q7Trust: 'Observant first - I take time to build trust',
    },
    personality: { user_id: 'mervyn', extraversion: 0.2, conscientiousness: 0.8, answered: 2 },
    social_rhythm: { user_id: 'mervyn', planning_horizon: 0.8, answered: 1 },
    communication: { user_id: 'mervyn', contact_frequency_self: 0.3, response_speed_self: 0.3, answered: 2 },
  };

  const evangeline: ProfileVector = {
    profile: { id: 'evangeline', handle: 'evangeline', display_name: 'Evangeline', home_area: 'Tanjong Pagar', birth_year: 1994, age_pref_min: 24, age_pref_max: 38, profile_version: 1, confidence: 0.8, tier: 'free', status: 'active' },
    answers: {
      q3GroupSize: '1-on-1',
      q4Social: 'Low-maintenance - no pressure to reply fast',
      q5PlanningRhythm: 'Planned - a week or two in advance',
      q7Trust: 'Observant first - I take time to build trust',
    },
    personality: { user_id: 'evangeline', extraversion: 0.25, conscientiousness: 0.85, answered: 2 },
    social_rhythm: { user_id: 'evangeline', planning_horizon: 0.85, answered: 1 },
    communication: { user_id: 'evangeline', contact_frequency_self: 0.35, response_speed_self: 0.35, answered: 2 },
  };

  it('1. Manufactured friction is deleted — honest empty state appears when friction is absent', () => {
    const exp = generateMatchExplanation(mervyn, evangeline);

    assert.ok(
      exp.friction_text.includes(HONEST_EMPTY_FRICTION.text),
      `Expected honest empty friction state, got friction_text: "${exp.friction_text}"`
    );
    assert.strictEqual(
      exp.friction_text.includes("the mildest difference is around"),
      false,
      'Manufactured weakest thread friction must NEVER appear in output'
    );
  });

  it('2. Assertion: No thread appears as both an alignment and a friction in the same card', () => {
    const exp = generateMatchExplanation(mervyn, evangeline);
    const clickLower = exp.click_text.toLowerCase();
    const frictionLower = exp.friction_text.toLowerCase();

    // Check key thread terms
    const threads = ['planning', 'contact', 'messaging', 'social energy', 'opening pace', 'group size'];
    threads.forEach((thread) => {
      const inClick = clickLower.includes(thread);
      const inFriction = frictionLower.includes(thread) && !frictionLower.includes("isn't a meaningful mismatch");

      assert.strictEqual(
        inClick && inFriction,
        false,
        `Thread "${thread}" must NOT appear in both click alignment and friction in the same card!`
      );
    });
  });
});
