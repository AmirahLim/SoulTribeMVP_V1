import type { TelemetryEvent } from './events.ts';

export interface TelemetrySink {
  record(event: TelemetryEvent): void | Promise<void>;
}

export class MemorySink implements TelemetrySink {
  events: TelemetryEvent[] = [];

  record(event: TelemetryEvent): void {
    this.events.push(event);
  }
}

export class NoopSink implements TelemetrySink {
  record(_event: TelemetryEvent): void {
    // No-op
  }
}

let activeSink: TelemetrySink = new NoopSink();

export function setTelemetrySink(sink: TelemetrySink): void {
  activeSink = sink;
}

export function getTelemetrySink(): TelemetrySink {
  return activeSink;
}

export function recordEvent(event: TelemetryEvent): void {
  try {
    const res = activeSink.record(event);
    if (res && typeof (res as any).catch === 'function') {
      (res as any).catch(() => {});
    }
  } catch (err) {
    // Fail-safe: telemetry errors are swallowed to never interrupt core matching logic
  }
}
