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
};
