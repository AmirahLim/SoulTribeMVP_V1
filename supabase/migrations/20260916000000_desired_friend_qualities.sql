begin;
alter function validate_baseline_draft(jsonb,boolean) rename to validate_baseline_draft_groups;
create function validate_baseline_draft(p jsonb, complete boolean default false)
returns boolean language plpgsql immutable set search_path=public as $$
begin
 if not (p ? 'q4Revision') then return validate_baseline_draft_groups(p,complete); end if;
 if p->>'q4Revision' is distinct from '2' then return false; end if;
 if not coalesce(onboarding_selection_valid(p->'desiredQualities',array['Curious','Reliable','Emotionally open','Playful','Thoughtful','Independent','Adventurous','Open-minded','Proactive'],3,complete),false) then return false; end if;
 if not coalesce(validate_baseline_draft_groups(p,false),false) then return false; end if;
 -- In-memory adapter for the old validator only. Claim still saves the original
 -- payload and never persists this sentinel or infers an opening-pace answer.
 return validate_baseline_draft_groups(jsonb_set(p,'{opening}','0'::jsonb),complete);
end $$;
commit;
