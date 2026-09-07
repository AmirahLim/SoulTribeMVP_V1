begin;
-- A new baseline does not ask depth or willingness to host. Keep historical values intact.
alter table trait_intent alter column depth drop not null;
alter table trait_intent alter column depth drop default;
alter table trait_intent alter column open_to_hosting drop default;
-- Capability-protected drafts. No anonymous SELECT/UPDATE policies or table grants.
create table onboarding_drafts (
 token_hash text primary key,
 payload jsonb not null,
 revision integer not null default 1,
 expires_at timestamptz not null default now()+interval '7 days',
 claimed_by uuid references auth.users on delete cascade,
 claimed_at timestamptz
);
alter table onboarding_drafts enable row level security;
revoke all on onboarding_drafts from public,anon,authenticated;
create index onboarding_drafts_expiry on onboarding_drafts(expires_at);
create table onboarding_funnel_events (
 id bigint generated always as identity primary key,
 event_type text not null check(event_type in ('draft_saved','profile_claimed')),
 step integer not null check(step between 1 and 6),
 created_at timestamptz not null default now()
);
alter table onboarding_funnel_events enable row level security;
revoke all on onboarding_funnel_events from public,anon,authenticated;

create function onboarding_selection_valid(v jsonb, choices text[], cap integer, required boolean default false)
returns boolean language sql immutable set search_path=public as $$
 select case when jsonb_typeof(v)='array' then
 jsonb_array_length(v) between case when required then 1 else 0 end and cap
 and not exists(select 1 from jsonb_array_elements_text(v) x where not (x=any(choices)))
 and (select count(*)=count(distinct x) from jsonb_array_elements_text(v) x)
 else false end
$$;
create function validate_baseline_draft(p jsonb, complete boolean default false)
returns boolean language plpgsql immutable set search_path=public as $$
declare k text;
begin
 if p->>'version' is distinct from '2' or not ((p->>'step')::int between 1 and 6) or octet_length(p::text)>8192 then return false; end if;
 if not onboarding_selection_valid(p->'intent',array['Close circle','People to do things with','Real conversations','Wider social circle','New perspectives','Sense of community'],3,complete)
 or not onboarding_selection_valid(p->'clicks',array['We skip the small talk','Our humour just lands','We share niche rabbit holes','They make me think differently','Comfortable silence feels easy','We actually make plans happen'],3,complete)
 or not onboarding_selection_valid(p->'outings',array['Specialty Coffee','Food Hunts','Gallery Hopping','Pottery & Making','Vinyl & Listening Bars','Indie Gigs','Indie Cinema','Bookshops & Ideas','Analog Photo Walks','Nature & Trails','Games Nights','Neighbourhood Wanders'],5,complete) then return false; end if;
 if coalesce(p->>'group','') not in ('','1:1','Small circle','Social mix','Big energy') then return false; end if;
 foreach k in array array['contact','planning','opening'] loop
  if p->>k is not null and (p->>k)::numeric not in (0,.25,.5,.75,1) then return false; end if;
  if complete and p->>k is null then return false; end if;
 end loop;
 if length(coalesce(p->>'handle',''))>20 or coalesce(p->>'area','') not in ('','Ang Mo Kio','Bedok','Bishan','Bukit Batok','Bukit Merah','Bukit Panjang','Bukit Timah','Choa Chu Kang','Clementi','Downtown Core','Geylang','Hougang','Jurong East','Jurong West','Kallang','Marine Parade','Novena','Orchard','Outram','Pasir Ris','Punggol','Queenstown','River Valley','Rochor','Sembawang','Sengkang','Serangoon','Singapore River','Tampines','Tanglin','Toa Payoh','Woodlands','Yishun') then return false; end if;
 if coalesce(p->>'travel','') not in ('','Nearby','Across my side of Singapore','Anywhere in Singapore') then return false; end if;
 if complete and (coalesce(p->>'handle','') !~ '^[a-z0-9_]{3,20}$' or coalesce(p->>'group','')='' or coalesce(p->>'area','')='' or coalesce(p->>'travel','')='') then return false; end if;
 return true;
exception when others then return false;
end $$;

create function save_onboarding_draft(p_token text,p_payload jsonb)
returns void language plpgsql security definer set search_path=public as $$
begin
 if p_token !~ '^[a-f0-9]{64}$' or not coalesce(validate_baseline_draft(p_payload),false) then raise exception 'Invalid draft'; end if;
 insert into onboarding_drafts(token_hash,payload) values(encode(sha256(convert_to(p_token,'UTF8')),'hex'),p_payload)
 on conflict(token_hash) do update set payload=excluded.payload,revision=onboarding_drafts.revision+1
 where onboarding_drafts.claimed_by is null and onboarding_drafts.expires_at>now() and onboarding_drafts.revision<500;
 if not found then raise exception 'Draft expired or already saved'; end if;
 insert into onboarding_funnel_events(event_type,step) values('draft_saved',(p_payload->>'step')::integer);
end $$;
create function read_onboarding_draft(p_token text)
returns jsonb language sql security definer set search_path=public as $$
 select payload from onboarding_drafts where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and expires_at>now() and (claimed_by is null or claimed_by=auth.uid())
$$;

-- Preserve historical node IDs. These are new leaves, not replacements.
insert into interest_nodes(id,parent_id,name,path,approved) values
 (116,3,'Vinyl & Listening Bars','culture.vinyl_listening',true),
 (117,4,'Analog Photo Walks','creative.analog_photo_walks',true),
 (118,5,'Neighbourhood Wanders','outdoors.neighbourhood_wanders',true)
 on conflict(id) do nothing;
select setval('interest_nodes_id_seq',(select max(id) from interest_nodes));

create function claim_onboarding_draft(p_token text,p_display_name text,p_birth_year integer)
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
  jsonb_build_object('onboarding',jsonb_build_object('baselineV2',p,'displayName',trim(p_display_name),'handle',p->>'handle','homeArea',p->>'area','birthYear',p_birth_year,'q1Finding',p->'intent','q2Feelings',p->'clicks','q3GroupSize',p->>'group','q6Outings',p->'outings')),
  jsonb_build_object('trait_intent',jsonb_build_object('intents',p->'intent'),
   'trait_communication',jsonb_build_object('conv_styles',contact_styles,'contact_frequency_expect',(p->>'contact')::numeric),
   'trait_social_rhythm',jsonb_build_object('planning_horizon',(p->>'planning')::numeric),
   'trait_emotional',jsonb_build_object('er_opening_pace',(p->>'opening')::numeric),
   'trait_experience',jsonb_build_object('group_size_pref',case p->>'group' when '1:1' then 0 when 'Small circle' then .333 when 'Social mix' then .667 else 1 end),
   'trait_geography',jsonb_build_object('home_area',p->>'area','radius_minutes',jsonb_build_object('coffee',distance,'dining',distance,'active',distance,'cultural',distance,'nightlife',distance,'creative',distance))),null);
 -- Merge, never delete prior interests or their affinity.
 insert into user_interests(user_id,node_id,affinity) select actor,id,'curious' from interest_nodes where id=any(interest_ids) and approved on conflict do nothing;
 update onboarding_drafts set claimed_by=actor,claimed_at=now() where token_hash=d.token_hash;
 insert into onboarding_funnel_events(event_type,step) values('profile_claimed',6);
 return p;
end $$;

revoke all on function save_onboarding_draft(text,jsonb),read_onboarding_draft(text),claim_onboarding_draft(text,text,integer) from public;
grant execute on function save_onboarding_draft(text,jsonb),read_onboarding_draft(text) to anon,authenticated;
grant execute on function claim_onboarding_draft(text,text,integer) to authenticated;
-- Deployment scheduler should invoke daily. Expired capabilities cannot be read or claimed.
create function purge_onboarding_drafts() returns void language sql security definer set search_path=public as $$ delete from onboarding_drafts where expires_at<=now() $$;
revoke all on function purge_onboarding_drafts() from public,anon,authenticated;
grant execute on function purge_onboarding_drafts() to service_role;
commit;
