import {describe,it,expect} from 'vitest';
import {emptyDraft,isDraft,validStep,completeDraft,canonicalRhythm,upgradeDraft,OUTINGS,RHYTHM,selectedLabels} from '../sixQuestionOnboarding';
import {emptyDraft as legacyEmpty} from '../baselineOnboarding';
describe('Six question onboarding',()=>{
 it('starts with six unanswered questions and separate identity',()=>{const d=emptyDraft();expect(isDraft(d)).toBe(true);expect(completeDraft(d)).toBe(false);expect(validStep(d,4)).toBe(false);expect(isDraft({...d,step:7})).toBe(true);expect(isDraft({...d,step:8})).toBe(false);});
 it('counts Other within each cap and requires nonblank bounded text',()=>{
  const d={...emptyDraft(),desiredQualities:['Curious','Reliable','Other'],qualityOther:'Patient'};
  expect(validStep(d,4)).toBe(true);expect(validStep({...d,qualityOther:'   '},4)).toBe(false);
  expect(isDraft({...d,qualityOther:'x'.repeat(121)})).toBe(false);
  expect(isDraft({...d,desiredQualities:[...d.desiredQualities,'Playful']})).toBe(false);
  expect(validStep({...d,outings:[...OUTINGS.slice(0,4),'Other'],outingOther:'Stargazing'},6)).toBe(true);
  expect(isDraft({...d,outings:[...OUTINGS.slice(0,5),'Other']})).toBe(false);
 });
 it('requires only contact and planning and keeps custom numeric signals unknown',()=>{
  let d={...emptyDraft(),connectionChoice:'Other',connectionOther:'Depends on the season',planningChoice:'Other',planningOther:'Let’s decide together',punctualityChoice:'Other',punctualityOther:'A quick heads-up helps'};
  expect(validStep(d,5)).toBe(true);expect(validStep({...d,punctualityChoice:'',punctualityOther:''},5)).toBe(true);
  expect(validStep({...d,planningOther:''},5)).toBe(false);
  expect(canonicalRhythm(d).contact).toBeNull();expect(canonicalRhythm(d).planning).toBeNull();
  expect(canonicalRhythm({...d,connectionChoice:RHYTHM[0].choices[0],planningChoice:RHYTHM[1].choices[4]})).toMatchObject({contact:.75,planning:1});
 });
 it('retains old answers without inventing new rhythm or outings',()=>{const old={...legacyEmpty(),step:6,outings:['Gallery Hopping'],opening:.25};const d=upgradeDraft(old);expect(d.legacyAnswers).toEqual(old);expect(d.opening).toBe(.25);expect(d.connectionChoice).toBe('');expect(d.outings).toEqual([]);expect(d.step).toBe(4);expect(isDraft(old)).toBe(true);});
 it('renders custom answers as plain selected labels',()=>expect(selectedLabels(['Other'],'<script>')).toEqual(['<script>']));
});
