import React from 'react';
import {act,create,type ReactTestRenderer} from 'react-test-renderer';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {emptyDraft,INTENTS,CLICKS,GROUPS,FRIEND_QUALITIES,OUTINGS,canonicalRhythm} from '../sixQuestionOnboarding';
import {LIFE_CONTEXTS} from '../lifeContext';

const mocks=vi.hoisted(()=>({user:{id:'10000000-0000-4000-8000-000000000001'} as {id:string}|null,hydrate:vi.fn(),push:vi.fn(),replace:vi.fn(),google:vi.fn(),availability:vi.fn()}));
vi.mock('../authContext',()=>({useAuth:()=>({user:mocks.user,loading:false,signInWithGoogle:mocks.google})}));
vi.mock('../profileHydration',()=>({hydrateProfile:mocks.hydrate}));
vi.mock('../userStore',()=>({getUserProfile:()=>({handle:'existing_member',homeArea:'Bedok'}),validateHandle:()=>({valid:true})}));
vi.mock('../supabaseAuth',()=>({checkHandleAvailability:mocks.availability}));
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
 mocks.google.mockResolvedValue({error:null});
 mocks.availability.mockResolvedValue({available:true});
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
it('recovers an explicit OAuth-return save and opens home without another save step',async()=>{
 window.location.search='?finish=1';
 const calls=requests();await act(async()=>{tree=create(React.createElement(EarlyRead));});
 expect(calls).toContain('POST /api/onboarding/claim');
 expect(mocks.hydrate).toHaveBeenCalledWith(mocks.user!.id);
 expect(JSON.stringify(tree!.toJSON())).toContain('Your answers are saved to your profile.');
 expect(mocks.replace).toHaveBeenCalledWith('/home');
});
it('shows failed handoff and retry, never a saved profile or matches link',async()=>{
 window.location.search='?finish=1';
 requests(true);await act(async()=>{tree=create(React.createElement(EarlyRead));});
 const rendered=JSON.stringify(tree!.toJSON());
 expect(rendered).toContain('Injected save failure');expect(rendered).toContain('Retry loading and saving');
 expect(rendered).not.toContain('Your answers are saved to your profile.');expect(rendered).not.toContain('See who I might click with');
 expect(mocks.hydrate).not.toHaveBeenCalled();
});
it('keeps anonymous answers as drafts and opens signup choices with home handoff',async()=>{
 mocks.user=null;const calls=requests();await act(async()=>{tree=create(React.createElement(EarlyRead));});
 expect(calls).not.toContain('POST /api/onboarding/claim');
 expect(tree!.root.findAllByType('a').some(a=>a.props.href==='/join')).toBe(false);
 expect(tree!.root.findAllByType('input')).toHaveLength(0);
 const button=tree!.root.findAllByType('button').find(b=>b.props.children==='Save Early Read')!;
 await act(async()=>{await button.props.onClick();});
 expect(mocks.google).not.toHaveBeenCalled();
 expect(mocks.push).toHaveBeenCalledWith('/auth/signin?next=%2Fhome%3Fonboarding%3Dcomplete');
});
it('returns a guest without the age receipt to onboarding before Google',async()=>{
 mocks.user=null;requests();
 const base=fetch;
 vi.stubGlobal('fetch',vi.fn((url:string,init?:RequestInit)=>url==='/api/onboarding/eligibility'?Promise.resolve(Response.json({birthYear:null})):base(url,init)));
 await act(async()=>{tree=create(React.createElement(EarlyRead));});
 const button=tree!.root.findAllByType('button').find(b=>b.props.children==='Save Early Read')!;
 await act(async()=>{await button.props.onClick();});
 expect(mocks.google).not.toHaveBeenCalled();expect(mocks.push).toHaveBeenCalledWith('/onboarding');
});
it('rejects underage onboarding before Early Read without putting DOB in the draft',async()=>{
 mocks.user=null;requests();const base=fetch;const sent:Array<{url:string;body:any}>=[];
 vi.stubGlobal('fetch',vi.fn(async(url:string,init?:RequestInit)=>{
  if(init?.body)sent.push({url,body:JSON.parse(String(init.body))});
  if(url==='/api/onboarding/eligibility')return init?.method==='POST'?Response.json({error:'Soul Tribe is for people aged 18 and above.'},{status:400}):Response.json({birthYear:null});
  return base(url,init);
 }));
 await act(async()=>{tree=create(React.createElement(Onboarding));});
 await act(async()=>{tree!.root.findByProps({id:'onboarding-birth-date'}).props.onChange({target:{value:'2020-01-01'}});});
 await act(async()=>{await tree!.root.findAllByType('button').find(b=>b.props.className==='ob-primary')!.props.onClick();});
 expect(mocks.push).not.toHaveBeenCalled();expect(JSON.stringify(tree!.toJSON())).toContain('aged 18 and above');
 expect(sent.find(r=>r.url==='/api/onboarding/draft')!.body.birthDate).toBeUndefined();
 expect(sent.find(r=>r.url==='/api/onboarding/eligibility')!.body).toEqual({birthDate:'2020-01-01'});
});
it('signed-in onboarding saves only the draft before opening the Early Read preview',async()=>{
 const calls=requests();await act(async()=>{tree=create(React.createElement(Onboarding));});
 const button=tree!.root.findAllByType('button').find(b=>b.props.className==='ob-primary')!;
 await act(async()=>{await button.props.onClick();});
 expect(calls.at(-1)).toBe('POST /api/onboarding/draft');
 expect(calls).not.toContain('POST /api/onboarding/claim');
 expect(mocks.hydrate).not.toHaveBeenCalled();expect(mocks.push).toHaveBeenCalledWith('/early-read');
});
it('a failed username check blocks final submission and displays the failure',async()=>{
 const calls=requests();mocks.availability.mockResolvedValue({available:false,failed:true,message:'Could not check username availability. Please retry.'});
 await act(async()=>{tree=create(React.createElement(Onboarding));});
 await act(async()=>{await tree!.root.findAllByType('button').find(b=>b.props.className==='ob-primary')!.props.onClick();});
 expect(mocks.push).not.toHaveBeenCalled();expect(calls).not.toContain('POST /api/onboarding/draft');
 expect(JSON.stringify(tree!.toJSON())).toContain('Could not check username availability');
});
it('a signed-in failed final submission stays editable and never navigates',async()=>{
 requests();const base=fetch;
 vi.stubGlobal('fetch',vi.fn((url:string,init?:RequestInit)=>url==='/api/onboarding/draft'&&init?.method==='POST'?Promise.resolve(Response.json({error:'Save failed'},{status:500})):base(url,init)));
 await act(async()=>{tree=create(React.createElement(Onboarding));});
 const button=tree!.root.findAllByType('button').find(b=>b.props.className==='ob-primary')!;
 await act(async()=>{await button.props.onClick();});
 expect(mocks.push).not.toHaveBeenCalled();expect(JSON.stringify(tree!.toJSON())).toContain('We could not save your answers');
});
it('signed-in preview also waits for Save Early Read and opens auth choices rather than auto-saving',async()=>{
 const calls=requests();await act(async()=>{tree=create(React.createElement(EarlyRead));});
 expect(calls).not.toContain('POST /api/onboarding/claim');expect(mocks.hydrate).not.toHaveBeenCalled();
 const button=tree!.root.findAllByType('button').find(b=>b.props.children==='Save Early Read')!;
 await act(async()=>{await button.props.onClick();});
 expect(mocks.google).not.toHaveBeenCalled();
 expect(mocks.push).toHaveBeenCalledWith('/auth/signin?next=%2Fhome%3Fonboarding%3Dcomplete');
 expect(calls).not.toContain('POST /api/onboarding/claim');
});
it('eligibility failure remains visible and never claims the draft or opens auth',async()=>{
 const calls=requests();const base=fetch;
 vi.stubGlobal('fetch',vi.fn((url:string,init?:RequestInit)=>url==='/api/onboarding/eligibility'?Promise.resolve(Response.json({error:'Age check unavailable'},{status:503})):base(url,init)));
 await act(async()=>{tree=create(React.createElement(EarlyRead));});
 await act(async()=>{await tree!.root.findAllByType('button').find(b=>b.props.children==='Save Early Read')!.props.onClick();});
 expect(JSON.stringify(tree!.toJSON())).toContain('Age check unavailable');expect(mocks.push).not.toHaveBeenCalled();
 expect(calls).not.toContain('POST /api/onboarding/claim');expect(mocks.replace).not.toHaveBeenCalled();
});
