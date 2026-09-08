import {connectionThread} from './compose';
import type {EvidenceBundle,ReadThread} from './evidence';

/** No hidden operands accepted: repair comparison is unavailable until authorised. */
export function evidenceThreadReading(bundle:EvidenceBundle,key:ReadThread){
 const sources=bundle.sources.filter(s=>s.thread===key);
 const claim=connectionThread(bundle,key);
 const sides=new Set(sources.map(s=>s.subject));
 const both=claim?.evidenceLevel==='DYADIC INFERENCE';
 const readingState=!sources.length?'not yet measured':!both?'still taking shape':claim.tone==='friction'?'needs a little care':claim.tone==='click'?'common ground':'still taking shape';
 return {key,status:claim?'known' as const:'unknown' as const,readingState,
   evidenceSides:[...sides],mutual:!!both,
   ...(key==='repair'&&!sources.length?{detailAccess:'shared-attendance-required'}:{}),
   ...(claim?{headline:claim.title,phrase:claim.text,
     mechanism:both&&claim.tone==='friction'?'friction':both&&claim.tone==='click'?'alignment':'context',
     outputState:readingState}:{}),
   evidence:sources.map(s=>({questionId:s.questionId,questionVersion:s.questionVersion,selections:s.selections,subject:s.subject}))};
}
