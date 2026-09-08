'use client';
import {useEffect,useState} from 'react';
import {getSupabaseBrowserClient} from '../../lib/supabase';
type Context={eligible:boolean;confirmed?:boolean;peers:{id:string;handle:string}[]};
const QUESTIONS=[
  {id:'peer.joining',text:'In the conversation you shared, how did they tend to join in?',options:[['started','Started topics'],['picked_up','Picked up topics'],['both','Did both'],['cannot_tell','We did not talk enough to tell']]},
  {id:'peer.pause',text:'When the conversation paused, what did you notice?',options:[['started','Brought in a new topic'],['picked_up','Waited for someone else'],['both','Both happened'],['cannot_tell','I could not tell']]},
];
export function PeerObservationPanel({outingId}:{outingId:string}){
  const [context,setContext]=useState<Context|null>(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{let active=true;getSupabaseBrowserClient().rpc('peer_collection_context',{p_outing:outingId}).then(({data,error})=>{
    if(!active)return;if(error)setError('Unable to load the optional shared-outing questions.');else setContext(data as Context);
  });return()=>{active=false;};},[outingId]);
  async function send(rpc:string,args:Record<string,unknown>){
    setBusy(true);setError('');setMessage('');
    try{const result=await getSupabaseBrowserClient().rpc(rpc,args);if(result.error)throw result.error;
      setMessage(rpc==='confirm_outing_presence'?'Attendance confirmation updated.':'Your response was saved.');
      const fresh=await getSupabaseBrowserClient().rpc('peer_collection_context',{p_outing:outingId});if(fresh.error)throw fresh.error;setContext(fresh.data);
    }catch(e){setError(e instanceof Error?e.message:'Unable to save. Please try again.');}finally{setBusy(false);}
  }
  if(!context?.eligible&&!error)return null;
  return <section className="mt-6 rounded-2xl border border-white/20 p-5" aria-label="Optional observations after your outing">
    <h2 className="text-xl">A little of how you met</h2>
    <p className="mt-2 text-sm">Optional fixed-choice observations, separate from private reflections and self-descriptions. Nobody in the app sees an individual response. Only group summaries with enough independent observations can appear in a reading. You can withdraw your responses here.</p>
    {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
    {context?.eligible&&!context.confirmed&&<button disabled={busy} className="underline py-3" onClick={()=>send('confirm_outing_presence',{p_outing:outingId,p_present:true})}>I was there. Confirm my attendance</button>}
    {context?.confirmed&&<><button disabled={busy} className="underline py-3" onClick={()=>send('confirm_outing_presence',{p_outing:outingId,p_present:false})}>Withdraw my attendance confirmation and these observations</button>
      {!context.peers.length&&<p>No other host-recorded attendee has confirmed their presence yet.</p>}
      {context.peers.map(peer=><div key={peer.id} className="mt-5"><h3>@{peer.handle}</h3>{QUESTIONS.map(q=><fieldset key={q.id} className="mt-3"><legend>{q.text}</legend>{q.options.map(([value,label])=><button type="button" key={value} disabled={busy} className="border rounded-full px-3 py-2 m-1" onClick={()=>send('submit_peer_observation',{p_outing:outingId,p_subject:peer.id,p_question:q.id,p_option:value})}>{label}</button>)}<button disabled={busy} className="underline p-2" onClick={()=>send('submit_peer_observation',{p_outing:outingId,p_subject:peer.id,p_question:q.id,p_option:null})}>Remove my response to this question</button></fieldset>)}</div>)}
    </>}
  </section>;
}
