import {groupChoices,selectedLabels,type BaselineDraft} from './sixQuestionOnboarding';

export type ReadFeedback={status:'fits'|'not_quite';text:string;basis:string};
export type ReadDraft=BaselineDraft & {earlyReadFeedback?:Record<string,ReadFeedback>};
export type ReadCard={id:string;title:string;reading:string;evidence:string[];question:string;basis:string;feedback?:ReadFeedback};
export function buildEarlyRead(d:ReadDraft):ReadCard[] {
 const cards:ReadCard[]=[];
 const add=(id:string,title:string,reading:string,evidence:string[],question:string)=>{
  const basis=JSON.stringify(evidence);
  const feedback=validReadFeedback(d.earlyReadFeedback)?d.earlyReadFeedback?.[id]:undefined;
  cards.push({id,title,reading,evidence,question,basis,feedback:feedback?.basis===basis?feedback:undefined});
 };
 const intents=selectedLabels(d.intent,d.intentOther),clicks=selectedLabels(d.clicks,d.clicksOther),groups=groupChoices(d);
 const qualities=selectedLabels(d.desiredQualities,d.qualityOther),outings=selectedLabels(d.outings,d.outingOther);
 const deep=d.clicks?.includes('We skip the small talk');
 const quiet=d.clicks?.includes('Comfortable silence feels easy');
 if(d.intent?.includes('Close circle')&&deep) add('depth','Being known, not just included',
  'You may be looking for a friendship where attention deepens over time, rather than simply adding more people to your week. A smaller number of recurring connections could give that depth room to grow.',
  ['Close circle','We skip the small talk'],'Does depth help you open up, or do you need familiarity before you can go there?');
 else if(intents.length) add('intent','What friendship could make room for',
  d.intent?.includes('People to do things with')?'Doing something together may be your preferred doorway into friendship. A shared plan can make connection feel more natural than starting with an intense conversation.':'Your choices suggest that the kind of connection matters at least as much as meeting someone new. They describe what you are seeking now, not a fixed personality type.',
  intents,'Is this something missing lately, or something you already enjoy and want more of?');
 if(groups.length) add('setting','The room can change the connection',
  groups.length>1?'You chose more than one social setting. You may connect in different ways depending on the room and the people, rather than fitting one introvert-or-extrovert label.':groups[0]==='1:1'?'One-to-one space may make it easier to follow one person closely and feel followed in return. That preference does not tell us how confident or outgoing you are.':groups[0]==='Small circle'?'A small circle may offer a useful balance: enough voices to carry the conversation, with room to be noticed individually.':'You may enjoy connection with several things happening around you. We cannot tell yet whether that energises you, helps you settle in, or simply suits the activities you enjoy.',
  groups,'What changes for you when the group gets larger?');
 if(clicks.length) add('click','What may make connection feel easier',
  deep&&quiet?'You may want both depth and ease: room for a real conversation without having to fill every silence. Those are not opposites; feeling understood can make both possible.':d.clicks?.includes('Our humour just lands')?'Shared humour may help you recognise a connection before you can explain it. That does not mean you always want to be funny, or that serious conversation matters less.':d.clicks?.includes('They make me think differently')?'A different perspective may feel connecting rather than distancing when the exchange is respectful. We do not yet know where stimulating discussion starts to feel tiring.':'These are the moments you recognise as connection. They may be useful clues for choosing a first meeting, but do not establish how you act in every friendship.',
  clicks,'Which of these helps you relax, and which makes you curious to know more?');
 const contact=d.connectionChoice==='Other'?d.connectionOther:d.connectionChoice;
 const planning=d.planningChoice==='Other'?d.planningOther:d.planningChoice;
 const sparse=d.connectionChoice==='Weeks/Months can pass, we’re still good'||d.connectionChoice==='Every couple of weeks';
 if(contact||planning) add('rhythm','A rhythm that does not need translating',
  sparse&&deep?'You may want meaningful contact without constant contact. A friend could misread a quiet interval as distance unless you make that rhythm clear to each other.':d.planningChoice==='1–2 weeks ahead'||d.planningChoice==='About a week'?'Having a plan early may make friendship easier to fit into your life. It can be a way of making space for someone, rather than a sign that you dislike spontaneity.':d.planningChoice==='Same day'?'You may find it easier to say yes when you know how the day actually feels. A more advance-planning friend might need a different invitation rhythm, not necessarily be a worse fit.':'Your contact and planning preferences describe the rhythm you would like. They do not prove how often you initiate, how quickly you reply, or how consistently you follow through.',
  [contact,planning,...(sparse&&deep?['We skip the small talk']:[])].filter((v):v is string=>Boolean(v)),
  'Would a friend understand what a quiet week or a late invitation means for you?');
 if(qualities.length) add('qualities','What you want to feel with a friend',
  d.desiredQualities?.includes('Reliable')&&d.planningChoice==='Same day'?'You may value dependable follow-through without needing everything planned far ahead. Reliability and spontaneity can coexist, but your meaning of each matters.':'The qualities you want may reflect values you share, needs that have gone unmet, or ways you would like to grow. Your answers alone do not tell us which, and wanting a quality does not prove that you possess it.',
  [...qualities,...(d.desiredQualities?.includes('Reliable')&&d.planningChoice==='Same day'?['Same day']:[])],
  'Which of these do you naturally offer, and which do you most need from someone else?');
 if(outings.length) add('outings','A practical beginning',
  'These activities give a potential friendship somewhere concrete to begin. Trying one together could tell you more about your connection than a longer profile can. Shared activities are an invitation, not proof of chemistry.',
  outings,'Which would you actually say yes to this week?');
 return cards;
}

export function validReadFeedback(value:unknown):boolean {
 if(value===undefined)return true;
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 return Object.entries(value).length<=6&&Object.entries(value).every(([key,v])=>{
  const f=v as ReadFeedback;
  return ['depth','intent','setting','click','rhythm','qualities','outings'].includes(key)&&f&&['fits','not_quite'].includes(f.status)&&typeof f.text==='string'&&f.text.length<=240&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(f.text)&&typeof f.basis==='string'&&f.basis.length<=1000;
 });
}
