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
  const persObj = (user as any).trait_personality !== undefined ? (user as any).trait_personality : (user as any).personality;
  const serious_playful = q2.some((f: string) => f.includes('Playful') || f.includes('banter')) ? 0.8 
    : (q2.some((f: string) => f.includes('Deep') || f.includes('meaningful')) ? 0.7 : socialVibeVal?.serious_playful);
  const intensity_easygoing = q2.some((f: string) => f.includes('Active') || f.includes('energetic')) ? 0.8 
    : (socialVibeVal?.intensity_easygoing);
  const extraversion = typeof q3Energy === 'number'
    ? (q3Energy > 1 ? q3Energy / 100 : q3Energy)
    : (mbtiMap?.extraversion);

  const personalityAnswered = persObj !== undefined
    ? (persObj?.answered ?? 0)
    : (typeof q3Energy === 'number' || q2.length > 0 ? 1 : ((mbtiMap ? 10 : 0) + (socialVibeVal ? 3 : 0)));

  const personality = personalityAnswered > 0 ? {
    user_id: userId,
    openness: persObj?.openness ?? mbtiMap?.openness,
    conscientiousness: persObj?.conscientiousness ?? mbtiMap?.conscientiousness,
    extraversion: persObj?.extraversion ?? extraversion,
    agreeableness: persObj?.agreeableness ?? mbtiMap?.agreeableness,
    emotional_stability: persObj?.emotional_stability,
    serious_playful: persObj?.serious_playful ?? serious_playful,
    intensity_easygoing: persObj?.intensity_easygoing ?? intensity_easygoing,
    assertive_accommodating: persObj?.assertive_accommodating,
    novelty_seeking: persObj?.novelty_seeking ?? mbtiMap?.novelty_seeking ?? saturdayVal?.novelty ?? tripVal,
    intellectual_curiosity: persObj?.intellectual_curiosity,
    answered: personalityAnswered,
  } : undefined;

  // 2. Communication
  const commObj = (user as any).trait_communication !== undefined ? (user as any).trait_communication : (user as any).communication;
  const commAnswered = commObj !== undefined
    ? (commObj?.answered ?? 0)
    : (q4.length > 0 || q2.length > 0 ? 8 : ((messagingVal ? 5 : 0) + (deep.messagingStyleOpen ? 3 : 0)));

  const communication = commAnswered > 0 ? {
    user_id: userId,
    contact_frequency_self: commObj?.contact_frequency_self ?? (q4.some((c: string) => c.includes('check-in')) ? 0.7 : messagingVal?.contact_frequency_self),
    contact_frequency_expect: commObj?.contact_frequency_expect ?? (q4.some((c: string) => c.includes('check-in')) ? 0.7 : messagingVal?.contact_frequency_self),
    response_speed_self: commObj?.response_speed_self ?? messagingVal?.response_speed_self,
    response_speed_expect: commObj?.response_speed_expect ?? messagingVal?.response_speed_self,
    initiation_self: commObj?.initiation_self,
    initiation_expect: commObj?.initiation_expect,
    message_length: commObj?.message_length ?? messagingVal?.message_length,
    direct_diplomatic: commObj?.direct_diplomatic,
    high_context_literal: commObj?.high_context_literal,
    mediums: commObj?.mediums ?? (q4.length > 0 ? q4 : undefined),
    conv_styles: commObj?.conv_styles ?? (q2.length > 0 ? q2 : undefined),
    answered: Math.min(10, commAnswered),
  } : undefined;

  // 3. Social Rhythm
  const rhythmObj = (user as any).trait_social_rhythm !== undefined ? (user as any).trait_social_rhythm : (user as any).social_rhythm;
  const rhythmAnswered = rhythmObj !== undefined
    ? (rhythmObj?.answered ?? 0)
    : (q5Avail.length > 0 || q5Rhythm ? 6 : ((saturdayVal ? 3 : 0) + (tripVal !== null ? 2 : 0)));

  const planning_horizon = typeof q5Rhythm === 'string'
    ? (q5Rhythm.includes('Spontaneous') ? 0.2 : 0.8)
    : (typeof q5Rhythm === 'number' ? q5Rhythm : (saturdayVal?.planning_horizon));

  const social_rhythm = rhythmAnswered > 0 ? {
    user_id: userId,
    availability: rhythmObj?.availability ?? (q5Avail.length > 0 ? q5Avail : undefined),
    fri_night: rhythmObj?.fri_night !== undefined ? Boolean(rhythmObj.fri_night) : (user as any).fri_night,
    sat_night: rhythmObj?.sat_night !== undefined ? Boolean(rhythmObj.sat_night) : (user as any).sat_night,
    planning_horizon: rhythmObj?.planning_horizon ?? planning_horizon,
    social_freq_self: rhythmObj?.social_freq_self,
    social_freq_expect: rhythmObj?.social_freq_expect,
    preferred_duration: rhythmObj?.preferred_duration,
    energy_peak: rhythmObj?.energy_peak,
    answered: Math.min(5, rhythmAnswered),
  } : undefined;

  // 4. Intent
  const intentObj = (user as any).trait_intent !== undefined ? (user as any).trait_intent : (user as any).intent;
  const intentAnswered = intentObj !== undefined
    ? (intentObj?.answered ?? 0)
    : (q1.length > 0 ? 5 : (deep.friendshipPillars ? 3 : 0));

  const intent = intentAnswered > 0 ? {
    user_id: userId,
    intents: intentObj?.intents ?? (q1.length > 0 ? q1 : undefined),
    depth: intentObj?.depth ?? (q1.some((f: string) => f.includes('inner circle') || f.includes('close')) ? 4 : (q1.length > 0 ? 2 : undefined)),
    open_to_hosting: intentObj?.open_to_hosting,
    answered: intentAnswered,
  } : undefined;

  // 5. Emotional
  const emoObj = (user as any).trait_emotional !== undefined ? (user as any).trait_emotional : (user as any).emotional;
  const emotionalAnswered = emoObj !== undefined
    ? (emoObj?.answered ?? 0)
    : (q7Pacing || q8Qualities.length > 0 ? 6 : (supportVal !== null ? 5 : 0));

  const er_opening_pace = typeof q7Pacing === 'string'
    ? (q7Pacing.toLowerCase().includes('open book') || q7Pacing.toLowerCase().includes('fast') ? 0.8 : 0.4)
    : (typeof q7Pacing === 'number' ? q7Pacing : undefined);

  const emotional = emotionalAnswered > 0 ? {
    user_id: userId,
    er_opening_pace: emoObj?.er_opening_pace ?? er_opening_pace,
    er_cadence_need: emoObj?.er_cadence_need,
    er_cadence_expect: emoObj?.er_cadence_expect,
    er_reassurance_need: emoObj?.er_reassurance_need,
    er_reassurance_offer: emoObj?.er_reassurance_offer,
    er_recovery_time: emoObj?.er_recovery_time,
    er_conflict_approach: emoObj?.er_conflict_approach,
    expressiveness: emoObj?.expressiveness,
    vulnerability_comfort: emoObj?.vulnerability_comfort,
    affection: emoObj?.affection,
    advice_vs_listening_self: emoObj?.advice_vs_listening_self ?? supportVal,
    advice_vs_listening_expect: emoObj?.advice_vs_listening_expect ?? supportVal,
    reliability_self: emoObj?.reliability_self ?? (q8Qualities.some((q: string) => q.includes('Reliability')) ? 0.9 : undefined),
    reliability_expect: emoObj?.reliability_expect,
    boundary_clarity: emoObj?.boundary_clarity,
    answered: emotionalAnswered,
  } : undefined;

  // 6. Lifestyle
  const lifeObj = (user as any).trait_lifestyle !== undefined ? (user as any).trait_lifestyle : (user as any).lifestyle;
  const lifestyleAnswered = lifeObj !== undefined
    ? (lifeObj?.answered ?? 0)
    : (deep.budgetPref ? 5 : 0);

  const lifestyle = lifestyleAnswered > 0 ? {
    user_id: userId,
    budget_band: lifeObj?.budget_band,
    alcohol: lifeObj?.alcohol,
    smoking: lifeObj?.smoking,
    activity_level: lifeObj?.activity_level,
    travel_frequency: lifeObj?.travel_frequency,
    life_stage: lifeObj?.life_stage,
    work_schedule: lifeObj?.work_schedule,
    food_prefs: lifeObj?.food_prefs,
    pets: lifeObj?.pets,
    accessibility_needs: lifeObj?.accessibility_needs,
    dealbreakers: lifeObj?.dealbreakers,
    answered: lifestyleAnswered,
  } : undefined;

  // 7. Experience
  const expObj = (user as any).trait_experience !== undefined ? (user as any).trait_experience : (user as any).experience;
  const expAnswered = expObj !== undefined
    ? (expObj?.answered ?? 0)
    : (q3GroupSize ? 4 : (groupSizeVal !== null ? 4 : 0));
  const group_size_pref = typeof q3GroupSize === 'string'
    ? (q3GroupSize.toLowerCase().includes('1-on-1') || q3GroupSize.toLowerCase().includes('1-2') || q3GroupSize.toLowerCase().includes('one') ? 0.2 : q3GroupSize.toLowerCase().includes('3-4') ? 0.4 : 0.6)
    : (typeof q3GroupSize === 'number' ? q3GroupSize : groupSizeVal);

  const experience = expAnswered > 0 ? {
    user_id: userId,
    settings: expObj?.settings ?? (q6Outings.length > 0 ? q6Outings : undefined),
    group_size_pref: expObj?.group_size_pref ?? group_size_pref,
    orientation: expObj?.orientation,
    novelty: expObj?.novelty ?? saturdayVal?.novelty,
    answered: expAnswered,
  } : undefined;

  // 8. Geography
  const geoObj = (user as any).trait_geography !== undefined ? (user as any).trait_geography : (user as any).geography;
  const homeArea = user.homeArea || (user as any).home_area;
  const geographyAnswered = geoObj !== undefined
    ? (geoObj?.answered ?? 0)
    : (homeArea ? 2 : 0);
  const geography = geographyAnswered > 0 ? {
    user_id: userId,
    home_area: geoObj?.home_area || homeArea || 'Singapore',
    radius_minutes: geoObj?.radius_minutes || { coffee: 30, dining: 45 },
    answered: geographyAnswered,
  } : undefined;

  // 9. Interests (from Q6 Outings)
  const interests = q6Outings.length > 0 ? q6Outings.map((name: string, idx: number) => ({
    node_id: String(idx + 1),
    node_name: name,
    node_path: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
  })) : ((user as any).user_interests || undefined);

  // 10. Values (from Q8 Qualities)
  const values = q8Qualities.length > 0 ? q8Qualities.map((val: string) => ({
    user_id: userId,
    value_key: val.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
    value_name: val,
    stance: 0.8,
    importance: 0.8,
    visibility: 'matching_only' as const,
  })) : ((user as any).user_values || undefined);

  const birthYear = user.birthYear ?? (user as any).birth_year;
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
    answers: { ...(user.deepProfile || {}), ...user },
  };

  rawVec.profile.confidence = Math.max(0, Math.min(1.0, completenessConfidence(rawVec)));

  return rawVec;
}

export function completenessConfidence(vec: ProfileVector): number {
  return confidenceFromCompleteness(vec);
}
