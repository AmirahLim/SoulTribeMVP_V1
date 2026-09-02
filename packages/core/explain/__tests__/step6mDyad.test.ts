import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateMatchExplanation } from '../generator.ts';
import { extractMarkers } from '../markers.ts';
import { composeDyad, DYADIC_RULES } from '../dyad.ts';
import { LEVEL_5_BLOCKED_TERMS } from '../blocklist.ts';
import type { ProfileVector, OnboardingAnswers } from '../../domain/types.ts';

describe('Step 6n — The Compositional Interpretation Layer', () => {
  const marcus: ProfileVector = {
    profile: {
      id: 'marcus',
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
    answers: {
      q3GroupSize: '1-on-1',
      q4Social: 'Low-maintenance - no pressure to reply fast',
      q5PlanningRhythm: 'Planned - a week or two in advance',
      q7Trust: 'Observant first - I take time to build trust',
    },
    personality: {
      user_id: 'marcus',
      extraversion: 0.3,
      conscientiousness: 0.7,
      answered: 2,
    },
    social_rhythm: {
      user_id: 'marcus',
      planning_horizon: 0.8,
      answered: 1,
    },
    communication: {
      user_id: 'marcus',
      contact_frequency_self: 0.3,
      response_speed_self: 0.3,
      answered: 2,
    },
    intent: {
      user_id: 'marcus',
      depth: 0.8,
      answered: 1,
    },
  };

  const amirah: ProfileVector = {
    profile: {
      id: 'amirah',
      handle: 'amirah',
      display_name: 'Amirah',
      home_area: 'Tanjong Pagar',
      birth_year: 1994,
      age_pref_min: 24,
      age_pref_max: 38,
      profile_version: 1,
      confidence: 0.8,
      tier: 'free',
      status: 'active',
    },
    answers: {
      q3GroupSize: '1-on-1',
      q4Social: 'Deep conversations every few weeks',
      q5PlanningRhythm: 'Spontaneous - same day or day before',
      q7Trust: 'Observant first - I take time to build trust',
    },
    communication: {
      user_id: 'amirah',
      contact_frequency_self: 0.5, // scalar > 0.4, but raw answer gives low-contact!
      answered: 1,
    },
    intent: {
      user_id: 'amirah',
      depth: 0.8,
      answered: 1,
    },
  };

  const partner2: ProfileVector = {
    profile: {
      id: 'partner2',
      handle: 'p2',
      display_name: 'David',
      home_area: 'Tampines',
      birth_year: 1990,
      age_pref_min: 24,
      age_pref_max: 38,
      profile_version: 1,
      confidence: 0.8,
      tier: 'free',
      status: 'active',
    },
    social_rhythm: {
      user_id: 'partner2',
      planning_horizon: 0.8,
      answered: 1,
    },
    personality: {
      user_id: 'partner2',
      extraversion: 0.8,
      answered: 1,
    },
    communication: {
      user_id: 'partner2',
      contact_frequency_self: 0.8,
      answered: 1,
    },
  };

  it('1. The quiet-week rule fires for Marcus × Amirah (Regression Test for Fix 1 & 2)', () => {
    const explanation = generateMatchExplanation(marcus, amirah);
    assert.ok(
      explanation.click_text.includes('Neither of you will read a quiet week as rejection'),
      `Quiet week rule must fire for Marcus x Amirah, got click_text: "${explanation.click_text}"`
    );
  });

  it('2. Dyadic output is preferred over bare per-thread enumeration for well-answered pair', () => {
    const exp = generateMatchExplanation(marcus, amirah);
    assert.ok(exp.dyadic_statements && exp.dyadic_statements.length > 0, 'Must produce dyadic statements');
    assert.strictEqual(exp.click_text.startsWith('Overlap with'), false, 'Dyadic statement must be preferred over bare enumeration');
  });

  it('3. The same person reads differently with different partners', () => {
    const exp1 = generateMatchExplanation(marcus, amirah);
    const exp2 = generateMatchExplanation(marcus, partner2);

    assert.notStrictEqual(exp1.click_text, exp2.click_text);
  });

  it('4. Combination rules fire ONLY on full matches', () => {
    const mMarcus = extractMarkers(marcus, marcus.answers);
    const mAmirah = extractMarkers(amirah, amirah.answers);
    const statementsFull = composeDyad(mMarcus, mAmirah, 'Marcus', 'Amirah');

    const hasQuietWeek = statementsFull.some((s) => s.id === 'dyad-quiet-week-alignment');
    assert.strictEqual(hasQuietWeek, true, 'Rule must fire when all markers match');

    const mAmirahIncomplete = mAmirah.filter((m) => m.key !== 'low-contact');
    const statementsIncomplete = composeDyad(mMarcus, mAmirahIncomplete, 'Marcus', 'Amirah');
    const hasQuietWeekIncomplete = statementsIncomplete.some((s) => s.id === 'dyad-quiet-week-alignment');
    assert.strictEqual(hasQuietWeekIncomplete, false, 'Rule must NOT fire when 1 required marker is missing');
  });

  it('5. Evidence levels hold (level <= 4 for all statements)', () => {
    const exp = generateMatchExplanation(marcus, amirah);
    if (exp.dyadic_statements) {
      exp.dyadic_statements.forEach((stmt) => {
        assert.ok(stmt.level >= 1 && stmt.level <= 4, `Statement ${stmt.id} level must be between 1 and 4`);
      });
    }
  });

  it('6. Level 5 blocklist enforced against term list', () => {
    const exp1 = generateMatchExplanation(marcus, amirah);
    const exp2 = generateMatchExplanation(marcus, partner2);

    const allTexts = [
      exp1.click_text,
      exp1.friction_text,
      exp1.headline || '',
      exp2.click_text,
      exp2.friction_text,
      exp2.headline || '',
    ].join(' ').toLowerCase();

    LEVEL_5_BLOCKED_TERMS.forEach((term) => {
      assert.strictEqual(allTexts.includes(term), false, `Output must not contain blocked term: "${term}"`);
    });
  });

  it('7. Unanswered questions produce no markers', () => {
    const emptyVec: ProfileVector = {
      profile: {
        id: 'empty',
        handle: 'empty',
        display_name: 'Empty',
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
    assert.strictEqual(markers.length, 0);
  });

  it('8. Traceability — every emitted statement carries non-empty sources', () => {
    const exp = generateMatchExplanation(marcus, amirah);
    if (exp.dyadic_statements) {
      exp.dyadic_statements.forEach((stmt) => {
        assert.ok(Array.isArray(stmt.sources) && stmt.sources.length > 0, `Statement ${stmt.id} must carry non-empty sources array`);
      });
    }
  });

  it('9. No percentage compatibility score appears in headline or text', () => {
    const exp = generateMatchExplanation(marcus, amirah);
    const fullOutput = `${exp.headline} ${exp.click_text} ${exp.friction_text}`;
    assert.strictEqual(/\d+%/.test(fullOutput), false, 'No percentage compatibility figure may appear in output');
  });
});
