import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateMatchExplanation } from '../generator.ts';
import { extractMarkers } from '../markers.ts';
import type { ProfileVector } from '../../domain/types.ts';

describe('Step 6o — Repetition Bound, Determinism & Non-Contradiction', () => {
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
      answers: { q3GroupSize: '1-on-1', q4Social: 'Deep conversations every few weeks', q5PlanningRhythm: 'Spontaneous - same day or day before', q7Trust: 'Observant first - I take time to build trust' },
      personality: { user_id: 'm2', extraversion: 0.3, conscientiousness: 0.4, answered: 2 },
      social_rhythm: { user_id: 'm2', planning_horizon: 0.2, answered: 1 },
      communication: { user_id: 'm2', contact_frequency_self: 0.3, response_speed_self: 0.4, answered: 2 },
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
      answers: { q3GroupSize: '1-on-1', q4Social: 'Voice notes and long catches', q5PlanningRhythm: 'Planned - a week or two in advance', q7Trust: 'Observant first - I take time to build trust' },
      personality: { user_id: 'm5', extraversion: 0.25, conscientiousness: 0.7, answered: 2 },
      social_rhythm: { user_id: 'm5', planning_horizon: 0.8, answered: 1 },
      communication: { user_id: 'm5', contact_frequency_self: 0.5, response_speed_self: 0.5, answered: 2 },
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
  ];

  it('1. No self-contradiction: two quiet members produce zero claims of drawing energy from lively groups', () => {
    const marcusP = members[0];
    const amirahP = members[1];

    const exp = generateMatchExplanation(marcusP, amirahP);
    const fullText = `${exp.click_text} ${exp.friction_text}`.toLowerCase();

    assert.strictEqual(
      fullText.includes('draws energy from lively group') || fullText.includes('draw energy from lively group'),
      false,
      'Reading for two quiet members must NOT claim either draws energy from lively group settings'
    );
  });

  it('2. Repetition bound target: across 15 pairings, distinct sentences >= 40 and max single sentence count <= 3', () => {
    const sentences: string[] = [];
    const sentenceCounts: Record<string, number> = {};

    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const exp = generateMatchExplanation(members[i], members[j]);
        const text = `${exp.click_text} ${exp.friction_text}`.trim();

        // Split on sentence boundaries (. ! ?)
        const parts = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 5);

        parts.forEach((s) => {
          sentences.push(s);
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

  it('3. Determinism: same pair produces byte-identical output across repeated calls', () => {
    const pairA = members[0];
    const pairB = members[1];

    const run1 = generateMatchExplanation(pairA, pairB);
    const run2 = generateMatchExplanation(pairA, pairB);

    assert.strictEqual(run1.click_text, run2.click_text);
    assert.strictEqual(run1.friction_text, run2.friction_text);
    assert.strictEqual(run1.headline, run2.headline);
  });
});
