'use client';
import {useRef,useState} from 'react';
import {Caveat} from 'next/font/google';
import {buildEarlyRead,type ReadDraft} from '../../lib/earlyRead';
import styles from './EarlyReadAlbum.module.css';
import {earlyReadSummary} from '../../lib/earlyReadSummary';
const photos=['seaside','sunset','shore','evening'];
const pen=Caveat({subsets:['latin'],weight:['400','600'],variable:'--pen'});
const objects=['photo','envelope','diary','letter','envelope','photo'];
export function EarlyReadAlbum({draft}:{draft:ReadDraft}) {
 const cards=buildEarlyRead(draft),dialog=useRef<HTMLDialogElement>(null);
 const [selected,setSelected]=useState<string|null>(null);
 const index=cards.findIndex(c=>c.id===selected),card=cards[index],kind=objects[Math.max(0,index)%objects.length];
 function open(id:string){setSelected(id);dialog.current?.showModal();}
 return <section className={styles.album+' '+pen.variable} aria-label="Your Early Read">
 <header className={styles.intro}><p className={styles.eyebrow}>N° 01 / YOUR FRIENDSHIP SCRAPBOOK</p><h1>More of you.</h1><p className={styles.overview}>{earlyReadSummary(draft)}</p><p className={styles.handwritten}>Little notes. New beginnings.</p></header>
 <div className={styles.prints}>{cards.map((c,i)=>{const shape=objects[i%objects.length];return <button type="button" key={c.id} className={styles.print+' '+styles[shape]} onClick={()=>open(c.id)} aria-label={'Open your reading: '+c.title}>
 {shape==='photo'?<><span className={styles.tape} aria-hidden="true"/><img src={'/images/early-read/'+photos[i%photos.length]+'.jpg'} alt="" loading="lazy"/></>:shape==='envelope'?<span className={styles.seal} aria-hidden="true">✳</span>:<span className={styles.inscription} aria-hidden="true">{shape==='diary'?'little things, big feelings.':'a letter for you.'}</span>}
 <span className={styles.caption}><small>{shape==='photo'?'A MOMENT':shape==='diary'?'FIELD NOTES':'POST FOR YOU'} · {String(i+1).padStart(2,'0')}</small><span>{c.title}</span><span aria-hidden="true">↗</span></span></button>;})}</div>
 {!cards.length&&<p>There are not enough answers for a reading yet.</p>}
 <dialog ref={dialog} className={styles.dialog+' '+styles[kind+'Open']} aria-labelledby="read-note-title">
 <button className={styles.close} type="button" onClick={()=>dialog.current?.close()} aria-label="Close reading">×</button>
 {card&&<div className={styles.openObject} key={card.id}>
 {kind==='photo'&&<div className={styles.photoFront} aria-hidden="true"><img src={'/images/early-read/'+photos[index%photos.length]+'.jpg'} alt=""/></div>}
 {kind==='diary'&&<aside className={styles.leftPage} aria-hidden="true"><span>Collected moments</span><img src="/images/early-read/shore.jpg" alt=""/><i>Room for your people.</i></aside>}
 <article className={styles.notePaper}><p className={styles.noteLabel}>{kind==='photo'?'ON THE BACK OF A MOMENT':kind==='diary'?'FROM YOUR FRIENDSHIP JOURNAL':'A LETTER FOR YOU'}</p><h2 id="read-note-title">{card.title}</h2>
 {card.feedback?.status==='not_quite'?<><p>In your own words</p>{card.feedback.text?<blockquote>{card.feedback.text}</blockquote>:<p>You’ve set this note aside.</p>}</>:<p className={styles.reading}>{card.reading}</p>}
 <p className={styles.signature}>Here’s to your people.<br/><span>Soul Tribe</span></p>
 <details className={styles.evidence}><summary>Behind this note</summary><p>You selected: {card.evidence.join(' · ')}</p></details></article>
 {kind==='envelope'&&<div className={styles.envelopePocket} aria-hidden="true"><span>for you, with love</span></div>}
 </div>}
 </dialog></section>;
}
