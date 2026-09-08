import {type BaselineDraft} from './sixQuestionOnboarding';
import {buildEvidence} from './readEngine/evidence';
import {composeRead} from './readEngine/compose';
export type ReadFeedback={status:'fits'|'not_quite';text:string;basis:string};
export type ReadDraft=BaselineDraft & {earlyReadFeedback?:Record<string,ReadFeedback>};
export type ReadCard={id:string;title:string;reading:string;evidence:string[];question:string;basis:string;feedback?:ReadFeedback};
export function buildEarlyRead(d:ReadDraft):ReadCard[] {
 const bundle=buildEvidence({onboarding:{baselineV2:{...d,groupChoices:d.groupChoices?.length?d.groupChoices:d.group?[d.group]:[]}}},'early');
 const composed=composeRead(bundle);
 return composed.sections.map(section=>{
  const evidence=section.evidence.flatMap(s=>s.selections);
  const basis=JSON.stringify({version:composed.version,evidence:section.evidence});
  const feedback=validReadFeedback(d.earlyReadFeedback)?d.earlyReadFeedback?.[section.key]:undefined;
  return {id:section.key,title:section.title,reading:section.text,evidence,basis,
   question:'Does this sound like you, or is there something you would put differently?',
   feedback:feedback?.basis===basis?feedback:undefined};
 });
}
export function validReadFeedback(value:unknown):boolean {
 if(value===undefined)return true;
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 return Object.entries(value).length<=6&&Object.entries(value).every(([key,v])=>{
  const f=v as ReadFeedback;
  return ['depth','intent','setting','click','rhythm','qualities','outings'].includes(key)&&f&&['fits','not_quite'].includes(f.status)&&typeof f.text==='string'&&f.text.length<=240&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(f.text)&&typeof f.basis==='string'&&f.basis.length<=1000;
 });
}
