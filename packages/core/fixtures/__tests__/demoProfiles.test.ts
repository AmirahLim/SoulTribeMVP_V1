import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  DEMO_PROFILES,
  DEMO_NAMES,
  FEMALE_AVATARS,
  MALE_AVATARS,
  DEMO_AREAS
} from '../demoProfiles.ts';

describe('Part B & C — Demo Profiles & Fixtures Verification', () => {
  it('1. Avatar Gender Invariant — every profile avatar_url belongs to the declared gender avatar pool', () => {
    assert.strictEqual(DEMO_PROFILES.length, 40);
    assert.strictEqual(DEMO_NAMES.length, 40);

    for (let i = 0; i < DEMO_PROFILES.length; i++) {
      const profile = DEMO_PROFILES[i].profile;
      const nameEntry = DEMO_NAMES.find(n => n.name === profile.display_name);

      assert.ok(nameEntry, `Profile name "${profile.display_name}" must exist in DEMO_NAMES`);

      if (nameEntry.gender === 'female') {
        assert.ok(
          FEMALE_AVATARS.includes(profile.avatar_url),
          `Female profile "${profile.display_name}" avatar_url must be in FEMALE_AVATARS pool. Got: ${profile.avatar_url}`
        );
      } else {
        assert.ok(
          MALE_AVATARS.includes(profile.avatar_url),
          `Male profile "${profile.display_name}" avatar_url must be in MALE_AVATARS pool. Got: ${profile.avatar_url}`
        );
      }
    }
  });

  it('2. Bios Variety — 40 distinct bios', () => {
    const bios = new Set(DEMO_PROFILES.map(p => p.profile.bio));
    assert.strictEqual(bios.size, 40, `Expected 40 distinct bios, got ${bios.size}`);
  });

  it('3. Areas Variety — at least 8 distinct SG neighbourhoods', () => {
    const areas = new Set(DEMO_PROFILES.map(p => p.geography.home_area));
    assert.ok(areas.size >= 8, `Expected at least 8 distinct neighbourhoods, got ${areas.size}`);
    assert.ok(DEMO_AREAS.length >= 8, 'DEMO_AREAS must contain at least 8 neighbourhoods');
  });
});
