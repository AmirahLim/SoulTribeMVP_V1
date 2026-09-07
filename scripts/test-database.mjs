import { PGlite } from '@electric-sql/pglite';
import { ltree } from '@electric-sql/pglite/contrib/ltree';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const db = new PGlite({ extensions: { ltree, uuid_ossp } });
await db.exec(`
 create role authenticated; create role anon; create role service_role bypassrls;
 create schema auth; create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create function auth.role() returns text language sql as $$ select nullif(current_setting('request.jwt.claim.role',true),'') $$;
 grant usage on schema auth to authenticated,anon; grant execute on all functions in schema auth to authenticated,anon;
 create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid,name text,bucket_id text);
 create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;
 grant usage on schema public to authenticated; alter default privileges in schema public grant select,insert,update,delete on tables to authenticated;
 alter default privileges in schema public grant usage,select on sequences to authenticated;
`);
for (const file of (
  await readdir(new URL('../supabase/migrations/', import.meta.url))
).sort()) {
  try {
    await db.exec(
      await readFile(
        new URL('../supabase/migrations/' + file, import.meta.url),
        'utf8',
      ),
    );
  } catch (e) {
    console.error('Migration failed:', file, e.message);
    process.exit(1);
  }
}
console.log('All committed migrations apply.');
const host = '10000000-0000-4000-8000-000000000001',
  guest = '10000000-0000-4000-8000-000000000002',
  other = '10000000-0000-4000-8000-000000000003';
const outing = '20000000-0000-4000-8000-000000000001';
for (const [i, id] of [host, guest, other].entries())
  await db.query(`insert into auth.users values($1);`, [id]);
async function as(id) {
  await db.exec(
    `reset role; set request.jwt.claim.role='authenticated'; set request.jwt.claim.sub='${id}'; set role authenticated;`,
  );
}
async function fails(sql, pattern, params = []) {
  await assert.rejects(db.query(sql, params), pattern);
}
for (const [i, id] of [host, guest, other].entries()) {
  await as(id);
  await db.query(`select save_profile_bundle($1,'{}','{}',null)`, [
    {
      handle: 'member_' + i,
      display_name: 'Member ' + i,
      home_area: 'Singapore',
      birth_year: 1995,
    },
  ]);
}
await as(host);
await fails(`update profiles set tier='host_plus' where id=$1`, /Protected/, [
  host,
]);
await fails(`update profiles set status='banned' where id=$1`, /Protected/, [
  host,
]);
await db.query(
  `insert into outings(id,host_id,title,pitch,activity_category,area,starts_at,duration_minutes,budget_band,orientation,setting,max_participants,visibility,state) values($1,$2,'Coffee plan','Coffee together in a public cafe','coffee','Central',now()+interval '1 day',60,1,'either','quiet',2,'requestable','open')`,
  [outing, host],
);
assert.equal(
  (
    await db.query(
      `select count(*)::int n from outing_members where outing_id=$1`,
      [outing],
    )
  ).rows[0].n,
  1,
);
await fails(
  `insert into outing_members(outing_id,user_id,state) values($1,$2,'accepted')`,
  /approval/,
  [outing, guest],
);
await db.query(
  `insert into outing_members(outing_id,user_id,state) values($1,$2,'invited')`,
  [outing, guest],
);
await db.query(
  `insert into outing_logistics values($1,'Public cafe','Meet by the entrance','public',now())`,
  [outing],
);
await as(guest);
assert.equal((await db.query(`select * from outing_logistics`)).rows.length, 0);
await fails(
  `insert into outing_messages(outing_id,author_id,body) values($1,$2,'hello')`,
  /row-level security/,
  [outing, guest],
);
await db.query(
  `update outing_members set state='accepted' where outing_id=$1 and user_id=$2`,
  [outing, guest],
);
assert.equal((await db.query(`select * from outing_logistics`)).rows.length, 1);
await db.query(
  `insert into outing_messages(outing_id,author_id,body) values($1,$2,'See you there')`,
  [outing, guest],
);
await as(other);
await db.query(
  `insert into outing_members(outing_id,user_id,state) values($1,$2,'requested')`,
  [outing, other],
);
await fails(
  `update outing_members set state='accepted' where outing_id=$1 and user_id=$2`,
  /Invalid membership/,
  [outing, other],
);
await as(host);
await fails(
  `update outing_members set state='accepted' where outing_id=$1 and user_id=$2`,
  /OUTING_FULL/,
  [outing, other],
);
await as(guest);
await db.query(
  `update outing_members set state='withdrawn' where outing_id=$1 and user_id=$2`,
  [outing, guest],
);
assert.equal((await db.query(`select * from outing_logistics`)).rows.length, 0);
assert.equal((await db.query(`select * from outing_messages`)).rows.length, 0);
await as(host);
await db.query(
  `update outing_members set state='accepted' where outing_id=$1 and user_id=$2`,
  [outing, other],
);
// Private answer ownership and transactional rollback.
await db.query(`select save_profile_bundle(null,$1,$2,null)`, [
  { deep_profile: { private: 'owner text' } },
  { trait_personality: { extraversion: 0.3 } },
]);
await fails(`select save_profile_bundle(null,$1,$2,null)`, /Unsupported/, [
  { deep_profile: { private: 'should roll back' } },
  { profiles: { status: 'banned' } },
]);
assert.equal(
  (
    await db.query(
      `select deep_profile from profile_answers where user_id=$1`,
      [host],
    )
  ).rows[0].deep_profile.private,
  'owner text',
);
await as(guest);
assert.equal(
  (await db.query(`select * from profile_answers where user_id=$1`, [host]))
    .rows.length,
  0,
);
await as(other);
await fails(
  `insert into rhythm_checks(outing_id,author_id,about_id,would_meet_again) values($1,$2,$3,5)`,
  /Shared attendance/,
  [outing, other, host],
);
await db.query(`insert into blocks(blocker_id,blocked_id) values($1,$2)`, [
  other,
  host,
]);
assert.equal(
  (await db.query(`select * from profiles where id=$1`, [host])).rows.length,
  0,
);
assert.equal((await db.query(`select * from outing_messages`)).rows.length, 0);
await as(host);
assert.equal(
  (await db.query(`select * from profiles where id=$1`, [other])).rows.length,
  0,
);
await db.query(`update outings set state='cancelled' where id=$1`, [outing]);
assert.ok(
  (await db.query(`select * from outing_history where outing_id=$1`, [outing]))
    .rows.length > 0,
);
console.log(
  'Passed consent, capacity, membership revocation, account protection, bilateral block, private answers, rollback, reflection eligibility and retained history checks.',
);
// Baseline v2 security and transactional persistence.
const newcomer='10000000-0000-4000-8000-000000000004';
await db.exec('reset role');
await db.query('insert into auth.users values($1)',[newcomer]);
const token='a'.repeat(64);
const draft={version:2,step:6,intent:['Close circle'],clicks:['Our humour just lands'],group:'1:1',contact:0,planning:.5,opening:1,outings:['Analog Photo Walks','Indie Cinema'],handle:'newcomer',area:'Bedok',travel:'Nearby'};
await db.exec("set role anon; set request.jwt.claim.sub='';");
assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[draft])).rows[0].valid,true);
draft.groupChoices=['1:1','Big energy'];
draft.q4Revision=2;
draft.desiredQualities=['Curious','Reliable','Open-minded'];
draft.opening=null;
assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[draft])).rows[0].valid,true);
assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[{...draft,desiredQualities:[]}])).rows[0].valid,false);
assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[{...draft,desiredQualities:['Reliable','Reliable']}])).rows[0].valid,false);
await fails('select * from onboarding_drafts',/permission denied/);
await db.query('select save_onboarding_draft($1,$2)',[token,draft]);
await fails('select save_onboarding_draft($1,$2)',/Invalid draft/,[token,{...draft,groupChoices:['1:1','Small circle','Big energy']}]);
await fails('select save_onboarding_draft($1,$2)',/Invalid draft/,[token,{...draft,groupChoices:['1:1','1:1']}]);
assert.equal((await db.query('select read_onboarding_draft($1) d',['b'.repeat(64)])).rows[0].d,null);
await fails('select save_onboarding_draft($1,$2)',/Invalid draft/,[token,{...draft,outings:['invalid']}]);
await fails('select claim_onboarding_draft($1,$2,$3)',/permission denied/,[token,'New Member',1995]);
await as(newcomer);
await fails('select claim_onboarding_draft($1,$2,$3)',/adult birth year/,[token,'New Member',2020]);
await db.query('select claim_onboarding_draft($1,$2,$3)',[token,'New Member',1995]);
const savedVersion=(await db.query('select profile_version from profiles where id=$1',[newcomer])).rows[0].profile_version;
assert.equal((await db.query('select er_opening_pace from trait_emotional where user_id=$1',[newcomer])).rows[0].er_opening_pace,null);
assert.deepEqual((await db.query('select onboarding from profile_answers where user_id=$1',[newcomer])).rows[0].onboarding.baselineV2.desiredQualities,draft.desiredQualities);
assert.equal((await db.query('select group_size_pref from trait_experience where user_id=$1',[newcomer])).rows[0].group_size_pref,null);
assert.deepEqual((await db.query('select onboarding from profile_answers where user_id=$1',[newcomer])).rows[0].onboarding.baselineV2.groupChoices,['1:1','Big energy']);
await db.query('select claim_onboarding_draft($1,$2,$3)',[token,'New Member',1995]);
assert.equal((await db.query('select profile_version from profiles where id=$1',[newcomer])).rows[0].profile_version,savedVersion);
assert.equal((await db.query('select count(*)::int n from user_interests where user_id=$1',[newcomer])).rows[0].n,2);
assert.equal((await db.query('select contact_frequency_self from trait_communication where user_id=$1',[newcomer])).rows[0].contact_frequency_self,null);
assert.equal((await db.query('select depth from trait_intent where user_id=$1',[newcomer])).rows[0].depth,null);
assert.equal((await db.query('select count(*)::int n from trait_personality where user_id=$1',[newcomer])).rows[0].n,0);
await as(guest);
await fails('select claim_onboarding_draft($1,$2,$3)',/already saved/,[token,'Other Member',1995]);
assert.equal((await db.query('select read_onboarding_draft($1) d',[token])).rows[0].d,null);
console.log('Passed baseline draft isolation, validation, adult eligibility, atomic claim, idempotence and unknown trait preservation.');
const sixUser='10000000-0000-4000-8000-000000000005';
await db.exec('reset role');
await db.query('insert into auth.users values($1)',[sixUser]);
const six={...draft,flowVersion:3,step:7,handle:'six_member',desiredQualities:['Other'],qualityOther:'Patient',outings:['Water Sports','Other'],outingOther:'Stargazing',connectionChoice:'Other',connectionOther:'When we have something to share',planningChoice:'Other',planningOther:'It depends',punctualityChoice:'On time',punctualityOther:'',contact:null,planning:null};
await db.exec("set role anon; set request.jwt.claim.sub='';");
await db.query('select save_onboarding_draft($1,$2)',['c'.repeat(64),six]);
const customStart={...six,intent:['Other'],intentOther:'A walking companion',clicks:['Other'],clicksOther:'We make things together'};
const international = {...six,setupRevision:1,area:'Fitzroy',country:'Australia',ageBand:'25–34',ageOther:'',travelKm:50};
const lifeContextDraft={...international,setupRevision:2,ageBand:'',lifeContexts:['Slow Living','Family Life']};
assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[lifeContextDraft])).rows[0].valid,true);
for(const lifeContexts of [[],['Slow Living','Slow Living'],['Slow Living','Family Life','Wild & Free','Adventure Era'],['Unknown']]) {
 assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[{...lifeContextDraft,lifeContexts}])).rows[0].valid,false);
}
assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[international])).rows[0].valid,true);
for (const patch of [{ageBand:'Other',ageOther:'17'},{travelKm:51},{travelKm:1.5},{country:''},{ageBand:''}]) {
 assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[{...international,...patch}])).rows[0].valid,false);
}
assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[{...six,desiredQualities:['Depth','Spiritual']}])).rows[0].valid,true);
assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[customStart])).rows[0].valid,true);
assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[{...customStart,intentOther:' '}])).rows[0].valid,false);
assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[{...six,desiredQualities:['Free-spirit','Intellectually curious','Ambitious','Reliable','Other']}])).rows[0].valid,true);
assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[{...six,desiredQualities:['Free-spirit','Intellectually curious','Ambitious','Reliable','Other','Playful']}])).rows[0].valid,false);
assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[{...six,punctualityChoice:'',punctualityOther:''}])).rows[0].valid,true);
await fails('select save_onboarding_draft($1,$2)',/Invalid draft/,['c'.repeat(64),{...six,contact:1}]);
await fails('select save_onboarding_draft($1,$2)',/Invalid draft/,['c'.repeat(64),{...six,qualityOther:'x'.repeat(121)}]);
assert.equal((await db.query('select validate_baseline_draft($1,true) valid',[{...six,qualityOther:' '}])).rows[0].valid,false);
await as(sixUser);
await db.query('select claim_onboarding_draft($1,$2,$3)',['c'.repeat(64),'Six Member',1995]);
const sixSaved=(await db.query('select onboarding from profile_answers where user_id=$1',[sixUser])).rows[0].onboarding.baselineV2;
assert.equal(sixSaved.qualityOther,'Patient');assert.equal(sixSaved.outingOther,'Stargazing');assert.equal(sixSaved.punctualityChoice,'On time');
assert.equal((await db.query('select contact_frequency_expect from trait_communication where user_id=$1',[sixUser])).rows[0].contact_frequency_expect,null);
assert.equal((await db.query('select planning_horizon from trait_social_rhythm where user_id=$1',[sixUser])).rows[0].planning_horizon,null);
assert.equal((await db.query('select count(*)::int n from user_interests where user_id=$1',[sixUser])).rows[0].n,1);
console.log('Passed six-question custom text preservation, canonical rhythm validation and unknown custom signal tests.');
// Old private answers never become a public projection without the new disclosure.
await db.query('update profile_answers set onboarding=$1 where user_id=$2',[{baselineV2:lifeContextDraft},sixUser]);
assert.deepEqual((await db.query('select life_contexts from profiles where id=$1',[sixUser])).rows[0].life_contexts,[]);
await db.query('update profile_answers set onboarding=$1 where user_id=$2',[{baselineV2:{...lifeContextDraft,lifeContextsPublic:true}},sixUser]);
assert.deepEqual((await db.query('select life_contexts from profiles where id=$1',[sixUser])).rows[0].life_contexts,['Slow Living','Family Life']);
await fails('update profile_answers set onboarding=$1 where user_id=$2',/Invalid life phases/,[{baselineV2:{...lifeContextDraft,lifeContextsPublic:true,lifeContexts:['Unknown']}},sixUser]);
await db.query('update profile_answers set onboarding=$1 where user_id=$2',[{baselineV2:{...lifeContextDraft,lifeContextsPublic:false}},sixUser]);
assert.deepEqual((await db.query('select life_contexts from profiles where id=$1',[sixUser])).rows[0].life_contexts,[]);
console.log('Passed life phase disclosure, public projection, validation and withdrawal checks.');
// Isolated local regression fixtures; never run against production.
await as(sixUser);
await db.query('update profile_answers set onboarding=$1 where user_id=$2',[{baselineV2:{lifeContexts:['Slow Living'],lifeContextsPublic:false}},sixUser]);
await fails('update profiles set life_contexts=$1 where id=$2',/explicit consent/,[['Slow Living'],sixUser]);
for(const consent of [false,null,'true']) {
 await db.query('update profile_answers set onboarding=$1 where user_id=$2',[{baselineV2:{lifeContexts:['Slow Living'],lifeContextsPublic:consent}},sixUser]);
 assert.deepEqual((await db.query('select life_contexts from profiles where id=$1',[sixUser])).rows[0].life_contexts,[]);
}
const phases=['Slow Living','Family Life','Adventure Era'];
await db.query('update profile_answers set onboarding=$1 where user_id=$2',[{baselineV2:{lifeContexts:phases,lifeContextsPublic:true}},sixUser]);
assert.deepEqual((await db.query('select life_contexts from profiles where id=$1',[sixUser])).rows[0].life_contexts,phases);
for(const invalid of [[...phases,'Wild & Free'],['Slow Living','Slow Living'],['Unknown'],[null]]) {
 await fails('update profile_answers set onboarding=$1 where user_id=$2',/Invalid life phases/,[{baselineV2:{lifeContexts:invalid,lifeContextsPublic:true}},sixUser]);
}
await fails('update profiles set life_contexts=$1 where id=$2',/explicit consent/,[['Wild & Free'],sixUser]);
await db.query('delete from profile_answers where user_id=$1',[sixUser]);
assert.deepEqual((await db.query('select life_contexts from profiles where id=$1',[sixUser])).rows[0].life_contexts,[]);
await db.exec('reset role');
for(let repeat=0;repeat<2;repeat++) {
 await db.exec(await readFile(new URL('../supabase/migrations/20260926000000_public_life_context.sql',import.meta.url),'utf8'));
}
assert.equal((await db.query("select has_function_privilege('anon','guard_public_life_context()','EXECUTE') allowed")).rows[0].allowed,false);
console.log('Passed direct-write consent protection, strict boolean consent, three-phase limit, withdrawal/deletion and repeatable migration.');
// New public answer sharing is opt-in and never backfills previous answers.
assert.equal((await db.query("select count(*)::int n from profiles where public_onboarding <> '{}'::jsonb")).rows[0].n,0);
await as(sixUser);
const sharing={...lifeContextDraft,lifeContextsPublic:false,answersPublic:true};
await db.query('insert into profile_answers(user_id,onboarding) values($1,$2)',[sixUser,{baselineV2:{...sharing,answersPublic:false}}]);
await fails('update profiles set public_onboarding=$1 where id=$2',/explicit sharing consent/,[{intent:['Close circle']},sixUser]);
await db.query('update profile_answers set onboarding=$1 where user_id=$2',[{baselineV2:sharing},sixUser]);
let publicAnswers=(await db.query('select public_onboarding from profiles where id=$1',[sixUser])).rows[0].public_onboarding;
assert.deepEqual(publicAnswers.desiredQualities,sharing.desiredQualities);
assert.deepEqual(publicAnswers.groupChoices,sharing.groupChoices);
assert.equal(publicAnswers.area,undefined);assert.equal(publicAnswers.ageBand,undefined);assert.equal(publicAnswers.lifeContexts,undefined);
await fails('update profile_answers set onboarding=$1 where user_id=$2',/Complete and review/,[{baselineV2:{...sharing,outings:['Invalid']}},sixUser]);
for(const consent of [false,'true',null]) {
 await db.query('update profile_answers set onboarding=$1 where user_id=$2',[{baselineV2:{...sharing,answersPublic:consent}},sixUser]);
 assert.deepEqual((await db.query('select public_onboarding from profiles where id=$1',[sixUser])).rows[0].public_onboarding,{});
}
await db.exec('reset role');
for(let i=0;i<2;i++)await db.exec(await readFile(new URL('../supabase/migrations/20260927000000_public_onboarding_preferences.sql',import.meta.url),'utf8'));
console.log('Passed explicit public-answer consent, exact allowed-field projection, withdrawal, direct-write protection and repeatability.');
// Early Read corrections remain exact and private even when answers are shared.
await as(sixUser);
const corrected={...sharing,earlyReadFeedback:{qualities:{status:'not_quite',text:'My private correction',basis:'["Reliable"]'}}};
await db.query('update profile_answers set onboarding=$1 where user_id=$2',[{baselineV2:corrected},sixUser]);
assert.deepEqual((await db.query('select onboarding from profile_answers where user_id=$1',[sixUser])).rows[0].onboarding.baselineV2.earlyReadFeedback,corrected.earlyReadFeedback);
assert.equal((await db.query('select public_onboarding from profiles where id=$1',[sixUser])).rows[0].public_onboarding.earlyReadFeedback,undefined);
console.log('Passed exact private Early Read correction persistence with no public projection.');
await db.close();
