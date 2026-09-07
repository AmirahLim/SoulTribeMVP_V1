import {describe, it, expect, vi} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MatchKeepsake} from '../../components/MatchKeepsake';
import {readFileSync} from 'fs';
import {resolve} from 'path';
vi.mock('next/font/google', () => ({Caveat: () => ({className: 'handwritten'})}));
describe('Match keepsakes', () => {
  const person = {id:'member-id', name:'Alex', avatarUrl:'/alex.jpg', clickText:'The complete connection explanation.', rubText:'A real difference worth considering.', fitLabel:'Some Resonance'};
  it('retains the member photo, name, complete explanation and both destinations', () => {
    const html = renderToStaticMarkup(React.createElement(MatchKeepsake, {person}));
    for (const text of ['/alex.jpg','Alex','Why you might click','Potential friction',person.clickText,person.rubText,person.fitLabel,'View Connection','View Profile','href="/people/member-id/bond"','href="/people/member-id"']) expect(html).toContain(text);
    expect(html).not.toMatch(/<a\b[^>]*>(?:(?!<\/a>)[\s\S])*<a\b/);
  });
  it('never substitutes a strangers photo or fabricates resonance', () => {
    const html = renderToStaticMarkup(React.createElement(MatchKeepsake, {person:{...person, avatarUrl:undefined,fitLabel:undefined,rubText:undefined}}));
    expect(html).not.toContain('<img');
    expect(html).not.toContain('Some Resonance');
    expect(html).toContain('No profile photo');
    expect(html).toContain('enough shared information');
  });
  it('keeps early-read and demo indicators', () => {
    const html = renderToStaticMarkup(React.createElement(MatchKeepsake, {person:{...person,provisional:true,isDemo:true}}));
    expect(html).toContain('Demo'); expect(html).toContain('Early read');
  });
  it('uses one consistent component on Home and People', () => {
    for (const page of ['home','people']) expect(readFileSync(resolve(__dirname, `../../app/${page}/page.tsx`),'utf8')).toContain('<MatchKeepsake');
  });
});
