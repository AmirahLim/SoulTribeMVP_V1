// Categorical pair states, never new positions between the actual answer choices.
// Each paragraph interprets both operands; it is not a reusable compatibility verdict.
const voices:Record<string,Record<string,string>>={
 connectionChoice:{
  'A few times a week|Weeks/Months can pass, we’re still good':'A silent stretch can carry different meanings here. You may be waiting for the next hello while they let the connection rest. Say what keeping in touch looks like before either of you has to guess.',
  'A few times a week|About once a week':'You want conversation threaded through the week; they give it a weekly place. A small message between catch-ups could be welcome, but it is worth asking what each of you wants to keep up.',
  'Weeks/Months can pass, we’re still good|About once a week':'You can let the chat rest for a long while. They want a familiar return each week. Let them know that quiet does not close the door, and ask whether a small regular hello would help.',
  'About once a week|A few times a week':'A weekly return suits you; they want more contact woven between meetings. Their next message may arrive before you feel the need for a catch-up. Agree what feels welcome without turning it into an obligation.',
  'About once a week|Weeks/Months can pass, we’re still good':'You want a hello to have its place each week. They are comfortable letting much more time pass. A quiet phone may need a conversation about rhythm, not an assumption about the friendship.',
  'Weeks/Months can pass, we’re still good|A few times a week':'A long pause need not change the friendship for you. They want contact running through the week. Tell them what the silence means on your side, while making room to hear what contact means on theirs.',
 },
 planningChoice:{
  'Same day|About a week':'Your invitation can begin with an open afternoon. Their calendar wants the idea about a week earlier. The company may appeal before the timing does; try putting a date aside, then leave the details loose.',
  'Same day|A few days':'An idea can become today’s plan for you. They want a few days for it to settle among everything else. Send the possibility while it is still taking shape, rather than waiting until you are ready to leave.',
  'About a week|A few days':'You both want notice, but you reach for different parts of the calendar. You would put the meeting about a week ahead; they ask for a few days. Choosing a date first could leave the rest pleasantly undecided.',
  'About a week|Same day':'You want the date before the week fills up. They are happy to discover a plan on the day. An early invitation with room inside it may preserve the spontaneity without losing the meeting.',
  'A few days|Same day':'A few days help you make room; their idea may arrive when the day is already here. Ask for the first thought, not just the finished invitation, so you have something to keep space for.',
  'A few days|About a week':'Your few days of notice meet their preference for about a week. Neither of you is asking the invitation to happen immediately. Start with the date and decide the smaller details afterwards.',
 },
 groupChoices:{
  'Big energy|1:1':'You chose the lively room; they chose time without a group around it. A busy evening could hold an introduction, but getting to know each other may need a conversation away from the crowd.',
  'Big energy|Small circle':'You make room for bustle, while they favour a smaller circle. A small table inside a lively place could offer a beginning that has some of both, provided the conversation can still be heard.',
  '1:1|Small circle':'You want someone opposite you without a group to follow. They have room for a small circle. Starting with time together alone could let the friendship find its feet before the table grows.',
  '1:1|Big energy':'You would rather give the person your attention; they have chosen a room with energy around it. Meeting away from the busiest part could leave room for their atmosphere and your conversation.',
  'Small circle|Big energy':'Your smaller circle meets their appetite for a lively gathering. Keep the company small even if the place is busy, and check that the setting leaves enough room to hear each other.',
  'Small circle|1:1':'A small circle appeals to you; they prefer an uninterrupted meeting. An invitation just for the two of you may be a clearer first offer than bringing them into a group straight away.',
 },
};
export const pairVoice=(dimension:string,a:string,b:string)=>voices[dimension]?.[`${a}|${b}`];
