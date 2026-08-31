-- ============================================================================
-- Soul Tribe MVP — Row-Level Security (RLS)
-- File: supabase/migrations/20260901000000_enable_rls.sql
-- Run this AFTER 20260831000000_initial_schema.sql
-- ============================================================================
-- WHAT THIS DOES, in plain terms:
--   Right now your database blueprint lets anyone read/write everything.
--   This file locks it down so each logged-in person can only touch THEIR OWN
--   data, plus the small amount they're meant to see about others.
--
-- HOW RLS WORKS (two things to know):
--   1. A table with RLS turned ON and NO matching policy is *fully locked* to
--      normal users. Only your server's secret "service_role" key bypasses RLS.
--      So "no policy" = "nobody but the server", which is the safe default.
--   2. auth.uid() = the id of the currently logged-in user. Our policies compare
--      that to the "owner" column on each row.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- PREREQUISITE: connect profiles to Supabase Auth
-- ----------------------------------------------------------------------------
-- For auth.uid() to ever match a profile, each profile's id must equal the
-- logged-in user's auth id. Link them, and make sure your app creates the
-- profile row using the logged-in user's id (a signup trigger is the usual way).
alter table profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;


-- ----------------------------------------------------------------------------
-- Helper functions (avoid "infinite recursion" errors on outing tables).
-- SECURITY DEFINER lets these peek at membership without re-triggering RLS.
-- ----------------------------------------------------------------------------
create or replace function is_host_of(o uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from outings x where x.id = o and x.host_id = auth.uid());
$$;

create or replace function is_member_of(o uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from outing_members m
    where m.outing_id = o and m.user_id = auth.uid()
      and m.state in ('invited','requested','accepted')
  );
$$;


-- ----------------------------------------------------------------------------
-- Turn RLS ON for every table
-- ----------------------------------------------------------------------------
alter table profiles            enable row level security;
alter table trait_personality   enable row level security;
alter table trait_communication enable row level security;
alter table trait_social_rhythm enable row level security;
alter table trait_intent        enable row level security;
alter table trait_emotional     enable row level security;
alter table trait_lifestyle     enable row level security;
alter table trait_experience    enable row level security;
alter table trait_geography     enable row level security;
alter table user_values         enable row level security;
alter table interest_nodes      enable row level security;
alter table user_interests      enable row level security;
alter table match_scores        enable row level security;
alter table match_explanations  enable row level security;
alter table match_surfaced      enable row level security;
alter table outings             enable row level security;
alter table outing_members      enable row level security;
alter table outing_records      enable row level security;
alter table rhythm_checks       enable row level security;
alter table blocks              enable row level security;
alter table reports             enable row level security;


-- ============================================================================
-- PROFILES — anyone logged in can see active profiles (needed for matching /
-- browsing people); you can only create/edit/delete your OWN.
-- ============================================================================
create policy profiles_select on profiles for select to authenticated
  using (status = 'active' or id = auth.uid());
create policy profiles_insert on profiles for insert to authenticated
  with check (id = auth.uid());
create policy profiles_update on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_delete on profiles for delete to authenticated
  using (id = auth.uid());


-- ============================================================================
-- TRAIT_* — your private "social DNA". Owner-only: no one else can read your
-- raw trait answers. (Matching runs server-side with the service_role key.)
-- ============================================================================
create policy trait_personality_own   on trait_personality   for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy trait_communication_own on trait_communication for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy trait_social_rhythm_own on trait_social_rhythm for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy trait_intent_own        on trait_intent        for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy trait_emotional_own     on trait_emotional     for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy trait_lifestyle_own     on trait_lifestyle     for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy trait_experience_own    on trait_experience    for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy trait_geography_own     on trait_geography     for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ============================================================================
-- USER_VALUES — owner controls their own; others may read only ones the owner
-- marked visibility = 'public'.
-- ============================================================================
create policy user_values_own on user_values for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy user_values_public_read on user_values for select to authenticated
  using (visibility = 'public');


-- ============================================================================
-- INTEREST_NODES — shared lookup list. Everyone reads approved ones; only the
-- server (service_role) can add/change them (no write policy = locked).
-- ============================================================================
create policy interest_nodes_read on interest_nodes for select to authenticated
  using (approved = true);


-- ============================================================================
-- USER_INTERESTS — owner-only.
-- ============================================================================
create policy user_interests_own on user_interests for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ============================================================================
-- MATCH_SCORES / MATCH_EXPLANATIONS — read matches that involve YOU only.
-- No write policy: only the server computes and writes these.
-- ============================================================================
create policy match_scores_read on match_scores for select to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);
create policy match_explanations_read on match_explanations for select to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);


-- ============================================================================
-- MATCH_SURFACED — the "who you were shown this week" log. Yours only.
-- ============================================================================
create policy match_surfaced_select on match_surfaced for select to authenticated
  using (viewer_id = auth.uid());
create policy match_surfaced_insert on match_surfaced for insert to authenticated
  with check (viewer_id = auth.uid());
create policy match_surfaced_update on match_surfaced for update to authenticated
  using (viewer_id = auth.uid()) with check (viewer_id = auth.uid());


-- ============================================================================
-- OUTINGS — hosts manage their own; members see outings they're in; anyone can
-- see 'requestable' outings that are open/confirmed (discovery).
-- ============================================================================
create policy outings_select on outings for select to authenticated
  using (
    host_id = auth.uid()
    or is_member_of(id)
    or (visibility = 'requestable' and state in ('open','confirmed'))
  );
create policy outings_insert on outings for insert to authenticated
  with check (host_id = auth.uid());
create policy outings_update on outings for update to authenticated
  using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy outings_delete on outings for delete to authenticated
  using (host_id = auth.uid());


-- ============================================================================
-- OUTING_MEMBERS — see the guest list if you host or belong to that outing.
-- A user can add their own seat (request to join); the host manages seats.
-- The enforce_outing_cap() trigger still enforces the 6-person limit.
-- ============================================================================
create policy outing_members_select on outing_members for select to authenticated
  using (user_id = auth.uid() or is_host_of(outing_id) or is_member_of(outing_id));
create policy outing_members_insert on outing_members for insert to authenticated
  with check (user_id = auth.uid() or is_host_of(outing_id));
create policy outing_members_update on outing_members for update to authenticated
  using (user_id = auth.uid() or is_host_of(outing_id))
  with check (user_id = auth.uid() or is_host_of(outing_id));
create policy outing_members_delete on outing_members for delete to authenticated
  using (user_id = auth.uid() or is_host_of(outing_id));


-- ============================================================================
-- OUTING_RECORDS — the shared recap. Members read; host writes.
-- ============================================================================
create policy outing_records_select on outing_records for select to authenticated
  using (is_host_of(outing_id) or is_member_of(outing_id));
create policy outing_records_insert on outing_records for insert to authenticated
  with check (is_host_of(outing_id));
create policy outing_records_update on outing_records for update to authenticated
  using (is_host_of(outing_id)) with check (is_host_of(outing_id));


-- ============================================================================
-- RHYTHM_CHECKS — private peer feedback. Only the AUTHOR can see or edit what
-- they wrote. The person it's ABOUT can never read it.
-- ============================================================================
create policy rhythm_checks_select on rhythm_checks for select to authenticated
  using (author_id = auth.uid());
create policy rhythm_checks_insert on rhythm_checks for insert to authenticated
  with check (author_id = auth.uid() and is_member_of(outing_id));
create policy rhythm_checks_update on rhythm_checks for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());


-- ============================================================================
-- BLOCKS — you manage your own block list; nobody can see who blocked whom.
-- ============================================================================
create policy blocks_own on blocks for all to authenticated
  using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());


-- ============================================================================
-- REPORTS — you can file a report as yourself. You CANNOT read reports back
-- (no select policy) — only staff via the server's service_role key.
-- ============================================================================
create policy reports_insert on reports for insert to authenticated
  with check (reporter_id = auth.uid());

-- ============================================================================
-- Done. After running this, spot-check in the Supabase dashboard:
-- Table editor → each table → "RLS enabled" badge should be green.
-- ============================================================================
