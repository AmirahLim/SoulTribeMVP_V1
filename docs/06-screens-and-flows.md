# 06 — Screens and Flows

Mobile-first at 390px. Every screen obeys `02-design-system.md` §5 (layout) and §11 (definition
of visual done).

Bottom navigation, 4 items, drawn icons (never emoji): **Home · People · Outings · You**

---

## 1. Landing / waitlist → account

Single scrolling page, but **not** a stack of sections. Structure:

- Full-bleed illustrated horizon (warm topography, upper-left light) with a Display L headline
  overlapping it and breaking the gutter.
- One asymmetric split: a large DNA Bloom illustration on the left, three short claims stacked
  right at different sizes — not three equal cards.
- One real Resonance Read shown as a specimen, friction section included. This is the single
  most persuasive thing on the page: show the honesty.
- Sign-in inline, mid-page, not a centred button at the bottom.

Copy anchor: *"Every wearable, one home"* is what a data app says. Soul Tribe says:
**"Six people. One good Saturday. Start there."**

---

## 2. Onboarding

Follows `05-onboarding-question-bank.md`. One idea per screen, illustrated ground, the Bloom
drawing itself in a persistent header that thickens as answers land.

- Progress is shown as the Bloom, never a bar.
- After the Core pass: a full-screen reveal moment — the Bloom completes its first draw,
  one sentence of what we now understand, and matching switches on.
- Deepening passes are offered from Home as warm invitations, never as nags or badges.

---

## 3. Home

The week, not a feed.

1. **Your rhythm this week** — the Rhythm Strip with any confirmed outings placed on it.
2. **One pitch, front and centre** — either an invitation waiting for your answer, or a nudge
   to pitch something, sized as the dominant element on screen.
3. **This week's people** — at most 5, in a horizontally scrollable stack of overlapping cards
   with a slight rotation. Not a grid.
4. **A recent Outing Record** if one exists — a photo, the headline, who was there.

Empty state (new user, no matches yet): illustrated scene of an empty table being set. Copy:
*"We're reading your rhythm. Your first few people land Thursday."*

Deliberately: **no infinite scroll, no counters, no notification badges with numbers.**

---

## 4. People

The match list. At most 5 new people per week — scarcity is a feature, not a limitation.

**Person card (collapsed):** photo, first name, area, one line pulled from their profile,
their Bloom at small size overlaid translucently with yours.

**Person detail:**
1. Photo and name, Display M.
2. **Resonance Read** — "Why you might click" then "Where you might rub". Both always visible.
   (`02` §6.2)
3. **Rhythm overlay** — your strip and theirs, shared slots glowing. Caption in plain language:
   *"You're both usually free Sunday afternoons."*
4. **What they're up for** — their interests rendered as a small branch of the tree, with
   `curious to try` items marked differently. Shared and complementary items highlighted.
5. Actions: `Pitch something to them` (primary, terracotta) · `Save for later` · `Not for me`
   (quiet, no confirmation drama).

**Never shown:** a score, a percentage, a rank, a "new match!" celebration, or how many people
also matched with them.

---

## 5. Pitch an outing (host flow)

This is the product's core loop. Five steps, each its own screen.

**Step 1 — What.** Title, and a free-text pitch (20–600 chars). Placeholder:
*"What is it, and why this? A sentence about what you're picturing does more work than a
perfect plan."* Activity category picker (illustrated), and optionally tag an interest node.

**Step 2 — When and where.** Date/time, duration, area. The composer shows **your own Rhythm
Strip** so you pitch into a slot you're actually free in.

**Step 3 — Shape.** Group size (2–6, the slider stops hard at 6 with the copy
*"Six is where conversation splits. Soul Tribe stops here on purpose."*), budget band,
setting, conversation-first vs activity-first.

**Step 4 — Who. The host controls this screen.**
- Soul Tribe suggests candidates ranked by outing-contextual compatibility
  (`04-matching-spec.md` §7), each with a one-line reason:
  *"Priya has been wanting to try pottery, and Tiong Bahru is 12 minutes from her."*
- The host adds and removes freely. Nothing is auto-added. **Suggestion is not selection.**
- As the guest list changes, a live **cohesion strip** updates below it with advisory warnings
  from `04` §8 — phrased as observations, never as approval or disapproval.
- Seats render as illustrated chairs, filling as guests are added.
- `visibility`: `Invite only` or `Let matched people request a seat`. Default invite-only.

**Step 5 — Send.** Preview of the Pitch Card exactly as guests will see it, then send.

### After sending
- Host sees each invitation's state and can withdraw, remove, or invite replacements while
  seats remain.
- Requests to join (if `requestable`) queue for host approval with the same one-line reason.
- **Confirm** becomes available once ≥2 have accepted; confirming locks the guest list and
  produces the calendar-ready detail. Blocked only if no shared slot exists.

---

## 6. Outing detail (guest view)

Illustrated location vignette, the host's pitch in their own words (never rewritten by AI),
the practical strip, who's coming with a line each on why the host thought they'd fit, and
`I'm in` / `Can't make it`.

Below the fold: a light coordination thread. **Deliberately thin** — Soul Tribe is a
coordination layer above WhatsApp, not a replacement chat app. Once confirmed, offer a one-tap
"open a group chat elsewhere" hand-off, and keep the Outing Record here.

---

## 7. After the outing — the artifact

24 hours later, one screen, three taps:

1. **Rhythm Check** — *"How did that land?"* Would meet again (1–5), energy read
   (quieter / as expected / livelier), pace read (slower / as expected / faster).
   Copy under it, always: *"Only we see this. It shapes who we suggest next — nobody gets
   rated, and nothing is shown to anyone who was there."*
2. **The headline** — one line about the outing. Optional, prompted:
   *"One line you'd want to remember."*
3. **A photo**, optional.

That produces the **Outing Record**, which lives on the host's and attendees' profiles
permanently. This is the artifact chat cannot replicate — the thing that makes the app worth
keeping.

---

## 8. You

- Your **DNA Bloom**, large, tappable petal by petal, each revealing a sentence.
- Your Outing Records as an illustrated trail across a simplified Tribe Map backdrop
  (static in v0.1 — `02` §6.5).
- **Deepen your profile** — the remaining passes, framed by what each would sharpen.
- **What changed** — any recalibration from Rhythm Checks, stated plainly
  (`04-matching-spec.md` §10).
- Settings: visibility, dealbreakers, pause matching, blocked people, delete account.

---

## 9. Safety, everywhere

- Report and block reachable from every person and outing surface, two taps maximum.
- A block removes both people from each other's candidate lists, existing outings, and
  suggestion reasons, immediately.
- First-meeting guidance shown on every *first* confirmed outing with someone new — public
  place, tell someone, leave when you want. Warm, brief, not a legal notice.
- Host removal of a guest notifies neutrally and never exposes a reason to the removed guest.

---

## 10. Notifications

Maximum three per week per user. Never engagement bait.

Permitted: an invitation received · an outing confirmed or changed · your weekly people
(one, on Thursday) · a Rhythm Check prompt after an outing.

Not permitted: "someone viewed your profile", "you have 3 new matches!", streak reminders,
re-engagement nudges, anything with a count in it.
