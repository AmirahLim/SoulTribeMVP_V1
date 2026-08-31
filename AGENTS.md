# AGENTS.md — Soul Tribe

You are building **Soul Tribe**, a friendship-first social platform for adults in Singapore.
Read this file first, then `docs/01-product-brief.md`. Do not start writing code until you have
read `01`, `02` (design system), and `04` (matching spec).

---

## Non-negotiables

1. **The design law.** Every feature must produce a *persistent artifact* that a group chat
   cannot replicate. If a feature you are building could be replaced by "just message each other
   in WhatsApp", it is wrong. Outings produce Outing Records. Profiles produce a Friendship DNA.
   Post-outing feedback produces a Rhythm Check that visibly changes future matching.

2. **This is not a dating app and it must never read like one.** No swiping. No hot-or-not.
   No "98% match". No streaks that punish. No red/green scoring of human beings.

3. **The design must not look like a landing-page template.** Read `docs/02-design-system.md`
   in full, including the anti-patterns section, before writing a single component. Stacked
   full-width sections, centered hero → three equal cards → centered CTA, default shadcn grey,
   and generic gradients are all explicit failures. The visual target is the illustrated,
   light, layered, world-building feel in `reference-99peaks-light.jpg`.

4. **Never expose raw compatibility numbers to users.** Scores exist internally for ranking.
   Users see language and shape, never "87%". See `04-matching-spec.md` §9.

5. **Always show friction.** Every match explanation must include at least one honest
   "where you might rub". A match card with only positives is a bug, not a nice surprise.

6. **Free-tier outings are capped at 6 participants including the host.** This is enforced
   in the database (a CHECK/trigger), in the API, and in the UI. Not just the UI.

---

## Tech decisions (already made — do not re-litigate)

| Area | Decision |
|---|---|
| Shape | Monorepo, web MVP now, native app later |
| Web | Next.js 15 (App Router), TypeScript strict, Tailwind v4, installable PWA |
| Native (later) | Expo / React Native — reuses `packages/core` and `packages/tokens` unchanged |
| Backend | Supabase — Postgres, Auth (magic link + Apple), Storage, Row Level Security |
| Matching | Pure TypeScript in `packages/core/matching` — no framework imports, no DB imports |
| AI | Frontier-tier model for match explanations and trust & safety only. Cheaper mid-tier model for bulk text (interest normalisation, tag cleanup). Never send raw psychometric vectors to the model — send derived, human-readable summaries. |
| Motion | Framer Motion (web), Reanimated (native later) |
| Illustration | SVG, authored as components, animated with CSS/Framer. No raster hero art. |

### Monorepo layout

```
soul-tribe/
├─ apps/
│  └─ web/                 Next.js 15 app
├─ packages/
│  ├─ core/                Pure TS. Matching, scoring, types, validation, copy generation.
│  │  ├─ matching/         Scoring engine — 100% unit tested, zero side effects
│  │  ├─ domain/           Entities and Zod schemas shared by web and native
│  │  └─ explain/          Match-explanation prompt building + templates
│  ├─ tokens/              Design tokens as JSON → generates Tailwind theme + RN StyleSheet
│  └─ ui/                  Web components (native gets its own package later)
├─ supabase/
│  ├─ migrations/
│  └─ seed/                Seed 40 synthetic profiles for matching QA
└─ docs/                   The files in this pack
```

**Rule:** `packages/core` must have zero dependencies on React, Next, or Supabase. It takes
plain objects in and returns plain objects out. This is what makes the native app cheap later.

---

## How to work

- **Build in the order given in `docs/07-build-order.md`.** It is sequenced so that something
  demoable exists at the end of every milestone.
- **Write the matching engine test-first.** `packages/core/matching` should have a test suite
  built from the worked examples in `04-matching-spec.md` §10 before the implementation exists.
- **Seed data before UI.** Generate 40 synthetic profiles spanning the trait space
  (`supabase/seed/`) so match screens have real variance to render, not lorem ipsum.
- **Component before page.** Build the design-system primitives in `packages/ui` from
  `02-design-system.md`, then assemble screens. Do not write one-off Tailwind soup in pages.
- **Every screen gets a real empty state, loading state, and error state.** Empty states are
  illustrated, not grey boxes with text.

## When you are unsure

Prefer the choice that makes the product feel more *human and specific* and less *generic and
optimised*. Soul Tribe's whole thesis is that friendship software fails when it feels like a
marketplace. If a decision would make it feel more like a marketplace, take the other one.
