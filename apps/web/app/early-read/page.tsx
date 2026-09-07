"use client";
import ProfilePhoto from './ProfilePhoto';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useAuth} from '../../lib/authContext';
import {hydrateProfile} from '../../lib/profileHydration';
import {getSupabaseBrowserClient} from '../../lib/supabase';
import {completeDraft,isDraft} from '../../lib/sixQuestionOnboarding';
import {buildEarlyRead,type ReadDraft,type ReadFeedback} from '../../lib/earlyRead';
import {EarlyReadAlbum} from '../../components/profile/EarlyReadAlbum';
import '../onboarding/onboarding.css';
import './early-read.css';
export default function EarlyRead() {
 const {user,loading}=useAuth();
 const [draft,setDraft]=useState<ReadDraft|null>(null),[saved,setSaved]=useState(false);
 const [name,setName]=useState(''),[year,setYear]=useState(''),[ageChecked,setAgeChecked]=useState(false);
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState(false);
 useEffect(()=>{
  let active=true;
  fetch('/api/onboarding/eligibility').then(r=>r.ok?r.json():null).then(d=>{if(active&&d?.birthYear){setYear(String(d.birthYear));setAgeChecked(true);}}).catch(()=>{});
  return()=>{active=false;};
 },[]);
 useEffect(()=>{
  if(loading)return;let active=true;setReady(false);setDraft(null);setSaved(false);setError('');
  async function load() {
   try {
    if(user) {
     const {data,error}=await getSupabaseBrowserClient().from('profile_answers').select('onboarding').eq('user_id',user.id).maybeSingle();
     if(error)throw error;
     if(isDraft(data?.onboarding?.baselineV2)) {
      if(active){setDraft(data.onboarding.baselineV2);setSaved(true);}return;
     }
    }
    const response=await fetch('/api/onboarding/draft',{cache:'no-store'});
    if(!response.ok)throw new Error('Unable to load your answers. Please reload.');
    const data=await response.json();
    if(!isDraft(data.draft)||!completeDraft(data.draft))throw new Error('Complete your onboarding answers in this browser to reveal your Early Read.');
    if(active)setDraft(data.draft);
   }catch(e){if(active)setError(e instanceof Error?e.message:'Unable to load your answers. Please reload.');}
   finally{if(active)setReady(true);}
  }
  void load();return()=>{active=false;};
 },[loading,user]);
 async function feedback(id:string,value:ReadFeedback) {
  if(!draft)throw new Error('No answers');
  if(saved&&user) {
   const client=getSupabaseBrowserClient();
   const {data,error}=await client.from('profile_answers').select('onboarding').eq('user_id',user.id).single();
   if(error)throw error;
   const current=data.onboarding.baselineV2 as ReadDraft;
   if(!isDraft(current)||buildEarlyRead(current).find(c=>c.id===id)?.basis!==value.basis)throw new Error('Answers changed. Reload.');
   const next={...current,earlyReadFeedback:{...current.earlyReadFeedback,[id]:value}};
   const result=await client.from('profile_answers').update({onboarding:{...data.onboarding,baselineV2:next}}).eq('user_id',user.id).eq('onboarding',JSON.stringify(data.onboarding)).select('user_id').single();
   if(result.error)throw result.error;setDraft(next);
  }else{
   const read=await fetch('/api/onboarding/draft',{cache:'no-store'});
   if(!read.ok)throw new Error('Unable to load draft');
   const {draft:current}=await read.json();
   if(!isDraft(current)||buildEarlyRead(current).find(c=>c.id===id)?.basis!==value.basis)throw new Error('Answers changed');
   const next={...current,earlyReadFeedback:{...(current as ReadDraft).earlyReadFeedback,[id]:value}};
   const response=await fetch('/api/onboarding/draft',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)});
   if(!response.ok)throw new Error('Unable to save correction');setDraft(next);
  }
 }
 async function save(e:React.FormEvent) {
  e.preventDefault();if(!user)return;setBusy(true);setError('');
  try {
   const r=await fetch('/api/onboarding/claim',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({displayName:name.trim(),birthYear:Number(year)})});
   const data=await r.json();if(!r.ok)throw new Error(data.error);
   await hydrateProfile(user.id);setDraft(data.draft);setSaved(true);
  }catch(e){setError(e instanceof Error?e.message:'Unable to save profile.');}finally{setBusy(false);}
 }
 return <main className="er-shell"><Link href="/" className="er-brand">SOUL TRIBE</Link><section className="er-content">
 {!ready&&<p role="status">Reading your answers…</p>}
 {draft&&<><EarlyReadAlbum draft={draft}/>
 {!user?<><Link className="ob-primary" href="/auth/signin?next=%2Fearly-read">Keep my Early Read and meet people →</Link></>:!saved?<><h2>Keep this reading as your starting point.</h2><form className="ob-fields" onSubmit={save}><label htmlFor="name">Display name</label><input id="name" required maxLength={80} autoComplete="nickname" value={name} onChange={e=>setName(e.target.value)}/>
 {!ageChecked&&draft.setupRevision!==2&&<><label htmlFor="year">Birth year</label><input id="year" required type="number" min={1930} max={new Date().getFullYear()-18} value={year} onChange={e=>setYear(e.target.value)}/></>}
 {!ageChecked&&draft.setupRevision===2&&<Link href="/join">Complete your private age check →</Link>}
 <button className="ob-primary" disabled={busy||(draft.setupRevision===2&&!ageChecked)}>{busy?'Saving…':'Save my profile →'}</button></form></>:<><ProfilePhoto userId={user.id}/><Link className="ob-primary" href="/people">See who I might click with →</Link><Link href="/you">My Social Signature</Link><Link href="/you/deeper">Deepen my Tribal Pass</Link></>}
 </>}
 {error&&<p role="alert" className="ob-error">{error}</p>}
 {ready&&!draft&&<Link href="/onboarding">Return to onboarding</Link>}
 </section></main>;
}
