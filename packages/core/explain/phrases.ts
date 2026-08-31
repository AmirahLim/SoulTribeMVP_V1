export interface PhraseLookup {
  openingPace(val: number): string;
  cadenceNeed(val: number): string;
  conflictApproach(val: number): string;
  planningHorizon(val: number): string;
  depth(val: number): string;
  groupSize(val: number): string;
  extraversion(val: number): string;
  responseSpeed(val: number): string;
  initiation(val: number): string;
  budgetBand(val: number): string;
  activityLevel(val: number): string;
}

export const PHRASES = {
  openingPace(val: number): string {
    if (val <= 0.25) return 'opens up slowly and is very loyal once comfortable';
    if (val <= 0.5) return 'takes a few meetings to relax into a friendship';
    if (val <= 0.75) return 'is fairly open early on';
    return 'is open almost immediately';
  },

  cadenceNeed(val: number): string {
    if (val <= 0.25) return 'is happy going long stretches without contact and picks up where things left off';
    if (val <= 0.5) return 'likes an occasional check-in';
    if (val <= 0.75) return 'likes being in touch most weeks';
    return 'likes near-daily contact';
  },

  conflictApproach(val: number): string {
    if (val <= 0.3) return 'tends to let things go rather than raise them';
    if (val <= 0.6) return 'will raise something if it keeps happening';
    return 'would rather talk about tension than let it sit';
  },

  planningHorizon(val: number): string {
    if (val <= 0.25) return 'plans same-day';
    if (val <= 0.5) return 'plans a day or two ahead';
    if (val <= 0.75) return 'plans about a week ahead';
    return 'plans several weeks ahead';
  },

  depth(val: number): string {
    const d = Math.round(val);
    if (d === 0) return 'is looking for people to do specific things with';
    if (d === 1) return 'is looking for easy, low-pressure friendships';
    if (d === 2) return 'wants friendships that are a regular part of the month';
    if (d === 3) return 'wants close friendships';
    return 'wants a small inner circle';
  },

  groupSize(val: number): string {
    if (val <= 0.3) return 'prefers one-to-one or small quiet catch-ups';
    if (val <= 0.6) return 'prefers groups of three or four';
    return 'enjoys larger groups';
  },

  extraversion(val: number): string {
    if (val <= 0.4) return 'recharges alone in quiet spaces';
    if (val <= 0.7) return 'balances quiet time with social catch-ups';
    return 'recharges around people and social energy';
  },

  responseSpeed(val: number): string {
    if (val <= 0.4) return 'replies when they get around to it';
    if (val <= 0.7) return 'replies within a day';
    return 'replies promptly to messages';
  },

  initiation(val: number): string {
    if (val <= 0.4) return 'prefers being invited to plans';
    if (val <= 0.7) return 'is comfortable suggesting or taking invites';
    return 'is usually the one initiating plans';
  },

  budgetBand(val: number): string {
    if (val <= 1) return 'prefers budget-friendly, low-cost outings';
    if (val <= 3) return 'is comfortable with mid-tier outings';
    return 'is open to premium higher-budget outings';
  },

  activityLevel(val: number): string {
    if (val <= 0.4) return 'prefers low-key, seated activities';
    return 'enjoys active, high-movement outings';
  },
};

/** Second-person forms, for sentences addressed to the viewer ("you ..."). */
export const PHRASES_YOU = {
  openingPace(val: number): string {
    if (val <= 0.25) return 'open up slowly and are very loyal once comfortable';
    if (val <= 0.5) return 'take a few meetings to relax into a friendship';
    if (val <= 0.75) return 'are fairly open early on';
    return 'are open almost immediately';
  },

  cadenceNeed(val: number): string {
    if (val <= 0.25) return 'are happy going long stretches without contact and pick up where things left off';
    if (val <= 0.5) return 'like an occasional check-in';
    if (val <= 0.75) return 'like being in touch most weeks';
    return 'like near-daily contact';
  },

  conflictApproach(val: number): string {
    if (val <= 0.3) return 'tend to let things go rather than raise them';
    if (val <= 0.6) return 'will raise something if it keeps happening';
    return 'would rather talk about tension than let it sit';
  },

  planningHorizon(val: number): string {
    if (val <= 0.25) return 'plan same-day';
    if (val <= 0.5) return 'plan a day or two ahead';
    if (val <= 0.75) return 'plan about a week ahead';
    return 'plan several weeks ahead';
  },

  depth(val: number): string {
    const d = Math.round(val);
    if (d === 0) return 'are looking for people to do specific things with';
    if (d === 1) return 'are looking for easy, low-pressure friendships';
    if (d === 2) return 'want friendships that are a regular part of the month';
    if (d === 3) return 'want close friendships';
    return 'want a small inner circle';
  },

  groupSize(val: number): string {
    if (val <= 0.3) return 'prefer one-to-one or small quiet catch-ups';
    if (val <= 0.6) return 'prefer groups of three or four';
    return 'enjoy larger groups';
  },

  extraversion(val: number): string {
    if (val <= 0.4) return 'recharge alone in quiet spaces';
    if (val <= 0.7) return 'balance quiet time with social catch-ups';
    return 'recharge around people and social energy';
  },

  responseSpeed(val: number): string {
    if (val <= 0.4) return 'reply when you get around to it';
    if (val <= 0.7) return 'reply within a day';
    return 'reply promptly to messages';
  },

  initiation(val: number): string {
    if (val <= 0.4) return 'prefer being invited to plans';
    if (val <= 0.7) return 'are comfortable suggesting or taking invites';
    return 'are usually the one initiating plans';
  },

  budgetBand(val: number): string {
    if (val <= 1) return 'prefer budget-friendly, low-cost outings';
    if (val <= 3) return 'are comfortable with mid-tier outings';
    return 'are open to premium higher-budget outings';
  },

  activityLevel(val: number): string {
    if (val <= 0.4) return 'prefer low-key, seated activities';
    return 'enjoy active, high-movement outings';
  },
};
