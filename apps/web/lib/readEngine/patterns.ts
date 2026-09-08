import type {EvidenceBundle, Source} from './evidence';
import type {ReadClaim} from './compose';

// Conditions, not member names or random seeds, choose the interpretation.
// Each clause carries all its operands. A preference is never a personality diagnosis.
export function contextualClaims(bundle:EvidenceBundle):ReadClaim[] {
  const profileHeadlines:Record<string,string>={
    'depth-with-air':'A return that does not need an apology','outward-and-lively':'When introductions become familiar faces',
    'action-while-alive':'Give the promising exchange a next step','playful-discovery':'Room for the day to change its mind',
    'depth-with-continuity':'Familiarity grows between the big conversations','small-and-curious':'Enough attention for the next question',
    'humour-and-depth':'Two registers in the same friendship','thought-return':'Keeping someone inside an ordinary day',
    'listen-and-make-sense':'The handover between listening and helping','values-room':'Inclusion without proving you belong',
    'growth-in-company':'A thought need not arrive finished','quiet-with-adventure':'Notice the unfamiliar together',
    'novelty-with-outline':'Let discovery happen inside the day','home-and-belonging':'Familiar company without an occasion',
    'notice-and-spontaneity':'Interest still needs room in the week','quality-not-duty':'Being asked without being kept on call',
    'repeatable-ritual':'Let a small plan become familiar','activity-as-door':'The experience beside the conversation',
    'lively-beginning':'Notice who you want to return to','dependable-with-room':'Freedom with follow-through',
    'playful-and-thoughtful':'A joke with room for another thought','space-and-small-ritual':'A pause that can remain comfortable',
  };
  const out:ReadClaim[]=[];
  const find=(dimension:string,options:string[],subject:Source['subject']='self')=>bundle.sources.find(s=>s.subject===subject&&s.dimension===dimension&&s.selections.some(x=>options.includes(x)));
  const rule=(id:string,slot:string,conditions:[string,string[]][],title:string,early:string,profile:string)=>{
    const found=conditions.map(([d,o])=>find(d,o));
    if(found.some(s=>!s))return;
    const sources=[...new Map((found as Source[]).map(s=>[s.id,s])).values()];
    out.push({id,slot,sourceIds:sources.map(s=>s.id),threads:[...new Set(sources.map(s=>s.thread))],dimensions:[...new Set(sources.map(s=>s.dimension))],evidenceLevel:sources.length>1?'CROSS-THREAD PATTERN':'SUPPORTED INFERENCE',text:bundle.level==='early'?early:profile,title:bundle.level==='early'?title:profileHeadlines[id],priority:20+sources.length,shape:'contextual'});
  };
  rule('depth-with-air','social',[['intent',['Close circle','Real conversations']],['connectionChoice',['Every couple of weeks','Weeks/Months can pass, we’re still good']]],'Close, without keeping count',
    'You may want a friendship that stays meaningful without staying constantly in touch. The test is what happens when you return, not how often the phone lights up.',
    'Depth and breathing room are not opposites in the friendship you want. You seem to be looking for a connection that can survive an ordinary quiet stretch, then pick up somewhere real. Someone who measures closeness in daily messages may need to hear that distinction.');
  rule('outward-and-lively','social',[['intent',['Wider social circle']],['groupChoices',['Big energy','Social mix']]],'An opening, not a fixed circle',
    'A lively room may offer the possibility you are looking for: another conversation, another person, a way for the circle to grow without planning the whole friendship first.',
    'Your wish to widen the circle fits a setting where conversations can move. You may enjoy the possibility of a new connection before knowing what place it will take in your life. The useful next step could be noticing which exchange you want to return to, so a room full of introductions can become more than one busy evening.');
  rule('action-while-alive','connect',[['clicks',['We actually make plans happen']],['planningChoice',['Same day','1–2 days']]],'Catch the idea while it is alive',
    'A promising exchange may feel better when it can become a plan before the energy goes flat. A small invitation could suit you better than keeping something indefinitely in mind.',
    'You want a connection to move beyond messages, with little distance between the idea and the invitation. That can give friendship momentum. A person who needs more notice may still be interested, so offer another date before interpreting a missed spontaneous plan as a missed connection.');
  rule('playful-discovery','bring',[['desiredQualities',['Playful']],['desiredQualities',['Adventurous','Free-spirit']]],'Company that leaves the day open',
    'You may be drawn to someone who brings a little play and possibility into the day. The appeal is company that can respond to an idea, not just follow an itinerary.',
    'The qualities you want suggest an appetite for shared improvisation: someone who can enjoy a turn the day did not announce in advance. That does not tell us how either of you will handle every plan. It gives you a useful first question: what kind of unplanned moment would be welcome to both of you?');
  rule('depth-with-continuity','social',[['intent',['Close circle','Real conversations']],['connectionChoice',['A few times a week','About once a week']]],'A place in each other’s ordinary days',
    'A good conversation may be the beginning, but returning to it matters too. You appear to want friendship woven into life, rather than saved for the occasional big catch-up.',
    'For you, the wish for depth comes with a wish for continuity. Repeated contact can let the smaller pieces of a life become familiar, without every meeting needing a headline. The promising connection is one with room for another conversation, not just a memorable first one.');
  rule('small-and-curious','social',[['groupChoices',['1:1','Small circle']],['intent',['New perspectives','Real conversations']]],'Less room to perform, more room to follow',
    'You may be looking for the kind of company where a thought gets followed, not lost between introductions. A smaller gathering gives your curiosity somewhere to stay.',
    'A small setting and an appetite for another perspective suggest that the number of people is not the whole point. You may want enough room to ask the next question and hear an answer change shape. A conversation with somewhere to go could matter more than meeting everyone in the room.');
  rule('humour-and-depth','connect',[['clicks',['Our humour just lands']],['clicks',['We skip the small talk','They make me think differently']]],'The laugh is a doorway',
    'Humour may make the first step feel unforced; you still want somewhere more interesting to go afterwards. Lightness can open the conversation without setting its limit.',
    'You seem drawn to a connection that can change register: a ridiculous moment, then a thought worth staying with. Neither seriousness nor humour has to occupy the whole friendship. Someone who can move between them may leave you feeling less divided into your entertaining and thoughtful sides.');
  rule('thought-return','connect',[['messagingStyle',['Random thoughts','Memes']],['connectionChoice',['About once a week','Every couple of weeks']]],'A small thing can keep the door open',
    'Contact need not wait for a polished life update. A small thing that brings someone to mind can be enough of a reason to return.',
    'Your way of messaging and the space you leave between catch-ups suggest a light thread rather than a running report. Sharing the passing thought may be how you keep someone included. It can help to make that invitation legible: a small message can mean “you were in my day,” without demanding a long exchange.');
  rule('listen-and-make-sense','connect',[['supportStyle',['Listen']],['supportStyle',['Make sense of it','Advice','Solve it']]],'Hear it before trying to hold it',
    'You want to make room for someone’s experience as well as help with it. Asking what they need could keep those two intentions working together.',
    'There are two movements in the support you chose: making space for the story and wanting to do something useful with it. The delicate part may be the handover. A question about whether someone wants company or ideas can keep practical care from arriving before they feel heard.');
  rule('values-room','bring',[['coreValues',['Freedom']],['intent',['Close circle','Sense of community']]],'Belonging with a door that opens',
    'Belonging appeals, but so does room to choose your own way. You may want a circle that includes you without closing around you.',
    'Freedom sits beside your wish for belonging. That can point towards a friendship where inclusion is dependable but participation is not constantly negotiated. A warm invitation with an easy way to say “not this time” may feel more generous than a demand to prove that you are part of the circle.');
  rule('growth-in-company','bring',[['coreValues',['Growth','Curiosity']],['intent',['New perspectives','Real conversations']]],'Company that changes the angle',
    'You may want more than agreement from a friend. A different angle can be part of the attraction, provided there is room to explore it together.',
    'Curiosity in what matters to you meets a wish for conversations that bring something new. A friendship may feel alive when neither person has to arrive with a finished opinion. The useful difference is one that opens a thought, rather than turns every exchange into something to win.');
  rule('quiet-with-adventure','best',[['idealSaturday',['Exploring','Outdoors']],['socialVibe',['Calm','Intimate']]],'Discovery without the rush',
    'An unfamiliar place need not mean a high-volume day. You may enjoy a little discovery with enough quiet left to notice it.',
    'Your taste for exploring sits alongside a calmer social atmosphere. That suggests novelty in what you experience, not necessarily intensity in how you experience it. A walk somewhere new can offer movement and conversation without making the day a performance of having fun.');
  rule('novelty-with-outline','best',[['idealSaturday',['Exploring']],['spontaneousTrip',['Not without itinerary','24 hours notice needed']]],'A settled edge around something new',
    'You may enjoy being surprised by a place more than being surprised by the plan. A little structure can make exploration easier to say yes to.',
    'The unfamiliar appeals; uncertainty about getting there appears less welcome. Those preferences can work together: settle the shape of the day, then leave room for discovery inside it. A friend who mistakes advance planning for a lack of adventure could miss what actually makes exploration possible for you.');
  rule('home-and-belonging','best',[['idealSaturday',['Home','Slow coffee']],['intent',['Close circle','Sense of community']]],'An ordinary afternoon, with a place for you',
    'Friendship may feel promising when it can fit into an ordinary day. The occasion need not be impressive for the company to matter.',
    'The quieter afternoon you chose fits your wish for belonging. You may be looking for company that becomes easy to include in everyday life, rather than another event to prepare for. Familiarity could grow through the unremarkable meetings that are welcome enough to happen again.');
  rule('notice-and-spontaneity','friction',[['planningChoice',['About a week','1–2 weeks ahead','A few days']],['clicks',['We actually make plans happen']]],'The invitation needs somewhere to land',
    'Follow-through appeals, but an invitation still needs enough notice to fit your life. Enthusiasm and availability are not the same answer.',
    'You want the connection to become an actual plan, yet notice matters to how you make room for it. A late invitation could receive a no even when the person would have received a yes. Naming that early may prevent a scheduling mismatch from being read as a lack of interest.');
  rule('quality-not-duty','friction',[['desiredQualities',['Proactive']],['connectionChoice',['Every couple of weeks','Weeks/Months can pass, we’re still good']]],'An invitation, without a running obligation',
    'You appreciate someone who reaches out, while leaving plenty of space between conversations. It may help to distinguish a welcome invitation from an expectation of constant contact.',
    'Wanting a proactive friend does not mean wanting a busy phone. Your preferred gaps suggest that an invitation can feel generous while an ongoing demand to respond would feel different. Letting someone know which kind of initiative you welcome could save both of you some guessing.');
  rule('repeatable-ritual','doing',[['outings',['Coffee & Cafes','Boardgames & Gaming','Games Nights']],['intent',['Close circle','Sense of community']]],'Something easy to do again',
    'A first outing could work best as the beginning of a small ritual. Choose something you would genuinely want to do again with the same people.',
    'The outings you chose can give belonging a practical shape: a familiar table, something to share, a reason for another meeting. The useful plan may not be the most original one. It is the one that leaves enough room to notice the person and enough ease to suggest next time.');
  rule('activity-as-door','doing',[['outings',['Nature & Hiking','Art & Museums','Indie Cinema','Photo Walks']],['intent',['People to do things with','New perspectives']]],'Let the day give you something to talk about',
    'Doing something together may give conversation a natural starting point. There is less pressure to manufacture a connection when you already have something to notice.',
    'You have chosen experiences that can put something between you to respond to. That can take pressure off the introduction: a scene, a view or an idea gives the exchange a starting point. Leave some unhurried time around the activity so the person does not disappear behind the plan.');
  rule('lively-beginning','doing',[['outings',['Drinks & Bar Hopping','Parties & Nightlife','Live Music & Gigs']],['groupChoices',['Big energy','Social mix']]],'Let the evening make the introduction',
    'A little movement around you may make meeting someone feel less like an interview. Choose an evening with room to join in, step aside and return to a conversation.',
    'Your outing choices and the social setting you enjoy suggest an introduction with something already happening around it. That can give you ways into conversation without needing to sustain one exchange all evening. Leave a quieter moment somewhere inside the plan, so the person you notice does not remain only someone you met in the crowd.');
  rule('dependable-with-room','bring',[['desiredQualities',['Reliable']],['desiredQualities',['Independent','Free-spirit']]],'Steady does not have to mean scheduled',
    'You may want someone who follows through without making friendship feel supervised. Room for separate lives and care for a shared plan can belong together.',
    'The company you are looking for combines follow-through with freedom. That is a preference for how the friendship works, not proof of anyone’s character: a plan can be dependable while the lives around it remain independent. Saying what actually counts as keeping a promise could make that balance easier to find.');
  rule('playful-and-thoughtful','bring',[['desiredQualities',['Playful']],['desiredQualities',['Depth','Thoughtful','Curious']]],'Lightness with something underneath',
    'Playfulness appeals, but not at the cost of attention or depth. You may want a friend who can make a moment lighter without making everything a joke.',
    'You are looking for lightness that can notice when a moment asks for something else. The attractive quality may be range: room for amusement and room to stay with a thought. A lively first exchange is a beginning; whether both modes have a place is something to discover over time.');
  rule('space-and-small-ritual','connect',[['connectionChoice',['Every couple of weeks','Weeks/Months can pass, we’re still good']],['clicks',['Comfortable silence feels easy']]],'Nothing to prove in every pause',
    'Quiet seems to have room in your picture of connection, both during a meeting and between them. Ease may mean not having to fill every space.',
    'Comfortable silence and room between catch-ups point towards a friendship that need not keep demonstrating itself. A pause can simply be part of the rhythm you want. Making that preference explicit may help a more contact-oriented friend understand the space without having to read your mind.');
  return out;
}
