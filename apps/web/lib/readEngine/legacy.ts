import type {EvidenceBundle,Source,ReadThread} from './evidence';
import {ONBOARDING_INTEREST_OPTIONS} from '@soul-tribe/core';
import catalog from '../onboardingQuestionCatalog.json';

// Read-only bridge for stored numeric measurements. Never reconstruct a question
// answer, write profile_answers, use browser drafts, or supply a missing midpoint.
// Narrow public, non-sensitive axes only. Emotional/repair detail is not bridged.
export const measuredAxes=[
 ['trait_communication','contact_frequency_self','communication','connect','Contact rhythm','leave space between conversations','keep contact woven into ordinary days'],
 ['trait_communication','initiation_self','initiative','connect','Invitations','receive an invitation before starting one','give an invitation its first move'],
 ['trait_social_rhythm','planning_horizon','social_rhythm','friction','Planning','leave plans open until nearer the day','set time aside before the day arrives'],
 ['trait_experience','novelty','experience','doing','Discovery','return to experiences that already feel familiar','let unfamiliar experiences give a meeting a beginning'],
 ['trait_experience','group_size_pref','experience','best','Gathering size','give a smaller gathering your attention','have a larger gathering around the conversation'],
 ['trait_personality','extraversion','personality','social','Social energy','leave quiet space around time with other people','have social activity around you'],
 ['trait_personality','intellectual_curiosity','personality','bring','Curiosity','stay close to practical, familiar experience','follow an unfamiliar idea together'],
] as const;
export const MEASUREMENT_SELECT='id,trait_communication(*),trait_social_rhythm(*),trait_experience(*),trait_personality(*),user_interests(interest_nodes(name))';
const newerDimensions:Record<string,string[]>={
 contact_frequency_self:['connectionChoice'],initiation_self:['initiationChoice'],planning_horizon:['planningChoice'],
 novelty:['idealSaturday','spontaneousTrip'],group_size_pref:['groupSize','groupChoices'],
 extraversion:['socialVibe'],intellectual_curiosity:['socialVibe'],
};
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'?v as Record<string,unknown>:{};
export function includeMeasurements(bundle:EvidenceBundle,row:unknown,subject:Source['subject']='self'):EvidenceBundle {
 const data=obj(row),sources=[...bundle.sources];
 // A newer fixed-choice thread takes precedence over an older numeric summary.
 for(const [table,field,thread] of measuredAxes){
   if(bundle.sources.some(s=>s.subject===subject&&newerDimensions[field].includes(s.dimension)))continue;
   const raw=data[table],record=obj(Array.isArray(raw)?raw[0]:raw),value=record[field];
   if(typeof record.answered!=='number'||record.answered<=0||typeof value!=='number'||!Number.isFinite(value)||value<0||value>1)continue;
   // Middle values do not justify a strong position. Do not turn them into prose.
   if(value>.35&&value<.65)continue;
   const dimension=`measurement.${table}.${field}`;
   sources.push({id:`${subject}:${dimension}`,questionId:dimension,questionVersion:null,path:dimension,subject,dimension,
     thread:thread as ReadThread,selections:[String(value)],provenance:'legacy',access:'public'});
 }
 const allowed=new Set([...ONBOARDING_INTEREST_OPTIONS,...(catalog.find(q=>q.questionId==='friendship.outings')?.options.map(o=>o.value).filter(v=>v!=='Other')??[])]);
 const interests=(Array.isArray(data.user_interests)?data.user_interests:[]).flatMap(value=>{
   const node=obj(value).interest_nodes;const name=obj(Array.isArray(node)?node[0]:node).name;
   return typeof name==='string'&&allowed.has(name)?[name]:[];
 });
 if(interests.length&&!bundle.sources.some(s=>s.subject===subject&&s.dimension==='outings'))
   sources.push({id:`${subject}:stored.interests`,questionId:'stored.interests',questionVersion:null,path:'user_interests',subject,dimension:'outings',thread:'interests',selections:[...new Set(interests)].sort(),provenance:'legacy',access:'public'});
 return {...bundle,sources,knownThreads:[...new Set(sources.map(s=>s.thread))]};
}
export function measuredPosition(s:Source){
 const axis=measuredAxes.find(([table,field])=>s.dimension===`measurement.${table}.${field}`);
 if(!axis||s.selections.length!==1)return;
 const n=Number(s.selections[0]);if(!Number.isFinite(n)||n<0||n>1||(n>.35&&n<.65))return;
 return {slot:axis[3],title:axis[4],position:n<=.35?axis[5]:axis[6],band:n<=.35?'low':'high'};
}
