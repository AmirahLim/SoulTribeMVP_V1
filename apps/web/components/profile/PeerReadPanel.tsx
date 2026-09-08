'use client';
import {useEffect,useState} from 'react';
import {getSupabaseBrowserClient} from '../../lib/supabase';
type Signal={evidenceLevel:'PEER OBSERVATION';dimension:string;period:string;text:string};
/** Only threshold-released summaries are readable. Never query individual responses. */
export function PeerReadPanel({subjectId,own=false}:{subjectId:string;own?:boolean}){
 const [signals,setSignals]=useState<Signal[]>([]),[error,setError]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{let live=true;setSignals([]);setError(false);
  Promise.resolve(getSupabaseBrowserClient().rpc('read_peer_signals',{p_subject:subjectId})).then(({data,error})=>{
   if(!live)return;if(error){setError(true);return;}
   setSignals(Array.isArray(data)?data.filter(s=>s?.evidenceLevel==='PEER OBSERVATION'&&typeof s.text==='string'):[]);
  }).catch(()=>{if(live)setError(true);});return()=>{live=false;};
 },[subjectId,retry]);
 if(!signals.length&&!error)return null;
 return <section className="rounded-2xl border border-stone-300 bg-stone-50 p-6 text-stone-800" aria-label="Shared-outing observations">
  <p className="text-xs uppercase tracking-widest">Peer observation · separate from self-description</p>
  <h2 className="mt-2 text-2xl">{own?'A little of how you come across':'A little of how they come across'}</h2>
  {error?<p role="alert">Shared-outing observations could not be loaded. <button className="underline" onClick={()=>setRetry(n=>n+1)}>Try again</button></p>:
   signals.map(s=><p className="mt-3" key={`${s.dimension}:${s.period}`}>{own?s.text:s.text.replace(/with you/g,'with them').replace(/noticed you/g,'noticed them')}</p>)}
  <p className="mt-4 text-sm">Released weekly after at least five distinct observers across three verified outings, with at least three supporting observations. Individual responses and counts are never shown. These observations do not change self-described traits or matching scores.</p>
 </section>;
}
