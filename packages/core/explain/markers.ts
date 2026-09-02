import type { ProfileVector, OnboardingAnswers } from '../domain/types.ts';
import type { ThreadKey } from '../matching/evaluation.ts';

export interface Marker {
  key: string;            // e.g. 'socially-selective'
  thread: ThreadKey;      // which Connection Thread it belongs to
  source: string;         // 'q3.groupSize' — mandatory answer source identifier
  polarity?: number;      // 0..1 position on continuum when applicable
}

export interface VocabularyRule {
  field: string;
  match: (val: any) => boolean;
  markers: Array<{ key: string; thread: ThreadKey; polarity?: number }>;
}

export const VOCABULARY_TABLE: VocabularyRule[] = [
  // Q3 / Group Size
  {
    field: 'q3GroupSize',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('1-on-1') || v.toLowerCase().includes('1-2') || v.toLowerCase().includes('one-on-one') || v.toLowerCase().includes('intimate')),
    markers: [
      { key: 'intimate-group-oriented', thread: 'experience', polarity: 0.2 },
      { key: 'socially-selective', thread: 'personality', polarity: 0.3 },
      { key: 'energy-conserving', thread: 'personality', polarity: 0.3 },
    ],
  },
  {
    field: 'groupSize',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('1-on-1') || v.toLowerCase().includes('1-2') || v.toLowerCase().includes('one-on-one') || v.toLowerCase().includes('intimate')),
    markers: [
      { key: 'intimate-group-oriented', thread: 'experience', polarity: 0.2 },
      { key: 'socially-selective', thread: 'personality', polarity: 0.3 },
      { key: 'energy-conserving', thread: 'personality', polarity: 0.3 },
    ],
  },
  {
    field: 'q3GroupSize',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('3-4') || v.toLowerCase().includes('3–4') || v.toLowerCase().includes('small')),
    markers: [
      { key: 'intimate-group-oriented', thread: 'experience', polarity: 0.4 },
      { key: 'harmony-focused', thread: 'personality', polarity: 0.7 },
    ],
  },
  {
    field: 'groupSize',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('3-4') || v.toLowerCase().includes('3–4') || v.toLowerCase().includes('small')),
    markers: [
      { key: 'intimate-group-oriented', thread: 'experience', polarity: 0.4 },
      { key: 'harmony-focused', thread: 'personality', polarity: 0.7 },
    ],
  },
  {
    field: 'q3GroupSize',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('5-6') || v.toLowerCase().includes('5–6') || v.toLowerCase().includes('medium') || v.toLowerCase().includes('6+')),
    markers: [
      { key: 'large-group-oriented', thread: 'experience', polarity: 0.8 },
      { key: 'socially-expansive', thread: 'personality', polarity: 0.8 },
    ],
  },
  {
    field: 'groupSize',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('5-6') || v.toLowerCase().includes('5–6') || v.toLowerCase().includes('medium') || v.toLowerCase().includes('6+')),
    markers: [
      { key: 'large-group-oriented', thread: 'experience', polarity: 0.8 },
      { key: 'socially-expansive', thread: 'personality', polarity: 0.8 },
    ],
  },

  // Q4 / Messaging & Contact Frequency
  {
    field: 'q4Social',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('low-maintenance') || v.toLowerCase().includes('no pressure')),
    markers: [
      { key: 'low-contact', thread: 'communication', polarity: 0.3 },
      { key: 'async-pacer', thread: 'communication', polarity: 0.3 },
      { key: 'presence-over-messaging', thread: 'communication', polarity: 0.3 },
    ],
  },
  {
    field: 'messagingStyle',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('low-maintenance') || v.toLowerCase().includes('no pressure')),
    markers: [
      { key: 'low-contact', thread: 'communication', polarity: 0.3 },
      { key: 'async-pacer', thread: 'communication', polarity: 0.3 },
      { key: 'presence-over-messaging', thread: 'communication', polarity: 0.3 },
    ],
  },
  {
    field: 'q4Social',
    match: (v) => typeof v === 'string' && v.toLowerCase().includes('deep conversations every few weeks'),
    markers: [
      { key: 'low-contact', thread: 'communication', polarity: 0.3 },
      { key: 'depth-oriented', thread: 'intent', polarity: 0.8 },
      { key: 'continuity-oriented', thread: 'communication', polarity: 0.7 },
    ],
  },
  {
    field: 'messagingStyle',
    match: (v) => typeof v === 'string' && v.toLowerCase().includes('deep conversations every few weeks'),
    markers: [
      { key: 'low-contact', thread: 'communication', polarity: 0.3 },
      { key: 'depth-oriented', thread: 'intent', polarity: 0.8 },
      { key: 'continuity-oriented', thread: 'communication', polarity: 0.7 },
    ],
  },
  {
    field: 'messagingStyleOpen',
    match: (v) => typeof v === 'string' && v.toLowerCase().includes('deep conversations every few weeks'),
    markers: [
      { key: 'low-contact', thread: 'communication', polarity: 0.3 },
      { key: 'depth-oriented', thread: 'intent', polarity: 0.8 },
      { key: 'continuity-oriented', thread: 'communication', polarity: 0.7 },
    ],
  },
  {
    field: 'q4Social',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('daily') || v.toLowerCase().includes('memes')),
    markers: [
      { key: 'frequent-touchpoints', thread: 'communication', polarity: 0.8 },
      { key: 'rapid-responder', thread: 'communication', polarity: 0.8 },
      { key: 'casual-vibe', thread: 'intent', polarity: 0.3 },
    ],
  },
  {
    field: 'messagingStyle',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('daily') || v.toLowerCase().includes('memes')),
    markers: [
      { key: 'frequent-touchpoints', thread: 'communication', polarity: 0.8 },
      { key: 'rapid-responder', thread: 'communication', polarity: 0.8 },
      { key: 'casual-vibe', thread: 'intent', polarity: 0.3 },
    ],
  },

  // Q5 / Planning & Social Rhythm
  {
    field: 'q5PlanningRhythm',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('planned') || v.toLowerCase().includes('week or two')),
    markers: [
      { key: 'advance-planning', thread: 'social_rhythm', polarity: 0.8 },
      { key: 'structure-seeking', thread: 'social_rhythm', polarity: 0.8 },
      { key: 'commitment-seeking', thread: 'intent', polarity: 0.8 },
    ],
  },
  {
    field: 'q5Planning',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('planned') || v.toLowerCase().includes('week or two')),
    markers: [
      { key: 'advance-planning', thread: 'social_rhythm', polarity: 0.8 },
      { key: 'structure-seeking', thread: 'social_rhythm', polarity: 0.8 },
      { key: 'commitment-seeking', thread: 'intent', polarity: 0.8 },
    ],
  },
  {
    field: 'q5PlanningRhythm',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('spontaneous') || v.toLowerCase().includes('same day')),
    markers: [
      { key: 'spontaneous', thread: 'social_rhythm', polarity: 0.2 },
      { key: 'spontaneous-flow', thread: 'personality', polarity: 0.3 },
      { key: 'flexibility-valuing', thread: 'social_rhythm', polarity: 0.3 },
    ],
  },
  {
    field: 'q5Planning',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('spontaneous') || v.toLowerCase().includes('same day')),
    markers: [
      { key: 'spontaneous', thread: 'social_rhythm', polarity: 0.2 },
      { key: 'spontaneous-flow', thread: 'personality', polarity: 0.3 },
      { key: 'flexibility-valuing', thread: 'social_rhythm', polarity: 0.3 },
    ],
  },

  // Q7 / Trust & Emotional Opening Pace
  {
    field: 'q7Trust',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('observant first') || v.toLowerCase().includes('take time')),
    markers: [
      { key: 'gradual-opening', thread: 'emotional', polarity: 0.3 },
      { key: 'trust-first', thread: 'emotional', polarity: 0.3 },
      { key: 'emotionally-private', thread: 'emotional', polarity: 0.3 },
    ],
  },
  {
    field: 'q7EmotionalPacing',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('observant first') || v.toLowerCase().includes('take time')),
    markers: [
      { key: 'gradual-opening', thread: 'emotional', polarity: 0.3 },
      { key: 'trust-first', thread: 'emotional', polarity: 0.3 },
      { key: 'emotionally-private', thread: 'emotional', polarity: 0.3 },
    ],
  },
  {
    field: 'q7Trust',
    match: (v) => typeof v === 'string' && (v.toLowerCase().includes('open book') || v.toLowerCase().includes('right away')),
    markers: [
      { key: 'fast-opening', thread: 'emotional', polarity: 0.8 },
      { key: 'vulnerable-sharer', thread: 'emotional', polarity: 0.8 },
      { key: 'high-expressiveness', thread: 'emotional', polarity: 0.8 },
    ],
  },

  // MBTI
  {
    field: 'mbti',
    match: (v) => typeof v === 'string' && (v.toUpperCase().startsWith('I')),
    markers: [
      { key: 'socially-selective', thread: 'personality', polarity: 0.3 },
      { key: 'gradual-opening', thread: 'emotional', polarity: 0.4 },
    ],
  },
  {
    field: 'mbti',
    match: (v) => typeof v === 'string' && (v.toUpperCase().startsWith('E')),
    markers: [
      { key: 'socially-expansive', thread: 'personality', polarity: 0.8 },
      { key: 'fast-opening', thread: 'emotional', polarity: 0.7 },
    ],
  },
];

/**
 * Extracts markers from a ProfileVector and optional OnboardingAnswers.
 * Raw onboarding answers are the primary source when present.
 * Numeric ProfileVector traits act as a fallback when raw answers are not available.
 * An unanswered question yields NO markers.
 */
export function extractMarkers(vec: ProfileVector, answersInput?: OnboardingAnswers): Marker[] {
  if (!vec) return [];

  const markers: Marker[] = [];
  const addedKeys = new Set<string>();

  const ans: Record<string, any> = {
    ...(vec.answers || {}),
    ...((vec.answers?.deepProfile as any) || {}),
    ...(answersInput || {}),
    ...((answersInput?.deepProfile as any) || {}),
  };

  // 1. Primary Source: Raw Onboarding Answers lookup in VOCABULARY_TABLE
  for (const rule of VOCABULARY_TABLE) {
    const val = ans[rule.field];
    if (val !== undefined && val !== null && rule.match(val)) {
      for (const m of rule.markers) {
        if (!addedKeys.has(m.key)) {
          markers.push({
            key: m.key,
            thread: m.thread,
            source: `${rule.field}.${String(val).slice(0, 20)}`,
            polarity: m.polarity,
          });
          addedKeys.add(m.key);
        }
      }
    }
  }

  // 2. Vector-based extraction (Fallback for traits not already derived from answers)

  // Personality Thread
  if (vec.personality && (vec.personality.answered ?? 0) > 0) {
    const p = vec.personality;

    if (typeof p.extraversion === 'number') {
      if (p.extraversion >= 0.6 && !addedKeys.has('socially-expansive')) {
        markers.push({ key: 'socially-expansive', thread: 'personality', source: 'personality.extraversion', polarity: p.extraversion });
        addedKeys.add('socially-expansive');
      } else if (p.extraversion <= 0.4 && !addedKeys.has('socially-selective')) {
        markers.push({ key: 'socially-selective', thread: 'personality', source: 'personality.extraversion', polarity: p.extraversion });
        addedKeys.add('socially-selective');
      }
    }

    if (typeof p.openness === 'number') {
      if (p.openness >= 0.6 && !addedKeys.has('novelty-seeking')) {
        markers.push({ key: 'novelty-seeking', thread: 'personality', source: 'personality.openness', polarity: p.openness });
        addedKeys.add('novelty-seeking');
      } else if (p.openness <= 0.4 && !addedKeys.has('familiarity-comfort')) {
        markers.push({ key: 'familiarity-comfort', thread: 'personality', source: 'personality.openness', polarity: p.openness });
        addedKeys.add('familiarity-comfort');
      }
    }

    if (typeof p.conscientiousness === 'number') {
      if (p.conscientiousness >= 0.6 && !addedKeys.has('structured-routine')) {
        markers.push({ key: 'structured-routine', thread: 'personality', source: 'personality.conscientiousness', polarity: p.conscientiousness });
        addedKeys.add('structured-routine');
      } else if (p.conscientiousness <= 0.4 && !addedKeys.has('spontaneous-flow')) {
        markers.push({ key: 'spontaneous-flow', thread: 'personality', source: 'personality.conscientiousness', polarity: p.conscientiousness });
        addedKeys.add('spontaneous-flow');
      }
    }

    if (typeof p.agreeableness === 'number') {
      if (p.agreeableness >= 0.6 && !addedKeys.has('harmony-focused')) {
        markers.push({ key: 'harmony-focused', thread: 'personality', source: 'personality.agreeableness', polarity: p.agreeableness });
        addedKeys.add('harmony-focused');
      } else if (p.agreeableness <= 0.4 && !addedKeys.has('direct-challenging')) {
        markers.push({ key: 'direct-challenging', thread: 'personality', source: 'personality.agreeableness', polarity: p.agreeableness });
        addedKeys.add('direct-challenging');
      }
    }

    if (typeof p.serious_playful === 'number') {
      if (p.serious_playful >= 0.6 && !addedKeys.has('playful')) {
        markers.push({ key: 'playful', thread: 'personality', source: 'personality.serious_playful', polarity: p.serious_playful });
        addedKeys.add('playful');
      } else if (p.serious_playful <= 0.4 && !addedKeys.has('serious-reflective')) {
        markers.push({ key: 'serious-reflective', thread: 'personality', source: 'personality.serious_playful', polarity: p.serious_playful });
        addedKeys.add('serious-reflective');
      }
    }
  }

  // Communication Thread
  if (vec.communication && (vec.communication.answered ?? 0) > 0) {
    const c = vec.communication;

    if (typeof c.response_speed_self === 'number') {
      if (c.response_speed_self >= 0.6 && !addedKeys.has('rapid-responder')) {
        markers.push({ key: 'rapid-responder', thread: 'communication', source: 'communication.response_speed_self', polarity: c.response_speed_self });
        addedKeys.add('rapid-responder');
      } else if (c.response_speed_self <= 0.4 && !addedKeys.has('async-pacer')) {
        markers.push({ key: 'async-pacer', thread: 'communication', source: 'communication.response_speed_self', polarity: c.response_speed_self });
        addedKeys.add('async-pacer');
      }
    }

    if (typeof c.contact_frequency_self === 'number') {
      if (c.contact_frequency_self >= 0.6 && !addedKeys.has('frequent-touchpoints')) {
        markers.push({ key: 'frequent-touchpoints', thread: 'communication', source: 'communication.contact_frequency_self', polarity: c.contact_frequency_self });
        addedKeys.add('frequent-touchpoints');
      } else if (c.contact_frequency_self <= 0.4 && !addedKeys.has('low-contact')) {
        markers.push({ key: 'low-contact', thread: 'communication', source: 'communication.contact_frequency_self', polarity: c.contact_frequency_self });
        addedKeys.add('low-contact');
      }
    }

    if (typeof c.direct_diplomatic === 'number') {
      if (c.direct_diplomatic >= 0.6 && !addedKeys.has('diplomatic-expresser')) {
        markers.push({ key: 'diplomatic-expresser', thread: 'communication', source: 'communication.direct_diplomatic', polarity: c.direct_diplomatic });
        addedKeys.add('diplomatic-expresser');
      } else if (c.direct_diplomatic <= 0.4 && !addedKeys.has('direct-communicator')) {
        markers.push({ key: 'direct-communicator', thread: 'communication', source: 'communication.direct_diplomatic', polarity: c.direct_diplomatic });
        addedKeys.add('direct-communicator');
      }
    }

    if (typeof c.initiation_self === 'number') {
      if (c.initiation_self >= 0.6 && !addedKeys.has('proactive-initiator')) {
        markers.push({ key: 'proactive-initiator', thread: 'communication', source: 'communication.initiation_self', polarity: c.initiation_self });
        addedKeys.add('proactive-initiator');
      } else if (c.initiation_self <= 0.4 && !addedKeys.has('responsive-joiner')) {
        markers.push({ key: 'responsive-joiner', thread: 'communication', source: 'communication.initiation_self', polarity: c.initiation_self });
        addedKeys.add('responsive-joiner');
      }
    }
  }

  // Social Rhythm Thread
  if (vec.social_rhythm && (vec.social_rhythm.answered ?? 0) > 0) {
    const s = vec.social_rhythm;

    if (typeof s.planning_horizon === 'number') {
      if (s.planning_horizon >= 0.6 && !addedKeys.has('advance-planning')) {
        markers.push({ key: 'advance-planning', thread: 'social_rhythm', source: 'social_rhythm.planning_horizon', polarity: s.planning_horizon });
        addedKeys.add('advance-planning');
      } else if (s.planning_horizon <= 0.4 && !addedKeys.has('spontaneous')) {
        markers.push({ key: 'spontaneous', thread: 'social_rhythm', source: 'social_rhythm.planning_horizon', polarity: s.planning_horizon });
        addedKeys.add('spontaneous');
      }
    }

    if (typeof s.social_freq_self === 'number') {
      if (s.social_freq_self >= 0.6 && !addedKeys.has('weekly-outings')) {
        markers.push({ key: 'weekly-outings', thread: 'social_rhythm', source: 'social_rhythm.social_freq_self', polarity: s.social_freq_self });
        addedKeys.add('weekly-outings');
      } else if (s.social_freq_self <= 0.4 && !addedKeys.has('occasional-outings')) {
        markers.push({ key: 'occasional-outings', thread: 'social_rhythm', source: 'social_rhythm.social_freq_self', polarity: s.social_freq_self });
        addedKeys.add('occasional-outings');
      }
    }
  }

  // Intent Thread
  if (vec.intent && (vec.intent.answered ?? 0) > 0) {
    const i = vec.intent;

    if (typeof i.depth === 'number') {
      const normalizedDepth = i.depth > 1 ? i.depth / 4 : i.depth;
      if (normalizedDepth >= 0.6 && !addedKeys.has('depth-oriented')) {
        markers.push({ key: 'depth-oriented', thread: 'intent', source: 'intent.depth', polarity: normalizedDepth });
        addedKeys.add('depth-oriented');
      } else if (normalizedDepth <= 0.4 && !addedKeys.has('casual-vibe')) {
        markers.push({ key: 'casual-vibe', thread: 'intent', source: 'intent.depth', polarity: normalizedDepth });
        addedKeys.add('casual-vibe');
      }
    }
  }

  // Emotional Connection Thread
  if (vec.emotional && (vec.emotional.answered ?? 0) > 0) {
    const e = vec.emotional;

    if (typeof e.vulnerability_comfort === 'number') {
      if (e.vulnerability_comfort >= 0.6 && !addedKeys.has('vulnerable-sharer')) {
        markers.push({ key: 'vulnerable-sharer', thread: 'emotional', source: 'emotional.vulnerability_comfort', polarity: e.vulnerability_comfort });
        addedKeys.add('vulnerable-sharer');
      } else if (e.vulnerability_comfort <= 0.4 && !addedKeys.has('boundary-guarded')) {
        markers.push({ key: 'boundary-guarded', thread: 'emotional', source: 'emotional.vulnerability_comfort', polarity: e.vulnerability_comfort });
        addedKeys.add('boundary-guarded');
      }
    }

    if (typeof e.er_opening_pace === 'number') {
      if (e.er_opening_pace >= 0.6 && !addedKeys.has('fast-opening')) {
        markers.push({ key: 'fast-opening', thread: 'emotional', source: 'emotional.er_opening_pace', polarity: e.er_opening_pace });
        addedKeys.add('fast-opening');
      } else if (e.er_opening_pace <= 0.4 && !addedKeys.has('gradual-opening')) {
        markers.push({ key: 'gradual-opening', thread: 'emotional', source: 'emotional.er_opening_pace', polarity: e.er_opening_pace });
        addedKeys.add('gradual-opening');
      }
    }
  }

  // Interests Thread
  if (vec.interests && vec.interests.length > 0) {
    for (const item of vec.interests) {
      const name = (item.node_name || item.node_path || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (name && !addedKeys.has(`interest-${name}`)) {
        markers.push({
          key: `interest-${name}`,
          thread: 'interests',
          source: `interests.${item.node_id || item.node_name}`,
        });
        addedKeys.add(`interest-${name}`);
      }
    }
  }

  // Values Thread
  if (vec.values && vec.values.length > 0) {
    for (const val of vec.values) {
      if (val.value_key && val.stance > 0) {
        const keySanitized = val.value_key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (!addedKeys.has(`value-${keySanitized}`)) {
          markers.push({
            key: `value-${keySanitized}`,
            thread: 'values',
            source: `values.${val.value_key}`,
            polarity: val.stance,
          });
          addedKeys.add(`value-${keySanitized}`);
        }
      }
    }
  }

  // Lifestyle Thread
  if (vec.lifestyle && (vec.lifestyle.answered ?? 0) > 0) {
    const l = vec.lifestyle;
    if (typeof l.budget_band === 'number' && !addedKeys.has(`budget-${l.budget_band}`)) {
      markers.push({
        key: `budget-${l.budget_band}`,
        thread: 'lifestyle',
        source: 'lifestyle.budget_band',
        polarity: l.budget_band / 4,
      });
      addedKeys.add(`budget-${l.budget_band}`);
    }
  }

  // Experience Thread
  if (vec.experience && (vec.experience.answered ?? 0) > 0) {
    const ex = vec.experience;
    if (typeof ex.group_size_pref === 'number') {
      if (ex.group_size_pref <= 0.4 && !addedKeys.has('intimate-group-oriented')) {
        markers.push({ key: 'intimate-group-oriented', thread: 'experience', source: 'experience.group_size_pref', polarity: ex.group_size_pref });
        addedKeys.add('intimate-group-oriented');
      } else if (ex.group_size_pref >= 0.6 && !addedKeys.has('large-group-oriented')) {
        markers.push({ key: 'large-group-oriented', thread: 'experience', source: 'experience.group_size_pref', polarity: ex.group_size_pref });
        addedKeys.add('large-group-oriented');
      }
    }
  }

  // Geography Thread
  if (vec.geography && (vec.geography.answered ?? 0) > 0 && vec.geography.home_area) {
    const area = vec.geography.home_area.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!addedKeys.has(`area-${area}`)) {
      markers.push({
        key: `area-${area}`,
        thread: 'geography',
        source: 'geography.home_area',
      });
      addedKeys.add(`area-${area}`);
    }
  }

  return markers;
}
