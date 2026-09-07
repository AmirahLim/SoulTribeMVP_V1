/** Bounded shared-preference boost, not evidence of personality or reliability. */
export const PUBLIC_PREFERENCE_MAX_BOOST = 0.03;
const fields=[['intent','intentOther'],['clicks','clicksOther'],['groupChoices',''],['desiredQualities','qualityOther'],['connectionChoice','connectionOther'],['planningChoice','planningOther'],['punctualityChoice','punctualityOther'],['outings','outingOther']];
function choices(p:Record<string,unknown>,key:string,other:string):Set<string> {
 const raw=p[key]??(key==='groupChoices'?p.group:undefined);
 return new Set((Array.isArray(raw)?raw:[raw]).map(v=>v==='Other'?p[other]:v).filter((v):v is string=>typeof v==='string'&&v.trim().length>0).map(v=>v.trim().toLocaleLowerCase('en')));
}
export function publicPreferenceBoost(a?:Record<string,unknown>,b?:Record<string,unknown>):number {
 if(!a||!b)return 0;
 const scores:number[]=[];
 for(const [key,other] of fields) {
  const left=choices(a,key,other),right=choices(b,key,other);
  if(!left.size||!right.size)continue;
  scores.push([...left].filter(v=>right.has(v)).length/new Set([...left,...right]).size);
 }
 return scores.length?PUBLIC_PREFERENCE_MAX_BOOST*scores.reduce((a,b)=>a+b,0)/scores.length:0;
}
