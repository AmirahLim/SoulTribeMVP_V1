# Soul Tribe — Antigravity Context Pack

Drop this whole folder into your Antigravity workspace. `AGENTS.md` is the entry point — the
agent reads it first, then the numbered docs.

## Contents

| File | What it's for |
|---|---|
| `AGENTS.md` | Root agent instructions: non-negotiables, tech decisions, monorepo layout, how to work. **Read first.** |
| `docs/01-product-brief.md` | What Soul Tribe is, the design law, MVP scope, non-goals, success criteria |
| `docs/02-design-system.md` | The visual system + the anti-pattern list that kills the flat-slide look |
| `docs/03-data-model.md` | Postgres/Supabase schema, RLS, the 6-person cap trigger |
| `docs/04-matching-spec.md` | The 10-dimension engine: weights, scoring math, Emotional Rhythm, group cohesion, explanations |
| `docs/05-onboarding-question-bank.md` | Production-ready question copy mapped to schema fields, plus the trait→phrase copy bank |
| `docs/06-screens-and-flows.md` | Screen-by-screen, including the host-controlled pitch flow |
| `docs/07-build-order.md` | Milestones M0–M8, each ending in something demoable |
| `reference-99peaks-light.jpg` | **Primary visual reference** — structure, layering, illustrated world |
| `reference-sonar-dark.jpg` | Secondary — for depth/overlap of device shots only. Ignore its palette. |

## Suggested first prompt to Antigravity

> Read `AGENTS.md`, then `docs/01`, `docs/02`, and `docs/04` in full before writing any code.
> Then execute milestone M0 and M1 from `docs/07-build-order.md`. Build the matching engine
> test-first from the 12 test cases in `docs/04` §12. Do not write any UI in this pass.

Then, per milestone:

> Execute milestone M3 from `docs/07-build-order.md`. Before you start, re-read
> `docs/02-design-system.md` §10 (anti-patterns) and §11 (definition of visual done), and check
> each primitive against both before you consider it finished.

## Three things to hold Antigravity to

1. **The Bloom, not bars.** If it renders the Friendship DNA as progress bars or a radar chart,
   it has not read the design system. Send it back.
2. **Friction is mandatory.** Any match explanation without a "where you might rub" section is
   a bug.
3. **Six is enforced in Postgres.** UI-only caps don't count.

## Decisions already made (don't let the agent re-open them)

- Web PWA first (Next.js 15 + Supabase), native later via a shared `packages/core`
- Light + illustrated visual direction, warm palette — not dark, not cool-blue
- MVP = onboarding + matching + host-controlled pitching + outing artifacts. Flash Pods,
  Echo Room, and the interactive Tribe Map are deferred.
- Weights are fixed and sum to 100. Don't let it "simplify" the model — the dimensionality
  *is* the product.
