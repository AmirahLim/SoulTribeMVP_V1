import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { synthesizeSocialRead } from '../../explain/socialSynthesis.ts';

describe('Cross-signal synthesis evidence', () => {
  it('does not manufacture an interpretation from empty evidence', () => {
    assert.equal(synthesizeSocialRead([]).sections.length, 0);
  });
  it('requires independent sources, not two labels from one answer', () => {
    assert.equal(synthesizeSocialRead([
      { key: 'novelty-seeking', thread: 'personality', source: 'one-answer' },
      { key: 'advance-planning', thread: 'social_rhythm', source: 'one-answer' },
    ]).sections.length, 0);
  });
  it('synthesizes novelty with planning and retains evidence', () => {
    const read = synthesizeSocialRead([
      { key: 'novelty-seeking', thread: 'personality', source: 'personality.novelty' },
      { key: 'advance-planning', thread: 'social_rhythm', source: 'rhythm.planning' },
    ]);
    assert.equal(read.headline, 'Intentional explorer');
    assert.equal(read.sections[0].evidenceLevel, 'CROSS-THREAD PATTERN');
    assert.equal(read.sections[0].sources.length, 2);
  });
});
