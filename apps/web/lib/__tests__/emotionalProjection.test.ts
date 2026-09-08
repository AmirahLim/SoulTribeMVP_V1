import {it,expect} from 'vitest';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {OPENING_QUESTION} from '../readEngine/emotionalQuestion';

// Database tooling belongs to the root test harness, not Vercel's web workspace.
// Resolve it at test runtime; a missing installation still fails this test.
const {PGlite}=createRequire(import.meta.url)('@electric-sql/pglite');

it('projects only original emotional choices, is repeatable, and preserves answers and repair classification',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role;
   create table profile_answers(user_id uuid primary key,onboarding jsonb);
   create table read_answer_sources(user_id uuid,question_id text,question_version integer,dimension text,thread text,selections jsonb,access text,primary key(user_id,question_id));`);
  const migration=readFileSync(resolve(__dirname,'../../../../supabase/migrations/20261008000000_public_emotional_read_sources.sql'),'utf8');
  const id='10000000-0000-4000-8000-000000000001'; // Local isolated contract, never production.
  const original={q7EmotionalPacing:OPENING_QUESTION.options[0]};
  await db.query('insert into profile_answers values($1,$2)',[id,original]);
  await db.exec(migration);await db.exec(migration);
  expect((await db.query('select onboarding from profile_answers')).rows).toEqual([{onboarding:original}]);
  let rows=(await db.query('select thread,access,selections,question_version from read_answer_sources')).rows;
  expect(rows).toEqual([{thread:'emotional',access:'public',selections:[OPENING_QUESTION.options[0]],question_version:null}]);
  for(const option of OPENING_QUESTION.options){
   await db.query('update profile_answers set onboarding=$1',[{q7EmotionalPacing:option}]);
   expect((await db.query('select selections from read_answer_sources')).rows).toEqual([{selections:[option]}]);
  }
  await db.query("insert into read_answer_sources values($1,'repair.first',1,'repairFirst','repair','[]','shared-detail')",[id]);
  await db.exec(migration);
  expect((await db.query("select access from read_answer_sources where thread='repair'")).rows).toEqual([{access:'shared-detail'}]);
  await db.query('update profile_answers set onboarding=$1',[{}]);
  expect((await db.query("select count(*)::int n from read_answer_sources where thread='emotional'")).rows).toEqual([{n:0}]);
  await db.query('update profile_answers set onboarding=$1',[{q7EmotionalPacing:0.8}]);
  expect((await db.query("select count(*)::int n from read_answer_sources where thread='emotional'")).rows).toEqual([{n:0}]);
  expect((await db.query("select has_function_privilege('authenticated','public.project_original_opening_source(uuid)','EXECUTE') allowed")).rows).toEqual([{allowed:false}]);
  expect((await db.query("select has_function_privilege('anon','public.finish_composed_read(uuid,uuid,text,text,uuid,jsonb)','EXECUTE') allowed")).rows).toEqual([{allowed:false}]);
 }finally{await db.close();}
},20000);
