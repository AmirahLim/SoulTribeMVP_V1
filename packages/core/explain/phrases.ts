import type { ProfileVector } from '../domain/types.ts';

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

export function getBondThreadPhrase(
  key: string,
  vecA: ProfileVector,
  vecB: ProfileVector,
  alignment: number
): string {
  const nameB = vecB.profile.display_name || 'Member';

  if (key === 'personality') {
    const extA = vecA.personality?.extraversion;
    const extB = vecB.personality?.extraversion;
    if (typeof extA === 'number' && typeof extB === 'number') {
      const phrA = PHRASES_YOU.extraversion(extA);
      const phrB = PHRASES.extraversion(extB);
      if (Math.abs(extA - extB) <= 0.25) {
        return `You both ${phrA}; your social energy paces comfortably together.`;
      }
      return `You ${phrA}, while ${nameB} ${phrB} — expect your interaction pace to vary naturally.`;
    }
  }

  if (key === 'communication') {
    const respA = vecA.communication?.response_speed_self;
    const respB = vecB.communication?.response_speed_self;
    if (typeof respA === 'number' && typeof respB === 'number') {
      const phrA = PHRASES_YOU.responseSpeed(respA);
      const phrB = PHRASES.responseSpeed(respB);
      if (Math.abs(respA - respB) <= 0.25) {
        return `You both ${phrA}; messaging expectations line up easily.`;
      }
      return `You ${phrA}, whereas ${nameB} ${phrB} — asynchronous communication works best.`;
    }
  }

  if (key === 'social_rhythm') {
    const planA = vecA.social_rhythm?.planning_horizon;
    const planB = vecB.social_rhythm?.planning_horizon;
    if (typeof planA === 'number' && typeof planB === 'number') {
      const phrA = PHRASES_YOU.planningHorizon(planA);
      const phrB = PHRASES.planningHorizon(planB);
      if (Math.abs(planA - planB) <= 0.25) {
        return `You both ${phrA}, making outing planning straightforward.`;
      }
      return `You ${phrA}, while ${nameB} ${phrB} — locking in outing dates early prevents schedule friction.`;
    }
  }

  if (key === 'intent') {
    const depthA = vecA.intent?.depth;
    const depthB = vecB.intent?.depth;
    if (typeof depthA === 'number' && typeof depthB === 'number') {
      const phrA = PHRASES_YOU.depth(depthA);
      const phrB = PHRASES.depth(depthB);
      if (Math.abs(depthA - depthB) <= 1) {
        return `You both ${phrA}; your friendship expectations are well-aligned.`;
      }
      return `You ${phrA}, whereas ${nameB} ${phrB} — setting clear boundaries around closeness helps.`;
    }
  }

  if (key === 'emotional') {
    const paceA = vecA.emotional?.er_opening_pace;
    const paceB = vecB.emotional?.er_opening_pace;
    if (typeof paceA === 'number' && typeof paceB === 'number') {
      const phrA = PHRASES_YOU.openingPace(paceA);
      const phrB = PHRASES.openingPace(paceB);
      if (Math.abs(paceA - paceB) <= 0.25) {
        return `You both ${phrA}; your comfort with opening up develops at a shared speed.`;
      }
      return `You ${phrA}, while ${nameB} ${phrB} — expect the first couple of meetings to feel uneven before it settles.`;
    }
  }

  if (key === 'interests') {
    const intA = vecA.interests?.map((i: any) => i.node_name || i.name) || [];
    const intB = vecB.interests?.map((i: any) => i.node_name || i.name) || [];
    const shared = intA.filter((name: string) => intB.includes(name));
    if (shared.length > 0) {
      return `You both chose ${shared.slice(0, 2).map((s: string) => `"${s}"`).join(' and ')}; shared activity themes come naturally.`;
    }
    if (intA.length > 0 && intB.length > 0) {
      return `You highlighted "${intA[0]}" while ${nameB} tagged "${intB[0]}" — an opportunity to introduce new activities.`;
    }
  }

  if (key === 'values') {
    const valA = vecA.values?.map((v: any) => v.value_name || v.value_key) || [];
    const valB = vecB.values?.map((v: any) => v.value_name || v.value_key) || [];
    const shared = valA.filter((name: string) => valB.includes(name));
    if (shared.length > 0) {
      return `You both value ${shared.slice(0, 2).map((s: string) => `"${s}"`).join(' and ')}; core worldview stances resonate strongly.`;
    }
    if (valA.length > 0 && valB.length > 0) {
      return `You prioritize "${valA[0]}" while ${nameB} values "${valB[0]}" — complementary life perspectives.`;
    }
  }

  if (key === 'lifestyle') {
    const bA = vecA.lifestyle?.budget_band;
    const bB = vecB.lifestyle?.budget_band;
    if (typeof bA === 'number' && typeof bB === 'number') {
      const phrA = PHRASES_YOU.budgetBand(bA);
      const phrB = PHRASES.budgetBand(bB);
      if (Math.abs(bA - bB) <= 1) {
        return `You both ${phrA}; outing venue choices match easily.`;
      }
      return `You ${phrA}, whereas ${nameB} ${phrB}.`;
    }
  }

  if (key === 'experience') {
    const gA = vecA.experience?.group_size_pref;
    const gB = vecB.experience?.group_size_pref;
    if (typeof gA === 'number' && typeof gB === 'number') {
      const phrA = PHRASES_YOU.groupSize(gA);
      const phrB = PHRASES.groupSize(gB);
      if (Math.abs(gA - gB) <= 0.25) {
        return `You both ${phrA}; preferred gathering environments match well.`;
      }
      return `You ${phrA}, while ${nameB} ${phrB}.`;
    }
  }

  if (key === 'geography') {
    const areaA = vecA.geography?.home_area || vecA.profile.home_area || 'Singapore';
    const areaB = vecB.geography?.home_area || vecB.profile.home_area || 'Singapore';
    if (areaA.toLowerCase() === areaB.toLowerCase()) {
      return `You are both based in ${areaA}; local meetups require minimal travel.`;
    }
    return `You are based in ${areaA} while ${nameB} is in ${areaB}.`;
  }

  if (alignment >= 0.70) return `Strong alignment in ${key.replace('_', ' ')} based on your shared answers.`;
  return `Balanced contrast in ${key.replace('_', ' ')} based on your reported preferences.`;
}

export function getHeadlineForAlignment(alignment: number): string {
  if (alignment >= 0.75) return 'Closely aligned';
  if (alignment >= 0.55) return 'Complementary';
  if (alignment >= 0.35) return 'Different rhythms';
  return 'Likely friction';
}
