# 05 — Onboarding Question Bank

Every question below maps to a field in `03-data-model.md`. Copy is production-ready — use it
verbatim unless it breaks.

**Never show a Likert scale labelled 1–5.** Every question is either a choice between written
human statements, a slider between two named poles, or a chip multi-select. People answer
honestly when the options sound like things a person would actually say.

---

## 1. Pacing — progressive profiling

| Pass | Questions | Time | Unlocks |
|---|---|---|---|
| **Core** | 12 | ~4 min | Matching turns on (confidence ≈ 0.60) |
| **Deepening A — Rhythm** | 8 | ~3 min | Sharper availability + communication fit |
| **Deepening B — Emotional Rhythm** | 9 | ~4 min | The dimension that makes the reads feel accurate |
| **Deepening C — Interests & values** | open | ongoing | Better outing suggestions |

The DNA Bloom visibly thickens after each pass. **That is the completion mechanic** — no
progress bars, no percentage-complete badge (`02-design-system.md` §6.1, §10).

After each pass, show what it changed:
> *"Your read on people just got sharper. We now know you'd rather have three close friends
> than fifteen casual ones — that changes who we show you."*

---

## 2. Core pass (12 questions)

**Q1 — Intent.** *What are you hoping to find right now?* Chips, multi-select, max 4.
→ `trait_intent.intents`
`A small circle of close friends` · `People to do things with` · `Someone to talk properly with`
· `A wider social circle` · `Travel companions` · `Gym or running partners` · `People who make
things` · `Founders and builders` · `Food people` · `New to Singapore, starting over` ·
`Nightlife people` · `A sense of community`

**Q2 — Depth.** *When a friendship is working, what does it look like?* Single choice.
→ `trait_intent.depth`
`We see each other for a specific thing, and that's enough` (0) ·
`Easy, occasional, no pressure` (1) · `Regular — part of my month` (2) ·
`Close. I'd tell them the real version` (3) · `Inner circle. Few people, deep in` (4)

**Q3 — Contact cadence (behaviour).** *Left to yourself, how often do you message a friend?*
Slider, poles: `Barely between meeting up` ↔ `Most days`
→ `trait_communication.contact_frequency_self`

**Q4 — Contact cadence (expectation).** *And how often do you want to hear from them?*
Same slider. → `trait_communication.contact_frequency_expect`

> These two being separate questions is the whole point. Do not merge them.

**Q5 — Conversation.** *What do you actually enjoy talking about?* Chips, max 4.
→ `trait_communication.conv_styles`
`The deep stuff` · `Arguing about ideas` · `How people are really doing` · `Nonsense and banter`
· `Gossip, honestly` · `Whatever's in my head` · `Whatever we're doing right now`

**Q6 — Availability.** *When are you usually free?* 7×4 grid, tap to fill. Plus two explicit
toggles for Friday night and Saturday night. → `trait_social_rhythm.availability`
Rendered as the **Rhythm Strip** (`02` §6.4), not a table.

**Q7 — Planning horizon.** *How far ahead do plans usually need to be?* Single choice.
→ `trait_social_rhythm.planning_horizon`
`Text me now, I'm free` · `A day or two` · `About a week` · `I plan weeks out`

**Q8 — Frequency.** *How often would you like to actually see people?*
→ `trait_social_rhythm.social_freq_self` + a follow-up chip for what you'd expect from them
`A few times a week` · `Weekly` · `Every couple of weeks` · `Monthly is plenty`

**Q9 — Group size and setting.** *Pick the version of a good evening.* Single choice, illustrated
cards. → `trait_experience.group_size_pref`, `settings`
`One person, somewhere quiet` · `Three or four, a long table` · `Five or six, a bit of noise` ·
`A big group, high energy`

**Q10 — Budget.** *What's a comfortable spend for a typical outing?*
→ `trait_lifestyle.budget_band` — `Free` · `Under $20` · `$20–50` · `$50–100` · `$100+`
Helper text: *"This never appears on your profile. It only stops us suggesting outings that
don't fit."*

**Q11 — Where you are and how far you'll go.** Home area picker, then:
*"How far would you travel for…"* three quick sliders in minutes: coffee, dinner, something
outdoors. → `trait_geography.home_area`, `radius_minutes`

**Q12 — Two personality anchors.** Two sliders with written poles.
→ `trait_personality.extraversion`, `intellectual_curiosity`
`I recharge alone` ↔ `I recharge around people`
`Familiar and comfortable` ↔ `I'll go down any rabbit hole`

---

## 3. Deepening A — Rhythm (8 questions)

**A1 Response speed (behaviour).** `I reply when I get to it` ↔ `I reply almost immediately`
→ `response_speed_self`
**A2 Response speed (expectation).** *"And when you message someone, how long is fine to wait?"*
`Days is fine` ↔ `I'd like a reply that day` → `response_speed_expect`
**A3 Medium.** Chips → `mediums`: `Text` · `Voice notes` · `Actual calls` · `Just meet up` ·
`Sending each other things`
**A4 Initiation.** `I'm usually the one who suggests` ↔ `I'd rather be invited`
→ `initiation_self`; follow-up: *"And how do you feel if you're always the one initiating?"*
→ `initiation_expect`
**A5 Message length.** `Short and quick` ↔ `Long, thought-out messages` → `message_length`
**A6 Directness.** `I soften things` ↔ `I say the thing` → `direct_diplomatic`
**A7 Duration.** *"What's the right length for a catch-up?"* → `preferred_duration`
`An hour of coffee` · `Two or three hours` · `Half a day` · `Take the whole day`
**A8 Energy peak.** *"When are you most yourself?"* → `energy_peak`
`Early morning` · `Afternoon` · `Evening` · `Late night`

---

## 4. Deepening B — Emotional Rhythm (9 questions)

Introduce the section honestly:
> *"This part is what makes Soul Tribe different from an interests list. It's about how you
> actually are in friendships — the pace you open up, how much contact feels right, what you do
> when something's off. Nobody sees your answers. They only shape who we suggest, and how we
> explain it."*

**B1 Opening pace** → `er_opening_pace`
`I open up slowly, but I mean it when I do` · `It takes a few meetings` ·
`I'm fairly open early on` · `I'll tell you my life story on day one`

**B2 Contact need** → `er_cadence_need`
`I'm happy going weeks without talking — we pick up where we left off` ·
`A check-in now and then` · `Something most weeks` · `I like near-daily contact`

**B3 Contact expectation** → `er_cadence_expect` — same options, asked as
*"And what would you want from them?"*

**B4 Reassurance need** → `er_reassurance_need`
`I don't need reassuring — I assume we're fine` ↔ `I like knowing where I stand`

**B5 Reassurance offering** → `er_reassurance_offer`
`I'm not a checking-in person` ↔ `I'm the one who notices you've gone quiet`

**B6 Recovery** → `er_recovery_time`
*"After a big social day, what do you need?"*
`Straight into the next thing` · `An evening to myself` · `A quiet day` · `A quiet few days`

**B7 Conflict** → `er_conflict_approach`
*"Something a friend did bothered you. What actually happens?"*
`I let it go and move on` · `I sit with it and it usually fades` ·
`I'd bring it up if it happened again` · `I'd rather say it now than let it sit`

**B8 Support style** → `advice_vs_listening_self` / `_expect`
*"When a friend is struggling, you…"* `Listen` ↔ `Help them fix it`
*"And when you're struggling, you want…"* `To be heard` ↔ `Practical help`

**B9 Vulnerability + boundaries** → `vulnerability_comfort`, `boundary_clarity`
*"How do you feel about difficult conversations?"*
`I'd rather keep things light` · `With the right person, gradually` ·
`I'm comfortable going there` · `It's how I know someone's real`

---

## 4.1. Stage B — Tribal Pass Questions (8 questions)

### Reliability
**B-R1 — Reliability (self).** *"When a plan falls through last minute, what do you usually do?"*
→ `trait_emotional.reliability_self`
`I roll with it and reschedule easily` (0.4) · `I make sure to follow through or give early notice` (0.8) · `I take commitments very seriously and expect the same` (0.95)

**B-R2 — Reliability (expectation).** *"And what level of reliability do you look for in friends?"*
→ `trait_emotional.reliability_expect`
`Easygoing — cancellations happen, no big deal` (0.3) · `Generally reliable — advance notice when plans change` (0.7) · `High reliability — keeping plans is essential to trust` (0.95)

### Initiation Preference
**B-I1 — Initiation (self).** *"In your friendships, who usually suggests getting together?"*
→ `trait_communication.initiation_self`
`I'm usually the one initiating and bringing people together` (0.85) · `It's balanced — I initiate as often as I accept` (0.5) · `I'd rather be invited or go with the flow` (0.2)

**B-I2 — Initiation (expectation).** *"How do you feel if you're always the one initiating?"*
→ `trait_communication.initiation_expect`
`Doesn't bother me — I enjoy organizing` (0.2) · `Fine for a while, but I like mutual effort` (0.6) · `Draining — I need the other person to initiate too` (0.9)

### Communication Pace
**B-C1 — Response speed (self).** *"When you receive a text from a friend, how fast do you usually reply?"*
→ `trait_communication.response_speed_self`
`Within minutes or hours` (0.85) · `Same day when I get a moment` (0.6) · `Over a few days — I reply when I have head space` (0.25)

**B-C2 — Contact frequency (expectation).** *"How often do you expect or hope to hear from close friends?"*
→ `trait_communication.contact_frequency_expect`
`Near daily check-ins` (0.9) · `A few times a week` (0.65) · `Weekly or bi-weekly is great` (0.4) · `Occasional catch-ups — weeks between is fine` (0.2)

### Humour & Playfulness
**B-P1 — Playfulness.** *"In social conversations, your natural vibe is..."*
→ `trait_personality.serious_playful`
`Playful, banter-filled, and lighthearted` (0.85) · `A mix of casual fun and genuine depth` (0.5) · `Thoughtful, serious, and focused on substance` (0.15)

**B-P2 — Social intensity.** *"When engaging in activities or discussions, your style is..."*
→ `trait_personality.intensity_easygoing`
`Easygoing, relaxed, low-pressure` (0.2) · `Balanced — engaged without overwhelming` (0.5) · `Intense, passionate, and deeply engaged` (0.85)

---

## 4.2. Stage C — Unlocked After First Outing / Sharpen List (8 questions)

### Conflict Style
**C-CF1 — Conflict approach.** *"Something a friend did bothered you. What usually happens?"*
→ `trait_emotional.er_conflict_approach`
`I let it go and let it fade` (0.2) · `I sit with it and bring it up if it happens again` (0.5) · `I'd rather address tension directly and early` (0.85)

**C-CF2 — Recovery time.** *"After a big social outing or intense interaction, what do you need?"*
→ `trait_emotional.er_recovery_time`
`Ready for the next thing immediately` (0.1) · `An evening of quiet downtime` (0.5) · `A day or two of alone time to recharge` (0.85)

### Vulnerability
**C-V1 — Vulnerability comfort.** *"How comfortable are you going deep into personal struggles with friends?"*
→ `trait_emotional.vulnerability_comfort`
`I prefer keeping things light and positive` (0.2) · `I open up gradually over time with trusted people` (0.6) · `I'm comfortable being deeply vulnerable early on` (0.9)

**C-V2 — Expressiveness.** *"How openly do you express your emotions to friends?"*
→ `trait_emotional.expressiveness`
`I keep my feelings private and contained` (0.2) · `I express how I feel when asked or relevant` (0.6) · `I'm an open book — very expressive` (0.9)

### Novelty Seeking
**C-N1 — Novelty seeking.** *"When picking an activity for the weekend, you prefer..."*
→ `trait_personality.novelty_seeking`
`Tried-and-true spots and familiar rituals` (0.2) · `A blend of familiar favorites and new spots` (0.55) · `Exploring completely new places and unusual ideas` (0.9)

**C-N2 — Experience novelty.** *"How often do you seek out entirely new social or cultural experiences?"*
→ `trait_experience.novelty`
`Rarely — I stick to what I know I like` (0.2) · `Occasionally — open when invited` (0.5) · `Constantly — seeking fresh horizons` (0.85)

### Social Frequency & Duration
**C-SF1 — Social frequency.** *"How frequently do you like meeting up with close friends?"*
→ `trait_social_rhythm.social_freq_self`
`A few times a week` (0.85) · `Weekly` (0.65) · `Every couple of weeks` (0.4) · `Monthly or less` (0.2)

**C-SF2 — Preferred duration.** *"What's the right length for a catch-up?"*
→ `trait_social_rhythm.preferred_duration`
`1 hour quick coffee` (60) · `2-3 hours relaxed meal/hang` (150) · `Half a day (4-5 hours)` (270) · `Whole day activity` (480)

---

## 5. Deepening C — Interests (ongoing)

Search-and-add against the interest tree. For each added interest, one tap sets affinity:

> **I love this** · **I do it regularly** · **I'm learning** · **I've always wanted to try**

The last option is deliberately prominent. It is what produces the best outings
(`04-matching-spec.md` §4.6), and it lets a thin profile still match well.

Prompt: *"Add three things you'd genuinely want someone to invite you to — including things you
haven't done yet."*

---

## 6. Deepening D — Values (ongoing)

Show 13 values as cards. For each, two taps: **where you sit** (3-point) and **does it matter
that a friend shares this?** (`Not really` / `Somewhat` / `A lot`), plus a small lock icon for
`private`.

Copy above the section:
> *"You don't need friends who agree with you on everything. Tell us which ones you'd actually
> want to have in common."*

---

## 7. Lifestyle (folded into Core + settings)

Alcohol, smoking, activity level, food, pets, life stage, work schedule, travel frequency,
accessibility needs. Presented as neutral practical facts, never as virtues. Each has an
optional **"this is a dealbreaker for me"** toggle → `trait_lifestyle.dealbreakers`.

Accessibility needs are handled separately and never score against anyone — they constrain which
outings are suggested. Copy: *"Tell us what an outing needs so it works for you."*

---

## 8. Personality (folded into Deepening, 8 remaining sliders)

Conscientiousness, agreeableness, emotional stability, openness, serious↔playful,
intensity↔easygoing, assertive↔accommodating, novelty seeking. Written poles, never trait names.
Examples:
- `I like a plan` ↔ `I like to see what happens` (conscientiousness)
- `I keep things light` ↔ `I go all in on things` (intensity)
- `I go with the group` ↔ `I'll say what I want to do` (assertiveness)

---

## 9. Rules for the whole flow

- **Max 6 questions per screen, one idea per screen.** Illustrated ground behind each.
- Every question is skippable. Skipping lowers confidence, and the UI says so warmly, once.
- No question is ever asked twice across passes. Track `answered` per dimension.
- Free-text fields pass through a trust-and-safety check before saving.
- Never ask for: income, race, religion, nationality, health conditions, relationship status.
  None of them are inputs to the model and asking makes the product feel invasive.
- Show the DNA Bloom thickening in real time as answers land. It should feel like drawing.

---

## 10. Sample size sanity

Full model ≈ 62 questions across all passes. That is a lot — which is why only 12 are required
before matching turns on, and the rest are earned with visible payoff. Never present the full
set as a single form.

---

## 11. Trait → human phrase copy bank

The matching engine selects *which* traits to talk about; these phrases are what it hands to
the model, and what it falls back to if generation fails. One phrase per band. Extend as needed —
**never let the model invent trait descriptions from raw numbers.**

### Emotional Rhythm — opening pace (`er_opening_pace`)
| Band | Phrase |
|---|---|
| 0.0–0.25 | opens up slowly and is very loyal once comfortable |
| 0.25–0.5 | takes a few meetings to relax into a friendship |
| 0.5–0.75 | is fairly open early on |
| 0.75–1.0 | is open almost immediately |

### Contact cadence need (`er_cadence_need`)
| 0.0–0.25 | is happy going long stretches without contact and picks up where things left off |
| 0.25–0.5 | likes an occasional check-in |
| 0.5–0.75 | likes being in touch most weeks |
| 0.75–1.0 | likes near-daily contact |

### Conflict approach (`er_conflict_approach`)
| 0.0–0.3 | tends to let things go rather than raise them |
| 0.3–0.6 | will raise something if it keeps happening |
| 0.6–1.0 | would rather talk about tension than let it sit |

### Planning horizon (`planning_horizon`)
| 0.0–0.25 | plans same-day |
| 0.25–0.5 | plans a day or two ahead |
| 0.5–0.75 | plans about a week ahead |
| 0.75–1.0 | plans several weeks ahead |

### Depth (`trait_intent.depth`)
| 0 | is looking for people to do specific things with |
| 1 | is looking for easy, low-pressure friendships |
| 2 | wants friendships that are a regular part of the month |
| 3 | wants close friendships |
| 4 | wants a small inner circle |

### Group size (`group_size_pref`)
| 0.0–0.3 | prefers one-to-one |
| 0.3–0.6 | prefers groups of three or four |
| 0.6–1.0 | enjoys larger groups |

*(Build the same table for extraversion, intensity, response speed, initiation, novelty,
activity level, energy peak, and duration. Store them in
`packages/core/explain/phrases.ts` as a typed lookup, one file, easy to edit.)*

### Friction phrasing rules
- Name both people's positions. Never state one as the correct one.
- Use "tends to", "usually", "would rather" — not "is" or "needs".
- Never use: avoidant, anxious, needy, clingy, cold, difficult, incompatible, red flag.
- The friction section ends without advice. Do not tell people how to fix each other.
