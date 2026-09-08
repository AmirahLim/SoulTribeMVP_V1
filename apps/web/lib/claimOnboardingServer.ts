import type {SupabaseClient, User} from '@supabase/supabase-js';
import {readProof} from './eligibilityProof';

type ClaimBody = {displayName?:string;birthYear?:number;expectedUserId?:string};
/** Same authenticated transaction for the POST endpoint and OAuth return. */
export async function claimOnboardingServer(client:SupabaseClient,user:User,token:string|undefined,proof:string|undefined,body:ClaimBody={}) {
 if(!token)return {status:410,body:{error:'Your saved answers are on the browser where you started. Return there to continue.'}};
 if(body.expectedUserId!==undefined&&body.expectedUserId!==user.id)return {status:409,body:{error:'Your signed-in account changed. Reload before saving.'}};
 const {data:pending,error:pendingError}=await client.rpc('read_onboarding_draft',{p_token:token});
 if(pendingError)throw pendingError;
 if(!pending)return {status:410,body:{error:'Your draft is unavailable or expired. Return to onboarding in the browser where you started.'}};
 const {data:profile,error:profileError}=await client.from('profiles').select('handle,birth_year').eq('id',user.id).maybeSingle();
 if(profileError)throw profileError;
 // Public identity is exclusively the member-chosen username. Google account
 // metadata, email and legacy display names must never become public defaults.
 const displayName=profile?.handle || pending.handle;
 const birthYear=profile?.birth_year ?? readProof(token,proof) ?? (pending.setupRevision===2?null:body.birthYear);
 if(typeof displayName!=='string'||!displayName.trim()||displayName.trim().length>80||!birthYear)return {status:400,body:{error:'Complete your profile details and private 18+ check in onboarding.',requiresDetails:true}};
 const {data,error}=await client.rpc('claim_onboarding_draft',{p_token:token,p_display_name:displayName.trim(),p_birth_year:birthYear});
 if(error){
  console.error('[SoulTribe] onboarding claim failed',{code:error.code,message:error.message});
  return {status:409,body:{code:error.code,error:error.code==='23505'?'That handle is taken. Go back to choose another.':error.message}};
 }
 return {status:200,body:{saved:true,draft:data}};
}
