import { describe, it } from 'node:test';
import assert from 'node:assert';
import { extractMarkers } from '../markers.ts';
import type { ProfileVector, OnboardingAnswers } from '../../domain/types.ts';

describe('Layer 1 — Marker Extraction & Vocabulary Table', () => {
  it('1. Unanswered profile vector produces zero markers', () => {
    const emptyVec: ProfileVector = {
      profile: {
        id: 'user-empty',
        handle: 'empty',
        display_name: 'Empty User',
        home_area: 'Singapore',
        birth_year: 1995,
        age_pref_min: 20,
        age_pref_max: 40,
        profile_version: 1,
        confidence: 0,
        tier: 'free',
        status: 'active',
      },
    };

    const markers = extractMarkers(emptyVec);
    assert.strictEqual(markers.length, 0, 'Unanswered vector must produce 0 markers');
  });

  it('2. One answer, several markers — Q3 groupSize = 1-on-1 produces exact marker set', () => {
    const vec: ProfileVector = {
      profile: {
        id: 'user-1',
        handle: 'user1',
        display_name: 'User 1',
        home_area: 'Singapore',
        birth_year: 1992,
        age_pref_min: 24,
        age_pref_max: 38,
        profile_version: 1,
        confidence: 0.8,
        tier: 'free',
        status: 'active',
      },
    };

    const answers: OnboardingAnswers = {
      q3GroupSize: '1-on-1',
    };

    const markers = extractMarkers(vec, answers);
    const keys = markers.map((m) => m.key);

    assert.ok(markers.length >= 3, 'Q3 1-on-1 must produce at least 3 distinct markers');
    assert.ok(keys.includes('intimate-group-oriented'), 'Must contain intimate-group-oriented');
    assert.ok(keys.includes('socially-selective'), 'Must contain socially-selective');
    assert.ok(keys.includes('energy-conserving'), 'Must contain energy-conserving');
  });

  it('3. Different answers, shared marker — low-maintenance and deep conversations both produce low-contact', () => {
    const vec: ProfileVector = {
      profile: {
        id: 'user-2',
        handle: 'user2',
        display_name: 'User 2',
        home_area: 'Singapore',
        birth_year: 1992,
        age_pref_min: 24,
        age_pref_max: 38,
        profile_version: 1,
        confidence: 0.8,
        tier: 'free',
        status: 'active',
      },
    };

    const answers1: OnboardingAnswers = {
      messagingStyle: 'Low-maintenance - no pressure to reply fast',
    };
    const answers2: OnboardingAnswers = {
      messagingStyle: 'Deep conversations every few weeks',
    };

    const markers1 = extractMarkers(vec, answers1);
    const markers2 = extractMarkers(vec, answers2);

    assert.ok(markers1.some((m) => m.key === 'low-contact'), 'Answers 1 must produce low-contact');
    assert.ok(markers2.some((m) => m.key === 'low-contact'), 'Answers 2 must produce low-contact');
  });

  it('4. Answered vector fallback produces deterministic markers with mandatory source', () => {
    const vec: ProfileVector = {
      profile: {
        id: 'user-1',
        handle: 'marcus',
        display_name: 'Marcus',
        home_area: 'Tiong Bahru',
        birth_year: 1992,
        age_pref_min: 24,
        age_pref_max: 38,
        profile_version: 1,
        confidence: 0.8,
        tier: 'free',
        status: 'active',
      },
      personality: {
        user_id: 'user-1',
        extraversion: 0.3, // socially-selective
        conscientiousness: 0.7, // structured-routine
        answered: 2,
      },
      social_rhythm: {
        user_id: 'user-1',
        planning_horizon: 0.8, // advance-planning
        answered: 1,
      },
    };

    const markers = extractMarkers(vec);
    assert.strictEqual(markers.length, 3);

    const keys = markers.map((m) => m.key);
    assert.ok(keys.includes('socially-selective'));
    assert.ok(keys.includes('structured-routine'));
    assert.ok(keys.includes('advance-planning'));

    markers.forEach((m) => {
      assert.ok(m.source && typeof m.source === 'string' && m.source.length > 0, `Marker ${m.key} must have source string`);
    });
  });
});
