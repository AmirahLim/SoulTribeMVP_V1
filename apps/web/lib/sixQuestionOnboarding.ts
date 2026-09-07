import { emptyDraft as legacyEmpty, isDraft as legacyIsDraft, validStep as legacyValid, completeDraft as legacyComplete, microInsight as legacyInsight, FRIEND_QUALITIES, OUTINGS as OLD_OUTINGS, type BaselineDraft as LegacyDraft } from './baselineOnboarding';
export { AREAS, CLICKS, FRIEND_QUALITIES, QUALITY_DETAILS, GROUPS, groupChoices, INTENTS, TRAVEL } from './baselineOnboarding';
export const OUTINGS = ['Specialty Coffee','Food Hunts','Ideas & Deep Dives','Drinks & Bar Hopping','Indie Cinema','Pottery & Making','Vinyl & Analog Culture','Nature & Hiking','Live Music & Gigs','Games Nights','Beach & Island Days','Photo Walks','Parties & Nightlife','Water Sports','Sports & Fitness'];
export const RHYTHM = [
 {key:'connectionChoice',other:'connectionOther',title:'Staying connected',prompt:'',choices:['A few times a week','About once a week','Every couple of weeks',"Weeks/Months can pass, we’re still good"]},
 {key:'planningChoice',other:'planningOther',title:'Making plans',prompt:'How much notice do you prefer?',choices:['Same day','1–2 days','A few days','About a week','1–2 weeks ahead']},
 {key:'punctualityChoice',other:'punctualityOther',title:'Punctuality',prompt:'What’s your vibe with timing?',choices:["I’m usually early",'On time','5–10 minutes either way is fine',"I’m pretty relaxed about timing"]},
] as const;
export type BaselineDraft = LegacyDraft & { flowVersion?:3; qualityOther?:string; outingOther?:string; connectionChoice?:string; connectionOther?:string; planningChoice?:string; planningOther?:string; punctualityChoice?:string; punctualityOther?:string; legacyAnswers?:LegacyDraft };
export const emptyDraft = ():BaselineDraft => ({...legacyEmpty(),flowVersion:3,qualityOther:'',outingOther:'',connectionChoice:'',connectionOther:'',planningChoice:'',planningOther:'',punctualityChoice:'',punctualityOther:''});
const textValid=(s:unknown)=>typeof s==='string' && s.length<=120 && !/[\u0000-\u001f\u007f]/.test(s);
const setValid=(a:unknown,options:readonly string[],max:number,min=0):a is string[]=>Array.isArray(a)&&a.length>=min&&a.length<=max&&new Set(a).size===a.length&&a.every(x=>typeof x==='string'&&options.includes(x));
const multi=(a:unknown,options:string[],other:unknown,max:number,required=false)=>setValid(a,[...options,'Other'],max,required?1:0)&&textValid(other)&&(!a.includes('Other')||!required||String(other).trim().length>0);
export function isDraft(value:unknown):value is BaselineDraft {
 if(!value||typeof value!=='object')return false;
 const d=value as BaselineDraft;
 if(d.flowVersion===undefined)return legacyIsDraft(d);
 if(d.flowVersion!==3||!Number.isInteger(d.step)||d.step<1||d.step>7)return false;
 const shape={...d,step:Math.min(d.step,6),desiredQualities:[],outings:[]};
 return legacyIsDraft(shape)&&multi(d.desiredQualities,FRIEND_QUALITIES,d.qualityOther,3)&&multi(d.outings,OUTINGS,d.outingOther,5)&&RHYTHM.every(r=>['','Other',...r.choices].includes(d[r.key] as never)&&textValid(d[r.other]));
}
export function validStep(d:BaselineDraft,step:number):boolean {
 if(d.flowVersion!==3)return legacyValid(d,step);
 if(step<=3)return legacyValid(d,step);
 if(step===4)return multi(d.desiredQualities,FRIEND_QUALITIES,d.qualityOther,3,true);
 if(step===5)return RHYTHM.every(r=>r.choices.includes(d[r.key] as never)||(d[r.key]==='Other'&&textValid(d[r.other])&&!!d[r.other]?.trim()));
 if(step===6)return multi(d.outings,OUTINGS,d.outingOther,5,true);
 return legacyValid(d,6);
}
export const completeDraft=(d:BaselineDraft)=>d.flowVersion===3?isDraft(d)&&[1,2,3,4,5,6,7].every(s=>validStep(d,s)):legacyComplete(d);
export const selectedLabels=(values:string[]|undefined,other:string|undefined)=>(values??[]).map(v=>v==='Other'?other?.trim()||'Other':v);
export function microInsight(d:BaselineDraft,step:number):string {
 if(d.flowVersion!==3||step<=3)return legacyInsight(d,step);
 if(step===4)return d.desiredQualities?.length?`You value: ${selectedLabels(d.desiredQualities,d.qualityOther).join(' · ')}.`:'';
 if(step===5)return 'A rhythm that leaves room for both of you.';
 return selectedLabels(d.outings,d.outingOther).slice(0,2).join(' · ');
}
export function upgradeDraft(d:BaselineDraft):BaselineDraft {
 if(d.flowVersion===3)return d;
 // Preserve original answers without silently mapping changed activity or rhythm labels.
 return {...emptyDraft(),...d,flowVersion:3,step:Math.min(d.step,4),legacyAnswers:d,qualityOther:'',outingOther:'',outings:[],connectionChoice:'',connectionOther:'',planningChoice:'',planningOther:'',punctualityChoice:'',punctualityOther:'',contact:null,planning:null};
}
export function canonicalRhythm(d:BaselineDraft):BaselineDraft {
 if(d.flowVersion!==3)return d;
 return {...d,contact:({'A few times a week':.75,'About once a week':.5,'Every couple of weeks':.25,"Weeks/Months can pass, we’re still good":0} as Record<string,number>)[d.connectionChoice??'']??null,planning:({'Same day':0,'1–2 days':.25,'A few days':.5,'About a week':.75,'1–2 weeks ahead':1} as Record<string,number>)[d.planningChoice??'']??null};
}
