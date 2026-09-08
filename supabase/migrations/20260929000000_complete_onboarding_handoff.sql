begin;
-- No guessed associations or historical backfill. Bind new authenticated draft
-- writes to their actual account; retain completed drafts as claimed receipts.
alter table public.onboarding_drafts add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.onboarding_drafts add column if not exists base_profile_version integer;

create or replace function public.save_onboarding_draft(p_token text,p_payload jsonb)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid:=auth.uid(); current_version integer;
begin
 if p_token !~ '^[a-f0-9]{64}$' or not coalesce(validate_baseline_draft(p_payload),false) then raise exception 'Invalid draft'; end if;
 if p_payload ? 'displayName' and (jsonb_typeof(p_payload->'displayName') is distinct from 'string' or length(btrim(p_payload->>'displayName')) not between 1 and 80) then raise exception 'Enter your display name'; end if;
 select profile_version into current_version from profiles where id=actor;
 insert into onboarding_drafts(token_hash,payload,owner_id,base_profile_version)
 values(encode(sha256(convert_to(p_token,'UTF8')),'hex'),p_payload,actor,current_version)
 on conflict(token_hash) do update set payload=excluded.payload,revision=onboarding_drafts.revision+1,
  owner_id=coalesce(onboarding_drafts.owner_id,actor),
  base_profile_version=case when onboarding_drafts.owner_id is null then current_version else onboarding_drafts.base_profile_version end
 where onboarding_drafts.claimed_by is null and onboarding_drafts.expires_at>now() and onboarding_drafts.revision<500
  and (onboarding_drafts.owner_id is null or onboarding_drafts.owner_id=actor);
 if not found then raise exception 'Draft unavailable, expired or already saved'; end if;
 insert into onboarding_funnel_events(event_type,step) values('draft_saved',(p_payload->>'step')::integer);
end $$;

create or replace function public.read_onboarding_draft(p_token text)
returns jsonb language sql security definer set search_path=public,pg_temp as $$
 select payload from onboarding_drafts
 where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and expires_at>now()
 and (owner_id is null or owner_id=auth.uid()) and (claimed_by is null or claimed_by=auth.uid())
$$;

-- Save the old entry point once for historical, pre-identity draft compatibility.
create or replace function public.read_onboarding_handoff(p_token text)
returns jsonb language sql security definer set search_path=public,pg_temp as $$
 select jsonb_build_object('draft',payload,'claimed',claimed_by is not null) from onboarding_drafts
 where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and expires_at>now()
 and (owner_id is null or owner_id=auth.uid()) and (claimed_by is null or claimed_by=auth.uid())
$$;
revoke all on function public.read_onboarding_handoff(text) from public;
grant execute on function public.read_onboarding_handoff(text) to anon,authenticated;

do $$ begin
 if to_regprocedure('public.claim_onboarding_draft_before_handoff(text,text,integer)') is null then
  execute replace(pg_get_functiondef('public.claim_onboarding_draft(text,text,integer)'::regprocedure),
   'FUNCTION public.claim_onboarding_draft(', 'FUNCTION public.claim_onboarding_draft_before_handoff(');
 end if;
end $$;
revoke all on function public.claim_onboarding_draft_before_handoff(text,text,integer) from public,anon,authenticated;

create or replace function public.claim_onboarding_draft(p_token text,p_display_name text,p_birth_year integer)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare d onboarding_drafts; p jsonb; actor uuid:=auth.uid(); existing profiles;
 old_answers jsonb; contact_styles text[]; interest_ids integer[]; identity_patch jsonb; trait_patch jsonb;
begin
 if actor is null then raise exception 'Authentication required'; end if;
 perform 1 from auth.users where id=actor for update;
 select * into d from onboarding_drafts where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') for update;
 if not found or d.expires_at<=now() then raise exception 'Draft expired'; end if;
 if d.owner_id is not null and d.owner_id<>actor then raise exception 'Draft belongs to another account'; end if;
 if d.claimed_by=actor then return d.payload; end if;
 if d.claimed_by is not null then raise exception 'Draft already saved'; end if;
 if not(d.payload ? 'setupRevision') then
  return claim_onboarding_draft_before_handoff(p_token,p_display_name,p_birth_year);
 end if;
 if not coalesce(validate_baseline_draft(d.payload,true),false) then raise exception 'Complete your onboarding questions and profile details'; end if;
 p:=d.payload;
 select * into existing from profiles where id=actor for update;
 select onboarding into old_answers from profile_answers where user_id=actor;
 if existing.id is not null then
  if existing.status<>'active' then raise exception 'Profile cannot be updated'; end if;
  -- Only an authenticated editing session may replace an existing baseline.
  -- A stale or unbound pre-sign-in draft must not silently replace saved answers.
  if old_answers ? 'baselineV2' and (d.owner_id is distinct from actor or d.base_profile_version is distinct from existing.profile_version) then
   raise exception 'Your profile changed. Reopen onboarding before saving changes';
  end if;
  if existing.handle is distinct from p->>'handle' then raise exception 'Use your existing profile handle when saving onboarding'; end if;
  p_display_name:=existing.display_name;
  p_birth_year:=coalesce(existing.birth_year,p_birth_year);
  -- An INSERT..ON CONFLICT would run public-projection INSERT guards before
  -- reaching the existing row. Use a scoped UPDATE in this same transaction.
  identity_patch:=null;
 else
  identity_patch:=jsonb_build_object('handle',p->>'handle','display_name',btrim(p_display_name),'home_area',p->>'area','birth_year',p_birth_year);
 end if;
 if p_display_name is null or length(btrim(p_display_name)) not between 1 and 80 or p_birth_year is null
  or p_birth_year not between 1930 and extract(year from now())::int-18 then raise exception 'Enter your name and valid adult birth year'; end if;

 -- Preserve the existing scoring mappings. Missing/unasked traits are not invented.
 select coalesce(array_agg(style),'{}') into contact_styles from (values
 ('We skip the small talk','deep'),('Our humour just lands','banter')) m(label,style) where p->'clicks' ? label;
 select array_agg(id) into interest_ids from (values
 ('Specialty Coffee',101),('Food Hunts',104),('Gallery Hopping',106),('Pottery & Making',113),('Vinyl & Listening Bars',116),('Indie Gigs',107),('Indie Cinema',115),('Bookshops & Ideas',105),('Analog Photo Walks',117),('Nature & Trails',109),('Games Nights',111),('Neighbourhood Wanders',118)) m(label,id) where p->'outings' ? label;
 trait_patch:=jsonb_build_object(
  'trait_intent',jsonb_build_object('intents',(p->'intent')-'Other'),
  'trait_communication',jsonb_build_object('conv_styles',contact_styles,'contact_frequency_expect',(p->>'contact')::numeric),
  'trait_social_rhythm',jsonb_build_object('planning_horizon',(p->>'planning')::numeric),
  'trait_experience',jsonb_build_object('group_size_pref',case when jsonb_array_length(coalesce(p->'groupChoices','[]'::jsonb))>1 then null else case p->>'group' when '1:1' then 0 when 'Small circle' then .333 when 'Social mix' then .667 else 1 end end),
  'trait_geography',jsonb_build_object('home_area',p->>'area','country',p->>'country','radius_km',(p->>'travelKm')::integer,'radius_minutes','{}'::jsonb));
 if existing.id is null or p->>'opening' is not null then
  trait_patch:=trait_patch||jsonb_build_object('trait_emotional',jsonb_build_object('er_opening_pace',(p->>'opening')::numeric));
 end if;
 if existing.id is not null then
  update profiles set home_area=p->>'area',birth_year=p_birth_year where id=actor;
 end if;
 perform save_profile_bundle(identity_patch,
  jsonb_build_object('onboarding',coalesce(old_answers,'{}'::jsonb)||jsonb_build_object(
   'baselineV2',p,'displayName',btrim(p_display_name),'handle',p->>'handle','homeArea',p->>'area','birthYear',p_birth_year,
   'q1Finding',p->'intent','q2Feelings',p->'clicks','q3GroupSize',case when jsonb_array_length(coalesce(p->'groupChoices','[]'::jsonb))>1 then null else p->>'group' end,'q6Outings',p->'outings')),
  trait_patch,null);
 if p->>'flowVersion'='3' then
  insert into user_interests(user_id,node_id,affinity) select actor,id,'curious' from interest_nodes where approved and p->'outings' ? name and name<>'Other' on conflict do nothing;
 end if;
 insert into user_interests(user_id,node_id,affinity) select actor,id,'curious' from interest_nodes where id=any(interest_ids) and approved on conflict do nothing;
 update onboarding_drafts set owner_id=actor,claimed_by=actor,claimed_at=now() where token_hash=d.token_hash;
 insert into onboarding_funnel_events(event_type,step) values('profile_claimed',case when p->>'flowVersion'='3' then 7 else 6 end);
 return p;
end $$;

revoke all on function public.save_onboarding_draft(text,jsonb),public.read_onboarding_draft(text),public.claim_onboarding_draft(text,text,integer) from public,anon,authenticated;
grant execute on function public.save_onboarding_draft(text,jsonb),public.read_onboarding_draft(text) to anon,authenticated;
grant execute on function public.claim_onboarding_draft(text,text,integer) to authenticated;
-- No table grants or RLS policy changes.
notify pgrst,'reload schema';
commit;
