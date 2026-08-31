import type { ProfileVector } from '../domain/types.ts';

export const DEMO_INTEREST_TREE = [
  { id: 1, parent_id: null, name: 'Art & Design', path: 'art' },
  { id: 2, parent_id: 1, name: 'Contemporary Art', path: 'art.contemporary' },
  { id: 3, parent_id: 2, name: 'Installation Art', path: 'art.contemporary.installation' },
  { id: 4, parent_id: 3, name: 'teamLab Exhibits', path: 'art.contemporary.installation.teamlab' },
  { id: 5, parent_id: 1, name: 'Pottery & Ceramics', path: 'art.pottery' },
  { id: 6, parent_id: null, name: 'Food & Dining', path: 'food' },
  { id: 7, parent_id: 6, name: 'Specialty Coffee', path: 'food.coffee' },
  { id: 8, parent_id: 6, name: 'Hawker Exploration', path: 'food.hawker' },
  { id: 9, parent_id: 6, name: 'Natural Wine', path: 'food.natural_wine' },
  { id: 10, parent_id: null, name: 'Outdoors & Movement', path: 'outdoors' },
  { id: 11, parent_id: 10, name: 'Trail Running', path: 'outdoors.running' },
  { id: 12, parent_id: 10, name: 'Bouldering', path: 'outdoors.bouldering' },
  { id: 13, parent_id: 10, name: 'Cycling (East Coast)', path: 'outdoors.cycling' },
  { id: 14, parent_id: null, name: 'Books & Ideas', path: 'books' },
  { id: 15, parent_id: 14, name: 'Philosophy', path: 'books.philosophy' },
  { id: 16, parent_id: 14, name: 'Fiction Book Clubs', path: 'books.fiction' },
  { id: 17, parent_id: null, name: 'Making & Craft', path: 'making' },
  { id: 18, parent_id: 17, name: 'Woodworking', path: 'making.woodworking' },
  { id: 19, parent_id: 17, name: 'Analog Photography', path: 'making.film_photo' },
];

export type DemoGender = 'female' | 'male';

export const DEMO_NAMES: { name: string; gender: DemoGender; note?: string }[] = [
  { name: 'Priya Sharma', gender: 'female' },
  { name: 'Marcus Tan', gender: 'male' },
  { name: 'Maya Lin', gender: 'female' },
  { name: 'Chen Wei', gender: 'male', note: 'Unisex name; designated male for demo profile balance' },
  { name: 'Aisha Khan', gender: 'female' },
  { name: 'Julian Koh', gender: 'male' },
  { name: 'Sarah Lim', gender: 'female' },
  { name: 'David Leong', gender: 'male' },
  { name: 'Hannah Wong', gender: 'female' },
  { name: 'Gabriel Teo', gender: 'male' },
  { name: 'Chloe Das', gender: 'female' },
  { name: 'Samuel Nair', gender: 'male' },
  { name: 'Rachel Kwek', gender: 'female' },
  { name: 'Lucas Yeo', gender: 'male' },
  { name: 'Fiona Chia', gender: 'female' },
  { name: 'Benjamin Roy', gender: 'male' },
  { name: 'Nadia Hassan', gender: 'female' },
  { name: 'Timothy Goh', gender: 'male' },
  { name: 'Grace Sim', gender: 'female' },
  { name: 'Daniel Fernandez', gender: 'male' },
  { name: 'Evelyn Tay', gender: 'female' },
  { name: 'Aaron Balakrishnan', gender: 'male' },
  { name: 'Jessica Low', gender: 'female' },
  { name: 'Isaac Seah', gender: 'male' },
  { name: 'Zoe Mendonca', gender: 'female' },
  { name: 'Ryan Fong', gender: 'male' },
  { name: 'Claire Vance', gender: 'female' },
  { name: 'Jonathan Soo', gender: 'male' },
  { name: 'Valerie Ong', gender: 'female' },
  { name: 'Kevin Ho', gender: 'male' },
  { name: 'Megan Alwi', gender: 'female' },
  { name: 'Justin Krishnan', gender: 'male' },
  { name: 'Tanya Varma', gender: 'female' },
  { name: 'Nicholas Heng', gender: 'male' },
  { name: 'Samantha Chen', gender: 'female' },
  { name: 'Brandon Sng', gender: 'male' },
  { name: 'Amara Patel', gender: 'female' },
  { name: 'Victor Liew', gender: 'male' },
  { name: 'Vanessa Siew', gender: 'female' },
  { name: 'Sean Pereira', gender: 'male' },
];

export const FEMALE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80',
];

export const MALE_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492446845049-9c50cc313f00?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=800&auto=format&fit=crop&q=80',
];

export const DIRECT_GENDER_AVATAR_MAP: Record<string, string> = {
  'Priya Sharma': FEMALE_AVATARS[0],
  'Maya Lin': FEMALE_AVATARS[1],
  'Aisha Khan': FEMALE_AVATARS[2],
  'Sarah Lim': FEMALE_AVATARS[3],
  'Hannah Wong': FEMALE_AVATARS[4],
  'Chloe Das': FEMALE_AVATARS[5],
  'Rachel Kwek': FEMALE_AVATARS[6],
  'Fiona Chia': FEMALE_AVATARS[7],
  'Nadia Hassan': FEMALE_AVATARS[8],
  'Grace Sim': FEMALE_AVATARS[9],
  'Evelyn Tay': FEMALE_AVATARS[0],
  'Jessica Low': FEMALE_AVATARS[1],
  'Zoe Mendonca': FEMALE_AVATARS[2],
  'Claire Vance': FEMALE_AVATARS[3],
  'Valerie Ong': FEMALE_AVATARS[4],
  'Megan Alwi': FEMALE_AVATARS[5],
  'Tanya Varma': FEMALE_AVATARS[6],
  'Samantha Chen': FEMALE_AVATARS[7],
  'Amara Patel': FEMALE_AVATARS[8],
  'Vanessa Siew': FEMALE_AVATARS[9],

  'Marcus Tan': MALE_AVATARS[0],
  'Chen Wei': MALE_AVATARS[1],
  'Julian Koh': MALE_AVATARS[2],
  'David Leong': MALE_AVATARS[3],
  'Gabriel Teo': MALE_AVATARS[4],
  'Samuel Nair': MALE_AVATARS[5],
  'Lucas Yeo': MALE_AVATARS[6],
  'Benjamin Roy': MALE_AVATARS[7],
  'Timothy Goh': MALE_AVATARS[8],
  'Daniel Fernandez': MALE_AVATARS[9],
  'Aaron Balakrishnan': MALE_AVATARS[0],
  'Isaac Seah': MALE_AVATARS[1],
  'Ryan Fong': MALE_AVATARS[2],
  'Jonathan Soo': MALE_AVATARS[3],
  'Kevin Ho': MALE_AVATARS[4],
  'Justin Krishnan': MALE_AVATARS[5],
  'Nicholas Heng': MALE_AVATARS[6],
  'Brandon Sng': MALE_AVATARS[7],
  'Victor Liew': MALE_AVATARS[8],
  'Sean Pereira': MALE_AVATARS[9],
};

export function getGenderAvatarForName(name: string): string {
  if (DIRECT_GENDER_AVATAR_MAP[name]) {
    return DIRECT_GENDER_AVATAR_MAP[name];
  }
  const entry = DEMO_NAMES.find(n => n.name === name);
  if (entry) {
    return entry.gender === 'female' ? FEMALE_AVATARS[0] : MALE_AVATARS[0];
  }
  const isFemaleName = /^(priya|maya|aisha|sarah|hannah|chloe|rachel|fiona|nadia|grace|evelyn|jessica|zoe|claire|valerie|megan|tanya|samantha|amara|vanessa)/i.test(name);
  return isFemaleName ? FEMALE_AVATARS[0] : MALE_AVATARS[0];
}

const DEMO_BIOS = [
  "Design researcher in Tiong Bahru. Big fan of early morning filter coffee, print typography, and slow Saturday pottery sessions.",
  "Software engineer in Katong. When I am not debugging code, I am either trail running at MacRitchie or trying new sourdough bakeries.",
  "Architect based in Holland Village. Passionate about urban sketching, Scandinavian furniture, and coastal cycling.",
  "Financial analyst in Jurong East. Marathon runner, quiet reader, and weekend specialty coffee explorer. I value punctuality and honest conversations.",
  "Product manager in Serangoon. I love hosting cozy dinner parties, indie film screenings, and collecting vinyl records.",
  "Brand strategist in Bukit Timah. Big on bouldering, specialty tea, and analog photography. Prefer intimate catch-ups.",
  "Clinical psychologist living in Bishan. Plants lover, matcha enthusiast, and weekend hiker. I appreciate authentic vulnerability.",
  "Data scientist in Woodlands. Avid chess player, mechanical keyboard builder, and lover of nocturnal hawker food runs.",
  "Content creator based in Bedok. Passionate about sustainable fashion, ceramics, and cat cafes. Love spontaneous coffee dates.",
  "UX designer living in Clementi. Big into acoustic guitar, specialty filter coffee, and indie bookshops.",
  "Biomedical researcher in Tampines. Hiker, amateur baker, and sci-fi reader. Prefer planning outings a few days ahead.",
  "Legal counsel based in Punggol. Outdoor enthusiast who loves kayaking, urban photography, and craft beer.",
  "Illustrator living in Tiong Bahru. Lover of zines, retro arcade games, and botanical gardens. Looking for creative souls.",
  "Supply chain manager in Jurong East. Weekend cyclist, espresso enthusiast, and badminton player. Prefer low-drama friendships.",
  "Copywriter in Katong. Big on thrift shopping, Japanese literature, and natural wine. Enjoy spontaneous coffee walks.",
  "Civil engineer in Serangoon. Passionate about road biking, filter roast coffee, and historical documentaries.",
  "Marketing lead living in Holland Village. Loves pottery throwing, rooftop sunsets, and discovering hidden gem cafes.",
  "Cybersecurity specialist in Bishan. Mechanical watch enthusiast, bouldering regular, and espresso lover.",
  "Secondary school teacher in Bedok. Loves watercolor painting, choir singing, and quiet Sunday coffee mornings.",
  "Operations manager in Woodlands. Passionate about soccer, barbecues, and road trips. Value loyalty and humor.",
  "Interior designer in Bukit Timah. Big fan of mid-century art, flower arranging, and French cinema.",
  "Fintech developer in Clementi. Board game enthusiast, specialty coffee brewer, and trail walker.",
  "HR manager living in Tampines. Loves Pilates, sourdough baking, and cozy book clubs. Looking for authentic connections.",
  "Robotics engineer in Punggol. Astronomy buff, drone photographer, and coffee tinkerer. Value curiosity and calm catch-ups.",
  "Event producer in Tiong Bahru. Passionate about live jazz, flea markets, and street food. Looking for spontaneous adventures.",
  "Investment manager in Holland Village. Tennis player, wine enthusiast, and avid reader of history.",
  "UX researcher in Katong. Lover of ceramic art, sourdough toast, and ambient music. Seeking a close-knit circle.",
  "Hardware engineer in Jurong East. Bouldering enthusiast, retro console collector, and filter coffee brewed at home.",
  "Fashion buyer living in Serangoon. Passionate about vintage textiles, popup markets, and matcha lattes.",
  "Account executive in Bishan. Gym enthusiast, specialty coffee drinker, and fan of indie rock concerts.",
  "Environmental scientist in Bedok. Passionate about composting, urban farming, and kayaking.",
  "Consultant based in Clementi. Loves squash, craft lagers, and podcasts on economics. Appreciate direct communication.",
  "Journalist living in Bukit Timah. Loves long walks, long-form essays, and specialty tea houses.",
  "Architectural renderer in Tampines. Big on digital painting, espresso shots, and long night walks.",
  "Pastry chef in Tiong Bahru. Lover of dessert plating, French bakeries, and cozy cafes.",
  "Software architect in Punggol. Gadget reviewer, mechanical keyboard fan, and runner. Prefer clear plans.",
  "Nonprofit coordinator in Holland Village. Passionate about community organizing, pottery, and yoga.",
  "Risk analyst in Woodlands. Loves swimming, classic rock, and brewing pour-over coffee.",
  "Art curator in Katong. Big on contemporary art, gallery openings, and quiet wine bars.",
  "Sound engineer in Serangoon. Music collector, analog synthesizer enthusiast, and coffee walker."
];

export const DEMO_AREAS = [
  'Tiong Bahru',
  'Katong',
  'Holland Village',
  'Jurong East',
  'Serangoon',
  'Bukit Timah',
  'Bishan',
  'Woodlands',
  'Bedok',
  'Clementi',
  'Tampines',
  'Punggol'
];

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let femaleAvatarCounter = 0;
let maleAvatarCounter = 0;

/** Deterministic demo candidates for pre-backend development. NOT real users. */
export const DEMO_PROFILES: ProfileVector[] = DEMO_NAMES.map((entry, idx) => {
  const num = idx + 1;
  const id = `00000000-0000-0000-0000-${num.toString().padStart(12, '0')}`;
  const rng = mulberry32(1001 + idx * 83);

  const name = entry.name;
  const isFemale = entry.gender === 'female';
  const avatar = isFemale
    ? FEMALE_AVATARS[femaleAvatarCounter++ % FEMALE_AVATARS.length]
    : MALE_AVATARS[maleAvatarCounter++ % MALE_AVATARS.length];

  const area = DEMO_AREAS[idx % DEMO_AREAS.length];
  const handle = name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 18) + `_${num}`;
  const bio = DEMO_BIOS[idx % DEMO_BIOS.length];

  // Generate trait values using seeded PRNG for wide natural human variance
  const openness = 0.2 + rng() * 0.75;
  const conscientiousness = 0.2 + rng() * 0.75;
  const extraversion = 0.15 + rng() * 0.8;
  const agreeableness = 0.3 + rng() * 0.65;
  const emotional_stability = 0.3 + rng() * 0.65;
  const serious_playful = 0.2 + rng() * 0.75;
  const intensity_easygoing = 0.2 + rng() * 0.75;
  const assertive_accommodating = 0.25 + rng() * 0.7;
  const novelty_seeking = 0.2 + rng() * 0.75;
  const intellectual_curiosity = 0.25 + rng() * 0.7;

  // Communication & Response Speed
  const contact_frequency_self = (idx % 3) * 0.35 + 0.2;
  const contact_frequency_expect = (idx % 3) * 0.35 + 0.2;
  const response_speed_self = (idx % 4) * 0.25 + 0.15;
  const response_speed_expect = (idx % 4) * 0.25 + 0.15;
  const initiation_self = 0.2 + rng() * 0.75;
  const initiation_expect = 0.2 + rng() * 0.75;
  const message_length = 0.2 + rng() * 0.75;
  const direct_diplomatic = 0.2 + rng() * 0.75;
  const high_context_literal = 0.2 + rng() * 0.75;

  // Planning horizon & availability — all profiles share 'sat_midday' so availability gate passes
  const planning_horizon = (idx % 4) * 0.25 + 0.15;
  const fri_night = (idx % 2) === 0;
  const sat_night = (idx % 3) === 0;
  const availability = ['sat_midday', (idx % 2 === 0 ? 'sun_midday' : 'fri_evening')];

  // Vary depth across 0..3
  const depthVal = (idx % 3) as 0 | 1 | 2 | 3 | 4;
  const budgetBandVal = (idx % 4) as 0 | 1 | 2 | 3 | 4;

  // 4 Shared Interest Nodes across ALL demo candidates to ensure high interest resonance
  const selectedInterests = [
    {
      user_id: id,
      node_id: DEMO_INTEREST_TREE[6].id,
      node_path: DEMO_INTEREST_TREE[6].path,
      node_name: DEMO_INTEREST_TREE[6].name,
      affinity: 'regular' as const,
    },
    {
      user_id: id,
      node_id: DEMO_INTEREST_TREE[4].id,
      node_path: DEMO_INTEREST_TREE[4].path,
      node_name: DEMO_INTEREST_TREE[4].name,
      affinity: 'regular' as const,
    },
    {
      user_id: id,
      node_id: DEMO_INTEREST_TREE[10].id,
      node_path: DEMO_INTEREST_TREE[10].path,
      node_name: DEMO_INTEREST_TREE[10].name,
      affinity: 'regular' as const,
    },
    {
      user_id: id,
      node_id: DEMO_INTEREST_TREE[1 + (idx % 18)].id,
      node_path: DEMO_INTEREST_TREE[1 + (idx % 18)].path,
      node_name: DEMO_INTEREST_TREE[1 + (idx % 18)].name,
      affinity: 'curious' as const,
    }
  ];

  // 4 Shared Values across ALL demo candidates to ensure values >= 4 so scoreValues doesn't default to 0.5
  const selectedValues = [
    {
      user_id: id,
      value_key: 'growth',
      stance: 0.8,
      importance: 0.8,
      visibility: 'matching_only' as const,
    },
    {
      user_id: id,
      value_key: 'community',
      stance: 0.7,
      importance: 0.7,
      visibility: 'matching_only' as const,
    },
    {
      user_id: id,
      value_key: 'creativity',
      stance: 0.6,
      importance: 0.6,
      visibility: 'matching_only' as const,
    },
    {
      user_id: id,
      value_key: 'authenticity',
      stance: 0.75,
      importance: 0.7,
      visibility: 'matching_only' as const,
    }
  ];

  return {
    profile: {
      id,
      handle,
      display_name: name,
      avatar_url: avatar,
      bio,
      home_area: area,
      birth_year: 1988 + (idx % 14),
      age_pref_min: 21,
      age_pref_max: 50,
      profile_version: 1,
      confidence: idx === 39 ? 0.45 : 0.65 + (idx % 30) / 100,
      tier: 'free',
      status: 'active',
    },
    personality: {
      user_id: id,
      openness,
      conscientiousness,
      extraversion,
      agreeableness,
      emotional_stability,
      serious_playful,
      intensity_easygoing,
      assertive_accommodating,
      novelty_seeking,
      intellectual_curiosity,
      answered: 10,
    },
    communication: {
      user_id: id,
      contact_frequency_self,
      contact_frequency_expect,
      response_speed_self,
      response_speed_expect,
      initiation_self,
      initiation_expect,
      message_length,
      direct_diplomatic,
      high_context_literal,
      mediums: (idx % 2 === 0) ? ['text', 'in_person_first'] : ['text', 'voice_note'],
      conv_styles: (idx % 2 === 0) ? ['deep', 'banter'] : ['debate', 'emotional'],
      answered: 8,
    },
    social_rhythm: {
      user_id: id,
      availability,
      fri_night,
      sat_night,
      planning_horizon,
      social_freq_self: 0.5,
      social_freq_expect: 0.5,
      preferred_duration: 0.5,
      energy_peak: 0.5,
      answered: 6,
    },
    intent: {
      user_id: id,
      intents: (idx % 2 === 0) ? ['close_friends', 'food_people'] : ['activity_buddies', 'casual_hangs'],
      depth: depthVal,
      open_to_hosting: (idx % 2 === 0),
      answered: 4,
    },
    emotional: {
      user_id: id,
      er_opening_pace: (idx % 5) * 0.18 + 0.1,
      er_cadence_need: 0.4 + (idx % 4) * 0.1,
      er_cadence_expect: 0.4 + (idx % 4) * 0.1,
      er_reassurance_need: 0.5,
      er_reassurance_offer: 0.5,
      er_recovery_time: 0.5,
      er_conflict_approach: (idx % 3) * 0.3 + 0.2,
      expressiveness: 0.5,
      vulnerability_comfort: 0.5,
      affection: 0.5,
      advice_vs_listening_self: 0.5,
      advice_vs_listening_expect: 0.5,
      reliability_self: 0.8,
      reliability_expect: 0.8,
      boundary_clarity: 0.6,
      answered: 9,
    },
    values: selectedValues,
    interests: selectedInterests,
    lifestyle: {
      user_id: id,
      budget_band: budgetBandVal,
      alcohol: (idx % 3 === 0) ? 'often' : (idx % 2 === 0) ? 'occasional' : 'none',
      smoking: (idx % 5 === 0) ? 'social' : 'none',
      activity_level: 0.3 + (idx % 5) * 0.15,
      travel_frequency: 0.4,
      food_prefs: [],
      pets: [],
      accessibility_needs: [],
      dealbreakers: [],
      life_stage: 'working',
      work_schedule: ['standard'],
      answered: 5,
    },
    experience: {
      user_id: id,
      settings: ['casual', 'cafe'],
      group_size_pref: (idx % 4) * 0.25 + 0.1,
      orientation: ['social'],
      novelty: 0.5,
      answered: 4,
    },
    geography: {
      user_id: id,
      home_area: area,
      radius_minutes: { coffee: 30, dining: 45, active: 45, cultural: 60, nightlife: 60, creative: 45 },
      answered: 2,
    },
  };
});
