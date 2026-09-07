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
  it('uses the requested FAQ heading and fills supplied phone screens without solid padding',()=>{
    expect(source).toContain('<h2>Frequently Asked Questions</h2>');
    expect(source).not.toContain('A few good questions.');
    const css=readFileSync(resolve(__dirname,'../../app/landing.module.css'),'utf8');
    expect(css).toContain('.suppliedPreview .screen>img{object-fit:cover');
    expect(css).toContain('background:transparent');
  });
  it('uses current captures and pairs social and connection descriptions correctly',()=>{
    expect(source).not.toContain('/images/landing/actual-');
    for(const key of ['profile','matching','connection','threads','pitches','invited','guests','past'])expect(existsSync(resolve(__dirname,'../../public/images/landing/current-'+key+'.jpg'))).toBe(true);
    expect(source).toContain('screen="connection"');
    expect(source).toContain('screen="social-pages"');
  });
  it('maps the supplied captures in order and keeps the connection and pitches previews',()=>{
    expect(source).toContain('<Phone screen="going" className={styles.behind}/><Phone screen="radar" className={styles.front}/>');
    expect(source).toContain('<Phone screen="connection"/><Phone screen="threads"/>');
    expect(source).toContain('<Phone screen="pitches"/><p className={styles.caption}>Your Pitches');
    for(const key of ['going','radar','social-pages','matching','how-matching','how-pitch','how-guests','memory-phone']){
      expect(existsSync(resolve(__dirname,'../../public/images/landing/supplied-'+key+'.jpg'))).toBe(true);
    }
  });
  it('explains three steps and shows only one already-framed invitation image',()=>{
    const how=source.split('<section id="how"')[1].split('<section className={styles.outingGallery}')[0];
    expect(how.match(/<Phone /g)).toHaveLength(3);
    expect(how).toContain('Precise matching');
    expect(how).toContain('Pitch an outing');
    expect(how).toContain('Choose your matches');
    const gallery=source.split('<section className={styles.outingGallery}')[1].split('<section id="faq"')[0];
    expect(gallery.match(/<img /g)).toHaveLength(1);
    expect(gallery).not.toContain('<Phone');
    expect(gallery).toContain('supplied-memory-phone.jpg');
  });
});
