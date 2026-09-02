import type { ProfileVector } from '../domain/types.ts';
import type { ThreadKey } from '../matching/evaluation.ts';

export interface Marker {
  key: string;            // e.g. 'socially-selective'
  thread: ThreadKey;      // which Connection Thread it belongs to
  source: string;         // 'q3.groupSize' — mandatory answer source identifier
  polarity?: number;      // 0..1 where the marker sits on a continuum, when meaningful
}

/**
 * Extracts typed markers from a ProfileVector.
 * Extraction is a pure deterministic function: answers -> Marker[].
 * An unanswered question produces NO markers. Never a default marker, never a midpoint one.
 */
export function extractMarkers(vec: ProfileVector): Marker[] {
  if (!vec) return [];

  const markers: Marker[] = [];

  // 1. Personality Thread
  if (vec.personality && (vec.personality.answered ?? 0) > 0) {
    const p = vec.personality;

    if (typeof p.extraversion === 'number') {
      if (p.extraversion >= 0.6) {
        markers.push({ key: 'socially-expansive', thread: 'personality', source: 'personality.extraversion', polarity: p.extraversion });
      } else if (p.extraversion <= 0.4) {
        markers.push({ key: 'socially-selective', thread: 'personality', source: 'personality.extraversion', polarity: p.extraversion });
      }
    }

    if (typeof p.openness === 'number') {
      if (p.openness >= 0.6) {
        markers.push({ key: 'novelty-seeking', thread: 'personality', source: 'personality.openness', polarity: p.openness });
      } else if (p.openness <= 0.4) {
        markers.push({ key: 'familiarity-comfort', thread: 'personality', source: 'personality.openness', polarity: p.openness });
      }
    }

    if (typeof p.conscientiousness === 'number') {
      if (p.conscientiousness >= 0.6) {
        markers.push({ key: 'structured-routine', thread: 'personality', source: 'personality.conscientiousness', polarity: p.conscientiousness });
      } else if (p.conscientiousness <= 0.4) {
        markers.push({ key: 'spontaneous-flow', thread: 'personality', source: 'personality.conscientiousness', polarity: p.conscientiousness });
      }
    }

    if (typeof p.agreeableness === 'number') {
      if (p.agreeableness >= 0.6) {
        markers.push({ key: 'harmony-focused', thread: 'personality', source: 'personality.agreeableness', polarity: p.agreeableness });
      } else if (p.agreeableness <= 0.4) {
        markers.push({ key: 'direct-challenging', thread: 'personality', source: 'personality.agreeableness', polarity: p.agreeableness });
      }
    }

    if (typeof p.serious_playful === 'number') {
      if (p.serious_playful >= 0.6) {
        markers.push({ key: 'playful', thread: 'personality', source: 'personality.serious_playful', polarity: p.serious_playful });
      } else if (p.serious_playful <= 0.4) {
        markers.push({ key: 'serious-reflective', thread: 'personality', source: 'personality.serious_playful', polarity: p.serious_playful });
      }
    }
  }

  // 2. Communication Thread
  if (vec.communication && (vec.communication.answered ?? 0) > 0) {
    const c = vec.communication;

    if (typeof c.response_speed_self === 'number') {
      if (c.response_speed_self >= 0.6) {
        markers.push({ key: 'rapid-responder', thread: 'communication', source: 'communication.response_speed_self', polarity: c.response_speed_self });
      } else if (c.response_speed_self <= 0.4) {
        markers.push({ key: 'async-pacer', thread: 'communication', source: 'communication.response_speed_self', polarity: c.response_speed_self });
      }
    }

    if (typeof c.contact_frequency_self === 'number') {
      if (c.contact_frequency_self >= 0.6) {
        markers.push({ key: 'frequent-touchpoints', thread: 'communication', source: 'communication.contact_frequency_self', polarity: c.contact_frequency_self });
      } else if (c.contact_frequency_self <= 0.4) {
        markers.push({ key: 'low-contact', thread: 'communication', source: 'communication.contact_frequency_self', polarity: c.contact_frequency_self });
      }
    }

    if (typeof c.direct_diplomatic === 'number') {
      if (c.direct_diplomatic >= 0.6) {
        markers.push({ key: 'diplomatic-expresser', thread: 'communication', source: 'communication.direct_diplomatic', polarity: c.direct_diplomatic });
      } else if (c.direct_diplomatic <= 0.4) {
        markers.push({ key: 'direct-communicator', thread: 'communication', source: 'communication.direct_diplomatic', polarity: c.direct_diplomatic });
      }
    }

    if (typeof c.initiation_self === 'number') {
      if (c.initiation_self >= 0.6) {
        markers.push({ key: 'proactive-initiator', thread: 'communication', source: 'communication.initiation_self', polarity: c.initiation_self });
      } else if (c.initiation_self <= 0.4) {
        markers.push({ key: 'responsive-joiner', thread: 'communication', source: 'communication.initiation_self', polarity: c.initiation_self });
      }
    }
  }

  // 3. Social Rhythm Thread
  if (vec.social_rhythm && (vec.social_rhythm.answered ?? 0) > 0) {
    const s = vec.social_rhythm;

    if (typeof s.planning_horizon === 'number') {
      if (s.planning_horizon >= 0.6) {
        markers.push({ key: 'advance-planning', thread: 'social_rhythm', source: 'social_rhythm.planning_horizon', polarity: s.planning_horizon });
      } else if (s.planning_horizon <= 0.4) {
        markers.push({ key: 'spontaneous', thread: 'social_rhythm', source: 'social_rhythm.planning_horizon', polarity: s.planning_horizon });
      }
    }

    if (typeof s.social_freq_self === 'number') {
      if (s.social_freq_self >= 0.6) {
        markers.push({ key: 'weekly-outings', thread: 'social_rhythm', source: 'social_rhythm.social_freq_self', polarity: s.social_freq_self });
      } else if (s.social_freq_self <= 0.4) {
        markers.push({ key: 'occasional-outings', thread: 'social_rhythm', source: 'social_rhythm.social_freq_self', polarity: s.social_freq_self });
      }
    }
  }

  // 4. Intent Thread
  if (vec.intent && (vec.intent.answered ?? 0) > 0) {
    const i = vec.intent;

    if (typeof i.depth === 'number') {
      const normalizedDepth = i.depth > 1 ? i.depth / 4 : i.depth;
      if (normalizedDepth >= 0.6) {
        markers.push({ key: 'depth-oriented', thread: 'intent', source: 'intent.depth', polarity: normalizedDepth });
      } else if (normalizedDepth <= 0.4) {
        markers.push({ key: 'casual-vibe', thread: 'intent', source: 'intent.depth', polarity: normalizedDepth });
      }
    }
  }

  // 5. Emotional Connection Thread
  if (vec.emotional && (vec.emotional.answered ?? 0) > 0) {
    const e = vec.emotional;

    if (typeof e.vulnerability_comfort === 'number') {
      if (e.vulnerability_comfort >= 0.6) {
        markers.push({ key: 'vulnerable-sharer', thread: 'emotional', source: 'emotional.vulnerability_comfort', polarity: e.vulnerability_comfort });
      } else if (e.vulnerability_comfort <= 0.4) {
        markers.push({ key: 'boundary-guarded', thread: 'emotional', source: 'emotional.vulnerability_comfort', polarity: e.vulnerability_comfort });
      }
    }

    if (typeof e.er_opening_pace === 'number') {
      if (e.er_opening_pace >= 0.6) {
        markers.push({ key: 'fast-opening', thread: 'emotional', source: 'emotional.er_opening_pace', polarity: e.er_opening_pace });
      } else if (e.er_opening_pace <= 0.4) {
        markers.push({ key: 'gradual-opening', thread: 'emotional', source: 'emotional.er_opening_pace', polarity: e.er_opening_pace });
      }
    }
  }

  // 6. Interests Thread
  if (vec.interests && vec.interests.length > 0) {
    for (const item of vec.interests) {
      const name = (item.node_name || item.node_path || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (name) {
        markers.push({
          key: `interest-${name}`,
          thread: 'interests',
          source: `interests.${item.node_id || item.node_name}`,
        });
      }
    }
  }

  // 7. Values Thread
  if (vec.values && vec.values.length > 0) {
    for (const val of vec.values) {
      if (val.value_key && val.stance > 0) {
        const keySanitized = val.value_key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        markers.push({
          key: `value-${keySanitized}`,
          thread: 'values',
          source: `values.${val.value_key}`,
          polarity: val.stance,
        });
      }
    }
  }

  // 8. Lifestyle Thread
  if (vec.lifestyle && (vec.lifestyle.answered ?? 0) > 0) {
    const l = vec.lifestyle;
    if (typeof l.budget_band === 'number') {
      markers.push({
        key: `budget-${l.budget_band}`,
        thread: 'lifestyle',
        source: 'lifestyle.budget_band',
        polarity: l.budget_band / 4,
      });
    }
  }

  // 9. Experience Thread
  if (vec.experience && (vec.experience.answered ?? 0) > 0) {
    const ex = vec.experience;
    if (typeof ex.group_size_pref === 'number') {
      if (ex.group_size_pref <= 0.4) {
        markers.push({ key: 'intimate-group-oriented', thread: 'experience', source: 'experience.group_size_pref', polarity: ex.group_size_pref });
      } else if (ex.group_size_pref >= 0.6) {
        markers.push({ key: 'large-group-oriented', thread: 'experience', source: 'experience.group_size_pref', polarity: ex.group_size_pref });
      }
    }
  }

  // 10. Geography Thread
  if (vec.geography && (vec.geography.answered ?? 0) > 0 && vec.geography.home_area) {
    const area = vec.geography.home_area.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    markers.push({
      key: `area-${area}`,
      thread: 'geography',
      source: 'geography.home_area',
    });
  }

  return markers;
}
