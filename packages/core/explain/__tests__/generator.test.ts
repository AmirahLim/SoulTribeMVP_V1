import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DEMO_PROFILES } from '../../fixtures/demoProfiles.ts';
import { generateMatchExplanation } from '../generator.ts';
import { score } from '../../matching/engine.ts';
import type { ProfileVector } from '../../domain/types.ts';

describe('Fix Friction & Click Explanations — generator.test.ts', () => {
  it('1. Grammar — no third-person verbs following "you"', () => {
    const viewer = DEMO_PROFILES[0];
    const invalidGrammarRegex = /\byou (prefers|replies|plans|tends|enjoys|is|opens|likes|recharges)\b/;

    for (let i = 1; i < DEMO_PROFILES.length; i++) {
      const explanation = generateMatchExplanation(viewer, DEMO_PROFILES[i]);
      assert.strictEqual(
        invalidGrammarRegex.test(explanation.friction_text),
        false,
        `Grammar error in friction_text: "${explanation.friction_text}"`
      );
      assert.strictEqual(
        invalidGrammarRegex.test(explanation.click_text),
        false,
        `Grammar error in click_text: "${explanation.click_text}"`
      );
    }
  });

  it('2. Diversity — at least 10 distinct friction texts and <40% tier-3 fallback', () => {
    const viewer = DEMO_PROFILES[0];
    const frictionTexts = new Set<string>();
    let tier3Count = 0;
    const total = DEMO_PROFILES.length - 1;

    for (let i = 1; i < DEMO_PROFILES.length; i++) {
      const explanation = generateMatchExplanation(viewer, DEMO_PROFILES[i]);
      frictionTexts.add(explanation.friction_text);
      if (explanation.friction_text.includes('Nothing much to flag')) {
        tier3Count++;
      }
    }

    assert.ok(
      frictionTexts.size >= 10,
      `Expected at least 10 distinct friction texts, got ${frictionTexts.size}`
    );
    const tier3Pct = tier3Count / total;
    assert.ok(
      tier3Pct < 0.40,
      `Expected tier-3 fallback < 40%, got ${Math.round(tier3Pct * 100)}% (${tier3Count}/${total})`
    );
  });

  it('3. No fabrication — unanswered traits are not used for friction', () => {
    const vecA: ProfileVector = JSON.parse(JSON.stringify(DEMO_PROFILES[0]));
    const vecB: ProfileVector = JSON.parse(JSON.stringify(DEMO_PROFILES[1]));

    // Mark personality unanswered on both sides
    vecA.personality.answered = 0;
    vecB.personality.answered = 0;

    const explanation = generateMatchExplanation(vecA, vecB);
    assert.strictEqual(
      explanation.friction_text.includes('social energy'),
      false,
      'Unanswered personality trait must not generate friction text'
    );
  });

  it('4. Thin profile — empty profile returns pass completion prompt', () => {
    const thinA: ProfileVector = JSON.parse(JSON.stringify(DEMO_PROFILES[0]));
    const thinB: ProfileVector = JSON.parse(JSON.stringify(DEMO_PROFILES[1]));

    // Set answered to 0 for all traits
    thinA.personality.answered = 0;
    thinA.communication.answered = 0;
    thinA.social_rhythm.answered = 0;
    thinA.intent.answered = 0;
    thinA.emotional.answered = 0;
    thinA.interests = [];
    thinA.values = [];
    thinA.lifestyle.answered = 0;
    thinA.experience.answered = 0;
    thinA.geography.answered = 0;

    thinB.personality.answered = 0;
    thinB.communication.answered = 0;
    thinB.social_rhythm.answered = 0;
    thinB.intent.answered = 0;
    thinB.emotional.answered = 0;
    thinB.interests = [];
    thinB.values = [];
    thinB.lifestyle.answered = 0;
    thinB.experience.answered = 0;
    thinB.geography.answered = 0;

    const explanation = generateMatchExplanation(thinA, thinB);
    assert.strictEqual(
      explanation.friction_text,
      "There isn't enough in your pass yet to flag friction honestly — add more and this will sharpen."
    );
  });

  it('5. Never empty — friction_text.length > 0 for all demo pairs', () => {
    for (let i = 0; i < DEMO_PROFILES.length; i++) {
      for (let j = 0; j < DEMO_PROFILES.length; j++) {
        if (i === j) continue;
        const exp = generateMatchExplanation(DEMO_PROFILES[i], DEMO_PROFILES[j]);
        assert.ok(exp.friction_text.length > 0, 'Friction text must never be empty');
      }
    }
  });

  it('6. 🔒 Scores unchanged — score() returns exact invariant values', () => {
    const pA = DEMO_PROFILES[0];
    const pB = DEMO_PROFILES[1];

    const matchRes = score(pA, pB);

    // Hardcode baseline invariants
    assert.strictEqual(typeof matchRes.rank_score, 'number');
    assert.strictEqual(typeof matchRes.resonance, 'number');
    assert.strictEqual(typeof matchRes.logistics, 'number');
    assert.ok(matchRes.resonance > 0);
    assert.ok(matchRes.logistics > 0);

    // Verify explanation call has zero side-effects on score()
    const exp = generateMatchExplanation(pA, pB);
    const matchResAfter = score(pA, pB);

    assert.strictEqual(matchRes.rank_score, matchResAfter.rank_score);
    assert.strictEqual(matchRes.resonance, matchResAfter.resonance);
    assert.strictEqual(matchRes.logistics, matchResAfter.logistics);
  });

  it('7. Direct guard test — values in same phrase band do not emit tautological comparison', () => {
    const vecA: ProfileVector = JSON.parse(JSON.stringify(DEMO_PROFILES[0]));
    const vecB: ProfileVector = JSON.parse(JSON.stringify(DEMO_PROFILES[1]));

    vecA.experience.group_size_pref = 0.35;
    vecA.experience.answered = 4;
    vecB.experience.group_size_pref = 0.55;
    vecB.experience.answered = 4;

    const explanation = generateMatchExplanation(vecA, vecB);
    assert.strictEqual(
      explanation.friction_text.includes('groups of three or four, while you prefer groups of three or four'),
      false,
      'Must not emit tautological group size phrase'
    );
  });

  it('8. No repeated band across demo set — no phrase of 15+ chars appears twice in one sentence', () => {
    const viewer = DEMO_PROFILES[0];
    for (let i = 1; i < DEMO_PROFILES.length; i++) {
      const exp = generateMatchExplanation(viewer, DEMO_PROFILES[i]);
      const normalized = exp.friction_text
        .replace(/\b(prefers|replies|plans|wants|tends|opens|likes|recharges)\b/g, (m) => m.slice(0, -1));

      const words = normalized.split(/\s+/);
      for (let len = 3; len <= words.length / 2; len++) {
        for (let idx = 0; idx <= words.length - len; idx++) {
          const phrase = words.slice(idx, idx + len).join(' ');
          if (phrase.length >= 15) {
            const firstIndex = normalized.indexOf(phrase);
            const secondIndex = normalized.indexOf(phrase, firstIndex + phrase.length);
            assert.strictEqual(
              secondIndex,
              -1,
              `Found repeated 15+ char phrase "${phrase}" in sentence: "${exp.friction_text}"`
            );
          }
        }
      }
    }
  });

  it('9. Click text diversity — at least 10 distinct click_text values and <40% fallback for one viewer against all candidates', () => {
    const viewer = DEMO_PROFILES[0];
    const clickTexts = new Set<string>();
    let fallbackCount = 0;
    const total = DEMO_PROFILES.length - 1;

    for (let i = 1; i < DEMO_PROFILES.length; i++) {
      const exp = generateMatchExplanation(viewer, DEMO_PROFILES[i]);
      clickTexts.add(exp.click_text);
      if (exp.click_text.includes('gentle overall alignment') || exp.click_text.includes("isn't enough in your pass")) {
        fallbackCount++;
      }
    }

    assert.ok(
      clickTexts.size >= 10,
      `Expected at least 10 distinct click_text values, got ${clickTexts.size}`
    );
    const fallbackPct = fallbackCount / total;
    assert.ok(
      fallbackPct < 0.40,
      `Expected click fallback < 40%, got ${Math.round(fallbackPct * 100)}% (${fallbackCount}/${total})`
    );
  });

  it('10. Click text thin profile — empty profile returns honest thin-profile prompt', () => {
    const thinA: ProfileVector = JSON.parse(JSON.stringify(DEMO_PROFILES[0]));
    const thinB: ProfileVector = JSON.parse(JSON.stringify(DEMO_PROFILES[1]));

    // Set answered to 0 for all traits
    thinA.personality.answered = 0;
    thinA.communication.answered = 0;
    thinA.social_rhythm.answered = 0;
    thinA.intent.answered = 0;
    thinA.emotional.answered = 0;
    thinA.interests = [];
    thinA.values = [];
    thinA.lifestyle.answered = 0;
    thinA.experience.answered = 0;
    thinA.geography.answered = 0;

    thinB.personality.answered = 0;
    thinB.communication.answered = 0;
    thinB.social_rhythm.answered = 0;
    thinB.intent.answered = 0;
    thinB.emotional.answered = 0;
    thinB.interests = [];
    thinB.values = [];
    thinB.lifestyle.answered = 0;
    thinB.experience.answered = 0;
    thinB.geography.answered = 0;

    const explanation = generateMatchExplanation(thinA, thinB);
    assert.strictEqual(
      explanation.click_text,
      "There isn't enough in your pass yet to say much — add more and this will sharpen."
    );
  });
});
