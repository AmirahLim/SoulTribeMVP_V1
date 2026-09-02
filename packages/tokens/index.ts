import colors from './colors.json';
import typography from './type.json';

export interface ThreadColorSpec {
  name: string;
  tone: 'amber' | 'emerald';
  wash: string;
  accent: string;
  surface: string;
  ink: string;
}

export const THREAD_COLORS: Record<string, ThreadColorSpec> = {
  personality: { name: 'Social Energy', tone: 'emerald', wash: 'rgba(91,217,154,0.13)', accent: colors.brand.emerald, surface: colors.glass.bg, ink: colors.ink.primary },
  communication: { name: 'Communication', tone: 'emerald', wash: 'rgba(91,217,154,0.10)', accent: colors.brand.emerald, surface: colors.glass.bg, ink: colors.ink.primary },
  intent: { name: 'Friendship Style', tone: 'amber', wash: 'rgba(239,185,78,0.11)', accent: colors.brand.amber, surface: colors.glass.bg, ink: colors.ink.primary },
  social_rhythm: { name: 'Social Rhythm', tone: 'amber', wash: 'rgba(239,185,78,0.13)', accent: colors.brand.amber, surface: colors.glass.bg, ink: colors.ink.primary },
  values: { name: 'Values', tone: 'amber', wash: 'rgba(239,185,78,0.10)', accent: colors.brand.amber, surface: colors.glass.bg, ink: colors.ink.primary },
  interests: { name: 'Interests', tone: 'emerald', wash: 'rgba(91,217,154,0.10)', accent: colors.brand.emerald, surface: colors.glass.bg, ink: colors.ink.primary },
  emotional: { name: 'Emotional Connection', tone: 'amber', wash: 'rgba(239,185,78,0.12)', accent: colors.brand.amber, surface: colors.glass.bg, ink: colors.ink.primary },
  lifestyle: { name: 'Play & Humour', tone: 'emerald', wash: 'rgba(91,217,154,0.12)', accent: colors.brand.emerald, surface: colors.glass.bg, ink: colors.ink.primary },
  experience: { name: 'Conversation', tone: 'emerald', wash: 'rgba(91,217,154,0.10)', accent: colors.brand.emerald, surface: colors.glass.bg, ink: colors.ink.primary },
};

export function getThreadColor(threadKeyOrName: string): ThreadColorSpec {
  const byKey = THREAD_COLORS[threadKeyOrName];
  if (byKey) return byKey;
  for (const spec of Object.values(THREAD_COLORS)) {
    if (spec.name.toLowerCase() === threadKeyOrName.toLowerCase()) return spec;
  }
  return THREAD_COLORS.personality;
}

export { colors, typography };
export type Colors = typeof colors;
export type Typography = typeof typography;
