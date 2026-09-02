import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateMatchExplanation, computeResonanceLabel, computeEvidenceLabel } from '../generator.ts';
import type { ProfileVector } from '../../domain/types.ts';

describe('Step 6p — Order 3: Resonance Labels & Evidence Count', () => {
  const memberA: ProfileVector = {
    profile: { id: 'o3a', handle: 'alex', display_name: 'Alex', home_area: 'Novena', birth_year: 1993, age_pref_min: 24, age_pref_max: 38, profile_version: 1, confidence: 0.8, tier: 'free', status: 'active' },
    answers: { q3GroupSize: '1-on-1', q4Social: 'Low-maintenance', q5PlanningRhythm: 'Planned', q7Trust: 'Observant first' },
    personality: { user_id: 'o3a', extraversion: 0.2, conscientiousness: 0.8, answered: 2 },
    social_rhythm: { user_id: 'o3a', planning_horizon: 0.8, answered: 1 },
    communication: { user_id: 'o3a', contact_frequency_self: 0.3, response_speed_self: 0.3, answered: 2 },
    intent: { user_id: 'o3a', depth: 0.8, answered: 1 },
  };

  const memberB: ProfileVector = {
    profile: { id: 'o3b', handle: 'taylor', display_name: 'Taylor', home_area: 'Bishan', birth_year: 1992, age_pref_min: 24, age_pref_max: 38, profile_version: 1, confidence: 0.8, tier: 'free', status: 'active' },
    answers: { q3GroupSize: '1-on-1', q4Social: 'Low-maintenance', q5PlanningRhythm: 'Planned', q7Trust: 'Observant first' },
    personality: { user_id: 'o3b', extraversion: 0.25, conscientiousness: 0.85, answered: 2 },
    social_rhythm: { user_id: 'o3b', planning_horizon: 0.85, answered: 1 },
    communication: { user_id: 'o3b', contact_frequency_self: 0.35, response_speed_self: 0.35, answered: 2 },
    intent: { user_id: 'o3b', depth: 0.85, answered: 1 },
  };

  it('1. Every explanation carries exactly one resonance label', () => {
    const exp = generateMatchExplanation(memberA, memberB);
    const validLabels = ['Strong Resonance', 'Good Resonance', 'Some Resonance', 'Worth a Look'];

    assert.ok(
      validLabels.includes(exp.resonance_label),
      `Expected valid resonance label, got: "${exp.resonance_label}"`
    );
  });

  it('2. Every explanation carries evidence_count and evidence_label', () => {
    const exp = generateMatchExplanation(memberA, memberB);

    assert.ok(typeof exp.evidence_count === 'number' && exp.evidence_count > 0);
    assert.ok(typeof exp.evidence_label === 'string' && exp.evidence_label.includes('signals'));
  });

  it('3. Evidence label threshold mapping', () => {
    assert.strictEqual(computeEvidenceLabel(8), 'Early read · based on 8 signals');
    assert.strictEqual(computeEvidenceLabel(34), 'Developing read · 34 signals');
    assert.strictEqual(computeEvidenceLabel(87), 'Deep read · 87 signals');
  });

  it('4. Mechanism-based resonance label logic', () => {
    assert.strictEqual(computeResonanceLabel(3, 3, false, 'NONE'), 'Strong Resonance');
    assert.strictEqual(computeResonanceLabel(1, 2, false, 'NEGOTIABLE'), 'Good Resonance');
    assert.strictEqual(computeResonanceLabel(0, 1, false, 'NOTICEABLE'), 'Some Resonance');
    assert.strictEqual(computeResonanceLabel(0, 0, false, 'STRUCTURAL'), 'Worth a Look');
  });
});
