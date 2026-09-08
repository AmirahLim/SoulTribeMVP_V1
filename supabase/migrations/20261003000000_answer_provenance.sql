begin;
-- Keep the installed validator intact; exclude generated metadata from its
-- existing 8KB literal-answer limit, with a separate 32KB envelope limit.
do $patch$
declare definition text:=pg_get_functiondef('public.validate_baseline_draft(jsonb,boolean)'::regprocedure);
begin
 if position('p:=p-''answerRecords''' in definition)=0 then
  if position(E'begin\n if not' in definition)=0 then raise exception 'Unexpected draft validator; review before applying'; end if;
  execute replace(definition,E'begin\n if not',E'begin\n if octet_length(p::text)>32768 then return false; end if;\n p:=p-''answerRecords'';\n if not');
 end if;
end $patch$;
-- New submissions only. Never infer a historic question/version from a label.
create or replace function public.onboarding_question_catalog_v1()
returns jsonb language sql immutable set search_path=public,pg_temp as $catalog$
 select '[{"questionId":"friendship.intent","questionVersion":1,"step":1,"questionText":"What are you hoping to find here?","fields":["intent"],"customField":"intentOther","options":[{"optionId":"friendship.intent.01","value":"Close circle","label":"Close circle"},{"optionId":"friendship.intent.02","value":"People to do things with","label":"People to do things with"},{"optionId":"friendship.intent.03","value":"Real conversations","label":"Real conversations"},{"optionId":"friendship.intent.04","value":"Wider social circle","label":"Wider social circle"},{"optionId":"friendship.intent.05","value":"New perspectives","label":"New perspectives"},{"optionId":"friendship.intent.06","value":"Sense of community","label":"Sense of community"}]},{"questionId":"friendship.clicks","questionVersion":1,"step":2,"questionText":"When do you know you’re clicking?","fields":["clicks"],"customField":"clicksOther","options":[{"optionId":"friendship.clicks.01","value":"We skip the small talk","label":"We skip the small talk"},{"optionId":"friendship.clicks.02","value":"Our humour just lands","label":"Our humour just lands"},{"optionId":"friendship.clicks.03","value":"We share niche rabbit holes","label":"We share niche rabbit holes"},{"optionId":"friendship.clicks.04","value":"They make me think differently","label":"They make me think differently"},{"optionId":"friendship.clicks.05","value":"Comfortable silence feels easy","label":"Comfortable silence feels easy"},{"optionId":"friendship.clicks.06","value":"We actually make plans happen","label":"We actually make plans happen"}]},{"questionId":"friendship.setting","questionVersion":1,"step":3,"questionText":"What’s your social sweet spot?","fields":["groupChoices"],"customField":null,"options":[{"optionId":"friendship.setting.01","value":"1:1","label":"1:1"},{"optionId":"friendship.setting.02","value":"Small circle","label":"Small circle"},{"optionId":"friendship.setting.03","value":"Social mix","label":"Social mix"},{"optionId":"friendship.setting.04","value":"Big energy","label":"Big energy"}]},{"questionId":"friendship.qualities","questionVersion":1,"step":4,"questionText":"What matters to you in a friendship?","fields":["desiredQualities"],"customField":"qualityOther","options":[{"optionId":"friendship.qualities.01","value":"Curious","label":"Curious"},{"optionId":"friendship.qualities.02","value":"Reliable","label":"Reliable"},{"optionId":"friendship.qualities.03","value":"Emotionally open","label":"Emotionally open"},{"optionId":"friendship.qualities.04","value":"Playful","label":"Playful"},{"optionId":"friendship.qualities.05","value":"Thoughtful","label":"Thoughtful"},{"optionId":"friendship.qualities.06","value":"Independent","label":"Independent"},{"optionId":"friendship.qualities.07","value":"Adventurous","label":"Adventurous"},{"optionId":"friendship.qualities.08","value":"Open-minded","label":"Open-minded"},{"optionId":"friendship.qualities.09","value":"Proactive","label":"Proactive"},{"optionId":"friendship.qualities.10","value":"Free-spirit","label":"Free-spirit"},{"optionId":"friendship.qualities.11","value":"Ambitious","label":"Ambitious"},{"optionId":"friendship.qualities.12","value":"Depth","label":"Depth"},{"optionId":"friendship.qualities.13","value":"Spiritual","label":"Spiritual"},{"optionId":"friendship.qualities.14","value":"Other","label":"Other +"}]},{"questionId":"friendship.contact","questionVersion":1,"step":5,"questionText":"Staying connected","fields":["connectionChoice"],"customField":"connectionOther","options":[{"optionId":"friendship.contact.01","value":"A few times a week","label":"A few times a week"},{"optionId":"friendship.contact.02","value":"About once a week","label":"About once a week"},{"optionId":"friendship.contact.03","value":"Every couple of weeks","label":"Every couple of weeks"},{"optionId":"friendship.contact.04","value":"Weeks/Months can pass, we’re still good","label":"Weeks/Months can pass, we’re still good"}]},{"questionId":"friendship.planning","questionVersion":1,"step":5,"questionText":"Making plans — How much notice do you prefer?","fields":["planningChoice"],"customField":"planningOther","options":[{"optionId":"friendship.planning.01","value":"Same day","label":"Same day"},{"optionId":"friendship.planning.02","value":"1–2 days","label":"1–2 days"},{"optionId":"friendship.planning.03","value":"A few days","label":"A few days"},{"optionId":"friendship.planning.04","value":"About a week","label":"About a week"},{"optionId":"friendship.planning.05","value":"1–2 weeks ahead","label":"1–2 weeks ahead"}]},{"questionId":"friendship.outings","questionVersion":1,"step":6,"questionText":"What gets you out of the house?","fields":["outings"],"customField":"outingOther","options":[{"optionId":"friendship.outings.01","value":"Specialty Coffee","label":"Specialty Coffee"},{"optionId":"friendship.outings.02","value":"Food Hunts","label":"Food Hunts"},{"optionId":"friendship.outings.03","value":"Ideas & Deep Dives","label":"Ideas & Deep Dives"},{"optionId":"friendship.outings.04","value":"Drinks & Bar Hopping","label":"Drinks & Bar Hopping"},{"optionId":"friendship.outings.05","value":"Indie Cinema","label":"Indie Cinema"},{"optionId":"friendship.outings.06","value":"Pottery & Making","label":"Pottery & Making"},{"optionId":"friendship.outings.07","value":"Vinyl & Analog Culture","label":"Vinyl & Analog Culture"},{"optionId":"friendship.outings.08","value":"Nature & Hiking","label":"Nature & Hiking"},{"optionId":"friendship.outings.09","value":"Live Music & Gigs","label":"Live Music & Gigs"},{"optionId":"friendship.outings.10","value":"Games Nights","label":"Games Nights"},{"optionId":"friendship.outings.11","value":"Beach & Island Days","label":"Beach & Island Days"},{"optionId":"friendship.outings.12","value":"Photo Walks","label":"Photo Walks"},{"optionId":"friendship.outings.13","value":"Parties & Nightlife","label":"Parties & Nightlife"},{"optionId":"friendship.outings.14","value":"Water Sports","label":"Water Sports"},{"optionId":"friendship.outings.15","value":"Sports & Fitness","label":"Sports & Fitness"},{"optionId":"friendship.outings.16","value":"Other","label":"+ Something Else"}]},{"questionId":"context.life_phase","questionVersion":1,"step":7,"questionText":"Life phase","fields":["lifeContexts"],"customField":null,"options":[{"optionId":"context.life_phase.01","value":"Building My Career","label":"Building My Career"},{"optionId":"context.life_phase.02","value":"Building Something of My Own","label":"Building Something of My Own"},{"optionId":"context.life_phase.03","value":"Adventure Era","label":"Adventure Era"},{"optionId":"context.life_phase.04","value":"Wild & Free","label":"Wild & Free"},{"optionId":"context.life_phase.05","value":"Slow Living","label":"Slow Living"},{"optionId":"context.life_phase.06","value":"Settling Into Stability","label":"Settling Into Stability"},{"optionId":"context.life_phase.07","value":"Family Life","label":"Family Life"},{"optionId":"context.life_phase.08","value":"Travel & Exploring","label":"Travel & Exploring"},{"optionId":"context.life_phase.09","value":"Reinvention/Healing","label":"Reinvention/Healing"},{"optionId":"context.life_phase.10","value":"Running on Empty","label":"Running on Empty"},{"optionId":"context.life_phase.11","value":"More Time, More Freedom","label":"More Time, More Freedom"},{"optionId":"context.life_phase.12","value":"Figuring It Out","label":"Figuring It Out"}]},{"questionId":"context.location","questionVersion":1,"step":7,"questionText":"Where are you based? / Country or region","fields":["area","country"],"customField":null,"options":[]},{"questionId":"context.travel","questionVersion":1,"step":7,"questionText":"How far are you willing to travel?","fields":["travelKm"],"customField":null,"options":[]}]'::jsonb
$catalog$;
revoke all on function public.onboarding_question_catalog_v1() from public,anon,authenticated;

create or replace function public.record_onboarding_answer_provenance()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare q jsonb; answer jsonb; previous_answer jsonb; records jsonb:='{}'; previous_records jsonb:='{}';
 field_name text; selected jsonb; selections jsonb; opt jsonb; old_record jsonb; valid boolean;
begin
 if TG_OP='UPDATE' then previous_records:=coalesce(OLD.payload->'answerRecords','{}'); end if;
 -- Incoming records are not trusted, including direct RPC callers.
 NEW.payload:=NEW.payload-'answerRecords';
 for q in select value from jsonb_array_elements(onboarding_question_catalog_v1()) loop
  answer:='{}';
  for field_name in select jsonb_array_elements_text(q->'fields') loop
   if NEW.payload ? field_name then answer:=answer||jsonb_build_object(field_name,NEW.payload->field_name); end if;
  end loop;
  if q->>'customField' is not null and NEW.payload ? (q->>'customField') then
   answer:=answer||jsonb_build_object(q->>'customField',NEW.payload->(q->>'customField'));
  end if;
  if q->>'questionId'='context.life_phase' then
   answer:=answer||jsonb_build_object('lifeContextsPublic',NEW.payload->'lifeContextsPublic');
  end if;
  old_record:=previous_records->(q->>'questionId');
  if old_record->'answer' = answer then
   records:=records||jsonb_build_object(q->>'questionId',old_record);
   continue;
  end if;
  -- submittedStep identifies the page actually confirmed, not the page navigated to.
  if NEW.payload->'answerContractVersion' is distinct from '1'::jsonb
    or NEW.payload->'submittedStep' is distinct from q->'step' or answer='{}'::jsonb then continue; end if;
  selections:='[]'; valid:=true;
  if jsonb_array_length(q->'options')>0 then
   selected:=NEW.payload->(q->'fields'->>0);
   if jsonb_typeof(selected)='string' then selected:=jsonb_build_array(selected); end if;
   if jsonb_typeof(selected) is distinct from 'array' then continue; end if;
   for field_name in select jsonb_array_elements_text(selected) loop
    select value into opt from jsonb_array_elements(q->'options') where value->>'value'=field_name;
    if opt is null then valid:=false; exit; end if;
    selections:=selections||jsonb_build_array(jsonb_build_object('optionId',opt->>'optionId','label',opt->>'label','value',field_name));
   end loop;
  end if;
  if not valid then raise exception 'Unknown option for question %',q->>'questionId' using errcode='22023'; end if;
  records:=records||jsonb_build_object(q->>'questionId',jsonb_build_object(
   'questionId',q->>'questionId','questionVersion',q->'questionVersion','questionText',q->>'questionText',
   'answer',answer,'selections',selections,'submittedAt',clock_timestamp(),'timestampSource','database_received'));
 end loop;
 if records<>'{}'::jsonb then NEW.payload:=NEW.payload||jsonb_build_object('answerRecords',records); end if;
 return NEW;
end $$;
revoke all on function public.record_onboarding_answer_provenance() from public,anon,authenticated;
drop trigger if exists onboarding_answer_provenance on public.onboarding_drafts;
create trigger onboarding_answer_provenance before insert or update of payload on public.onboarding_drafts
 for each row execute function public.record_onboarding_answer_provenance();
commit;
