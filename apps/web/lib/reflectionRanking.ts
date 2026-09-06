// Versioned implementation hypothesis. Direct private preferences, never inferred traits.
export const REFLECTION_RANKING_VERSION = 'repeat-preference-v1';
export const MAX_REFLECTION_BOOST = 0.03;
export function reflectionBoost(
  enabled: boolean,
  candidateId: string,
  checks: { about_id: string; would_meet_again: number }[],
): number {
  if (!enabled) return 0;
  const own = checks.filter(
    (c) => c.about_id === candidateId && Number.isFinite(c.would_meet_again),
  );
  if (!own.length) return 0;
  const mean = own.reduce((sum, c) => sum + c.would_meet_again, 0) / own.length;
  return Math.min(
    MAX_REFLECTION_BOOST,
    Math.max(0, ((mean - 3) / 2) * MAX_REFLECTION_BOOST),
  );
}
