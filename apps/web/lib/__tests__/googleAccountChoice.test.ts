import React from 'react';
import {act,create,type ReactTestRenderer} from 'react-test-renderer';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({oauth:vi.fn(),signup:vi.fn()}));
vi.mock('../supabase',()=>({checkIsSupabaseConfigured:()=>false,getSupabaseBrowserClient:()=>({auth:{signInWithOAuth:mocks.oauth,signUp:mocks.signup}})}));
import {AuthProvider,useAuth,type AuthContextType} from '../authContext';
let auth:AuthContextType;
let tree:ReactTestRenderer;
function Consumer(){auth=useAuth();return null;}
beforeEach(async()=>{
 vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
 vi.stubEnv('NEXT_PUBLIC_SITE_URL','https://example.com');
 mocks.oauth.mockReset().mockResolvedValue({error:null});
 await act(async()=>{tree=create(React.createElement(AuthProvider,null,React.createElement(Consumer)));});
});
afterEach(async()=>{await act(async()=>tree.unmount());vi.unstubAllGlobals();vi.unstubAllEnvs();});
it('the Google option opens account choice with the atomic home callback',async()=>{
 await auth.signInWithGoogle('/home?onboarding=complete');
 expect(mocks.oauth).toHaveBeenCalledWith({provider:'google',options:{redirectTo:'https://example.com/auth/callback?next=%2Fhome%3Fonboarding%3Dcomplete',queryParams:{prompt:'select_account'}}});
});
it('password confirmation email returns to the same atomic handoff and reports no session',async()=>{
 mocks.signup.mockResolvedValue({data:{user:{id:'test-member'},session:null},error:null});
 const result=await auth.signUpWithPassword('test@example.com','local-test-password','/home?onboarding=complete');
 expect(mocks.signup).toHaveBeenCalledWith({email:'test@example.com',password:'local-test-password',options:{emailRedirectTo:'https://example.com/auth/callback?next=%2Fhome%3Fonboarding%3Dcomplete'}});
 expect(result.requiresEmailConfirmation).toBe(true);
});
it('ordinary Google login retains its existing destination and behaviour',async()=>{
 await auth.signInWithGoogle('/people');
 expect(mocks.oauth).toHaveBeenCalledWith({provider:'google',options:{redirectTo:'https://example.com/auth/callback?next=%2Fpeople'}});
});
