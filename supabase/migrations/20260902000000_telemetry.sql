-- Telemetry and Interaction Event Logging Table
create table if not exists interaction_events (
  id            bigserial primary key,
  actor_id      uuid references profiles on delete cascade,
  subject_id    uuid references profiles on delete set null,
  outing_id     uuid references outings on delete set null,
  event_type    text not null,
  payload       jsonb not null default '{}',
  engine_version  text,
  weights_version text,
  occurred_at   timestamptz not null default now()
);

create index if not exists idx_events_actor_time on interaction_events (actor_id, occurred_at desc);
create index if not exists idx_events_type_time  on interaction_events (event_type, occurred_at desc);

-- Snapshot columns so match_surfaced keeps its own point-in-time record
alter table match_surfaced add column if not exists rank_position int;
alter table match_surfaced add column if not exists rank_score numeric(5,4);
alter table match_surfaced add column if not exists contributions jsonb;
alter table match_surfaced add column if not exists engine_version text;

-- RLS: consistent with 20260901000000_enable_rls.sql
alter table interaction_events enable row level security;

-- Users may insert their own events; NOBODY may read them back through the client.
-- Analytics runs server-side with the service_role key only. No select policy = locked.
create policy interaction_events_insert on interaction_events for insert to authenticated
  with check (actor_id = auth.uid());
