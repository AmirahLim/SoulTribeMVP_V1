begin;
alter table onboarding_funnel_events drop constraint onboarding_funnel_events_step_check;
alter table onboarding_funnel_events add constraint onboarding_funnel_events_step_check check(step between 1 and 7);
alter function validate_baseline_draft(jsonb,boolean) rename to validate_baseline_draft_five;
create function validate_baseline_draft(p jsonb, complete boolean default false)
returns boolean language plpgsql immutable set search_path=public as $$
declare q jsonb; k text; choices text[]; otherkey text; expected_contact numeric; expected_planning numeric;
begin
 if not(p ? 'flowVersion') then return validate_baseline_draft_five(p,complete); end if;
 if p->>'flowVersion' is distinct from '3' or p->>'version' is distinct from '2' or (p->>'step')::int not between 1 and 7 or octet_length(p::text)>8192 then return false; end if;
 foreach k in array array['qualityOther','outingOther','connectionOther','planningOther','punctualityOther'] loop
  if jsonb_typeof(p->k) is distinct from 'string' or length(p->>k)>120 or p->>k ~ '[[:cntrl:]]' then return false; end if;
 end loop;
 if not coalesce(onboarding_selection_valid(p->'desiredQualities',array['Curious','Reliable','Emotionally open','Playful','Thoughtful','Independent','Adventurous','Open-minded','Proactive','Other'],3,complete),false)
 or not coalesce(onboarding_selection_valid(p->'outings',array['Specialty Coffee','Food Hunts','Ideas & Deep Dives','Drinks & Bar Hopping','Indie Cinema','Pottery & Making','Vinyl & Analog Culture','Nature & Hiking','Live Music & Gigs','Games Nights','Beach & Island Days','Photo Walks','Parties & Nightlife','Water Sports','Sports & Fitness','Other'],5,complete),false) then return false; end if;
 if complete and ((p->'desiredQualities' ? 'Other' and btrim(p->>'qualityOther')='') or (p->'outings' ? 'Other' and btrim(p->>'outingOther')='')) then return false; end if;
 foreach k in array array['connectionChoice','planningChoice','punctualityChoice'] loop
  if k='connectionChoice' then choices:=array['A few times a week','About once a week','Every couple of weeks','Weeks/Months can pass, we’re still good']; otherkey:='connectionOther';
  elsif k='planningChoice' then choices:=array['Same day','1–2 days','A few days','About a week','1–2 weeks ahead']; otherkey:='planningOther';
  else choices:=array['I’m usually early','On time','5–10 minutes either way is fine','I’m pretty relaxed about timing']; otherkey:='punctualityOther'; end if;
  if p->>k is null or not (p->>k=any(choices||array['','Other'])) then return false; end if;
  if complete and (p->>k='' or (p->>k='Other' and btrim(p->>otherkey)='')) then return false; end if;
 end loop;
 expected_contact:=case p->>'connectionChoice' when 'A few times a week' then .75 when 'About once a week' then .5 when 'Every couple of weeks' then .25 when 'Weeks/Months can pass, we’re still good' then 0 else null end;
 expected_planning:=case p->>'planningChoice' when 'Same day' then 0 when '1–2 days' then .25 when 'A few days' then .5 when 'About a week' then .75 when '1–2 weeks ahead' then 1 else null end;
 if (p->>'contact')::numeric is distinct from expected_contact or (p->>'planning')::numeric is distinct from expected_planning then return false; end if;
 -- Validate unchanged identity and Q1–3 through the historical validator.
 -- These placeholders exist only in the validation copy, never in saved data.
 q:=p||jsonb_build_object('step',least((p->>'step')::int,6),'q4Revision',2,'desiredQualities',jsonb_build_array('Curious'),'outings',jsonb_build_array('Specialty Coffee'),'contact',0,'planning',0,'opening',0);
 return coalesce(validate_baseline_draft_five(q,complete),false);
exception when others then return false;
end $$;
-- Add exact activity leaves without replacing any historical IDs or names.
insert into interest_nodes(parent_id,name,path,approved)
select parent_id,name,path::ltree,true from (values
 (3,'Ideas & Deep Dives','culture.ideas_deep_dives'),
 (1,'Drinks & Bar Hopping','food.drinks_bar_hopping'),
 (3,'Vinyl & Analog Culture','culture.vinyl_analog'),
 (5,'Nature & Hiking','outdoors.nature_hiking'),
 (3,'Live Music & Gigs','culture.live_music_gigs'),
 (5,'Beach & Island Days','outdoors.beach_island'),
 (4,'Photo Walks','creative.photo_walks'),
 (3,'Parties & Nightlife','culture.parties_nightlife'),
 (2,'Water Sports','active.water_sports'),
 (2,'Sports & Fitness','active.sports_fitness')
) n(parent_id,name,path) where not exists(select 1 from interest_nodes i where i.path=n.path::ltree);
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
 if not coalesce(validate_baseline_draft(d.payload,true),false) then raise exception 'Complete your onboarding questions and profile details'; end if;
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
 -- Exact predefined activity labels may add approved nodes. Free text is never a node.
 if p->>'flowVersion'='3' then
  insert into user_interests(user_id,node_id,affinity)
  select actor,id,'curious' from interest_nodes where approved and p->'outings' ? name and name<>'Other'
  on conflict do nothing;
 end if;
 -- Merge, never delete prior interests or their affinity.
 insert into user_interests(user_id,node_id,affinity) select actor,id,'curious' from interest_nodes where id=any(interest_ids) and approved on conflict do nothing;
 update onboarding_drafts set claimed_by=actor,claimed_at=now() where token_hash=d.token_hash;
 insert into onboarding_funnel_events(event_type,step) values('profile_claimed',case when p->>'flowVersion'='3' then 7 else 6 end);
 return p;
end $$;


commit;
