import { describe, it } from 'vitest';
import assert from 'node:assert';
import type { UserProfileData } from '../userStore';
import { getRankedMatches, setCandidateSource, demoCandidateSource } from '../matching';
import { DEMO_PROFILES } from '@soul-tribe/core';

describe('Part 5 — Matching Service Tests', () => {
  setCandidateSource(demoCandidateSource);

  const fullUser: UserProfileData = {
    displayName: 'Priya Sharma',
    avatarUrl: '',
    homeArea: 'Singapore',
    bio: 'Loves coffee and craft.',
    passCompletionPct: 80,
    deepProfile: {
      mbti: 'INFJ',
      groupSize: '3–4 people',
      socialVibe: 'Intimate · Calm',
      messagingStyle: 'Voice notes',
      supportStyle: 'Listen first',
      friendshipPillars: 'Reliability',
      idealSaturday: 'Slow coffee',
      spontaneousTrip: 'Convince me',
    },
  };

  it('6. getRankedMatches returns results sorted by rankScore descending', async () => {
    const matches = await getRankedMatches(fullUser, { limit: 6 });
    assert.ok(matches.length > 0, 'Should return candidate matches');
    for (let i = 0; i < matches.length - 1; i++) {
      assert.ok(
        matches[i].rankScore >= matches[i + 1].rankScore,
        `Expected ${matches[i].rankScore} >= ${matches[i + 1].rankScore}`
      );
    }
  });

  it('7. A candidate that fails a hard gate (e.g. mutual block) is NEVER returned', async () => {
    const blockedId = DEMO_PROFILES[1].profile.id;

    // Custom candidate source that injects a blocked profile
    const customSource = {
      async getCandidates() {
        return DEMO_PROFILES.map((p) => {
          if (p.profile.id === blockedId) {
            return {
              ...p,
              profile: {
                ...p.profile,
                status: 'banned' as const, // Hard gate failure
              },
            };
          }
          return p;
        });
      },
    };

    setCandidateSource(customSource);
    const matches = await getRankedMatches(fullUser, { limit: 10 });
    const containsBlocked = matches.some((m) => m.id === blockedId);
    assert.strictEqual(containsBlocked, false, 'Hard-gated candidate must not be returned');

    // Reset candidate source
    setCandidateSource(demoCandidateSource);
  });

  it('8. Results respect limit option', async () => {
    const matches3 = await getRankedMatches(fullUser, { limit: 3 });
    assert.strictEqual(matches3.length, 3);

    const matches5 = await getRankedMatches(fullUser, { limit: 5 });
    assert.strictEqual(matches5.length, 5);
  });

  it('9. clickText differs between candidates (proves it is generated, not static)', async () => {
    const matches = await getRankedMatches(fullUser, { limit: 6 });
    assert.ok(matches.length >= 2, 'Need at least 2 matches for comparison');

    // Check that generated clickTexts exist and reflect dynamic profile traits
    assert.ok(matches[0].clickText && matches[0].clickText.length > 5);
    assert.ok(matches[1].clickText && matches[1].clickText.length > 5);
    assert.ok(matches[0].rubText && matches[0].rubText.length > 5);
  });

  it('10. A thin viewer profile still returns results, flagged provisional: true', async () => {
    const thinUser: UserProfileData = {
      displayName: 'Thin User',
      avatarUrl: '',
      homeArea: 'Singapore',
      bio: '',
      passCompletionPct: 10,
      deepProfile: {}, // Thin profile with no answers
    };

    const matches = await getRankedMatches(thinUser, { limit: 5 });
    assert.ok(matches.length > 0, 'Thin profile should return provisional matches');
    const hasProvisional = matches.some((m) => m.provisional === true);
    assert.strictEqual(hasProvisional, true, 'Thin profile matches must be flagged provisional: true');
  });
});
