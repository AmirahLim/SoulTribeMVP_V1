begin;
-- Intentionally no backfill: older onboarding promised privacy.
alter table public.profiles add column if not exists life_contexts text[] not null default '{}';
do $$ begin
if not exists (select 1 from pg_constraint where conrelid='public.profiles'::regclass and conname='profiles_life_contexts_valid') then
alter table public.profiles add constraint profiles_life_contexts_valid check (
 cardinality(life_contexts) <= 3 and
 life_contexts <@ array['Building My Career','Building Something of My Own','Adventure Era','Wild & Free','Slow Living','Settling Into Stability','Family Life','Travel & Exploring','Reinvention/Healing','Running on Empty','More Time, More Freedom','Figuring It Out']::text[]
 and array_position(life_contexts,null) is null
);
end if;
end $$;

-- Every write path must agree with the private, explicitly consented source.
-- Do not derive public values during unrelated profile updates.
create or replace function public.guard_public_life_context()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare answers jsonb; expected text[] := '{}'; contexts jsonb;
begin
 if tg_op='UPDATE' then
  if new.life_contexts is not distinct from old.life_contexts then return new; end if;
 end if;
 select onboarding into answers from public.profile_answers where user_id=new.id;
 if answers #> '{baselineV2,lifeContextsPublic}' = 'true'::jsonb then
  contexts := answers #> '{baselineV2,lifeContexts}';
  if not coalesce(public.onboarding_selection_valid(contexts,
   array['Building My Career','Building Something of My Own','Adventure Era','Wild & Free','Slow Living','Settling Into Stability','Family Life','Travel & Exploring','Reinvention/Healing','Running on Empty','More Time, More Freedom','Figuring It Out'],3,false),false) then
   raise exception 'Invalid life phases';
  end if;
  select coalesce(array_agg(value),'{}'::text[]) into expected from jsonb_array_elements_text(contexts);
 end if;
 if new.life_contexts is distinct from expected then
  raise exception 'Public life phases require explicit consent and must match private selections';
 end if;
 return new;
end $$;
revoke all on function public.guard_public_life_context() from public,anon,authenticated;
create or replace trigger guard_public_life_context
before insert or update of life_contexts on public.profiles
for each row execute function public.guard_public_life_context();

create or replace function public.project_public_life_context()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare contexts jsonb; published text[] := '{}';
begin
 if tg_op='DELETE' then
  update public.profiles set life_contexts='{}' where id=old.user_id;
  return old;
 end if;
 contexts := new.onboarding #> '{baselineV2,lifeContexts}';
 if new.onboarding #> '{baselineV2,lifeContextsPublic}' = 'true'::jsonb then
  if not coalesce(public.onboarding_selection_valid(contexts,
    array['Building My Career','Building Something of My Own','Adventure Era','Wild & Free','Slow Living','Settling Into Stability','Family Life','Travel & Exploring','Reinvention/Healing','Running on Empty','More Time, More Freedom','Figuring It Out'],3,false),false) then
   raise exception 'Invalid life phases';
  end if;
  select coalesce(array_agg(value),'{}'::text[]) into published from jsonb_array_elements_text(contexts);
 end if;
 update public.profiles set life_contexts=published where id=new.user_id;
 return new;
end;
$$;
revoke all on function public.project_public_life_context() from public, anon, authenticated;
create or replace trigger project_public_life_context
after insert or update of onboarding or delete on public.profile_answers
for each row execute function public.project_public_life_context();
notify pgrst, 'reload schema';
commit;
