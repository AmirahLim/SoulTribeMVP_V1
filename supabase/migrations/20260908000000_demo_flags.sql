alter table profiles       add column if not exists is_demo boolean not null default false;
alter table outings        add column if not exists is_demo boolean not null default false;
alter table outing_members add column if not exists is_demo boolean not null default false;

update profiles
   set is_demo = true
 where id::text like '00000000-0000-0000-0000-%';

update outings o
   set is_demo = true
  from profiles p
 where p.id = o.host_id and p.is_demo;

update outing_members m
   set is_demo = true
  from profiles p
 where p.id = m.user_id and p.is_demo;

create index if not exists idx_profiles_is_demo on profiles (is_demo) where is_demo;
