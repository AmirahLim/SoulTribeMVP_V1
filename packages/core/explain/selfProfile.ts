/**
 * Self-Profile Synthesizer
 *
 * Takes a single ProfileVector and produces all the data needed
 * for the "You" page. Pure TypeScript — zero React, Next, or Supabase imports.
 *
 * Uses the same marker system as the dyadic explanation generator,
 * but applies it within-person to produce a self-portrait.
 */
import type { ProfileVector } from '../domain/types.ts';
import type { ThreadKey } from '../matching/evaluation.ts';
import type { Marker } from './markers.ts';
import { extractMarkers } from './markers.ts';
import { composeWithinPerson } from './withinPerson.ts';
import { PHRASES_YOU } from './phrases.ts';

// ─── Output Types ────────────────────────────────────────────────────

export interface BloomThread {
  key: string;
  label: string;
  strength: number;     // 0..1
  confidence: number;   // 0..1
  sentence: string;     // Human-readable description of this thread for this person
}

export interface ConnectionThread {
  key: string;
  name: string;
  heroDescriptor: string[];
  strength: number;
  confidence: number;
  note: string;
  naturalSetting?: string;
  thriveWhen?: string;
  signals: Array<{ key: string; label: string; evidenceLevel: string }>;
  extraVisualData?: Record<string, any>;
}

export interface TribalReadData {
  headline: string;
  summary: string;
  pills: string[];
  topThreads: [string, string];
  sections: Array<{ title: string; content: string; markerCount: number }>;
}

export interface ContradictionData {
  headline: string;
  explanation: string;
  threadsInvolved: string[];
}

export interface ConnectionNote {
  id: string;
  hook: string;
  statement: string;
  explanation: string;
  whatItLooksLike?: string;
  sourceThreads?: string[];
}

export type InstinctType =
  | 'Connector' | 'Anchor' | 'Explorer' | 'Deep Diver'
  | 'Spark' | 'Gatherer' | 'Bridge' | 'Cultivator' | 'Catalyst' | 'Keeper';

export interface InstinctData {
  type: InstinctType;
  description: string;
}

export interface OutingPrefData {
  descriptors: string[];
  values: [number, number, number];
  instantYes?: string;
  usuallyYes?: string[];
  convinceMe?: string[];
}

export interface BoundaryData {
  punctualityStance: string;
  cancellationStance: string;
  groupSizeBoundary: string;
  locationBoundary: string;
}

export interface SelfProfileData {
  bloomThreads: BloomThread[];
  connectionThreads: ConnectionThread[];
  tribalRead: TribalReadData;
  contradiction?: ContradictionData;
  connectionNotes: ConnectionNote[];
  primaryInstinct: InstinctData;
  outingPreferences: OutingPrefData;
  boundaries: BoundaryData;
}

// ─── Thread metadata ─────────────────────────────────────────────────

const THREAD_LABELS: Record<ThreadKey, string> = {
  personality: 'Social Energy',
  communication: 'Communication',
  social_rhythm: 'Social Rhythm',
  intent: 'Friendship Style',
  emotional: 'Emotional Connection',
  interests: 'Interests',
  values: 'Values',
  lifestyle: 'Play & Humour',
  experience: 'Conversation',
  geography: 'Availability',
};

const ALL_THREADS: ThreadKey[] = [
  'personality', 'communication', 'social_rhythm', 'intent', 'emotional',
  'interests', 'values', 'lifestyle', 'experience', 'geography',
];

// ─── Marker-to-descriptor mapping ────────────────────────────────────

const MARKER_DESCRIPTORS: Record<string, string[]> = {
  'socially-selective': ['Intimate', 'Selective', 'Calm'],
  'socially-expansive': ['Social', 'Expansive', 'High-energy'],
  'energy-conserving': ['Quiet', 'Thoughtful', 'Measured'],
  'harmony-focused': ['Warm', 'Agreeable', 'Diplomatic'],
  'direct-challenging': ['Direct', 'Candid', 'Forthright'],
  'novelty-seeking': ['Curious', 'Adventurous', 'Open'],
  'familiarity-comfort': ['Steady', 'Familiar', 'Grounded'],
  'structured-routine': ['Organised', 'Structured', 'Consistent'],
  'spontaneous-flow': ['Spontaneous', 'Flexible', 'Free-flowing'],
  'playful': ['Playful', 'Light-hearted', 'Witty'],
  'serious-reflective': ['Thoughtful', 'Reflective', 'Earnest'],
  'low-contact': ['Asynchronous', 'Low-pressure', 'Intentional'],
  'async-pacer': ['Unhurried', 'Low-pressure', 'Patient'],
  'frequent-touchpoints': ['Connected', 'Regular', 'Responsive'],
  'rapid-responder': ['Prompt', 'Responsive', 'Attentive'],
  'diplomatic-expresser': ['Diplomatic', 'Careful', 'Considered'],
  'direct-communicator': ['Direct', 'Clear', 'Upfront'],
  'proactive-initiator': ['Proactive', 'Initiative-taking', 'Organiser'],
  'responsive-joiner': ['Responsive', 'Goes-with-flow', 'Agreeable'],
  'advance-planning': ['Structured', 'Advance-planned'],
  'spontaneous': ['Spontaneous', 'Flexible'],
  'depth-oriented': ['Close', 'Independent', 'Steady'],
  'casual-vibe': ['Casual', 'Easy-going', 'Light'],
  'gradual-opening': ['Gradual', 'Trust-building', 'Patient'],
  'fast-opening': ['Open', 'Warm', 'Expressive'],
  'trust-first': ['Watchful', 'Earned-trust', 'Careful'],
  'vulnerable-sharer': ['Open-hearted', 'Expressive', 'Transparent'],
  'boundary-guarded': ['Private', 'Guarded', 'Measured'],
  'presence-over-messaging': ['Present', 'In-person', 'Face-to-face'],
};

// ─── Marker-to-note templates ────────────────────────────────────────

interface NoteTemplate {
  markerKey: string;
  hook: string;
  statement: string;
  explanation: string;
  whatItLooksLike: string;
  sourceThreads: string[];
}

const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    markerKey: 'socially-selective',
    hook: 'How to become friends with me',
    statement: 'Invite me to low-key, focused activities first',
    explanation: 'I feel most comfortable when there is a shared activity or quiet setting to ground our conversation.',
    whatItLooksLike: 'A quiet coffee walk or a workshop works better than a noisy bar.',
    sourceThreads: ['personality', 'experience'],
  },
  {
    markerKey: 'async-pacer',
    hook: 'What makes me feel close',
    statement: 'Thoughtful catch-ups without reply pressure',
    explanation: 'Taking time to reply to messages is normal for me, and I appreciate friends who hold zero pressure around reply speed.',
    whatItLooksLike: 'Picking up a text thread days later without awkwardness.',
    sourceThreads: ['communication'],
  },
  {
    markerKey: 'low-contact',
    hook: 'What makes me feel close',
    statement: 'Unhurried, low-frequency connection',
    explanation: 'I value quality over quantity in communication. A thoughtful message every few weeks means more than daily small talk.',
    whatItLooksLike: 'Meeting up monthly and barely texting in between — and that feels right.',
    sourceThreads: ['communication'],
  },
  {
    markerKey: 'advance-planning',
    hook: 'How to spend time with me',
    statement: 'Lock plans in a week or two ahead',
    explanation: 'I do best with plans that are confirmed early. Last-minute changes or vague "let\'s see" creates friction for me.',
    whatItLooksLike: 'A calendar invite or confirmed time and place, not an open-ended "let\'s hang soon".',
    sourceThreads: ['social_rhythm'],
  },
  {
    markerKey: 'spontaneous',
    hook: 'How to spend time with me',
    statement: 'Keep it loose — same-day plans are best',
    explanation: 'I thrive on spontaneity. Locking things in too far ahead makes them feel like obligations.',
    whatItLooksLike: 'A "free right now?" text that leads to coffee in 30 minutes.',
    sourceThreads: ['social_rhythm'],
  },
  {
    markerKey: 'depth-oriented',
    hook: 'What I value in friendship',
    statement: 'A small number of people, held closely',
    explanation: 'I prefer fewer, deeper friendships over a large social network. I invest heavily in the people I let in.',
    whatItLooksLike: 'Regular one-on-one catch-ups that go long and cover real ground.',
    sourceThreads: ['intent'],
  },
  {
    markerKey: 'gradual-opening',
    hook: 'How trust works for me',
    statement: 'I warm up through repeated, low-pressure meetings',
    explanation: 'I pace trust thoughtfully over repeated catch-ups. Vulnerability comes with familiarity, not forced sharing.',
    whatItLooksLike: 'Coffee three or four times before conversations turn personal.',
    sourceThreads: ['emotional'],
  },
  {
    markerKey: 'fast-opening',
    hook: 'How trust works for me',
    statement: 'I open up quickly and warmly',
    explanation: 'I tend to share early and expect reciprocity. Closed-off first meetings feel slow to me.',
    whatItLooksLike: 'First hangout conversations that go deep, fast.',
    sourceThreads: ['emotional'],
  },
  {
    markerKey: 'frequent-touchpoints',
    hook: 'How to stay connected with me',
    statement: 'Regular check-ins keep us close',
    explanation: 'I feel most connected when there is a rhythm of daily or near-daily touchpoints, even small ones.',
    whatItLooksLike: 'Memes, voice notes, quick replies — the thread never really goes quiet.',
    sourceThreads: ['communication'],
  },
  {
    markerKey: 'novelty-seeking',
    hook: 'What energises me',
    statement: 'New experiences and unfamiliar places',
    explanation: 'I am drawn to trying things I have not done before. Routine can feel stale quickly.',
    whatItLooksLike: 'Suggesting a pottery class neither of us has tried, or a neighbourhood walk in an unfamiliar area.',
    sourceThreads: ['personality', 'experience'],
  },
];

// ─── Contradiction detection rules ───────────────────────────────────

interface ContradictionRule {
  markers: [string, string];
  headline: string;
  explanation: string;
  threads: string[];
}

const CONTRADICTION_RULES: ContradictionRule[] = [
  {
    markers: ['novelty-seeking', 'advance-planning'],
    headline: 'Adventurous, but not chaotic.',
    explanation: 'You actively seek unfamiliar experiences, but prefer knowing they\'re happening ahead of time. Novelty energises you; logistical uncertainty doesn\'t.',
    threads: ['personality', 'social_rhythm'],
  },
  {
    markers: ['socially-selective', 'proactive-initiator'],
    headline: 'Quiet energy, but you make the plans.',
    explanation: 'You prefer small groups and calm settings, but you\'re often the one who organises them. You curate your social world rather than waiting for it to happen.',
    threads: ['personality', 'communication'],
  },
  {
    markers: ['depth-oriented', 'spontaneous'],
    headline: 'Deep bonds, loose plans.',
    explanation: 'You want close, enduring friendships but resist locking them into rigid calendars. The depth is in the relationship, not the schedule.',
    threads: ['intent', 'social_rhythm'],
  },
  {
    markers: ['gradual-opening', 'frequent-touchpoints'],
    headline: 'Slow to open, but likes to stay in touch.',
    explanation: 'You keep emotional walls up early, but want the digital thread to stay active. You warm up through consistent low-stakes contact.',
    threads: ['emotional', 'communication'],
  },
];

// ─── Instinct derivation ─────────────────────────────────────────────

function deriveInstinct(markers: Marker[], vec: ProfileVector): InstinctData {
  const keys = new Set(markers.map((m) => m.key));

  if (keys.has('proactive-initiator') && keys.has('intimate-group-oriented')) {
    return { type: 'Gatherer', description: 'organising small, intentional meetups for people who wouldn\'t have met otherwise' };
  }
  if (keys.has('proactive-initiator') && keys.has('socially-expansive')) {
    return { type: 'Catalyst', description: 'sparking energy in groups and making sure everyone has a good time' };
  }
  if (keys.has('depth-oriented') && keys.has('gradual-opening')) {
    return { type: 'Deep Diver', description: 'building trust slowly and investing deeply in a small circle' };
  }
  if (keys.has('novelty-seeking') && (keys.has('socially-expansive') || keys.has('large-group-oriented'))) {
    return { type: 'Explorer', description: 'seeking out new experiences and bringing people along for the ride' };
  }
  if (keys.has('novelty-seeking')) {
    return { type: 'Explorer', description: 'seeking out unfamiliar experiences and sharing them with close friends' };
  }
  if (keys.has('advance-planning') && keys.has('structured-routine')) {
    return { type: 'Anchor', description: 'being the steady, reliable presence that holds a friend group together' };
  }
  if (keys.has('responsive-joiner') && keys.has('harmony-focused')) {
    return { type: 'Keeper', description: 'maintaining warmth and harmony in existing friendships through consistent care' };
  }
  if (keys.has('frequent-touchpoints') || keys.has('rapid-responder')) {
    return { type: 'Bridge', description: 'keeping connections alive through regular touchpoints and genuine check-ins' };
  }
  if (keys.has('socially-selective') || keys.has('depth-oriented')) {
    return { type: 'Cultivator', description: 'tending to a small number of friendships with patience and intention' };
  }

  // Default based on vector data
  if (vec.intent?.open_to_hosting) {
    return { type: 'Connector', description: 'bringing people together around shared activities and experiences' };
  }
  return { type: 'Connector', description: 'building meaningful connections through shared experience' };
}

// ─── Sentence generation from vector data ────────────────────────────

function generateThreadSentence(thread: ThreadKey, vec: ProfileVector, markers: Marker[]): string {
  const threadMarkers = markers.filter((m) => m.thread === thread);
  const keys = new Set(threadMarkers.map((m) => m.key));

  switch (thread) {
    case 'personality': {
      const ext = vec.personality?.extraversion;
      if (typeof ext === 'number') {
        const phrase = PHRASES_YOU.extraversion(ext);
        if (ext <= 0.4) return `You ${phrase}. Smaller groups let you show up fully.`;
        if (ext >= 0.7) return `You ${phrase}. Bigger gatherings give you momentum.`;
        return `You ${phrase}.`;
      }
      if (keys.has('socially-selective')) return 'You recharge in smaller settings where real conversation can happen.';
      if (keys.has('socially-expansive')) return 'You draw energy from groups and busy social settings.';
      return 'Your social energy style is still developing.';
    }
    case 'communication': {
      const resp = vec.communication?.response_speed_self;
      if (typeof resp === 'number') {
        const phrase = PHRASES_YOU.responseSpeed(resp);
        if (resp <= 0.4) return `You ${phrase}. A quiet fortnight doesn't read as distance.`;
        return `You ${phrase}.`;
      }
      if (keys.has('async-pacer')) return 'You surface in bursts. A quiet stretch doesn\'t read as distance.';
      if (keys.has('frequent-touchpoints')) return 'You like staying connected through regular digital touchpoints.';
      return 'Your communication style is still developing.';
    }
    case 'social_rhythm': {
      const plan = vec.social_rhythm?.planning_horizon;
      if (typeof plan === 'number') {
        const phrase = PHRASES_YOU.planningHorizon(plan);
        if (plan >= 0.6) return `You ${phrase}. Same-day invitations rarely stick.`;
        if (plan <= 0.3) return `You ${phrase}. Spontaneity keeps things fresh.`;
        return `You ${phrase}.`;
      }
      if (keys.has('advance-planning')) return 'Plans land best a week or two out. Same-day invitations rarely stick.';
      if (keys.has('spontaneous')) return 'You prefer plans that come together in the moment.';
      return 'Your planning rhythm is still developing.';
    }
    case 'intent': {
      const depth = vec.intent?.depth;
      if (typeof depth === 'number') {
        const phrase = PHRASES_YOU.depth(depth);
        return `You ${phrase}.`;
      }
      if (keys.has('depth-oriented')) return 'A small number of people, held closely — and comfortable when everyone disappears into their own life for a while.';
      return 'Your friendship intent is still developing.';
    }
    case 'emotional': {
      const pace = vec.emotional?.er_opening_pace;
      if (typeof pace === 'number') {
        const phrase = PHRASES_YOU.openingPace(pace);
        return `You ${phrase}.`;
      }
      if (keys.has('gradual-opening')) return 'You pace trust thoughtfully over repeated catch-ups.';
      if (keys.has('fast-opening')) return 'You tend to open up quickly and warmly.';
      return 'Your emotional connection style is still developing.';
    }
    case 'interests': {
      if (vec.interests && vec.interests.length > 0) {
        const names = vec.interests.slice(0, 3).map((i) => i.node_name || i.node_path);
        if (names.length === 1) return `Loves ${names[0]}.`;
        if (names.length === 2) return `Loves ${names[0]} and ${names[1]}.`;
        return `Loves ${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}.`;
      }
      return 'Interests are still being explored.';
    }
    case 'values': {
      if (vec.values && vec.values.length > 0) {
        const topValue = vec.values.sort((a, b) => (b.importance || 0) - (a.importance || 0))[0];
        const name = topValue.value_key.charAt(0).toUpperCase() + topValue.value_key.slice(1);
        return `${name} sits at the centre of most of your answers.`;
      }
      return 'Your core values are still being defined.';
    }
    case 'lifestyle': {
      const budget = vec.lifestyle?.budget_band;
      if (typeof budget === 'number') {
        const phrase = PHRASES_YOU.budgetBand(budget);
        return `You ${phrase}.`;
      }
      return 'Your lifestyle preferences are still developing.';
    }
    case 'experience': {
      const grp = vec.experience?.group_size_pref;
      if (typeof grp === 'number') {
        const phrase = PHRASES_YOU.groupSize(grp);
        return `You ${phrase}.`;
      }
      return 'Your outing preferences are still developing.';
    }
    case 'geography': {
      const area = vec.geography?.home_area;
      if (area) return `Based in ${area}.`;
      return 'Location not yet shared.';
    }
  }
}

// ─── Bloom thread strength from vector data ──────────────────────────

function getThreadStrength(thread: ThreadKey, vec: ProfileVector): number {
  const section = vec[thread as keyof ProfileVector] as any;
  if (!section) return 0;

  // Arrays (interests, values) — use count-based strength
  if (Array.isArray(section)) {
    if (section.length === 0) return 0;
    return Math.min(1, section.length * 0.25);
  }

  // Objects with 'answered' field — proportional to answer count
  if (typeof section === 'object' && typeof section.answered === 'number') {
    if (section.answered === 0) return 0;

    // Use the average of non-null numeric fields as a signal density metric
    const numericFields = Object.entries(section)
      .filter(([k, v]) => k !== 'answered' && typeof v === 'number')
      .map(([, v]) => v as number);

    if (numericFields.length === 0) return Math.min(1, section.answered * 0.2);

    // Signal density: how many fields have been filled relative to expected
    const density = Math.min(1, numericFields.length / 5);
    const answeredBonus = Math.min(1, section.answered / 5);
    return (density + answeredBonus) / 2;
  }

  return 0;
}

function getThreadConfidence(thread: ThreadKey, vec: ProfileVector): number {
  const section = vec[thread as keyof ProfileVector] as any;
  if (!section) return 0;
  if (Array.isArray(section)) return section.length > 0 ? Math.min(1, section.length * 0.3) : 0;
  if (typeof section === 'object' && typeof section.answered === 'number') {
    return Math.min(1, section.answered * 0.2);
  }
  return 0;
}

// ─── Tribal Read generation ──────────────────────────────────────────

function generateTribalRead(markers: Marker[], vec: ProfileVector): TribalReadData {
  if (markers.length === 0) {
    return {
      headline: 'Still getting to know you',
      summary: 'Complete more of your Tribal Pass to see your full social portrait.',
      pills: [],
      topThreads: ['personality', 'communication'],
      sections: [],
    };
  }

  const keys = new Set(markers.map((m) => m.key));

  // Build headline from top markers
  const headlineParts: string[] = [];
  if (keys.has('socially-selective') || keys.has('intimate-group-oriented')) headlineParts.push('Selective');
  else if (keys.has('socially-expansive') || keys.has('large-group-oriented')) headlineParts.push('Social');

  if (keys.has('novelty-seeking')) headlineParts.push('curious');
  else if (keys.has('familiarity-comfort')) headlineParts.push('grounded');
  else if (keys.has('depth-oriented')) headlineParts.push('intentional');

  if (keys.has('spontaneous') || keys.has('spontaneous-flow')) headlineParts.push('spontaneous');
  else if (keys.has('advance-planning')) headlineParts.push('quietly adventurous');
  else if (keys.has('gradual-opening')) headlineParts.push('warmly guarded');

  if (headlineParts.length === 0) headlineParts.push('Developing', 'open');

  const headline = headlineParts.join(', ').replace(/^./, (c) => c.toUpperCase()) + (headlineParts.length > 1 ? '' : ' & evolving');

  // Build summary
  const summaryParts: string[] = [];
  if (keys.has('socially-selective') || keys.has('intimate-group-oriented')) {
    summaryParts.push('You build connection through smaller settings and shared experience');
  } else if (keys.has('socially-expansive')) {
    summaryParts.push('You thrive in groups and draw energy from social momentum');
  } else {
    summaryParts.push('You build connection through shared experience');
  }

  if (keys.has('depth-oriented') || keys.has('gradual-opening')) {
    summaryParts.push('conversations that start somewhere ordinary and end up somewhere neither of you planned');
  } else if (keys.has('casual-vibe')) {
    summaryParts.push('easy-going hangouts where nothing needs to be deep');
  }

  const summary = summaryParts.join(' — ') + '.';

  // Build pills
  const pills: string[] = [];
  if (keys.has('socially-selective') || keys.has('intimate-group-oriented')) pills.push('Small-circle energy');
  if (keys.has('socially-expansive') || keys.has('large-group-oriented')) pills.push('Group energy');
  if (keys.has('depth-oriented')) pills.push('Depth over frequency');
  if (keys.has('casual-vibe')) pills.push('Light-touch friendships');
  if (keys.has('novelty-seeking')) pills.push('Novelty-seeking');
  if (keys.has('advance-planning')) pills.push('Plans-ahead');
  if (keys.has('spontaneous')) pills.push('Spontaneous');
  if (keys.has('async-pacer') || keys.has('low-contact')) pills.push('Low-contact');
  if (keys.has('frequent-touchpoints')) pills.push('Stays connected');

  // Build sections
  const sections: Array<{ title: string; content: string; markerCount: number }> = [];

  // Section 1: Who you are socially
  const socialMarkers = markers.filter((m) => m.thread === 'personality' || m.thread === 'experience');
  if (socialMarkers.length > 0) {
    let content = 'You protect your social energy for ';
    if (keys.has('socially-selective') || keys.has('intimate-group-oriented')) {
      content += 'high-quality, focused meetups where real conversation can happen.';
    } else if (keys.has('socially-expansive')) {
      content += 'gatherings that have momentum and bring people together.';
    } else {
      content += 'settings where you can show up authentically.';
    }
    sections.push({ title: 'Who you are socially', content, markerCount: socialMarkers.length });
  }

  // Section 2: You connect through
  const connectMarkers = markers.filter((m) => m.thread === 'communication' || m.thread === 'interests');
  if (connectMarkers.length > 0) {
    let content = '';
    if (vec.interests && vec.interests.length > 0) {
      const names = vec.interests.slice(0, 3).map((i) => i.node_name || i.node_path);
      content = `Hands-on shared activities like ${names.join(', ')} that provide an easy anchor.`;
    } else if (keys.has('async-pacer') || keys.has('low-contact')) {
      content = 'Thoughtful, unhurried conversations and shared experiences.';
    } else {
      content = 'Shared activities and genuine conversations.';
    }
    sections.push({ title: 'You connect through', content, markerCount: connectMarkers.length });
  }

  // Section 3: You're at your best with
  const bestWithMarkers = markers.filter((m) => m.thread === 'social_rhythm' || m.thread === 'emotional');
  if (bestWithMarkers.length > 0) {
    const parts: string[] = [];
    if (keys.has('async-pacer') || keys.has('low-contact')) parts.push('respect your unhurried response pace');
    if (keys.has('advance-planning')) parts.push('value planned dates locked in early');
    if (keys.has('spontaneous')) parts.push('are up for spontaneous adventures');
    if (keys.has('gradual-opening')) parts.push('let trust build naturally over time');
    const content = parts.length > 0
      ? `Friends who ${parts.join(' and ')}.`
      : 'Friends who match your social rhythm and emotional pace.';
    sections.push({ title: "You're at your best with", content, markerCount: bestWithMarkers.length });
  }

  // Find top 2 threads by marker count
  const threadCounts: Record<string, number> = {};
  markers.forEach((m) => { threadCounts[m.thread] = (threadCounts[m.thread] || 0) + 1; });
  const sorted = Object.entries(threadCounts).sort((a, b) => b[1] - a[1]);
  const topThreads: [string, string] = [
    sorted[0]?.[0] || 'personality',
    sorted[1]?.[0] || 'communication',
  ];

  return { headline, summary, pills: pills.slice(0, 3), topThreads, sections };
}

// ─── Outing preferences from vector ──────────────────────────────────

function deriveOutingPreferences(vec: ProfileVector, markers: Marker[]): OutingPrefData {
  const keys = new Set(markers.map((m) => m.key));

  const descriptors: string[] = [];
  if (keys.has('socially-selective') || keys.has('intimate-group-oriented')) descriptors.push('Low-key');
  else descriptors.push('Social');
  if (keys.has('novelty-seeking')) descriptors.push('Exploratory');
  else descriptors.push('Familiar');
  if (vec.interests && vec.interests.length > 0) descriptors.push('Creative');
  else descriptors.push('Easygoing');

  const values: [number, number, number] = [
    keys.has('socially-selective') ? 0.85 : 0.5,
    vec.interests && vec.interests.length > 0 ? Math.min(1, vec.interests.length * 0.25) : 0.3,
    typeof vec.personality?.openness === 'number' ? vec.personality.openness : 0.5,
  ];

  const interestNames = (vec.interests || []).map((i) => i.node_name || i.node_path);
  const instantYes = interestNames.length > 0
    ? `${interestNames[0]} somewhere you've never been, then coffee that runs long`
    : undefined;

  return {
    descriptors,
    values,
    instantYes,
    usuallyYes: interestNames.length > 1 ? interestNames.slice(1) : undefined,
    convinceMe: keys.has('socially-selective') ? ['Large group meetups'] : undefined,
  };
}

// ─── Boundaries from vector ──────────────────────────────────────────

function deriveBoundaries(vec: ProfileVector): BoundaryData {
  let punctuality = 'Flexible · Context-driven';
  if (vec.personality?.conscientiousness !== undefined) {
    if (vec.personality.conscientiousness >= 0.7) punctuality = 'Punctual · Prefers on-time starts';
    else if (vec.personality.conscientiousness <= 0.3) punctuality = 'Relaxed · A few minutes late is fine';
  }

  let cancellation = 'Context matters · 24h notice preferred';
  if (vec.social_rhythm?.planning_horizon !== undefined) {
    if (vec.social_rhythm.planning_horizon >= 0.7) cancellation = 'Strong preference · 48h notice';
    else if (vec.social_rhythm.planning_horizon <= 0.3) cancellation = 'Flexible · Things happen';
  }

  let groupSize = 'Max 6 participants per table';
  if (vec.experience?.group_size_pref !== undefined) {
    if (vec.experience.group_size_pref <= 0.3) groupSize = 'Prefer 1-on-1 or small groups (2–4)';
    else if (vec.experience.group_size_pref <= 0.6) groupSize = 'Best in groups of 3–5';
    else groupSize = 'Comfortable in groups of 5–6';
  }

  const area = vec.geography?.home_area || 'Singapore';
  const locationBoundary = `Based in ${area}`;

  return { punctualityStance: punctuality, cancellationStance: cancellation, groupSizeBoundary: groupSize, locationBoundary };
}

// ─── Main synthesizer ────────────────────────────────────────────────

export function generateSelfProfile(vec: ProfileVector): SelfProfileData {
  // Step 1: Extract and compose markers
  const rawMarkers = extractMarkers(vec, vec.answers);
  const markers = composeWithinPerson(rawMarkers);
  const markerKeys = new Set(markers.map((m) => m.key));

  // Step 2: Build bloom threads
  const bloomThreads: BloomThread[] = ALL_THREADS.map((thread) => ({
    key: thread,
    label: THREAD_LABELS[thread],
    strength: getThreadStrength(thread, vec),
    confidence: getThreadConfidence(thread, vec),
    sentence: generateThreadSentence(thread, vec, markers),
  }));

  // Step 3: Build connection threads (only for threads with markers)
  const threadMarkerGroups = new Map<ThreadKey, Marker[]>();
  markers.forEach((m) => {
    const existing = threadMarkerGroups.get(m.thread) || [];
    existing.push(m);
    threadMarkerGroups.set(m.thread, existing);
  });

  const connectionThreads: ConnectionThread[] = [];
  for (const [thread, threadMarkers] of threadMarkerGroups) {
    // Skip threads with only interest/value/area markers (less meaningful for connection threads)
    if (thread === 'geography' || thread === 'lifestyle') continue;
    if (threadMarkers.every((m) => m.key.startsWith('interest-') || m.key.startsWith('value-') || m.key.startsWith('area-') || m.key.startsWith('budget-'))) continue;

    const firstMarker = threadMarkers[0];
    const descriptors = MARKER_DESCRIPTORS[firstMarker.key] || [firstMarker.key];
    const strength = getThreadStrength(thread, vec);
    const confidence = getThreadConfidence(thread, vec);

    const ct: ConnectionThread = {
      key: thread,
      name: THREAD_LABELS[thread],
      heroDescriptor: descriptors.slice(0, 3),
      strength,
      confidence,
      note: generateThreadSentence(thread, vec, markers),
      signals: threadMarkers.map((m) => ({
        key: m.key,
        label: m.key.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()),
        evidenceLevel: 'DIRECT',
      })),
    };

    // Add extra visual data where applicable
    if (thread === 'personality') {
      const ext = vec.personality?.extraversion;
      if (typeof ext === 'number') {
        const group = ext <= 0.3 ? '1:1' : ext <= 0.5 ? '3–4' : ext <= 0.7 ? '5–8' : 'Crowd';
        ct.extraVisualData = { activeGroup: group };
      }
    }
    if (thread === 'intent') {
      const depth = vec.intent?.depth;
      const ext = vec.personality?.extraversion;
      if (typeof depth === 'number') {
        const mapY = Math.max(10, Math.min(90, 100 - (depth / 4) * 80));
        const mapX = typeof ext === 'number' ? Math.max(10, Math.min(90, ext * 80 + 10)) : 40;
        ct.extraVisualData = { mapX, mapY };
      }
    }
    if (thread === 'social_rhythm' && vec.social_rhythm?.availability) {
      const avail = vec.social_rhythm.availability;
      const daySet = new Set<string>();
      const dayMap: Record<string, string> = { mon: 'M', tue: 'T', wed: 'W', thu: 'Th', fri: 'F', sat: 'S', sun: 'S2' };
      for (const slot of avail) {
        const prefix = slot.split('_')[0]?.toLowerCase();
        if (prefix && dayMap[prefix]) daySet.add(dayMap[prefix]);
      }
      ct.extraVisualData = { activeDays: Array.from(daySet) };
    }

    connectionThreads.push(ct);
  }

  // Step 4: Generate tribal read
  const tribalRead = generateTribalRead(markers, vec);

  // Step 5: Detect contradictions
  let contradiction: ContradictionData | undefined;
  for (const rule of CONTRADICTION_RULES) {
    if (markerKeys.has(rule.markers[0]) && markerKeys.has(rule.markers[1])) {
      contradiction = {
        headline: rule.headline,
        explanation: rule.explanation,
        threadsInvolved: rule.threads,
      };
      break; // Only one contradiction shown
    }
  }

  // Step 6: Generate connection notes
  const connectionNotes: ConnectionNote[] = [];
  for (const template of NOTE_TEMPLATES) {
    if (markerKeys.has(template.markerKey)) {
      connectionNotes.push({
        id: `note-${template.markerKey}`,
        hook: template.hook,
        statement: template.statement,
        explanation: template.explanation,
        whatItLooksLike: template.whatItLooksLike,
        sourceThreads: template.sourceThreads,
      });
    }
    if (connectionNotes.length >= 3) break; // Max 3 notes
  }

  // Step 7: Derive instinct
  const primaryInstinct = deriveInstinct(markers, vec);

  // Step 8: Derive outing preferences
  const outingPreferences = deriveOutingPreferences(vec, markers);

  // Step 9: Derive boundaries
  const boundaries = deriveBoundaries(vec);

  return {
    bloomThreads,
    connectionThreads,
    tribalRead,
    contradiction,
    connectionNotes,
    primaryInstinct,
    outingPreferences,
    boundaries,
  };
}
