import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateAsymmetricFit } from '../asymmetric.ts';
import { DEMO_PROFILES } from '../../fixtures/demoProfiles.ts';
import { score } from '../engine.ts';

describe('Connection Intelligence Engine — Asymmetric Fit & Mechanisms', () => {
  it('1. Calculates FIT(A->B) and FIT(B->A) directional compatibility', () => {
    const pA = DEMO_PROFILES[0];
    const pB = DEMO_PROFILES[1];

    const matchRes = score(pA, pB);
    assert.ok('fit_a_to_b' in matchRes);
    assert.ok('fit_b_to_a' in matchRes);
    assert.ok('imbalance_penalty' in matchRes);

    if (matchRes.fit_a_to_b !== null && matchRes.fit_b_to_a !== null) {
      assert.strictEqual(typeof matchRes.fit_a_to_b, 'number');
      assert.strictEqual(typeof matchRes.fit_b_to_a, 'number');
      assert.ok(matchRes.fit_a_to_b >= 0 && matchRes.fit_a_to_b <= 1);
      assert.ok(matchRes.fit_b_to_a >= 0 && matchRes.fit_b_to_a <= 1);
    }
  });

  it('2. Asymmetric expectation gap creates imbalance penalty', () => {
    const pA = JSON.parse(JSON.stringify(DEMO_PROFILES[0]));
    const pB = JSON.parse(JSON.stringify(DEMO_PROFILES[1]));

    pA.communication.contact_frequency_expect = 1.0; // A expects daily
    pB.communication.contact_frequency_self = 1.0;   // B delivers daily
    pB.communication.contact_frequency_expect = 0.2; // B expects weekly
    pA.communication.contact_frequency_self = 0.9;   // A messages frequently

    const asym = calculateAsymmetricFit(pA, pB, 0.8);
    assert.ok(asym.imbalance > 0, 'Asymmetric communication gap produces positive imbalance penalty');
    assert.ok(asym.fitAtoB! > asym.fitBtoA!, 'A is more satisfied with B than B is with A');
  });
});
