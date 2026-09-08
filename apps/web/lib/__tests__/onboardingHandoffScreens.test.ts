import React from 'react';
import {act,create,type ReactTestRenderer} from 'react-test-renderer';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {emptyDraft,INTENTS,CLICKS,GROUPS,FRIEND_QUALITIES,OUTINGS,canonicalRhythm} from '../sixQuestionOnboarding';
import {LIFE_CONTEXTS} from '../lifeContext';

const mocks=vi.hoisted(()=>({user:{id:'10000000-0000-4000-8000-000000000001'} as {id:string}|null,hydrate:vi.fn(),push:vi.fn(),replace:vi.fn()}));
vi.mock('../authContext',()=>({useAuth:()=>({user:mocks.user,loading:false})}));
vi.mock('../profileHydration',()=>({hydrateProfile:mocks.hydrate}));
vi.mock('../userStore',()=>({getUserProfile:()=>({handle:'existing_member',homeArea:'Bedok'})}));
vi.mock('../supabase',()=>({getSupabaseBrowserClient:()=>{throw new Error('Unexpected saved-profile lookup');}}));
vi.mock('next/navigation',()=>({useRouter:()=>({push:mocks.push,replace:mocks.replace})}));
vi.mock('next/link',()=>({default:({children,...props}:any)=>React.createElement('a',props,children)}));
vi.mock('../../components/profile/EarlyReadAlbum',()=>({EarlyReadAlbum:()=>React.createElement('p',null,'Early Read')}));
vi.mock('../../app/early-read/ProfilePhoto',()=>({default:()=>null}));
vi.mock('../../app/onboarding/PhotoPicker',()=>({default:()=>null}));
import EarlyRead from '../../app/early-read/page';
import Onboarding from '../../app/onboarding/page';

const draft=canonicalRhythm({...emptyDraft(),step:7,intent:[INTENTS[0]],clicks:[CLICKS[0]],group:GROUPS[0],groupChoices:[GROUPS[0]],desiredQualities:[FRIEND_QUALITIES[0]],connectionChoice:'About once a week',planningChoice:'Same day',outings:[OUTINGS[0]],handle:'existing_member',area:'Bedok',country:'Singapore',lifeContexts:[LIFE_CONTEXTS[0]]});
let tree:ReactTestRenderer|undefined;
beforeEach(()=>{
 mocks.user={id:'10000000-0000-4000-8000-000000000001'};vi.clearAllMocks();
 vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);vi.stubGlobal('window',{location:{search:''}});
});
afterEach(async()=>{if(tree)await act(async()=>tree!.unmount());tree=undefined;vi.unstubAllGlobals();});
function requests(fail=false) {
 const calls:string[]=[];
 vi.stubGlobal('fetch',vi.fn(async(url:string,init?:RequestInit)=>{
  calls.push(`${init?.method??'GET'} ${url}`);
  if(url==='/api/onboarding/eligibility')return Response.json({birthYear:1995});
  if(url==='/api/onboarding/draft')return Response.json(init?.method==='POST'?{saved:true}:{draft,claimed:false});
  if(url==='/api/onboarding/claim')return fail?Response.json({error:'Injected save failure'},{status:500}):Response.json({saved:true,draft});
  throw new Error('Unexpected request');
 }));return calls;
}
it('claims the completed draft after sign-in without a second save button',async()=>{
 const calls=requests();await act(async()=>{tree=create(React.createElement(EarlyRead));});
 expect(calls).toContain('POST /api/onboarding/claim');
 expect(mocks.hydrate).toHaveBeenCalledWith(mocks.user!.id);
 expect(JSON.stringify(tree!.toJSON())).toContain('Your answers are saved to your profile.');
});
it('shows failed handoff and retry, never a saved profile or matches link',async()=>{
 requests(true);await act(async()=>{tree=create(React.createElement(EarlyRead));});
 const rendered=JSON.stringify(tree!.toJSON());
 expect(rendered).toContain('Injected save failure');expect(rendered).toContain('Retry loading and saving');
 expect(rendered).not.toContain('Your answers are saved to your profile.');expect(rendered).not.toContain('See who I might click with');
 expect(mocks.hydrate).not.toHaveBeenCalled();
});
it('keeps anonymous answers as drafts and routes signup through name/age collection',async()=>{
 mocks.user=null;const calls=requests();await act(async()=>{tree=create(React.createElement(EarlyRead));});
 expect(calls).not.toContain('POST /api/onboarding/claim');
 expect(tree!.root.findAllByType('a').some(a=>a.props.href==='/join')).toBe(true);
});
it('signed-in final submission commits draft, then profile, before navigation',async()=>{
 const calls=requests();await act(async()=>{tree=create(React.createElement(Onboarding));});
 const button=tree!.root.findAllByType('button').find(b=>b.props.className==='ob-primary')!;
 await act(async()=>{await button.props.onClick();});
 expect(calls.slice(-2)).toEqual(['POST /api/onboarding/draft','POST /api/onboarding/claim']);
 expect(mocks.hydrate).toHaveBeenCalled();expect(mocks.push).toHaveBeenCalledWith('/early-read');
});
it('a signed-in failed final submission stays editable and never navigates',async()=>{
 requests(true);await act(async()=>{tree=create(React.createElement(Onboarding));});
 const button=tree!.root.findAllByType('button').find(b=>b.props.className==='ob-primary')!;
 await act(async()=>{await button.props.onClick();});
 expect(mocks.push).not.toHaveBeenCalled();expect(JSON.stringify(tree!.toJSON())).toContain('Injected save failure');
});
