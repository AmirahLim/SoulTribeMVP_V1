import {describe,it,expect} from 'vitest';
import {readFileSync} from 'fs';
import {resolve} from 'path';
const source=(p:string)=>readFileSync(resolve(__dirname,p),'utf8');
describe('Readable outing roster and account settings',()=>{
 it('keeps member actions while adding scoped light roster styling',()=>{
  const page=source('../../app/outings/[id]/page.tsx');
  expect(page).toContain('analog.rosterMember');expect(page).toContain('className={analog.seats}');
  for(const handler of ['handleRemoveMember(m.user_id)','handleHostAccept(m.user_id)','handleHostDecline(m.user_id)'])expect(page).toContain(handler);
  expect(page).toContain('View Connection');expect(page).not.toContain('View Bond');
  const css=source('../../components/AnalogPages.module.css');
  expect(css).toContain('.page .rosterMember');expect(css).toContain('background:#e0e3cc');expect(css).toContain('color:#fffaf0!important');
 });
 it('provides sign out separately from profile save and identifies the username',()=>{
  const page=source('../../app/you/page.tsx');
  expect(page).toContain('type="button" onClick={handleSignOut}');
  expect(page).toContain("await signOut(); window.location.assign('/')");
  expect(page).toContain('Your unique handle.');
  expect(page).toContain('>Settings</h3>');
  expect(page).toContain('earlyReadHref="/early-read"');
  expect(page).toContain("setEditBio(profile.bio || '')");
  expect(page).toContain('max-h-[85dvh] overflow-y-auto');
 });
 it('links member profiles to a consent-gated public Early Read',()=>{
  const profile=source('../../app/people/[id]/page.tsx');
  const read=source('../../app/people/[id]/early-read/page.tsx');
  expect(profile).toContain('earlyReadHref={`/people/${profile.id}/early-read`}');
  expect(read).toContain(".select('id,display_name,handle,public_onboarding')");
  expect(read).not.toContain("from('profile_answers')");
  expect(read).toContain('<EarlyReadAlbum draft={sharedDraft(answers)} />');
  expect(read).toContain('has not chosen to share their onboarding answers.');
 });
 it('does not clear client authentication when the provider reports a sign-out error',()=>{
  const auth=source('../authContext.tsx').split('const signOut = async')[1].split('return (')[0];
  expect(auth).toContain('if (error) throw error;');
  expect(auth.indexOf('if (error) throw error;')).toBeLessThan(auth.indexOf('setSession(null)'));
  expect(auth).toContain('throw err;');
 });
});
