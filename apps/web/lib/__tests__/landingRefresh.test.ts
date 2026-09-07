import {describe,it,expect} from 'vitest';
import {readFileSync,existsSync} from 'fs';
import {resolve} from 'path';
const source=readFileSync(resolve(__dirname,'../../app/LandingPageContent.tsx'),'utf8');
describe('Current intro',()=>{
  it('links top navigation sign up directly to onboarding',()=>{
    expect(source).toContain('<Link href="/onboarding">Sign up</Link>');
    expect(source).toContain('<h1>Quick, real-time pitching.</h1><p>Intentional social matching</p>');
    expect(source).not.toContain('Your kind of people.');
    expect(source).not.toContain('Intentional friendship matching.');
  });
  it('uses current captures and pairs social and connection descriptions correctly',()=>{
    expect(source).not.toContain('/images/landing/actual-');
    for(const key of ['profile','matching','connection','threads','pitches','invited','guests','past'])expect(existsSync(resolve(__dirname,'../../public/images/landing/current-'+key+'.jpg'))).toBe(true);
    expect(source).toContain('screen="connection"');
    expect(source).toContain('screen="profile"');
  });
});
