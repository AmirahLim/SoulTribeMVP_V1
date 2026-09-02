import type { Marker } from './markers.ts';
import type { ThreadKey } from '../matching/evaluation.ts';

export interface WithinPersonRule {
  id: string;
  requiredMarkerKeys: string[];
  emittedKey: string;
  thread: ThreadKey;
}

export const WITHIN_PERSON_RULES: WithinPersonRule[] = [
  {
    id: 'builds-through-repetition',
    requiredMarkerKeys: ['socially-selective', 'gradual-opening', 'depth-oriented'],
    emittedKey: 'builds-through-repetition',
    thread: 'intent',
  },
  {
    id: 'structured-calendar-anchor',
    requiredMarkerKeys: ['advance-planning', 'structured-routine'],
    emittedKey: 'structured-calendar-anchor',
    thread: 'social_rhythm',
  },
  {
    id: 'freewheeling-spontaneity',
    requiredMarkerKeys: ['spontaneous', 'spontaneous-flow'],
    emittedKey: 'freewheeling-spontaneity',
    thread: 'social_rhythm',
  },
  {
    id: 'deep-connection-seeker',
    requiredMarkerKeys: ['depth-oriented', 'vulnerable-sharer'],
    emittedKey: 'deep-connection-seeker',
    thread: 'emotional',
  },
  {
    id: 'table-talk-enthusiast',
    requiredMarkerKeys: ['intimate-group-oriented', 'depth-oriented'],
    emittedKey: 'table-talk-enthusiast',
    thread: 'experience',
  },
  {
    id: 'independent-low-maintenance',
    requiredMarkerKeys: ['low-contact', 'async-pacer'],
    emittedKey: 'independent-low-maintenance',
    thread: 'communication',
  },
];

/**
 * Layer 2 — Within-person composition.
 * Evaluates combinations of markers on a single profile to produce higher-order composite markers.
 * A rule fires ONLY when every required marker is present. Approximate matching is forbidden.
 */
export function composeWithinPerson(markers: Marker[]): Marker[] {
  if (!markers || markers.length === 0) return [];

  const existingKeys = new Set(markers.map((m) => m.key));
  const result: Marker[] = [...markers];

  for (const rule of WITHIN_PERSON_RULES) {
    const hasAll = rule.requiredMarkerKeys.every((k) => existingKeys.has(k));
    if (hasAll && !existingKeys.has(rule.emittedKey)) {
      const sources = markers
        .filter((m) => rule.requiredMarkerKeys.includes(m.key))
        .map((m) => m.source);

      result.push({
        key: rule.emittedKey,
        thread: rule.thread,
        source: sources.join('+'),
      });
      existingKeys.add(rule.emittedKey);
    }
  }

  return result;
}
