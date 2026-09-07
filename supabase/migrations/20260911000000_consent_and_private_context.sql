-- Additive hardening. Apply to a staging database before production.
begin;
create or replace function pair_restricted(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
 select exists(select 1 from blocks where (blocker_id=a and blocked_id=b) or (blocker_id=b and blocked_id=a))
 or exists(select 1 from reports where (reporter_id=a and reported_id=b) or (reporter_id=b and reported_id=a));
$$;
revoke all on function pair_restricted(uuid,uuid) from public, anon, authenticated;
-- Only boolean helpers involving the caller are exposed.
create or replace function can_interact_with(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
 select auth.uid() is not null and not pair_restricted(auth.uid(),b);
$$;
revoke all on function can_interact_with(uuid) from public;
grant execute on function can_interact_with(uuid) to authenticated;

create or replace function protect_account_fields() returns trigger
language plpgsql set search_path = public as $$
begin
 if auth.role() = 'authenticated' then
  if tg_op='INSERT' then
   if new.tier <> 'free' or new.status <> 'active' or new.is_demo then raise exception 'Protected account fields'; end if;
  elsif new.tier is distinct from old.tier or new.status is distinct from old.status or new.is_demo is distinct from old.is_demo then
   raise exception 'Protected account fields';
  end if;
 end if;
 return new;
end $$;
create trigger protect_account_fields before insert or update on profiles for each row execute function protect_account_fields();
drop policy profiles_select on profiles;
create policy profiles_select on profiles for select to authenticated using (id=auth.uid() or (status='active' and can_interact_with(id)));
drop policy user_values_public_read on user_values;
create policy user_values_public_read on user_values for select to authenticated using (visibility='public' and can_interact_with(user_id));

-- Full answer text belongs in an owner-only table, never the browseable profiles row.
create table profile_answers (
 user_id uuid primary key references profiles on delete cascade,
 onboarding jsonb not null default '{}',
 deep_profile jsonb not null default '{}',
 completed_categories integer[] not null default '{}',
 updated_at timestamptz not null default now()
);
alter table profile_answers enable row level security;
create policy profile_answers_own on profile_answers for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

-- Capacity is per outing, independent of paid tier. Defaults are configurable.
create table host_policy (
 host_type text primary key check(host_type in ('individual','community')),
 default_capacity integer not null check(default_capacity>=2),
 maximum_capacity integer check(maximum_capacity>=default_capacity)
);
insert into host_policy values ('individual',6,null),('community',30,null);
alter table host_policy enable row level security;
create policy host_policy_read on host_policy for select to authenticated using(true);
alter table outings add column host_type text not null default 'individual' references host_policy;
alter table outings add constraint valid_capacity check(max_participants>=2);
alter table outings add constraint valid_duration check(duration_minutes>0);
alter table outing_members drop constraint outing_members_state_check;
alter table outing_members add constraint outing_members_state_check check(state in ('invited','requested','accepted','declined','removed','withdrawn','waitlisted'));

create table outing_history (
 id bigint generated always as identity primary key,
 outing_id uuid not null references outings on delete cascade,
 user_id uuid references profiles on delete cascade,
 actor_id uuid references profiles on delete set null,
 from_state text, to_state text not null,
 created_at timestamptz not null default now()
);
alter table outing_history enable row level security;
create policy outing_history_read on outing_history for select to authenticated using(user_id=auth.uid() or is_host_of(outing_id));
create table outing_notifications (
 id bigint generated always as identity primary key,
 user_id uuid not null references profiles on delete cascade,
 outing_id uuid not null references outings on delete cascade,
 message text not null,
 read_at timestamptz,
 created_at timestamptz not null default now()
);
alter table outing_notifications enable row level security;
create policy outing_notifications_read on outing_notifications for select to authenticated using(user_id=auth.uid());
create policy outing_notifications_update on outing_notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select on outing_notifications to authenticated;
revoke update on outing_notifications from authenticated;
grant update(read_at) on outing_notifications to authenticated;

create or replace function guard_membership() returns trigger
language plpgsql security definer set search_path=public as $$
declare o outings; actor uuid := auth.uid(); n integer;
begin
 select * into o from outings where id=new.outing_id for update;
 if not found then raise exception 'Outing unavailable'; end if;
 if tg_op='UPDATE' and (new.outing_id<>old.outing_id or new.user_id<>old.user_id or new.role<>old.role) then raise exception 'Membership identity cannot change'; end if;
 if actor is not null then
  if o.state not in ('open','confirmed','draft') then raise exception 'Outing is closed'; end if;
  if new.user_id<>o.host_id and pair_restricted(new.user_id,o.host_id) then raise exception 'Action unavailable'; end if;
  if not exists(select 1 from profiles where id=actor and status='active') then raise exception 'Account unavailable'; end if;
  if tg_op='INSERT' then
   if not ((actor=o.host_id and new.user_id=o.host_id and new.role='host' and new.state='accepted')
    or (actor=o.host_id and new.user_id<>o.host_id and new.role='guest' and new.state='invited')
    or (actor=new.user_id and new.user_id<>o.host_id and new.role='guest' and new.state='requested' and o.visibility='requestable' and o.state in ('open','confirmed'))) then
    raise exception 'Invitation or host approval required';
   end if;
  elsif new.state is distinct from old.state then
   if old.role='host' then raise exception 'Cancel the outing to leave as host'; end if;
   if not ((actor=new.user_id and ((old.state='invited' and new.state in ('accepted','declined')) or (old.state in ('requested','accepted','invited','waitlisted') and new.state='withdrawn')))
    or (actor=o.host_id and ((old.state='requested' and new.state in ('accepted','declined')) or (old.state in ('invited','requested','accepted','waitlisted') and new.state='removed')))) then
    raise exception 'Invalid membership transition';
   end if;
   new.responded_at:=now();
  end if;
 end if;
 -- Invitations do not reserve a seat; acceptance is serialized on the outing row.
 if new.state='accepted' then
  select count(*) into n from outing_members where outing_id=o.id and state='accepted' and user_id<>new.user_id;
  if n>=o.max_participants then raise exception 'OUTING_FULL'; end if;
 end if;
 return new;
end $$;
drop trigger trg_outing_cap on outing_members;
create trigger guard_membership before insert or update on outing_members for each row execute function guard_membership();
drop policy outing_members_delete on outing_members;
drop policy outings_delete on outings;

create or replace function log_membership() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if tg_op='INSERT' or new.state is distinct from old.state then
  insert into outing_history(outing_id,user_id,actor_id,from_state,to_state) values(new.outing_id,new.user_id,auth.uid(),case when tg_op='UPDATE' then old.state else null end,new.state);
  if new.user_id<>auth.uid() then
   insert into outing_notifications(user_id,outing_id,message) values(new.user_id,new.outing_id,
    case new.state when 'invited' then 'You have an outing invitation.' when 'accepted' then 'Your place is confirmed.' when 'removed' then 'Your participation in this outing has changed.' else 'Your outing invitation has been updated.' end);
  end if;
 end if;
 return new;
end $$;
create trigger log_membership after insert or update on outing_members for each row execute function log_membership();

create or replace function guard_outing() returns trigger
language plpgsql security definer set search_path=public as $$
declare maximum integer; taken integer;
begin
 if tg_op='UPDATE' then
  if new.host_id<>old.host_id then raise exception 'Host cannot change'; end if;
  if old.state in ('cancelled','completed') and new is distinct from old then raise exception 'Outing is closed'; end if;
 end if;
 select maximum_capacity into maximum from host_policy where host_type=new.host_type;
 if maximum is not null and new.max_participants>maximum then raise exception 'Capacity exceeds host policy'; end if;
 select count(*) into taken from outing_members where outing_id=new.id and state='accepted';
 if new.max_participants<taken then raise exception 'Capacity is below confirmed attendance'; end if;
 return new;
end $$;
create trigger guard_outing before insert or update on outings for each row execute function guard_outing();

-- Transactional creation: the host membership cannot be omitted.
create or replace function initialize_outing() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 insert into outing_members(outing_id,user_id,role,state) values(new.id,new.host_id,'host','accepted');
 return new;
end $$;
create trigger initialize_outing after insert on outings for each row execute function initialize_outing();
create or replace function log_outing_state() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if new.state is distinct from old.state then
  insert into outing_history(outing_id,actor_id,from_state,to_state) values(new.id,auth.uid(),old.state,new.state);
  insert into outing_notifications(user_id,outing_id,message) select user_id,new.id,'The outing has been updated: '||new.state||'.' from outing_members where outing_id=new.id and user_id<>auth.uid() and state in ('accepted','invited','requested');
 end if;
 return new;
end $$;
create trigger log_outing_state after update on outings for each row execute function log_outing_state();

create or replace function has_outing_context(o uuid) returns boolean
language sql stable security definer set search_path=public as $$
 select exists(select 1 from outings x join outing_members m on m.outing_id=x.id where x.id=o and m.user_id=auth.uid() and m.state='accepted' and x.state in ('open','confirmed','completed') and not pair_restricted(auth.uid(),x.host_id));
$$;
revoke all on function has_outing_context(uuid) from public;
grant execute on function has_outing_context(uuid) to authenticated;
create table outing_logistics (
 outing_id uuid primary key references outings on delete cascade,
 venue_name text not null default '',
 meeting_details text not null default '' check(length(meeting_details)<=2000),
 venue_type text not null default 'public' check(venue_type='public'),
 updated_at timestamptz not null default now()
);
alter table outing_logistics enable row level security;
create policy logistics_read on outing_logistics for select to authenticated using(has_outing_context(outing_id));
create policy logistics_host on outing_logistics for all to authenticated using(is_host_of(outing_id)) with check(is_host_of(outing_id));
create table outing_messages (
 id bigint generated always as identity primary key,
 outing_id uuid not null references outings on delete cascade,
 author_id uuid not null references profiles on delete cascade,
 body text not null check(length(trim(body)) between 1 and 2000),
 created_at timestamptz not null default now()
);
alter table outing_messages enable row level security;
create policy messages_read on outing_messages for select to authenticated using(has_outing_context(outing_id) and can_interact_with(author_id));
create policy messages_insert on outing_messages for insert to authenticated with check(author_id=auth.uid() and has_outing_context(outing_id));

-- Reflections require actual shared attendance; they never overwrite stated traits.
create or replace function validate_reflection() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if new.author_id=new.about_id or not exists(select 1 from outing_records r join outings o on o.id=r.outing_id where r.outing_id=new.outing_id and new.author_id=any(r.attended) and new.about_id=any(r.attended) and o.starts_at+make_interval(mins=>o.duration_minutes)<=now()) then raise exception 'Shared attendance is required'; end if;
 if tg_op='UPDATE' and (new.author_id<>old.author_id or new.about_id<>old.about_id or new.outing_id<>old.outing_id) then raise exception 'Reflection identity cannot change'; end if;
 return new;
end $$;
create trigger validate_reflection before insert or update on rhythm_checks for each row execute function validate_reflection();
create or replace function validate_attendance() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if exists(select 1 from unnest(new.attended) a where not exists(select 1 from outing_members m where m.outing_id=new.outing_id and m.user_id=a and m.state='accepted')) then raise exception 'Attendance must be confirmed members'; end if;
 if not exists(select 1 from outings where id=new.outing_id and state<>'cancelled' and starts_at+make_interval(mins=>duration_minutes)<=now()) then raise exception 'Record attendance after the outing ends'; end if;
 return new;
end $$;
create trigger validate_attendance before insert or update on outing_records for each row execute function validate_attendance();
commit;
