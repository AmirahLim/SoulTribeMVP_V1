begin;
create table if not exists public.trait_repair(
 user_id uuid primary key references profiles(id) on delete cascade,
 answers jsonb not null default '{}' check(jsonb_typeof(answers)='object'),
 answered integer not null default 0 check(answered between 0 and 5)
);
alter table trait_repair enable row level security;
revoke all on trait_repair from public,anon,authenticated;
grant select on trait_repair to authenticated;
grant all on trait_repair to service_role;
drop policy if exists repair_detail_select on trait_repair;
create policy repair_detail_select on trait_repair for select to authenticated using(user_id=auth.uid() or (can_interact_with(user_id) and has_verified_outing_with(user_id)));
create or replace function public.sync_repair_projection() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
declare subject uuid; payload jsonb; n integer;
begin
 if tg_op='DELETE' then subject:=old.user_id;else subject:=new.user_id;end if;
 select coalesce(jsonb_object_agg(question_id,selections),'{}'),count(*) into payload,n from read_answer_sources
 where user_id=subject and thread='repair' and question_id in ('repair.first','repair.return','repair.discuss','repair.need','repair.space');
 if n=0 then delete from trait_repair where user_id=subject;
 else insert into trait_repair values(subject,payload,n) on conflict(user_id) do update set answers=excluded.answers,answered=excluded.answered;end if;
 if tg_op='DELETE' then return old;end if;return new;
end $$;
revoke all on function public.sync_repair_projection() from public,anon,authenticated;
drop trigger if exists sync_repair_projection on read_answer_sources;
create trigger sync_repair_projection after insert or update or delete on read_answer_sources for each row execute function sync_repair_projection();
insert into trait_repair select user_id,jsonb_object_agg(question_id,selections),count(*) from read_answer_sources where thread='repair' group by user_id
on conflict(user_id) do update set answers=excluded.answers,answered=excluded.answered;
notify pgrst, 'reload schema';
commit;
