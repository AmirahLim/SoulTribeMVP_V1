import type { UserProfileData } from './userStore.ts';
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
  const userId = id || user.id || '00000000-0000-0000-0000-000000000099';

  const mbtiMap = ANSWER_MAP.mbti(deep.mbti);
  const groupSizeVal = ANSWER_MAP.groupSize(deep.groupSize);
  const socialVibeVal = ANSWER_MAP.socialVibe(deep.socialVibe);
  const messagingVal = ANSWER_MAP.messagingStyle(deep.messagingStyle);
  const supportVal = ANSWER_MAP.supportStyle(deep.supportStyle);
  const saturdayVal = ANSWER_MAP.idealSaturday(deep.idealSaturday);
  const tripVal = ANSWER_MAP.spontaneousTrip(deep.spontaneousTrip);

  // Extract 8 Onboarding Question Answers (either from direct user props or DB join)
  const q1 = user.q1Finding || (user as any).trait_intent?.intents || [];
  const q2 = user.q2Feelings || (user as any).trait_communication?.conv_styles || [];
  const q3Energy = typeof user.q3Energy === 'number' ? user.q3Energy : (user as any).trait_personality?.extraversion;
  const q3GroupSize = user.q3GroupSize || (user as any).trait_experience?.group_size_pref;
  const q4 = user.q4Connected || (user as any).trait_communication?.mediums || [];
  const q5Rhythm = user.q5PlanningRhythm || (user as any).trait_social_rhythm?.planning_horizon;
  const q5Avail = user.q5Availability || (user as any).trait_social_rhythm?.availability || [];
  const rawQ6 = user.q6Outings || (user as any).user_interests?.map((i: any) => i.interest_nodes?.name || i.node_name || i.name) || [];
  const q7Pacing = user.q7EmotionalPacing || (user as any).trait_emotional?.er_opening_pace;
  const rawQ8 = user.q8Qualities || (user as any).user_values?.map((v: any) => v.value_key || v.value_name || v.name) || [];

  const q6Outings = rawQ6;
  const q8Qualities = rawQ8;

  // 1. Personality
  const dbPersAnswered = (user as any).trait_personality?.answered ?? (user as any).personality?.answered;
  const personalityAnswered = typeof dbPersAnswered === 'number'
    ? dbPersAnswered
    : ((q2.length > 0 || typeof q3Energy === 'number') ? 8 : (mbtiMap ? 10 : 0));

  const serious_playful = q2.some((f: string) => f.includes('Deep') || f.includes('meaningful')) ? 0.7 
    : q2.some((f: string) => f.includes('Chill') || f.includes('relaxed')) ? 0.4 
    : (socialVibeVal?.serious_playful ?? 0.5);
  const intensity_easygoing = q2.some((f: string) => f.includes('Active') || f.includes('energetic')) ? 0.8 
    : (socialVibeVal?.intensity_easygoing ?? 0.3);
  const extraversion = typeof q3Energy === 'number' 
    ? (q3Energy > 1 ? q3Energy / 100 : Math.max(0.1, Math.min(0.9, 1 - q3Energy))) 
    : (mbtiMap?.extraversion ?? 0.5);

  const personality = {
    user_id: userId,
    openness: mbtiMap?.openness ?? 0.6,
    conscientiousness: mbtiMap?.conscientiousness ?? 0.5,
    extraversion,
    agreeableness: mbtiMap?.agreeableness ?? 0.6,
    emotional_stability: 0.5,
    serious_playful,
    intensity_easygoing,
    assertive_accommodating: 0.5,
    novelty_seeking: mbtiMap?.novelty_seeking ?? saturdayVal?.novelty ?? (tripVal ?? 0.5),
    intellectual_curiosity: 0.6,
    answered: personalityAnswered,
  };

  // 2. Communication
  const dbCommAnswered = (user as any).trait_communication?.answered ?? (user as any).communication?.answered;
  const commAnswered = typeof dbCommAnswered === 'number'
    ? dbCommAnswered
    : (q4.length > 0 || q2.length > 0 ? 8 : ((messagingVal ? 5 : 0) + (deep.messagingStyleOpen ? 3 : 0)));

  const communication = {
    user_id: userId,
    contact_frequency_self: q4.some((c: string) => c.includes('check-in')) ? 0.7 : (messagingVal?.contact_frequency_self ?? 0.5),
    contact_frequency_expect: q4.some((c: string) => c.includes('check-in')) ? 0.7 : (messagingVal?.contact_frequency_self ?? 0.5),
    response_speed_self: messagingVal?.response_speed_self ?? 0.6,
    response_speed_expect: messagingVal?.response_speed_self ?? 0.6,
    initiation_self: 0.5,
    initiation_expect: 0.5,
    message_length: messagingVal?.message_length ?? 0.5,
    direct_diplomatic: 0.5,
    high_context_literal: 0.5,
    mediums: q4.length > 0 ? q4 : [],
    conv_styles: q2.length > 0 ? q2 : [],
    answered: Math.min(10, commAnswered),
  };

  // 3. Social Rhythm
  const dbRhythmAnswered = (user as any).trait_social_rhythm?.answered ?? (user as any).social_rhythm?.answered;
  const rhythmAnswered = typeof dbRhythmAnswered === 'number'
    ? dbRhythmAnswered
    : (q5Avail.length > 0 || q5Rhythm ? 6 : ((saturdayVal ? 3 : 0) + (tripVal !== null ? 2 : 0)));

  const planning_horizon = typeof q5Rhythm === 'string'
    ? (q5Rhythm.includes('Spontaneous') ? 0.2 : 0.8)
    : (typeof q5Rhythm === 'number' ? q5Rhythm : (saturdayVal?.planning_horizon ?? 0.5));

  const social_rhythm = {
    user_id: userId,
    availability: q5Avail.length > 0 ? q5Avail : [],
    fri_night: Boolean((user as any).trait_social_rhythm?.fri_night ?? (user as any).social_rhythm?.fri_night ?? (user as any).fri_night),
    sat_night: Boolean((user as any).trait_social_rhythm?.sat_night ?? (user as any).social_rhythm?.sat_night ?? (user as any).sat_night),
    planning_horizon,
    social_freq_self: 0.5,
    social_freq_expect: 0.5,
    preferred_duration: 0.5,
    energy_peak: 0.5,
    answered: Math.min(5, rhythmAnswered),
  };

  // 4. Intent
  const dbIntentAnswered = (user as any).trait_intent?.answered ?? (user as any).intent?.answered;
  const intentAnswered = typeof dbIntentAnswered === 'number'
    ? dbIntentAnswered
    : (q1.length > 0 ? 5 : (deep.friendshipPillars ? 3 : 0));

  const intent = {
    user_id: userId,
    intents: q1.length > 0 ? q1 : [],
    depth: q1.some((f: string) => f.includes('inner circle') || f.includes('close')) ? 4 : 2,
    open_to_hosting: false,
    answered: intentAnswered,
  };

  // 5. Emotional
  const dbEmoAnswered = (user as any).trait_emotional?.answered ?? (user as any).emotional?.answered;
  const emotionalAnswered = typeof dbEmoAnswered === 'number'
    ? dbEmoAnswered
    : (q7Pacing || q8Qualities.length > 0 ? 6 : (supportVal !== null ? 5 : 0));

  const er_opening_pace = typeof q7Pacing === 'string'
    ? (q7Pacing.includes('Fast') ? 0.8 : 0.4)
    : (typeof q7Pacing === 'number' ? q7Pacing : 0.5);

  const emotional = {
    user_id: userId,
    er_opening_pace,
    er_cadence_need: 0.5,
    er_cadence_expect: 0.5,
    er_reassurance_need: 0.5,
    er_reassurance_offer: 0.5,
    er_recovery_time: 0.5,
    er_conflict_approach: 0.5,
    expressiveness: 0.5,
    vulnerability_comfort: 0.6,
    affection: 0.5,
    advice_vs_listening_self: supportVal ?? 0.5,
    advice_vs_listening_expect: supportVal ?? 0.5,
    reliability_self: q8Qualities.some((q: string) => q.includes('Reliability')) ? 0.9 : 0.7,
    reliability_expect: 0.8,
    boundary_clarity: 0.6,
    answered: emotionalAnswered,
  };

  // 6. Lifestyle
  const dbLifeAnswered = (user as any).trait_lifestyle?.answered ?? (user as any).lifestyle?.answered;
  const lifestyleAnswered = typeof dbLifeAnswered === 'number'
    ? dbLifeAnswered
    : (deep.budgetPref ? 5 : 0);

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

  // 7. Experience
  const dbExpAnswered = (user as any).trait_experience?.answered ?? (user as any).experience?.answered;
  const expAnswered = typeof dbExpAnswered === 'number'
    ? dbExpAnswered
    : (q3GroupSize ? 4 : (groupSizeVal !== null ? 4 : 0));
  const group_size_pref = typeof q3GroupSize === 'string'
    ? (q3GroupSize.includes('1-on-1') ? 0.2 : q3GroupSize.includes('3-4') ? 0.4 : 0.6)
    : (typeof q3GroupSize === 'number' ? q3GroupSize : (groupSizeVal ?? 0.5));

  const experience = {
    user_id: userId,
    settings: q6Outings.length > 0 ? q6Outings : [],
    group_size_pref,
    orientation: ['conversation_first'],
    novelty: saturdayVal?.novelty ?? 0.5,
    answered: expAnswered,
  };

  // 8. Geography
  const dbGeoAnswered = (user as any).trait_geography?.answered;
  const geography = {
    user_id: userId,
    home_area: user.homeArea || (user as any).home_area || 'Singapore',
    radius_minutes: { coffee: 30, dining: 45 },
    answered: typeof dbGeoAnswered === 'number' ? dbGeoAnswered : (user.homeArea || (user as any).home_area ? 2 : 0),
  };

  // 9. Interests (from Q6 Outings)
  const interests = q6Outings.map((name: string, idx: number) => ({
    node_id: String(idx + 1),
    node_name: name,
    node_path: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
  }));

  // 10. Values (from Q8 Qualities)
  const values = q8Qualities.map((val: string) => ({
    value_name: val,
    importance: 0.8,
  }));

  const birthYear = user.birthYear ?? (user as any).birth_year ?? 1995;
  const agePrefMin = user.agePrefMin ?? (user as any).age_pref_min;
  const agePrefMax = user.agePrefMax ?? (user as any).age_pref_max;

  const rawVec: ProfileVector = {
    profile: {
      id: userId,
      handle: (user.displayName || (user as any).display_name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_'),
      display_name: user.displayName || (user as any).display_name || 'User',
      avatar_url: user.avatarUrl || (user as any).avatar_url,
      bio: user.bio || (user as any).bio,
      home_area: user.homeArea || (user as any).home_area || 'Singapore',
      birth_year: birthYear,
      age_pref_min: agePrefMin,
      age_pref_max: agePrefMax,
      profile_version: user.version || (user as any).profile_version || 6,
      confidence: 0.5,
      tier: 'free',
      status: 'active',
    },
    personality,
    communication,
    social_rhythm,
    intent,
    emotional,
    values,
    interests,
    lifestyle,
    experience,
    geography,
  };

  let confidence = completenessConfidence(rawVec);
  if (typeof (user as any).passCompletionPct === 'number' && (user as any).passCompletionPct > 0) {
    confidence = Math.max(confidence, (user as any).passCompletionPct / 100);
  }
  if (typeof (user as any).confidence === 'number') {
    confidence = (user as any).confidence;
  }
  rawVec.profile.confidence = Math.max(0, Math.min(1.0, confidence));

  return rawVec;
}

export function completenessConfidence(vec: ProfileVector): number {
  return confidenceFromCompleteness(vec);
}
