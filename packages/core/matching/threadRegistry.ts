/** One display spine; initiative is a communication facet, never an extra weight. */
export const THREAD_NAMES = {
 personality:'Social Energy',communication:'How You Connect',intent:'Friendship Style',
 emotional:'Emotional Openness',values:'What Matters',interests:'Shared Interests',
 social_rhythm:'Social Rhythm',lifestyle:'Everyday Life',experience:'Outing Preferences',
 geography:'Where You’d Meet',initiative:'Social Initiative',repair:'Conflict & Repair',
} as const;
export const SCORED_THREAD_KEYS=Object.keys(THREAD_NAMES).filter(key=>key!=='initiative') as Exclude<keyof typeof THREAD_NAMES,'initiative'>[];
