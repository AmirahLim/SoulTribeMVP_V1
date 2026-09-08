import {describe,it,expect} from 'vitest';
import {buildEvidence,pairEvidence} from '../readEngine/evidence';
import {composeRead,validateClaim} from '../readEngine/compose';
import {includeMeasurements} from '../readEngine/legacy';
import {rosterReadings} from '../readEngine/roster';
import {pairClaims} from '../readEngine/relational';
import {selfSocialPages} from '../socialScrapbook';

// Isolated contracts, never member records or production seed data.
const fixed=(contact:string,intent='Close circle')=>({onboarding:{baselineV2:{intent:[intent],connectionChoice:contact,planningChoice:'About a week',groupChoices:['Small circle'],clicks:['We actually make plans happen'],desiredQualities:['Reliable'],outings:['Nature & Hiking']}},deep_profile:{idealSaturday:'Exploring',spontaneousTrip:'Not without itinerary'}});
describe('evidence-grounded reading depth',()=>{
 it('restores seven presentation positions with honest empty notes, never padded claims',()=>{
  const composedRead=composeRead(buildEvidence({},'profile'));
  const pages=selfSocialPages({composedRead,threads:[],values:[],interests:[]});
  expect(pages.map(p=>p.key)).toEqual(['social','connect','bring','best','friction','doing','between']);
  expect(pages.every(p=>p.notes.length===0)).toBe(true);
 });
 it('changes the behavioural interpretation when a second relevant answer changes',()=>{
  const a=composeRead(buildEvidence(fixed('Every couple of weeks'),'profile'));
  const b=composeRead(buildEvidence(fixed('A few times a week'),'profile'));
  expect(a.sections.find(s=>s.key==='social')?.text).toContain('breathing room');
  expect(b.sections.find(s=>s.key==='social')?.text).toContain('continuity');
  for(const r of [a,b])expect(r.sections.every(s=>s.claims.every(c=>c.sourceIds.length>0))).toBe(true);
 });
 it('bridges only actually recorded extreme numeric measurements, without reconstructing answers',()=>{
  const empty=buildEvidence({},'profile');
  const b=includeMeasurements(empty,{trait_communication:{answered:1,contact_frequency_self:0,initiation_self:.5},trait_emotional:{answered:1,er_opening_pace:1}});
  expect(b.sources).toHaveLength(1);
  expect(b.sources[0].questionVersion).toBeNull();
  expect(b.sources[0].selections).toEqual(['0']);
  expect(b.sources[0].questionId).toMatch(/^measurement\./);
  expect(composeRead(b).sections[0].text).toContain('earlier saved measurement');
  expect(includeMeasurements(empty,{trait_communication:{answered:0,contact_frequency_self:1}}).sources).toEqual([]);
 });
 it('prefers fixed answers to an older numeric summary of the same thread',()=>{
  const b=buildEvidence(fixed('Every couple of weeks'),'profile');
  expect(includeMeasurements(b,{trait_communication:{answered:1,contact_frequency_self:1}}).sources).toEqual(b.sources);
 });
 it('uses both people for every relational claim; shared interests are not friction',()=>{
  const b=pairEvidence(fixed('Every couple of weeks'),fixed('Every couple of weeks'));
  const claims=pairClaims(b);
  expect(claims.length).toBeGreaterThan(2);
  expect(claims.every(c=>validateClaim(c,b))).toBe(true);
  expect(claims.some(c=>c.tone==='friction')).toBe(false);
  expect(claims.map(c=>c.text).join(' ')).not.toMatch(/Your “|with a difference|perfect|destined/);
 });
 it('selects different supported emphases across a roster and stays deterministic',()=>{
  const viewer=fixed('Every couple of weeks');
  const bundles=new Map(['Every couple of weeks','A few times a week','Weeks/Months can pass, we’re still good'].map((contact,i)=>[String(i),pairEvidence(viewer,fixed(contact,i===2?'New perspectives':'Close circle'))]));
  const first=rosterReadings(bundles);
  expect(first).toEqual(rosterReadings(bundles));
  expect(new Set([...first.values()].map(r=>r.click_text)).size).toBe(3);
  expect(first.get('0')?.friction_text).toContain('No specific friction');
  expect(first.get('1')?.friction_text).not.toContain('No specific friction');
 });
 it('never lets private repair or emotional operands enter a pre-outing pair',()=>{
  const a=fixed('Every couple of weeks');Object.assign(a.deep_profile,{repairFirst:'Name it directly',supportStyle:'Listen'});
  const b=pairEvidence(a,a,false);
  expect(b.sources.some(s=>s.access==='shared-detail')).toBe(false);
 });
});
