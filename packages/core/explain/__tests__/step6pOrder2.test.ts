import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateMatchExplanation } from '../generator.ts';
import { composeDyad } from '../dyad.ts';
import type { ProfileVector } from '../../domain/types.ts';

describe('Step 6p — Order 2: Interest Mismatch & Friction Severity Classification', () => {
  const noveltySeeker1: ProfileVector = {
    profile: { id: 'ns1', handle: 'carmen', display_name: 'Carmen', home_area: 'Novena', birth_year: 1993, age_pref_min: 24, age_pref_max: 38, profile_version: 1, confidence: 0.8, tier: 'free', status: 'active' },
    answers: { q3GroupSize: '1-on-1', q4Social: 'Low-maintenance', q5PlanningRhythm: 'Spontaneous', q7Trust: 'Open book' },
    personality: { user_id: 'ns1', extraversion: 0.5, openness: 0.8, conscientiousness: 0.5, answered: 2 },
    interests: [{ node_id: 'i1', node_name: 'baking' }, { node_id: 'i2', node_name: 'pottery' }] as any,
  };

  const noveltySeeker2: ProfileVector = {
    profile: { id: 'ns2', handle: 'yasmin', display_name: 'Yasmin', home_area: 'Bishan', birth_year: 1992, age_pref_min: 24, age_pref_max: 38, profile_version: 1, confidence: 0.8, tier: 'free', status: 'active' },
    answers: { q3GroupSize: '1-on-1', q4Social: 'Low-maintenance', q5PlanningRhythm: 'Spontaneous', q7Trust: 'Open book' },
    personality: { user_id: 'ns2', extraversion: 0.5, openness: 0.8, conscientiousness: 0.5, answered: 2 },
    interests: [{ node_id: 'i3', node_name: 'bouldering' }, { node_id: 'i4', node_name: 'hiking' }] as any,
  };

  it('1. Interest divergence between novelty-open members is classified as COMPLEMENTARY upside', () => {
    const exp = generateMatchExplanation(noveltySeeker1, noveltySeeker2);
    const clickLower = exp.click_text.toLowerCase();

    assert.ok(
      clickLower.includes("wider interests diverge") || clickLower.includes("step into the other's world"),
      `Expected COMPLEMENTARY interest upside in click text, got: "${exp.click_text}"`
    );
    assert.strictEqual(
      exp.friction_text.includes("different core interest focus areas"),
      false,
      'Interest mismatch alone must NEVER lead potential friction'
    );
  });
});
