-- Initial Schema for Soul Tribe
create extension if not exists "uuid-ossp";
create extension if not exists ltree;

-- 1. Profiles
create table if not exists profiles (
  id                uuid primary key default gen_random_uuid(),
  handle            text unique not null check (handle ~ '^[a-z0-9_]{3,20}$'),
  display_name      text not null,
  avatar_url        text,
  bio               text check (char_length(bio) <= 280),
  home_area         text not null,
  birth_year        int  not null check (birth_year between 1930 and extract(year from now())::int - 18),
  age_pref_min      int  default 21,
  age_pref_max      int  default 99,
  profile_version   int  not null default 1,
  confidence        numeric(4,3) not null default 0,
  tier              text not null default 'free' check (tier in ('free','host_plus')),
  status            text not null default 'active'
                    check (status in ('active','paused','under_review','banned')),
  created_at        timestamptz not null default now()
);

-- 2. Trait storage
create table if not exists trait_personality (
  user_id uuid primary key references profiles on delete cascade,
  openness numeric(4,3), conscientiousness numeric(4,3), extraversion numeric(4,3),
  agreeableness numeric(4,3), emotional_stability numeric(4,3),
  serious_playful numeric(4,3), intensity_easygoing numeric(4,3),
  assertive_accommodating numeric(4,3), novelty_seeking numeric(4,3),
  intellectual_curiosity numeric(4,3),
  answered int not null default 0, updated_at timestamptz not null default now()
);

create table if not exists trait_communication (
  user_id uuid primary key references profiles on delete cascade,
  contact_frequency_self numeric(4,3), contact_frequency_expect numeric(4,3),
  response_speed_self    numeric(4,3), response_speed_expect    numeric(4,3),
  initiation_self        numeric(4,3), initiation_expect        numeric(4,3),
  message_length numeric(4,3), direct_diplomatic numeric(4,3), high_context_literal numeric(4,3),
  mediums    text[] not null default '{}',
  conv_styles text[] not null default '{}',
  answered int not null default 0, updated_at timestamptz not null default now()
);

create table if not exists trait_social_rhythm (
  user_id uuid primary key references profiles on delete cascade,
  availability     text[] not null default '{}',
  fri_night boolean default false, sat_night boolean default false,
  planning_horizon numeric(4,3),
  social_freq_self numeric(4,3), social_freq_expect numeric(4,3),
  preferred_duration numeric(4,3),
  energy_peak numeric(4,3),
  answered int not null default 0, updated_at timestamptz not null default now()
);

create table if not exists trait_intent (
  user_id uuid primary key references profiles on delete cascade,
  intents text[] not null default '{}',
  depth   int not null default 2 check (depth between 0 and 4),
  open_to_hosting boolean default false,
  answered int not null default 0, updated_at timestamptz not null default now()
);

create table if not exists trait_emotional (
  user_id uuid primary key references profiles on delete cascade,
  er_opening_pace      numeric(4,3),
  er_cadence_need      numeric(4,3), er_cadence_expect numeric(4,3),
  er_reassurance_need  numeric(4,3), er_reassurance_offer numeric(4,3),
  er_recovery_time     numeric(4,3),
  er_conflict_approach numeric(4,3),
  expressiveness numeric(4,3), vulnerability_comfort numeric(4,3), affection numeric(4,3),
  advice_vs_listening_self numeric(4,3), advice_vs_listening_expect numeric(4,3),
  reliability_self numeric(4,3), reliability_expect numeric(4,3),
  boundary_clarity numeric(4,3),
  answered int not null default 0, updated_at timestamptz not null default now()
);

create table if not exists trait_lifestyle (
  user_id uuid primary key references profiles on delete cascade,
  budget_band int check (budget_band between 0 and 4),
  alcohol text check (alcohol in ('none','occasional','regular')),
  smoking text check (smoking in ('none','occasional','regular')),
  activity_level numeric(4,3), travel_frequency numeric(4,3), life_stage text,
  work_schedule text[], food_prefs text[], pets text[],
  accessibility_needs text[] default '{}',
  dealbreakers text[] default '{}',
  answered int not null default 0, updated_at timestamptz not null default now()
);

create table if not exists trait_experience (
  user_id uuid primary key references profiles on delete cascade,
  settings text[] not null default '{}',
  group_size_pref numeric(4,3),
  orientation text[] not null default '{}',
  novelty numeric(4,3),
  answered int not null default 0, updated_at timestamptz not null default now()
);

create table if not exists trait_geography (
  user_id uuid primary key references profiles on delete cascade,
  home_area text not null,
  radius_minutes jsonb not null default '{"coffee":20,"dining":30,"active":45,"cultural":35,"nightlife":40,"creative":35}',
  answered int not null default 0, updated_at timestamptz not null default now()
);

create table if not exists user_values (
  user_id    uuid references profiles on delete cascade,
  value_key  text not null,
  stance     numeric(4,3) not null,
  importance numeric(4,3) not null,
  visibility text not null default 'matching_only'
             check (visibility in ('private','matching_only','public')),
  primary key (user_id, value_key)
);

create table if not exists interest_nodes (
  id serial primary key,
  parent_id int references interest_nodes,
  name text not null,
  path ltree not null,
  approved boolean not null default true
);

create table if not exists user_interests (
  user_id  uuid references profiles on delete cascade,
  node_id  int references interest_nodes,
  affinity text not null check (affinity in ('love','regular','learning','curious')),
  primary key (user_id, node_id)
);

-- 3. Matching artifacts
create table if not exists match_scores (
  user_a uuid references profiles on delete cascade,
  user_b uuid references profiles on delete cascade,
  resonance numeric(4,3) not null,
  logistics numeric(4,3) not null,
  rank_score numeric(5,4) not null,
  gated boolean not null default false,
  contributions jsonb not null,
  version_a int not null, version_b int not null,
  computed_at timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);

create table if not exists match_explanations (
  user_a uuid, user_b uuid,
  click_text    text not null,
  friction_text text not null check (char_length(friction_text) > 0),
  generated_by  text not null,
  version_a int not null, version_b int not null,
  created_at timestamptz not null default now(),
  primary key (user_a, user_b)
);

create table if not exists match_surfaced (
  id bigserial primary key,
  viewer_id uuid references profiles on delete cascade,
  shown_id  uuid references profiles on delete cascade,
  week_of   date not null,
  action    text check (action in ('none','saved','pitched_to','hidden')),
  shown_at  timestamptz not null default now(),
  unique (viewer_id, shown_id, week_of)
);

-- 4. Outings
create table if not exists outings (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references profiles on delete cascade,
  title text not null check (char_length(title) between 4 and 80),
  pitch  text not null check (char_length(pitch) between 20 and 600),
  activity_category text not null
    check (activity_category in ('coffee','dining','active','cultural','nightlife','creative')),
  interest_node_id int references interest_nodes,
  area text not null,
  starts_at timestamptz not null,
  duration_minutes int not null,
  budget_band int not null check (budget_band between 0 and 4),
  orientation text not null check (orientation in ('conversation_first','activity_first','either')),
  setting text not null,
  max_participants int not null default 6,
  visibility text not null default 'invite_only'
    check (visibility in ('invite_only','requestable')),
  state text not null default 'draft'
    check (state in ('draft','open','confirmed','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists outing_members (
  outing_id uuid references outings on delete cascade,
  user_id   uuid references profiles on delete cascade,
  role   text not null default 'guest' check (role in ('host','guest')),
  state  text not null default 'invited'
         check (state in ('invited','requested','accepted','declined','removed')),
  invited_at timestamptz default now(),
  responded_at timestamptz,
  primary key (outing_id, user_id)
);

-- Cap enforcement Trigger: Hard 6 participant limit
create or replace function enforce_outing_cap() returns trigger as $$
declare
  cap int; taken int;
begin
  select o.max_participants into cap from outings o where o.id = new.outing_id;

  if (select p.tier from outings o join profiles p on p.id = o.host_id
      where o.id = new.outing_id) = 'free' then
    cap := least(cap, 6);
  end if;

  select count(*) into taken from outing_members m
   where m.outing_id = new.outing_id
     and m.state in ('accepted','invited')
     and m.user_id <> new.user_id;

  if taken + 1 > cap then
    raise exception 'OUTING_FULL: % of % seats taken', taken, cap
      using errcode = 'check_violation';
  end if;
  return new;
end $$ language plpgsql;

drop trigger if exists trg_outing_cap on outing_members;
create trigger trg_outing_cap
  before insert or update of state on outing_members
  for each row when (new.state in ('invited','accepted'))
  execute function enforce_outing_cap();

-- 5. Artifacts and feedback
create table if not exists outing_records (
  outing_id uuid primary key references outings on delete cascade,
  headline  text,
  photo_urls text[] default '{}',
  attended  uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists rhythm_checks (
  outing_id uuid references outings on delete cascade,
  author_id uuid references profiles on delete cascade,
  about_id  uuid references profiles on delete cascade,
  would_meet_again int check (would_meet_again between 1 and 5),
  energy_read  text check (energy_read in ('quieter','as_expected','livelier')),
  pace_read    text check (pace_read in ('slower','as_expected','faster')),
  note text,
  created_at timestamptz not null default now(),
  primary key (outing_id, author_id, about_id)
);

-- 6. Safety
create table if not exists blocks (
  blocker_id uuid references profiles on delete cascade,
  blocked_id uuid references profiles on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists reports (
  id bigserial primary key,
  reporter_id uuid references profiles,
  reported_id uuid references profiles,
  outing_id uuid references outings,
  category text not null,
  detail text,
  state text not null default 'open' check (state in ('open','reviewing','actioned','dismissed')),
  created_at timestamptz default now()
);
