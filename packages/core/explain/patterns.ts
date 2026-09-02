import type { Marker } from './markers.ts';
import { containsLevel5Violation } from './blocklist.ts';

export interface PatternSignature {
  bothRequire?: string[];
  eitherRequire?: string[];
  excludes?: string[];
}

export interface RelationalPattern {
  id: string;
  name: string;
  signature: PatternSignature;
  variants: Array<(nameA: string, nameB: string) => { thesis: string; manifestation: string }>;
  thesis: (nameA: string, nameB: string) => string;
  manifestation: (nameA: string, nameB: string) => string;
}

function hashPair(nameA: string, nameB: string, id: string): number {
  const sortedNames = [nameA.toLowerCase(), nameB.toLowerCase()].sort().join(':');
  const str = `${sortedNames}:${id}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 37 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export const RELATIONAL_PATTERNS: RelationalPattern[] = [
  {
    id: 'quality-over-quantity',
    name: 'Quality time over constant contact',
    signature: {
      bothRequire: ['socially-selective', 'advance-planning', 'depth-oriented'],
      excludes: ['frequent-touchpoints'],
    },
    variants: [
      (nameA, nameB) => ({
        thesis: `You both protect your social battery for high-quality, intentional meetups planned well in advance. Rather than continuous daily messaging, your connection thrives on focused 1-on-1 time where conversation goes straight past surface small talk.`,
        manifestation: `Outings feel calm and unhurried because dates are locked in early, allowing long quiet stretches between catch-ups to feel natural and pressure-free.`,
      }),
      (nameA, nameB) => ({
        thesis: `You and ${nameB} share a preference for deep, intentional catch-ups over steady messaging clutter. Connecting face-to-face in low-distraction settings brings out your best conversational flow.`,
        manifestation: `Locking in calendar dates in advance leaves weeks in between completely low-stress, with zero expectation for daily digital upkeep.`,
      }),
      (nameA, nameB) => ({
        thesis: `Your friendship rhythm focuses on meaningful quality time rather than constant online check-ins. When you and ${nameB} meet, conversations naturally reach real personal substance without rushing.`,
        manifestation: `Hangouts are deliberate and planned early, ensuring that when you catch up, both of you are fully present and unhurried.`,
      }),
      (nameA, nameB) => ({
        thesis: `Both of you value unhurried, depth-first catch-ups over high-frequency messaging. You prioritize dedicated 1-on-1 time where genuine sharing comes naturally.`,
        manifestation: `Planning catch-ups well ahead of time creates a dependable cadence that respects your individual schedules and social batteries.`,
      }),
    ],
    thesis: (nameA, nameB) => RELATIONAL_PATTERNS[0].variants[hashPair(nameA, nameB, 'quality-over-quantity') % 4](nameA, nameB).thesis,
    manifestation: (nameA, nameB) => RELATIONAL_PATTERNS[0].variants[hashPair(nameA, nameB, 'quality-over-quantity') % 4](nameA, nameB).manifestation,
  },
  {
    id: 'activity-first-chemistry',
    name: 'Activity-first chemistry',
    signature: {
      bothRequire: ['gradual-opening'],
      eitherRequire: ['activity-oriented', 'quiet-setting'],
    },
    variants: [
      (nameA, nameB) => ({
        thesis: `You both prefer building familiarity organically through shared experiences rather than high-pressure interviews. Doing an activity together gives your interactions a comfortable focus point, letting trust develop at a steady, natural pace.`,
        manifestation: `Hands-on workshops, quiet coffee walks, or active hobbies provide an easy conversational anchor where neither person feels forced to perform.`,
      }),
      (nameA, nameB) => ({
        thesis: `Familiarity between you and ${nameB} grows best around engaging shared activities. Having an active task or interest at hand takes off the pressure of forced small talk.`,
        manifestation: `Exploring neighborhood coffee walks or creative workshops offers a comfortable, shared focus that lets conversation flow effortlessly.`,
      }),
      (nameA, nameB) => ({
        thesis: `You and ${nameB} bond naturally through shared experiences and hands-on outings. Engaging in an activity creates an authentic backdrop for trust to build over time.`,
        manifestation: `Low-pressure active hangouts give you both something tangible to focus on, keeping initial meetups relaxed and enjoyable.`,
      }),
      (nameA, nameB) => ({
        thesis: `Shared hobbies and quiet activity settings anchor your connection. Rather than sit-down interrogation, doing things together lets comfort build naturally.`,
        manifestation: `Craft workshops, museum visits, or quiet nature walks offer the perfect anchor for easy, authentic interaction.`,
      }),
    ],
    thesis: (nameA, nameB) => RELATIONAL_PATTERNS[1].variants[hashPair(nameA, nameB, 'activity-first-chemistry') % 4](nameA, nameB).thesis,
    manifestation: (nameA, nameB) => RELATIONAL_PATTERNS[1].variants[hashPair(nameA, nameB, 'activity-first-chemistry') % 4](nameA, nameB).manifestation,
  },
  {
    id: 'different-worlds-shared-curiosity',
    name: 'Different worlds, shared curiosity',
    signature: {
      bothRequire: ['novelty-seeking'],
    },
    variants: [
      (nameA, nameB) => ({
        thesis: `While your specific activity preferences diverge across different domains, your mutual openness to new experiences creates a dynamic spark. Stepping into each other’s worlds becomes a source of discovery rather than mismatch.`,
        manifestation: `Outings alternate between different activity themes, giving each person the chance to introduce fresh hobbies to the other.`,
      }),
      (nameA, nameB) => ({
        thesis: `Your contrasting activity backgrounds are matched by mutual curiosity. Exploring new hobbies together turns differences into engaging shared adventures.`,
        manifestation: `Taking turns introducing favorite neighborhood spots or trying unfamiliar activities keeps catch-ups fresh and surprising.`,
      }),
      (nameA, nameB) => ({
        thesis: `You and ${nameB} bring different interest horizons paired with a strong desire to explore. Divergent hobbies become conversation starters rather than friction points.`,
        manifestation: `Alternating between your respective interests creates a balanced rhythm of discovery where both of you learn from each other.`,
      }),
      (nameA, nameB) => ({
        thesis: `A shared passion for novelty connects your distinct backgrounds. Stepping outside routine activities lets you both experience new perspectives together.`,
        manifestation: `Trying out novel cafes, workshops, or outdoor spots provides endless fresh material for your ongoing conversations.`,
      }),
    ],
    thesis: (nameA, nameB) => RELATIONAL_PATTERNS[2].variants[hashPair(nameA, nameB, 'different-worlds-shared-curiosity') % 4](nameA, nameB).thesis,
    manifestation: (nameA, nameB) => RELATIONAL_PATTERNS[2].variants[hashPair(nameA, nameB, 'different-worlds-shared-curiosity') % 4](nameA, nameB).manifestation,
  },
  {
    id: 'easy-rhythm',
    name: 'Easy rhythm & zero-pressure touchpoints',
    signature: {
      bothRequire: ['low-contact', 'async-pacer'],
    },
    variants: [
      (nameA, nameB) => ({
        thesis: `Your messaging styles align effortlessly around unhurried communication. Neither of you measures friendship strength by reply velocity or daily check-in streaks, keeping your digital touchpoints low-stress.`,
        manifestation: `Replying hours or days later carries zero social penalty, making catch-up plans easy to pick back up whenever calendars open up.`,
      }),
      (nameA, nameB) => ({
        thesis: `Digital communication between you and ${nameB} operates on a relaxed, asynchronous pace. Taking time to respond is completely understood, avoiding any feeling of messaging burden.`,
        manifestation: `Catching up after days of quiet feels entirely natural, allowing you to resume conversation right where you left off.`,
      }),
      (nameA, nameB) => ({
        thesis: `You and ${nameB} share a calm messaging tempo with zero demand for constant replies. Asynchronous touchpoints keep communication light and stress-free.`,
        manifestation: `Low-pressure messaging means that digital interactions remain enjoyable without cluttering your daily routines.`,
      }),
      (nameA, nameB) => ({
        thesis: `Unforced communication rhythms keep your connection relaxed between in-person meetups. Neither side demands fast reply times or daily check-in obligations.`,
        manifestation: `Picking up a text thread days later feels effortless, keeping your digital connection comfortable and easy-going.`,
      }),
    ],
    thesis: (nameA, nameB) => RELATIONAL_PATTERNS[3].variants[hashPair(nameA, nameB, 'easy-rhythm') % 4](nameA, nameB).thesis,
    manifestation: (nameA, nameB) => RELATIONAL_PATTERNS[3].variants[hashPair(nameA, nameB, 'easy-rhythm') % 4](nameA, nameB).manifestation,
  },
  {
    id: 'slow-burn-playful',
    name: 'Slow burn with playful energy',
    signature: {
      bothRequire: ['gradual-opening'],
      eitherRequire: ['playful', 'novelty-seeking'],
    },
    variants: [
      (nameA, nameB) => ({
        thesis: `You combine observant personal boundaries with lighthearted, exploratory energy. While neither person rushes personal vulnerability upfront, shared humor and novel outing ideas keep initial hangouts engaging.`,
        manifestation: `Light banter and exploring fresh neighborhood spots build genuine comfort over time, paving the way for deeper trust without early awkwardness.`,
      }),
      (nameA, nameB) => ({
        thesis: `A blend of thoughtful privacy and playful curiosity defines your initial connection with ${nameB}. Keeping early hangouts fun and light lets comfort grow naturally.`,
        manifestation: `Shared laughs over casual activities establish a solid foundation before diving into heavier personal topics.`,
      }),
      (nameA, nameB) => ({
        thesis: `You and ${nameB} take time to open up emotionally while enjoying playful, engaging catch-ups. Light humor keeps early interactions warm and enjoyable.`,
        manifestation: `Exploring new spots and sharing lighthearted moments creates a relaxed space where trust deepens at its own pace.`,
      }),
      (nameA, nameB) => ({
        thesis: `A gradual opening pace paired with lighthearted humor sets a comfortable tone. Respecting boundaries while sharing fun experiences builds lasting rapport.`,
        manifestation: `Low-pressure banter during casual outings makes getting acquainted smooth, enjoyable, and free of early awkwardness.`,
      }),
    ],
    thesis: (nameA, nameB) => RELATIONAL_PATTERNS[4].variants[hashPair(nameA, nameB, 'slow-burn-playful') % 4](nameA, nameB).thesis,
    manifestation: (nameA, nameB) => RELATIONAL_PATTERNS[4].variants[hashPair(nameA, nameB, 'slow-burn-playful') % 4](nameA, nameB).manifestation,
  },
  {
    id: 'high-energy-banter',
    name: 'Vibrant social energy & active banter',
    signature: {
      bothRequire: ['socially-expansive', 'frequent-touchpoints'],
    },
    variants: [
      (nameA, nameB) => ({
        thesis: `You both bring animated social energy and thrive on active, continuous communication. High-tempo message exchanges and lively group settings feel invigorating rather than draining to both of your social batteries.`,
        manifestation: `Quick daily check-ins, meme sharing, and bustling group meetups keep your momentum active between catch-ups.`,
      }),
      (nameA, nameB) => ({
        thesis: `Lively social energy and frequent touchpoints connect you and ${nameB}. Fast-paced chat exchanges and energetic outings keep momentum consistently high.`,
        manifestation: `Sharing daily updates, funny links, and group hangouts feels natural and energizing to both of your social routines.`,
      }),
      (nameA, nameB) => ({
        thesis: `High-tempo communication and vibrant group energy define your interaction style. Staying in active touch builds a lively, ongoing connection.`,
        manifestation: `Frequent text updates and spontaneous group plans keep your shared friendship active and engaging day to day.`,
      }),
      (nameA, nameB) => ({
        thesis: `Both of you draw energy from active banter and dynamic social environments. Frequent digital touchpoints feel completely natural and fun.`,
        manifestation: `Regular check-ins and energetic outings keep your communication flowing without long lulls in between.`,
      }),
    ],
    thesis: (nameA, nameB) => RELATIONAL_PATTERNS[5].variants[hashPair(nameA, nameB, 'high-energy-banter') % 4](nameA, nameB).thesis,
    manifestation: (nameA, nameB) => RELATIONAL_PATTERNS[5].variants[hashPair(nameA, nameB, 'high-energy-banter') % 4](nameA, nameB).manifestation,
  },
  {
    id: 'grounded-authenticity',
    name: 'Grounded authenticity & quiet spaces',
    signature: {
      bothRequire: ['quiet-setting', 'depth-oriented'],
    },
    variants: [
      (nameA, nameB) => ({
        thesis: `You share an appreciation for low-noise environments where authentic, unfiltered conversations take priority. Noisy venue noise or superficial party banter holds little appeal compared to direct, meaningful sharing.`,
        manifestation: `Low-key coffee spots and calm neighborhood walks provide the exact quiet backdrop needed for long, candid conversations.`,
      }),
      (nameA, nameB) => ({
        thesis: `Calm, low-distraction settings allow conversation between you and ${nameB} to focus on genuine personal topics. Quiet venues suit both of your preferences far better than crowded events.`,
        manifestation: `Peaceful neighborhood cafes or quiet park strolls set an ideal stage for meaningful, uninterrupted dialogue.`,
      }),
      (nameA, nameB) => ({
        thesis: `You and ${nameB} value authentic, grounded conversations in tranquil environments. Skipping superficial venue noise lets you focus directly on real life experiences.`,
        manifestation: `Selecting quiet meet-up locations ensures that every hangout offers a relaxed environment for sincere personal connection.`,
      }),
      (nameA, nameB) => ({
        thesis: `Quiet spaces and authentic sharing form the core of your mutual preference. Unfiltered, quiet dialogue creates rapid comfort and mutual understanding.`,
        manifestation: `Calm tea spots and peaceful walks give you both the space needed for thoughtful, high-depth conversations.`,
      }),
    ],
    thesis: (nameA, nameB) => RELATIONAL_PATTERNS[6].variants[hashPair(nameA, nameB, 'grounded-authenticity') % 4](nameA, nameB).thesis,
    manifestation: (nameA, nameB) => RELATIONAL_PATTERNS[6].variants[hashPair(nameA, nameB, 'grounded-authenticity') % 4](nameA, nameB).manifestation,
  },
  {
    id: 'structured-calendar-harmony',
    name: 'Structured calendar harmony',
    signature: {
      bothRequire: ['advance-planning', 'structured-routine'],
    },
    variants: [
      (nameA, nameB) => ({
        thesis: `Both of your schedules operate best with predictable structure and advance commitments. Setting dates weeks in advance allows both people to allocate time comfortably without last-minute calendar stress.`,
        manifestation: `Outing details, times, and locations get settled early, eliminating scheduling friction before the meetup even takes place.`,
      }),
      (nameA, nameB) => ({
        thesis: `Advance planning and organized scheduling create seamless alignment between you and ${nameB}. Confirming dates early keeps outing logistics clear and reliable.`,
        manifestation: `Locking in times and venues in advance avoids scheduling back-and-forth and respects each person's calendar boundaries.`,
      }),
      (nameA, nameB) => ({
        thesis: `You and ${nameB} share a structured approach to planning meetups. Setting expectations early ensures that hangouts are organized without hassle.`,
        manifestation: `Early confirmation of plans lets both of you look forward to meetups without unexpected last-minute adjustments.`,
      }),
      (nameA, nameB) => ({
        thesis: `Predictable planning horizons eliminate scheduling confusion. Both of you value clear, organized calendars for setting up outings.`,
        manifestation: `Settling meet-up details ahead of time makes organizing catch-ups straightforward, dependable, and efficient.`,
      }),
    ],
    thesis: (nameA, nameB) => RELATIONAL_PATTERNS[7].variants[hashPair(nameA, nameB, 'structured-calendar-harmony') % 4](nameA, nameB).thesis,
    manifestation: (nameA, nameB) => RELATIONAL_PATTERNS[7].variants[hashPair(nameA, nameB, 'structured-calendar-harmony') % 4](nameA, nameB).manifestation,
  },
  {
    id: 'spontaneous-exploration',
    name: 'Spontaneous exploration & fluid timing',
    signature: {
      bothRequire: ['spontaneous'],
    },
    variants: [
      (nameA, nameB) => ({
        thesis: `You share a flexible, near-term approach to scheduling that leaves room for impromptu invitations. Neither of you requires rigid calendar lead times, making same-day or day-before catch-ups easy to pull off.`,
        manifestation: `Spontaneous text invitations for dinner or coffee fit naturally into your fluid schedules without causing inconvenience.`,
      }),
      (nameA, nameB) => ({
        thesis: `Fluid timing and short-notice plans suit both you and ${nameB}. Impromptu invitations for food or drinks fit easily into your flexible routines.`,
        manifestation: `Same-day texts asking to catch up feel completely natural, leading to easy, unforced outings whenever free time opens up.`,
      }),
      (nameA, nameB) => ({
        thesis: `You and ${nameB} enjoy near-term, adaptable scheduling. Avoiding long calendar lead times makes hangouts feel fresh and spontaneous.`,
        manifestation: `Quick, impulse meetups after work or on weekends flow smoothly without needing weeks of advance coordination.`,
      }),
      (nameA, nameB) => ({
        thesis: `Flexible schedules and impromptu plans create a lively, unconstrained rhythm between you. Near-term planning keeps your connection agile.`,
        manifestation: `Spontaneous coffee or dinner plans fit right in, making catching up effortless whenever mutual availability pops up.`,
      }),
    ],
    thesis: (nameA, nameB) => RELATIONAL_PATTERNS[8].variants[hashPair(nameA, nameB, 'spontaneous-exploration') % 4](nameA, nameB).thesis,
    manifestation: (nameA, nameB) => RELATIONAL_PATTERNS[8].variants[hashPair(nameA, nameB, 'spontaneous-exploration') % 4](nameA, nameB).manifestation,
  },
  {
    id: 'mutual-trust-pacing',
    name: 'Paced mutual trust & thoughtful disclosure',
    signature: {
      bothRequire: ['trust-first'],
    },
    variants: [
      (nameA, nameB) => ({
        thesis: `Both of you respect emotional boundaries and prefer allowing trust to earn its place naturally over repeated meetups. Pacing personal disclosure thoughtfully ensures that neither person feels overwhelmed early on.`,
        manifestation: `Early interactions remain respectful and comfortable, deepening into true confidence as shared reliability is proven over time.`,
      }),
      (nameA, nameB) => ({
        thesis: `Thoughtful emotional pacing creates mutual comfort between you and ${nameB}. Building trust over time ensures that personal sharing feels safe and earned.`,
        manifestation: `Respecting each other's privacy upfront allows confidence to grow steadily without any pressure for premature vulnerability.`,
      }),
      (nameA, nameB) => ({
        thesis: `You and ${nameB} take a measured, respectful approach to emotional opening. Steadily proven reliability forms the firm foundation of your trust.`,
        manifestation: `Initial catch-ups focus on comfortable shared ground, paving the way for deeper confidence through consistent follow-through.`,
      }),
      (nameA, nameB) => ({
        thesis: `Paced personal disclosure protects your social boundaries while trust develops. Consistent, reliable meetups deepen your mutual rapport over time.`,
        manifestation: `Comfort and trust grow organically with every hangout, laying a durable groundwork for long-term friendship.`,
      }),
    ],
    thesis: (nameA, nameB) => RELATIONAL_PATTERNS[9].variants[hashPair(nameA, nameB, 'mutual-trust-pacing') % 4](nameA, nameB).thesis,
    manifestation: (nameA, nameB) => RELATIONAL_PATTERNS[9].variants[hashPair(nameA, nameB, 'mutual-trust-pacing') % 4](nameA, nameB).manifestation,
  },
  {
    id: 'purposeful-friendship-investment',
    name: 'Purposeful friendship investment',
    signature: {
      bothRequire: ['commitment-seeking', 'depth-oriented'],
    },
    variants: [
      (nameA, nameB) => ({
        thesis: `You enter new connections with serious intent to cultivate a durable, ongoing friendship. Neither person is looking for transient networking or casual filler, aligning your relational goals from day one.`,
        manifestation: `Meetups carry clear mutual investment, leading to consistent follow-through and long-term social connection.`,
      }),
      (nameA, nameB) => ({
        thesis: `Clear friendship intent and mutual dedication align you and ${nameB}. Investing real effort into cultivating a lasting connection is a priority for both of you.`,
        manifestation: `Catch-ups reflect sincere mutual interest, translating into reliable follow-through and meaningful social support.`,
      }),
      (nameA, nameB) => ({
        thesis: `You and ${nameB} seek intentional, enduring friendships rather than surface acquaintanceships. Shared relational commitment anchors your connection from the start.`,
        manifestation: `Consistent follow-up after meetups demonstrates genuine investment in building a lasting bond over time.`,
      }),
      (nameA, nameB) => ({
        thesis: `Purposeful investment in meaningful friendship sets a solid foundation for your connection. Both of you value long-term relational stability.`,
        manifestation: `Hangouts feel significant and well-supported, building toward a dependable, long-standing friendship.`,
      }),
    ],
    thesis: (nameA, nameB) => RELATIONAL_PATTERNS[10].variants[hashPair(nameA, nameB, 'purposeful-friendship-investment') % 4](nameA, nameB).thesis,
    manifestation: (nameA, nameB) => RELATIONAL_PATTERNS[10].variants[hashPair(nameA, nameB, 'purposeful-friendship-investment') % 4](nameA, nameB).manifestation,
  },
];

/**
 * Evaluates pattern signature against combined marker set.
 * Returns pattern if minimum signature match is met, otherwise null.
 */
export function matchRelationalPattern(
  markersA: Marker[],
  markersB: Marker[],
  nameA: string,
  nameB: string
): RelationalPattern | null {
  const setA = new Set(markersA.map((m) => m.key));
  const setB = new Set(markersB.map((m) => m.key));
  const union = new Set([...setA, ...setB]);

  let bestPattern: RelationalPattern | null = null;
  let maxScore = -1;

  for (const pattern of RELATIONAL_PATTERNS) {
    const sig = pattern.signature;

    // Check excludes
    if (sig.excludes && sig.excludes.some((k) => union.has(k))) {
      continue;
    }

    // Check bothRequire: both Person A AND Person B must have all required markers
    if (sig.bothRequire && sig.bothRequire.length > 0) {
      const passesA = sig.bothRequire.every((k) => setA.has(k));
      const passesB = sig.bothRequire.every((k) => setB.has(k));
      if (!passesA || !passesB) continue;
    }

    // Check eitherRequire: at least one marker must be present in Person A OR Person B
    if (sig.eitherRequire && sig.eitherRequire.length > 0) {
      const passesEither = sig.eitherRequire.some((k) => setA.has(k) || setB.has(k));
      if (!passesEither) continue;
    }

    // Calculate match score based on actual matched markers
    let matchedCount = 0;
    if (sig.bothRequire && sig.bothRequire.length > 0) {
      matchedCount += sig.bothRequire.length * 2;
    }
    if (sig.eitherRequire && sig.eitherRequire.length > 0) {
      matchedCount += sig.eitherRequire.filter((k) => setA.has(k) || setB.has(k)).length;
    }

    if (matchedCount > 0 && matchedCount > maxScore) {
      // Level 5 blocklist safety check on generated text
      const thesisText = pattern.thesis(nameA, nameB);
      const manifestText = pattern.manifestation(nameA, nameB);
      if (!containsLevel5Violation(thesisText) && !containsLevel5Violation(manifestText)) {
        maxScore = matchedCount;
        bestPattern = pattern;
      }
    }
  }

  return bestPattern;
}
