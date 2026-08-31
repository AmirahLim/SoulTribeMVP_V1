# 04 — Matching Spec

The engine lives in `packages/core/matching`. Pure TypeScript, no I/O, fully unit tested.
It takes two `ProfileVector` objects and a `MatchContext` and returns a `MatchResult`.

---

## 1. The core insight

Two people can be psychologically well suited and still fail as friends because their lives
never touch. So Soul Tribe computes **two independent scores** and never averages them into a
single number:

- **Resonance** — psychological fit. Would you enjoy each other?
- **Logistics** — practical fit. Can this friendship physically happen?

A high-Resonance / low-Logistics pair is a *bad recommendation*, not a near-miss. The UI shows
both, and the ranking punishes imbalance.

The second insight: **similar ≠ compatible.** Some dimensions reward similarity, some reward
mild complementarity, some are about matched *expectations* rather than matched behaviour.
Every trait declares which mode it uses. See §3.

---

## 2. Dimensions and weights

All weights sum to 100.

| # | Dimension | Weight | Group |
|---|---|---|---|
| 1 | Personality compatibility | 15 | Resonance |
| 2 | Communication compatibility | 15 | Resonance |
| 3 | Social rhythm | 15 | **Logistics** |
| 4 | Friendship needs & intentions | 15 | Resonance |
| 5 | Emotional / relational style | 10 | Resonance |
| 6 | Interests & curiosity graph | 10 | Resonance |
| 7 | Values & worldview | 8 | Resonance |
| 8 | Lifestyle compatibility | 7 | **Logistics** |
| 9 | Experience / outing compatibility | 3 | **Logistics** |
| 10 | Geography | 2 (+ hard gate) | **Logistics** |

**Resonance group total = 73.** Normalise within group: `R = Σ(wᵢ·sᵢ) / 73`
**Logistics group total = 27.** Normalise within group: `L = Σ(wⱼ·sⱼ) / 27`

Both `R, L ∈ [0,1]`.

### Ranking score

```
rank = R^0.6 × L^0.4          (geometric — a near-zero on either side collapses the result)
rank = rank × Π(gates)         (gates are 0 or 1, see §6)
```

Never display `rank`. It exists only to order the list.

---

## 3. Scoring modes

Every trait is scored 0–1 by exactly one of these five functions. All trait values are
normalised to `[0,1]` before scoring.

### 3.1 `gauss(a, b, δ, σ)` — similarity and complementarity, unified

```ts
const gauss = (a: number, b: number, delta = 0, sigma = 0.3) =>
  Math.exp(-Math.pow(Math.abs(a - b) - delta, 2) / (2 * sigma * sigma));
```

- `δ = 0` → **similarity**: peaks when the two people are identical.
- `δ > 0` → **complementarity**: peaks at a deliberate gap. A `δ = 0.2` trait scores best when
  the two people differ by about 20% of the scale — e.g. a moderate planner with a moderate
  improviser. Both extremes and perfect identity score lower.
- `σ` controls tolerance. Small σ = this trait matters a lot and mismatches hurt fast.

### 3.2 `expectationFit(behaviourA, expectationB, behaviourB, expectationA, σ)`

For anything where what matters is not "do you do the same thing" but "does what you do match
what the other person needs". This is the function most friendship apps are missing.

```ts
const expectationFit = (bA, eB, bB, eA, sigma = 0.2) =>
  Math.sqrt(gauss(bA, eB, 0, sigma) * gauss(bB, eA, 0, sigma));
```

Geometric mean, so a one-sided mismatch is not rescued by the other side being fine.
*Two people who both reply every two days and both expect that are highly compatible* — this
function is what captures that.

### 3.3 `setOverlap(A, B)` — for multi-select sets (availability, intents, settings)

```ts
const setOverlap = (A: Set<string>, B: Set<string>) =>
  A.size === 0 || B.size === 0 ? 0 : intersection(A, B).size / Math.min(A.size, B.size);
```

Denominator is `min`, not union — someone with only three free slots shouldn't be penalised for
being busy.

### 3.4 `graphAffinity(A, B)` — the interest graph. See §4.6.

### 3.5 `bandGap(a, b, table)` — ordinal bands (budget, frequency)

Lookup by absolute band distance, e.g. budget: `[1.0, 0.85, 0.5, 0.2, 0.1]`.

---

## 4. Dimension detail

Each trait below lists: **mode**, and parameters. Traits within a dimension are averaged with
the sub-weights shown, then the dimension score enters the table in §2.

### 4.1 Personality — 15

| Trait | Sub-wt | Mode | δ | σ | Rationale |
|---|---|---|---|---|---|
| Openness to experience | .15 | gauss | 0 | .28 | Similarity. Curious people bore each other less. |
| Intellectual curiosity | .15 | gauss | 0 | .25 | Strong similarity signal — the single best predictor of sustained adult friendship in the model. |
| Conscientiousness | .10 | gauss | .15 | .30 | Mild complementarity. A pure-planner pair over-schedules; planner + improviser produces plans that also stay fun. |
| Extraversion | .12 | gauss | .12 | .32 | Mild complementarity, loose. One person willing to initiate helps. Two extreme introverts rarely meet twice. |
| Agreeableness | .10 | gauss | 0 | .30 | Similarity. |
| Emotional stability | .10 | gauss | 0 | .35 | Similarity, loose — not a filter on people having hard times. |
| Serious ↔ playful | .10 | gauss | .10 | .28 | Slight complementarity. |
| Intensity ↔ easygoing | .08 | gauss | .15 | .28 | Complementarity — two high-intensity people burn out. |
| Assertive ↔ accommodating | .05 | gauss | .20 | .28 | Complementarity. Two accommodating people never pick a restaurant. |
| Novelty seeking | .05 | gauss | 0 | .30 | Similarity. |

### 4.2 Communication — 15

| Trait | Sub-wt | Mode | σ | Notes |
|---|---|---|---|---|
| Contact frequency | .25 | expectationFit | .18 | **Tight.** The most common quiet friendship killer. |
| Medium preference | .15 | setOverlap | — | text / voice notes / calls / in-person-first / memes. Need ≥1 shared. |
| Conversation style | .20 | setOverlap | — | deep / debate / emotional / banter / gossip / random / activity-focused |
| Response speed | .12 | expectationFit | .22 | Behaviour vs expectation, not behaviour vs behaviour. |
| Message length | .08 | gauss (δ 0) | .30 | Loose. |
| Direct ↔ diplomatic | .10 | gauss (δ .12) | .25 | Slight complementarity, but flag large gaps as friction. |
| High-context ↔ literal | .05 | gauss (δ 0) | .28 | |
| Initiation balance | .05 | expectationFit | .25 | "Initiates often" pairs badly with "initiates often, resents initiating". |

### 4.3 Social rhythm — 15 (Logistics)

**This is the dimension that decides whether the friendship is physically possible.**

| Trait | Sub-wt | Mode | Notes |
|---|---|---|---|
| Availability slots | .40 | setOverlap | 7 days × 4 blocks (morning / midday / evening / late) + explicit Friday-night and Saturday-night flags. **Hard gate: ≥1 shared slot.** |
| Planning horizon | .20 | gauss (δ .10, σ .28) | same-day / 1–3 days / one week / several weeks |
| Social frequency | .20 | expectationFit (σ .22) | multiple weekly / weekly / fortnightly / monthly |
| Preferred duration | .12 | gauss (δ 0, σ .30) | 60-min coffee / 2–3 hrs / half-day / whole-day |
| Energy peak | .08 | gauss (δ 0, σ .30) | morning / afternoon / evening / late-night |

### 4.4 Friendship needs & intentions — 15

Two parts:

- **Intent overlap (60%)** — `setOverlap` across the 15 intent tags (best-friend-level, close
  inner circle, expand circle, activity friends, travel buddies, intellectual, creative
  collaborators, founder/professional, gym/running, nightlife, food, emotional support, casual,
  community/belonging, new-to-city).
- **Depth alignment (40%)** — ordinal ladder: activity acquaintance → casual → regular → close →
  inner circle. Scored with **asymmetric penalty**:

```ts
// Wanting more depth than the other person offers is worse than wanting less.
const depthScore = (mine: number, theirs: number) => {
  const gap = mine - theirs;                    // both 0..4, normalised /4
  return gap > 0 ? gauss(0, gap/4, 0, 0.22)     // I want more than they'll give — painful
                 : gauss(0, -gap/4, 0, 0.34);   // I want less — mildly awkward, survivable
};
// Dimension uses the mean of both directions.
```

This is what stops someone looking for a monthly hiking buddy being pushed at someone looking
for emotional intimacy.

### 4.5 Emotional / relational style — 10 — **the Emotional Rhythm model**

Emotional Rhythm is the *tempo* of someone's emotional life in friendship: how fast they open,
how much contact they need, how they recover, how they handle tension. It is **70% of this
dimension**; the remaining 30% is static style (expressiveness, affection, boundaries).

| Component | Sub-wt (of ER) | Mode | δ | σ | Notes |
|---|---|---|---|---|---|
| **ER1 Opening pace** — guarded ↔ open quickly | .22 | gauss | .15 | .26 | Mild complementarity: a slightly faster opener draws a guarded person out. Two very guarded people often stall at acquaintance. |
| **ER2 Contact cadence need** | .28 | expectationFit | — | .18 | Tightest parameter in the model. Mismatched need for contact is the number-one cause of quiet friendship death. |
| **ER3 Reassurance need ↔ offering** | .18 | cross-fit | — | .22 | Scored across people: `√(gauss(need_A, offer_B) · gauss(need_B, offer_A))`. A high-need person paired with a high-offering person scores well even though they are *dissimilar*. |
| **ER4 Recovery / solo time** | .14 | gauss | 0 | .32 | Similarity, loose. How much alone time you need after socialising. |
| **ER5 Conflict approach** — avoid ↔ address directly | .18 | gauss | 0 | .20 | Similarity, tight. Two avoiders are genuinely fine together. Avoider + direct-addresser is the classic rupture. **Always surface a large gap here as friction**, with direction. |

Static style (30% of the dimension): emotional expressiveness (`gauss δ0 σ.30`), vulnerability
comfort (`gauss δ0 σ.28`), affection level (`gauss δ0 σ.30`), advice-vs-listening preference
(`expectationFit σ.25`), reliability expectation (`expectationFit σ.20`), boundary clarity
(`gauss δ0 σ.30`).

**Presentation rule:** never show clinical language. Internally `ER1 = 0.2` becomes, in the UI,
*"I tend to open up gradually, but I'm very loyal once I'm comfortable."* Copy templates for
every band live in `05-onboarding-question-bank.md` §11.

### 4.6 Interests & curiosity graph — 10

Not tags. A tree: `Art → Contemporary Art → Installation Art → teamLab`.

Each user-interest edge carries an **affinity**: `love (1.0)` · `regularly do (0.9)` ·
`learning (0.6)` · `curious to try (0.5)`.

```
nodeProximity: same node 1.0 | sibling 0.6 | shares grandparent 0.35 | shares root 0.15 | else 0
pairScore(a, b) = nodeProximity(a.node, b.node) × ((a.affinity + b.affinity) / 2) × bonus

bonus = 1.15 when one side is `curious`/`learning` and the other is `love`/`regularly do`
        on the same or sibling node      // the "teach me pottery" match — deliberately rewarded
      = 1.0 otherwise

dimension = mean(top 8 pairScores), capped at 1.0
```

The curiosity bonus is a product decision, not an optimisation: matching a "always wanted to try
pottery" to someone who already throws pots produces better outings than matching two potters.

### 4.7 Values & worldview — 8

For each value the user rates **stance** (0–1) *and* **importance that friends share it** (0–1).

```ts
valueScore = 1 - Math.max(importanceA, importanceB) * Math.abs(stanceA - stanceB);
// dimension = mean over values both users answered (min 4 shared, else fall back to prior 0.5)
```

If neither person cares whether friends share a value, disagreement costs nothing. If either
cares a lot, it costs a lot. Values list: family importance, ambition, personal growth,
creativity, adventure, stability, community, spirituality, sustainability, intellectual
curiosity, career/wealth orientation, work-life balance, social causes.

Each value has a per-user `visibility` flag (`private` | `matching-only` | `public`).
`private` values are excluded from scoring entirely.

### 4.8 Lifestyle — 7 (Logistics)

| Trait | Mode | Notes |
|---|---|---|
| Outing budget band | bandGap `[1.0, .85, .5, .2, .1]` | free / <$20 / $20–50 / $50–100 / $100+. **Never ask for income.** |
| Alcohol | matrix | drinks / occasionally / alcohol-free. Alcohol-free + heavy-nightlife = soft penalty 0.5, and a **dealbreaker gate** if the user flagged it. |
| Smoking | matrix | dealbreaker-flaggable |
| Activity level | gauss δ0 σ.30 | |
| Food preferences | setOverlap | vegetarian/halal/etc. — logistics for meals, never a values judgement |
| Pets | gauss δ0 σ.35 | only matters for home meetups |
| Life stage | gauss δ.10 σ.35 | children / no children / caregiving — affects availability realism |
| Work schedule | setOverlap | shift work, standard hours, flexible |
| Travel frequency | gauss δ0 σ.35 | someone away 3 weeks a month is a poor weekly-friend match |
| Accessibility needs | **gate + accommodation flag** | never scored as a negative; instead constrains outing suggestions |

### 4.9 Experience / outing compatibility — 3 (Logistics)

`setOverlap` on setting (quiet / busy / outdoors / indoors / intimate / high-energy),
`gauss δ0 σ.25` on preferred group size (1:1 / 3–4 / 5–8 / large),
`setOverlap` on activity orientation (conversation-first / activity-first / either),
`gauss δ.10 σ.30` on novelty appetite (familiar favourites / occasionally new / anything once).

Low weight for person-to-person matching, but **re-weighted heavily for outing matching** (§7).

### 4.10 Geography — 2 + hard gate

Not kilometres. **Mobility radius, which varies by activity.**

Each user sets a home anchor region (Singapore planning areas) and, per activity category, a
willingness in travel minutes. Someone may travel 45 minutes for a hike and 15 for a coffee.

```
t = estimated travel minutes between anchors (public transport, precomputed matrix)
r = min(radiusA[activity], radiusB[activity])
score = t <= r ? 1.0 : gauss(0, (t - r) / 60, 0, 0.35)
HARD GATE: score = 0 when t > 2r
```

Store a static Singapore planning-area travel-time matrix in `packages/core/geo/` for v0.1 —
do not call a routing API per match.

---

## 5. Confidence

```
confidence = Σ(weightᵢ × answeredFractionᵢ) / 100      // per dimension, 0..1
```

- `confidence < 0.55` → the user is **not** surfaced in matching and sees a warm prompt to
  finish more of their profile. Do not show bad matches from thin data.
- `0.55 ≤ confidence < 0.8` → matches are shown, and the Resonance Read is hedged
  (*"early read"*), and the UI invites the deepening questions that would sharpen it most.
- The DNA Bloom encodes confidence as petal *width*. A thin bloom is visibly incomplete —
  this is the gamified completion loop, and it replaces a progress bar.

Cold start: the 12-question core pass should reach ≈0.60.

---

## 6. Gates (hard constraints)

Gates multiply the rank by 0. They are the only place a binary rejection exists.

1. No shared availability slot at all.
2. Geography: `t > 2 × min(radius)` for every activity category.
3. Either user has blocked the other, or either has reported the other.
4. A declared dealbreaker is violated (smoking, alcohol presence, accessibility need unmet).
5. Age preference band explicitly set and not met.
6. `confidence < 0.55` on either side.
7. Either account is under trust-and-safety review.

**Nothing else is a gate.** In particular, low scores on any psychological dimension reduce
rank; they never eliminate.

---

## 7. Outing-contextual re-weighting

When ranking candidate guests for a specific pitch, multiply the base weights by the activity
profile, then renormalise to 100.

| Activity category | Geography | Lifestyle | Experience | Communication | Social rhythm |
|---|---|---|---|---|---|
| Coffee / low-key | ×2.5 | ×1.0 | ×2.0 | ×1.2 | ×1.0 |
| Dining | ×1.5 | ×2.0 (budget, food) | ×2.0 | ×1.0 | ×1.0 |
| Active / outdoors | ×3.0 | ×2.0 (activity level) | ×2.5 | ×0.6 | ×1.2 |
| Cultural / museum | ×1.5 | ×1.0 | ×3.0 | ×1.0 | ×1.0 |
| Nightlife | ×1.5 | ×3.0 (alcohol, budget) | ×3.0 | ×0.8 | ×1.5 |
| Creative / workshop | ×1.5 | ×1.5 | ×2.5 | ×1.0 | ×1.0 |

Interest weight is additionally boosted ×2.0 when the pitch is tagged with an interest node the
candidate has any affinity for — including `curious to try`.

---

## 8. Group cohesion (host-controlled pitching)

An outing is not a set of independent pairs. For a candidate guest list `G` (host included,
`|G| ≤ 6` on free tier):

```
pairs      = all unordered pairs in G
cohesion   = 0.5 × min(R over pairs) + 0.5 × mean(R over pairs)
feasibility= |sharedAvailability(G)| >= 1  AND  all geo gates pass   // hard
spread(t)  = stdev of trait t across G
```

**Advisory warnings shown to the host** (never blocking — the host always decides):

| Condition | Warning copy |
|---|---|
| `min pairwise R < 0.35` | "Priya and Marcus are quite different — that can work, but this group may need you to bridge them." |
| `spread(extraversion) > 0.30` | "This group's energy range is wide. Two people prefer quiet settings and one thrives in high-energy ones." |
| `spread(budget band) ≥ 2` | "Budget expectations vary here. Naming the likely spend in your pitch will help." |
| `spread(groupSizePref) > 0.30` | "Two guests prefer 1:1 or small groups — six may feel like a lot for them." |
| `feasibility == false` | "There's no time slot that works for everyone yet." (blocking for *confirmation*, not for inviting) |
| `|G| == 6` | "This is the largest group Soul Tribe runs. Six is where conversation splits — that's fine, just expect it." |

**Cap enforcement:** `participants ≤ 6` including the host on free tier. Enforced in three
places: a Postgres trigger on `outing_members`, an API guard, and disabled UI. The trigger is
the authority.

---

## 9. Explanations — the Resonance Read

Every surfaced match carries a two-part explanation. Generation is **deterministic in what it
talks about, generative only in how it says it.**

### Step 1 — deterministic selection (pure TS, no model)
- Compute each dimension's *contribution above baseline*: `wᵢ × (sᵢ − 0.5)`.
- **Aligned:** top 3 positive contributors with `sᵢ > 0.65`.
- **Divergent:** top 2 negative contributors with `sᵢ < 0.45`.
- For each selected dimension, pull the specific trait that drove it and render both users'
  values as pre-written human phrases (from the copy bank in `05` §11).

### Step 2 — generation (frontier model, cached)
Send only the human-readable phrases. **Never send raw vectors or scores to the model.**

Constraints in the system prompt:
- 2–3 sentences for "Why you might click", 1–2 for "Where you might rub".
- Second person for the reader, first name for the other person.
- Concrete and specific — reference the actual traits selected, not generic warmth.
- No numbers, no percentages, no superlatives ("perfect", "amazing", "soulmate").
- No clinical or diagnostic language (no "attachment style", "avoidant", "neurotic").
- Never suggest the friction is a dealbreaker, and never minimise it either. Neutral tone.
- If there is genuinely no meaningful divergence, say so plainly:
  *"Nothing obvious to flag here — you're aligned on most of what usually causes friction."*

Cache the result keyed on `(userA, userB, profileVersionA, profileVersionB)`. Regenerate only on
material profile change. Falls back to deterministic templates if the model call fails —
**a match is never shown without an explanation.**

### Reference output shape

> **Why you might click**
> You both want a small circle of close friendships rather than a big social network, and
> neither of you expects constant texting — but you both want conversations that go somewhere
> when you do meet. You're also usually free on Sunday afternoons and both like plans made a few
> days ahead.
>
> **Where you might rub**
> Maya is considerably more spontaneous than you and enjoys larger groups. You tend to prefer
> plans in advance and groups of three or four.

---

## 10. Recalibration from Rhythm Checks

After each outing, attendees answer three short questions (see `06-screens-and-flows.md` §7).
Observed signals nudge self-reported traits toward reality:

```
trait_adjusted = trait_self + clamp(learningRate × (observed − trait_self), -0.20, +0.20)
learningRate = 0.10
```

- Never let observed data move a trait more than ±0.20 from self-report. People know themselves.
- Only recalibrate traits with ≥3 independent observations.
- Recalibration is **visible**: the profile shows *"Your rhythm has shifted — you've been
  meeting more often than you expected to."* Never silently change someone's model.

---

## 11. Fairness and audit

- Race, religion, nationality, and language are **never** inputs to scoring. Not as features,
  not as proxies. Age enters only via an explicit user-set preference band.
- Log every surfaced match with its full dimension contribution breakdown to an
  `match_audit` table, so "why did I see this person" is always answerable.
- Add a test that shuffles all demographic fields and asserts rankings are unchanged.

---

## 12. Test cases (write these first)

`packages/core/matching/__tests__/` must cover at minimum:

1. **Identical twins.** Two identical profiles → high R, high L, but *complementarity traits
   score below their max*. Assert `personality < 0.95` — proving δ works.
2. **The low-maintenance pair.** Both reply every 2–3 days, both expect that → communication
   `> 0.85`. This is the headline case for `expectationFit`.
3. **The mismatched-expectation pair.** A replies fast and expects fast; B replies slowly and
   expects slow → communication `< 0.35` despite both being internally consistent.
4. **Great on paper, impossible in practice.** R `> 0.85`, zero shared availability → gate
   fires, rank `= 0`.
5. **Depth asymmetry.** A wants inner-circle, B wants activity acquaintance → intent `< 0.4`;
   and the reverse pairing scores *higher* than the forward one (asymmetric penalty).
6. **Curiosity bonus.** A is `curious` about pottery, B `regularly does` pottery → interest
   score exceeds the same pair where both are merely `curious`.
7. **Private values excluded.** Marking a value private changes the score and does not leak the
   stance into any output.
8. **Group cohesion floor.** A 6-person group where one pair scores 0.2 → cohesion drops below
   the 4-person subset that excludes them.
9. **Cap enforcement.** Inserting a 7th member fails at the database level, not just the API.
10. **Explanation always has friction.** Property test over 500 random pairs: every generated
    Resonance Read contains a non-empty divergence section.
11. **Demographic invariance.** Shuffling race/religion/nationality fields leaves rankings
    bit-identical.
12. **Confidence gate.** A profile at 0.5 confidence never appears in anyone's results.
