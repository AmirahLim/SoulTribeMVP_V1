begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('avatars','avatars',false,4194304,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Authenticated members can view avatars') then
  create policy "Authenticated members can view avatars" on storage.objects for select to authenticated using(bucket_id='avatars');
 end if;
 if not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Users can upload avatar to own folder') then
  create policy "Users can upload avatar to own folder" on storage.objects for insert to authenticated with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
 end if;
end $$;
commit;
