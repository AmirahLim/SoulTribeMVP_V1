import {describe,it,expect,vi} from 'vitest';
import {getMatchExplanations,explanationInputHash,EXPLANATION_ENGINE_VERSION} from '../matchExplanationCache';
import {toProfileVector} from '../profileAdapter';
import {generateMatchExplanation} from '@soul-tribe/core';
import catalog from '../onboardingQuestionCatalog.json';
import {INTENTS,CLICKS,GROUPS,FRIEND_QUALITIES,OUTINGS,ACTIVE_RHYTHM} from '../sixQuestionOnboarding';
import {LIFE_CONTEXTS} from '../lifeContext';
vi.mock('@soul-tribe/core',async(original)=>{
 const core=await original<typeof import('@soul-tribe/core')>();
 return {...core,generateMatchExplanation:vi.fn(core.generateMatchExplanation)};
});
function input(id:string,revision=0) {
 return {row:{id,profile_version:1,explanation_revision:revision},
 vector:toProfileVector({displayName:id} as any,id)};
}
function database() {
 const rows:any[]=[];
 const state={readError:null as any,writeError:null as any};
 const client={from:vi.fn(()=>({
  select:()=>({eq:(_k:string,viewer:string)=>({in:async(_key:string,ids:string[])=>({
   data:rows.filter(row=>row.user_a===viewer&&ids.includes(row.user_b)),error:state.readError,
  })})}),
  upsert:vi.fn(async(writes:any[])=>{
   if(state.writeError)return {error:state.writeError};
   for(const write of writes) {
    const i=rows.findIndex(row=>row.user_a===write.user_a&&row.user_b===write.user_b);
    if(i>=0)rows.splice(i,1);
    rows.push(write);
   }
   return {error:null};
  }),
 }))};
 return {client:client as any,rows,state};
}
describe('Persistent directed explanation cache',()=>{
 it('generates only requested candidates and reuses the exact result on a warm read',async()=>{
  vi.mocked(generateMatchExplanation).mockClear();
  const db=database(),viewer=input('a'),candidate=input('b');
  const cold=await getMatchExplanations(db.client,viewer,[candidate]);
  expect(cold.metrics.generated).toBe(1);expect(cold.metrics.cache_hits).toBe(0);
  const warm=await getMatchExplanations(db.client,viewer,[candidate]);
  expect(warm.metrics.generated).toBe(0);expect(warm.metrics.cache_hits).toBe(1);
  expect(warm.explanations.get('b')?.click_text).toBe(cold.explanations.get('b')?.click_text);
  expect(generateMatchExplanation).toHaveBeenCalledTimes(1);
  expect(db.rows[0].generated_by).toBe(EXPLANATION_ENGINE_VERSION);
 });
 it('misses for either version, either revision, engine version or changed public inputs',async()=>{
  for(const key of ['version_a','version_b','revision_a','revision_b','generated_by','input_hash']) {
   const db=database();await getMatchExplanations(db.client,input('a'),[input('b')]);
   db.rows[0][key]=key.includes('version')||key.includes('revision')?99:'stale';
   expect((await getMatchExplanations(db.client,input('a'),[input('b')])).metrics.generated).toBe(1);
  }
 });
 it('keeps the reverse direction separate and does no work for an empty shortlist',async()=>{
  const db=database();await getMatchExplanations(db.client,input('a'),[input('b')]);
  expect((await getMatchExplanations(db.client,input('b'),[input('a')])).metrics.generated).toBe(1);
  expect(db.rows).toHaveLength(2);
  const empty=database();await getMatchExplanations(empty.client,input('a'),[]);
  expect(empty.client.from).not.toHaveBeenCalled();
 });
 it('fails visibly on cache errors and missing versions, never returns fake empty success',async()=>{
  for(const key of ['readError','writeError'] as const) {
   const db=database();db.state[key]={code:'42501',message:'Denied'};
   await expect(getMatchExplanations(db.client,input('a'),[input('b')])).rejects.toThrow('Denied');
  }
  const db=database(),bad=input('a');bad.row.profile_version=undefined as any;
  await expect(getMatchExplanations(db.client,bad,[input('b')])).rejects.toThrow('version');
 });
 it('excludes private values from the hash and public explanation inputs',()=>{
  const a=input('a').vector,b=input('b').vector;
  a.values=[{key:'private-one',visibility:'private'} as any];
  const before=explanationInputHash(a,b);
  a.values=[{key:'private-two',visibility:'private'} as any];
  expect(explanationInputHash(a,b)).toBe(before);
  a.values=[{key:'public-value',visibility:'public'} as any];
  expect(explanationInputHash(a,b)).not.toBe(before);
 });
});
it('catalog option IDs are unique and capture the current displayed selections',()=>{
 const expected:Record<string,readonly string[]>={
 'friendship.intent':INTENTS,'friendship.clicks':CLICKS,'friendship.setting':GROUPS,
 'friendship.qualities':[...FRIEND_QUALITIES,'Other'],'friendship.outings':[...OUTINGS,'Other'],
 'friendship.contact':ACTIVE_RHYTHM[0].choices,'friendship.planning':ACTIVE_RHYTHM[1].choices,
 'context.life_phase':LIFE_CONTEXTS,
 };
 for(const [id,values] of Object.entries(expected)) {
  const question=catalog.find(q=>q.questionId===id)!;
  expect(question.options.map(o=>o.value)).toEqual(values);
  expect(question.questionVersion).toBe(1);
  expect(new Set(question.options.map(o=>o.optionId)).size).toBe(values.length);
 }
 expect(catalog.some(q=>q.questionId.includes('punctuality'))).toBe(false);
});
