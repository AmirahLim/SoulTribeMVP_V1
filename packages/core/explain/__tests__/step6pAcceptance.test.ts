import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateMatchExplanation, HONEST_EMPTY_FRICTION } from '../generator.ts';
import type { ProfileVector } from '../../domain/types.ts';

describe('Step 6p — Comprehensive Acceptance Suite (Layer 5 Relational Patterns)', () => {
  const members: ProfileVector[] = [
    {
      profile: { id: 'm1', handle: 'marcus', display_name: 'Marcus', home_area: 'Tiong Bahru', birth_year: 1992, age_pref_min: 24, age_pref_max: 38, profile_version: 1, confidence: 0.8, tier: 'free', status: 'active' },
      answers: { q3GroupSize: '1-on-1', q4Social: 'Low-maintenance - no pressure to reply fast', q5PlanningRhythm: 'Planned - a week or two in advance', q7Trust: 'Observant first - I take time to build trust' },
      personality: { user_id: 'm1', extraversion: 0.2, conscientiousness: 0.8, answered: 2 },
      social_rhythm: { user_id: 'm1', planning_horizon: 0.8, answered: 1 },
      communication: { user_id: 'm1', contact_frequency_self: 0.3, response_speed_self: 0.3, answered: 2 },
      intent: { user_id: 'm1', depth: 0.8, answered: 1 },
    },
    {
      profile: { id: 'm2', handle: 'amirah', display_name: 'Amirah', home_area: 'Tanjong Pagar', birth_year: 1994, age_pref_min: 24, age_pref_max: 38, profile_version: 1, confidence: 0.8, tier: 'free', status: 'active' },
      answers: { q3GroupSize: '1-on-1', q4Social: 'Daily memes & quick check-ins', q5PlanningRhythm: 'Spontaneous - same day or day before', q7Trust: 'Observant first - I take time to build trust' },
      personality: { user_id: 'm2', extraversion: 0.3, conscientiousness: 0.4, answered: 2 },
      social_rhythm: { user_id: 'm2', planning_horizon: 0.2, answered: 1 },
      communication: { user_id: 'm2', contact_frequency_self: 0.8, response_speed_self: 0.8, answered: 2 },
      intent: { user_id: 'm2', depth: 0.8, answered: 1 },
    },
    {
      profile: { id: 'm3', handle: 'chloe', display_name: 'Chloe', home_area: 'River Valley', birth_year: 1995, age_pref_min: 24, age_pref_max: 38, profile_version: 1, confidence: 0.8, tier: 'free', status: 'active' },
      answers: { q3GroupSize: '3-4 people', q4Social: 'Daily memes & quick check-ins', q5PlanningRhythm: 'Planned - a week or two in advance', q7Trust: 'Open book right away' },
      personality: { user_id: 'm3', extraversion: 0.75, conscientiousness: 0.8, answered: 2 },
      social_rhythm: { user_id: 'm3', planning_horizon: 0.8, answered: 1 },
      communication: { user_id: 'm3', contact_frequency_self: 0.8, response_speed_self: 0.8, answered: 2 },
      intent: { user_id: 'm3', depth: 0.4, answered: 1 },
    },
    {
      profile: { id: 'm4', handle: 'dev', display_name: 'Dev', home_area: 'Novena', birth_year: 1991, age_pref_min: 24, age_pref_max: 38, profile_version: 1, confidence: 0.8, tier: 'free', status: 'active' },
      answers: { q3GroupSize: '5-6 people', q4Social: 'Daily memes & quick check-ins', q5PlanningRhythm: 'Spontaneous - same day or day before', q7Trust: 'Open book right away' },
      personality: { user_id: 'm4', extraversion: 0.85, conscientiousness: 0.3, answered: 2 },
      social_rhythm: { user_id: 'm4', planning_horizon: 0.2, answered: 1 },
      communication: { user_id: 'm4', contact_frequency_self: 0.8, response_speed_self: 0.8, answered: 2 },
      intent: { user_id: 'm4', depth: 0.3, answered: 1 },
    },
    {
      profile: { id: 'm5', handle: 'priya', display_name: 'Priya', home_area: 'Bishan', birth_year: 1993, age_pref_min: 24, age_pref_max: 38, profile_version: 1, confidence: 0.8, tier: 'free', status: 'active' },
      answers: { q3GroupSize: '3-4 people', q4Social: 'Low-maintenance - no pressure to reply fast', q5PlanningRhythm: 'Planned - a week or two in advance', q7Trust: 'Open book right away' },
      personality: { user_id: 'm5', extraversion: 0.5, conscientiousness: 0.7, answered: 2 },
      social_rhythm: { user_id: 'm5', planning_horizon: 0.8, answered: 1 },
      communication: { user_id: 'm5', contact_frequency_self: 0.3, response_speed_self: 0.3, answered: 2 },
      intent: { user_id: 'm5', depth: 0.9, answered: 1 },
    },
    {
      profile: { id: 'm6', handle: 'samuel', display_name: 'Samuel', home_area: 'Tampines', birth_year: 1989, age_pref_min: 24, age_pref_max: 38, profile_version: 1, confidence: 0.8, tier: 'free', status: 'active' },
      answers: { q3GroupSize: '3-4 people', q4Social: 'Low-maintenance - no pressure to reply fast', q5PlanningRhythm: 'Spontaneous - same day or day before', q7Trust: 'Open book right away' },
      personality: { user_id: 'm6', extraversion: 0.4, conscientiousness: 0.3, answered: 2 },
      social_rhythm: { user_id: 'm6', planning_horizon: 0.2, answered: 1 },
      communication: { user_id: 'm6', contact_frequency_self: 0.3, response_speed_self: 0.4, answered: 2 },
      intent: { user_id: 'm6', depth: 0.5, answered: 1 },
    },
    {
      profile: { id: 'm7', handle: 'mervyn', display_name: 'Mervyn', home_area: 'Tiong Bahru', birth_year: 1992, age_pref_min: 24, age_pref_max: 38, profile_version: 1, confidence: 0.8, tier: 'free', status: 'active' },
      answers: { q3GroupSize: '1-on-1', q4Social: 'Low-maintenance - no pressure to reply fast', q5PlanningRhythm: 'Planned - a week or two in advance', q7Trust: 'Open book right away' },
      personality: { user_id: 'm7', extraversion: 0.2, conscientiousness: 0.8, answered: 2 },
      social_rhythm: { user_id: 'm7', planning_horizon: 0.8, answered: 1 },
      communication: { user_id: 'm7', contact_frequency_self: 0.3, response_speed_self: 0.3, answered: 2 },
      intent: { user_id: 'm7', depth: 0.8, answered: 1 },
    },
    {
      profile: { id: 'm8', handle: 'evangeline', display_name: 'Evangeline', home_area: 'Tanjong Pagar', birth_year: 1994, age_pref_min: 24, age_pref_max: 38, profile_version: 1, confidence: 0.8, tier: 'free', status: 'active' },
      answers: { q3GroupSize: '5-6 people', q4Social: 'Daily memes & quick check-ins', q5PlanningRhythm: 'Planned - a week or two in advance', q7Trust: 'Open book right away' },
      personality: { user_id: 'm8', extraversion: 0.85, conscientiousness: 0.75, answered: 2 },
      social_rhythm: { user_id: 'm8', planning_horizon: 0.85, answered: 1 },
      communication: { user_id: 'm8', contact_frequency_self: 0.85, response_speed_self: 0.85, answered: 2 },
      intent: { user_id: 'm8', depth: 0.35, answered: 1 },
    },
  ];

  it('1. No two cards are identical after name removal across 8 pairings', () => {
    const cardTexts = new Set<string>();

    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const exp = generateMatchExplanation(members[i], members[j]);
        const nameA = members[i].profile.display_name;
        const nameB = members[j].profile.display_name;

        // Strip names
        const anonymized = `${exp.click_text} ${exp.friction_text}`
          .replaceAll(nameA, 'PERSON_A')
          .replaceAll(nameB, 'PERSON_B');

        assert.strictEqual(
          cardTexts.has(anonymized),
          false,
          `Card for ${nameA} x ${nameB} must be unique after name removal!`
        );
        cardTexts.add(anonymized);
      }
    }
  });

  it('2. No card contains a thread named as both alignment and friction', () => {
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const exp = generateMatchExplanation(members[i], members[j]);
        const clickLower = exp.click_text.toLowerCase();
        const frictionLower = exp.friction_text.toLowerCase();

        const threads = ['planning', 'contact', 'messaging', 'social energy', 'opening pace'];
        threads.forEach((thread) => {
          const inClick = clickLower.includes(thread);
          const inFriction = frictionLower.includes(thread) && !frictionLower.includes("isn't a meaningful mismatch");

          assert.strictEqual(
            inClick && inFriction,
            false,
            `Pair ${members[i].profile.display_name} x ${members[j].profile.display_name} has thread "${thread}" in both click alignment and friction!`
          );
        });
      }
    }
  });

  it('3. No card contains manufactured friction — empty state appears when friction is absent', () => {
    const exp = generateMatchExplanation(members[6], members[0]); // Mervyn x Marcus (identical answers)

    assert.ok(
      exp.friction_text.includes(HONEST_EMPTY_FRICTION.text),
      'Mervyn x Marcus must receive honest empty friction state'
    );
    assert.strictEqual(
      exp.friction_text.includes('the mildest difference is around'),
      false,
      'Manufactured weakest thread friction must NEVER appear in output'
    );
  });

  it('4. Interest-only mismatch never appears as leading friction', () => {
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const exp = generateMatchExplanation(members[i], members[j]);
        assert.strictEqual(
          exp.friction_text.startsWith('You have different core interest focus areas'),
          false,
          'Interest mismatch alone must NEVER lead potential friction'
        );
      }
    }
  });

  it('5. Every card carries exactly one resonance label and an evidence count', () => {
    const validLabels = ['Strong Resonance', 'Good Resonance', 'Some Resonance', 'Worth a Look'];
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const exp = generateMatchExplanation(members[i], members[j]);
        assert.ok(validLabels.includes(exp.resonance_label));
        assert.ok(typeof exp.evidence_count === 'number' && exp.evidence_count > 0);
        assert.ok(typeof exp.evidence_label === 'string' && exp.evidence_label.includes('signals'));
      }
    }
  });

  it('6. Step 6o Repetition bound still holds (>= 40 distinct sentences across 15 pairings, none > 3 times)', () => {
    const subset = members.slice(0, 6);
    const sentenceCounts: Record<string, number> = {};

    for (let i = 0; i < subset.length; i++) {
      for (let j = i + 1; j < subset.length; j++) {
        const exp = generateMatchExplanation(subset[i], subset[j]);
        const text = `${exp.click_text} ${exp.friction_text}`.trim();
        const parts = text
          .split(/(?<=[.!?])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 5 && !s.includes("From what you've both shared so far"));

        parts.forEach((s) => {
          sentenceCounts[s] = (sentenceCounts[s] || 0) + 1;
        });
      }
    }

    const distinctCount = Object.keys(sentenceCounts).length;
    const maxCount = Math.max(...Object.values(sentenceCounts));

    assert.ok(
      distinctCount >= 40,
      `Expected at least 40 distinct sentences across 15 pairings, got ${distinctCount}`
    );
    assert.ok(
      maxCount <= 3,
      `Expected no single sentence to appear more than 3 times, got max count ${maxCount}`
    );
  });
});
