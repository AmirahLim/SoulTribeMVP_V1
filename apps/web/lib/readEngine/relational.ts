import type {EvidenceBundle,Source} from './evidence';
import type {ReadClaim} from './compose';
import {pairVoice} from './pairVoice';
import {measuredPosition} from './legacy';

// These are categorical meanings, not inferred scores or renamed original answers.
const positions:Record<string,Record<string,string>>={
 groupChoices:{'1:1':'give one person your undivided attention','Small circle':'let a small circle carry the conversation','Social mix':'move between different conversations','Big energy':'find momentum in a lively gathering'},
 groupSize:{'One-on-one':'give one person your undivided attention','3–4 people':'stay with a conversation in a small circle','5–8 people':'have several people in the conversation','Big group':'be part of a larger gathering','Depends':'let the people and occasion decide the size of the gathering'},
 connectionChoice:{'A few times a week':'keep contact woven through the week','About once a week':'give the friendship a regular weekly return','Every couple of weeks':'leave breathing room between catch-ups','Weeks/Months can pass, we’re still good':'let long gaps pass without treating the friendship as over'},
 planningChoice:{'Same day':'let an open day become an invitation','1–2 days':'make a plan while the idea is still fresh','A few days':'have a little notice to make room','About a week':'put the meeting in the calendar before the week fills','1–2 weeks ahead':'set time aside well before the day arrives'},
 intent:{'Close circle':'build a circle you can belong to','People to do things with':'let shared activities be a beginning','Real conversations':'get beyond the opening conversation','Wider social circle':'make room for new people','New perspectives':'find an angle you would not reach alone','Sense of community':'feel part of something beyond separate introductions'},
 clicks:{'Our humour just lands':'recognise ease in a joke that lands','We skip the small talk':'go beyond polite introductions','We share niche rabbit holes':'follow an interest as far as it goes','They make me think differently':'enjoy having a thought turned around','Comfortable silence feels easy':'leave a pause without rushing to fill it','We actually make plans happen':'turn a promising exchange into time together'},
 idealSaturday:{'Slow coffee':'let the afternoon unfold without much urgency','Outdoors':'give the day some open air','Hobbies':'spend time absorbed in something you enjoy','Exploring':'let an unfamiliar place give the day its shape','Social all day':'keep company around you through the day','Dinner-drinks':'make an evening of sitting down together','Home':'keep the day close to home','Spontaneous':'leave room for the day to change direction'},
 socialVibe:{'Intimate':'make room for a closer conversation','Playful-chaotic':'let the gathering be loose and playful','Intellectual':'follow a thought rather than just pass the time','Adventurous':'let the occasion take you somewhere unfamiliar','Calm':'keep some quiet around the conversation','High-energy':'enjoy a lively pace around you','Creative':'make something of the time together'},
 coreValues:{'Family':'make room for family in the life around a friendship','Freedom':'keep room for individual choice','Adventure':'leave a place for discovery','Community':'invest in a sense of belonging','Achievement':'make space for personal ambitions','Creativity':'give ideas somewhere to take shape','Growth':'leave room to change and learn','Stability':'keep a steady base beneath new experiences','Curiosity':'stay interested in what you do not yet know'},
 initiationChoice:{'I usually wait for theirs':'receive the first invitation','It goes both ways':'take turns opening the conversation','I usually send mine':'make the first move towards a plan'},
 spontaneousTrip:{'Already packing':'say yes before every detail is settled','Convince me':'hear what makes the idea worth rearranging things for','24 hours notice needed':'have time to make room before leaving','Not without itinerary':'know the shape of the trip before committing'},
};
const axes:Record<string,{title:string;consequence:string;difference:string}>={
 groupChoices:{title:'Room to notice each other',consequence:'There may be less work negotiating the setting, leaving more attention for the person inside it.',difference:'The place could set the tone before either of you says much. Choose a setting where the conversation can change size without either person losing their place.'},
 groupSize:{title:'The company around the conversation',consequence:'The gathering you both want could give the exchange room to continue, rather than make either person keep finding a way back in.',difference:'An introduction and a proper catch-up need not have the same headcount. Starting smaller can leave room to find out how the company feels.'},
 connectionChoice:{title:'What the quiet between meetings means',consequence:'A similar rhythm could save you from mistaking a normal pause for a message about the friendship.',difference:'The same quiet stretch may feel ordinary on one side and unfinished on the other. Naming what a pause means could matter more than trying to match every message.'},
 planningChoice:{title:'Before the invitation becomes a yes',consequence:'You could spend less energy negotiating when to decide, and more on choosing something you both want to do.',difference:'Interest in the person and room in the calendar can arrive at different times. Share the first idea early, then agree how much of the plan needs to be settled.'},
 intent:{title:'What you hope the meeting grows into',consequence:'That shared wish gives you a direction to explore, not a promise that the connection is already there.',difference:'You may welcome the same meeting for different reasons. Let what happens next reveal whether those wishes can grow alongside each other.'},
 clicks:{title:'The moment an introduction changes',consequence:'That could give you a recognisable opening. Leave room to discover whether the ease extends beyond the first exchange.',difference:'The moment that makes the meeting feel promising may arrive differently for each of you. One route into connection need not exclude the other.'},
 idealSaturday:{title:'A day neither person has to perform',consequence:'An ordinary outing could hold your attention without needing to become an event. Leave enough unplanned time for the person to come into focus.',difference:'A good first plan need not contain both ideal days. Choose a small piece each of you can genuinely enjoy, then leave the rest for another invitation.'},
 socialVibe:{title:'The atmosphere between you',consequence:'A familiar social atmosphere could make it easier to settle into the exchange rather than keep adjusting how you take part.',difference:'A gathering can hold more than one mood. Give it a quieter edge or a livelier stretch, without asking either person to stay in a register that does not suit them.'},
 coreValues:{title:'The life around the friendship',consequence:'That shared priority may make some choices easier to understand. It still leaves plenty to learn about how each of you lives it.',difference:'Different priorities need not become competing demands. The useful question is whether the friendship has room for the lives you are each trying to build.'},
 initiationChoice:{title:'Who gives the next meeting a beginning',consequence:'Knowing who tends to start can make an invitation easier to read, without making it a permanent job.',difference:'Taking different roles can help an invitation happen. Keep checking that the effort feels welcome and chosen, rather than quietly becoming one person’s responsibility.'},
 spontaneousTrip:{title:'The space between an idea and committing',consequence:'You may recognise a similar moment when a possibility becomes something you can say yes to.',difference:'Excitement is not the only ingredient in a yes. Agree what needs to be known before treating hesitation as a verdict on the company.'},
};

export function pairClaims(bundle:EvidenceBundle):ReadClaim[] {
 const result:ReadClaim[]=[];
 const add=(id:string,sources:Source[],title:string,text:string,tone:ReadClaim['tone'],priority:number)=>{
   const unique=[...new Map(sources.map(s=>[s.id,s])).values()];
   result.push({id,title,text,tone,priority,shape:id,sourceIds:unique.map(s=>s.id),threads:[...new Set(unique.map(s=>s.thread))],dimensions:[...new Set(unique.map(s=>s.dimension))],evidenceLevel:'DYADIC INFERENCE'});
 };
 for(const a of bundle.sources.filter(s=>s.subject==='self')){
   const bridgeAxes:Record<string,string>={connectionChoice:'measurement.trait_communication.contact_frequency_self',planningChoice:'measurement.trait_social_rhythm.planning_horizon',groupChoices:'measurement.trait_experience.group_size_pref',groupSize:'measurement.trait_experience.group_size_pref',initiationChoice:'measurement.trait_communication.initiation_self'};
   const counterpart=(x:Source,y:Source)=>bridgeAxes[x.dimension]===y.dimension||bridgeAxes[y.dimension]===x.dimension;
   const b=bundle.sources.find(s=>s.subject==='other'&&s.questionId===a.questionId)
     ??bundle.sources.find(s=>s.subject==='other'&&counterpart(a,s)&&s.selections.length===1&&a.selections.length===1);
   const ma=measuredPosition(a),mb=b&&measuredPosition(b);
   if(b&&Boolean(ma)!==Boolean(mb)){
     const fixed=ma?b:a,measured=ma??mb!;
     const fixedMeaning=positions[fixed.dimension]?.[fixed.selections[0]];
     if(fixedMeaning)add(`mixed-source:${a.questionId}:${b.questionId}`,[a,b],measured.title,
       ma?`Your earlier saved position suggests you tend to ${measured.position}. They now describe wanting to ${fixedMeaning}. Let the first plan make room for both, and check whether your older reading still fits.`
       :`You describe wanting to ${fixedMeaning}. Their earlier saved position suggests they tend to ${measured.position}. A first invitation can make room for those preferences without assuming the older measurement is their whole story.`,'context',4);
     continue;
   }
   if(b&&ma&&mb){
     const shared=ma.band===mb.band;
     add(`measured:${a.questionId}`,[a,b],ma.title,shared
       ?`Your earlier saved measurements both lean towards wanting to ${ma.position}. That may make this part of spending time together easier to negotiate; an actual meeting is still where you find out how it feels.`
       :`Your earlier saved measurement leans towards wanting to ${ma.position}; theirs towards wanting to ${mb.position}. Make room for that difference in the first invitation, rather than asking either person to quietly adapt.`,shared?'click':'context',3);
     continue;
   }
   const meaning=positions[a.dimension],axis=axes[a.dimension];
   if(!b||!meaning||!axis)continue;
   const common=a.selections.filter(v=>b.selections.includes(v)&&meaning[v]);
   const av=a.selections.find(v=>meaning[v]&&!b.selections.includes(v));
   const bv=b.selections.find(v=>meaning[v]&&!a.selections.includes(v));
   if(common.length)for(const value of common) add(`shared:${a.questionId}:${value}`,[a,b],axis.title,
     `You both want to ${meaning[value]}. ${axis.consequence}`,'click',8);
   if(av&&bv){
     const friction=['connectionChoice','planningChoice'].includes(a.dimension);
     add(`difference:${a.questionId}:${av}:${bv}`,[a,b],axis.title,
       pairVoice(a.dimension,av,bv)??`You tend to ${meaning[av]}; they would rather ${meaning[bv]}. ${axis.difference}`,
       friction?'friction':'context',friction?9:6);
   }
 }
 // A paragraph is about the intersection, not two unrelated mini-profiles.
 const both=(dim:string,opts:string[])=>{
   const sources=(['self','other'] as const).map(who=>bundle.sources.find(s=>s.subject===who&&s.dimension===dim&&s.selections.some(v=>opts.includes(v))));
   return sources.every(Boolean)?sources as Source[]:null;
 };
 const pattern=(id:string,one:Source[]|null,two:Source[]|null,title:string,text:string)=>{
   if(one&&two)add(id,[...one,...two],title,text,'click',18);
 };
 pattern('shared-depth-space',both('intent',['Close circle','Real conversations']),both('connectionChoice',['Every couple of weeks','Weeks/Months can pass, we’re still good']),
   'A connection with room around it','You both want substance without asking contact to be constant. That combination could let a quiet stretch remain a pause, rather than something either person has to repair. The interesting test is whether returning feels easy enough to become a habit.');
 pattern('shared-depth-return',both('intent',['Close circle','Real conversations']),both('connectionChoice',['About once a week','A few times a week']),
   'Depth, with a next time','You both want a friendship that goes somewhere, and a rhythm that gives it somewhere to return. That could let the small details accumulate between the bigger conversations. Make room for ordinary contact too, so closeness does not depend on every meeting being profound.');
 pattern('shared-small-curiosity',both('groupChoices',['Small circle','1:1']),both('intent',['New perspectives','Real conversations']),
   'A conversation with space to change your mind','A smaller setting and an appetite for a more interesting conversation appear on both sides. You could have room to follow an unexpected thought without losing each other to the room. A first meeting with time around it may reveal more than a packed programme would.');
 pattern('shared-humour-action',both('clicks',['Our humour just lands']),both('clicks',['We actually make plans happen']),
   'Let the good exchange have another afternoon','Shared humour may give this a light beginning, while your mutual appetite for making plans gives the exchange a possible next step. The useful move is not a grand invitation: it is suggesting something while the conversation still feels alive.');
 pattern('shared-adventure-outline',both('idealSaturday',['Exploring','Outdoors']),both('spontaneousTrip',['Not without itinerary','24 hours notice needed']),
   'Explore the place, not the uncertainty','Discovery appeals to both of you, with a little structure around getting there. That could leave more attention for the experience instead of the unresolved arrangements. Settle the outline together, then leave something inside the day to discover.');
 // Outing names are literal plan anchors, never evidence of character or friction.
 const ao=bundle.sources.find(s=>s.subject==='self'&&s.dimension==='outings');
 const bo=bundle.sources.find(s=>s.subject==='other'&&s.dimension==='outings');
 if(ao&&bo)for(const value of ao.selections.filter(v=>bo.selections.includes(v)))
   add(`outing:${value}`,[ao,bo],`A beginning around ${value.toLowerCase()}`,
     `An outing around ${value.toLowerCase()} gives you a real starting point. Let the activity carry the introduction, then leave a little room afterwards to find out whether you want another conversation.`,'click',5);
 return result;
}
