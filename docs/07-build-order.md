# 07 — Build Order

Sequenced so something demoable exists at the end of every milestone. Do not skip ahead —
in particular, do not build UI before the matching engine passes its tests, because the UI's
whole job is to render what the engine produces.

---

## M0 — Foundation (½ day)

- Turborepo: `apps/web`, `packages/core`, `packages/tokens`, `packages/ui`.
- Next.js 15 App Router, TypeScript strict, Tailwind v4, ESLint, Prettier, Vitest.
- Supabase project, local dev via CLI, first migration.
- `packages/tokens/colors.json` + `type.json` → generated Tailwind theme. Fonts loaded.
- CI: typecheck, lint, test, and a colour-contrast assertion on the token set.

**Done when:** a blank page renders on `ground.paper` with Fraunces and Inter loading correctly
and `pnpm test` runs green.

---

## M1 — Matching engine, headless (1–2 days)

Build `packages/core/matching` **test-first** from `04-matching-spec.md` §12.

- `gauss`, `expectationFit`, `setOverlap`, `graphAffinity`, `bandGap`.
- Per-dimension scorers with the exact δ/σ table from §4.
- `score(profileA, profileB, context) → { resonance, logistics, rank, gated, contributions }`.
- Gates (§6), confidence (§5), outing re-weighting (§7), group cohesion (§8).
- All 12 test cases passing.

**Done when:** `pnpm test --filter core` is green and a CLI script prints a ranked table for two
hand-written profiles. No UI yet.

---

## M2 — Schema, seed, and synthetic cohort (1 day)

- All migrations from `03-data-model.md`, RLS policies included.
- The outing-cap trigger, with a test that proves inserting a 7th member throws.
- Interest tree seeded (~250 nodes, 12 roots).
- Singapore planning-area travel-time matrix in `packages/core/geo/`.
- **40 synthetic profiles** spanning the trait space — include deliberate edge cases: a pair
  that's great on paper but never free, a depth-mismatch pair, a curiosity-bonus pair.

**Done when:** running the engine over the seeded cohort produces a plausible ranked list and
the audit breakdown for any pair can be printed.

---

## M3 — Design system primitives (1–2 days)

`packages/ui`, built against `02-design-system.md` before any page exists.

Priority order: `Bloom` · `RhythmStrip` · `ResonanceRead` · `PitchCard` · `Chip` · `Button` ·
`Sheet` · `IllustratedGround` · `EmptyState` · `SeatRow`.

The **Bloom** is the hardest and most important — build it first, as an SVG that takes 8
`{ strength, confidence }` values. Get the draw-on animation and the two-bloom overlay working.

**Done when:** a Storybook-style `/kitchen-sink` route shows every primitive at 390px and
1024px, with reduced-motion and keyboard focus verified.

---

## M4 — Auth and onboarding (2 days)

- Magic link + Apple sign-in; waitlist email → account conversion.
- Core 12-question pass, one idea per screen, Bloom thickening live.
- Confidence computed and stored; matching gated at 0.55.
- The reveal moment at the end of the Core pass.

**Done when:** a real person can sign up and reach a matching-eligible profile in under five
minutes, and the Bloom is visibly different for two different people.

---

## M5 — People and Resonance Reads (2 days)

- Weekly match computation job (max 5 surfaced per viewer per week).
- Explanation generation with the frontier model, cached, template fallback.
- Person card + person detail per `06` §4.
- The property test: no surfaced match without a non-empty friction section.

**Done when:** a user sees five people with reads that a human reviewer agrees are accurate,
including the friction.

---

## M6 — Pitch Outings with host control (2–3 days)

- The five-step composer per `06` §5.
- Candidate suggestion with outing-contextual re-weighting and one-line reasons.
- Live cohesion strip and advisory warnings.
- Cap enforced at DB, API, and UI. Invitations hold seats.
- Invite / accept / decline / request / approve / remove, with RLS enforcing host control.
- Confirmation flow.

**Done when:** two real accounts can go from pitch to confirmed outing, and a seventh invite is
impossible at every layer.

---

## M7 — Artifacts and safety (1–2 days)

- Outing Record: headline, photo, attendees.
- Rhythm Check at +24h, with the privacy copy.
- Recalibration job (learning rate 0.10, ±0.20 clamp, ≥3 observations) and the visible
  "what changed" surface.
- Report, block (bidirectional effect), host removal, T&S pass on free text.
- First-meeting guidance.

**Done when:** the loop closes — an outing happens, a record exists, and a user's matches
visibly shift as a result.

---

## M8 — Polish for the 30-person test (1–2 days)

- PWA manifest, icons, installability, offline shell.
- Every empty / loading / error state illustrated per `02` §10.
- Notification rules enforced (max 3/week, none with counts).
- Deepening passes A and B live.
- Analytics for the five success criteria in `01-product-brief.md`.
- Accessibility sweep: contrast, focus order, reduced motion, 44px targets.

**Done when:** the checklist in `02` §11 passes on every screen, and the success metrics are
instrumented.

---

## Deliberately deferred

Flash Pods, Echo Room, interactive Tribe Map, payments, native apps, group chat. The data model
already accommodates all of them; do not build them for the 30-person test.

---

## Review gates

Before M4, re-read `02-design-system.md` §10 and check the primitives against it.
Before M6, re-read `04-matching-spec.md` §8 — group cohesion is easy to get subtly wrong.
Before M8, re-read `01-product-brief.md` and confirm every shipped feature names its artifact.
