import { DimensionKey, nextBestQuestions } from '@soul-tribe/core';
import type { UserProfileData } from './userStore';
import { toProfileVector } from './profileAdapter';

export interface DimensionPromptInfo {
  dimension: DimensionKey;
  label: string;
  copy: string;
  categoryNum: number;
  href: string;
}

export const DIMENSION_PROMPT_MAP: Record<DimensionKey, Omit<DimensionPromptInfo, 'dimension'>> = {
  communication: {
    label: 'Communication Style',
    copy: 'Answering a few questions about how you communicate would sharpen your matches most.',
    categoryNum: 2,
    href: '/you/deeper?cat=2',
  },
  personality: {
    label: 'Personality & Vibe',
    copy: 'Sharing how you recharge and handle social energy will bring clearer resonance.',
    categoryNum: 5,
    href: '/you/deeper?cat=5',
  },
  social_rhythm: {
    label: 'Social Rhythm',
    copy: 'Adding your preferred outing frequency and group size will hone your recommendations.',
    categoryNum: 4,
    href: '/you/deeper?cat=4',
  },
  intent: {
    label: 'Friendship Intent',
    copy: 'Clarifying what you hope to build will connect you with aligned members.',
    categoryNum: 3,
    href: '/you/deeper?cat=3',
  },
  emotional: {
    label: 'Emotional Support',
    copy: 'Sharing how you offer and receive support deepens match fidelity.',
    categoryNum: 9,
    href: '/you/deeper?cat=9',
  },
  interests: {
    label: 'Interests & Passions',
    copy: 'Adding a couple more interests unlocks shared-activity matches.',
    categoryNum: 7,
    href: '/you/deeper?cat=7',
  },
  values: {
    label: 'Core Values',
    copy: 'Highlighting your core friendship values sharpens your fit score.',
    categoryNum: 6,
    href: '/you/deeper?cat=6',
  },
  lifestyle: {
    label: 'Outing DNA & Lifestyle',
    copy: 'Describing your ideal weekend outing makes match recommendations more specific.',
    categoryNum: 8,
    href: '/you/deeper?cat=8',
  },
  experience: {
    label: 'Spontaneity & Stage',
    copy: 'Sharing your openness to spontaneous plans fine-tunes your rhythm checks.',
    categoryNum: 1,
    href: '/you/deeper?cat=1',
  },
  geography: {
    label: 'Home Area & Distance',
    copy: 'Setting your preferred SG neighbourhood refines local logistics matching.',
    categoryNum: 10,
    href: '/you/deeper?cat=10',
  },
};

/**
 * Returns active next-best question prompts for a user profile.
 * Only returns items if the dimension is genuinely incomplete (ratio < 1.0).
 * If all dimensions are 100% complete, returns [].
 */
export function getActiveNextBestPrompts(profile: UserProfileData, limit: number = 2): DimensionPromptInfo[] {
  if (profile.passCompletionPct >= 100) {
    return [];
  }
  const vec = toProfileVector(profile);
  const dimKeys = nextBestQuestions(vec, limit);

  const activePrompts: DimensionPromptInfo[] = [];

  for (const key of dimKeys) {
    let ratio = 1;
    if (key === 'personality') ratio = Math.min(1, (vec.personality?.answered ?? 0) / 10);
    else if (key === 'communication') ratio = Math.min(1, (vec.communication?.answered ?? 0) / 10);
    else if (key === 'social_rhythm') ratio = Math.min(1, (vec.social_rhythm?.answered ?? 0) / 5);
    else if (key === 'intent') ratio = Math.min(1, (vec.intent?.answered ?? 0) / 3);
    else if (key === 'emotional') ratio = Math.min(1, (vec.emotional?.answered ?? 0) / 10);
    else if (key === 'interests') ratio = Math.min(1, (vec.interests?.length ?? 0) / 3);
    else if (key === 'values') ratio = Math.min(1, (vec.values?.length ?? 0) / 3);
    else if (key === 'lifestyle') ratio = Math.min(1, (vec.lifestyle?.answered ?? 0) / 5);
    else if (key === 'experience') ratio = Math.min(1, (vec.experience?.answered ?? 0) / 5);
    else if (key === 'geography') ratio = Math.min(1, (vec.geography?.answered ?? 0) / 2);

    if (ratio < 1.0) {
      const info = DIMENSION_PROMPT_MAP[key];
      if (info) {
        activePrompts.push({
          dimension: key,
          ...info,
        });
      }
    }
  }

  return activePrompts;
}
