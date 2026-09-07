begin;
-- Keep original single-choice drafts readable. Never invent an average preference.
alter function validate_baseline_draft(jsonb,boolean) rename to validate_baseline_draft_single;
create function validate_baseline_draft(p jsonb, complete boolean default false)
returns boolean language plpgsql immutable set search_path=public as $$
begin
 if not coalesce(validate_baseline_draft_single(p,complete),false) then return false; end if;
 if p ? 'groupChoices' then
  return coalesce(onboarding_selection_valid(p->'groupChoices',array['1:1','Small circle','Social mix','Big energy'],2,complete),false)
   and coalesce(p->>'group','')=coalesce(p->'groupChoices'->>0,'');
 end if;
 return true;
end $$;
create or replace function claim_onboarding_draft(p_token text,p_display_name text,p_birth_year integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare d onboarding_drafts; p jsonb; actor uuid:=auth.uid(); contact_styles text[]; interest_ids integer[]; distance integer; old_answers jsonb;
begin
 if actor is null then raise exception 'Authentication required'; end if;
 -- Serialize claims from different drafts for the same authenticated account.
 perform 1 from auth.users where id=actor for update;
 select * into d from onboarding_drafts where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') for update;
 if not found or d.expires_at<=now() then raise exception 'Draft expired'; end if;
 if d.claimed_by=actor then return d.payload; end if;
 if d.claimed_by is not null then raise exception 'Draft already saved'; end if;
 if not coalesce(validate_baseline_draft(d.payload,true),false) then raise exception 'Complete the five questions and your profile details'; end if;
 if p_display_name is null or length(trim(p_display_name)) not between 1 and 80 or p_birth_year is null or p_birth_year not between 1930 and extract(year from now())::int-18 then raise exception 'Enter your name and valid adult birth year'; end if;
 select onboarding into old_answers from profile_answers where user_id=actor;
 if exists(select 1 from profiles where id=actor) then raise exception 'Existing profile preserved'; end if;
 p:=d.payload;
 -- Choice of a conversation moment is not proof of debate preference or personality.
 select coalesce(array_agg(style),'{}') into contact_styles from (values
 ('We skip the small talk','deep'),('Our humour just lands','banter')) m(label,style) where p->'clicks' ? label;
 select array_agg(id) into interest_ids from (values
 ('Specialty Coffee',101),('Food Hunts',104),('Gallery Hopping',106),('Pottery & Making',113),('Vinyl & Listening Bars',116),('Indie Gigs',107),('Indie Cinema',115),('Bookshops & Ideas',105),('Analog Photo Walks',117),('Nature & Trails',109),('Games Nights',111),('Neighbourhood Wanders',118)) m(label,id) where p->'outings' ? label;
 distance:=case p->>'travel' when 'Nearby' then 20 when 'Across my side of Singapore' then 35 else 60 end;
 perform save_profile_bundle(
  jsonb_build_object('handle',p->>'handle','display_name',trim(p_display_name),'home_area',p->>'area','birth_year',p_birth_year),
  jsonb_build_object('onboarding',jsonb_build_object('baselineV2',p,'displayName',trim(p_display_name),'handle',p->>'handle','homeArea',p->>'area','birthYear',p_birth_year,'q1Finding',p->'intent','q2Feelings',p->'clicks','q3GroupSize',case when jsonb_array_length(coalesce(p->'groupChoices','[]'::jsonb)) > 1 then null else p->>'group' end,'q6Outings',p->'outings')),
  jsonb_build_object('trait_intent',jsonb_build_object('intents',p->'intent'),
   'trait_communication',jsonb_build_object('conv_styles',contact_styles,'contact_frequency_expect',(p->>'contact')::numeric),
   'trait_social_rhythm',jsonb_build_object('planning_horizon',(p->>'planning')::numeric),
   'trait_emotional',jsonb_build_object('er_opening_pace',(p->>'opening')::numeric),
   'trait_experience',jsonb_build_object('group_size_pref',case when jsonb_array_length(coalesce(p->'groupChoices','[]'::jsonb)) > 1 then null else case p->>'group' when '1:1' then 0 when 'Small circle' then .333 when 'Social mix' then .667 else 1 end end),
   'trait_geography',jsonb_build_object('home_area',p->>'area','radius_minutes',jsonb_build_object('coffee',distance,'dining',distance,'active',distance,'cultural',distance,'nightlife',distance,'creative',distance))),null);
 -- Merge, never delete prior interests or their affinity.
 insert into user_interests(user_id,node_id,affinity) select actor,id,'curious' from interest_nodes where id=any(interest_ids) and approved on conflict do nothing;
 update onboarding_drafts set claimed_by=actor,claimed_at=now() where token_hash=d.token_hash;
 insert into onboarding_funnel_events(event_type,step) values('profile_claimed',6);
 return p;
end $$;

commit;

