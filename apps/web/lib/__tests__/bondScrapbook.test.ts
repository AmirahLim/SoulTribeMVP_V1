import {describe,it,expect,vi} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {BondScrapbook,bondTone,bondObjects,type BondNotes} from '../../components/BondScrapbook';
import {composeRead} from '../readEngine/compose';
import {pairEvidence} from '../readEngine/evidence';
import {readFileSync} from 'fs';
import {resolve} from 'path';
vi.mock('next/font/google',()=>({Caveat:()=>({className:'handwriting'})}));
const notes:BondNotes={candidate:{id:'member-id',displayName:'Alex'},clickText:'Your connection explanation. Every original sentence remains.',rubText:'Your full friction explanation. With the important nuance.',threads:[{key:'personality',status:'known',headline:'A shared pace',phrase:'Full social-energy explanation.',mechanism:'alignment'},{key:'social_rhythm',status:'known',phrase:'Full planning difference.',mechanism:'friction'},{key:'emotional',status:'unknown'}],overall:{provisional:true},sharpen:[{questionId:'q',prompt:'Share more context',href:'/you/deeper'}]};
describe('Bond scrapbook',()=>{
 it('keeps complete bond explanations and links in native expandable notes',()=>{
  const html=renderToStaticMarkup(React.createElement(BondScrapbook,{notes}));
  for(const text of [notes.rubText,'Full social-energy explanation.','Full planning difference.','/people/member-id','/you/deeper','An early read','<details','<summary','id="bond-personality"'])expect(html).toContain(text);
  expect(html).not.toContain(notes.clickText);
  expect(html).not.toContain('Your bond at a glance');
  expect(html).not.toContain('Read your letter');
  expect(html).toContain('Read the full connection summary');
  expect(html).toContain('Show less');
  expect(html).toContain('View Connection');
  expect(html).not.toContain('The space between you');
  expect(html).not.toContain('Turning intention into time'); // Removed generic synthesis.
  expect(html).not.toContain('/images/connection-thread.png');
  expect(html).not.toContain('/images/brown-thread-photo.jpg');
  expect(html).not.toContain('<img');
  expect(html).toContain('viewBox="0 0 32 300"');
  expect(html).toContain('viewBox="0 0 700 64"');
  expect(html).not.toContain('<details open');
  expect(html).toContain('There is not enough shared evidence for a composed reading yet.');
 });
 it('renders source-composed sections rather than generic thread synthesis',()=>{
  // Isolated display contract, not member data.
  const self={onboarding:{baselineV2:{planningChoice:'A few days',intent:['Close circle']}}};
  const other={onboarding:{baselineV2:{planningChoice:'Same day is fine',intent:['Close circle']}}};
  const composedRead=composeRead(pairEvidence(self,other));
  expect(composedRead.sections.length).toBeGreaterThan(0);
  const html=renderToStaticMarkup(React.createElement(BondScrapbook,{notes:{...notes,composedRead}}));
  expect(html).toContain(composedRead.sections[0].title);
  expect(html).toContain('What this reading draws on');
  expect(html).not.toContain('There is not enough shared evidence');
  expect(composeRead(pairEvidence({},{})).sections).toEqual([]);
 });
 it('gives every thread a distinct object, material and opening instruction',()=>{
  const objects=Object.values(bondObjects);
  expect(new Set(objects.map(o=>o.object)).size).toBe(12);
  expect(new Set(objects.map(o=>o.tile)).size).toBe(12);
  expect(new Set(objects.map(o=>o.action)).size).toBe(12);
  const allNotes={...notes,threads:Object.keys(bondObjects).map(key=>({key,status:'known' as const,phrase:`Complete reading for ${key}`}))};
  const html=renderToStaticMarkup(React.createElement(BondScrapbook,{notes:allNotes}));
  for(const o of objects){expect(html).toContain(`data-object="${o.object}"`);expect(html).toContain(o.action);}
  for(const key of Object.keys(bondObjects))expect(html).toContain(`Complete reading for ${key}`);
 });
 it('does not turn unknown information into alignment or invent unmeasured details',()=>{
  expect(bondTone({key:'x',status:'unknown',mechanism:'alignment'}).label).toBe('Still taking shape');
  const html=renderToStaticMarkup(React.createElement(BondScrapbook,{notes}));
  expect(html).toContain('Conflict &amp; Repair');expect(html).toContain('Social Initiative');expect(html).toContain('Not yet measured');
  expect(html).not.toContain('Specialty coffee');
 });
 it('preserves authentication, retry and safety controls on the route',()=>{
  const page=readFileSync(resolve(__dirname,'../../app/people/[id]/bond/page.tsx'),'utf8');
  for(const text of ['<AuthGuard>','Authorization:','AbortController','Try again','<SafetyActions','<BondScrapbook notes={notes}'])expect(page).toContain(text);
 });
});
