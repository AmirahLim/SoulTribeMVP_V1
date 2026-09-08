"use client";
import ProfilePhoto from './ProfilePhoto';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '../../lib/authContext';
import {hydrateProfile} from '../../lib/profileHydration';
import {getSupabaseBrowserClient} from '../../lib/supabase';
import {completeDraft,isDraft} from '../../lib/sixQuestionOnboarding';
import {buildEarlyRead,type ReadDraft,type ReadFeedback} from '../../lib/earlyRead';
import {EarlyReadAlbum} from '../../components/profile/EarlyReadAlbum';
import {claimOnboarding,OnboardingHandoffError} from '../../lib/onboardingHandoff';
import '../onboarding/onboarding.css';
import './early-read.css';
export default function EarlyRead() {
 const {user,loading}=useAuth();
 const router=useRouter();
 const [draft,setDraft]=useState<ReadDraft|null>(null),[saved,setSaved]=useState(false);
 const [year,setYear]=useState(''),[ageChecked,setAgeChecked]=useState(false);
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState(false);
 const [retry,setRetry]=useState(0),[needsDetails,setNeedsDetails]=useState(false);
 useEffect(()=>{
  let active=true;
  fetch('/api/onboarding/eligibility').then(r=>r.ok?r.json():null).then(d=>{if(active&&d?.birthYear){setYear(String(d.birthYear));setAgeChecked(true);}}).catch(()=>{});
  return()=>{active=false;};
 },[]);
 useEffect(()=>{
  if(loading)return;let active=true;setReady(false);setDraft(null);setSaved(false);setError('');setNeedsDetails(false);
  async function load() {
   try {
    const response=await fetch('/api/onboarding/draft',{cache:'no-store'});
    if(!response.ok)throw new Error('Unable to load your answers. Please reload.');
    const pending=await response.json();
    if(!active)return;
    if(isDraft(pending.draft)&&completeDraft(pending.draft)&&!pending.claimed) {
     if(active)setDraft(pending.draft);
     // Ordinary preview is read-only, even when a session already exists.
     // Only recover an explicit OAuth-return failure here.
     if(user&&new URLSearchParams(window.location.search).get('finish')==='1') {
      if(active)setBusy(true);
      try {
       const committed=await claimOnboarding({expectedUserId:user.id});
       if(!active)return;
       await hydrateProfile(user.id);
       if(active){setDraft(committed);setSaved(true);router.replace('/home');}
      }catch(e){
       if(e instanceof OnboardingHandoffError&&e.requiresDetails) {if(active)setNeedsDetails(true);}
       else throw e;
      }
     }
     return;
    }
    if(user) {
     const {data,error}=await getSupabaseBrowserClient().from('profile_answers').select('onboarding').eq('user_id',user.id).maybeSingle();
     if(error)throw error;
     if(isDraft(data?.onboarding?.baselineV2)) {
      if(active){setDraft(data.onboarding.baselineV2);setSaved(true);}return;
     }
    }
    throw new Error('Complete your onboarding answers in this browser to reveal your Early Read.');
   }catch(e){if(active)setError(e instanceof Error?e.message:'Unable to load your answers. Please reload.');}
   finally{if(active){setReady(true);setBusy(false);}}
  }
  void load();return()=>{active=false;};
 },[loading,user?.id,retry]);
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
   const committed=await claimOnboarding({birthYear:Number(year),expectedUserId:user.id});
   await hydrateProfile(user.id);setDraft(committed);setSaved(true);setNeedsDetails(false);
  }catch(e){setError(e instanceof Error?e.message:'Unable to save profile.');}finally{setBusy(false);}
 }
 async function openSignInChoices() {
  setBusy(true);setError('');
  try {
   const response=await fetch('/api/onboarding/eligibility',{cache:'no-store'});
   const eligibility=await response.json();
   if(!response.ok)throw new Error(eligibility.error||'Unable to load your age check. Please retry.');
   if(!eligibility.birthYear){router.push('/onboarding');return;}
   router.push('/auth/signin?next=%2Fhome%3Fonboarding%3Dcomplete');
  }catch(e){setError(e instanceof Error?e.message:'Sign-in options could not open. Please retry.');}
  finally{setBusy(false);}
 }
 return <main className="er-shell"><Link href="/" className="er-brand">SOUL TRIBE</Link><section className="er-content">
 {!ready&&<p role="status">Reading your answers…</p>}
 {draft&&<><EarlyReadAlbum draft={draft}/>
 {!saved&&!needsDetails?<><p>Your Early Read is ready. Save it to your profile, then meet people. Choose how to sign up or log in on the next page.</p><button className="ob-primary" disabled={busy} onClick={()=>void openSignInChoices()}>{busy?'Opening sign-in…':'Save Early Read'}</button></>:!saved?needsDetails?<><h2>Finish saving your profile.</h2><form className="ob-fields" onSubmit={save}><p>Your public name is your chosen username. Google account details stay private.</p>
 {!ageChecked&&draft.setupRevision!==2&&<><label htmlFor="year">Birth year</label><input id="year" required type="number" min={1930} max={new Date().getFullYear()-18} value={year} onChange={e=>setYear(e.target.value)}/></>}
 {!ageChecked&&draft.setupRevision===2&&<Link href="/onboarding">Complete your private age check in onboarding →</Link>}
 <button className="ob-primary" disabled={busy||(draft.setupRevision===2&&!ageChecked)}>{busy?'Saving…':'Save my profile →'}</button></form></>:<p role="status">{busy?'Saving your answers to your profile…':'Your profile save has not completed.'}</p>:<><p role="status">Your answers are saved to your profile.</p><Link className="ob-primary" href="/home">Continue to home →</Link>{user&&<ProfilePhoto userId={user.id}/>}<Link href="/you">My Social Signature</Link><Link href="/you/deeper">Deepen my Tribal Pass</Link></>}
 </>}
 {error&&<><p role="alert" className="ob-error">{error}</p><button className="ob-primary" disabled={busy} onClick={()=>setRetry(n=>n+1)}>Retry loading and saving</button><Link href="/onboarding">Return to my answers</Link></>}
 {ready&&!draft&&<Link href="/onboarding">Return to onboarding</Link>}
 </section></main>;
}
