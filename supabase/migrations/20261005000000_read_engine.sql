begin;
-- Closed fixed-choice projection; the original JSON remains owner-only.
create or replace function public.read_deep_catalog_v1() returns jsonb
language sql immutable set search_path=public,pg_temp as $catalog$ select '[{"key":"repairFirst","id":"repair.first","version":1,"thread":"repair","max":1,"options":["Name what feels off","Ask how they saw it","Wait a little before saying anything","Step back from the conversation"]},{"key":"repairReturn","id":"repair.return","version":1,"thread":"repair","max":1,"options":["In the same conversation","Later that day","After a day or two","After several days","Only after we return to what happened"]},{"key":"repairDiscuss","id":"repair.discuss","version":1,"thread":"repair","max":1,"options":["Talk through what went wrong","Acknowledge it without a long discussion","Agree what will be different next time","Let it go and reconnect through something ordinary"]},{"key":"repairNeed","id":"repair.need","version":1,"thread":"repair","max":2,"options":["They understand what bothered me","A clear apology","We agree on a practical change","We spend some ordinary time together again","I see the change in what happens afterwards"]},{"key":"repairSpace","id":"repair.space","version":1,"thread":"repair","max":1,"options":["A short message saying we will come back to it","Agreeing when we will talk","Knowing I can check in without starting the discussion","Leaving the next message to them"]},{"key":"initiationChoice","id":"communication.invitation","version":1,"thread":"initiative","max":1,"options":["I usually wait for theirs","It goes both ways","I usually send mine"]},{"key":"groupSize","id":"tribal.groupSize","version":1,"thread":"personality","max":1,"options":["One-on-one","3–4 people","5–8 people","Big group","Depends"]},{"key":"socialVibe","id":"tribal.socialVibe","version":1,"thread":"personality","max":3,"options":["Intimate","Playful-chaotic","Intellectual","Adventurous","Calm","High-energy","Creative"]},{"key":"messagingStyle","id":"tribal.messagingStyle","version":1,"thread":"communication","max":3,"options":["Random thoughts","Memes","Check-ins","Voice notes","Calls","Making plans","Mostly IRL"]},{"key":"supportStyle","id":"tribal.supportStyle","version":1,"thread":"communication","max":3,"options":["Listen","Reassure","Make sense of it","Advice","Solve it","Ask me"]},{"key":"friendshipPillars","id":"tribal.friendshipPillars","version":1,"thread":"intent","max":3,"options":["We tell each other everything","Inside jokes","Spontaneous plans","Comfortable silence","Show up in hard times"]},{"key":"idealSaturday","id":"tribal.idealSaturday","version":1,"thread":"experience","max":3,"options":["Slow coffee","Outdoors","Hobbies","Exploring","Social all day","Dinner-drinks","Home","Spontaneous"]},{"key":"spontaneousTrip","id":"tribal.spontaneousTrip","version":1,"thread":"social_rhythm","max":1,"options":["Already packing","Convince me","24 hours notice needed","Not without itinerary"]},{"key":"coreValues","id":"tribal.coreValues","version":1,"thread":"values","max":3,"options":["Family","Freedom","Adventure","Community","Achievement","Creativity","Growth","Stability","Curiosity"]},{"key":"budgetPref","id":"tribal.budgetPref","version":1,"thread":"lifestyle","max":1,"options":["Free","<$20","$20–50","$50–100","$100+"]},{"key":"punctualityPref","id":"tribal.punctualityPref","version":1,"thread":"lifestyle","max":1,"options":["Low","Flexible","Important","Essential"]},{"key":"cancellationStance","id":"tribal.cancellationStance","version":1,"thread":"lifestyle","max":1,"options":["Fine","Context matters","Dislike","Dealbreaker"]}]'::jsonb $catalog$;
revoke all on function public.read_deep_catalog_v1() from public,anon,authenticated;

create table if not exists public.read_answer_sources(
 user_id uuid not null references public.profiles(id) on delete cascade,
 question_id text not null, question_version integer, dimension text not null,
 thread text not null, selections jsonb not null check(jsonb_typeof(selections)='array'),
 access text not null check(access in ('public','shared-detail')),
 primary key(user_id,question_id)
);
alter table public.read_answer_sources enable row level security;
revoke all on public.read_answer_sources from public,anon,authenticated;
grant select on public.read_answer_sources to authenticated;

-- A self confirmation is separate from the host's attendance record.
create table if not exists public.outing_presence_confirmations(
 outing_id uuid not null references outings(id) on delete cascade,
 user_id uuid not null references profiles(id) on delete cascade,
 confirmed_at timestamptz not null default now(),
 primary key(outing_id,user_id)
);
alter table public.outing_presence_confirmations enable row level security;
revoke all on public.outing_presence_confirmations from public,anon,authenticated;
create or replace function public.verified_shared_attendance(a uuid,b uuid) returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
 select a<>b and not pair_restricted(a,b)
 and exists(select 1 from profiles where id=a and status='active')
 and exists(select 1 from profiles where id=b and status='active') and exists(
 select 1 from outing_records r join outings o on o.id=r.outing_id
 join outing_presence_confirmations ca on ca.outing_id=r.outing_id and ca.user_id=a
 join outing_presence_confirmations cb on cb.outing_id=r.outing_id and cb.user_id=b
 where a=any(r.attended) and b=any(r.attended) and o.state<>'cancelled'
 and o.starts_at+make_interval(mins=>o.duration_minutes)<=now());
$$;
revoke all on function public.verified_shared_attendance(uuid,uuid) from public,anon,authenticated;
create or replace function public.has_verified_outing_with(b uuid) returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
 select auth.uid() is not null and verified_shared_attendance(auth.uid(),b);
$$;
revoke all on function public.has_verified_outing_with(uuid) from public,anon;
grant execute on function public.has_verified_outing_with(uuid) to authenticated;
drop policy if exists read_sources_select on public.read_answer_sources;
create policy read_sources_select on public.read_answer_sources for select to authenticated using(
 user_id=auth.uid() or (
 can_interact_with(user_id)
 and exists(select 1 from profiles where id=user_id and status='active')
 and (access='public' or has_verified_outing_with(user_id))
 )
);

create or replace function public.refresh_read_sources(subject uuid,legacy boolean default true)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare r profile_answers; q jsonb; raw jsonb; vals jsonb; rec jsonb; v integer; oldv integer; oldsel jsonb; dim text; th text; qid text;
begin
 select * into r from profile_answers where user_id=subject;
 if not found then return; end if;
 -- Each catalogue projection is regenerated from original selections, never prose.
 for q in select value from jsonb_array_elements(onboarding_question_catalog_v1()) loop
  if jsonb_array_length(q->'options')=0 or q->>'questionId' like 'context.%' then continue; end if;
  dim:=q->'fields'->>0; qid:=q->>'questionId'; raw:=r.onboarding->'baselineV2'->dim;
  if jsonb_typeof(raw)='string' then raw:=jsonb_build_array(raw); end if;
  vals:='[]';
  if jsonb_typeof(raw)='array' then
   select coalesce(jsonb_agg(value order by value),'[]') into vals from (
    select distinct x.value from jsonb_array_elements(raw) x where jsonb_typeof(x.value)='string'
    and exists(select 1 from jsonb_array_elements(q->'options') opt where opt->'value'=x.value and opt->>'value'<>'Other')
   ) checked;
  end if;
  if vals='[]'::jsonb then delete from read_answer_sources where user_id=subject and question_id=qid; continue; end if;
  th:=case dim when 'intent' then 'intent' when 'clicks' then 'communication' when 'groupChoices' then 'personality'
   when 'connectionChoice' then 'communication' when 'planningChoice' then 'social_rhythm'
   when 'desiredQualities' then 'values' when 'outings' then 'interests' end;
  if th is null then continue; end if;
  rec:=r.onboarding->'baselineV2'->'answerRecords'->qid;
  v:=case when rec->'questionVersion'=q->'questionVersion' and rec->'answer'->dim=r.onboarding->'baselineV2'->dim then (q->>'questionVersion')::integer else null end;
  insert into read_answer_sources values(subject,qid,v,dim,th,vals,'public')
   on conflict(user_id,question_id) do update set question_version=excluded.question_version,selections=excluded.selections,thread=excluded.thread,access=excluded.access;
 end loop;
 for q in select value from jsonb_array_elements(read_deep_catalog_v1()) loop
  dim:=q->>'key';qid:=q->>'id';raw:=r.deep_profile->dim;vals:='[]';
  if jsonb_typeof(raw)='string' then raw:=to_jsonb(string_to_array(raw#>>'{}',' · ')); end if;
  if jsonb_typeof(raw)='array' then
   select coalesce(jsonb_agg(value order by value),'[]') into vals from (
    select distinct x.value from jsonb_array_elements(raw) x where exists(select 1 from jsonb_array_elements(q->'options') opt where opt.value=x.value)
   ) checked;
  end if;
  select question_version,selections into oldv,oldsel from read_answer_sources where user_id=subject and question_id=qid;
  if vals='[]'::jsonb then delete from read_answer_sources where user_id=subject and question_id=qid;continue;end if;
  v:=case when oldsel=vals then oldv when legacy then null else 1 end;
  insert into read_answer_sources values(subject,qid,v,dim,q->>'thread',vals,case when q->>'thread' in ('emotional','repair') then 'shared-detail' else 'public' end)
   on conflict(user_id,question_id) do update set selections=excluded.selections,question_version=excluded.question_version,access=excluded.access;
 end loop;
end $$;
revoke all on function public.refresh_read_sources(uuid,boolean) from public,anon,authenticated;

create or replace function public.validate_new_read_questions() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
declare q jsonb; raw jsonb; previous jsonb; vals text[]; item text;
begin
 for q in select value from jsonb_array_elements(read_deep_catalog_v1()) where value->>'thread' in ('repair','initiative') loop
  raw:=new.deep_profile->(q->>'key');
  if tg_op='UPDATE' then previous:=old.deep_profile->(q->>'key');else previous:=null;end if;
  if raw is not distinct from previous or raw is null or raw='null'::jsonb or raw='""'::jsonb then continue;end if;
  if jsonb_typeof(raw)<>'string' then raise exception 'Invalid fixed-choice answer' using errcode='22023';end if;
  vals:=string_to_array(raw#>>'{}',' · ');
  if cardinality(vals)>(q->>'max')::integer then raise exception 'Too many selections' using errcode='22023';end if;
  foreach item in array vals loop
   if item not in ('It depends','Prefer not to say') and not exists(select 1 from jsonb_array_elements_text(q->'options') opt where opt=item) then
    raise exception 'Unknown selection' using errcode='22023';
   end if;
  end loop;
  if cardinality(vals)>1 and (vals&&array['It depends','Prefer not to say']) then raise exception 'Non-answer must stand alone' using errcode='22023';end if;
 end loop;
 return new;
end $$;
revoke all on function public.validate_new_read_questions() from public,anon,authenticated;
drop trigger if exists validate_new_read_questions on profile_answers;
create trigger validate_new_read_questions before insert or update on profile_answers for each row execute function public.validate_new_read_questions();
create or replace function public.project_read_sources() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if tg_op='DELETE' then delete from read_answer_sources where user_id=old.user_id;return old;end if;
 perform refresh_read_sources(new.user_id,false);return new;
end $$;
revoke all on function public.project_read_sources() from public,anon,authenticated;
drop trigger if exists project_read_sources on profile_answers;
create trigger project_read_sources after insert or update or delete on profile_answers for each row execute function public.project_read_sources();
-- Founder authorised public-by-default fixed choices; no new answers or historic versions are invented.
do $$ declare member uuid;begin for member in select user_id from profile_answers loop perform refresh_read_sources(member,true);end loop;end $$;

create table if not exists public.composed_read_cache(
 viewer_id uuid not null references profiles(id) on delete cascade,
 subject_id uuid not null references profiles(id) on delete cascade,
 level text not null check(level in ('profile','bond')),
 evidence_hash text not null, engine_version text not null, writer_version text not null, disclosure_version text not null,
 state text not null check(state in ('pending','ready')), lease_id uuid not null,
 lease_until timestamptz not null, document jsonb, updated_at timestamptz not null default now(),
 primary key(viewer_id,subject_id,level)
);
alter table public.composed_read_cache enable row level security;
revoke all on public.composed_read_cache from public,anon,authenticated;
grant all on public.composed_read_cache to service_role;
create or replace function public.claim_composed_read(p_viewer uuid,p_subject uuid,p_level text,p_hash text,p_engine text,p_writer text,p_disclosure text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare hit composed_read_cache; lease uuid:=gen_random_uuid();
begin
 if p_viewer<>p_subject and pair_restricted(p_viewer,p_subject) then raise exception 'Read unavailable';end if;
 insert into composed_read_cache values(p_viewer,p_subject,p_level,p_hash,p_engine,p_writer,p_disclosure,'pending',lease,now()+interval '45 seconds',null,now())
 on conflict(viewer_id,subject_id,level) do nothing;
 select * into hit from composed_read_cache where viewer_id=p_viewer and subject_id=p_subject and level=p_level for update;
 if hit.evidence_hash=p_hash and hit.engine_version=p_engine and hit.writer_version=p_writer and hit.disclosure_version=p_disclosure then
  if hit.state='ready' then return jsonb_build_object('state','hit','document',hit.document);end if;
  if hit.lease_id=lease then return jsonb_build_object('state','claimed','lease',lease);end if;
  if hit.lease_until>now() then return jsonb_build_object('state','busy');end if;
 end if;
 update composed_read_cache set evidence_hash=p_hash,engine_version=p_engine,writer_version=p_writer,disclosure_version=p_disclosure,
 state='pending',lease_id=lease,lease_until=now()+interval '45 seconds',document=null,updated_at=now()
 where viewer_id=p_viewer and subject_id=p_subject and level=p_level;
 return jsonb_build_object('state','claimed','lease',lease);
end $$;
create table if not exists public.read_phrase_history(
 viewer_id uuid not null references profiles(id) on delete cascade,
 subject_id uuid not null references profiles(id) on delete cascade,
 level text not null check(level in ('profile','bond')),phrase text not null,
 phrase_hash text generated always as(md5(phrase)) stored,
 primary key(viewer_id,subject_id,level,phrase_hash)
);
alter table read_phrase_history enable row level security;
revoke all on read_phrase_history from public,anon,authenticated;
grant all on read_phrase_history to service_role;
create or replace function public.finish_composed_read(p_viewer uuid,p_subject uuid,p_level text,p_hash text,p_lease uuid,p_document jsonb)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if p_viewer<>p_subject and pair_restricted(p_viewer,p_subject) then return false;end if;
 update composed_read_cache set state='ready',document=p_document,updated_at=now()
 where viewer_id=p_viewer and subject_id=p_subject and level=p_level and evidence_hash=p_hash and lease_id=p_lease and state='pending' and lease_until>now();
 if not found then return false;end if;
 insert into read_phrase_history(viewer_id,subject_id,level,phrase)
 select p_viewer,p_subject,p_level,claim->>'text' from jsonb_array_elements(coalesce(p_document->'sections','[]')) section,
 jsonb_array_elements(coalesce(section->'claims','[]')) claim
 where char_length(claim->>'text') between 1 and 1200 on conflict do nothing;
 return true;
end $$;
revoke all on function public.claim_composed_read(uuid,uuid,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.finish_composed_read(uuid,uuid,text,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.claim_composed_read(uuid,uuid,text,text,text,text,text) to service_role;
grant execute on function public.finish_composed_read(uuid,uuid,text,text,uuid,jsonb) to service_role;
commit;
