import type { Marker } from './markers.ts';
import type { NamedFrictionType, FrictionSeverity } from '../matching/mechanisms.ts';
import { containsLevel5Violation } from './blocklist.ts';

export interface DyadicStatement {
  id: string;
  section: 'click' | 'conversation' | 'friendship_path' | 'friction';
  level: 1 | 2 | 3 | 4; // Evidence Level
  sources: string[];    // Answer sources from Person A & B
  headline?: string;
  text: string;
  frictionType?: NamedFrictionType;
  severity?: FrictionSeverity;
}

export interface DyadicRule {
  id: string;
  section: DyadicStatement['section'];
  level: 1 | 2 | 3 | 4;
  requiredA: string[];
  requiredB: string[];
  variants: Array<(nameA: string, nameB: string) => { headline?: string; text: string }>;
  frictionType?: NamedFrictionType;
  severity?: FrictionSeverity;
}

/**
 * Deterministic hash per pairing and rule ID.
 */
export function hashPair(nameA: string, nameB: string, ruleId: string): number {
  const str = `${nameA}:${nameB}:${ruleId}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const DYADIC_RULES: DyadicRule[] = [
  // 1. PLANNING — Friction (NOTICEABLE)
  {
    id: 'dyad-planning-advance-spontaneous',
    section: 'friction',
    level: 3,
    requiredA: ['advance-planning'],
    requiredB: ['spontaneous'],
    frictionType: 'PLANNING',
    severity: 'NOTICEABLE',
    variants: [
      (_nameA, nameB) => ({
        headline: 'Different planning rhythms',
        text: `Getting the outing into the calendar may be harder than enjoying it once you're there. You like dates locked in early; ${nameB} prefers keeping plans flexible until closer to the day.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Planning horizon contrast',
        text: `You feel most relaxed with dates locked in early, whereas ${nameB} prefers leaving room for spontaneous flow.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Plan timing difference',
        text: `Plan timing will take slight alignment; you prefer advance commitments while ${nameB} thrives on flexible, near-term plans.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Scheduling horizon difference',
        text: `Locking in calendar dates early suits your rhythm, while ${nameB} prefers reserving decision making until near the event date.`,
      }),
    ],
  },
  {
    id: 'dyad-planning-spontaneous-advance',
    section: 'friction',
    level: 3,
    requiredA: ['spontaneous'],
    requiredB: ['advance-planning'],
    frictionType: 'PLANNING',
    severity: 'NOTICEABLE',
    variants: [
      (_nameA, nameB) => ({
        headline: 'Different planning rhythms',
        text: `You may prefer impromptu hangouts when free, while ${nameB} feels more relaxed when plans are locked in advance.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Spontaneous vs structured timing',
        text: `You lean toward flexible spur-of-the-moment outings, whereas ${nameB} appreciates dates settled early.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Scheduling pace variance',
        text: `Impromptu meetups appeal to your schedule, while ${nameB} operates best with advance calendar notices.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Plan timing contrast',
        text: `You feel comfortable arranging hangouts at short notice, while ${nameB} feels more structured with advance dates.`,
      }),
    ],
  },
  // 1. PLANNING — Alignment
  {
    id: 'dyad-planning-shared-advance',
    section: 'click',
    level: 3,
    requiredA: ['advance-planning'],
    requiredB: ['advance-planning'],
    variants: [
      (_nameA, _nameB) => ({
        headline: 'Shared planning rhythm',
        text: 'Both of you like locking in dates well ahead of time, making organizing catch-ups effortless.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Early calendar alignment',
        text: 'You share a preference for early planning, so calendar dates get confirmed smoothly without last-minute scrambling.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Predictable scheduling pace',
        text: 'Having outings planned weeks in advance feels comfortable to both of you.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Proactive calendar sync',
        text: 'Locking in dates well ahead of time comes naturally to both of you, making planning effortless.',
      }),
    ],
  },
  {
    id: 'dyad-planning-spontaneous-shared',
    section: 'click',
    level: 3,
    requiredA: ['spontaneous'],
    requiredB: ['spontaneous'],
    variants: [
      (_nameA, _nameB) => ({
        headline: 'Fluid spontaneous rhythm',
        text: 'Both of you enjoy impromptu, same-day hangouts, keeping plans fluid and low-friction.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Flexible outing style',
        text: 'You share a flexible, spontaneous approach to outings, making last-minute catch-ups easy.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Unstructured schedule ease',
        text: 'Neither of you requires weeks of advance notice, so spontaneous invitations feel natural.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Near-term hangout ease',
        text: 'Spontaneous invitations and quick same-day check-ins work easily for both of your schedules.',
      }),
    ],
  },

  // 2. CONTACT — Friction (NOTICEABLE)
  {
    id: 'dyad-contact-frequent-low',
    section: 'friction',
    level: 3,
    requiredA: ['frequent-touchpoints'],
    requiredB: ['low-contact'],
    frictionType: 'CONTACT',
    severity: 'NOTICEABLE',
    variants: [
      (_nameA, nameB) => ({
        headline: 'Asymmetric message frequency',
        text: `You could read their quiet periods as low effort; ${nameB} simply finds messaging less central between meetups.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Messaging touchpoint gap',
        text: `You tend to maintain active daily check-ins, while ${nameB} saves enthusiasm for in-person catch-ups.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Contact cadence variance',
        text: `Messaging frequency varies between you; ${nameB} prefers lower touchpoint frequency while you enjoy steady banter.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Messaging expectations difference',
        text: `You keep in touch continuously between meetups, whereas ${nameB} focuses energy on face-to-face time.`,
      }),
    ],
  },
  // 2. CONTACT — Alignment
  {
    id: 'dyad-quiet-week-alignment',
    section: 'click',
    level: 4,
    requiredA: ['low-contact'],
    requiredB: ['low-contact'],
    variants: [
      (_nameA, _nameB) => ({
        headline: 'Low-pressure social pace',
        text: 'Neither of you will read a quiet week as rejection.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Unforced messaging rhythm',
        text: 'Both of you appreciate a low-maintenance contact pace where long gaps between catch-ups feel natural.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Zero-pressure contact style',
        text: 'Your messaging expectations match easily; quiet stretches between meetups carry zero social pressure.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Low-touchpoint comfort',
        text: 'Neither of you feels anxious when messaging stays quiet for a few days between outings.',
      }),
    ],
  },
  {
    id: 'dyad-contact-shared-frequent',
    section: 'click',
    level: 3,
    requiredA: ['frequent-touchpoints'],
    requiredB: ['frequent-touchpoints'],
    variants: [
      (_nameA, _nameB) => ({
        headline: 'Active touchpoint alignment',
        text: 'You both enjoy regular touchpoints between meetups to keep conversational momentum alive.',
      }),
      (_nameA, _nameB) => ({
        headline: 'High messaging engagement',
        text: 'Daily check-ins and meme shares come naturally to both of you.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Vibrant contact cadence',
        text: 'Your active messaging style keeps your connection vibrant between outings.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Shared messaging momentum',
        text: 'Frequent check-ins and shared banter keep your connection active between face-to-face meetups.',
      }),
    ],
  },

  // 3. TEMPO — Friction (NEGOTIABLE)
  {
    id: 'dyad-tempo-rapid-async',
    section: 'friction',
    level: 3,
    requiredA: ['rapid-responder'],
    requiredB: ['async-pacer'],
    frictionType: 'TEMPO',
    severity: 'NEGOTIABLE',
    variants: [
      (_nameA, nameB) => ({
        headline: 'Differing reply pacing',
        text: `You tend to reply in real time when free, whereas ${nameB} batch-processes messages when downtime allows.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Response speed contrast',
        text: `Response speeds differ slightly; you reply rapidly while ${nameB} answers in calm batches.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Asynchronous pacing difference',
        text: `You prefer brisk back-and-forth chat, while ${nameB} takes time before replying without it signifying disinterest.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Reply rhythm variance',
        text: `You reply promptly when free, while ${nameB} takes time to formulate thoughtful replies in batches.`,
      }),
    ],
  },
  // 3. TEMPO — Alignment
  {
    id: 'dyad-tempo-shared-async',
    section: 'click',
    level: 3,
    requiredA: ['async-pacer'],
    requiredB: ['async-pacer'],
    variants: [
      (_nameA, _nameB) => ({
        headline: 'Easy-going response pace',
        text: 'Neither of you expects instant replies, keeping messaging low-stress.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Unhurried reply style',
        text: 'You both process messages on your own timeline, keeping communication relaxed.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Low-stress response speed',
        text: 'Your shared asynchronous reply style eliminates any pressure to respond immediately.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Calm message timing',
        text: 'Taking hours or days to reply feels completely normal to both of you.',
      }),
    ],
  },

  // 4. ENERGY — Friction (NOTICEABLE)
  {
    id: 'dyad-energy-expansive-selective',
    section: 'friction',
    level: 3,
    requiredA: ['socially-expansive'],
    requiredB: ['socially-selective'],
    frictionType: 'ENERGY',
    severity: 'NOTICEABLE',
    variants: [
      (_nameA, nameB) => ({
        headline: 'Social battery contrast',
        text: `You draw energy from lively group environments, while ${nameB} recharges in smaller, quieter catch-ups.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Group environment preference',
        text: `Group battery preferences differ; you feel energized by large groups, while ${nameB} prefers intimate settings.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Social energy dynamics',
        text: `Your social battery thrives in bustling settings, whereas ${nameB} values quiet, selective social circles.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Social setting balance',
        text: `You feel invigorated in larger group settings, while ${nameB} gains energy from small, quiet groups.`,
      }),
    ],
  },
  // 4. ENERGY — Alignment
  {
    id: 'dyad-energy-shared-selective',
    section: 'click',
    level: 3,
    requiredA: ['socially-selective'],
    requiredB: ['socially-selective'],
    variants: [
      (_nameA, _nameB) => ({
        headline: 'Grounded social energy',
        text: 'You both protect your social battery for high-quality, intimate meetups.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Intimate social battery',
        text: 'Smaller, meaningful catch-ups suit both of your social batteries best.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Quiet atmosphere preference',
        text: 'You share a preference for quiet, selective social spaces over crowded noise.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Selective social battery',
        text: 'Both of your social batteries are tailored for calm, intentional conversations rather than noisy events.',
      }),
    ],
  },

  // 5. DEPTH — Friction (STRUCTURAL)
  {
    id: 'dyad-depth-oriented-casual',
    section: 'friction',
    level: 3,
    requiredA: ['depth-oriented'],
    requiredB: ['casual-vibe'],
    frictionType: 'DEPTH',
    severity: 'STRUCTURAL',
    variants: [
      (_nameA, nameB) => ({
        headline: 'Divergent depth expectations',
        text: `You look for deep personal sharing early, while ${nameB} prefers keeping initial hangouts light and low-pressure.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Intent depth contrast',
        text: `Friendship intent styles contrast; you seek deep connection quickly, whereas ${nameB} prefers casual exploration.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Sharing expectation gap',
        text: `You value vulnerability upfront, while ${nameB} unfolds more gradually through casual hangouts.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Connection depth pace',
        text: `You seek personal vulnerability upfront, whereas ${nameB} prefers building familiarity through light activity first.`,
      }),
    ],
  },
  // 5. DEPTH — Alignment
  {
    id: 'dyad-depth-shared-meaningful',
    section: 'click',
    level: 3,
    requiredA: ['depth-oriented'],
    requiredB: ['depth-oriented'],
    variants: [
      (_nameA, _nameB) => ({
        headline: 'Shared depth expectation',
        text: 'Both of you value meaningful, authentic conversation over surface-level small talk.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Genuine connection goal',
        text: 'You share a desire for genuine depth, making deep personal topics feel natural early on.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Authentic communication focus',
        text: 'Connecting on real life experiences and personal values is important to both of you.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Depth-first connection',
        text: 'Skipping superficial small talk in favor of real life experiences comes naturally to both of you.',
      }),
    ],
  },

  // 6. INITIATION — Alignment / Complementarity
  {
    id: 'dyad-initiation-balance',
    section: 'click',
    level: 3,
    requiredA: ['proactive-initiator'],
    requiredB: ['responsive-joiner'],
    variants: [
      (_nameA, nameB) => ({
        headline: 'Natural initiation balance',
        text: `You naturally take charge of organizing outings, and ${nameB} gladly responds and follows through on invited plans.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Complementary planning roles',
        text: `Your initiation styles complement each other: you enjoy setting up plans, and ${nameB} loves joining in.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Smooth organizer-joiner fit',
        text: `Organizing hangouts flows smoothly because you take initiative and ${nameB} follows through reliably.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Initiator and attendee fit',
        text: `You bring proactive organizing energy, and ${nameB} brings reliable, enthusiastic attendance.`,
      }),
    ],
  },
  // 6. INITIATION — Friction (NEGOTIABLE)
  {
    id: 'dyad-initiation-dual-responsive',
    section: 'friction',
    level: 3,
    requiredA: ['responsive-joiner'],
    requiredB: ['responsive-joiner'],
    frictionType: 'INITIATION',
    severity: 'NEGOTIABLE',
    variants: [
      (_nameA, nameB) => ({
        headline: 'Dual invitation hesitation',
        text: `Both of you tend to wait for invitations, so setting a first date might require one of you to take the first step.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Shared initiation hesitation',
        text: `Since you both lean toward joining rather than initiating, making the first plan may take a gentle push.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Passive scheduling barrier',
        text: `You both prefer responding to invitations, so someone taking the initiative will unlock great meetups.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Shared invite waiting',
        text: `Both of you tend to wait for others to extend plans, so taking the initiative will be key to meeting up.`,
      }),
    ],
  },

  // 7. SETTING — Friction (NEGOTIABLE)
  {
    id: 'dyad-setting-quiet-active',
    section: 'friction',
    level: 3,
    requiredA: ['quiet-setting'],
    requiredB: ['active-setting'],
    frictionType: 'SETTING',
    severity: 'NEGOTIABLE',
    variants: [
      (_nameA, nameB) => ({
        headline: 'Environment preference contrast',
        text: `You prefer cozy, low-noise venues, whereas ${nameB} feels energized in bustling, active settings.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Venue ambience gap',
        text: `Venue preferences contrast slightly; low-key cafes suit you best, while ${nameB} likes lively spots.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Outing noise tolerance difference',
        text: `Choosing an outing setting will take balance between calm quiet spots and high-activity venues.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Noise level preference',
        text: `Quiet coffee spots suit your listening style, while ${nameB} enjoys vibrant, bustling locations.`,
      }),
    ],
  },
  // 7. SETTING — Alignment
  {
    id: 'dyad-setting-shared-quiet',
    section: 'click',
    level: 3,
    requiredA: ['quiet-setting'],
    requiredB: ['quiet-setting'],
    variants: [
      (_nameA, _nameB) => ({
        headline: 'Quiet venue alignment',
        text: 'You both enjoy calm, comfortable spaces where conversation takes center stage.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Cozy atmosphere fit',
        text: 'Cozy, low-noise venues provide the ideal backdrop for both of your catch-ups.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Low-noise setting preference',
        text: 'Quiet atmospheres allow both of you to talk comfortably without competing against background noise.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Calm space alignment',
        text: 'Low-key, comfortable venues provide the exact setting both of you prefer for conversation.',
      }),
    ],
  },

  // 8. EXPECTATION — Friction (STRUCTURAL)
  {
    id: 'dyad-expectation-commitment-casual',
    section: 'friction',
    level: 3,
    requiredA: ['commitment-seeking'],
    requiredB: ['casual-vibe'],
    frictionType: 'EXPECTATION',
    severity: 'STRUCTURAL',
    variants: [
      (_nameA, nameB) => ({
        headline: 'Friendship commitment gap',
        text: `You seek regular, long-term friendship bonds, whereas ${nameB} approaches new connections with casual openness.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Relational goal contrast',
        text: `Friendship goals differ; you look for durable ongoing connection, while ${nameB} keeps expectations relaxed.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Investment horizon variance',
        text: `Investment expectations vary slightly: you value long-term commitment, while ${nameB} starts with casual meetups.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Friendship priority gap',
        text: `You seek dedicated friendship commitment, whereas ${nameB} keeps plans open and low-expectation.`,
      }),
    ],
  },
  // 8. EXPECTATION — Alignment
  {
    id: 'dyad-expectation-shared-commitment',
    section: 'click',
    level: 3,
    requiredA: ['commitment-seeking'],
    requiredB: ['commitment-seeking'],
    variants: [
      (_nameA, _nameB) => ({
        headline: 'Shared friendship intention',
        text: 'You are both looking to invest time into building a durable, regular friendship.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Mutual commitment focus',
        text: 'Long-term friendship investment matters to both of you, creating strong mutual intent.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Aligned friendship goals',
        text: 'Building a genuine, ongoing social connection is a shared goal for both of you.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Durable friendship focus',
        text: 'Investing effort into a meaningful, long-term social bond is a shared priority.',
      }),
    ],
  },

  // 9. RECIPROCITY — Friction (NEGOTIABLE)
  {
    id: 'dyad-reciprocity-high-informal',
    section: 'friction',
    level: 3,
    requiredA: ['vulnerable-sharer'],
    requiredB: ['emotionally-private'],
    frictionType: 'RECIPROCITY',
    severity: 'NEGOTIABLE',
    variants: [
      (_nameA, nameB) => ({
        headline: 'Sharing balance contrast',
        text: `You open up early, while ${nameB} takes more time to build trust before sharing personal experiences.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Emotional disclosure pace',
        text: `Emotional opening pace differs; you share comfortably early on, while ${nameB} prefers gradual trust building.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Vulnerability timing difference',
        text: `You express feelings openly, whereas ${nameB} observes quietly before revealing personal details.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Trust building speed',
        text: `You share personal insights early on, while ${nameB} observes quietly until trust is established.`,
      }),
    ],
  },
  // 9. RECIPROCITY — Alignment
  {
    id: 'dyad-reciprocity-shared-trust',
    section: 'conversation',
    level: 3,
    requiredA: ['trust-first'],
    requiredB: ['trust-first'],
    variants: [
      (_nameA, _nameB) => ({
        headline: 'Paced mutual trust',
        text: 'Neither of you rushes emotional intimacy, allowing trust to develop naturally over time.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Observant trust pace',
        text: 'You both build trust through steady observation, keeping early hangouts comfortable and unforced.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Thoughtful vulnerability timing',
        text: 'Pacing emotional closeness thoughtfully feels right to both of you.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Gradual trust development',
        text: 'Allowing trust to deepen organically over time feels right to both of you.',
      }),
    ],
  },

  // 10. NOVELTY — Friction (NEGOTIABLE)
  {
    id: 'dyad-novelty-seeking-familiarity',
    section: 'friction',
    level: 3,
    requiredA: ['novelty-seeking'],
    requiredB: ['familiarity-comfort'],
    frictionType: 'NOVELTY',
    severity: 'NEGOTIABLE',
    variants: [
      (_nameA, nameB) => ({
        headline: 'Novelty preference difference',
        text: `You enjoy exploring new places and activities, whereas ${nameB} finds comfort in familiar spots.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Exploration vs comfort gap',
        text: `Outing exploration styles contrast; you love discovering fresh venues, while ${nameB} likes reliable favorites.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Venue novelty preference',
        text: `Balancing new experience discovery with comfortable go-to spots will keep your outings fun for both.`,
      }),
      (_nameA, nameB) => ({
        headline: 'Outing novelty contrast',
        text: `You seek novel venues and fresh activities, while ${nameB} enjoys returning to reliable favorites.`,
      }),
    ],
  },
  // 10. NOVELTY — Alignment
  {
    id: 'dyad-novelty-shared-explorers',
    section: 'friendship_path',
    level: 3,
    requiredA: ['novelty-seeking'],
    requiredB: ['novelty-seeking'],
    variants: [
      (_nameA, _nameB) => ({
        headline: 'Shared exploratory spirit',
        text: 'Both of you love trying new venues and outing ideas, keeping meetups fresh.',
      }),
      (_nameA, _nameB) => ({
        headline: 'High curiosity for fresh spots',
        text: 'Exploring unfamiliar spots and unique activities appeals to both of your adventurous sides.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Adventurous outing orientation',
        text: 'Your shared curiosity for new experiences means outing ideas will never feel repetitive.',
      }),
      (_nameA, _nameB) => ({
        headline: 'Exploratory outing mindset',
        text: 'Trying new neighborhood spots and creative activity themes appeals equally to both of you.',
      }),
    ],
  },
];

/**
 * Layer 3 — Dyadic composition.
 */
export function composeDyad(
  markersA: Marker[],
  markersB: Marker[],
  nameA: string,
  nameB: string
): DyadicStatement[] {
  if (!markersA || !markersB || markersA.length === 0 || markersB.length === 0) {
    return [];
  }

  const setA = new Set(markersA.map((m) => m.key));
  const setB = new Set(markersB.map((m) => m.key));
  const statements: DyadicStatement[] = [];

  for (const rule of DYADIC_RULES) {
    const hasAllA = rule.requiredA.every((k) => setA.has(k));
    const hasAllB = rule.requiredB.every((k) => setB.has(k));

    if (hasAllA && hasAllB) {
      const matchA = markersA.filter((m) => rule.requiredA.includes(m.key));
      const matchB = markersB.filter((m) => rule.requiredB.includes(m.key));

      const sourcesA = matchA.map((m) => m.source);
      const sourcesB = matchB.map((m) => m.source);
      const allSources = Array.from(new Set([...sourcesA, ...sourcesB]));

      const variantIdx = hashPair(nameA, nameB, rule.id) % rule.variants.length;
      const generated = rule.variants[variantIdx](nameA, nameB);

      if (containsLevel5Violation(generated.text) || (generated.headline && containsLevel5Violation(generated.headline))) {
        continue;
      }

      statements.push({
        id: rule.id,
        section: rule.section,
        level: rule.level,
        sources: allSources,
        headline: generated.headline,
        text: generated.text,
        frictionType: rule.frictionType,
        severity: rule.severity,
      });
    }
  }

  // Dynamic Shared Interest Rules
  const interestsA = markersA.filter((m) => m.key.startsWith('interest-'));
  const interestsB = markersB.filter((m) => m.key.startsWith('interest-'));

  for (const intA of interestsA) {
    const matchingB = interestsB.find((intB) => intB.key === intA.key);
    if (matchingB) {
      const interestName = intA.key.replace('interest-', '').replace(/-/g, ' ');

      const interestVariants = [
        `You both share a passion for ${interestName}. Meeting around a shared activity gives your connection an easy starting point.`,
        `Having a mutual interest in ${interestName} gives your first meetup a natural focus topic.`,
        `Your shared curiosity for ${interestName} provides an instant anchor for outing ideas.`,
        `Enjoying ${interestName} together provides a comfortable, interactive setting for your initial outing.`,
      ];
      const idx = hashPair(nameA, nameB, `interest-${intA.key}`) % interestVariants.length;
      const text = interestVariants[idx];

      if (!containsLevel5Violation(text)) {
        statements.push({
          id: `shared-interest-${intA.key}`,
          section: 'friendship_path',
          level: 3,
          sources: [intA.source, matchingB.source],
          headline: `Shared interest in ${interestName}`,
          text,
        });
      }
    }
  }

  // COMPLEMENTARY Interest Divergence when both are novelty-open
  const isNoveltyA = setA.has('novelty-seeking');
  const isNoveltyB = setB.has('novelty-seeking');

  if (isNoveltyA && isNoveltyB && interestsA.length > 0 && interestsB.length > 0) {
    const sharedKeys = interestsA.filter(ia => interestsB.some(ib => ib.key === ia.key));
    if (sharedKeys.length < Math.max(interestsA.length, interestsB.length)) {
      const compText = "Your wider interests diverge, so after the obvious shared activities one of you may need to step into the other's world. Given you're both open to trying things, that may just as easily become the interesting part.";
      if (!containsLevel5Violation(compText)) {
        statements.push({
          id: 'dyad-interest-divergence-novelty',
          section: 'friendship_path',
          level: 3,
          sources: ['interests.divergence'],
          headline: 'Complementary activity horizons',
          text: compText,
          severity: 'COMPLEMENTARY',
        });
      }
    }
  }

  return statements;
}
