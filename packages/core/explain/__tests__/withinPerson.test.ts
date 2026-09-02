import { describe, it } from 'node:test';
import assert from 'node:assert';
import { composeWithinPerson } from '../withinPerson.ts';
import type { Marker } from '../markers.ts';

describe('Layer 2 — Within-Person Composition', () => {
  it('1. Fires composite rule when ALL required markers are present', () => {
    const inputMarkers: Marker[] = [
      { key: 'socially-selective', thread: 'personality', source: 'personality.extraversion' },
      { key: 'gradual-opening', thread: 'emotional', source: 'emotional.er_opening_pace' },
      { key: 'depth-oriented', thread: 'intent', source: 'intent.depth' },
    ];

    const result = composeWithinPerson(inputMarkers);
    const keys = result.map((m) => m.key);

    assert.ok(keys.includes('builds-through-repetition'), 'Must emit builds-through-repetition marker');
    const compositeMarker = result.find((m) => m.key === 'builds-through-repetition');
    assert.ok(compositeMarker?.source.includes('+'), 'Composite marker must combine input sources');
  });

  it('2. Rule DOES NOT fire when one required marker is missing (exact matching)', () => {
    const inputMarkers: Marker[] = [
      { key: 'socially-selective', thread: 'personality', source: 'personality.extraversion' },
      { key: 'gradual-opening', thread: 'emotional', source: 'emotional.er_opening_pace' },
      // missing depth-oriented
    ];

    const result = composeWithinPerson(inputMarkers);
    const keys = result.map((m) => m.key);

    assert.strictEqual(keys.includes('builds-through-repetition'), false, 'Must NOT emit composite marker when 1 marker is missing');
  });
});
