'use client';
import Link from 'next/link';

const fields=[['intent','Looking for','intentOther'],['clicks','Connection moments','clicksOther'],['groupChoices','Social settings',''],['desiredQualities','Qualities wanted in friends','qualityOther'],['connectionChoice','Keeping in touch','connectionOther'],['planningChoice','Planning','planningOther'],['punctualityChoice','Timing','punctualityOther'],['outings','Outings','outingOther']];
export function PublicAnswers({answers}:{answers?:Record<string,unknown>}) {
 if(!answers||!Object.keys(answers).length)return null;
 return <section className="rounded-3xl bg-[#f2f0e7] p-5 text-[#203B30]"><h2>Shared friendship preferences</h2><p>In their own words, not an assessment of their traits.</p><dl>{fields.map(([key,label,other])=>{
  const raw=answers[key]??(key==='groupChoices'?answers.group:undefined);
  const values=(Array.isArray(raw)?raw:[raw]).filter((v):v is string=>typeof v==='string'&&v.length>0).map(v=>v==='Other'&&typeof answers[other]==='string'?String(answers[other]):v);
  return values.length?<div className="mt-3" key={key}><dt className="font-semibold">{label}</dt><dd className="whitespace-pre-wrap">{values.join(' · ')}</dd></div>:null;
 })}</dl></section>;
}

export function PublicAnswerSharing({userId}:{userId?:string}) {
 if(!userId)return null;
 return <section className="rounded-3xl bg-[#f2f0e7] p-5 text-[#203B30]"><h2>Your answers and your reading</h2>
 <p>Fixed-choice friendship answers are shared with signed-in members and inform readings and matching. Individual Emotional Openness and Conflict &amp; Repair detail is shared only after verified shared attendance. Free text stays out of the read engine.</p>
 <p className="mt-2">You can change or remove an answer. A removed answer must not keep speaking for you.</p>
 <Link className="underline block mt-3" href="/onboarding">Review baseline answers →</Link><Link className="underline block mt-3" href="/you/deeper">Review deeper answers →</Link></section>;
}
