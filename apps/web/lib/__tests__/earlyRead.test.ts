import {it,expect} from 'vitest';
import {buildEarlyRead,validReadFeedback,type ReadDraft} from '../earlyRead';
import {emptyDraft} from '../sixQuestionOnboarding';
const answers=():ReadDraft=>({...emptyDraft(),intent:['Close circle'],clicks:['We skip the small talk'],group:'1:1',groupChoices:['1:1'],desiredQualities:['Reliable'],connectionChoice:'Every couple of weeks',planningChoice:'Same day',outings:['Nature & Hiking']});
it('does not produce a personality reading from unanswered fields',()=>expect(buildEarlyRead(emptyDraft())).toEqual([]));
it('combines volunteered answers into tentative, traceable patterns',()=>{
 const cards=buildEarlyRead(answers());
 expect(cards).toHaveLength(6);
 expect(cards.find(c=>c.id==='rhythm')?.evidence).toEqual(expect.arrayContaining(['Every couple of weeks','Same day']));
 expect(cards.find(c=>c.id==='qualities')?.reading).toContain('followed through');
 expect(cards.every(c=>c.evidence.length>0&&c.question.length>0)).toBe(true);
});
it('respects corrections and invalidates them when their evidence changes',()=>{
 const d=answers(),card=buildEarlyRead(d)[0];
 d.earlyReadFeedback={[card.id]:{status:'not_quite',text:'My own correction',basis:card.basis}};
 expect(buildEarlyRead(d)[0].feedback?.text).toBe('My own correction');
 d.clicks=['Our humour just lands'];
 // Unrelated question changes do not erase a correction to the intent card.
 expect(buildEarlyRead(d)[0].feedback?.text).toBe('My own correction');
 d.intent=['Wider social circle'];
 expect(buildEarlyRead(d)[0].feedback).toBeUndefined();
});
it('does not infer diagnoses, reliability or personality from sensitive/custom text',()=>{
 const d={...answers(),intent:['Other'],intentOther:'Private custom words',clicks:['Other'],clicksOther:'My own words',desiredQualities:['Other'],qualityOther:'My own quality',lifeContexts:['Reinvention/Healing']};
 const cards=buildEarlyRead(d);
 expect(cards.flatMap(c=>c.evidence)).not.toContain('Private custom words');
 expect(cards.some(c=>['intent','qualities','click'].includes(c.id))).toBe(false);
 expect(cards.map(c=>c.reading).join(' ')).not.toMatch(/you are reliable|trauma|attachment style|diagnos/i);
});
it('bounds corrections and ignores malformed stored feedback',()=>{
 expect(validReadFeedback({intent:{status:'not_quite',text:'x'.repeat(241),basis:'[]'}})).toBe(false);
 expect(validReadFeedback({intent:{status:'fits',text:'',basis:'[]'}})).toBe(true);
 expect(validReadFeedback({intent:{status:'not_quite',text:'First line\nSecond line',basis:'[]'}})).toBe(true);
 const d=answers();(d as any).earlyReadFeedback={depth:{status:'not_quite',text:{unsafe:true}}};
 expect(buildEarlyRead(d)[0].feedback).toBeUndefined();
});
