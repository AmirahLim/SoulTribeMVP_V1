begin;
-- Reviewed adaptation of branch migration 20260925. Keep the hardened identity
-- claim function: it already saves the exact payload, country and travelKm.
-- Validate revision 2 directly; never substitute an age or location.
create or replace function validate_baseline_draft(p jsonb, complete boolean default false)
returns boolean language plpgsql immutable set search_path=public as $$
declare k text; choices text[]; otherkey text; expected_contact numeric; expected_planning numeric;
begin
 if not (p ? 'setupRevision') then return validate_baseline_draft_pre_identity(p,complete); end if;
 if not coalesce(p->>'setupRevision' in ('1','2'),false) or p->>'flowVersion' is distinct from '3' then return false; end if;
 foreach k in array case when p->>'setupRevision'='1' then array['area','country','ageOther'] else array['area','country'] end loop
  if jsonb_typeof(p->k) is distinct from 'string' or p->>k ~ '[[:cntrl:]]' then return false; end if;
 end loop;
 if length(p->>'area')>100 or length(p->>'country')>80 then return false; end if;
 if p->>'setupRevision'='1' and (p->>'ageBand' is null or not (p->>'ageBand'=any(array['','18–24','25–34','35–44','45–54','55+','Other']))) then return false; end if;
 if jsonb_typeof(p->'travelKm') is distinct from 'number' or (p->>'travelKm')::numeric not between 1 and 50 or trunc((p->>'travelKm')::numeric)<>(p->>'travelKm')::numeric then return false; end if;
 if p->>'setupRevision'='1' and (length(p->>'ageOther')>3 or (p->>'ageOther'<>'' and (p->>'ageOther' !~ '^[0-9]{2,3}$' or (p->>'ageOther')::int not between 18 and 120))) then return false; end if;
 if complete and (btrim(p->>'area')='' or btrim(p->>'country')='' or (p->>'setupRevision'='1' and (p->>'ageBand'='' or (p->>'ageBand'='Other' and p->>'ageOther'='')))) then return false; end if;
 if p->>'setupRevision'='2' and not coalesce(onboarding_selection_valid(p->'lifeContexts',array['Building My Career','Building Something of My Own','Adventure Era','Wild & Free','Slow Living','Settling Into Stability','Family Life','Travel & Exploring','Reinvention/Healing','Running on Empty','More Time, More Freedom','Figuring It Out'],3,complete),false) then return false; end if;
 -- Validate the actual six-question answers without substituted location values.
 if p->>'version' is distinct from '2' or not coalesce((p->>'step')::int between 1 and 7,false) or octet_length(p::text)>8192 then return false; end if;
 if length(coalesce(p->>'handle',''))>20 or (complete and coalesce(p->>'handle','') !~ '^[a-z0-9_]{3,20}$') then return false; end if;
 if not coalesce(onboarding_selection_valid(p->'intent',array['Close circle','People to do things with','Real conversations','Wider social circle','New perspectives','Sense of community','Other'],3,complete),false)
 or not coalesce(onboarding_selection_valid(p->'clicks',array['We skip the small talk','Our humour just lands','We share niche rabbit holes','They make me think differently','Comfortable silence feels easy','We actually make plans happen','Other'],3,complete),false)
 or not coalesce(onboarding_selection_valid(p->'desiredQualities',array['Curious','Reliable','Emotionally open','Playful','Thoughtful','Independent','Adventurous','Open-minded','Proactive','Free-spirit','Intellectually curious','Ambitious','Depth','Spiritual','Other'],5,complete),false)
 or not coalesce(onboarding_selection_valid(p->'outings',array['Specialty Coffee','Food Hunts','Ideas & Deep Dives','Drinks & Bar Hopping','Indie Cinema','Pottery & Making','Vinyl & Analog Culture','Nature & Hiking','Live Music & Gigs','Games Nights','Beach & Island Days','Photo Walks','Parties & Nightlife','Water Sports','Sports & Fitness','Other'],5,complete),false) then return false; end if;
 foreach k in array array['intentOther','clicksOther','qualityOther','outingOther','connectionOther','planningOther','punctualityOther'] loop
  if p ? k and (jsonb_typeof(p->k) is distinct from 'string' or length(p->>k)>120 or p->>k ~ '[[:cntrl:]]') then return false; end if;
 end loop;
 if complete and ((p->'intent' ? 'Other' and btrim(coalesce(p->>'intentOther',''))='') or (p->'clicks' ? 'Other' and btrim(coalesce(p->>'clicksOther',''))='') or (p->'desiredQualities' ? 'Other' and btrim(coalesce(p->>'qualityOther',''))='') or (p->'outings' ? 'Other' and btrim(coalesce(p->>'outingOther',''))='')) then return false; end if;
 if coalesce(p->>'group','') not in ('','1:1','Small circle','Social mix','Big energy') or (complete and coalesce(p->>'group','')='') then return false; end if;
 if p ? 'groupChoices' and (not coalesce(onboarding_selection_valid(p->'groupChoices',array['1:1','Small circle','Social mix','Big energy'],2,complete),false) or coalesce(p->>'group','')<>coalesce(p->'groupChoices'->>0,'')) then return false; end if;
 foreach k in array array['connectionChoice','planningChoice'] loop
  if k='connectionChoice' then choices:=array['A few times a week','About once a week','Every couple of weeks','Weeks/Months can pass, we’re still good']; otherkey:='connectionOther';
  else choices:=array['Same day','1–2 days','A few days','About a week','1–2 weeks ahead']; otherkey:='planningOther'; end if;
  if p->>k is null or not(p->>k=any(choices||array['','Other'])) then return false; end if;
  if complete and (p->>k='' or (p->>k='Other' and btrim(coalesce(p->>otherkey,''))='')) then return false; end if;
 end loop;
 expected_contact:=case p->>'connectionChoice' when 'A few times a week' then .75 when 'About once a week' then .5 when 'Every couple of weeks' then .25 when 'Weeks/Months can pass, we’re still good' then 0 else null end;
 expected_planning:=case p->>'planningChoice' when 'Same day' then 0 when '1–2 days' then .25 when 'A few days' then .5 when 'About a week' then .75 when '1–2 weeks ahead' then 1 else null end;
 if (p->>'contact')::numeric is distinct from expected_contact or (p->>'planning')::numeric is distinct from expected_planning then return false; end if;
 return true;
exception when others then return false;
end $$;
notify pgrst, 'reload schema';
commit;
