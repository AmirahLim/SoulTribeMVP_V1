import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const query: any = {};
  for (const method of ['select','eq','order','limit','single','maybeSingle']) query[method] = vi.fn(() => query);
  query.then = (resolve: (value: unknown) => unknown) => Promise.resolve({data:null,error:null}).then(resolve);
  return { query, channel: vi.fn(() => { throw new Error('Realtime unavailable'); }) };
});
vi.mock('../supabase', () => ({checkIsSupabaseConfigured:()=>true,getSupabaseBrowserClient:()=>({from:()=>mocks.query,channel:mocks.channel})}));
vi.mock('../authContext', () => ({useAuth:()=>({user:{id:'11111111-1111-4111-8111-111111111111'}})}));
vi.mock('next/navigation', () => ({usePathname:()=>'/outings',useRouter:()=>({}),useParams:()=>({id:'22222222-2222-4222-8222-222222222222'}),useSearchParams:()=>({get:()=>null})}));
vi.mock('next/link', () => ({default:({children,...props}:any)=>React.createElement('a',props,children)}));
vi.mock('../../components/AuthGuard', () => ({AuthGuard:({children}:any)=>children}));
vi.mock('../outingsStore', () => ({fetchInvitedOutings:async()=>[],getOutingCategoryImage:()=>''}));
vi.mock('../userStore', () => ({getUserProfile:()=>({}),getUserPitches:()=>[],removeUserPitchLocal:vi.fn(),addJoinedOutingLocal:vi.fn(),removeJoinedOutingLocal:vi.fn()}));
import { Nav } from '../../components/Nav';
import { OutingContext } from '../../components/outings/OutingContext';
import OutingDetailPage from '../../app/outings/[id]/page';

afterEach(()=>{vi.unstubAllGlobals(); vi.clearAllMocks();});
it('loads all three real surfaces even when channel creation throws', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
  vi.stubGlobal('window',{addEventListener:vi.fn(),removeEventListener:vi.fn()});
  for (const [component, expected] of [
    [React.createElement(Nav), 'Outings'],
    [React.createElement(OutingContext,{outingId:'22222222-2222-4222-8222-222222222222',userId:'11111111-1111-4111-8111-111111111111',isHost:false}), 'No messages yet.'],
    [React.createElement(OutingDetailPage), 'Outing Not Found'],
  ] as const) {
    let rendered!: ReactTestRenderer;
    await act(async()=>{rendered=create(component);});
    expect(JSON.stringify(rendered.toJSON())).toContain(expected);
    await act(async()=>rendered.unmount());
  }
  expect(mocks.channel).toHaveBeenCalled();
});
