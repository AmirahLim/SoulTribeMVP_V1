# 08 — Connection Intelligence Engine Specification

## Executive Summary

The Connection Intelligence Engine is Soul Tribe's core matching and bond evaluation system. It replaces dating-style "compatibility scores" with a **measured, asymmetric, signal-based connection framework**.

Friendship software fails when it behaves like a dating app or marketplace. Soul Tribe enforces strict principles:
- **No swiping, no percentages, no hot-or-not, no red/green human scoring.**
- **Absence is not agreement.** Unanswered traits lower confidence; they never write defaults or midpoints.
- **Always show friction.** Match cards and bond readings must state honest friction alongside alignment.
- **Asymmetric compatibility.** How A feels about B is distinct from how B feels about A.
- **Signal-based confidence.** Confidence tracks measured signals filled vs total target signals, never questions asked.

---

## I. Three-Layer Architecture

To ensure total accuracy, prevent hallucination, and produce deep human insight, the Connection Intelligence Engine uses a strict three-layer design:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Deterministic Layer (Pure TypeScript Engine)              │
│    Calculates Signals, Confidences, Asymmetric Fit (A→B,   │
│    B→A), 4 Relationship Mechanisms, and Friction Levels.    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Generation Layer (Frontier LLM / Template Engine)        │
│    Receives derived Signal summaries & confidences ONLY.    │
│    Renders human-readable prose without raw psychometrics.  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Validation Layer (Deterministic Guard)                    │
│    Verifies 100% traceability to supplied signals. Reject &  │
│    fallback if unmeasured threads are referenced.           │
└──────────────────────────────┴──────────────────────────────┘
```

1. **Deterministic Layer (No Model)**: Computes every Signal, its confidence, its source, and the four relationship mechanisms. Pure, side-effect-free TypeScript in `packages/core/matching`.
2. **Generation Layer (Model)**: Receives **only** computed Signals, confidences, and derived summaries — never raw psychometric vectors or unconstrained prompt prompts.
3. **Validation Layer (No Model)**: Verifies every output sentence maps to a measured Signal. If a sentence references an unmeasured thread, it is rejected and replaced with an honest thin-profile prompt.

---

## II. Signal Inventory & Signal-Based Confidence

The engine measures **10 Core Connection Threads** comprising **64 Target Signals**:

| Thread | Key | Target Signals | Core Measured Traits |
|---|---|---|---|
| 1. Personality & Social Energy | `personality` | 10 | Extraversion, Openness, Conscientiousness, Agreeableness, Emotional Stability, Intellectual Curiosity, Serious/Playful, Intensity/Easygoing, Assertive/Accommodating, Novelty Seeking |
| 2. Communication & Rhythm | `communication` | 10 | Contact Freq (Self/Expect), Response Speed (Self/Expect), Initiation (Self/Expect), Direct/Diplomatic, High-Context/Literal, Mediums, Conv Styles |
| 3. Social Rhythm & Planning | `social_rhythm` | 6 | Planning Horizon, Spontaneous Trip, Social Freq (Self/Expect), Ideal Saturday, Availability Slots |
| 4. Friendship Intent & Depth | `intent` | 4 | Closeness Depth, Open to Hosting, Commitment Level, Group Size Ideal |
| 5. Emotional Opening & Conflict | `emotional` | 8 | Opening Pace, Vulnerability Comfort, Conflict Approach, Recovery Time, Reassurance (Need/Offer), Cadence (Need/Expect) |
| 6. Shared Activity Interests | `interests` | 6 | Interest Node Overlap, Affinity Levels, Curiosity Bonus |
| 7. Underlying Core Values | `values` | 6 | Core Values Stances, Respect Prompts, Stance Visibility |
| 8. Outing & Lifestyle Habits | `lifestyle` | 4 | Budget Band, Activity Level, Punctuality Pref, Cancellation Stance |
| 9. Experience & Group Vibe | `experience` | 4 | Group Size Pref, Social Vibe, Atmosphere Pref, Venue Pref |
| 10. Geographic Rhythm | `geography` | 6 | Home Area, Coordinates, Travel Radius, Preferred Areas, Transport |

### Signal-Based Confidence Formula

Confidence tracks **measured signals filled** vs total target signals:

$$\text{Confidence}(\text{vec}) = \sum_{\text{thread}} \text{weight}_{\text{thread}} \times \frac{\text{SignalsFilled}_{\text{thread}}}{\text{TargetSignals}_{\text{thread}}} \in [0.0, 1.0]$$

- A new member answering Stage A onboarding (~10 signals) receives $\approx 15\%$ confidence.
- A member completing the full current Tribal Pass (~26 signals) receives $\approx 41\%$ confidence (accurately reflecting that 38 signals remain unknown).
- Confidence reaches $1.0$ only when all 64 target signals are populated.

---

## III. Asymmetric Compatibility & Imbalance Penalty

Friendship fit is inherently asymmetric:
- $\text{FIT}(A \to B)$: How well User B's behaviors and traits satisfy User A's preferences and expectations.
- $\text{FIT}(B \to A)$: How well User A's behaviors and traits satisfy User B's preferences and expectations.

### Asymmetric Calculation

For expectation-driven threads (Communication, Intent, Social Rhythm, Emotional):
$$\text{fit}_{A \to B} = \text{expectationFit}(B_{\text{self}}, A_{\text{expect}})$$
$$\text{fit}_{B \to A} = \text{expectationFit}(A_{\text{self}}, B_{\text{expect}})$$

For symmetric threads (Interests, Values, Geography):
$$\text{fit}_{A \to B} = \text{fit}_{B \to A} = \text{score}_{\text{symmetric}}$$

### Directional Resonance & Imbalance Penalty

$$\text{Imbalance} = |\text{fit}_{A \to B} - \text{fit}_{B \to A}|$$

$$\text{Resonance} = \min(\text{fit}_{A \to B}, \text{fit}_{B \to A}) \times (1.0 - 0.25 \times \text{Imbalance})$$

If User A expects daily messaging and User B replies daily, $\text{fit}_{A \to B} = 1.0$. But if User B expects weekly catch-ups and User A expects 5 messages a day, $\text{fit}_{B \to A} = 0.40$, producing an imbalance of $0.60$ and penalizing overall resonance to reflect expectation friction.

---

## IV. The Four Relationship Mechanisms

Every thread interaction is classified into one of four relationship mechanisms:

1. **ALIGNMENT**: Shared preference or similarity on traits where agreement is desirable (e.g. Core Values, Budget Band, Shared Hobbies, Location).
2. **COMPLEMENTARITY**: Beneficial contrast where differences create balance (e.g. Initiator paired with Responder, Talker paired with Listener, High Curiosity paired with Activity Expert).
3. **FRICTION**: Expectation gap or trait mismatch that generates social strain (e.g. Daily messager paired with Weekly replier, Same-day planner paired with 3-week advance planner).
4. **CONTEXT**: Situational or outing-dependent dynamic (e.g. Quiet venue vs High-energy event, 1-on-1 setting vs 6-person group).

---

## V. Friction Taxonomy & Thread Output States

### Friction Classification Levels

Every detected contrast point is categorized into one of 5 levels:

- **LOW**: Minor preference delta (e.g. slight planning horizon difference).
- **PRODUCTIVE**: Stimulating contrast that introduces new activities or perspectives without conflict.
- **CONTEXTUAL**: Environment-dependent friction (e.g. noisy crowded venue vs quiet tea house).
- **RECURRING**: Pacing or communication cadence gap requiring ongoing coordination.
- **STRUCTURAL**: Major boundary, intent, or availability mismatch (e.g. 1-on-1 intimate intent vs casual group networking).

### Thread Output States

Users see one of 5 explicit output states for each Connection Thread:

1. **Strong alignment**: $\text{Score} \ge 0.75$ and Mechanism = `ALIGNMENT`.
2. **Moderate**: $0.55 \le \text{Score} < 0.75$.
3. **Complementary**: Mechanism = `COMPLEMENTARITY`.
4. **Potential friction**: Mechanism = `FRICTION` or $\text{Score} < 0.40$.
5. **Not measured**: Missing answers on either side (never displays fake $50\%$).

---

## VI. MBTI & Self-Reported Typologies

MBTI and astrology indicators are retained as **self-reported typologies for display and flavor**. They do not drive core scoring signals; direct behavioral questions carry the quantitative weight.

---

## VII. Staged Build Path

- **Stage 1 (Current)**: Foundation fixes in pure TypeScript (Signal-based confidence, Asymmetric `FIT(A→B)` / `FIT(B→A)`, 4 Relationship Mechanisms, 5 Friction Taxonomy levels, 5 Thread Output States). Zero external dependencies.
- **Stage 2**: Expand Signal Collection (collecting remaining 38 signals via skippable, non-coercive Stage B & C modules).
- **Stage 3**: LLM Explanation Layer + Deterministic Validation Layer.
- **Stage 4**: Post-outing behavioral validation (Rhythm Checks & repeat meeting feedback updating prior confidence).
