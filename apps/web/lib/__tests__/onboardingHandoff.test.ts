import {beforeEach,describe,expect,it,vi} from 'vitest';
import {NextRequest} from 'next/server';
import {POST} from '../../app/api/onboarding/claim/route';
import {emptyDraft,INTENTS,CLICKS,GROUPS,FRIEND_QUALITIES,OUTINGS,canonicalRhythm} from '../sixQuestionOnboarding';
import {LIFE_CONTEXTS} from '../lifeContext';
import {claimOnboarding} from '../onboardingHandoff';
import {makeProof,ELIGIBILITY_COOKIE} from '../eligibilityProof';

const state=vi.hoisted(()=>({user:{id:'10000000-0000-4000-8000-000000000001'} as {id:string}|null,profile:null as any,draft:null as any,error:null as any,rpc:vi.fn()}));
vi.mock('../supabaseServer',()=>({getSupabaseServerClient:async()=>({
 auth:{getUser:async()=>({data:{user:state.user},error:null})},rpc:state.rpc,
 from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:state.profile,error:null})})})}),
})}));
const token='a'.repeat(64);
const draft=canonicalRhythm({...emptyDraft(),step:7,intent:[INTENTS[0]],clicks:[CLICKS[0]],group:GROUPS[0],groupChoices:[GROUPS[0]],desiredQualities:[FRIEND_QUALITIES[0]],connectionChoice:'About once a week',planningChoice:'Same day',outings:[OUTINGS[0]],handle:'existing_member',area:'Bedok',country:'Singapore',lifeContexts:[LIFE_CONTEXTS[0]],displayName:'Chosen display name'});
function request(body:unknown={},proof=false) {
 return new NextRequest('https://example.com/api/onboarding/claim',{method:'POST',headers:{origin:'https://example.com',cookie:`st_onboarding_v2=${token}${proof?`; ${ELIGIBILITY_COOKIE}=${makeProof(token,1995)}`:''}`},body:JSON.stringify(body)});
}
beforeEach(()=>{
 state.user={id:'10000000-0000-4000-8000-000000000001'};state.profile=null;state.draft=draft;state.error=null;
 state.rpc.mockReset().mockImplementation(async(name:string)=>({data:name==='read_onboarding_draft'?state.draft:draft,error:name==='claim_onboarding_draft'?state.error:null}));
});
describe('authenticated draft handoff API',()=>{
 it('automatically uses the existing authenticated profile identity, not submitted replacements',async()=>{
  state.profile={display_name:'Original name',birth_year:1991};
  const response=await POST(request({displayName:'Do not overwrite',birthYear:2000}));
  expect(response.status).toBe(200);expect((await response.json()).saved).toBe(true);
  expect(state.rpc).toHaveBeenCalledWith('claim_onboarding_draft',{p_token:token,p_display_name:state.profile.display_name,p_birth_year:state.profile.birth_year});
 });
 it('uses the actual signup name and checked age for a new account',async()=>{
  const response=await POST(request({},true));
  expect(response.status).toBe(200);
  expect(state.rpc).toHaveBeenCalledWith('claim_onboarding_draft',expect.objectContaining({p_display_name:draft.displayName,p_birth_year:1995}));
 });
 it('does not accept an unchecked birth year for the modern signup',async()=>{
  const response=await POST(request({birthYear:1995}));
  expect(response.status).toBe(400);expect((await response.json()).requiresDetails).toBe(true);
  expect(state.rpc.mock.calls.some(([name])=>name==='claim_onboarding_draft')).toBe(false);
 });
 it('returns a failed transaction as an error, not a saved draft',async()=>{
  state.profile={display_name:'Original name',birth_year:1991};state.error={code:'23514',message:'Injected trait failure'};
  const response=await POST(request());
  expect(response.status).toBe(409);expect(await response.json()).toEqual({code:state.error.code,error:state.error.message});
 });
 it('rejects an expired/other-account draft and unauthenticated claims',async()=>{
  state.draft=null;expect((await POST(request())).status).toBe(410);
  state.user=null;expect((await POST(request())).status).toBe(401);
 });
});
describe('UI handoff confirmation',()=>{
 it('returns the database-confirmed selections, including differing literal choices',async()=>{
  for(const outing of OUTINGS.slice(0,2)) {
   const committed={...draft,outings:[outing]};
   const send=vi.fn().mockResolvedValue(Response.json({saved:true,draft:committed}));
   expect(await claimOnboarding({},send)).toEqual(committed);
  }
 });
 it('never treats draft-only success, malformed data, or failed persistence as profile success',async()=>{
  for(const response of [Response.json({draft}),Response.json({saved:true,draft:{}}),Response.json({error:'Rollback'},{status:500})]) {
   await expect(claimOnboarding({},vi.fn().mockResolvedValue(response))).rejects.toThrow();
  }
 });
});
