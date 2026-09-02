import colors from './colors.json';
import typography from './type.json';

export type LuminousKey = keyof typeof colors.luminous;

export interface ThreadColorSpec {
  name: string;
  luminousKey: LuminousKey;
  surface: string;
  ink: string;
}

export const THREAD_COLORS: Record<string, ThreadColorSpec> = {
  personality: { name: 'Social Energy', luminousKey: 'sage', surface: colors.luminous.sage.surface, ink: colors.luminous.sage.ink },
  experience: { name: 'Conversation', luminousKey: 'sky', surface: colors.luminous.sky.surface, ink: colors.luminous.sky.ink },
  emotional: { name: 'Emotional Connection', luminousKey: 'peach', surface: colors.luminous.peach.surface, ink: colors.luminous.peach.ink },
  communication: { name: 'Communication', luminousKey: 'mint', surface: colors.luminous.mint.surface, ink: colors.luminous.mint.ink },
  intent: { name: 'Friendship Style', luminousKey: 'lavender', surface: colors.luminous.lavender.surface, ink: colors.luminous.lavender.ink },
  social_rhythm: { name: 'Social Rhythm', luminousKey: 'butter', surface: colors.luminous.butter.surface, ink: colors.luminous.butter.ink },
  lifestyle: { name: 'Play & Humour', luminousKey: 'rose', surface: colors.luminous.rose.surface, ink: colors.luminous.rose.ink },
  values: { name: 'Values', luminousKey: 'cream', surface: colors.luminous.cream.surface, ink: colors.luminous.cream.ink },
  interests: { name: 'Interests', luminousKey: 'seafoam', surface: colors.luminous.seafoam.surface, ink: colors.luminous.seafoam.ink },
};

export const THREAD_COLORS_BY_NAME: Record<string, ThreadColorSpec> = {
  'Social Energy': THREAD_COLORS.personality,
  'Conversation': THREAD_COLORS.experience,
  'Emotional Connection': THREAD_COLORS.emotional,
  'Communication': THREAD_COLORS.communication,
  'Friendship Style': THREAD_COLORS.intent,
  'Social Rhythm': THREAD_COLORS.social_rhythm,
  'Play & Humour': THREAD_COLORS.lifestyle,
  'Values': THREAD_COLORS.values,
  'Lifestyle': { name: 'Lifestyle', luminousKey: 'oat', surface: colors.luminous.oat.surface, ink: colors.luminous.oat.ink },
  'Interests': THREAD_COLORS.interests,
};

export function getThreadColor(threadKeyOrName: string): ThreadColorSpec {
  const byKey = THREAD_COLORS[threadKeyOrName];
  if (byKey) return byKey;
  const byName = THREAD_COLORS_BY_NAME[threadKeyOrName];
  if (byName) return byName;
  return THREAD_COLORS.personality;
}

export { colors, typography };
export type Colors = typeof colors;
export type Typography = typeof typography;
