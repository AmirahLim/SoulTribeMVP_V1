import {it,expect} from 'vitest';
import {adultBirthYear} from '../adultEligibility';
import {validLifeContexts} from '../lifeContext';
import {makeProof,readProof} from '../eligibilityProof';
import {emptyDraft,validStep,isDraft} from '../sixQuestionOnboarding';
it('limits self-described context to three distinct approved choices',()=>{
 const d={...emptyDraft(),handle:'my_handle',area:'Town',country:'Country',lifeContexts:['Slow Living','Family Life']};
 expect(isDraft(d)).toBe(true);expect(validStep(d,7)).toBe(true);
 expect(validLifeContexts([],true)).toBe(false);
 expect(validLifeContexts(['Slow Living','Slow Living'])).toBe(false);
 expect(validLifeContexts(['Slow Living','Family Life','Adventure Era','Wild & Free'])).toBe(false);
 expect(validLifeContexts(['Invented'])).toBe(false);
});
it('checks exact eighteenth birthday and rejects invalid dates',()=>{
 const now=new Date('2026-09-07T12:00:00Z');
 expect(adultBirthYear('2008-09-07',now)).toBe(2008);
 expect(adultBirthYear('2008-09-08',now)).toBeNull();
 expect(adultBirthYear('2008-02-30',now)).toBeNull();
 expect(adultBirthYear('2009-01-01',now)).toBeNull();
});
it('binds eligibility proof to the saved draft and rejects tampering',()=>{
 const proof=makeProof('draft-token',2000);
 expect(readProof('draft-token',proof)).toBe(2000);
 expect(readProof('other-draft',proof)).toBeNull();
 expect(readProof('draft-token',proof.replace('2000','1990'))).toBeNull();
});
