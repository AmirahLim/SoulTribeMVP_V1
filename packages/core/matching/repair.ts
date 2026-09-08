import type {ProfileVector} from '../domain/types.ts';
/** Categorical preference agreement, not a healthy/unhealthy repair scale. */
export function scoreRepair(a:ProfileVector,b:ProfileVector):number|null {
  const aa=a.repair?.answers,bb=b.repair?.answers;if(!aa||!bb)return null;
  const scores:number[]=[];
  for(const key of ['repair.first','repair.return','repair.discuss','repair.need','repair.space']){
    const x=new Set(aa[key]??[]),y=new Set(bb[key]??[]);if(!x.size||!y.size)continue;
    scores.push([...x].filter(v=>y.has(v)).length/new Set([...x,...y]).size);
  }
  return scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:null;
}
