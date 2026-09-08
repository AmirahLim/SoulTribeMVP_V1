// Literal, categorical positions. No scale is finer than the question supports.
// Angles are alternatives for a composition, never paragraphs printed together.
export type Voice = {title:string; early:string; profile:string; consequence:string};
const v=(title:string,early:string,profile:string,consequence:string):Voice=>({title,early,profile,consequence});
export const VOCABULARY:Record<string,Record<string,Voice>> = {
  punctualityPref:{
    Low:v('Time with a little give','The clock may not decide the quality of the meeting for you.','You leave room for timing to bend. Someone whose day depends on the agreed start may need you to distinguish flexibility from an open-ended wait.','An easy relationship with timing works best when the other person knows what to expect.'),
    Flexible:v('Room around the start','A little flexibility can leave the invitation feeling easy.','A flexible start can keep a meeting relaxed, provided both people know how much room there is. A quick update may do more than a strict rule.','Agree what flexible means before someone is left waiting.'),
    Important:v('Care begins before arriving','Keeping the agreed time may be part of how you want a plan to feel considered.','For you, care for the meeting may start before the conversation does. Knowing when someone will arrive can let you settle into the invitation rather than keep checking on it.','A friend may be pleased to see you and still approach the clock differently. Make the agreed start clear.'),
    Essential:v('A clear beginning matters','The time you agree on appears to matter to your ability to enjoy the plan.','A clear start seems to be a condition of an easy meeting for you. Say that directly, without making someone’s lateness a complete reading of how they feel about you.','Repeated uncertainty about arrival may be difficult even when the company itself is welcome.'),
  },
  cancellationStance:{
    Fine:v('Room for a changed day','A changed plan need not close the door to another invitation.','You leave room for a plan to change. It may help to say whether you would welcome a replacement date, so flexibility is not mistaken for indifference.','Someone more protective of a plan may need a clearer conversation about changes.'),
    'Context matters':v('The reason gets a hearing','What happened around a changed plan matters more than a rule on its own.','You want room for the circumstances around a cancellation. That leaves space for understanding while still allowing you to notice when a pattern is becoming difficult.','Explain the change instead of leaving the other person to supply a reason.'),
    Dislike:v('Keep a place for the plan','A plan matters once you have made room for it.','Once you have set time aside, a cancellation can take more out of the day than the missing outing. A clear explanation and another concrete invitation may matter more than an open-ended apology.','Discuss how to change a plan before a last-minute cancellation has to carry the whole conversation.'),
    Dealbreaker:v('An agreement you need to count on','Being able to count on a plan appears important to whether you want to continue making one.','You have set a firm boundary around cancellations. It is worth making clear what that includes and whether there are circumstances you would want to hear about, so the boundary is understood rather than discovered through a missed meeting.','This boundary needs an explicit conversation; the other person may not share the same expectation.'),
  },
  intent:{
    'Close circle':v('A place inside the circle','The invitation may be a beginning; a place in the company is what you are looking for.','Being included for the afternoon is not the whole wish. You want a circle you can belong to.','A friendship kept at the occasional invitation may leave you wanting more.'),
    'People to do things with':v('Company for the doing','A shared activity may be an easier beginning than a conversation with nowhere to go.','Give the meeting something to do. Company can grow around the activity, without the introduction carrying everything.','An invitation with a plan attached may reach you more easily than an open-ended catch-up.'),
    'Real conversations':v('Past the opening lines','You may be looking for a conversation that goes somewhere beyond the introductions.','The opening lines are a doorway, not the room you want to stay in. You want something real to talk about.','Someone content with surface conversation may not know what you are waiting to get to.'),
    'Wider social circle':v('Room for another face','A new face may be part of what you want from the room.','You want the circle to have room to grow. Familiar company need not be the only company.','A friend who keeps their circle closed may want a different kind of social life around the friendship.'),
    'New perspectives':v('A window you had not opened','A different way of seeing may be part of what draws you towards someone.','You are looking for a view you would not have found alone. Agreement need not be the most interesting part of the conversation.','A different opinion can be a beginning here, without having to become a debate.'),
    'Sense of community':v('Somewhere to belong','You may want a place in a community, beyond a collection of separate introductions.','The wish is for a place among people, not just another name in the phone.','A recurring gathering may offer something an isolated catch-up cannot.'),
  },
  groupChoices:{
    '1:1':v('Without the room to keep up with','With someone across from you, there may be more room to follow a thought.','Without a group conversation to keep up with, your attention has somewhere to stay.','Adding more people changes the meeting you were hoping for.'),
    'Small circle':v('Enough room to be noticed','A small circle may let the conversation move without losing the person inside it.','A small table leaves room to follow the conversation, not just find a moment to enter it.','A bigger gathering may need smaller conversations inside it to offer the setting you want.'),
    'Social mix':v('More than a single conversation','Moving between different people may be part of the appeal.','A mixed room gives the conversation somewhere else to go. You do not have to stay with the first exchange.','Someone hoping for an uninterrupted catch-up may want a different setting.'),
    'Big energy':v('Where the room is happening','A lively gathering may give a new connection its own momentum.','You have made room for the bustle: company with things happening around it.','A quiet meeting may be pleasant and still miss the atmosphere you were looking for.'),
  },
  groupSize:{
    'One-on-one':v('Attention with somewhere to stay','A conversation without a group around it may give you more room.','The person opposite does not have to compete with the rest of the table.','A group invitation is a different offer from time together alone.'),
    '3–4 people':v('A table with room','A smaller table may leave more room for each voice.','Four people is where you can stop scanning the room and start noticing someone.','A larger table may need to break into smaller conversations for you.'),
    '5–8 people':v('More voices around the table','A gathering with several voices may give you more ways into conversation.','You want enough people for the conversation to move around the table.','A very small gathering may give you less of the mix you came for.'),
    'Big group':v('The gathering is part of it','A bigger gathering may be part of the enjoyment itself.','The company includes the room, not only the person beside you.','A friend who wants to meet alone may be asking for a different kind of time.'),
    'Depends':v('The room is not the whole answer','The right size may depend on the people and the occasion.','A headcount is not enough to choose the gathering. The people and the occasion get a say.','Ask about this particular plan, rather than assuming a fixed group-size rule.'),
  },
  connectionChoice:{
    'A few times a week':v('In the days between meeting','Hearing from a friend several times a week may make the in-between days feel part of the friendship.','The days between meetings are part of the friendship too. You want the conversation to return a few times a week.','Long gaps may leave more quiet than you were hoping for.'),
    'About once a week':v('Something to come back to','A weekly hello may give the friendship a recurring place.','A familiar voice has a place in the week. The conversation need not run continuously to keep returning.','Someone comfortable with long gaps may not realise you are waiting for that return.'),
    'Every couple of weeks':v('Life between the messages','There may be room for life to gather between conversations.','You like to find your way back every couple of weeks, with something of life in between.','With a frequent texter, naming the rhythm may matter more than counting the messages.'),
    'Weeks/Months can pass, we’re still good':v('Quiet is not a closed door','A stretch without messages may not feel like the end of the connection to you.','Weeks or months can pass without the friendship needing a fresh start. A quiet chat is not a closed door.','Someone who wants frequent contact may need to hear what the silence means to you.'),
  },
  planningChoice:{
    'Same day':v('While the day is still open','A plan made today may keep the idea close to the moment.','The afternoon does not have to be booked to become something. You like an invitation that can happen today.','Someone who fills their calendar early may have no room left when the idea arrives.'),
    '1–2 days':v('Tomorrow is close enough','A little notice may help the invitation become a plan.','Give you a day or two between the message and the meeting.','A little warning may get a yes where a last-minute message gets a pass.'),
    'A few days':v('Time for the plan to settle','A few days of notice may help you make room for the meeting.','Put the plan in your week before it happens. The invitation has time to settle into the rest of life.','An outing can be right for you and still arrive too late.'),
    'About a week':v('A place in next week','Knowing about the meeting a week ahead may give it somewhere to fit.','Plans land best about a week out. The date belongs in the week before you walk into it.','With someone who decides on the day, agreeing when to ask may matter as much as where to go.'),
    '1–2 weeks ahead':v('Something on the horizon','An invitation a week or two ahead may give you time to make a place for it.','You want the date in the calendar a week or two out.','A last-minute invitation may lose you on timing, not on the company.'),
  },
  clicks:{
    'Our humour just lands':v('Before the joke needs explaining','Shared humour may let you recognise a connection before you can name it.','A joke that lands can do more than another round of introductions.','Humour can open the conversation without having to carry every part of it.'),
    'We skip the small talk':v('Past the polite beginning','Getting beyond the opening lines may be part of what feels like clicking.','You notice when the conversation leaves the polite beginning behind.','Someone else may want more of the introductions before following you further.'),
    'We share niche rabbit holes':v('Down the same rabbit hole','A shared fascination may take the conversation somewhere neither of you needs to explain.','A niche interest gives you more than a topic. It gives you somewhere to follow each other.','An interest does not need to be widely shared to give this connection a beginning.'),
    'They make me think differently':v('A thought you would not reach alone','A different perspective may feel like an opening rather than a distance.','You notice when someone changes the angle of a thought.','The exchange can be interesting without ending in agreement.'),
    'Comfortable silence feels easy':v('Nothing to fill','A pause without pressure may be part of how you recognise ease.','The conversation does not have to cover every quiet moment.','A friend who fills every pause may not realise you were comfortable in it.'),
    'We actually make plans happen':v('Out of the chat','A plan that becomes time together may be one of your signs that something is clicking.','The conversation matters more when the invitation becomes a meeting.','An endless exchange about meeting may not give you the connection you are looking for.'),
  },
  messagingStyle:{
    'Random thoughts':v('A thought worth sending','A passing thought may be enough of a reason to write.','The thought itself can be the catch-up. You need not save it for a whole life update.','A small message can keep a conversation open without asking for a long reply.'),
    'Memes':v('Something that made you laugh','Something funny may be a way of bringing a friend into the day.','A shared joke can arrive without a catch-up attached.','A light message need not be an invitation to stay in the chat.'),
    'Check-ins':v('A little hello','Asking how things are may be part of how you like to keep contact.','A check-in gives the conversation a reason to return.','A friend may not know you welcome a hello without news attached.'),
    'Voice notes':v('A voice in the day','Hearing a voice may give a message something the written words miss.','A voice note leaves room for the pauses and the way a thought arrives.','It helps to ask whether the other person has room to listen.'),
    'Calls':v('In the same conversation','A call may give you the exchange you want without waiting between messages.','You want room for a thought to meet an answer as it happens.','Agreeing when to call may help a friend who prefers messages make room for it.'),
    'Making plans':v('A message with somewhere to go','The chat may work best as a way into a meeting.','A message can do its work by putting time together in motion.','Less conversation in the chat need not mean less interest in meeting.'),
    'Mostly IRL':v('Leave some of it for the meeting','Time in person may be where you want most of the connection to happen.','The chat is not where you want the whole friendship to live.','Someone who builds closeness through messages may need to understand that preference.'),
  },
  spontaneousTrip:{
    'Already packing':v('Ready for the departure','A sudden trip may be an invitation you can picture yourself taking.','The unplanned departure is part of the appeal.','A companion who needs preparation may want more warning than you do.'),
    'Convince me':v('Tell me what is out there','The right idea may matter more than whether the trip was planned.','The invitation has to give you a reason to go. Spontaneity alone is not the answer.','Say what makes this trip worth joining, rather than relying on the surprise.'),
    '24 hours notice needed':v('A little time before leaving','Some warning may make the sudden trip possible.','A day of warning gives the departure somewhere to fit.','A surprise invitation may need a little breathing space.'),
    'Not without itinerary':v('A route before the departure','Knowing the shape of the trip may help you say yes to it.','Even a sudden weekend away needs a shape before you leave.','A loose invitation may need an outline before it becomes something you can join.'),
  },
  idealSaturday:{
    'Slow coffee':v('Let the coffee take its time','An unhurried coffee may give the meeting room to find its pace.','A coffee does not have to be the interval before the next thing.','Leave space around the meeting rather than packing another stop against it.'),
    'Home':v('The day need not go far','A day at home may be part of the time you want to keep for yourself.','A free day does not have to earn its place by taking you somewhere.','A full day out may ask for time you had wanted to keep at home.'),
    'Hobbies':v('Time for what holds your attention','A hobby may give a free day its own direction.','Leave room for the thing you can get absorbed in.','Company can join the activity without having to replace it.'),
    'Outdoors':v('Take the day outside','Being outdoors may be part of what makes a free day feel well spent.','The day has somewhere to go beyond the walls.','A plan outside may offer more of the setting you want.'),
    'Exploring':v('A turn you have not taken','Finding somewhere unfamiliar may give the day its interest.','A free day can hold somewhere you have not been yet.','A familiar plan may need something new inside it to catch your interest.'),
    'Social all day':v('Keep the company going','Company may be something you want through the day, not just a single catch-up.','The gathering does not have to be the only social part of the day.','Someone wanting a short meeting may need a clear place to leave it.'),
    'Dinner-drinks':v('Give the evening a table','An evening over dinner may offer a natural place to begin.','A table gives the evening a centre before anyone has to plan the conversation.','Agreeing the kind of evening may matter more than filling every hour.'),
    'Spontaneous':v('Leave a little unwritten','A free day may be more appealing with some of it still undecided.','The day does not need every part spoken for before it begins.','A friend who likes a full itinerary may need you to name the room you want to leave.'),
  },
};

// Each fragment is grounded in one fixed option. Composing several fragments
// never upgrades several selections from the same question into independent sources.
const outings:Record<string,[string,string]>={
  'Specialty Coffee':['Coffee worth sitting with','A coffee gives the meeting a place to settle'],
  'Food Hunts':['Follow the appetite','Finding somewhere to eat gives the conversation a destination'],
  'Ideas & Deep Dives':['Keep following the thought','An idea gives you somewhere to go past the introductions'],
  'Drinks & Bar Hopping':['An evening that moves','Moving between bars gives the evening a changing scene'],
  'Indie Cinema':['Stay for the conversation afterwards','A film leaves you with something to turn over afterwards'],
  'Pottery & Making':['Let your hands begin','Making something gives the meeting a rhythm beyond the talking'],
  'Vinyl & Analog Culture':['Follow the record','A record gives you somewhere to follow your curiosity'],
  'Nature & Hiking':['A path to share','A walk gives the conversation somewhere to travel'],
  'Live Music & Gigs':['Begin around the music','A gig gives the meeting something to be there for'],
  'Games Nights':['Let the game open it','A game gives you something to respond to before the conversation finds its feet'],
  'Beach & Island Days':['A little further from the week','An island or beach day gives the meeting a different setting'],
  'Photo Walks':['Notice something together','A camera gives you a reason to slow down and notice the same street'],
  'Parties & Nightlife':['Where the evening is happening','A lively night gives a new connection movement around it'],
  'Water Sports':['Meet around the water','An activity on the water gives the introduction something to do'],
  'Sports & Fitness':['Move before the small talk','An active plan gives the meeting a pace before the conversation has one'],
};
VOCABULARY.outings=Object.fromEntries(Object.entries(outings).map(([key,[title,phrase]])=>[key,v(title,
  phrase.replace(/ gives /,' may give ').replace(/ leaves /,' may leave ')+'.',phrase+'.',
  `With ${key.toLowerCase()} as a starting point, you can agree on the activity before guessing at the chemistry.`)]));
const outingBeginnings:Record<string,string>={
 'Specialty Coffee':'A cup between you may take some pressure off the introduction.',
 'Food Hunts':'A shared appetite may be enough reason to start wandering together.',
 'Ideas & Deep Dives':'Following a thought together may matter more than finding an opening line.',
 'Drinks & Bar Hopping':'An evening with somewhere else to go may keep a meeting moving.',
 'Indie Cinema':'The film may give strangers a conversation already waiting outside.',
 'Pottery & Making':'Busy hands may leave the conversation room to arrive.',
 'Vinyl & Analog Culture':'Choosing what to put on may be its own introduction.',
 'Nature & Hiking':'Walking side by side may feel different from sitting opposite someone.',
 'Live Music & Gigs':'Being there for the music may let company begin without an interview.',
 'Games Nights':'A turn at the game may be easier than an opening question.',
 'Beach & Island Days':'A change of scenery may give a first meeting breathing room.',
 'Photo Walks':'Looking for a photograph may help you notice something together.',
 'Parties & Nightlife':'The movement of a night out may help the introduction along.',
 'Water Sports':'An activity around the water may give you a shared beginning.',
 'Sports & Fitness':'Moving together may let the conversation find you along the way.',
};
for(const [key,early] of Object.entries(outingBeginnings))VOCABULARY.outings[key].early=early;

const qualities:Record<string,string>={Curious:'room to keep asking',Reliable:'a plan that is followed through',
  'Emotionally open':'room for feelings in the conversation',Playful:'room for a joke',Thoughtful:'attention to the small things',
  Independent:'space for separate lives',Adventurous:'someone willing to try the unfamiliar','Open-minded':'room for a different view',
  Proactive:'an invitation you do not always have to send','Free-spirit':'room for the unplanned',Ambitious:'company for what you want to work towards',Depth:'a conversation past the surface',Spiritual:'room to talk about what gives life meaning'};
VOCABULARY.desiredQualities=Object.fromEntries(Object.entries(qualities).map(([key,image])=>[key,v(
  image.charAt(0).toUpperCase()+image.slice(1),`You may be looking for ${image} in a friendship.`,
  `You want ${image} from the company you keep.`,`It helps to explain what ${key.toLowerCase()} means to you in an ordinary friendship.`)]));
const values:Record<string,string>={Family:'the people you call family',Freedom:'space to choose your own direction',Adventure:'the unfamiliar',Community:'a place among people',Achievement:'what you work towards',Creativity:'room to make something',Growth:'room to become different',Stability:'a steady base',Curiosity:'a question worth following'};
VOCABULARY.coreValues=Object.fromEntries(Object.entries(values).map(([key,image])=>[key,v(
  image.charAt(0).toUpperCase()+image.slice(1),`${image.charAt(0).toUpperCase()+image.slice(1)} may be something you want friendship to make room for.`,
  `Your priorities leave a place for ${image}.`,`A friendship that crowds out ${image} may ask you to set aside something that matters.`)]));

VOCABULARY.initiationChoice={
  'I usually wait for theirs':v('An invitation to answer','An invitation may give a meeting its starting point for you.','You tend to answer the invitation rather than send it.','With another person who waits, wanting to meet may never make it into the calendar.'),
  'It goes both ways':v('Either side of the plan','The next suggestion may come from either side.','You make the suggestion, and you make room for theirs.','Taking turns leaves less of the asking with the same person.'),
  'I usually send mine':v('An idea becomes a message','Sending the invitation may be how you turn an idea into time together.','You tend to be the one who turns an idea into an invitation.','With someone who waits, you may need to say when you would like to be asked.'),
};
VOCABULARY.socialVibe={
  Intimate:v('Close enough to follow','A close atmosphere may give you more room to notice someone.','A room can feel full without being crowded. You want the company close enough to follow.','A busy setting may need a quieter corner for the atmosphere you want.'),
  'Playful-chaotic':v('Let the room surprise you','A little playful disorder may be part of the fun.','The gathering need not stay neatly on course to be worth being in.','Someone who wants the room settled may need a different sort of setting.'),
  Intellectual:v('Give the thought some room','An idea may be part of what draws you into the room.','A thought worth following can give the gathering its centre.','Leave room for a subject to become more than an opening line.'),
  Adventurous:v('Somewhere unfamiliar','An unfamiliar setting may be part of what brings you out.','The gathering can offer somewhere you would not have gone alone.','A familiar routine may need a little discovery inside it.'),
  Calm:v('Without the room rushing you','A calmer atmosphere may let a conversation find its own pace.','The room does not need to hurry the conversation along.','A quieter setting can make room for the atmosphere you chose.'),
  'High-energy':v('In the middle of the happening','A lively atmosphere may give the meeting momentum.','You want the gathering to have some movement around it.','A quiet catch-up offers a different atmosphere from the lively room you chose.'),
  Creative:v('Something taking shape','Making or imagining something may give the room its spark.','A gathering can have something taking shape inside it, beyond the conversation.','Give the company something to make, not only something to discuss.'),
};
VOCABULARY.supportStyle={
  Listen:v('Let the thought finish','Listening may be part of the support you want to offer.','You want to leave room for someone to finish the thought before deciding what it needs.','It helps to ask whether a friend wants an answer or room to speak.'),
  Reassure:v('A little steadiness beside them','Reassurance may be one of the ways you want to be there.','You want to offer a steady voice when something feels uncertain.','Check what would feel reassuring rather than deciding for them.'),
  'Make sense of it':v('Put the pieces beside each other','Helping a friend make sense of something may be a way you offer support.','You want to sit with the pieces until the situation has a clearer shape.','A friend may need time to tell the story before they want help understanding it.'),
  Advice:v('A direction to consider','An idea about what comes next may be part of the help you want to give.','You want to offer a possible direction, not leave the next step entirely unnamed.','Ask whether advice would help before offering the route you can see.'),
  'Solve it':v('Something practical to do','A practical step may be part of how you want to help.','You look for something useful to do with the problem on the table.','The problem may need hearing before it needs solving.'),
  'Ask me':v('Ask what would help','The kind of support may depend on what is happening.','You have left room to be asked rather than choosing a single way to help.','Name what would be useful in this moment instead of guessing the other person knows.'),
};
VOCABULARY.friendshipPillars={
  'We tell each other everything':v('Room for the whole story','A friendship with room for the whole story may be what you want.','You want a friendship where there is room to tell the whole story.','That wish does not set the pace at which someone else is ready to share.'),
  'Inside jokes':v('A joke with a history','A joke that belongs to the friendship may be part of its appeal.','An inside joke carries a little history without having to retell it.','Let the shared references grow from time together rather than forcing them.'),
  'Spontaneous plans':v('Leave room for an idea','An unplanned invitation may be part of what friendship means to you.','Friendship leaves room for an idea that was not in the calendar.','A friend who plans ahead may need a little warning inside the spontaneity.'),
  'Comfortable silence':v('The pause can stay','Not needing to fill every pause may be part of the friendship you want.','There can be company in the quiet, without a conversation to keep going.','A pause does not have to be treated as something to fix.'),
  'Show up in hard times':v('Beyond the easy afternoons','Being there when life is difficult may be part of what friendship means to you.','The friendship you want has a place beyond the easy afternoons.','Ask what being there looks like rather than assuming you mean the same thing.'),
};
VOCABULARY.budgetPref={
  Free:v('The plan need not cost','A free plan may make saying yes simpler.','The meeting does not need a price attached to be worth making.','Choose an outing without a spending expectation.'),
  '<$20':v('Keep the cost small','Keeping the cost below $20 may make the invitation easier to consider.','You want the outing to stay below $20.','A small cost still needs agreeing before the plan is settled.'),
  '$20–50':v('Know the cost before the yes','Knowing the plan sits within $20–50 may help you decide.','An outing in the $20–50 range is the budget you chose.','Settle the cost as part of the invitation, not as a surprise afterwards.'),
  '$50–100':v('Make room for the occasion','You may be willing to make room for an outing in the $50–100 range.','You have left room for an outing costing $50–100.','Another person may want a less expensive plan even when the activity appeals.'),
  '$100+':v('A larger outing can fit','An outing costing $100 or more may be something you are willing to consider.','Your chosen budget leaves room for an outing above $100.','Ask about a companion’s budget before choosing the occasion.'),
};
const repair:Record<string,Record<string,[string,string]>>={
 repairFirst:{
  'Name what feels off':['Name the thing between you','You would rather put what feels off into words than leave it unnamed.'],
  'Ask how they saw it':['Start with their side','A question about their side is where you want to begin when something feels off.'],
  'Wait a little before saying anything':['A little space before the words','You want a pause before deciding what to say about the thing that feels off.'],
  'Step back from the conversation':['Step out before coming back','Stepping back is your first response when something feels off, not a complete account of how you return.'],
 },
 repairReturn:{
  'In the same conversation':['Find the ordinary inside the conversation','You want room to find your way back to ordinary conversation before that exchange has ended.'],
  'Later that day':['Let the day turn a little','You tend to want some of the day between the difficult conversation and talking normally again.'],
  'After a day or two':['Let some time pass','A day or two is the return time you chose after a difficult conversation.'],
  'After several days':['More than a brief pause','You want several days before returning to ordinary conversation.'],
  'Only after we return to what happened':['The thing still needs a place','Time passing is not the whole answer. You want to return to what happened before moving on.'],
 },
 repairDiscuss:{
  'Talk through what went wrong':['Give it a conversation','Moving on, for you, includes talking through what went wrong.'],
  'Acknowledge it without a long discussion':['Name it without staying there','You want the thing acknowledged without the acknowledgement becoming a long discussion.'],
  'Agree what will be different next time':['Give the next time a different shape','You want an agreement about what changes, not only a conversation about what happened.'],
  'Let it go and reconnect through something ordinary':['Find an ordinary way back','Doing something ordinary together is one way you want to find the connection again.'],
 },
 repairNeed:{
  'They understand what bothered me':['Let it be understood','Being understood is part of what helps you feel that things are mended.'],
  'A clear apology':['Let the apology be clear','A clear apology is part of what you want before the difficult moment feels repaired.'],
  'We agree on a practical change':['Something different next time','A practical change gives the repair somewhere to go after the words.'],
  'We spend some ordinary time together again':['Return through an ordinary afternoon','Ordinary time together is part of what helps things feel mended.'],
  'I see the change in what happens afterwards':['Let the change reach the everyday','You want to see the change in what follows, not only hear it promised.'],
 },
 repairSpace:{
  'A short message saying we will come back to it':['Leave a way back in the message','If a friend needs space, a short promise to return to the conversation helps you.'],
  'Agreeing when we will talk':['Give the pause an ending','If a friend needs space, you want to know when the conversation will return.'],
  'Knowing I can check in without starting the discussion':['A hello need not reopen it','You want room to check in without making that message the difficult conversation itself.'],
  'Leaving the next message to them':['Let them choose the return','When a friend needs space, you prefer to leave the next message with them.'],
 },
};
for(const [dimension,options] of Object.entries(repair))VOCABULARY[dimension]=Object.fromEntries(Object.entries(options).map(([key,[title,text]])=>[key,v(title,text,text,'These are preferences for repair, not a verdict about who handles disagreement correctly.')]));
