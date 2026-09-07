'use client';
import React from 'react';
import Link from 'next/link';
import {Caveat} from 'next/font/google';
import s from './BondScrapbook.module.css';
const handwriting=Caveat({subsets:['latin'],weight:['400','600']});
export type BondThread={key:string;status:'known'|'unknown';headline?:string;phrase?:string;mechanism?:string};
export type BondNotes={candidate:{id:string;displayName:string;bio?:string;homeArea?:string};clickText:string;rubText:string;threads:BondThread[];sharpen:{questionId:string;prompt:string;href:string}[];overall:{provisional:boolean}};
export const bondObjects:Record<string,{label:string;object:string;action:string;inside:string;tile:number}>={
personality:{label:'Social Energy',object:'linen',action:'Pull up a chair',inside:'Around the same table',tile:0},
communication:{label:'How You Connect',object:'cassette',action:'Turn over the cassette',inside:'Side B · between the messages',tile:1},
intent:{label:'Friendship Style',object:'velvet',action:'Unfasten the bracelet',inside:'The ties you are looking for',tile:2},
emotional:{label:'Emotional Openness',object:'glassine',action:'Lift the translucent flap',inside:'What becomes visible with time',tile:3},
values:{label:'What Matters',object:'compass',action:'Open the compass case',inside:'The bearings beneath the bond',tile:4},
interests:{label:'Shared Interests',object:'record',action:'Slide out the record sleeve',inside:'Liner notes · your shared soundtrack',tile:5},
social_rhythm:{label:'Social Rhythm',object:'calendar',action:'Turn the calendar page',inside:'Making room for each other',tile:6},
lifestyle:{label:'Everyday Life',object:'journal',action:'Open the everyday journal',inside:'Between the plans',tile:7},
experience:{label:'Outing Preferences',object:'ticket',action:'Unfold your ticket',inside:'Admit two · an outing that fits',tile:8},
geography:{label:'Where You’d Meet',object:'map',action:'Unfold the meeting map',inside:'Finding the middle ground',tile:9},
initiative:{label:'Social Initiative',object:'key',action:'Turn over the key tag',inside:'Who opens the door?',tile:10},
repair:{label:'Conflict & Repair',object:'stitch',action:'Look beneath the stitching',inside:'How a connection is mended',tile:11},
};
export function bondTone(t:BondThread){
if(t.status!=='known')return {style:s.unknown,label:'Still taking shape'};
if(t.mechanism==='alignment')return {style:s.aligned,label:'Common ground'};
if(t.mechanism==='complementarity')return {style:s.complementary,label:'Different, together'};
if(t.mechanism==='friction')return {style:s.friction,label:'Needs a little care'};
return {style:s.context,label:'Worth exploring'};
}
export function bondExcerpt(text:string){return text.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || (text.length>160?text.slice(0,157)+'…':text);}
// This synthesis uses only explanation-safe threads, never private answers or match-card copy.
export function bondSynthesis(threads:BondThread[]){
const groups=[
{title:'The space between you',keys:['personality','intent','emotional'],aligned:'Similar social energy, friendship expectations and opening pace can reinforce one another: there may be less need to negotiate how close to be, or how quickly. That is room for trust to grow—not evidence that trust is already there.',partial:'The available threads offer some common ground in how you relate. The unanswered or differing parts still matter: feeling comfortable together does not, by itself, establish the same expectations of closeness.',friction:'Ease in one part of the connection may coexist with different needs in another. Read social energy, desired closeness and opening pace together; a comfortable conversation need not mean you want the same amount of intimacy.'},
{title:'Turning intention into time',keys:['communication','social_rhythm','lifestyle','geography'],aligned:'Contact, planning, daily life and location point in a compatible direction. Together, these can reduce the practical effort of staying in touch; someone still needs to turn that ease into a specific invitation.',partial:'Some of the contact and logistics threads offer practical common ground. Keep this separate from emotional closeness: an easy plan is an opening for friendship, not a measure of its depth. Check the other threads before assuming the whole routine fits.',friction:'The practical threads do not all move together. A connection can feel promising yet require coordination around contact, timing or place. Try agreeing on one concrete plan before interpreting difficulty meeting as lack of interest.'},
{title:'What gives it somewhere to go',keys:['values','interests','experience'],aligned:'Shared interests, outing preferences and stated values offer more than one way into the connection. An activity can start the conversation; time together is what reveals whether that common ground feels meaningful.',partial:'Some of the discovery threads offer a starting point, but overlap in one part does not establish the rest. Enjoying something together and valuing the same things are different kinds of connection.',friction:'The discovery threads include differences. A shared activity may still offer an entry point, but avoid treating overlap in one interest as agreement about the wider things that matter.'},
];
return groups.map(g=>{
const evidence=g.keys.map(key=>threads.find(t=>t.key===key)).filter((t):t is BondThread=>!!t&&t.status==='known'&&!!t.phrase);
const unknown=g.keys.filter(key=>!evidence.some(t=>t.key===key));
const friction=evidence.some(t=>t.mechanism==='friction');
const aligned=evidence.length===g.keys.length&&evidence.every(t=>t.mechanism==='alignment');
const text=!evidence.length?'There is not enough shared, visible information to connect these threads yet. An unanswered part is an unknown, not a mismatch.':friction?g.friction:aligned?g.aligned:evidence.some(t=>t.mechanism==='alignment')?g.partial:'These threads describe different or still-contextual preferences. Read them alongside one another before deciding what they mean in practice; difference alone is not a problem to solve.';
const anchors=evidence.filter(t=>t.mechanism==='friction');
const selected=(anchors.length?anchors:evidence).slice(0,2);
const observation=selected.map(t=>(t.phrase||'').split(/[;—]/)[0].trim().replace(/[.!?]$/,'')).join('. ');
return {title:g.title,text,evidence,unknown,observation};
});
}
function ObjectArt({tile}:{tile:number}){return <div aria-hidden="true" className={s.objectArt} style={{backgroundPosition:`${(tile%3)*50}% ${Math.floor(tile/3)*100/3}%`}}/>;}
export function BondScrapbook({notes}:{notes:BondNotes}){
const rub=notes.rubText||'No specific friction is supported by the answers shared so far.';
const extra:BondThread[]=['initiative','repair'].filter(key=>!notes.threads.some(t=>t.key===key)).map(key=>({key,status:'unknown'}));
return <div className={s.album}>
<nav className={s.tabs} aria-label="Member views"><Link href={`/people/${notes.candidate.id}`}>Their profile</Link><span aria-current="page">View Bond</span></nav>
<section className={s.overview} aria-labelledby="bond-title">
<p className={s.eyebrow}>You & {notes.candidate.displayName} · connection notes</p>
<h1 id="bond-title">How the threads<br/><em>come together.</em></h1>
<div className={s.synthesis}>{bondSynthesis(notes.threads).map((part,i)=><article key={part.title}>
<span className={`${s.chapter} ${handwriting.className}`}>0{i+1}</span><div><h2>{part.title}</h2>{part.observation&&<p className={s.observation}>{part.observation}.</p>}<p>{part.text}</p>
<details className={s.evidence}><summary>What this reading draws on <span aria-hidden="true">+</span></summary>
{part.evidence.map(t=><p key={t.key}><strong>{bondObjects[t.key]?.label||t.key}:</strong> {t.phrase}</p>)}
{!!part.unknown.length&&<p>Still unknown: {part.unknown.map(key=>bondObjects[key]?.label||key).join(', ')}. These are not counted as agreement.</p>}
</details></div></article>)}</div>
<p className={s.caveat}>{notes.overall.provisional?'An early read, not the whole story.':'An interpretation of the answers shared so far.'} These threads suggest possibilities, not a prediction of friendship.</p>
</section>
<div className={s.sectionTitle}><h2>Thread by thread</h2><p className={handwriting.className}>a collection of little discoveries</p></div>
<div className={s.collection}>{[...notes.threads,...extra].map((t,i)=>{
const o=bondObjects[t.key]||{label:t.key,object:'journal',tile:7,action:'Open the journal',inside:'A closer reading'};
const tone=bondTone(t);const unmeasured=extra.includes(t);
return <details id={`bond-${t.key}`} key={t.key} className={`${s.keepsake} ${s[o.object]} ${tone.style}`} data-object={o.object}>
<summary><ObjectArt tile={o.tile}/><div className={s.caption}><span className={s.index}>{String(i+1).padStart(2,'0')} /</span><h3>{o.label}</h3><p className={s.status}>{unmeasured?'Not yet measured':tone.label}</p><span className={`${s.action} ${handwriting.className}`}><span className={s.closedAction}>{o.action} ↗</span><span className={s.openAction}>Close this reading ↙</span></span></div></summary>
<div className={s.reveal}><p className={s.eyebrow}>{o.inside}</p><h4>{t.status==='known'?(t.headline||o.label):'Still taking shape'}</h4><p>{t.status==='known'?(t.phrase||'No further explanation is available yet.'):unmeasured?'This part is not yet available in your live bond reading. We won’t guess how either of you takes initiative or handles repair.':'Not enough shared, visible information to describe this thread. An empty space is not a mismatch.'}</p><span className={`${s.endnote} ${handwriting.className}`}>You & {notes.candidate.displayName}</span></div>
</details>;})}</div>
<section className={s.care}><details className={s.careNote}><summary><p className={s.eyebrow}>Potential friction</p><h2>The places to<br/><em>handle with care.</em></h2><p>{bondExcerpt(rub)}</p><span className={`${s.action} ${handwriting.className}`}>Look a little closer ↗</span></summary><p className={s.full}>{rub}</p></details></section>
{!!notes.sharpen.length&&<section className={s.more}><h2>There’s more to the two of you.</h2><p>Keep adding to the picture, at your own pace.</p>{notes.sharpen.map(q=>q.href?<Link key={q.questionId} href={q.href}>{q.prompt} →</Link>:<p key={q.questionId}>{q.prompt}</p>)}</section>}
</div>;
}
