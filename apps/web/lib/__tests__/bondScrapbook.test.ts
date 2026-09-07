import {describe,it,expect,vi} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {BondScrapbook,bondTone,type BondNotes} from '../../components/BondScrapbook';
import {readFileSync} from 'fs';
import {resolve} from 'path';
vi.mock('next/font/google',()=>({Caveat:()=>({className:'handwriting'})}));
const notes:BondNotes={candidate:{id:'member-id',displayName:'Alex'},clickText:'Your connection explanation. Every original sentence remains.',rubText:'Your full friction explanation. With the important nuance.',threads:[{key:'personality',status:'known',headline:'A shared pace',phrase:'Full social-energy explanation.',mechanism:'alignment'},{key:'social_rhythm',status:'known',phrase:'Full planning difference.',mechanism:'friction'},{key:'emotional',status:'unknown'}],overall:{provisional:true},sharpen:[{questionId:'q',prompt:'Share more context',href:'/you/deeper'}]};
describe('Bond scrapbook',()=>{
 it('keeps complete bond explanations and links in native expandable notes',()=>{
  const html=renderToStaticMarkup(React.createElement(BondScrapbook,{notes}));
  for(const text of [notes.clickText,notes.rubText,'Full social-energy explanation.','Full planning difference.','/people/member-id','/you/deeper','An early read','<details','<summary','id="bond-personality"'])expect(html).toContain(text);
  expect(html.indexOf('Your bond at a glance')).toBeLessThan(html.indexOf('Thread by thread'));
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
