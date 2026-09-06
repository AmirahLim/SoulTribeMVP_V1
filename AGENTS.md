# Soul Tribe — engineering instructions

Read `docs/00-current-product-direction.md` before the historical numbered specs.
The founder's current brief governs product intent; implementation details are not permanent product decisions.

## Current architecture

Next.js 16 App Router, React 19, TypeScript, Tailwind 3, Supabase Postgres/Auth/Storage.
Keep `packages/core` framework-independent. Preserve working infrastructure and database identities.
Read the relevant installed Next.js guide in `node_modules/next/dist/docs` before changing framework integration.

## Confirmed requirements

- Friendship-first, intentional real-world outings. No swiping, unsolicited stranger DMs, infinite feeds, popularity scores or public numerical compatibility.
- Social Signature is the personal profile; Connection Notes is the pair explanation. Legacy route/component identifiers need not be renamed.
- Eight baseline questions in the current implementation, with editable progressive answers. Do not invent answers or infer protected traits.
- Explicit answers outrank inference. Private values never enter matching; matching-only values never appear in explanations. No invented friction or deterministic psychological claims.
- Hosts curate join requests; invitees must accept invitations. Outing chat and precise public-venue logistics require confirmed membership.
- Block/report controls, private reflections, and neutral removal copy are required. Never notify someone that they were blocked.
- New visual surfaces use warm light grounds, deep forest ink and restrained earthy accents. Calm typography, whitespace, accessible controls and reduced motion take priority over decoration.
- Success means meaningful friendships continuing, including outside the app. Persistent artifacts can support this; they are not a mandatory reason for every feature.

## Implementation recommendations, not settled policy

Capacity is per outing with `host_policy` defaults. The former six-person free-tier ceiling is superseded.
Invitations currently do not reserve seats. Acceptance locks the outing row and checks remaining capacity.
Reflections are optional inputs to a small bounded repeat-preference boost only after the author opts in. They never change self-reported traits.
Private home venues are disabled by the logistics schema. Waitlist automation, venue-rule expansion, community verification and payments remain open.

## Working rules

Use additive migrations and reversible changes. Pair frontend changes with their required database migration.
Do not silently backfill legacy browser profiles: sample answers had uncertain provenance.
Full original answers belong in `profile_answers`, not publicly readable `profiles`.
Run `npm run typecheck`, `npm test`, and `npm run test:db`. Database security tests use local PGlite with Supabase auth/storage schema shims; staging Supabase and real concurrent-client checks remain a release gate.
Do not claim production verification from local tests. Keep deployment, historical data remediation and open product decisions explicit in the implementation report.
