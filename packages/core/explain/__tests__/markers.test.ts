import { describe, it } from 'node:test';
import assert from 'node:assert';
import { extractMarkers } from '../markers.ts';
import type { ProfileVector } from '../../domain/types.ts';

describe('Layer 1 — Marker Extraction', () => {
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

  it('2. Answered questions produce deterministic markers with mandatory source', () => {
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

    // Assert mandatory source field on every marker
    markers.forEach((m) => {
      assert.ok(m.source && typeof m.source === 'string' && m.source.length > 0, `Marker ${m.key} must have source string`);
    });
  });
});
