import colors from './colors.json';

export { colors };

export interface ThreadColorSpec {
  name: string;
  tone: 'amber' | 'emerald';
  wash: string;
  accent: string;
  surface: string;
  ink: string;
}

export const THREAD_COLORS: Record<string, ThreadColorSpec> = {
  personality: { name: 'Social Energy', tone: 'emerald', wash: 'rgba(45,82,62,0.20)', accent: colors.brand.emerald, surface: colors.glass.bg, ink: colors.ink.primary },
  communication: { name: 'Communication', tone: 'emerald', wash: 'rgba(45,82,62,0.20)', accent: colors.brand.emerald, surface: colors.glass.bg, ink: colors.ink.primary },
  social_rhythm: { name: 'Social Rhythm', tone: 'amber', wash: 'rgba(239,185,78,0.13)', accent: colors.brand.amber, surface: colors.glass.bg, ink: colors.ink.primary },
  intent: { name: 'Friendship Style', tone: 'amber', wash: 'rgba(239,185,78,0.13)', accent: colors.brand.amber, surface: colors.glass.bg, ink: colors.ink.primary },
  emotional: { name: 'Emotional Connection', tone: 'amber', wash: 'rgba(239,185,78,0.13)', accent: colors.brand.amber, surface: colors.glass.bg, ink: colors.ink.primary },
  interests: { name: 'Interests', tone: 'emerald', wash: 'rgba(45,82,62,0.20)', accent: colors.brand.emerald, surface: colors.glass.bg, ink: colors.ink.primary },
  values: { name: 'Values', tone: 'amber', wash: 'rgba(239,185,78,0.13)', accent: colors.brand.amber, surface: colors.glass.bg, ink: colors.ink.primary },
  lifestyle: { name: 'Play & Humour', tone: 'emerald', wash: 'rgba(45,82,62,0.20)', accent: colors.brand.emerald, surface: colors.glass.bg, ink: colors.ink.primary },
  experience: { name: 'Conversation', tone: 'emerald', wash: 'rgba(45,82,62,0.20)', accent: colors.brand.emerald, surface: colors.glass.bg, ink: colors.ink.primary },
  logistics: { name: 'Availability', tone: 'amber', wash: 'rgba(239,185,78,0.13)', accent: colors.brand.amber, surface: colors.glass.bg, ink: colors.ink.primary },
};

export function getThreadColor(key: string): ThreadColorSpec {
  return THREAD_COLORS[key] || THREAD_COLORS.personality;
}
