begin;
-- Change the classification, not the RLS policy. Repair remains shared-detail.
create or replace function public.classify_emotional_read_source() returns trigger
language plpgsql set search_path=public,pg_temp as $$
begin
 if new.thread='emotional' then new.access:='public'; end if;
 return new;
end $$;
revoke all on function public.classify_emotional_read_source() from public,anon,authenticated;
drop trigger if exists classify_emotional_read_source on public.read_answer_sources;
create trigger classify_emotional_read_source before insert or update on public.read_answer_sources
for each row execute function public.classify_emotional_read_source();
update public.read_answer_sources set access='public' where thread='emotional' and access<>'public';

-- Project only a verbatim, allowlisted original choice. Never derive an answer
-- from trait_emotional, and never write to profile_answers or invent a version.
create or replace function public.project_original_opening_source(subject uuid) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare original jsonb; selection text;
begin
 select onboarding->'q7EmotionalPacing' into original from profile_answers where user_id=subject;
 if jsonb_typeof(original)='string' then selection:=original#>>'{}'; end if;
 if selection = any(array['Open book - I share openly right away',
 'Let it unfold - I open up naturally over time','Observant first - I take time to build trust',
 'Depends on the person and environment']) then
  insert into read_answer_sources(user_id,question_id,question_version,dimension,thread,selections,access)
  values(subject,'legacy.emotional.opening',null,'q7EmotionalPacing','emotional',jsonb_build_array(selection),'public')
  on conflict(user_id,question_id) do update set question_version=null,selections=excluded.selections,access='public';
 else
  delete from read_answer_sources where user_id=subject and question_id='legacy.emotional.opening';
 end if;
end $$;
revoke all on function public.project_original_opening_source(uuid) from public,anon,authenticated;
create or replace function public.project_original_opening_change() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 perform project_original_opening_source(new.user_id);
 return new;
end $$;
revoke all on function public.project_original_opening_change() from public,anon,authenticated;
drop trigger if exists project_original_opening_change on public.profile_answers;
create trigger project_original_opening_change after insert or update on public.profile_answers
for each row execute function public.project_original_opening_change();
-- Only a read projection of existing literal answers; no answer backfill.
do $$ declare member uuid; begin
 for member in select user_id from profile_answers loop perform project_original_opening_source(member); end loop;
end $$;

-- Preserve the existing lease/auth checks and remember headings as well as prose.
create or replace function public.finish_composed_read(p_viewer uuid,p_subject uuid,p_level text,p_hash text,p_lease uuid,p_document jsonb)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if p_viewer<>p_subject and pair_restricted(p_viewer,p_subject) then return false;end if;
 update composed_read_cache set state='ready',document=p_document,updated_at=now()
 where viewer_id=p_viewer and subject_id=p_subject and level=p_level and evidence_hash=p_hash and lease_id=p_lease and state='pending' and lease_until>now();
 if not found then return false;end if;
 insert into read_phrase_history(viewer_id,subject_id,level,phrase)
 select p_viewer,p_subject,p_level,phrase from (
  select claim->>'text' as phrase from jsonb_array_elements(coalesce(p_document->'sections','[]')) section,
   jsonb_array_elements(coalesce(section->'claims','[]')) claim
  union select section->>'title' from jsonb_array_elements(coalesce(p_document->'sections','[]')) section
 ) phrases where char_length(phrase) between 1 and 1200 on conflict do nothing;
 return true;
end $$;
revoke all on function public.finish_composed_read(uuid,uuid,text,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.finish_composed_read(uuid,uuid,text,text,uuid,jsonb) to service_role;
commit;
