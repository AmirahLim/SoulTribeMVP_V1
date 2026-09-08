begin;
-- One member-chosen public identity; OAuth email/name remain in auth only.
-- Keep account ids and handles unchanged. Do not alter original answers/drafts.
-- Keep a restricted recovery copy of previous public names; never expose it to
-- browser roles or matching. This avoids destroying member-entered names.
create table if not exists public.profile_name_archive (
 user_id uuid primary key references auth.users(id) on delete cascade,
 previous_display_name text,
 archived_at timestamptz not null default now()
);
alter table public.profile_name_archive enable row level security;
revoke all on public.profile_name_archive from public,anon,authenticated;
insert into public.profile_name_archive(user_id,previous_display_name)
select id,display_name from public.profiles where display_name is distinct from handle
on conflict(user_id) do nothing;
create or replace function public.use_public_username()
returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 new.display_name:=new.handle;
 return new;
end $$;
revoke all on function public.use_public_username() from public,anon,authenticated;
drop trigger if exists profiles_public_username on public.profiles;
create trigger profiles_public_username before insert or update on public.profiles
for each row execute function public.use_public_username();
update public.profiles set display_name=handle where display_name is distinct from handle;

-- Exact-name availability only. Never expose ids, emails, status or profile rows.
-- Caller cannot exclude an arbitrary account. RLS policies remain unchanged.
create or replace function public.username_available(p_username text)
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce(btrim(lower(p_username)) ~ '^[a-z0-9_]{3,20}$',false)
 and not exists(select 1 from public.profiles
  where handle=btrim(lower(p_username)) and id is distinct from auth.uid())
$$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon,authenticated;
-- Existing lowercase-format CHECK and UNIQUE(handle) reserve usernames atomically.
notify pgrst,'reload schema';
commit;
