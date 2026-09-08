import React from 'react';
import {act,create,type ReactTestRenderer} from 'react-test-renderer';
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import {emptyDraft,canonicalRhythm,INTENTS,CLICKS,GROUPS,FRIEND_QUALITIES,OUTINGS} from '../sixQuestionOnboarding';
import {LIFE_CONTEXTS} from '../lifeContext';
const mocks=vi.hoisted(()=>({user:null as any,push:vi.fn(),replace:vi.fn(),assign:vi.fn(),google:vi.fn(),signup:vi.fn(),login:vi.fn(),otp:vi.fn(),verify:vi.fn(),legacy:vi.fn(),claimFails:false}));
vi.mock('next/navigation',()=>({useRouter:()=>({push:mocks.push,replace:mocks.replace}),useSearchParams:()=>new URLSearchParams('next=%2Fhome%3Fonboarding%3Dcomplete')}));
vi.mock('../authContext',()=>({useAuth:()=>({user:mocks.user,loading:false,isSupabaseConfigured:true,signInWithGoogle:mocks.google,signUpWithPassword:mocks.signup,signInWithPassword:mocks.login,signInWithOtp:mocks.otp,verifyOtp:mocks.verify})}));
vi.mock('../supabaseAuth',()=>({getUserProfileRecord:mocks.legacy,checkHandleAvailability:mocks.legacy,checkUserProfileExists:mocks.legacy}));
vi.mock('../supabaseOnboarding',()=>({saveOnboardingToSupabase:mocks.legacy}));
vi.mock('../userStore',()=>({deriveSuggestedHandle:()=>'',getUserProfile:()=>({}),setUserProfile:mocks.legacy,validateHandle:()=>({valid:true})}));
vi.mock('framer-motion',()=>({motion:{div:'div'},AnimatePresence:({children}:any)=>children}));
import SignIn from '../../app/auth/signin/page';
const draft=canonicalRhythm({...emptyDraft(),step:7,intent:[INTENTS[0]],clicks:[CLICKS[0]],group:GROUPS[0],groupChoices:[GROUPS[0]],desiredQualities:[FRIEND_QUALITIES[0]],connectionChoice:'About once a week',planningChoice:'Same day',outings:[OUTINGS[0]],handle:'local_test_member',area:'Bedok',country:'Singapore',lifeContexts:[LIFE_CONTEXTS[0]]});
let tree:ReactTestRenderer;let calls:string[];
beforeEach(async()=>{
 vi.clearAllMocks();mocks.user=null;mocks.claimFails=false;calls=[];
 vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);vi.stubGlobal('window',{location:{assign:mocks.assign}});
 for(const method of ['google','otp'] as const)mocks[method].mockResolvedValue({error:null});
 for(const method of ['signup','login','verify'] as const)mocks[method].mockResolvedValue({error:null,user:{id:'verified-member'},requiresEmailConfirmation:false});
 vi.stubGlobal('fetch',vi.fn(async(url:string,init?:RequestInit)=>{
  calls.push(`${init?.method??'GET'} ${url}`);
  if(url==='/api/onboarding/draft')return Response.json(init?.method==='POST'?{saved:true}:{draft,claimed:false});
  if(url==='/api/onboarding/claim')return mocks.claimFails?Response.json({error:'Database save failed'},{status:409}):Response.json({saved:true,draft});
  throw new Error('Unexpected endpoint');
 }));
 await act(async()=>{tree=create(React.createElement(SignIn));});
});
afterEach(async()=>{await act(async()=>tree.unmount());vi.unstubAllGlobals();});
function button(label:string){return tree.root.findAllByType('button').find(b=>React.Children.toArray(b.props.children).some(c=>typeof c==='string'&&c.trim()===label))!;}
async function click(label:string){await act(async()=>{await button(label).props.onClick();});}
async function fill(id:string,value:string){await act(async()=>{tree.root.findByProps({id}).props.onChange({target:{value}});});}
async function submit(){await act(async()=>{await tree.root.findByType('form').props.onSubmit({preventDefault(){}});});}
it('shows all three methods and both tabs without automatically selecting Google',()=>{
 for(const label of ['Sign Up','Log In','Continue with Google','Password','Email OTP'])expect(button(label)).toBeDefined();
 expect(mocks.google).not.toHaveBeenCalled();expect(mocks.assign).not.toHaveBeenCalled();expect(mocks.legacy).not.toHaveBeenCalled();
});
it('Google retains the answer-saving home callback without requiring an email display name',async()=>{
 await click('Continue with Google');expect(mocks.google).toHaveBeenCalledWith('/home?onboarding=complete');
 expect(calls).not.toContain('POST /api/onboarding/claim');
});
it('password signup saves the typed name and commits answers before home',async()=>{
 await fill('onboarding-display-name','Chosen name');await fill('auth-email-input','test@example.com');await fill('auth-password-input','local-test-password');await submit();
 expect(mocks.signup).toHaveBeenCalledWith('test@example.com','local-test-password','/home?onboarding=complete');
 expect(calls.slice(-2)).toEqual(['POST /api/onboarding/draft','POST /api/onboarding/claim']);
 expect(mocks.assign).toHaveBeenCalledWith('/home');expect(mocks.legacy).not.toHaveBeenCalled();
 const write=(fetch as any).mock.calls.find(([url,init]:any[])=>url==='/api/onboarding/draft'&&init?.method==='POST');
 expect(JSON.parse(write[1].body).displayName).toBe('Chosen name');
});
it('unconfirmed password signup waits for email instead of treating a user record as a session',async()=>{
 mocks.signup.mockResolvedValue({error:null,user:{id:'unconfirmed'},requiresEmailConfirmation:true});
 await fill('onboarding-display-name','Chosen name');await fill('auth-email-input','test@example.com');await fill('auth-password-input','local-test-password');await submit();
 expect(calls).not.toContain('POST /api/onboarding/claim');expect(mocks.assign).not.toHaveBeenCalled();expect(JSON.stringify(tree.toJSON())).toContain('Check your email to confirm');
});
it('password login commits against the authenticated user before home',async()=>{
 await click('Log In');await fill('auth-email-input','test@example.com');await fill('auth-password-input','local-test-password');await submit();
 expect(mocks.login).toHaveBeenCalled();expect(calls).toContain('POST /api/onboarding/claim');expect(mocks.assign).toHaveBeenCalledWith('/home');expect(mocks.legacy).not.toHaveBeenCalled();
});
it('OTP sends the home callback and claims only after a valid code',async()=>{
 await click('Log In');await click('Email OTP');await fill('auth-email-input','test@example.com');await submit();
 expect(mocks.otp).toHaveBeenCalledWith('test@example.com','/home?onboarding=complete');expect(calls).not.toContain('POST /api/onboarding/claim');
 await act(async()=>{tree.root.findAll(n=>typeof n.type==='string'&&!!n.props.onPaste)[0].props.onPaste({preventDefault(){},clipboardData:{getData:()=> '123456'}});});
 expect(mocks.verify).toHaveBeenCalledWith('test@example.com','123456');expect(calls).toContain('POST /api/onboarding/claim');expect(mocks.assign).toHaveBeenCalledWith('/home');
});
it('failed saves stay visible and retry persistence without recreating the account',async()=>{
 mocks.claimFails=true;await click('Log In');await fill('auth-email-input','test@example.com');await fill('auth-password-input','local-test-password');await submit();
 expect(mocks.assign).not.toHaveBeenCalled();expect(JSON.stringify(tree.toJSON())).toContain('Database save failed');
 mocks.claimFails=false;await click('Retry saving my Early Read');expect(mocks.login).toHaveBeenCalledTimes(1);expect(mocks.assign).toHaveBeenCalledWith('/home');
});
