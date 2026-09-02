export interface Profile {
  id: string;
  handle: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  home_area: string;
  birth_year: number;
  age_pref_min: number;
  age_pref_max: number;
  profile_version: number;
  confidence: number; // 0..1
  tier: 'free' | 'host_plus';
  status: 'active' | 'paused' | 'under_review' | 'banned';
  created_at?: string;
}

export interface TraitPersonality {
  user_id: string;
  openness?: number;
  conscientiousness?: number;
  extraversion?: number;
  agreeableness?: number;
  emotional_stability?: number;
  serious_playful?: number;
  intensity_easygoing?: number;
  assertive_accommodating?: number;
  novelty_seeking?: number;
  intellectual_curiosity?: number;
  answered: number;
}

export interface TraitCommunication {
  user_id: string;
  contact_frequency_self?: number;
  contact_frequency_expect?: number;
  response_speed_self?: number;
  response_speed_expect?: number;
  initiation_self?: number;
  initiation_expect?: number;
  message_length?: number;
  direct_diplomatic?: number;
  high_context_literal?: number;
  mediums?: string[];
  conv_styles?: string[];
  answered: number;
}

export interface TraitSocialRhythm {
  user_id: string;
  availability?: string[]; // e.g. 'mon_evening', 7 days x 4 blocks
  fri_night?: boolean;
  sat_night?: boolean;
  planning_horizon?: number; // 0 same day -> 1 several weeks
  social_freq_self?: number;
  social_freq_expect?: number;
  preferred_duration?: number;
  energy_peak?: number;
  answered: number;
}

export interface TraitIntent {
  user_id: string;
  intents?: string[];
  depth?: number; // 0-4
  open_to_hosting?: boolean;
  answered: number;
}

export interface TraitEmotional {
  user_id: string;
  er_opening_pace?: number;
  er_cadence_need?: number;
  er_cadence_expect?: number;
  er_reassurance_need?: number;
  er_reassurance_offer?: number;
  er_recovery_time?: number;
  er_conflict_approach?: number;
  expressiveness?: number;
  vulnerability_comfort?: number;
  affection?: number;
  advice_vs_listening_self?: number;
  advice_vs_listening_expect?: number;
  reliability_self?: number;
  reliability_expect?: number;
  boundary_clarity?: number;
  answered: number;
}

export interface UserValue {
  user_id: string;
  value_key: string;
  stance: number;
  importance: number;
  visibility: 'private' | 'matching_only' | 'public';
}

export interface UserInterest {
  user_id: string;
  node_id: number;
  node_path: string;
  node_name: string;
  affinity: 'love' | 'regular' | 'learning' | 'curious';
}

export interface TraitLifestyle {
  user_id: string;
  budget_band?: number; // 0..4
  alcohol?: 'none' | 'occasional' | 'regular';
  smoking?: 'none' | 'occasional' | 'regular';
  activity_level?: number;
  travel_frequency?: number;
  life_stage?: string;
  work_schedule?: string[];
  food_prefs?: string[];
  pets?: string[];
  accessibility_needs?: string[];
  dealbreakers?: string[];
  answered: number;
}

export interface TraitExperience {
  user_id: string;
  settings?: string[];
  group_size_pref?: number;
  orientation?: string[];
  novelty?: number;
  answered: number;
}

export interface TraitGeography {
  user_id: string;
  home_area?: string;
  radius_minutes?: Record<string, number>;
  answered: number;
}

export interface ProfileVector {
  profile: Profile;
  personality?: TraitPersonality;
  communication?: TraitCommunication;
  social_rhythm?: TraitSocialRhythm;
  intent?: TraitIntent;
  emotional?: TraitEmotional;
  values?: UserValue[];
  interests?: UserInterest[];
  lifestyle?: TraitLifestyle;
  experience?: TraitExperience;
  geography?: TraitGeography;
}

export interface MatchContext {
  blockedUserIds?: string[];
  reportedUserIds?: string[];
  activity_category?: 'coffee' | 'dining' | 'active' | 'cultural' | 'nightlife' | 'creative' | 'intellectual';
  tagged_interest_node?: string;
  candidatePoolSize?: number;
}

export interface MatchResult {
  resonance: number | null; // 0..1 or null if no constituent thread could be compared
  logistics: number | null; // 0..1 or null if no constituent thread could be compared
  rank_score: number;
  gated: boolean;
  gate_reasons: string[];
  contributions: Record<string, number>;
  confidence_a: number;
  confidence_b: number;
  fit_a_to_b?: number | null;
  fit_b_to_a?: number | null;
  imbalance_penalty?: number;
}

export interface Outing {
  id: string;
  host_id: string;
  title: string;
  pitch: string;
  activity_category: 'coffee' | 'dining' | 'active' | 'cultural' | 'nightlife' | 'creative' | 'intellectual';
  interest_node_id?: number;
  area: string;
  starts_at: string;
  duration_minutes: number;
  budget_band: number;
  orientation: 'conversation_first' | 'activity_first' | 'either';
  setting: string;
  max_participants: number; // default 6
  visibility: 'invite_only' | 'requestable';
  state: 'draft' | 'open' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

export interface OutingMember {
  outing_id: string;
  user_id: string;
  role: 'host' | 'guest';
  state: 'invited' | 'requested' | 'accepted' | 'declined' | 'removed';
  invited_at?: string;
  responded_at?: string;
}

export interface OutingRecord {
  outing_id: string;
  headline?: string;
  photo_urls: string[];
  attended: string[];
  created_at: string;
}

export interface RhythmCheck {
  outing_id: string;
  author_id: string;
  about_id?: string;
  would_meet_again: number; // 1..5
  energy_read: 'quieter' | 'as_expected' | 'livelier';
  pace_read: 'slower' | 'as_expected' | 'faster';
  note?: string;
  created_at: string;
}
