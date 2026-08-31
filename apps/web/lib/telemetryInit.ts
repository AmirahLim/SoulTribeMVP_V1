import { setTelemetrySink, MemorySink } from '@soul-tribe/core';

let initialized = false;

export function initTelemetry(): void {
  if (!initialized) {
    setTelemetrySink(new MemorySink());
    initialized = true;
  }
}
