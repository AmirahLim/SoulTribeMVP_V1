import { setTelemetrySink } from '@soul-tribe/core';
import type { TelemetrySink, TelemetryEvent } from '@soul-tribe/core';
import { getSupabaseBrowserClient, checkIsSupabaseConfigured } from './supabase';

/**
 * SupabaseTelemetrySink inserts telemetry events into the `interaction_events` table in Supabase.
 * Fail-safe: Any network or database errors are silently caught and swallowed so matching and UI rendering are never interrupted.
 */
export class SupabaseTelemetrySink implements TelemetrySink {
  async record(event: TelemetryEvent): Promise<void> {
    try {
      if (!checkIsSupabaseConfigured()) return;

      const client = getSupabaseBrowserClient();

      // Extract top-level fields for interaction_events columns
      const {
        event_type,
        actor_id,
        occurred_at,
        engine_version,
        weights_version,
        ...restPayload
      } = event as any;

      const subject_id = restPayload.subject_id || null;
      const outing_id = restPayload.outing_id || null;

      // Clean payload so it carries IDs and numbers only — never names, bios, or notes!
      const payload: Record<string, any> = {};
      for (const [key, val] of Object.entries(restPayload)) {
        if (key === 'subject_id' || key === 'outing_id') continue;
        payload[key] = val;
      }

      await client.from('interaction_events').insert({
        actor_id,
        subject_id,
        outing_id,
        event_type,
        payload,
        engine_version,
        weights_version,
        occurred_at: occurred_at || new Date().toISOString(),
      });
    } catch {
      // Fail-safe: Telemetry errors are swallowed and must never break matching or UI rendering.
    }
  }
}

let initialized = false;

export function initTelemetry(): void {
  if (!initialized) {
    setTelemetrySink(new SupabaseTelemetrySink());
    initialized = true;
  }
}
