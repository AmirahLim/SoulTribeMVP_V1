import type { ProfileVector, MatchResult, MatchContext } from '../domain/types.ts';
import type { OutcomeSample } from '../matching/evaluation.ts';
import { normalizeOutcome } from '../matching/evaluation.ts';
import { ENGINE_VERSION, WEIGHTS_VERSION } from './version.ts';

export type EventType =
  | 'match_surfaced'
  | 'match_action'
  | 'outing_created'
  | 'outing_member_state'
  | 'outing_completed'
  | 'rhythm_check_submitted'
  | 'profile_updated'
  | 'recalibrated';

export interface BaseEvent {
  event_type: EventType;
  actor_id: string;
  occurred_at: string;
  engine_version: string;
  weights_version: string;
}

export interface MatchSurfacedEvent extends BaseEvent {
  event_type: 'match_surfaced';
  subject_id: string;
  position: number;
  rank_score: number;
  resonance: number;
  logistics: number;
  contributions: Record<string, number>;
  gated: boolean;
  gate_reasons: string[];
  activity_category?: string;
  profile_version_actor: number;
  profile_version_subject: number;
  confidence_actor: number;
  confidence_subject: number;
  provisional?: boolean;
}

export interface MatchActionEvent extends BaseEvent {
  event_type: 'match_action';
  subject_id: string;
  action: 'none' | 'saved' | 'pitched_to' | 'hidden';
}

export interface RhythmCheckSubmittedEvent extends BaseEvent {
  event_type: 'rhythm_check_submitted';
  outing_id: string;
  subject_id: string;
  would_meet_again: number;
  energy_read?: string;
  pace_read?: string;
}

export interface OutingCreatedEvent extends BaseEvent {
  event_type: 'outing_created';
  outing_id: string;
  activity_category: string;
  max_participants: number;
}

export interface OutingMemberStateEvent extends BaseEvent {
  event_type: 'outing_member_state';
  outing_id: string;
  role: 'host' | 'guest';
  state: 'invited' | 'requested' | 'accepted' | 'declined' | 'removed';
}

export interface OutingCompletedEvent extends BaseEvent {
  event_type: 'outing_completed';
  outing_id: string;
  attendee_count: number;
}

export interface ProfileUpdatedEvent extends BaseEvent {
  event_type: 'profile_updated';
  profile_version: number;
  confidence: number;
}

export interface RecalibratedEvent extends BaseEvent {
  event_type: 'recalibrated';
  prior_confidence: number;
  new_confidence: number;
}

export type TelemetryEvent =
  | MatchSurfacedEvent
  | MatchActionEvent
  | RhythmCheckSubmittedEvent
  | OutingCreatedEvent
  | OutingMemberStateEvent
  | OutingCompletedEvent
  | ProfileUpdatedEvent
  | RecalibratedEvent;

export function buildMatchSurfacedEvent(
  actor: ProfileVector,
  subject: ProfileVector,
  result: MatchResult,
  position: number,
  context?: MatchContext,
  provisional?: boolean
): MatchSurfacedEvent {
  return {
    event_type: 'match_surfaced',
    actor_id: actor.profile.id,
    subject_id: subject.profile.id,
    occurred_at: new Date().toISOString(),
    engine_version: ENGINE_VERSION,
    weights_version: WEIGHTS_VERSION,
    position,
    rank_score: result.rank_score,
    resonance: result.resonance,
    logistics: result.logistics,
    contributions: { ...result.contributions },
    gated: result.gated,
    gate_reasons: [...(result.gate_reasons || [])],
    activity_category: context?.activity_category,
    profile_version_actor: actor.profile.profile_version ?? 1,
    profile_version_subject: subject.profile.profile_version ?? 1,
    confidence_actor: result.confidence_a ?? actor.profile.confidence ?? 0.8,
    confidence_subject: result.confidence_b ?? subject.profile.confidence ?? 0.8,
    provisional,
  };
}

export function buildRhythmCheckEvent(
  authorId: string,
  aboutId: string,
  outingId: string,
  wouldMeetAgain: number,
  reads?: { energy_read?: string; pace_read?: string }
): RhythmCheckSubmittedEvent {
  return {
    event_type: 'rhythm_check_submitted',
    actor_id: authorId,
    subject_id: aboutId,
    outing_id: outingId,
    occurred_at: new Date().toISOString(),
    engine_version: ENGINE_VERSION,
    weights_version: WEIGHTS_VERSION,
    would_meet_again: Math.max(1, Math.min(5, wouldMeetAgain)),
    energy_read: reads?.energy_read,
    pace_read: reads?.pace_read,
  };
}

export function toOutcomeSamples(events: TelemetryEvent[]): OutcomeSample[] {
  const surfacedMap = new Map<string, MatchSurfacedEvent>();

  for (const e of events) {
    if (e.event_type === 'match_surfaced') {
      const key = `${e.actor_id}_${e.subject_id}`;
      surfacedMap.set(key, e as MatchSurfacedEvent);
    }
  }

  const samples: OutcomeSample[] = [];

  for (const e of events) {
    if (e.event_type === 'rhythm_check_submitted') {
      const rEvent = e as RhythmCheckSubmittedEvent;
      const key = `${rEvent.actor_id}_${rEvent.subject_id}`;
      const surfaced = surfacedMap.get(key);

      if (surfaced && surfaced.contributions) {
        samples.push({
          userA: rEvent.actor_id,
          userB: rEvent.subject_id,
          dims: { ...surfaced.contributions },
          outcome: normalizeOutcome(rEvent.would_meet_again),
        });
      }
    }
  }

  return samples;
}
