import { describe, it } from 'vitest';
import assert from 'node:assert';
import { initTelemetry, SupabaseTelemetrySink } from '../telemetryInit';
import { buildMatchSurfacedEvent, getTelemetrySink, recordEvent } from '@soul-tribe/core';

describe('Supabase Telemetry Sink Tests', () => {
  it('initTelemetry initializes SupabaseTelemetrySink', () => {
    initTelemetry();
    const sink = getTelemetrySink();
    assert.ok(sink instanceof SupabaseTelemetrySink, 'Sink must be instance of SupabaseTelemetrySink');
  });

  it('SupabaseTelemetrySink fail-safe behavior: errors are swallowed and do not throw', async () => {
    const sink = new SupabaseTelemetrySink();
    const dummyEvent = {
      event_type: 'match_surfaced' as const,
      actor_id: 'actor-123',
      subject_id: 'subject-456',
      occurred_at: new Date().toISOString(),
      engine_version: 'v1.0.0',
      weights_version: 'w1.0.0',
      position: 1,
      rank_score: 0.85,
      resonance: 0.88,
      logistics: 0.82,
      contributions: { personality: 0.3 },
      gated: false,
      gate_reasons: [],
      profile_version_actor: 1,
      profile_version_subject: 1,
      confidence_actor: 0.9,
      confidence_subject: 0.9,
    };

    // Should resolve without throwing any exceptions even if Supabase is unconfigured or offline
    await assert.doesNotReject(async () => {
      await sink.record(dummyEvent);
    });
  });
});
