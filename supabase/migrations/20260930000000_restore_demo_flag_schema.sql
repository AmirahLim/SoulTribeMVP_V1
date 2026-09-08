-- Repair a production schema prerequisite without rerunning historical demo
-- seeding or weakening protect_account_fields. This is an operational flag,
-- not an inferred member answer. Existing flags are never rewritten.
begin;
alter table public.profiles add column if not exists is_demo boolean not null default false;
alter table public.outings add column if not exists is_demo boolean not null default false;
alter table public.outing_members add column if not exists is_demo boolean not null default false;
create index if not exists idx_profiles_is_demo on public.profiles (is_demo) where is_demo;
notify pgrst, 'reload schema';
commit;
