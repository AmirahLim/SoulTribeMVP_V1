import {describe,it,expect} from 'vitest';
import {buildEvidence,pairEvidence} from '../readEngine/evidence';
import {composeRead,readingPhrases,validateClaim,priorReadPhrases} from '../readEngine/compose';
import {VOCABULARY} from '../readEngine/vocabulary';
import {selfSocialPages} from '../socialScrapbook';
import {buildSavedAnswerRead} from '../savedAnswerRead';
import {evidenceThreadReading} from '../readEngine/threadReading';
import {OPENING_QUESTION} from '../readEngine/emotionalQuestion';
import {REPAIR_QUESTIONS} from '../readEngine/deeperQuestions';

// Isolated module inputs, never members or database seed data.
const answers=()=>({onboarding:{baselineV2:{intent:['Close circle'],groupChoices:['Small circle'],connectionChoice:'About once a week',planningChoice:'A few days',clicks:['Our humour just lands','We actually make plans happen'],outings:['Games Nights'],desiredQualities:['Reliable']}},deep_profile:{groupSize:'3–4 people',coreValues:'Family',socialVibe:'Calm',messagingStyle:'Random thoughts',supportStyle:'Listen',idealSaturday:'Exploring',spontaneousTrip:'Not without itinerary',cancellationStance:'Dislike'}});
const sentenceSet=(text:string)=>new Set(text.split(/(?<=[.!?])\s+/).map(s=>s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu,'').trim()).filter(Boolean));
describe('additive reading contracts',()=>{
 it('preserves seven ordered fixed categories, facts and composed prose together',()=>{
  const row=answers(),composedRead=composeRead(buildEvidence(row,'profile'));
  const input={composedRead,savedAnswerRead:buildSavedAnswerRead(row),threads:[{key:'communication',status:'known',note:'You reply within a day.'}],values:[{label:'Family'}],interests:[{name:'Games Nights'}],boundaries:{timing:'Agreed start'},outingPreferences:{instantYes:'Games Nights',usuallyYes:['Nature & Hiking'],convinceMe:['Indie Cinema']}};
  const pages=selfSocialPages(input);
  expect(pages.map(p=>p.title)).toEqual(['Who I am socially','My kind of closeness','What I bring','Where I come alive','Handle with care','Count me in for…','Me, in good company']);
  expect(pages.map(p=>p.caption)).toEqual(['A little portrait of me','How I naturally connect','The things I hold close','People, places & a little ease','What can feel a little harder','Less scrolling, more doing','When two ways of being meet']);
  expect(pages.find(p=>p.key==='bring')?.notes.join(' ')).toContain('Qualities I value in friendship: Family');
  const doing=pages.find(p=>p.key==='doing')!.notes.join(' ');
  expect(doing).toContain("I'm into Games Nights");
  expect(doing).toContain('An easy yes: Games Nights');expect(doing).toContain('Usually yes: Nature & Hiking');expect(doing).toContain('Depends on the plan: Indie Cinema');
  for(const section of composedRead.sections){const page=pages.find(p=>p.key===section.key)!;expect(page.subheading).toBe(section.title);for(const claim of section.claims)expect(page.notes).toContain(claim.text);}
  expect(pages.flatMap(p=>p.notes).join(' ')).toContain('group-size preference');
  expect(pages.flatMap(p=>p.notes).join(' ')).toContain('preferred contact rhythm');
  expect(pages.find(p=>p.key==='connect')!.notes).toContain(input.threads[0].note);
  expect(pages.find(p=>p.key==='friction')!.notes.join(' ')).toContain('cancellations');
 });
 it('keeps facts without prose and leaves wholly unsupported cards empty',()=>{
  const composedRead=composeRead(buildEvidence({},'profile'));
  const empty=selfSocialPages({composedRead,threads:[],values:[],interests:[]});
  expect(empty).toHaveLength(7);expect(empty.every(p=>p.notes.length===0&&!p.subheading)).toBe(true);
  const facts=selfSocialPages({composedRead,threads:[],values:[{label:'Family'}],interests:[]});
  expect(facts.find(p=>p.key==='bring')?.notes).toHaveLength(1);
 });
 it('always derives prior titles and sentences, even without a configured cache',()=>{
  const row=answers(),early=composeRead(buildEvidence(row,'early')),bundle=buildEvidence(row,'profile'),profile=composeRead(bundle);
  expect(priorReadPhrases(bundle)).toEqual(readingPhrases(early));
  const priorTitles=new Set(early.sections.map(s=>s.title));
  const priorSentences=sentenceSet(early.sections.map(s=>s.text).join(' '));
  for(const section of profile.sections){expect(priorTitles.has(section.title)).toBe(false);for(const sentence of sentenceSet(section.text))expect(priorSentences.has(sentence)).toBe(false);}
  for(const entries of Object.values(VOCABULARY))for(const voice of Object.values(entries)){expect(voice.profileTitle).toBeTruthy();expect(voice.profileTitle).not.toBe(voice.title);}
  const changed=answers();changed.onboarding.baselineV2.connectionChoice='Weeks/Months can pass, we’re still good';
  const other=composeRead(buildEvidence(changed,'profile'));
  expect(profile.sections.map(s=>s.title)).not.toEqual(other.sections.map(s=>s.title));
  expect(profile.sections.map(s=>s.text)).not.toEqual(other.sections.map(s=>s.text));
 });
 it('lets supported Bond depth grow and labels missing counterparts honestly',()=>{
  const rich=pairEvidence(answers(),answers()),read=composeRead(rich);
  expect(read.sections.length).toBeGreaterThan(3);
  expect(read.sections.flatMap(s=>s.claims).every(c=>validateClaim(c,rich))).toBe(true);
  const thin=pairEvidence({onboarding:{baselineV2:{connectionChoice:'About once a week'}}},{onboarding:{baselineV2:{connectionChoice:'About once a week'}}});
  expect(composeRead(thin).sections).toHaveLength(1);
  const one=pairEvidence({},answers()),oneRead=composeRead(one);
  expect(oneRead.sections.length).toBeGreaterThan(0);
  for(const c of oneRead.sections.flatMap(s=>s.claims)){expect(c.evidenceLevel).not.toBe('DYADIC INFERENCE');expect(c.tone).toBe('context');expect(validateClaim(c,one)).toBe(true);}
  expect(evidenceThreadReading(one,'communication').mutual).toBe(false);
 });
 it('publishes literal emotional evidence and real interpretation before attendance',()=>{
  const row={onboarding:{q7EmotionalPacing:OPENING_QUESTION.options[0]}};
  const bundle=pairEvidence(row,row,false),read=composeRead(bundle),thread=evidenceThreadReading(bundle,'emotional');
  expect(bundle.sources).toHaveLength(2);expect(bundle.sources.every(s=>s.access==='public')).toBe(true);
  expect(read.sections.length).toBeGreaterThan(0);expect(thread.readingState).toBe('common ground');
  expect(thread.evidence.map(s=>s.selections[0])).toEqual([OPENING_QUESTION.options[0],OPENING_QUESTION.options[0]]);
  expect(thread.phrase).toContain('personal');expect(thread.phrase).not.toContain('does not disclose');
 });
 it('does not leak repair options through repeated known-operand queries',()=>{
  const outputs=[];
  for(const a of REPAIR_QUESTIONS[0].options)for(const b of REPAIR_QUESTIONS[0].options){
   const bundle=pairEvidence({deep_profile:{repairFirst:a}},{deep_profile:{repairFirst:b}},false);
   outputs.push(JSON.stringify({read:composeRead(bundle),thread:evidenceThreadReading(bundle,'repair')}));
  }
  expect(new Set(outputs).size).toBe(1);
  expect(evidenceThreadReading(pairEvidence({},{}),'repair').detailAccess).toBe('shared-attendance-required');
 });
 it('reports thread evidence independently of summary selection',()=>{
  const rich=pairEvidence(answers(),answers());
  expect(evidenceThreadReading(rich,'communication').readingState).toBe('common ground');
  expect(evidenceThreadReading(rich,'emotional').readingState).toBe('not yet measured');
  expect(evidenceThreadReading(pairEvidence({},answers()),'communication').readingState).toBe('still taking shape');
  const changed=answers();changed.onboarding.baselineV2.planningChoice='Same day';
  expect(evidenceThreadReading(pairEvidence(answers(),changed),'social_rhythm').readingState).toBe('needs a little care');
 });
});
