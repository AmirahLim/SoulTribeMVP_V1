import type { UserProfileData } from './userStore';
import type { ProfileVector } from '@soul-tribe/core';
import { confidenceFromCompleteness } from '@soul-tribe/core';

// ⚠️ RULE 2: Astrology fields (sunSign, moonSign, risingSign) are kept strictly
// for display/flavour and do NOT map to scoring traits or affect match rankings.

export const ANSWER_MAP = {
  mbti: (mbtiStr?: string) => {
    if (!mbtiStr) return null;
    const clean = mbtiStr.trim().toUpperCase();
    if (clean.length !== 4) return null;

    const extraversion = clean[0] === 'E' ? 0.8 : clean[0] === 'I' ? 0.3 : null;
    const openness = clean[1] === 'N' ? 0.8 : clean[1] === 'S' ? 0.3 : null;
    const novelty_seeking = clean[1] === 'N' ? 0.8 : clean[1] === 'S' ? 0.3 : null;
    const agreeableness = clean[2] === 'F' ? 0.8 : clean[2] === 'T' ? 0.4 : null;
    const conscientiousness = clean[3] === 'J' ? 0.8 : clean[3] === 'P' ? 0.3 : null;
    const planning_horizon = clean[3] === 'J' ? 0.8 : clean[3] === 'P' ? 0.3 : null;

    if (extraversion === null || openness === null || agreeableness === null || conscientiousness === null) {
      return null;
    }

    return {
      extraversion,
      openness,
      novelty_seeking,
      agreeableness,
      conscientiousness,
      planning_horizon,
    };
  },

  groupSize: (val?: string) => {
    if (!val) return null;
    const lower = val.toLowerCase();
    if (lower.includes('1-2') || lower.includes('1-on-1') || lower.includes('one')) return 0.2;
    if (lower.includes('3–4') || lower.includes('3-4') || lower.includes('small')) return 0.4;
    if (lower.includes('5–6') || lower.includes('5-6') || lower.includes('medium')) return 0.6;
    if (lower.includes('6+') || lower.includes('large')) return 0.8;
    return 0.5;
  },

  socialVibe: (val?: string) => {
    if (!val) return null;
    const lower = val.toLowerCase();
    if (lower.includes('intimate') || lower.includes('calm') || lower.includes('cozy') || lower.includes('deep')) {
      return { serious_playful: 0.7, intensity_easygoing: 0.3 };
    }
    if (lower.includes('chill') || lower.includes('relaxed')) {
      return { serious_playful: 0.4, intensity_easygoing: 0.3 };
    }
    if (lower.includes('active') || lower.includes('energetic') || lower.includes('high')) {
      return { serious_playful: 0.3, intensity_easygoing: 0.8 };
    }
    return { serious_playful: 0.5, intensity_easygoing: 0.5 };
  },

  messagingStyle: (val?: string) => {
    if (!val) return null;
    const lower = val.toLowerCase();
    if (lower.includes('daily') || lower.includes('frequent')) {
      return { contact_frequency_self: 0.8, response_speed_self: 0.8, message_length: 0.5 };
    }
    if (lower.includes('voice') || lower.includes('weekly') || lower.includes('memes')) {
      return { contact_frequency_self: 0.5, response_speed_self: 0.5, message_length: 0.6 };
    }
    if (lower.includes('spontaneous')) {
      return { contact_frequency_self: 0.4, response_speed_self: 0.6, message_length: 0.4 };
    }
    return { contact_frequency_self: 0.5, response_speed_self: 0.5, message_length: 0.5 };
  },

  supportStyle: (val?: string) => {
    if (!val) return null;
    const lower = val.toLowerCase();
    if (lower.includes('advice')) return 0.2;
    if (lower.includes('listen')) return 0.8;
    return 0.5;
  },

  idealSaturday: (val?: string) => {
    if (!val) return null;
    const lower = val.toLowerCase();
    if (lower.includes('slow') || lower.includes('coffee') || lower.includes('craft')) {
      return { planning_horizon: 0.6, novelty: 0.4 };
    }
    if (lower.includes('spontaneous') || lower.includes('explore')) {
      return { planning_horizon: 0.2, novelty: 0.8 };
    }
    return { planning_horizon: 0.5, novelty: 0.5 };
  },

  spontaneousTrip: (val?: string) => {
    if (!val) return null;
    const lower = val.toLowerCase();
    if (lower.includes('yes') || lower.includes('pack') || lower.includes('down')) return 0.9;
    if (lower.includes('convince') || lower.includes('maybe')) return 0.5;
    if (lower.includes('no') || lower.includes('plan')) return 0.2;
    return 0.5;
  },
};

export function toProfileVector(user: UserProfileData, id?: string): ProfileVector {
  const deep = user.deepProfile || {};
  const userId = id || '00000000-0000-0000-0000-000000000099';

  // RULE 1: Never fabricate answers. If deepProfile field is missing, answered count is 0.
  const mbtiMap = ANSWER_MAP.mbti(deep.mbti);
  const groupSizeVal = ANSWER_MAP.groupSize(deep.groupSize);
  const socialVibeVal = ANSWER_MAP.socialVibe(deep.socialVibe);
  const messagingVal = ANSWER_MAP.messagingStyle(deep.messagingStyle);
  const supportVal = ANSWER_MAP.supportStyle(deep.supportStyle);
  const saturdayVal = ANSWER_MAP.idealSaturday(deep.idealSaturday);
  const tripVal = ANSWER_MAP.spontaneousTrip(deep.spontaneousTrip);

  // Personality
  const personalityAnswered = mbtiMap ? 10 : 0;
  const personality = {
    user_id: userId,
    openness: mbtiMap?.openness ?? 0.5,
    conscientiousness: mbtiMap?.conscientiousness ?? 0.5,
    extraversion: mbtiMap?.extraversion ?? 0.5,
    agreeableness: mbtiMap?.agreeableness ?? 0.5,
    emotional_stability: 0.5,
    serious_playful: socialVibeVal?.serious_playful ?? 0.5,
    intensity_easygoing: socialVibeVal?.intensity_easygoing ?? 0.5,
    assertive_accommodating: 0.5,
    novelty_seeking: mbtiMap?.novelty_seeking ?? saturdayVal?.novelty ?? (tripVal ?? 0.5),
    intellectual_curiosity: 0.5,
    answered: personalityAnswered,
  };

  // Communication
  const commAnswered = (messagingVal ? 5 : 0) + (deep.messagingStyleOpen ? 3 : 0);
  const communication = {
    user_id: userId,
    contact_frequency_self: messagingVal?.contact_frequency_self ?? 0.5,
    contact_frequency_expect: messagingVal?.contact_frequency_self ?? 0.5,
    response_speed_self: messagingVal?.response_speed_self ?? 0.5,
    response_speed_expect: messagingVal?.response_speed_self ?? 0.5,
    initiation_self: 0.5,
    initiation_expect: 0.5,
    message_length: messagingVal?.message_length ?? 0.5,
    direct_diplomatic: 0.5,
    high_context_literal: 0.5,
    mediums: ['text'],
    conv_styles: ['deep'],
    answered: Math.min(10, commAnswered),
  };

  // Social Rhythm
  const rhythmAnswered = (saturdayVal ? 3 : 0) + (tripVal !== null ? 2 : 0);
  const social_rhythm = {
    user_id: userId,
    availability: ['sat_midday', 'sun_midday'],
    fri_night: true,
    sat_night: true,
    planning_horizon: saturdayVal?.planning_horizon ?? (mbtiMap?.planning_horizon ?? 0.5),
    social_freq_self: 0.5,
    social_freq_expect: 0.5,
    preferred_duration: 0.5,
    energy_peak: 0.5,
    answered: Math.min(5, rhythmAnswered),
  };

  // Intent
  const intentAnswered = deep.friendshipPillars ? 3 : 0;
  const intent = {
    user_id: userId,
    intents: ['friendship', 'close_friends'],
    depth: deep.friendshipPillars ? 3 : 2,
    open_to_hosting: false,
    answered: intentAnswered,
  };

  // Emotional
  const emotionalAnswered = supportVal !== null ? 5 : 0;
  const emotional = {
    user_id: userId,
    er_opening_pace: 0.5,
    er_cadence_need: 0.5,
    er_cadence_expect: 0.5,
    er_reassurance_need: 0.5,
    er_reassurance_offer: 0.5,
    er_recovery_time: 0.5,
    er_conflict_approach: 0.5,
    expressiveness: 0.5,
    vulnerability_comfort: 0.5,
    affection: 0.5,
    advice_vs_listening_self: supportVal ?? 0.5,
    advice_vs_listening_expect: supportVal ?? 0.5,
    reliability_self: 0.8,
    reliability_expect: 0.8,
    boundary_clarity: 0.6,
    answered: emotionalAnswered,
  };

  // Lifestyle
  const lifestyleAnswered = deep.budgetPref ? 5 : 0;
  const lifestyle = {
    user_id: userId,
    budget_band: 2,
    alcohol: 'occasional' as const,
    smoking: 'none' as const,
    activity_level: 0.5,
    travel_frequency: 0.5,
    life_stage: 'working',
    work_schedule: ['standard'],
    food_prefs: ['anything'],
    pets: [],
    accessibility_needs: [],
    dealbreakers: [],
    answered: lifestyleAnswered,
  };

  // Experience
  const expAnswered = groupSizeVal !== null ? 4 : 0;
  const experience = {
    user_id: userId,
    settings: ['cafe'],
    group_size_pref: groupSizeVal ?? 0.5,
    orientation: ['conversation_first'],
    novelty: saturdayVal?.novelty ?? 0.5,
    answered: expAnswered,
  };

  // Geography
  const geography = {
    user_id: userId,
    home_area: user.homeArea || 'Singapore',
    radius_minutes: { coffee: 30, dining: 45 },
    answered: 2,
  };

  const rawVec: ProfileVector = {
    profile: {
      id: userId,
      handle: (user.displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_'),
      display_name: user.displayName || 'User',
      avatar_url: user.avatarUrl,
      bio: user.bio,
      home_area: user.homeArea || 'Singapore',
      birth_year: 1995,
      age_pref_min: 18,
      age_pref_max: 99,
      profile_version: user.version || 6,
      confidence: 0.5,
      tier: 'free',
      status: 'active',
    },
    personality,
    communication,
    social_rhythm,
    intent,
    emotional,
    values: [],
    interests: [],
    lifestyle,
    experience,
    geography,
  };

  const confidence = completenessConfidence(rawVec);
  rawVec.profile.confidence = confidence;

  return rawVec;
}

export function completenessConfidence(vec: ProfileVector): number {
  return confidenceFromCompleteness(vec);
}
