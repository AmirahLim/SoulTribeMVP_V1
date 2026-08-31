# 02 — Design System

**Read this before writing any component.** The single most common failure mode for this
product is a competent-but-generic interface: stacked full-width sections, centred headline,
three equal cards, a gradient, a CTA. That is a slide deck, not a product. This document exists
to prevent it.

---

## 1. The visual target

Look at `reference-99peaks-light.jpg`. What makes it work is not the colour — it's four
structural moves:

1. **A world, not a background.** The screen sits inside an illustrated place with depth
   (mountains receding, atmospheric haze). The UI is *in* the world, not on top of a colour.
2. **Layered, overlapping, off-axis cards.** Device frames overlap each other at an angle and
   break the grid. Nothing is centred and evenly spaced.
3. **Light ground, high-contrast ink.** Airy and open, with type doing the heavy lifting.
4. **Visible progress as terrain.** "16/99 peaks", a map you fill in. Achievement is
   *spatial*, not a progress bar.

We take all four. We do **not** take its cool blue palette — Soul Tribe is warm. The formula is:

> **99 Peaks' structure and world-building, run on Soul Tribe's warm palette,
> with organic hand-drawn forms instead of corporate geometry.**

(`reference-sonar-dark.jpg` is kept in the pack for one reason only: the *depth and layering*
of its overlapping device shots. Ignore its dark palette entirely.)

---

## 2. Colour

Tokens live in `packages/tokens/colors.json` and generate both the Tailwind theme and, later,
the React Native StyleSheet. Never hardcode a hex in a component.

### Ground (backgrounds)
| Token | Hex | Use |
|---|---|---|
| `ground.paper` | `#FCF8F3` | Default page background — warm paper, never pure white |
| `ground.sand` | `#F5EDE1` | Secondary surfaces, inset panels |
| `ground.card` | `#FFFDFA` | Raised cards — lighter than the page, this is what makes them float |
| `ground.mist` | `#EDF2F0` | Cool counterpoint for illustrated skies and map washes |

### Ink (text)
| Token | Hex | Use |
|---|---|---|
| `ink.espresso` | `#2B211B` | Primary text, display type |
| `ink.bark` | `#5C4E44` | Secondary text |
| `ink.stone` | `#8A7D73` | Meta, timestamps, labels |
| `ink.chalk` | `#FFFDFA` | Text on accent fills |

### Accents
| Token | Hex | Use |
|---|---|---|
| `accent.terracotta` | `#D9663F` | Primary action. Buttons, active nav, key emphasis. |
| `accent.sage` | `#3E6B5C` | Nature/map illustration, confirmed states, "this happened" |
| `accent.amber` | `#EFA93C` | Progress, warmth highlights, streak-free celebration |
| `accent.sky` | `#A9C9D6` | Illustration mid-ground, calm/quiet signals |
| `accent.clay` | `#B0836A` | **Friction.** Differences, tensions, "worth knowing" |

**Critical:** friction is `accent.clay`, a warm brown — never red. Difference between two people
is information, not an error. Nothing in this product uses a red/green judgement palette on a
human being.

### Semantic (system only, never applied to people)
`danger #B3453A` (destructive actions, report flows), `success #3E6B5C`, `warn #EFA93C`.

### Rules
- Warm shadows only: `rgba(74, 55, 42, 0.10)`. Never grey or black shadows on paper.
- No pure white (`#FFFFFF`) and no pure black anywhere in the UI.
- Maximum two accent colours visible in any single viewport, plus one illustration.
- Dark mode is **out of scope for v0.1.** Author tokens so it's addable, but do not build it.

---

## 3. Type

- **Display / headings:** Fraunces (variable — use the `SOFT` and `WONK` axes at
  `soft 60, wonk 1` for headlines; it gives the warmth that a default serif lacks).
- **UI / body:** Inter (or General Sans if licensing allows). Tight tracking on large sizes.
- **Numerals:** tabular figures for any data readout.

### Scale
| Role | Size / line | Font |
|---|---|---|
| Display L | 48/52, -0.02em | Fraunces 600 |
| Display M | 34/40, -0.015em | Fraunces 600 |
| Title | 24/30 | Fraunces 500 |
| Body L | 17/26 | Inter 400 |
| Body | 15/23 | Inter 400 |
| Meta | 13/18, +0.01em | Inter 500 |
| Label | 11/14, +0.08em, uppercase | Inter 600 |

**Contrast rule:** every screen must contain at least one Display-size element and at least one
Label-size element. Interfaces look like slide decks when everything is 16–24px.

**Alignment rule:** body text is left-aligned and ragged-right. Centre only single-line
headlines inside genuinely centred compositions (an empty state, a celebration moment). A
centred paragraph is a slide.

---

## 4. Form and space

- **Radii:** cards `24px`, inputs `16px`, chips/pills `999px`, illustrated panels `28px`.
- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 72, 112. Use the large end generously — the
  reference breathes.
- **Elevation** (warm, soft, layered):
  - `e1` cards: `0 1px 2px rgba(74,55,42,.06), 0 8px 24px -12px rgba(74,55,42,.18)`
  - `e2` floating/overlapping: `0 2px 4px rgba(74,55,42,.06), 0 24px 48px -20px rgba(74,55,42,.28)`
  - `e3` modals/sheets: `0 32px 64px -24px rgba(74,55,42,.35)`
- **Borders:** `1px solid rgba(74,55,42,.08)` — hairlines, never visible grey boxes.

---

## 5. Layout — how to avoid the slide

These are hard rules, not suggestions.

1. **Every primary screen has an illustrated ground.** A soft topographic wash, a horizon, a
   neighbourhood sketch — behind the content, low contrast, with a light-source direction that
   is consistent app-wide (upper left).
2. **Cards overlap and break the column.** At least one element per screen extends past the
   content gutter or overlaps the element above it by 12–32px. Off-axis rotation of `-1.5°` to
   `2°` on stacked/illustrated cards. Never on text inputs.
3. **No three-equal-cards row.** If you have three things, make one dominant. Asymmetry
   (`1.6fr / 1fr`) beats symmetry every time.
4. **No full-bleed colour bands stacked vertically.** Sections are distinguished by content
   rhythm and illustration, not by alternating background colours.
5. **The primary CTA is not centred at the bottom of a section.** It sits inline with content,
   or in a persistent floating action affordance.
6. **Content max-width 680px** for reading, but illustrated grounds and maps go edge to edge.
7. **Mobile-first.** Design at 390px, then let it breathe to 1024px. This is a phone product
   people use standing up.

---

## 6. Signature components

### 6.1 Friendship DNA Bloom
The user's profile portrait. **Not a bar chart, not a radar chart, not a percentage.**

An organic radial form: 8 petals, one per matching dimension, drawn as smooth bezier lobes.
Petal *length* encodes how strongly expressed the dimension is; petal *width* encodes how
confident we are (more onboarding answers = wider, more solid). Colour graded from
`accent.amber` at the centre through `accent.terracotta` to `accent.sage` at the outer edge.

- Animated draw-on over 900ms with staggered petals when first revealed.
- Tapping a petal reveals a **sentence**, never a number:
  *"You open up gradually and stay loyal once you're comfortable."*
- Two blooms can overlay translucently on a match screen — the overlap *is* the compatibility
  visualisation. This is the product's signature image. Get it right.

### 6.2 Resonance Read card
The match explanation. Always two parts, always in this order:

```
WHY YOU MIGHT CLICK          ← ink.espresso, Body L, 2–3 sentences
WHERE YOU MIGHT RUB          ← accent.clay label, Body, 1–2 sentences
```

The friction section is never collapsed, never behind a tap, never smaller than the positive
section. It carries a small hand-drawn "two lines crossing" mark, not a warning triangle.

### 6.3 Pitch Card
An outing proposal. Reads like a handwritten invitation, not an event listing.
Illustrated location vignette at top, title in Fraunces Display M, then a horizontal strip of
concrete facts as pills: `Sat 2 Nov · 3pm` `Tiong Bahru` `4 of 6 spots` `$20–50` `Conversation-first`.
Host avatar overlaps the vignette edge. Seat availability is shown as **filled and empty
chairs** — small illustrated glyphs — not "4/6".

### 6.4 Rhythm Strip
Weekly availability, rendered as a warm horizontal band of 7 columns × 4 rows (morning /
midday / evening / late). Filled cells are `accent.amber` washes with soft irregular edges, like
watercolour, not solid squares. On a match screen, *your* strip and *theirs* overlay and the
overlap glows — showing at a glance whether your lives can actually touch.

### 6.5 Tribe Map (simplified in v0.1)
An illustrated island/terrain with your circle placed on it. In v0.1 it is a static decorative
backdrop on the profile screen with your confirmed connections marked. In v0.3 it becomes
interactive. Build the SVG so nodes are already data-driven.

---

## 7. Illustration direction

- Hand-drawn, slightly imperfect line quality. Visible texture. Not vector-flat.
- A subtle paper grain overlay (`opacity .03`, tiled noise SVG) across illustrated grounds.
- Warm topographic contour lines as a recurring motif — dividers, card edges, empty states.
- **People are never illustrated as generic corporate figures.** Use abstract warm shapes,
  photography, or nothing. No flat-illustration mascots with oversized limbs.
- Empty states are always illustrated with a scene and one line of warm copy.

---

## 8. Motion

- Entry: staggered 40ms, `y: 12px → 0`, `opacity 0 → 1`, 380ms, `cubic-bezier(.2,.8,.2,1)`.
- Illustrated grounds parallax at 0.3× scroll speed. Content at 1×.
- The DNA Bloom draws on; it never fades in.
- Confirmation moments (outing confirmed, guest accepted) get a brief warm bloom of
  `accent.amber` from the point of interaction outward — 600ms, once, no confetti.
- `prefers-reduced-motion`: all of the above collapse to a 150ms opacity fade. Test it.

---

## 9. Accessibility

- All body text ≥ 4.5:1 against its ground. `ink.stone` on `ground.paper` passes; verify after
  any token change with an automated contrast test in CI.
- Never encode meaning in colour alone — the Bloom and Rhythm Strip both need text equivalents.
- Full keyboard navigation on web. Focus rings are `accent.terracotta` at 2px with 2px offset,
  never removed.
- Minimum touch target 44×44px.

---

## 10. Anti-patterns — do not ship any of these

| ❌ | Why it fails |
|---|---|
| Centred hero → 3 equal feature cards → centred CTA | The slide-deck layout. Instantly generic. |
| Full-width alternating colour bands down the page | Marketing-site rhythm, not product rhythm. |
| Default shadcn/Radix grey (`slate`, `zinc`) anywhere | Reads as unstyled. Every neutral must be warm. |
| Glassmorphism, mesh gradients, blurred blobs | Dated, and belongs to the cool-tech aesthetic we rejected. |
| Percentage match scores, star ratings on people | Violates the product's ethics. |
| Progress bars for the Friendship DNA | The Bloom replaces them. Bars are the PowerPoint look. |
| Emoji as UI iconography | Use drawn icons. Emoji is the fastest way to look unfinished. |
| Everything at 16–20px | No type contrast = no hierarchy = a slide. |
| Grey empty states with a sad-face icon | Every empty state is illustrated and warm. |
| Stock photography of diverse people laughing | Either real cohort photos or illustration. Nothing else. |

---

## 11. Definition of visual done

A screen is done when:
- it has a Display-size element, a Label-size element, and an illustrated ground;
- at least one element breaks the grid or overlaps another;
- no two accent colours compete for the same job;
- it looks correct at 390px wide *and* at 1024px;
- reduced-motion and keyboard-only both work;
- and a stranger shown a screenshot would not guess which framework built it.
