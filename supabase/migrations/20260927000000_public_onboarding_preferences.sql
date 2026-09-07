begin;
-- No backfill. Only a new explicit sharing choice publishes saved answers.
alter table public.profiles add column if not exists public_onboarding jsonb not null default '{}';
create or replace function public.public_onboarding_snapshot(p jsonb)
returns jsonb language plpgsql immutable set search_path=public,pg_temp as $$
declare result jsonb; k text;
begin
 if p->'answersPublic' is distinct from 'true'::jsonb then return '{}'::jsonb; end if;
 if p->>'flowVersion' is distinct from '3' or not coalesce(public.validate_baseline_draft(p,true),false) then
  raise exception 'Complete and review your onboarding answers before sharing';
 end if;
 if p ? 'punctualityChoice' and (jsonb_typeof(p->'punctualityChoice') is distinct from 'string' or p->>'punctualityChoice' not in ('','Other','I’m usually early','On time','5–10 minutes either way is fine','I’m pretty relaxed about timing')) then raise exception 'Invalid punctuality choice'; end if;
 if p->>'punctualityChoice'='Other' and btrim(coalesce(p->>'punctualityOther',''))='' then raise exception 'Enter your timing preference'; end if;
 select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into result from jsonb_each(p)
 where key=any(array['intent','intentOther','clicks','clicksOther','group','groupChoices','desiredQualities','qualityOther','connectionChoice','connectionOther','planningChoice','planningOther','punctualityChoice','punctualityOther','outings','outingOther']);
 return result;
end $$;
revoke all on function public.public_onboarding_snapshot(jsonb) from public,anon,authenticated;

create or replace function public.guard_public_onboarding()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare expected jsonb;
begin
 if tg_op='UPDATE' then
  if new.public_onboarding is not distinct from old.public_onboarding then return new; end if;
 end if;
 select public.public_onboarding_snapshot(onboarding->'baselineV2') into expected from public.profile_answers where user_id=new.id;
 if new.public_onboarding is distinct from coalesce(expected,'{}'::jsonb) then raise exception 'Public answers require explicit sharing consent'; end if;
 return new;
end $$;
revoke all on function public.guard_public_onboarding() from public,anon,authenticated;
create or replace trigger guard_public_onboarding before insert or update of public_onboarding on public.profiles for each row execute function public.guard_public_onboarding();

create or replace function public.project_public_onboarding()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if tg_op='DELETE' then
  update public.profiles set public_onboarding='{}' where id=old.user_id;
  return old;
 end if;
 update public.profiles set public_onboarding=public.public_onboarding_snapshot(new.onboarding->'baselineV2') where id=new.user_id;
 return new;
end $$;
revoke all on function public.project_public_onboarding() from public,anon,authenticated;
create or replace trigger project_public_onboarding after insert or update of onboarding or delete on public.profile_answers for each row execute function public.project_public_onboarding();
notify pgrst,'reload schema';
commit;
