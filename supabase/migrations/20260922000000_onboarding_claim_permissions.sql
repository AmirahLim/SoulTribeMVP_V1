begin;
-- Supabase default privileges can grant anon EXECUTE directly, independently
-- of PUBLIC. Claiming a draft requires an authenticated member.
revoke all on function public.claim_onboarding_draft(text,text,integer) from public,anon;
grant execute on function public.claim_onboarding_draft(text,text,integer) to authenticated;
commit;
