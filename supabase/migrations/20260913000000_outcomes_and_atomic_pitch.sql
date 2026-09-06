begin;
create table recommendation_preferences (
 user_id uuid primary key references profiles on delete cascade,
 use_reflections boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table recommendation_preferences enable row level security;
create policy recommendation_preferences_own on recommendation_preferences for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create table connection_continuations (
 author_id uuid not null references profiles on delete cascade,
 peer_id uuid not null references profiles on delete cascade,
 source_outing_id uuid not null references outings on delete cascade,
 met_again boolean not null,
 updated_at timestamptz not null default now(),
 primary key(author_id,peer_id,source_outing_id),
 check(author_id<>peer_id)
);
alter table connection_continuations enable row level security;
create policy continuations_own on connection_continuations for all to authenticated
 using(author_id=auth.uid()) with check(author_id=auth.uid() and exists(select 1 from outing_records r where r.outing_id=source_outing_id and author_id=any(r.attended) and peer_id=any(r.attended)));

-- One transaction for the Pitch, host membership, and invitations.
create or replace function create_pitch(p_outing jsonb, p_invitees uuid[] default '{}') returns uuid
language plpgsql security invoker set search_path=public as $$
declare new_id uuid; guest uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into outings(host_id,title,pitch,activity_category,area,starts_at,duration_minutes,budget_band,orientation,setting,max_participants,visibility,state,host_type,
 cover_image_url,cover_image_thumb_url,cover_image_alt,cover_photographer_name,cover_photographer_url,cover_download_location)
 values(auth.uid(),p_outing->>'title',coalesce(p_outing->>'pitch',''),p_outing->>'activity_category',p_outing->>'area',(p_outing->>'starts_at')::timestamptz,
 (p_outing->>'duration_minutes')::int,(p_outing->>'budget_band')::int,p_outing->>'orientation',p_outing->>'setting',(p_outing->>'max_participants')::int,
 p_outing->>'visibility','open',coalesce(p_outing->>'host_type','individual'),p_outing->>'cover_image_url',p_outing->>'cover_image_thumb_url',p_outing->>'cover_image_alt',p_outing->>'cover_photographer_name',p_outing->>'cover_photographer_url',p_outing->>'cover_download_location') returning id into new_id;
 for guest in select distinct unnest(p_invitees) loop
  if guest<>auth.uid() then insert into outing_members(outing_id,user_id,role,state) values(new_id,guest,'guest','invited'); end if;
 end loop;
 return new_id;
end $$;
revoke all on function create_pitch(jsonb,uuid[]) from public;
grant execute on function create_pitch(jsonb,uuid[]) to authenticated;
create or replace function complete_recorded_outing() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 update outings set state='completed' where id=new.outing_id and state in ('open','confirmed');
 return new;
end $$;
create trigger complete_recorded_outing after insert or update on outing_records for each row execute function complete_recorded_outing();
commit;
