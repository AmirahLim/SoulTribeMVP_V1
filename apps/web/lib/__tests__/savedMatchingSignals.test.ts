import {it,expect} from 'vitest';
import {adaptRowToUserData} from '../profileRowAdapter';
import {toProfileVector} from '../profileAdapter';
import {score,softGate} from '@soul-tribe/core';

// Isolated fixtures, not production members or persisted answers.
const row=(id:string)=>({id,status:'active',birth_year:1995,age_pref_min:18,age_pref_max:99,
 trait_intent:{answered:1,intents:['Close circle']},
 user_interests:[{user_id:id,node_id:104,affinity:'love',interest_nodes:{name:'Food Hunts',path:'food.dining'}}]});
it('provisional ranking retains evidence and never overrides safety gates',()=>{
 const a=toProfileVector(adaptRowToUserData(row('a')),'a');
 const b=toProfileVector(adaptRowToUserData(row('b')),'b');
 const context={candidatePoolSize:2,allowProvisionalRanking:true};
 expect(score(a,b,{candidatePoolSize:2}).rank_score).toBe(0);
 const result=score(a,b,context);
 expect(result.rank_score).toBeGreaterThan(0);
 expect(result.gate_reasons).toContain('CONFIDENCE_TOO_LOW');
 expect(softGate(result,{provisionalFloor:0}).provisional).toBe(true);
 for(const safety of [{blockedUserIds:['b']},{reportedUserIds:['b']}]) {
  expect(score(a,b,{...context,...safety}).rank_score).toBe(0);
 }
 b.profile.status='paused';expect(score(a,b,context).rank_score).toBe(0);
 b.profile.status='active';b.profile.age_pref_max=18;
 expect(score(a,b,context).rank_score).toBe(0);
});
it('preserves saved interest IDs, taxonomy paths and affinity through the production adapter',()=>{
 const vector=toProfileVector(adaptRowToUserData(row('a')),'a');
 expect(vector.interests).toEqual([{user_id:'a',node_id:104,node_name:'Food Hunts',node_path:'food.dining',affinity:'love'}]);
});
it('does not turn missing saved taxonomy into an invented path or positional ID',()=>{
 const source=row('a');
 delete (source.user_interests[0].interest_nodes as any).path;
 expect(toProfileVector(adaptRowToUserData(source),'a').interests).toEqual([]);
});
it('uses only the public life-phase projection, never private baseline answers',()=>{
 const source={...row('a'),life_contexts:[],onboarding:{baselineV2:{lifeContexts:['Slow Living']}}};
 expect(toProfileVector(adaptRowToUserData(source),'a').profile.life_contexts).toEqual([]);
});
it('public life-phase overlap changes eligible ranking without bypassing safety gates',()=>{
 const a=toProfileVector(adaptRowToUserData({...row('a'),life_contexts:['Slow Living']}),'a');
 const b=toProfileVector(adaptRowToUserData({...row('b'),life_contexts:['Slow Living']}),'b');
 // Isolate ranking from completeness; do not alter production confidence policy.
 a.profile.confidence=1;b.profile.confidence=1;
 b.interests![0].affinity='curious';
 const shared=score(a,b,{candidatePoolSize:2});
 b.profile.life_contexts=[];
 expect(shared.rank_score).toBeGreaterThan(score(a,b,{candidatePoolSize:2}).rank_score);
 b.profile.life_contexts=['Slow Living'];
 expect(score(a,b,{candidatePoolSize:2,blockedUserIds:['b']}).rank_score).toBe(0);
});
