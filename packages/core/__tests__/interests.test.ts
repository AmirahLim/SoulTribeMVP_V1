import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  ONBOARDING_INTEREST_OPTIONS,
  ONBOARDING_INTEREST_NODES,
  resolveInterestNodeId,
} from '../domain/interests.ts';

describe('Interest Nodes & Onboarding Alignment', () => {
  it('1. ONBOARDING_INTEREST_OPTIONS contains exactly 15 onboarding options', () => {
    assert.strictEqual(ONBOARDING_INTEREST_OPTIONS.length, 15);
  });

  it('2. Every onboarding Q6 option resolves to a non-null node id', () => {
    for (const option of ONBOARDING_INTEREST_OPTIONS) {
      const nodeId = resolveInterestNodeId(option);
      assert.notStrictEqual(
        nodeId,
        null,
        `Expected onboarding option '${option}' to resolve to a node id, but got null.`
      );
      assert.strictEqual(
        typeof nodeId,
        'number',
        `Expected node id for '${option}' to be a number, got ${typeof nodeId}`
      );
      assert.ok(nodeId! > 0, `Expected node id for '${option}' to be > 0, got ${nodeId}`);
    }
  });

  it('3. Every interest node has valid parent_id, path, and non-empty name', () => {
    for (const node of ONBOARDING_INTEREST_NODES) {
      assert.ok(node.id > 0, `Invalid node id: ${node.id}`);
      assert.ok(node.parentId > 0, `Invalid parentId for node ${node.id}`);
      assert.ok(node.name.length > 0, `Empty name for node ${node.id}`);
      assert.ok(node.path.includes('.'), `Path for node ${node.id} must be ltree format: ${node.path}`);
    }
  });
});
