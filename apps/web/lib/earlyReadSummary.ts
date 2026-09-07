import {type ReadDraft} from './earlyRead';
import {groupChoices} from './sixQuestionOnboarding';
/** Describe explicit preferences, never invent traits or repeat private custom text. */
export function earlyReadSummary(d:ReadDraft):string {
 const first=d.intent.includes('Close circle')?'You’re looking for a close circle where familiar faces become part of everyday life.':d.intent.includes('People to do things with')?'You’re looking for people to share the doing, not just the talking.':'You’re making space for new friendships that suit the life you’re building.';
 const second=d.clicks.includes('We skip the small talk')?'You value conversations that get past the surface.':d.clicks.includes('Our humour just lands')?'Shared humour is one of your signs that a connection is clicking.':d.clicks.includes('Comfortable silence feels easy')?'You appreciate the ease of being together without filling every silence.':'You notice the little moments that make being with someone feel easy.';
 const third=groupChoices(d).includes('1:1')?'One-to-one time is one of the settings you want to make room for.':groupChoices(d).includes('Small circle')?'You’ve made room for small-circle moments, where everyone has a place in the conversation.':d.planningChoice==='Same day'?'You like leaving room for a plan that comes together on the day.':'You want shared experiences that give a new friendship somewhere to begin.';
 return [first,second,third].join(' ');
}
