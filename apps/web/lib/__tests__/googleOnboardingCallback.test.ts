import {beforeEach,expect,it,vi} from 'vitest';
import {NextRequest} from 'next/server';
const state=vi.hoisted(()=>({claim:vi.fn(),exchangeError:null as any,user:{id:'test-member'} as any,client:null as any,lookups:vi.fn()}));
vi.mock('../claimOnboardingServer',()=>({claimOnboardingServer:state.claim}));
vi.mock('@supabase/ssr',()=>({createServerClient:(_url:string,_key:string,options:any)=>{
 state.client={auth:{
  exchangeCodeForSession:async()=>{options.cookies.setAll([{name:'test-session',value:'local-test-session',options:{httpOnly:true}}]);return {error:state.exchangeError};},
  getUser:async()=>({data:{user:state.user},error:null}),
 },from:state.lookups};
 return state.client;
}}));
import {GET} from '../../app/auth/callback/route';
beforeEach(()=>{
 vi.clearAllMocks();state.exchangeError=null;state.user={id:'test-member'};
 state.claim.mockResolvedValue({status:200,body:{saved:true}});
});
function request(){return new NextRequest('https://example.com/auth/callback?code=local-test-code&next=%2Fhome%3Fonboarding%3Dcomplete',{headers:{cookie:'st_onboarding_v2=local-test-draft; st_adult_eligibility=local-test-proof'}});}
it('claims with the exchanged session before redirecting straight home, retaining cookies',async()=>{
 const response=await GET(request());
 expect(state.claim).toHaveBeenCalledWith(state.client,state.user,'local-test-draft','local-test-proof');
 expect(response.headers.get('location')).toBe('https://example.com/home');
 expect(response.cookies.get('test-session')?.value).toBe('local-test-session');
 expect(state.lookups).not.toHaveBeenCalled();
});
it('never opens home or a username form when saving fails, and keeps sign-in for retry',async()=>{
 state.claim.mockResolvedValue({status:409,body:{error:'database failure'}});
 const response=await GET(request());
 expect(response.headers.get('location')).toBe('https://example.com/early-read?finish=1');
 expect(response.cookies.get('test-session')?.value).toBe('local-test-session');
 expect(state.lookups).not.toHaveBeenCalled();
});
it('keeps sign-in on an unexpected database exception and routes to visible retry',async()=>{
 state.claim.mockRejectedValue({code:'42703',message:'Missing field'});
 const response=await GET(request());
 expect(response.headers.get('location')).toBe('https://example.com/early-read?finish=1');
 expect(response.cookies.get('test-session')).toBeDefined();
});
it('does not claim when Google exchange fails',async()=>{
 state.exchangeError={message:'Exchange rejected'};
 const response=await GET(request());
 expect(state.claim).not.toHaveBeenCalled();expect(response.headers.get('location')).toContain('error=exchange_failed');
});
it('does not claim or reach home without a verified user',async()=>{
 state.user=null;const response=await GET(request());
 expect(state.claim).not.toHaveBeenCalled();expect(response.headers.get('location')).toContain('error=exchange_failed');
});
