import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lifeContextBoost } from './lifeContext.ts';
test('life phase is a bounded positive preference, never a mismatch penalty', () => {
 assert.equal(lifeContextBoost(undefined,['Slow Living']),0);
 assert.equal(lifeContextBoost([],[]),0);
 assert.equal(lifeContextBoost(['Slow Living'],['Family Life']),0);
 assert.equal(lifeContextBoost(['Slow Living'],['Slow Living']),.03);
 assert.equal(lifeContextBoost(['Slow Living','Family Life'],['Slow Living']),.015);
});
