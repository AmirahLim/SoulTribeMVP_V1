'use client';
import {useEffect,useState} from 'react';
import {getSupabaseBrowserClient} from '../../lib/supabase';

const fields=[['intent','Looking for','intentOther'],['clicks','Connection moments','clicksOther'],['groupChoices','Social settings',''],['desiredQualities','Qualities wanted in friends','qualityOther'],['connectionChoice','Keeping in touch','connectionOther'],['planningChoice','Planning','planningOther'],['punctualityChoice','Timing','punctualityOther'],['outings','Outings','outingOther']];
export function PublicAnswers({answers}:{answers?:Record<string,unknown>}) {
 if(!answers||!Object.keys(answers).length)return null;
 return <section className="rounded-3xl bg-[#f2f0e7] p-5 text-[#203B30]"><h2>Shared friendship preferences</h2><p>In their own words—not an assessment of their traits.</p><dl>{fields.map(([key,label,other])=>{
  const raw=answers[key]??(key==='groupChoices'?answers.group:undefined);
  const values=(Array.isArray(raw)?raw:[raw]).filter((v):v is string=>typeof v==='string'&&v.length>0).map(v=>v==='Other'&&typeof answers[other]==='string'?String(answers[other]):v);
  return values.length?<div className="mt-3" key={key}><dt className="font-semibold">{label}</dt><dd className="whitespace-pre-wrap">{values.join(' · ')}</dd></div>:null;
 })}</dl></section>;
}

export function PublicAnswerSharing({userId}:{userId?:string}) {
 const [onboarding,setOnboarding]=useState<Record<string,any>|null>(null);
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 useEffect(()=>{
  if(!userId)return;let active=true;
  getSupabaseBrowserClient().from('profile_answers').select('onboarding').eq('user_id',userId).maybeSingle().then(({data,error})=>{
   if(!active)return;
   if(error)setError('Unable to load sharing preferences.');else setOnboarding(data?.onboarding??{});
  });return()=>{active=false;};
 },[userId]);
 const shared=onboarding?.baselineV2?.answersPublic===true;
 async function change() {
  if(!userId||!onboarding?.baselineV2)return;setBusy(true);setError('');
  try {
   const next={...onboarding,baselineV2:{...onboarding.baselineV2,answersPublic:!shared}};
   const {data,error}=await getSupabaseBrowserClient().from('profile_answers').update({onboarding:next}).eq('user_id',userId).eq('onboarding',JSON.stringify(onboarding)).select('onboarding').single();
   if(error)throw error;setOnboarding(data.onboarding);
  }catch(e){setError(e instanceof Error?e.message:'Unable to update sharing. Please retry.');}finally{setBusy(false);}
 }
 return <section className="rounded-3xl bg-[#f2f0e7] p-5 text-[#203B30]"><h2>Share your friendship answers</h2><p>Sharing publishes your six-question selections and custom text to other signed-in members and uses them for matching. Earlier private answers stay private until you choose to share.</p>
 {onboarding?.baselineV2&&<><details className="my-3"><summary>Review the answers before sharing</summary><PublicAnswers answers={onboarding.baselineV2}/></details><button type="button" className="underline py-3" disabled={busy} onClick={change}>{busy?'Saving…':shared?'Stop sharing these answers':'Share these answers on my profile and in matching'}</button><p>{shared?'Shared with members':'Private—not used as public matching preferences'}</p></>}
 {error&&<p role="alert">{error}</p>}</section>;
}
