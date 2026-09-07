import {describe,it,expect} from 'vitest';
import {validIdentity} from '../onboardingIdentity';
import {emptyDraft,isDraft,validStep} from '../sixQuestionOnboarding';
describe('Onboarding identity',()=>{
 it('accepts international self-reported areas and a bounded km preference',()=>{
  const d={...emptyDraft(),setupRevision:1 as const,handle:'hello_you',area:'Fitzroy',country:'Australia',ageBand:'25–34',travelKm:50};
  expect(isDraft(d)).toBe(true);expect(validStep(d,7)).toBe(true);
  expect(validStep({...d,ageBand:'Other',ageOther:'17'},7)).toBe(false);
  expect(validStep({...d,ageBand:'Other',ageOther:'55'},7)).toBe(true);
  for(const travelKm of [0,51,1.5,NaN])expect(isDraft({...d,travelKm})).toBe(false);
  expect(validStep({...d,country:''},7)).toBe(false);
  expect(validStep({...d,area:' '},7)).toBe(false);
 });
 it('preserves legacy identity without requiring a new answer',()=>expect(validIdentity({area:'Bedok'})).toBe(true));
});
