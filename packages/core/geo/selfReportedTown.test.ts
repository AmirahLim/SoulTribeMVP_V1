import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sameReportedTown,hasKilometrePreference} from './selfReportedTown.ts';
import {score} from '../matching/engine.ts';
import {scoreGeography} from '../matching/threads.ts';
import type {ProfileVector,TraitGeography} from '../domain/types.ts';
const geo=(town:string,country='Singapore'):TraitGeography=>({user_id:'local-test',home_area:town,country,radius_km:5,answered:3});
const vector=(id:string,town:string):ProfileVector=>({profile:{id,handle:id,display_name:id,home_area:town,birth_year:1995,age_pref_min:18,age_pref_max:99,profile_version:1,confidence:1,tier:'free',status:'active'},geography:geo(town),intent:{user_id:id,intents:['Close circle'],answered:1},social_rhythm:{user_id:id,planning_horizon:id==='a'?0:.25,answered:1}});
test('matches reported town AND country without guessing aliases or distances',()=>{
 assert.equal(sameReportedTown(geo(' Bedok '),geo('bedok')),true);
 assert.equal(sameReportedTown(geo('Springfield','USA'),geo('Springfield','Australia')),false);
 assert.equal(sameReportedTown(geo('Bedok'),geo('Tampines')),false);
 assert.equal(sameReportedTown(geo(''),geo('')),false);
 assert.equal(sameReportedTown(geo('Bedok',''),geo('Bedok','')),false);
 assert.equal(hasKilometrePreference({...geo('Bedok'),radius_km:NaN}),false);
});
test('modern town data never becomes a guessed minute-based gate or score',()=>{
 const a=vector('a','Unknown town'),b=vector('b','Another town');
 assert.equal(scoreGeography(a,b),null);
 assert.equal(score(a,b,{candidatePoolSize:30}).gate_reasons.includes('GEOGRAPHY_TOO_FAR'),false);
});
test('same reported town preference cannot override safety gates',()=>{
 const a=vector('a','Bedok'),b=vector('b','Bedok');
 const shared=score(a,b);
 b.geography=geo('Tampines');
 assert.ok(shared.rank_score>score(a,b).rank_score);
 b.geography=geo('Bedok');
 assert.equal(score(a,b,{blockedUserIds:['b']}).rank_score,0);
});
