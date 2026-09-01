import { describe, it, beforeEach } from 'vitest';
import assert from 'node:assert';
import {
  saveRhythmCheck,
  saveOutingRecord,
  setMockRhythmChecks,
  getMockRhythmChecks,
  setMockOutingRecords,
  getMockOutingRecords,
  clearMockRhythmData,
  RhythmCheckInput,
  OutingRecordInput,
} from '../rhythmChecks';

describe('Post-Outing Feedback & Record Service Tests', () => {
  beforeEach(() => {
    clearMockRhythmData();
  });

  it('1. saveRhythmCheck saves private peer feedback with author_id = signed-in user', async () => {
    const feedback: RhythmCheckInput = {
      outing_id: 'out-pottery-01',
      author_id: 'user-priya-1',
      about_id: 'user-marcus-host',
      would_meet_again: 5,
      energy_read: 'as_expected',
      pace_read: 'as_expected',
      note: 'Great host, very welcoming atmosphere.',
    };

    const res = await saveRhythmCheck(feedback);
    assert.strictEqual(res.success, true, 'saveRhythmCheck should return success');

    const saved = getMockRhythmChecks();
    assert.strictEqual(saved.length, 1, 'Should have 1 saved rhythm check');
    assert.strictEqual(saved[0].outing_id, 'out-pottery-01');
    assert.strictEqual(saved[0].author_id, 'user-priya-1', 'author_id matches signed-in user');
    assert.strictEqual(saved[0].about_id, 'user-marcus-host', 'about_id matches peer');
    assert.strictEqual(saved[0].would_meet_again, 5);
    assert.strictEqual(saved[0].energy_read, 'as_expected');
    assert.strictEqual(saved[0].pace_read, 'as_expected');
    assert.strictEqual(saved[0].note, 'Great host, very welcoming atmosphere.');
  });

  it('2. saveOutingRecord saves actual attended UUID array and headline', async () => {
    const record: OutingRecordInput = {
      outing_id: 'out-pottery-01',
      headline: 'Discovered the quiet courtyard coffee shop.',
      attended: ['m1', 'r2', 'r3'],
    };

    const res = await saveOutingRecord(record);
    assert.strictEqual(res.success, true, 'saveOutingRecord should return success');

    const records = getMockOutingRecords();
    assert.strictEqual(records.length, 1, 'Should have 1 saved outing record');
    assert.strictEqual(records[0].outing_id, 'out-pottery-01');
    assert.strictEqual(records[0].headline, 'Discovered the quiet courtyard coffee shop.');
    assert.deepStrictEqual(records[0].attended, ['m1', 'r2', 'r3'], 'attended contains array of members who actually turned up');
  });

  it('3. Skipped peer responses leave no rhythm_checks entry', async () => {
    clearMockRhythmData();

    // User saves feedback for peer A, but skips peer B
    await saveRhythmCheck({
      outing_id: 'out-pottery-01',
      author_id: 'user-priya-1',
      about_id: 'peer-a',
      would_meet_again: 4,
    });

    const saved = getMockRhythmChecks();
    assert.strictEqual(saved.length, 1);
    assert.strictEqual(saved[0].about_id, 'peer-a');
    
    // Peer B was skipped so no entry exists for peer-b
    const peerBEntry = saved.find((r) => r.about_id === 'peer-b');
    assert.strictEqual(peerBEntry, undefined, 'Skipped peer must produce NO rhythm_checks row');
  });
});
