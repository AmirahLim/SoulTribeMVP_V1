export const LEVEL_5_BLOCKED_TERMS = [
  'attachment style',
  'anxious attachment',
  'avoidant attachment',
  'secure attachment',
  'personality disorder',
  'narcissism',
  'narcissist',
  'mental health',
  'depression',
  'anxiety disorder',
  'trauma',
  'childhood',
  'emotional availability',
  'emotionally unavailable',
  'empathy level',
  'low empathy',
  'lack of empathy',
  'intelligence',
  'motive',
  'manipulation',
  'gaslighting',
] as const;

/**
 * Level 5 Blocklist Guard — Hard Gate.
 * Enforces that no emitted text asserts or implies attachment styles, mental health,
 * emotional availability, childhood trauma, or motives.
 */
export function containsLevel5Violation(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return LEVEL_5_BLOCKED_TERMS.some((term) => lower.includes(term));
}

export function assertNoLevel5Violations(text: string): void {
  if (containsLevel5Violation(text)) {
    throw new Error(`[SoulTribe Level 5 Blocklist Violation] Emitted text contains prohibited psychological/motive assertion: "${text}"`);
  }
}
