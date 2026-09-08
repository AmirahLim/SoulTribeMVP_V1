# Answer provenance and explanation caching

## Stored answers
New onboarding page submissions send answerContractVersion=1 and submittedStep.
The database records only questions confirmed on that page in
profile_answers.onboarding.baselineV2.answerRecords after the authenticated,
transactional draft claim. Each record contains questionId, questionVersion,
questionText, exact answer fields, optionId/value/displayed label, submittedAt,
and timestampSource=database_received. This is receipt time, not an inferred
historical answering time.

The committed onboardingQuestionCatalog.json and SQL catalog must agree.
Never renumber existing option IDs. A wording/option meaning change needs a new
question version and an additive catalog/contract migration. Older answers
remain literal and unversioned until actually submitted through this contract.
The browser cannot supply trusted provenance timestamps. Unchanged stored
records retain their timestamp; changing an answer removes stale provenance
until the relevant page is submitted again.

The original 8KB literal-answer bound remains. Generated metadata has a separate
32KB envelope limit so account claiming and Early Read corrections still work.
No historical data backfill is included.

## Matching
The authenticated matches route loads independent tables concurrently, scores
eligible candidates, sorts, then shortlists using the requested limit (default
20, valid 1–200). Only shortlisted candidates receive explanations. Existing
client-facing array shape and provisional ranking rules remain unchanged.
The candidate fetch is still capped at 200 active profiles; this is not a
whole-database pagination implementation.

Matches and the individual bond endpoint share the directed pair cache.
A hit requires both profile versions, both explanation revisions, the explicit
explanation engine version, and a SHA-256 digest of the public explanation inputs.
Bump EXPLANATION_ENGINE_VERSION when composition or disclosure rules change.
Private values are removed before hashing and generation.

Database triggers invalidate both directions after profile, answer, trait,
interest/value, block, or report changes. Snapshot validation rejects stale
writes with PostgreSQL 40001. Callers see a retryable error, not an empty result.
The cache retains RLS and is not directly readable/writable by browser roles;
authenticated server endpoints check current safety before using it.

## Measurement and verification
/api/matches returns no-store plus Server-Timing for scoring, explanation
lookup/generation work, cache reads/writes, and total handler time. It also
returns X-Match-Cache-Hits, X-Match-Generated and X-Match-Eligible.
The browser logs these aggregate values without member answers or identifiers.
recommendations_generated events persist the candidate funnel and timing
aggregate. Their total_ms ends before the timing-audit insert; the response
Server-Timing total includes that insert.

Run npm run typecheck, npm test, npm run test:db, and npm run build.
Local database tests cover exact seven-step provenance claim, no backfill,
forged-metadata stripping, ownership/RLS, repeatable migrations, bilateral
invalidation and stale/safety cache rejection.
Production verification must additionally load an existing signed-in member
twice, check cold/warm counts and actual cache rows, and observe a genuine new
member submission before claiming live provenance transfer was verified.
Do not generate or submit production fixture answers to obtain that evidence.
