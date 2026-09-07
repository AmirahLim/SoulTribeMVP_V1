begin;
-- Keep historical answers valid; add desired qualities without inferring self traits.
create or replace function validate_baseline_draft(p jsonb, complete boolean default false)
returns boolean language plpgsql immutable set search_path=public as $$
declare q jsonb; k text; choices text[]; otherkey text; expected_contact numeric; expected_planning numeric;
begin
 if not(p ? 'flowVersion') then return validate_baseline_draft_five(p,complete); end if;
 if p->>'flowVersion' is distinct from '3' or p->>'version' is distinct from '2' or (p->>'step')::int not between 1 and 7 or octet_length(p::text)>8192 then return false; end if;
 foreach k in array array['intentOther','clicksOther'] loop
  if p ? k and (jsonb_typeof(p->k) is distinct from 'string' or length(p->>k)>120 or p->>k ~ '[[:cntrl:]]') then return false; end if;
 end loop;
 if not coalesce(onboarding_selection_valid(p->'intent',array['Close circle','People to do things with','Real conversations','Wider social circle','New perspectives','Sense of community','Other'],3,complete),false)
 or not coalesce(onboarding_selection_valid(p->'clicks',array['We skip the small talk','Our humour just lands','We share niche rabbit holes','They make me think differently','Comfortable silence feels easy','We actually make plans happen','Other'],3,complete),false) then return false; end if;
 if complete and ((p->'intent' ? 'Other' and btrim(coalesce(p->>'intentOther',''))='') or (p->'clicks' ? 'Other' and btrim(coalesce(p->>'clicksOther',''))='')) then return false; end if;
 foreach k in array array['qualityOther','outingOther','connectionOther','planningOther','punctualityOther'] loop
  if jsonb_typeof(p->k) is distinct from 'string' or length(p->>k)>120 or p->>k ~ '[[:cntrl:]]' then return false; end if;
 end loop;
 if not coalesce(onboarding_selection_valid(p->'desiredQualities',array['Curious','Reliable','Emotionally open','Playful','Thoughtful','Independent','Adventurous','Open-minded','Proactive','Free-spirit','Intellectually curious','Ambitious','Depth','Spiritual','Other'],5,complete),false)
 or not coalesce(onboarding_selection_valid(p->'outings',array['Specialty Coffee','Food Hunts','Ideas & Deep Dives','Drinks & Bar Hopping','Indie Cinema','Pottery & Making','Vinyl & Analog Culture','Nature & Hiking','Live Music & Gigs','Games Nights','Beach & Island Days','Photo Walks','Parties & Nightlife','Water Sports','Sports & Fitness','Other'],5,complete),false) then return false; end if;
 if complete and ((p->'desiredQualities' ? 'Other' and btrim(p->>'qualityOther')='') or (p->'outings' ? 'Other' and btrim(p->>'outingOther')='')) then return false; end if;
 foreach k in array array['connectionChoice','planningChoice','punctualityChoice'] loop
  if k='connectionChoice' then choices:=array['A few times a week','About once a week','Every couple of weeks','Weeks/Months can pass, we’re still good']; otherkey:='connectionOther';
  elsif k='planningChoice' then choices:=array['Same day','1–2 days','A few days','About a week','1–2 weeks ahead']; otherkey:='planningOther';
  else choices:=array['I’m usually early','On time','5–10 minutes either way is fine','I’m pretty relaxed about timing']; otherkey:='punctualityOther'; end if;
  if p->>k is null or not (p->>k=any(choices||array['','Other'])) then return false; end if;
  if complete and k<>'punctualityChoice' and (p->>k='' or (p->>k='Other' and btrim(p->>otherkey)='')) then return false; end if;
 end loop;
 expected_contact:=case p->>'connectionChoice' when 'A few times a week' then .75 when 'About once a week' then .5 when 'Every couple of weeks' then .25 when 'Weeks/Months can pass, we’re still good' then 0 else null end;
 expected_planning:=case p->>'planningChoice' when 'Same day' then 0 when '1–2 days' then .25 when 'A few days' then .5 when 'About a week' then .75 when '1–2 weeks ahead' then 1 else null end;
 if (p->>'contact')::numeric is distinct from expected_contact or (p->>'planning')::numeric is distinct from expected_planning then return false; end if;
 -- Validate unchanged identity and Q1–3 through the historical validator.
 -- These placeholders exist only in the validation copy, never in saved data.
 q:=p||jsonb_build_object('step',least((p->>'step')::int,6),'intent',jsonb_build_array('Close circle'),'clicks',jsonb_build_array('Our humour just lands'),'q4Revision',2,'desiredQualities',jsonb_build_array('Curious'),'outings',jsonb_build_array('Specialty Coffee'),'contact',0,'planning',0,'opening',0);
 return coalesce(validate_baseline_draft_five(q,complete),false);
exception when others then return false;
end $$;


commit;

