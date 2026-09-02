export interface ThreadWeights {
  personality: number; // base 15
  communication: number; // base 15
  social_rhythm: number; // base 15
  intent: number; // base 15
  emotional: number; // base 10
  interests: number; // base 10
  values: number; // base 8
  lifestyle: number; // base 7
  experience: number; // base 3
  geography: number; // base 2
}

export const BASE_WEIGHTS: ThreadWeights = {
  personality: 15,
  communication: 15,
  social_rhythm: 15,
  intent: 15,
  emotional: 10,
  interests: 10,
  values: 8,
  lifestyle: 7,
  experience: 3,
  geography: 2,
};

export function getOutingContextualWeights(
  category?: 'coffee' | 'dining' | 'active' | 'cultural' | 'nightlife' | 'creative' | 'intellectual',
  hasInterestMatch?: boolean
): ThreadWeights {
  if (!category) return BASE_WEIGHTS;

  const multipliers: Record<string, Partial<ThreadWeights>> = {
    coffee: { geography: 2.5, lifestyle: 1.0, experience: 2.0, communication: 1.2, social_rhythm: 1.0 },
    dining: { geography: 1.5, lifestyle: 2.0, experience: 2.0, communication: 1.0, social_rhythm: 1.0 },
    active: { geography: 3.0, lifestyle: 2.0, experience: 2.5, communication: 0.6, social_rhythm: 1.2 },
    cultural: { geography: 1.5, lifestyle: 1.0, experience: 3.0, communication: 1.0, social_rhythm: 1.0 },
    nightlife: { geography: 1.5, lifestyle: 3.0, experience: 3.0, communication: 0.8, social_rhythm: 1.5 },
    creative: { geography: 1.5, lifestyle: 1.5, experience: 2.5, communication: 1.0, social_rhythm: 1.0 },
    intellectual: { geography: 1.5, lifestyle: 1.5, experience: 2.5, communication: 1.5, values: 1.5 },
  };

  const mult = multipliers[category] || {};
  const raw: ThreadWeights = {
    personality: BASE_WEIGHTS.personality,
    communication: BASE_WEIGHTS.communication * (mult.communication ?? 1.0),
    social_rhythm: BASE_WEIGHTS.social_rhythm * (mult.social_rhythm ?? 1.0),
    intent: BASE_WEIGHTS.intent,
    emotional: BASE_WEIGHTS.emotional,
    interests: BASE_WEIGHTS.interests * (hasInterestMatch ? 2.0 : 1.0),
    values: BASE_WEIGHTS.values,
    lifestyle: BASE_WEIGHTS.lifestyle * (mult.lifestyle ?? 1.0),
    experience: BASE_WEIGHTS.experience * (mult.experience ?? 1.0),
    geography: BASE_WEIGHTS.geography * (mult.geography ?? 1.0),
  };

  // Renormalise sum to 100
  const sum = Object.values(raw).reduce((acc, val) => acc + val, 0);
  const scale = 100 / sum;

  return {
    personality: raw.personality * scale,
    communication: raw.communication * scale,
    social_rhythm: raw.social_rhythm * scale,
    intent: raw.intent * scale,
    emotional: raw.emotional * scale,
    interests: raw.interests * scale,
    values: raw.values * scale,
    lifestyle: raw.lifestyle * scale,
    experience: raw.experience * scale,
    geography: raw.geography * scale,
  };
}
