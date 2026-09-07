import {it,expect} from 'vitest';
import {showAppNavigation} from '../navigationVisibility';
it('hides app tabs throughout onboarding, Early Read and authentication',()=>{
 for(const path of ['/','/onboarding','/onboarding/legacy','/early-read','/join','/login','/auth/signin','/auth/callback']){
  expect(showAppNavigation(path,true)).toBe(false);expect(showAppNavigation(path,false)).toBe(false);
 }
});
it('shows tabs only for signed-in app routes',()=>{
 for(const path of ['/home','/people','/people/member','/outings/pitch','/you','/you/deeper']){
  expect(showAppNavigation(path,true)).toBe(true);expect(showAppNavigation(path,false)).toBe(false);
 }
 expect(showAppNavigation('/people-fake',true)).toBe(false);
});
