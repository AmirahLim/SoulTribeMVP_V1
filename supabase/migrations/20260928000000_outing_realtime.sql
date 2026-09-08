begin;
-- DELETE events cannot enforce row visibility. Membership departures use UPDATE.
-- Fail closed if another feature has started using this publication.
do $$
declare t text;
begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime' and puballtables)
     or exists(select 1 from pg_publication_tables where pubname='supabase_realtime'
       and (schemaname<>'public' or tablename not in ('outing_messages','outing_members','outings','outing_logistics'))) then
    raise exception 'Review existing Realtime publication before changing its event types';
  end if;
  if not exists(select 1 from pg_publication where pubname='supabase_realtime') then
    create publication supabase_realtime with (publish='insert, update');
  else
    alter publication supabase_realtime set (publish='insert, update');
  end if;
  foreach t in array array['outing_messages','outing_members','outings','outing_logistics'] loop
    if not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public' and c.relname=t and c.relrowsecurity) then
      raise exception 'Required outing table is missing or row security is disabled: %',t;
    end if;
    if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I',t);
    end if;
  end loop;
end $$;
commit;
