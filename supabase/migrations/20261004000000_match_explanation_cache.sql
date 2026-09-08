begin;
alter table public.profiles add column if not exists explanation_revision bigint not null default 0;
alter table public.match_explanations add column if not exists revision_a bigint not null default -1;
alter table public.match_explanations add column if not exists revision_b bigint not null default -1;
alter table public.match_explanations add column if not exists input_hash text not null default '';
-- Derived cache is server-only. Existing RLS remains enabled; no browser writers.
drop policy if exists match_explanations_read on public.match_explanations;
revoke all on public.match_explanations from anon,authenticated;
grant select,insert,update,delete on public.match_explanations to service_role;
create index if not exists match_explanations_user_b_idx on public.match_explanations(user_b);

create or replace function public.advance_explanation_revision()
returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 NEW.explanation_revision:=case when TG_OP='INSERT' then 0 else OLD.explanation_revision+1 end;
 return NEW;
end $$;
create or replace function public.invalidate_profile_explanations()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 delete from match_explanations where user_a=NEW.id or user_b=NEW.id;
 return NEW;
end $$;
create or replace function public.invalidate_changed_matching_inputs()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare old_data jsonb:='{}'; new_data jsonb:='{}'; affected uuid[];
begin
 if TG_OP<>'INSERT' then old_data:=to_jsonb(OLD); end if;
 if TG_OP<>'DELETE' then new_data:=to_jsonb(NEW); end if;
 select array_agg(distinct x::uuid order by x::uuid) into affected from (
  select value as x from jsonb_each_text(old_data)
   where key in ('user_id','blocker_id','blocked_id','reporter_id','reported_id')
  union select value from jsonb_each_text(new_data)
   where key in ('user_id','blocker_id','blocked_id','reporter_id','reported_id')
 ) ids where x is not null;
 -- Stable locking order, then profile revision trigger invalidates both directions.
 perform id from profiles where id=any(affected) order by id for update;
 update profiles set explanation_revision=explanation_revision where id=any(affected);
 return null;
end $$;

drop trigger if exists advance_explanation_revision on public.profiles;
create trigger advance_explanation_revision before insert or update on public.profiles
 for each row execute function public.advance_explanation_revision();
drop trigger if exists invalidate_profile_explanations on public.profiles;
create trigger invalidate_profile_explanations after insert or update on public.profiles
 for each row execute function public.invalidate_profile_explanations();
do $$
declare t text;
begin
 foreach t in array array['profile_answers','trait_intent','trait_communication','trait_personality',
 'trait_social_rhythm','trait_emotional','trait_experience','trait_lifestyle','trait_geography',
 'user_values','user_interests','blocks','reports'] loop
  execute format('drop trigger if exists invalidate_matching_inputs on public.%I',t);
  execute format('create trigger invalidate_matching_inputs after insert or update or delete on public.%I for each row execute function public.invalidate_changed_matching_inputs()',t);
 end loop;
end $$;

create or replace function public.validate_explanation_snapshot()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 -- Locks serialize a cache write against changes to either profile or safety data.
 perform id from profiles where id in (NEW.user_a,NEW.user_b) order by id for share;
 if not exists(select 1 from profiles where id=NEW.user_a and status='active'
      and profile_version=NEW.version_a and explanation_revision=NEW.revision_a)
 or not exists(select 1 from profiles where id=NEW.user_b and status='active'
      and profile_version=NEW.version_b and explanation_revision=NEW.revision_b)
 or exists(select 1 from blocks where (blocker_id=NEW.user_a and blocked_id=NEW.user_b) or (blocker_id=NEW.user_b and blocked_id=NEW.user_a))
 or exists(select 1 from reports where (reporter_id=NEW.user_a and reported_id=NEW.user_b) or (reporter_id=NEW.user_b and reported_id=NEW.user_a))
 then raise exception 'Matching inputs changed; retry the request' using errcode='40001'; end if;
 return NEW;
end $$;
drop trigger if exists validate_explanation_snapshot on public.match_explanations;
create trigger validate_explanation_snapshot before insert or update on public.match_explanations
 for each row execute function public.validate_explanation_snapshot();
revoke all on function public.advance_explanation_revision(),public.invalidate_profile_explanations(),
 public.invalidate_changed_matching_inputs(),public.validate_explanation_snapshot() from public,anon,authenticated;
commit;
