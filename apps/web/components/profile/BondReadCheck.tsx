'use client';
import {useEffect,useState} from 'react';
import {getSupabaseBrowserClient} from '../../lib/supabase';
export function BondReadCheck({subjectId,readHash,writerVersion}:{subjectId:string;readHash?:string;writerVersion?:string}){
 const [eligible,setEligible]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 useEffect(()=>{let live=true;setEligible(false);
  if(readHash&&writerVersion)Promise.resolve(getSupabaseBrowserClient().rpc('can_submit_peer_read_check',{p_subject:subjectId,p_hash:readHash,p_writer:writerVersion})).then(({data,error})=>{
   if(live){if(error)setError('The optional read check could not be loaded.');else setEligible(data===true);}
  }).catch(()=>{if(live)setError('The optional read check could not be loaded.');});return()=>{live=false;};
 },[subjectId,readHash,writerVersion]);
 async function submit(option:string|null){setBusy(true);setMessage('');setError('');try{
  const result=await getSupabaseBrowserClient().rpc('submit_peer_read_check',{p_subject:subjectId,p_hash:readHash,p_writer:writerVersion,p_option:option});
  if(result.error)throw result.error;setMessage(option===null?'Your response was removed.':'Thank you. Your response was saved separately from their self-description.');
 }catch{setError('Your response could not be saved. Please try again.');}finally{setBusy(false);}}
 if(!eligible&&!error)return null;
 return <section className="rounded-2xl border border-stone-300 bg-stone-50 p-6 text-stone-800 mt-6">
  <h2 className="text-xl">Now that you have met</h2>
  {eligible&&<><p className="mt-2">Did this reading resemble the person you spent time with? Optional, after more than one verified shared outing. Your individual response is not shown to them or other members and does not affect rankings.</p>
  {[['mostly','Mostly'],['some','In some ways'],['not_really','Not really'],['cannot_tell','I cannot tell yet']].map(([value,label])=><button key={value} disabled={busy} className="border rounded-full px-4 py-2 mt-3 mr-2" onClick={()=>submit(value)}>{label}</button>)}
  <button disabled={busy} className="block underline mt-3" onClick={()=>submit(null)}>Remove my response</button></>}
  {message&&<p role="status">{message}</p>}{error&&<p role="alert">{error}</p>}
 </section>;
}
