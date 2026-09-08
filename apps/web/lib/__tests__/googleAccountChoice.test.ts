import React from 'react';
import {act,create,type ReactTestRenderer} from 'react-test-renderer';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({oauth:vi.fn()}));
vi.mock('../supabase',()=>({checkIsSupabaseConfigured:()=>false,getSupabaseBrowserClient:()=>({auth:{signInWithOAuth:mocks.oauth}})}));
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
it('Save Early Read explicitly opens Google account choice with the atomic home callback',async()=>{
 await auth.signInWithGoogle('/home?onboarding=complete');
 expect(mocks.oauth).toHaveBeenCalledWith({provider:'google',options:{redirectTo:'https://example.com/auth/callback?next=%2Fhome%3Fonboarding%3Dcomplete',queryParams:{prompt:'select_account'}}});
});
it('ordinary Google login retains its existing destination and behaviour',async()=>{
 await auth.signInWithGoogle('/people');
 expect(mocks.oauth).toHaveBeenCalledWith({provider:'google',options:{redirectTo:'https://example.com/auth/callback?next=%2Fpeople'}});
});
