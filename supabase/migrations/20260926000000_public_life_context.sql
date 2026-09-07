-- Intentionally no backfill: older onboarding promised privacy.
alter table public.profiles add column if not exists life_contexts text[] not null default '{}';
alter table public.profiles add constraint profiles_life_contexts_valid check (
 cardinality(life_contexts) <= 3 and
 life_contexts <@ array['Building My Career','Building Something of My Own','Adventure Era','Wild & Free','Slow Living','Settling Into Stability','Family Life','Travel & Exploring','Reinvention/Healing','Running on Empty','More Time, More Freedom','Figuring It Out']::text[]
 and array_position(life_contexts,null) is null
);

create or replace function public.project_public_life_context()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare contexts jsonb; published text[] := '{}';
begin
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
create trigger project_public_life_context
after insert or update of onboarding on public.profile_answers
for each row execute function public.project_public_life_context();
