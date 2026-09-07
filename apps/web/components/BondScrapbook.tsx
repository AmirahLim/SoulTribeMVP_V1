'use client';
import React from 'react';
import Link from 'next/link';
import {Caveat} from 'next/font/google';
import {Users, MessageCircle, Compass, Feather, Sun, Coffee, CalendarDays, Home, MapPin, Sparkles, HelpingHand, Sprout} from 'lucide-react';
import s from './BondScrapbook.module.css';
const handwriting=Caveat({subsets:['latin'],weight:['400','600']});
export type BondThread={key:string;status:'known'|'unknown';headline?:string;phrase?:string;mechanism?:string};
export type BondNotes={candidate:{id:string;displayName:string;bio?:string;homeArea?:string};clickText:string;rubText:string;threads:BondThread[];sharpen:{questionId:string;prompt:string;href:string}[];overall:{provisional:boolean}};
const categories:Record<string,{label:string;icon:typeof Users}>={
  personality:{label:'Social Energy',icon:Users},communication:{label:'How You Connect',icon:MessageCircle},intent:{label:'Friendship Style',icon:Compass},emotional:{label:'Emotional Openness',icon:Feather},values:{label:'What Matters',icon:Sun},interests:{label:'Shared Interests',icon:Coffee},social_rhythm:{label:'Social Rhythm',icon:CalendarDays},lifestyle:{label:'Everyday Life',icon:Home},experience:{label:'Outing Preferences',icon:Sparkles},geography:{label:'Where You’d Meet',icon:MapPin},initiative:{label:'Social Initiative',icon:HelpingHand},repair:{label:'Conflict & Repair',icon:Sprout},
};
export function bondTone(t:BondThread){
  if(t.status!=='known')return {style:s.unknown,label:'Still taking shape'};
  if(t.mechanism==='alignment')return {style:s.aligned,label:'Common ground'};
  if(t.mechanism==='complementarity')return {style:s.complementary,label:'Different, together'};
  if(t.mechanism==='friction')return {style:s.friction,label:'Needs a little care'};
  return {style:s.context,label:'Worth exploring'};
}
export function bondExcerpt(text:string){return text.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || (text.length>160?text.slice(0,157)+'…':text);}
export function BondScrapbook({notes}:{notes:BondNotes}){
  const click=notes.clickText||'There is not enough shared information for a detailed read yet.';
  const rub=notes.rubText||'No specific friction is supported by the answers shared so far.';
  const extra:BondThread[]=['initiative','repair'].filter(key=>!notes.threads.some(t=>t.key===key)).map(key=>({key,status:'unknown'}));
  const all=[...notes.threads,...extra];
  return <div className={s.album}>
    <nav className={s.tabs} aria-label="Member views"><Link href={`/people/${notes.candidate.id}`}>Their profile</Link><span aria-current="page">View Bond</span></nav>
    <section className={s.overview} aria-labelledby="bond-title">
      <div className={s.pair}><span className={s.nameCard}>You</span><span className={`${s.amp} ${handwriting.className}`}>&</span><span className={s.nameCard}>{notes.candidate.displayName}</span></div>
      <p className={s.eyebrow}>Soul Tribe · your connection notes</p>
      <h1 id="bond-title">A little map of <em>you two.</em></h1>
      <p className={s.lead}>{bondExcerpt(click)}</p>
      <p className={s.caveat}><strong>Worth understanding:</strong> {bondExcerpt(rub)}</p>
      <div className={s.threadMap} aria-label="Your bond at a glance">
        {notes.threads.map(t=>{const tone=bondTone(t);return <a key={t.key} href={`#bond-${t.key}`} onClick={()=>{const note=document.getElementById(`bond-${t.key}`);if(note instanceof HTMLDetailsElement)note.open=true;}} className={tone.style}><span aria-hidden="true" className={s.dot}/><span>{categories[t.key]?.label||t.key}<small>{tone.label}</small></span></a>})}
      </div>
      <p className={s.caveat}>{notes.overall.provisional?'An early read, not the whole story. This can change as you share more.':'Based on what you’ve both shared so far—not a promise of how friendship will unfold.'}</p>
      <details className={s.letter}><summary className={handwriting.className}>Why you might click <span>Read your letter ↗</span></summary><p>{click}</p></details>
    </section>
    <div className={s.sectionTitle}><h2>Thread by thread</h2><p className={handwriting.className}>tap a note, discover a little more</p></div>
    <div className={s.grid}>{all.map((t,i)=>{const tone=bondTone(t);const Icon=categories[t.key]?.icon||Compass;const unmeasured=extra.includes(t);return <details id={`bond-${t.key}`} key={t.key} className={`${s.note} ${tone.style} ${i%3===1?s.lined:''}`}>
      <summary><div className={s.noteTop}><Icon size={30} strokeWidth={1.25} aria-hidden="true"/><span>{String(i+1).padStart(2,'0')}</span></div><h3>{categories[t.key]?.label||t.key}</h3><span className={s.stamp}>{unmeasured?'Not yet measured':tone.label}</span><p className={s.teaser}>{t.status==='known'?(t.headline||'A thread worth getting to know.'):'A page still waiting to be written.'}</p><span className={`${s.read} ${handwriting.className}`}>Open this note <span aria-hidden="true">↗</span></span></summary>
      <div className={s.full}><p>{t.status==='known'?(t.phrase||'No further explanation is available yet.'):unmeasured?'This part is not yet available in your live bond reading. We won’t guess how either of you takes initiative or handles repair.':'Not enough shared, visible information to describe this thread.'}</p></div>
    </details>})}</div>
    <section className={s.care}>
      <div className={s.print}><img src="/images/early-read/seaside.jpg" alt="" loading="lazy"/><span className={handwriting.className}>room for understanding</span></div>
      <details className={s.careNote}><summary><p className={s.eyebrow}>Potential friction</p><h2>What may need<br/><em>a little care.</em></h2><p>{bondExcerpt(rub)}</p><span className={`${s.read} ${handwriting.className}`}>Read more ↗</span></summary><div className={s.full}><p>{rub}</p></div></details>
    </section>
    {!!notes.sharpen.length&&<section className={s.more}><h2>There’s more to the two of you.</h2><p>Keep adding to the picture, at your own pace.</p>{notes.sharpen.map(q=>q.href?<Link key={q.questionId} href={q.href}>{q.prompt} →</Link>:<p key={q.questionId}>{q.prompt}</p>)}</section>}
  </div>;
}
