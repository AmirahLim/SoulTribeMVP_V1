import { describe, it, expect } from "vitest";
import {
  emptyDraft,
  validStep,
  isDraft,
  completeDraft,
  INTENTS,
  CLICKS,
  OUTINGS,
  GROUPS,
  TRAVEL,
  AREAS,
  microInsight,
} from "../baselineOnboarding";
import { toProfileVector } from "../profileAdapter";
describe("Five question baseline", () => {
  it('requires desired qualities but not opening pace for revised Q4', () => {
    const d = {...emptyDraft(), contact: 0, planning: 1};
    expect(validStep(d,4)).toBe(false);
    expect(validStep({...d,desiredQualities:['Curious','Reliable']},4)).toBe(true);
    expect(isDraft({...d,desiredQualities:['Curious','Curious']})).toBe(false);
    expect(isDraft({...d,desiredQualities:['Curious','Reliable','Playful','Proactive']})).toBe(false);
    expect(isDraft({...d,desiredQualities:['invented']})).toBe(false);
  });
  it('preserves two group choices, accepts legacy drafts and rejects excess or duplicates', () => {
    const d = {...emptyDraft(), group: GROUPS[0]};
    expect(validStep(d, 3)).toBe(true);
    expect(isDraft({...d, groupChoices: [GROUPS[0], GROUPS[3]]})).toBe(true);
    expect(isDraft({...d, groupChoices: GROUPS.slice(0, 3)})).toBe(false);
    expect(isDraft({...d, groupChoices: [GROUPS[0], GROUPS[0]]})).toBe(false);
    expect(isDraft({...d, groupChoices: [GROUPS[1]]})).toBe(false);
    expect(microInsight({...d, groupChoices: [GROUPS[0], GROUPS[3]]}, 3)).toContain('1:1 or big energy');
  });
  it("never converts an explicit unknown depth to a midpoint", () => {
    const v = toProfileVector({
      displayName: "Member",
      trait_intent: { intents: ["Close circle"], depth: null, answered: 1 },
    } as any);
    expect(v.intent?.depth).toBeUndefined();
  });
  it("starts with unknown flow and cannot claim an empty draft", () => {
    const d = emptyDraft();
    expect(d.contact).toBeNull();
    expect(d.planning).toBeNull();
    expect(d.opening).toBeNull();
    expect(completeDraft(d)).toBe(false);
    expect(isDraft(d)).toBe(true);
  });
  it("requires explicit choice on every control, including the midpoint", () => {
    const d = emptyDraft();
    d.contact = 0.5;
    d.planning = 0;
    expect(validStep(d, 4)).toBe(false);
    d.opening = 1;
    d.desiredQualities = ['Curious'];
    expect(validStep(d, 4)).toBe(true);
  });
  it("rejects unknown, duplicate and excess choices", () => {
    const d = emptyDraft();
    d.intent = INTENTS.slice(0, 4);
    expect(isDraft(d)).toBe(false);
    d.intent = [INTENTS[0], INTENTS[0]];
    expect(isDraft(d)).toBe(false);
    d.intent = ["invented"];
    expect(isDraft(d)).toBe(false);
    d.intent = [];
    d.outings = OUTINGS.slice(0, 6);
    expect(isDraft(d)).toBe(false);
  });
  it("accepts five outings and a complete profile setup", () => {
    const d = {
      ...emptyDraft(),
      intent: [INTENTS[0]],
      clicks: [CLICKS[0]],
      group: GROUPS[0],
      desiredQualities: ['Reliable'],
      contact: 0,
      planning: 0.5,
      opening: 1,
      outings: OUTINGS.slice(0, 5),
      handle: "mira_1",
      area: AREAS[0],
      travel: TRAVEL[0],
    };
    expect(completeDraft(d)).toBe(true);
    expect(completeDraft({ ...d, handle: "Mira" })).toBe(false);
    expect(completeDraft({ ...d, area: "street address" })).toBe(false);
  });
  it("location and handle cannot change an insight", () => {
    const d = { ...emptyDraft(), intent: [INTENTS[1]] };
    expect(microInsight(d, 1)).toBe(
      microInsight({ ...d, area: AREAS[0], handle: "other" }, 1),
    );
  });
});
