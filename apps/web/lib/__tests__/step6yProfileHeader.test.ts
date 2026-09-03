import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { BoundariesMatching } from '../../components/profile/BoundariesMatching';

const PROFILE_HERO_PATH = resolve(__dirname, '../../components/profile/ProfileHero.tsx');
const BOUNDARIES_PATH = resolve(__dirname, '../../components/profile/BoundariesMatching.tsx');
const YOU_PAGE_PATH = resolve(__dirname, '../../app/you/page.tsx');
const API_ME_READ_PATH = resolve(__dirname, '../../app/api/me/read/route.ts');
const PERSON_PAGE_PATH = resolve(__dirname, '../../app/people/[id]/page.tsx');
const REF_PROFILE_PATH = resolve(__dirname, '../../../../docs/reference/profile-reference.html');
const REF_BOND_PATH = resolve(__dirname, '../../../../docs/reference/bond-reference.html');

describe('Step 6y — Profile Header, Spacing, and Public Boundaries', () => {
  it('1. No fabricated defaults in ProfileHero and BoundariesMatching', () => {
    const heroSource = readFileSync(PROFILE_HERO_PATH, 'utf-8');
    expect(heroSource).not.toContain('passCompletionPct = 100');
    expect(heroSource).not.toContain("standingText = 'Good Standing'");

    const boundariesSource = readFileSync(BOUNDARIES_PATH, 'utf-8');
    const forbiddenDefaults = [
      'Flexible · Context-driven',
      'Context matters · 24h notice preferred',
      'Max 6 participants per table',
      'Singapore Central & East',
    ];
    for (const def of forbiddenDefaults) {
      expect(boundariesSource).not.toContain(def);
    }
  });

  it('2. Boundaries hides when empty', () => {
    const html = renderToStaticMarkup(React.createElement(BoundariesMatching, {}));
    expect(html).toBe('');
  });

  it('3. Third person works in BoundariesMatching', () => {
    const html = renderToStaticMarkup(
      React.createElement(BoundariesMatching, {
        voice: 'third',
        memberName: 'Mervyn',
        punctualityStance: 'On time',
      })
    );
    expect(html).toContain('Mervyn');
    expect(html).not.toContain('You ');
  });

  it('4. The header and restored sections are on the You page', () => {
    const youSource = readFileSync(YOU_PAGE_PATH, 'utf-8');
    expect(youSource).toContain('<ProfileHero');
    expect(youSource).toContain('<PassArcCanvas');
    expect(youSource).toContain('<BoundariesMatching');
    expect(youSource).toContain('<ConnectionNotes');
    expect(youSource).toContain('<SocialInstincts');
    expect(youSource).toContain('<TheInterestingPart');
  });

  it('5. The disclaimer is gone from the You page', () => {
    const youSource = readFileSync(YOU_PAGE_PATH, 'utf-8');
    expect(youSource).not.toContain('illustrative');
  });

  it('6. No signals fallback in /api/me/read', () => {
    const routeSource = readFileSync(API_ME_READ_PATH, 'utf-8');
    expect(routeSource).not.toContain('|| 34');
  });

  it('7. Boundaries is public on the member profile page', () => {
    const personSource = readFileSync(PERSON_PAGE_PATH, 'utf-8');
    expect(personSource).toContain('<BoundariesMatching');
    expect(personSource).toMatch(/<BoundariesMatching[\s\S]*?voice="third"/);
  });

  it('8. The reference is committed in docs/reference/', () => {
    expect(existsSync(REF_PROFILE_PATH)).toBe(true);
    expect(existsSync(REF_BOND_PATH)).toBe(true);
  });
});
