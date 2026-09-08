import {type ReadDraft} from './earlyRead';
import {groupChoices} from './sixQuestionOnboarding';
/** Describe explicit preferences, never invent traits or repeat private custom text. */
export function earlyReadSummary(d:ReadDraft):string {
 const first=d.intent.includes('Close circle')?'You’re looking for a close circle where familiar faces become part of everyday life.':d.intent.includes('People to do things with')?'You’re looking for people to share the doing, not just the talking.':'';
 const second=d.clicks.includes('We skip the small talk')?'You value conversations that get past the surface.':d.clicks.includes('Our humour just lands')?'Shared humour is one of your signs that a connection is clicking.':d.clicks.includes('Comfortable silence feels easy')?'You appreciate the ease of being together without filling every silence.':'';
 const third=groupChoices(d).includes('1:1')?'One-to-one time is one of the settings you want to make room for.':groupChoices(d).includes('Small circle')?'You’ve made room for small-circle moments, where everyone has a place in the conversation.':d.planningChoice==='Same day'?'You like leaving room for a plan that comes together on the day.':'';
 return [first,second,third].filter(Boolean).join(' ')||'Your notes below draw only on the answers you shared. You can correct any reading that misses the mark.';
}
