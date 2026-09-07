# Public preferences and provisional ranking

Supersedes the blanket exclusion of desired friend qualities and custom answers only after a member explicitly opts in using `baselineV2.answersPublic === true`. Previously private answers are not backfilled. The profile control previews the exact published fields and permits withdrawal. Date of birth, area, country, travel preference, legacy answers and arbitrary JSON keys are not part of this projection. Existing RLS still limits visibility to permitted signed-in members.

Migration 20260927 projects the allowed fields to `profiles.public_onboarding`. A guard blocks direct writes that disagree with the consented source. Missing/false/string consent publishes nothing. Withdrawal or source deletion clears the projection. Repeated migration application is supported.

The shared-preference score is a bounded positive boost, capped by `PUBLIC_PREFERENCE_MAX_BOOST` (0.03). It averages overlap across mutually answered dimensions. Custom text is compared literally after case/whitespace normalization; no semantic or personality inference is made. Desired friend qualities are shared preferences, not evidence that either person possesses those traits. Life-phase overlap remains a separate boost capped at 0.03. These are configurable ranking hypotheses, not public compatibility scores.

Discovery and Bond scoring opt into provisional ranking. Only the confidence-only case retains calculated rank; gate reasons, confidence values and provisional labels remain unchanged. Account, age, block/report, availability, geography and other gates still force zero when they fail. No signal fabricates a rank when the base evidence score is zero.

Saved outing interests now preserve database IDs, taxonomy paths and affinity instead of rebuilding them from display labels. Current TypeScript verification must use dependencies installed in this checkout; shared node_modules links can resolve an older core workspace.

Local typecheck, tests, database security checks and production build pass. Live member signup, withdrawal and matching remain required deployment verification. Kilometre filtering still requires mapped location data; no distance is inferred from text or substituted for missing data.
