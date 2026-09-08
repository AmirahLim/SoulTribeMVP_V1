begin;
create table if not exists public.peer_observations(
 outing_id uuid not null references outings(id) on delete cascade,
 observer_id uuid not null references profiles(id) on delete cascade,
 subject_id uuid not null references profiles(id) on delete cascade,
 question_id text not null check(question_id in ('peer.joining','peer.pause')),
 question_version integer not null default 1 check(question_version=1),
 option_id text not null check(option_id in ('started','picked_up','both','cannot_tell')),
 created_at timestamptz not null default now(),
 primary key(outing_id,observer_id,subject_id,question_id),check(observer_id<>subject_id)
);
create table if not exists public.peer_read_checks(
 observer_id uuid not null references profiles(id) on delete cascade,
 subject_id uuid not null references profiles(id) on delete cascade,
 read_hash text not null, writer_version text not null,
 option_id text not null check(option_id in ('mostly','some','not_really','cannot_tell')),
 created_at timestamptz not null default now(),
 primary key(observer_id,subject_id,read_hash),check(observer_id<>subject_id)
);
create table if not exists public.peer_signal_releases(
 subject_id uuid primary key references profiles(id) on delete cascade,
 period_start timestamptz not null, invalidated_at timestamptz, statements jsonb not null default '[]',
 moderation_hold boolean not null default false, updated_at timestamptz not null default now()
);
alter table peer_observations enable row level security;
alter table peer_read_checks enable row level security;
alter table peer_signal_releases enable row level security;
revoke all on peer_observations,peer_read_checks,peer_signal_releases from public,anon,authenticated;
grant all on peer_observations,peer_read_checks,peer_signal_releases to service_role;

create or replace function public.confirm_outing_presence(p_outing uuid,p_present boolean) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid:=auth.uid();
begin
 if actor is null then raise exception 'Sign in required';end if;
 if not p_present then
  delete from outing_presence_confirmations where outing_id=p_outing and user_id=actor;
  delete from peer_observations where outing_id=p_outing and (observer_id=actor or subject_id=actor);
  update peer_signal_releases set invalidated_at=now();
  return;
 end if;
 if not exists(select 1 from outings o join outing_records r on r.outing_id=o.id
 where o.id=p_outing and o.state<>'cancelled' and o.starts_at+make_interval(mins=>o.duration_minutes)<=now()
 and actor=any(r.attended) and exists(select 1 from outing_members m where m.outing_id=o.id and m.user_id=actor and m.state='accepted'))
 then raise exception 'A host-confirmed completed outing is required';end if;
 insert into outing_presence_confirmations values(p_outing,actor,now()) on conflict do nothing;
end $$;
revoke all on function public.confirm_outing_presence(uuid,boolean) from public,anon;
grant execute on function public.confirm_outing_presence(uuid,boolean) to authenticated;

create or replace function public.peer_collection_context(p_outing uuid) returns jsonb
language plpgsql stable security definer set search_path=public,pg_temp as $$
declare actor uuid:=auth.uid(); peers jsonb;
begin
 if actor is null or not exists(select 1 from outing_records r join outings o on o.id=r.outing_id
 where r.outing_id=p_outing and actor=any(r.attended) and o.state<>'cancelled'
 and o.starts_at+make_interval(mins=>o.duration_minutes)<=now()) then return jsonb_build_object('eligible',false,'peers','[]'::jsonb);end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'handle',p.handle)),'[]') into peers
 from profiles p join outing_presence_confirmations c on c.user_id=p.id and c.outing_id=p_outing
 join outing_records r on r.outing_id=p_outing
 where p.id<>actor and p.status='active' and p.id=any(r.attended) and not pair_restricted(actor,p.id)
 and exists(select 1 from outing_presence_confirmations where outing_id=p_outing and user_id=actor);
 return jsonb_build_object('eligible',true,'confirmed',exists(select 1 from outing_presence_confirmations where outing_id=p_outing and user_id=actor),'peers',peers);
end $$;
revoke all on function public.peer_collection_context(uuid) from public,anon;
grant execute on function public.peer_collection_context(uuid) to authenticated;

create or replace function public.submit_peer_observation(p_outing uuid,p_subject uuid,p_question text,p_option text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid:=auth.uid();
begin
 if actor is null then raise exception 'Sign in required';end if;
 if p_option is null then
  delete from peer_observations where outing_id=p_outing and observer_id=actor and subject_id=p_subject and question_id=p_question;
  update peer_signal_releases set invalidated_at=now() where subject_id=p_subject;
  return;
 end if;
 if actor=p_subject or pair_restricted(actor,p_subject) or not exists(select 1 from profiles where id=p_subject and status='active')
 or not exists(select 1 from profiles where id=actor and status='active') then raise exception 'Observation unavailable';end if;
 if not exists(select 1 from outing_records r join outings o on o.id=r.outing_id
 join outing_presence_confirmations a on a.outing_id=r.outing_id and a.user_id=actor
 join outing_presence_confirmations b on b.outing_id=r.outing_id and b.user_id=p_subject
 where r.outing_id=p_outing and actor=any(r.attended) and p_subject=any(r.attended) and o.state<>'cancelled'
 and o.starts_at+make_interval(mins=>o.duration_minutes)<=now())
 then raise exception 'Confirmed shared attendance is required';end if;
 insert into peer_observations values(p_outing,actor,p_subject,p_question,1,p_option,now())
 on conflict(outing_id,observer_id,subject_id,question_id) do update set option_id=excluded.option_id,created_at=now();
 -- Updating an observation also withdraws the old contribution immediately.
 update peer_signal_releases set invalidated_at=now() where subject_id=p_subject;
end $$;
revoke all on function public.submit_peer_observation(uuid,uuid,text,text) from public,anon;
grant execute on function public.submit_peer_observation(uuid,uuid,text,text) to authenticated;

create or replace function public.can_submit_peer_read_check(p_subject uuid,p_hash text,p_writer text)
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select auth.uid() is not null and auth.uid()<>p_subject and not pair_restricted(auth.uid(),p_subject)
 and exists(select 1 from profiles where id=auth.uid() and status='active')
 and exists(select 1 from profiles where id=p_subject and status='active')
 and (select count(distinct r.outing_id) from outing_records r join outings o on o.id=r.outing_id
 join outing_presence_confirmations a on a.outing_id=r.outing_id and a.user_id=auth.uid()
 join outing_presence_confirmations b on b.outing_id=r.outing_id and b.user_id=p_subject
 where auth.uid()=any(r.attended) and p_subject=any(r.attended) and o.state<>'cancelled'
 and o.starts_at+make_interval(mins=>o.duration_minutes)<=now())>=2
 and exists(select 1 from composed_read_cache where viewer_id=auth.uid() and subject_id=p_subject
 and level='bond' and evidence_hash=p_hash and writer_version=p_writer and state='ready');
$$;
revoke all on function public.can_submit_peer_read_check(uuid,text,text) from public,anon;
grant execute on function public.can_submit_peer_read_check(uuid,text,text) to authenticated;

create or replace function public.submit_peer_read_check(p_subject uuid,p_hash text,p_writer text,p_option text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid:=auth.uid(); n integer;
begin
 if actor is null then raise exception 'Sign in required';end if;
 if p_option is null then delete from peer_read_checks where observer_id=actor and subject_id=p_subject and read_hash=p_hash;return;end if;
 if actor=p_subject or pair_restricted(actor,p_subject) then raise exception 'Read check unavailable';end if;
 if not can_submit_peer_read_check(p_subject,p_hash,p_writer) then raise exception 'Read check unavailable';end if;
 select count(distinct r.outing_id) into n from outing_records r join outings o on o.id=r.outing_id
 join outing_presence_confirmations a on a.outing_id=r.outing_id and a.user_id=actor
 join outing_presence_confirmations b on b.outing_id=r.outing_id and b.user_id=p_subject
 where actor=any(r.attended) and p_subject=any(r.attended) and o.state<>'cancelled'
 and o.starts_at+make_interval(mins=>o.duration_minutes)<=now();
 if n<2 then raise exception 'More than one confirmed shared outing is required';end if;
 if not exists(select 1 from composed_read_cache where viewer_id=actor and subject_id=p_subject and level='bond'
 and evidence_hash=p_hash and writer_version=p_writer and state='ready') then raise exception 'A viewed read version is required';end if;
 insert into peer_read_checks values(actor,p_subject,p_hash,p_writer,p_option,now())
 on conflict(observer_id,subject_id,read_hash) do update set option_id=excluded.option_id,created_at=now();
end $$;
revoke all on function public.submit_peer_read_check(uuid,text,text,text) from public,anon;
grant execute on function public.submit_peer_read_check(uuid,text,text,text) to authenticated;

create or replace function public.invalidate_peer_releases() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 -- Conservative invalidation avoids leaking which observation was suppressed.
 update peer_signal_releases set invalidated_at=now();
 if tg_op='DELETE' then return old;end if;return new;
end $$;
revoke all on function public.invalidate_peer_releases() from public,anon,authenticated;
drop trigger if exists invalidate_peer_blocks on blocks;
create trigger invalidate_peer_blocks after insert or update or delete on blocks for each statement execute function invalidate_peer_releases();
drop trigger if exists invalidate_peer_reports on reports;
create trigger invalidate_peer_reports after insert or update or delete on reports for each statement execute function invalidate_peer_releases();
drop trigger if exists invalidate_peer_attendance on outing_records;
create trigger invalidate_peer_attendance after insert or update or delete on outing_records for each statement execute function invalidate_peer_releases();
drop trigger if exists invalidate_peer_profile_status on profiles;
create trigger invalidate_peer_profile_status after update of status on profiles for each statement execute function invalidate_peer_releases();
drop trigger if exists invalidate_peer_outing_state on outings;
create trigger invalidate_peer_outing_state after update of state,starts_at,duration_minutes on outings for each statement execute function invalidate_peer_releases();
drop trigger if exists invalidate_peer_presence on outing_presence_confirmations;
create trigger invalidate_peer_presence after delete on outing_presence_confirmations for each statement execute function invalidate_peer_releases();

create or replace function public.read_peer_signals(p_subject uuid) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid:=auth.uid(); boundary timestamptz:=date_trunc('week',now() at time zone 'UTC') at time zone 'UTC';
 release peer_signal_releases; observers integer; outings_count integer; v_statements jsonb:='[]'; item record;
begin
 if actor is null or not exists(select 1 from profiles where id=actor and status='active') or (actor<>p_subject and pair_restricted(actor,p_subject)) or not exists(select 1 from profiles where id=p_subject and status='active') then return '[]';end if;
 insert into peer_signal_releases(subject_id,period_start) values(p_subject,boundary-interval '1 week') on conflict do nothing;
 select * into release from peer_signal_releases where subject_id=p_subject for update;
 if release.moderation_hold then return '[]';end if;
 if release.period_start=boundary then
  if release.invalidated_at is not null then return '[]';end if;
  return release.statements;
 end if;
 -- Most recent eligible joining observation per observer. Both taps never count twice.
 -- Exclude contributions from the current week; release timing does not reveal a tap.
 with latest as (
 select distinct on(p.observer_id) p.* from peer_observations p
 join profiles observer on observer.id=p.observer_id and observer.status='active'
 join outings o on o.id=p.outing_id join outing_records r on r.outing_id=o.id
 join outing_presence_confirmations a on a.outing_id=o.id and a.user_id=p.observer_id
 join outing_presence_confirmations b on b.outing_id=o.id and b.user_id=p.subject_id
 where p.subject_id=p_subject and p.question_id='peer.joining'
 and p.created_at<boundary and p.created_at>=boundary-interval '180 days'
 and o.state<>'cancelled' and p.observer_id=any(r.attended) and p.subject_id=any(r.attended)
 and not pair_restricted(p.observer_id,p.subject_id)
 order by p.observer_id,p.created_at desc,p.outing_id
 )
 select count(distinct observer_id),count(distinct outing_id) into observers,outings_count from latest where option_id<>'cannot_tell';
 if observers>=5 and outings_count>=3 then
  for item in with latest as (
   select distinct on(p.observer_id) p.* from peer_observations p
   join profiles observer on observer.id=p.observer_id and observer.status='active'
   join outings o on o.id=p.outing_id join outing_records r on r.outing_id=o.id
   join outing_presence_confirmations a on a.outing_id=o.id and a.user_id=p.observer_id
   join outing_presence_confirmations b on b.outing_id=o.id and b.user_id=p.subject_id
   where p.subject_id=p_subject and p.question_id='peer.joining'
   and p.created_at<boundary and p.created_at>=boundary-interval '180 days'
   and o.state<>'cancelled' and p.observer_id=any(r.attended) and p.subject_id=any(r.attended)
   and not pair_restricted(p.observer_id,p.subject_id)
   order by p.observer_id,p.created_at desc,p.outing_id
  ) select option_id,count(*) n from latest where option_id<>'cannot_tell' group by option_id having count(*)>=3 and count(distinct outing_id)>=2 loop
   v_statements:=v_statements||jsonb_build_array(jsonb_build_object('evidenceLevel','PEER OBSERVATION','dimension','conversation_participation',
    'period',boundary,'text',case item.option_id when 'started' then 'People who shared outings with you noticed you starting conversation topics.'
     when 'picked_up' then 'People who shared outings with you noticed you picking up conversation topics.'
     else 'People who shared outings with you noticed you both starting and picking up conversation topics.' end));
  end loop;
 end if;
 update peer_signal_releases set period_start=boundary,invalidated_at=null,statements=v_statements,updated_at=now() where subject_id=p_subject;
 return v_statements;
end $$;
revoke all on function public.read_peer_signals(uuid) from public,anon;
grant execute on function public.read_peer_signals(uuid) to authenticated;
commit;
