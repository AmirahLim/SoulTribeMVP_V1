import {it,expect,vi,afterEach} from 'vitest';
import {getUserProfile,setUserProfile,setProfileCacheAccount} from '../userStore';
afterEach(()=>{setProfileCacheAccount(null);vi.unstubAllGlobals();});
it('isolates accounts and ignores legacy sample profiles',()=>{
  const values=new Map<string,string>([['soul_tribe_user_profile',JSON.stringify({displayName:'Legacy',deepProfile:{mbti:'INFJ'}})]]);
  vi.stubGlobal('window',{});
  vi.stubGlobal('localStorage',{getItem:(k:string)=>values.get(k)||null,setItem:(k:string,v:string)=>values.set(k,v)});
  setProfileCacheAccount('alice');
  expect(getUserProfile().deepProfile).toEqual({});
  setUserProfile({displayName:'Alice',homeArea:'Bishan',deepProfile:{supportStyle:'Listen first'}});
  setProfileCacheAccount('bob');
  expect(getUserProfile().displayName).toBe('');
  expect(getUserProfile().deepProfile).toEqual({});
  setProfileCacheAccount('alice');
  expect(getUserProfile().displayName).toBe('Alice');
  expect(getUserProfile().homeArea).toBe('Bishan');
  setUserProfile({deepProfile:{}});
  expect(getUserProfile().deepProfile).toEqual({});
});
