-- Persist gate reasons so a MatchResult rebuilt from the DB keeps its context.
-- Without this, `gated = true` round-trips with an empty reason list, which the
-- softGate fail-closed guard would (correctly) reject as GATED_REASON_UNKNOWN.
alter table match_scores
  add column if not exists gate_reasons text[] not null default '{}';
