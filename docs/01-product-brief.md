# 01 — Product Brief

## What Soul Tribe is

A friendship-first social platform addressing adult loneliness, starting in Singapore.

It is positioned as a **coordination layer above WhatsApp** — not a social feed, not a dating
app, not an events listing site. People already have chat. What they don't have is a way to
find the *right* handful of people and reliably turn intention into a plan that actually
happens.

## The three problems it solves, in order

1. **Finding people whose lives actually fit yours.** Not people with the same hobby tags —
   people whose communication tempo, availability, energy and expectations line up well enough
   that a friendship can survive past the first meeting.
2. **Turning "we should hang out" into a real plan.** Adults don't fail at friendship because
   they don't like each other. They fail at scheduling, at the awkwardness of proposing, and at
   nobody wanting to be the one who organises.
3. **Making the thing that happened durable.** A great evening evaporates in a chat scroll.
   Soul Tribe keeps it.

## The design law (repeat it before every feature)

> Every feature must produce a persistent artifact that chat cannot replicate.

| Feature | Artifact it produces |
|---|---|
| Onboarding | Your **Friendship DNA** — a living portrait that gets more accurate over time |
| Matching | A **Resonance Read**: why you'd click, and where you'd rub, in plain language |
| Pitch Outing | An **Outing Record** — who came, what happened, one line worth keeping |
| Post-outing | A **Rhythm Check** that visibly recalibrates your future matches |

If you can't name the artifact, don't build the feature.

---

## MVP scope (v0.1 — the 30-person concierge test)

The MVP exists to answer one question: *does dimensional matching plus host-controlled pitching
produce meetups that people actually attend and want to repeat?*

### In scope

1. **Auth + waitlist-to-account conversion** (magic link, Apple sign-in).
2. **Onboarding → Friendship DNA.** Progressive: a ~4-minute core pass unlocks matching, then
   deepening prompts refine it. Full model in `05-onboarding-question-bank.md`.
3. **Matching.** The 10-dimension engine in `04-matching-spec.md`, producing a ranked people
   list with human-language Resonance Reads. **No swiping.** A small, curated set —
   at most 5 new people surfaced per week.
4. **Pitch Outings with host control.**
   - Any user can pitch an outing.
   - The **host owns the guest list**. Soul Tribe suggests, the host decides.
   - **Free-tier cap: 6 participants total, including the host.**
   - Invitees accept/decline; non-invited users may *request* to join and the host approves.
   - Group cohesion warnings before the host confirms (see `04` §8).
5. **Outing Record + Rhythm Check.** Lightweight post-outing capture that feeds matching.
6. **Safety spine.** Report, block, host-removal of a guest, and a trust-and-safety pass on
   free-text profile fields. Non-negotiable for a real-world meetup product.

### Explicitly out of scope for v0.1 (design the data model so they slot in later)

- **Flash Pods** (spontaneous same-day micro-meetups) — v0.2
- **Echo Room** (asynchronous reflection space) — v0.2
- **Tribe Map** (illustrated map of your growing circle) — v0.3.
  *Ship a simplified static version as the profile backdrop in v0.1 so the metaphor exists
  from day one; the interactive map comes later.*
- Payments, subscriptions, B2B — the monetisation roadmap is curated events → subscription →
  B2B, but v0.1 charges nothing.
- Native apps. Web PWA only; the code is structured so native is cheap later.

### Non-goals, permanently

- A feed. No scrolling wall of other people's lives.
- Follower counts, likes, public popularity signals of any kind.
- Romantic matching. If users try to use it that way, the product should feel wrong for it.
- Growth mechanics that reward volume of connections over depth.

---

## Who it's for (v0.1 test cohort)

Singapore-based adults, roughly 26–40, who have moved city, changed life stage, or come out of
an all-consuming work period, and have found that their social circle quietly thinned. They are
not socially anxious — they are *time-poor and initiative-fatigued*. They will pay for something
that reliably produces good Saturdays.

## Tone of voice

Warm, specific, unhurried, and slightly literary. Never chirpy, never therapeutic-clinical,
never hype. It should read like a thoughtful friend who happens to be well organised.

Good: *"You both want a small circle rather than a big network."*
Bad: *"You're a 92% vibe match! 🔥"*
Bad: *"Your attachment style indicates avoidant tendencies."*

## Success criteria for the 30-person test

- ≥60% of proposed outings reach a confirmed guest list
- ≥75% of confirmed guests actually attend
- ≥40% of attendees meet at least one of the same people again within 6 weeks
- Median Rhythm Check "would meet again" ≥ 4/5
- Qualitative: users describe the Resonance Read as *accurate*, including the friction part
