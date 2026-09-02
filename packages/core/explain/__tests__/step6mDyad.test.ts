import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateMatchExplanation } from '../generator.ts';
import { extractMarkers } from '../markers.ts';
import { composeDyad } from '../dyad.ts';
import { LEVEL_5_BLOCKED_TERMS } from '../blocklist.ts';
import type { ProfileVector } from '../../domain/types.ts';

describe('Step 6m — The Compositional Interpretation Layer', () => {
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
    personality: {
      user_id: 'marcus',
      extraversion: 0.3, // socially-selective
      conscientiousness: 0.7, // structured-routine
      answered: 2,
    },
    social_rhythm: {
      user_id: 'marcus',
      planning_horizon: 0.8, // advance-planning
      answered: 1,
    },
    communication: {
      user_id: 'marcus',
      contact_frequency_self: 0.3, // low-contact
      response_speed_self: 0.3, // async-pacer
      answered: 2,
    },
    intent: {
      user_id: 'marcus',
      depth: 0.8, // depth-oriented
      answered: 1,
    },
  };

  const partner1: ProfileVector = {
    profile: {
      id: 'partner1',
      handle: 'p1',
      display_name: 'Chloe',
      home_area: 'Novena',
      birth_year: 1993,
      age_pref_min: 24,
      age_pref_max: 38,
      profile_version: 1,
      confidence: 0.8,
      tier: 'free',
      status: 'active',
    },
    social_rhythm: {
      user_id: 'partner1',
      planning_horizon: 0.2, // spontaneous
      answered: 1,
    },
    personality: {
      user_id: 'partner1',
      extraversion: 0.3, // socially-selective
      answered: 1,
    },
    communication: {
      user_id: 'partner1',
      contact_frequency_self: 0.3, // low-contact
      answered: 1,
    },
    intent: {
      user_id: 'partner1',
      depth: 0.8, // depth-oriented
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
      planning_horizon: 0.8, // advance-planning (same as Marcus!)
      answered: 1,
    },
    personality: {
      user_id: 'partner2',
      extraversion: 0.8, // socially-expansive
      answered: 1,
    },
    communication: {
      user_id: 'partner2',
      contact_frequency_self: 0.8, // frequent-touchpoints
      answered: 1,
    },
  };

  const partner3: ProfileVector = {
    profile: {
      id: 'partner3',
      handle: 'p3',
      display_name: 'Sarah',
      home_area: 'Bishan',
      birth_year: 1994,
      age_pref_min: 24,
      age_pref_max: 38,
      profile_version: 1,
      confidence: 0.8,
      tier: 'free',
      status: 'active',
    },
    social_rhythm: {
      user_id: 'partner3',
      planning_horizon: 0.2, // spontaneous
      answered: 1,
    },
    communication: {
      user_id: 'partner3',
      contact_frequency_self: 0.3, // low-contact
      answered: 1,
    },
  };

  it('1. The same person reads differently with 3 different partners', () => {
    const exp1 = generateMatchExplanation(marcus, partner1);
    const exp2 = generateMatchExplanation(marcus, partner2);
    const exp3 = generateMatchExplanation(marcus, partner3);

    // Assert all 3 readings differ in substance
    assert.notStrictEqual(exp1.click_text, exp2.click_text);
    assert.notStrictEqual(exp1.click_text, exp3.click_text);
    assert.notStrictEqual(exp2.click_text, exp3.click_text);

    // Assert planning-friction sentence appears for partner 1 (spontaneous) and not partner 2 (advance-planning)
    assert.ok(exp1.friction_text.includes('planning') || exp1.friction_text.includes('calendar') || exp1.friction_text.includes('plans'));
    assert.strictEqual(exp2.friction_text.includes('planning rhythms'), false);
  });

  it('2. Combination rules fire ONLY on full matches', () => {
    // Marcus + Partner 1 have: socially-selective + low-contact on both sides
    const mMarcus = extractMarkers(marcus);
    const mP1 = extractMarkers(partner1);
    const statementsFull = composeDyad(mMarcus, mP1, 'Marcus', 'Chloe');

    const hasQuietWeek = statementsFull.some((s) => s.id === 'dyad-quiet-week-alignment');
    assert.strictEqual(hasQuietWeek, true, 'Rule must fire when all markers match');

    // Remove 1 required marker from Partner 1 (e.g. remove low-contact)
    const mP1Incomplete = mP1.filter((m) => m.key !== 'low-contact');
    const statementsIncomplete = composeDyad(mMarcus, mP1Incomplete, 'Marcus', 'Chloe');
    const hasQuietWeekIncomplete = statementsIncomplete.some((s) => s.id === 'dyad-quiet-week-alignment');
    assert.strictEqual(hasQuietWeekIncomplete, false, 'Rule must NOT fire when 1 required marker is missing');
  });

  it('3. Evidence levels hold (level <= 4 for all statements)', () => {
    const exp = generateMatchExplanation(marcus, partner1);
    if (exp.dyadic_statements) {
      exp.dyadic_statements.forEach((stmt) => {
        assert.ok(stmt.level >= 1 && stmt.level <= 4, `Statement ${stmt.id} level must be between 1 and 4`);
      });
    }
  });

  it('4. Level 5 blocklist enforced against term list', () => {
    const exp1 = generateMatchExplanation(marcus, partner1);
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

  it('5. Unanswered questions produce no markers', () => {
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

  it('6. Traceability — every emitted statement carries non-empty sources', () => {
    const exp = generateMatchExplanation(marcus, partner1);
    if (exp.dyadic_statements) {
      exp.dyadic_statements.forEach((stmt) => {
        assert.ok(Array.isArray(stmt.sources) && stmt.sources.length > 0, `Statement ${stmt.id} must carry non-empty sources array`);
      });
    }
  });

  it('7. No percentage compatibility score appears in headline or text', () => {
    const exp = generateMatchExplanation(marcus, partner1);
    const fullOutput = `${exp.headline} ${exp.click_text} ${exp.friction_text}`;
    assert.strictEqual(/\d+%/.test(fullOutput), false, 'No percentage compatibility figure may appear in output');
  });
});
