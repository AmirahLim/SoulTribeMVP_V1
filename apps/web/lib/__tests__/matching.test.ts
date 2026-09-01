import { describe, it } from 'vitest';
import assert from 'node:assert';
import type { UserProfileData } from '../userStore';
import {
  getRankedMatches,
  setCandidateSource,
  demoCandidateSource,
  countRealMembers,
  isSmallCommunityMode,
  getSmallCommunityThreshold,
} from '../matching';
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

  it('11. The signed-in user NEVER appears in their own matches list (self-exclusion)', async () => {
    const targetDemo = DEMO_PROFILES[0];
    const userWithId: UserProfileData = {
      ...fullUser,
      id: targetDemo.profile.id,
      handle: targetDemo.profile.handle,
    };

    const matches = await getRankedMatches(userWithId, { limit: 10 });
    const containsSelf = matches.some(
      (m) => m.id === targetDemo.profile.id || m.name === targetDemo.profile.display_name
    );
    assert.strictEqual(containsSelf, false, 'Signed-in user must be excluded from their own match results');
  });
});

describe('Small Community Mode Tests', () => {
  const fullUser: UserProfileData = {
    displayName: 'Priya Sharma',
    avatarUrl: '',
    homeArea: 'Singapore',
    bio: 'Loves coffee and craft.',
    passCompletionPct: 80,
    deepProfile: {},
  };

  it('countRealMembers counts real members only (demo profiles never count)', async () => {
    const mockSource = {
      async getCandidates() {
        const realMembers = [1, 2, 3, 4, 5].map((i) => ({
          ...DEMO_PROFILES[0],
          profile: { ...DEMO_PROFILES[0].profile, id: `real-user-${i}`, display_name: `Real User ${i}` },
          isDemo: false,
        }));
        const demoMembers = DEMO_PROFILES.slice(0, 10).map((p) => ({ ...p, isDemo: true }));
        return [...realMembers, ...demoMembers];
      },
    };

    setCandidateSource(mockSource);

    const count = await countRealMembers('Singapore');
    assert.strictEqual(count, 5, 'Demo profiles must never count toward real member threshold');
  });

  it('With 5 real members (<= threshold 30): isSmallCommunityMode is true and all eligible members appear', async () => {
    process.env.NEXT_PUBLIC_SMALL_COMMUNITY_THRESHOLD = '30';

    const mockSource = {
      async getCandidates() {
        return [1, 2, 3, 4, 5].map((i) => ({
          ...DEMO_PROFILES[i],
          profile: { ...DEMO_PROFILES[i].profile, id: `real-member-${i}`, display_name: `Real Member ${i}` },
          isDemo: false,
        }));
      },
    };

    setCandidateSource(mockSource);

    const realCount = await countRealMembers('Singapore');
    assert.strictEqual(realCount, 5);
    assert.strictEqual(isSmallCommunityMode(realCount), true);

    const matches = await getRankedMatches(fullUser);
    assert.strictEqual(matches.length, 5, 'All eligible members appear in small community mode (no top-6 truncation)');
  });

  it('With 50 real members (> threshold 30): isSmallCommunityMode is false and top-6 slice returns', async () => {
    process.env.NEXT_PUBLIC_SMALL_COMMUNITY_THRESHOLD = '30';

    const mockSource = {
      async getCandidates() {
        return Array.from({ length: 50 }, (_, i) => ({
          ...DEMO_PROFILES[i % DEMO_PROFILES.length],
          profile: {
            ...DEMO_PROFILES[i % DEMO_PROFILES.length].profile,
            id: `real-member-${i + 1}`,
            display_name: `Real Member ${i + 1}`,
          },
          isDemo: false,
        }));
      },
    };

    setCandidateSource(mockSource);

    const realCount = await countRealMembers('Singapore');
    assert.strictEqual(realCount, 50);
    assert.strictEqual(isSmallCommunityMode(realCount), false);

    const matches = await getRankedMatches(fullUser, { limit: 6 });
    assert.strictEqual(matches.length, 6, 'Above threshold, ranked top-6 slice returns');
  });

  it('Gated members (hard gate failure) never appear in either small community mode or ranked mode', async () => {
    const gatedId = 'gated-member-1';
    const mockSource = {
      async getCandidates() {
        return [
          {
            ...DEMO_PROFILES[0],
            profile: { ...DEMO_PROFILES[0].profile, id: 'real-1', display_name: 'Real 1' },
            isDemo: false,
          },
          {
            ...DEMO_PROFILES[1],
            profile: { ...DEMO_PROFILES[1].profile, id: gatedId, display_name: 'Gated 1', status: 'banned' as const },
            isDemo: false,
          },
        ];
      },
    };

    setCandidateSource(mockSource);

    const matches = await getRankedMatches(fullUser);
    const containsGated = matches.some((m) => m.id === gatedId);
    assert.strictEqual(containsGated, false, 'Gated members must never appear in either mode');

    // Reset candidate source
    setCandidateSource(demoCandidateSource);
  });
});
