'use client';
import {useRef,useState} from 'react';
import {buildEarlyRead,type ReadDraft,type ReadFeedback} from '../../lib/earlyRead';
import styles from './EarlyReadAlbum.module.css';

const photos=['seaside','sunset','shore','evening'];
export function EarlyReadAlbum({draft,onFeedback}:{draft:ReadDraft;onFeedback:(id:string,feedback:ReadFeedback)=>Promise<void>}) {
 const cards=buildEarlyRead(draft);
 const dialog=useRef<HTMLDialogElement>(null);
 const [selected,setSelected]=useState<string|null>(null),[editing,setEditing]=useState(false),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const card=cards.find(c=>c.id===selected);
 function open(id:string){setSelected(id);setEditing(false);setText('');setError('');dialog.current?.showModal();}
 async function save(status:ReadFeedback['status']) {
  if(!card)return;setBusy(true);setError('');
  try{await onFeedback(card.id,{status,basis:card.basis,text:status==='fits'?'':text.trim()});setEditing(false);}catch{setError('Your correction could not be saved. Please retry.');}finally{setBusy(false);}
 }
 return <section className={styles.album} aria-label="Your Early Read">
  <header className={styles.intro}><span className={styles.flower} aria-hidden="true">✳</span><p className={styles.eyebrow}>YOUR EARLY READ</p><h1>A little more you.</h1><p>A few notes from what you shared.<br/>Open one. See what feels familiar.</p></header>
  <div className={styles.prints}>{cards.map((c,i)=><button type="button" key={c.id} className={styles.print} onClick={()=>open(c.id)} aria-label={`Open your reading: ${c.title}`}><span className={styles.tape} aria-hidden="true"/><img src={`/images/early-read/${photos[i%photos.length]}.jpg`} alt="" loading="lazy"/><span className={styles.caption}><small>NOTE {String(i+1).padStart(2,'0')}</small><span>{c.title}</span><span aria-hidden="true">↗</span></span></button>)}</div>
  {!cards.length&&<p>There are not enough answers for a reading yet.</p>}
  <p className={styles.footnote}>A first impression, not a label. You get the final say.</p>
  <details className={styles.limits}><summary>There’s more to you than six answers</summary><p>How you open up, who initiates and how you handle disagreement still need more evidence. Your Tribal Pass can add that detail. We haven’t assigned a personality type or fixed compatibility label.</p></details>
  <dialog ref={dialog} className={styles.dialog} onCancel={e=>{if(busy)e.preventDefault();}} aria-labelledby="read-note-title">
   <button className={styles.close} type="button" disabled={busy} onClick={()=>dialog.current?.close()} aria-label="Close reading">×</button>
   {card&&<article><p className={styles.noteLabel}>A NOTE FOR YOU</p><h2 id="read-note-title">{card.title}</h2>
    {card.feedback?.status==='not_quite'?<><p>You marked this as not quite right. Your words take priority.</p>{card.feedback.text&&<blockquote>{card.feedback.text}</blockquote>}</>:<p className={styles.reading}>{card.reading}</p>}
    <details className={styles.evidence}><summary>Behind this note</summary><p>You selected: {card.evidence.join(' · ')}</p><p>{card.question}</p></details>
    {card.feedback?.status==='fits'&&<p role="status">You said this fits.</p>}
    <div className={styles.actions}><button type="button" disabled={busy} onClick={()=>save('fits')}>That fits</button><button type="button" disabled={busy} onClick={()=>{setEditing(true);setText(card.feedback?.text??'');}}>Not quite</button></div>
    {editing&&<div className={styles.correction}><label htmlFor="read-correction">How would you put it?</label><textarea id="read-correction" maxLength={240} value={text} onChange={e=>setText(e.target.value)}/><small>Optional. Your correction stays private and changes this reading—not your matching answers.</small><button type="button" disabled={busy} onClick={()=>save('not_quite')}>Save my correction</button></div>}
    {busy&&<p role="status">Saving…</p>}{error&&<p role="alert">{error}</p>}
   </article>}
  </dialog>
 </section>;
}
