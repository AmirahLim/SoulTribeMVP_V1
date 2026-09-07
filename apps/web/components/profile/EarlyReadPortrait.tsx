'use client';
import {useState} from 'react';
import {buildEarlyRead,type ReadDraft,type ReadFeedback} from '../../lib/earlyRead';
export function EarlyReadPortrait({draft,onFeedback}:{draft:ReadDraft;onFeedback:(id:string,feedback:ReadFeedback)=>Promise<void>}) {
 const [editing,setEditing]=useState<string|null>(null),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function save(id:string,status:ReadFeedback['status'],basis:string) {
  setBusy(true);setError('');try{await onFeedback(id,{status,basis,text:status==='fits'?'':text.trim()});setEditing(null);setText('');}catch{setError('Your correction could not be saved. Please retry.');}finally{setBusy(false);}
 }
 const cards=buildEarlyRead(draft);
 return <section aria-label="Your Early Read"><p className="ob-eyebrow">YOUR EARLY READ · A FIRST INTERPRETATION</p><h1>A little more you.</h1><p>Not a verdict. These are possible patterns in what you chose. Keep what fits, correct what does not. Your words take priority.</p>
 {cards.map(card=><article key={card.id} className="ob-read-card"><h2>{card.title}</h2>
 {card.feedback?.status==='not_quite'?<><p>You marked this interpretation as not quite right. It is no longer your reading.</p>{card.feedback.text&&<blockquote>{card.feedback.text}</blockquote>}</>:<p>{card.reading}</p>}
 <details><summary>Why we read it this way</summary><p>You selected: {card.evidence.join(' · ')}</p><p>{card.question}</p></details>
 {card.feedback?.status==='fits'&&<p>You said this fits.</p>}
 <div className="ob-read-actions"><button type="button" disabled={busy} onClick={()=>save(card.id,'fits',card.basis)}>That fits</button><button type="button" disabled={busy} onClick={()=>{setEditing(card.id);setText(card.feedback?.text??'');}}>Not quite</button></div>
 {editing===card.id&&<div><label htmlFor={`correction-${card.id}`}>How would you put it? Optional; private to your reading.</label><textarea id={`correction-${card.id}`} maxLength={240} value={text} onChange={e=>setText(e.target.value)}/><button type="button" disabled={busy} onClick={()=>save(card.id,'not_quite',card.basis)}>Save my correction</button></div>}
 </article>)}
 {!cards.length&&<p>There are not enough answers for a reading yet.</p>}
 <h2>What we cannot tell yet</h2><p>How long you take to open up, who usually initiates, and how you handle disagreement need more evidence. We have not assigned you a personality type, diagnosis or fixed compatibility label.</p><p>Corrections change this reading, not your original answers. Edit your answers to change the preferences used for matching. Your private correction text is not published or scored.</p>
 {error&&<p role="alert">{error}</p>}</section>;
}
