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

/** Deterministic demo candidates for pre-backend development. NOT real users. */
export const DEMO_PROFILES: ProfileVector[] = Array.from({ length: 40 }, (_, idx) => {
  const num = idx + 1;
  const id = `00000000-0000-0000-0000-${num.toString().padStart(12, '0')}`;

  const areas = ['Singapore'];
  const names = [
    'Priya Sharma', 'Marcus Tan', 'Maya Lin', 'Chen Wei', 'Aisha Khan', 'Julian Koh', 'Sarah Lim',
    'David Leong', 'Hannah Wong', 'Gabriel Teo', 'Chloe Das', 'Samuel Nair', 'Rachel Kwek', 'Lucas Yeo',
    'Fiona Chia', 'Benjamin Roy', 'Nadia Hassan', 'Timothy Goh', 'Grace Sim', 'Daniel Fernandez',
    'Evelyn Tay', 'Aaron Balakrishnan', 'Jessica Low', 'Isaac Seah', 'Zoe Mendonca', 'Ryan Fong',
    'Claire Vance', 'Jonathan Soo', 'Valerie Ong', 'Kevin Ho', 'Megan Alwi', 'Justin Krishnan',
    'Tanya Varma', 'Nicholas Heng', 'Samantha Chen', 'Brandon Sng', 'Amara Patel', 'Victor Liew',
    'Vanessa Siew', 'Sean Pereira'
  ];

  const area = areas[idx % areas.length];
  const name = names[idx % names.length];
  const handle = name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 18) + `_${num}`;

  const FEMALE_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=800&auto=format&fit=crop&q=80',
  ];

  const MALE_AVATARS = [
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

  const isFemale = idx % 2 === 0;
  const avatarIndex = Math.floor(idx / 2);
  const avatar = isFemale
    ? FEMALE_AVATARS[avatarIndex % FEMALE_AVATARS.length]
    : MALE_AVATARS[avatarIndex % MALE_AVATARS.length];

  return {
    profile: {
      id,
      handle,
      display_name: name,
      avatar_url: avatar,
      bio: `Singapore-based, interested in intentional friendships and weekend coffee.`,
      home_area: area,
      birth_year: 1990 + (idx % 12),
      age_pref_min: 21,
      age_pref_max: 50,
      profile_version: 1,
      confidence: idx === 39 ? 0.45 : 0.65 + ((idx % 30) / 100),
      tier: 'free',
      status: 'active',
    },
    personality: {
      user_id: id,
      openness: 0.4 + (idx * 0.015) % 0.5,
      conscientiousness: 0.3 + (idx * 0.02) % 0.6,
      extraversion: 0.2 + (idx * 0.022) % 0.7,
      agreeableness: 0.5 + (idx * 0.01) % 0.4,
      emotional_stability: 0.5 + (idx * 0.012) % 0.4,
      serious_playful: 0.4 + (idx * 0.018) % 0.5,
      intensity_easygoing: 0.3 + (idx * 0.014) % 0.6,
      assertive_accommodating: 0.4 + (idx * 0.016) % 0.5,
      novelty_seeking: 0.3 + (idx * 0.021) % 0.6,
      intellectual_curiosity: 0.5 + (idx * 0.013) % 0.45,
      answered: 10,
    },
    communication: {
      user_id: id,
      contact_frequency_self: 0.2 + (idx * 0.018) % 0.7,
      contact_frequency_expect: 0.2 + (idx * 0.018) % 0.7,
      response_speed_self: 0.3 + (idx * 0.015) % 0.6,
      response_speed_expect: 0.3 + (idx * 0.015) % 0.6,
      initiation_self: 0.4 + (idx * 0.01) % 0.5,
      initiation_expect: 0.4 + (idx * 0.01) % 0.5,
      message_length: 0.4 + (idx * 0.02) % 0.5,
      direct_diplomatic: 0.5,
      high_context_literal: 0.5,
      mediums: idx % 2 === 0 ? ['text', 'in_person_first'] : ['text', 'voice_note'],
      conv_styles: idx % 3 === 0 ? ['deep', 'banter'] : ['debate', 'emotional'],
      answered: 8,
    },
    social_rhythm: {
      user_id: id,
      availability: idx % 2 === 0 ? ['sat_midday', 'sun_midday'] : ['sat_evening', 'fri_evening'],
      fri_night: idx % 2 === 0,
      sat_night: idx % 3 === 0,
      planning_horizon: 0.3 + (idx * 0.015) % 0.6,
      social_freq_self: 0.5,
      social_freq_expect: 0.5,
      preferred_duration: 0.5,
      energy_peak: 0.5,
      answered: 6,
    },
    intent: {
      user_id: id,
      intents: ['close_friends', 'food_people'],
      depth: (idx % 4) as 0 | 1 | 2 | 3 | 4,
      open_to_hosting: idx % 2 === 0,
      answered: 4,
    },
    emotional: {
      user_id: id,
      er_opening_pace: 0.3 + (idx * 0.015) % 0.6,
      er_cadence_need: 0.4 + (idx * 0.012) % 0.5,
      er_cadence_expect: 0.4 + (idx * 0.012) % 0.5,
      er_reassurance_need: 0.5,
      er_reassurance_offer: 0.5,
      er_recovery_time: 0.5,
      er_conflict_approach: 0.4 + (idx * 0.015) % 0.5,
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
    values: [
      { user_id: id, value_key: 'growth', stance: 0.8, importance: 0.8, visibility: 'matching_only' },
      { user_id: id, value_key: 'family', stance: 0.7, importance: 0.7, visibility: 'matching_only' },
      { user_id: id, value_key: 'creativity', stance: 0.6, importance: 0.5, visibility: 'matching_only' },
      { user_id: id, value_key: 'stability', stance: 0.5, importance: 0.4, visibility: 'matching_only' },
    ],
    interests: [
      { user_id: id, node_id: (idx % 5) + 1, node_path: DEMO_INTEREST_TREE[(idx % 5) + 1].path, node_name: DEMO_INTEREST_TREE[(idx % 5) + 1].name, affinity: idx % 2 === 0 ? 'regular' : 'curious' },
    ],
    lifestyle: {
      user_id: id,
      budget_band: (idx % 4) as 0 | 1 | 2 | 3 | 4,
      alcohol: 'occasional',
      smoking: 'none',
      activity_level: 0.5,
      travel_frequency: 0.4,
      life_stage: 'working',
      work_schedule: ['standard'],
      food_prefs: ['anything'],
      pets: [],
      accessibility_needs: [],
      dealbreakers: [],
      answered: 8,
    },
    experience: {
      user_id: id,
      settings: ['quiet', 'intimate'],
      group_size_pref: 0.3 + (idx * 0.015) % 0.5,
      orientation: ['conversation_first'],
      novelty: 0.5,
      answered: 4,
    },
    geography: {
      user_id: id,
      home_area: area,
      radius_minutes: { coffee: 30, dining: 45 },
      answered: 2,
    },
  };
});
