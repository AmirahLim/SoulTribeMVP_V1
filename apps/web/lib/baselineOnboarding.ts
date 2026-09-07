/** Versioned public form contract. Exact responses remain in private profile_answers. */
export const INTENTS = [
  "Close circle",
  "People to do things with",
  "Real conversations",
  "Wider social circle",
  "New perspectives",
  "Sense of community",
];
export const CLICKS = [
  "We skip the small talk",
  "Our humour just lands",
  "We share niche rabbit holes",
  "They make me think differently",
  "Comfortable silence feels easy",
  "We actually make plans happen",
];
export const GROUPS = ["1:1", "Small circle", "Social mix", "Big energy"];
export const OUTINGS = [
  "Specialty Coffee",
  "Food Hunts",
  "Gallery Hopping",
  "Pottery & Making",
  "Vinyl & Listening Bars",
  "Indie Gigs",
  "Indie Cinema",
  "Bookshops & Ideas",
  "Analog Photo Walks",
  "Nature & Trails",
  "Games Nights",
  "Neighbourhood Wanders",
];
export const AREAS = [
  "Ang Mo Kio",
  "Bedok",
  "Bishan",
  "Bukit Batok",
  "Bukit Merah",
  "Bukit Panjang",
  "Bukit Timah",
  "Choa Chu Kang",
  "Clementi",
  "Downtown Core",
  "Geylang",
  "Hougang",
  "Jurong East",
  "Jurong West",
  "Kallang",
  "Marine Parade",
  "Novena",
  "Orchard",
  "Outram",
  "Pasir Ris",
  "Punggol",
  "Queenstown",
  "River Valley",
  "Rochor",
  "Sembawang",
  "Sengkang",
  "Serangoon",
  "Singapore River",
  "Tampines",
  "Tanglin",
  "Toa Payoh",
  "Woodlands",
  "Yishun",
];
export const TRAVEL = [
  "Nearby",
  "Across my side of Singapore",
  "Anywhere in Singapore",
];
export const FLOW = [
  {
    key: "contact",
    label: "Between meetups, how often do you like friends to check in?",
    choices: [
      "Long gaps are okay",
      "Every few weeks",
      "About once a week",
      "A few times a week",
      "Most days",
    ],
  },
  {
    key: "planning",
    label: "A friend suggests meeting up. How much notice suits you?",
    choices: [
      "Same-day",
      "A day or two ahead",
      "A few days ahead",
      "About a week ahead",
      "Weeks ahead",
    ],
  },
  {
    key: "opening",
    label: "With a new friend, when do you share something personal?",
    choices: [
      "After trust builds over time",
      "After several meetups",
      "A little more each time",
      "Early, if we click",
      "Often in our first conversation",
    ],
  },
] as const;
export interface BaselineDraft {
  version: 2;
  step: number;
  intent: string[];
  clicks: string[];
  group: string;
  groupChoices?: string[];
  contact: number | null;
  planning: number | null;
  opening: number | null;
  outings: string[];
  handle: string;
  area: string;
  travel: string;
}
export const emptyDraft = (): BaselineDraft => ({
  version: 2,
  step: 1,
  intent: [],
  clicks: [],
  group: "",
  contact: null,
  planning: null,
  opening: null,
  outings: [],
  handle: "",
  area: "",
  travel: "",
});
const selected = (v: unknown, options: string[], min: number, max: number) =>
  Array.isArray(v) &&
  v.length >= min &&
  v.length <= max &&
  new Set(v).size === v.length &&
  v.every((x) => options.includes(x));
export function validStep(d: BaselineDraft, step: number): boolean {
  if (step === 1) return selected(d.intent, INTENTS, 1, 3);
  if (step === 2) return selected(d.clicks, CLICKS, 1, 3);
  if (step === 3) return selected(groupChoices(d), GROUPS, 1, 2);
  if (step === 4)
    return [d.contact, d.planning, d.opening].every(
      (x) => x !== null && [0, 0.25, 0.5, 0.75, 1].includes(x),
    );
  if (step === 5) return selected(d.outings, OUTINGS, 1, 5);
  return (
    /^[a-z0-9_]{3,20}$/.test(d.handle) &&
    AREAS.includes(d.area) &&
    TRAVEL.includes(d.travel)
  );
}
export function isDraft(value: unknown): value is BaselineDraft {
  if (!value || typeof value !== "object") return false;
  const d = value as BaselineDraft;
  return (
    d.version === 2 &&
    Number.isInteger(d.step) &&
    d.step >= 1 &&
    d.step <= 6 &&
    selected(d.intent, INTENTS, 0, 3) &&
    selected(d.clicks, CLICKS, 0, 3) &&
    selected(d.outings, OUTINGS, 0, 5) &&
    ["", ...GROUPS].includes(d.group) &&
    (d.groupChoices === undefined || (selected(d.groupChoices, GROUPS, 0, 2) && d.group === (d.groupChoices[0] || ''))) &&
    [d.contact, d.planning, d.opening].every(
      (x) => x === null || [0, 0.25, 0.5, 0.75, 1].includes(x),
    ) &&
    typeof d.handle === "string" &&
    d.handle.length <= 20 &&
    ["", ...AREAS].includes(d.area) &&
    ["", ...TRAVEL].includes(d.travel)
  );
}
export const completeDraft = (d: BaselineDraft) =>
  [1, 2, 3, 4, 5, 6].every((n) => validStep(d, n));
export const groupChoices = (d: BaselineDraft): string[] => d.groupChoices ?? (d.group ? [d.group] : []);
export function microInsight(d: BaselineDraft, step: number): string {
  if (step === 1)
    return d.intent.length
      ? `Making room for ${d.intent.join(" · ").toLowerCase()}.`
      : "";
  if (step === 2)
    return d.clicks.length
      ? `Your kind of click: ${d.clicks[0].replace(/^We |^Our |^They /, "").toLowerCase()}.`
      : "";
  if (step === 3)
    return groupChoices(d).length ? `Your sweet spot: ${groupChoices(d).join(' or ').toLowerCase()}.` : "";
  if (step === 4)
    return validStep(d, 4)
      ? `${FLOW[1].choices[d.planning! * 4]}. ${FLOW[2].choices[d.opening! * 4]}.`
      : "There is no right pace. Just yours.";
  return d.outings.length
    ? `${d.outings.slice(0, 2).join(" and ")}. A place to start together.`
    : "";
}
