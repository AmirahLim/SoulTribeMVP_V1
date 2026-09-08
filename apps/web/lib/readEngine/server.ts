import {createHash} from 'node:crypto';
import type {SupabaseClient} from '@supabase/supabase-js';
import {buildEvidence, pairEvidence, type EvidenceBundle} from './evidence';
import {composeRead,writeRead,type ComposedRead,type Writer} from './compose';
import catalog from '../onboardingQuestionCatalog.json';
import {deepChoices} from '../savedAnswerRead';

export function stable(value:unknown):string{
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+stable(v)).join(',')+'}';
  return JSON.stringify(value)??'null';
}
export const evidenceHash=(bundle:EvidenceBundle)=>createHash('sha256').update(stable(bundle)).digest('hex');
function fail(operation:string,error:{code?:string;message:string}):never{
  console.error('[SoulTribe] read engine '+operation,{code:error.code,message:error.message});throw new Error(error.message);
}
export async function loadOwnEvidence(client:SupabaseClient,owner:string,saved:unknown){
  const bundle=buildEvidence(saved,'profile');
  const {data,error}=await client.from('read_answer_sources').select('question_id,question_version,selections').eq('user_id',owner);
  if(error)fail('own source versions',error);
  for(const source of bundle.sources){
    const row=data?.find(r=>r.question_id===source.questionId&&JSON.stringify([...r.selections].sort())===JSON.stringify(source.selections));
    if(row?.question_version===1){source.questionVersion=1;source.provenance='recorded';}
  }
  return bundle;
}
/** RLS caller, not the service client. This query is the public-detail boundary. */
export async function loadPairEvidence(client:SupabaseClient,viewer:string,subject:string){
  const {data,error}=await client.from('read_answer_sources').select('user_id,question_id,question_version,dimension,thread,selections,access').in('user_id',[viewer,subject]);
  if(error)fail('evidence query',error);
  const rows=data??[];
  const unpack=(id:string)=>{
    const baseline:Record<string,unknown>={},deep:Record<string,unknown>={};
    for(const row of rows.filter(r=>r.user_id===id)){
      const q=catalog.find(q=>q.questionId===row.question_id&&q.fields[0]===row.dimension);
      if(q)baseline[row.dimension]=row.selections;
      else if(deepChoices.some(([key])=>key===row.dimension))deep[row.dimension]=row.selections;
    }
    return {onboarding:{baselineV2:baseline},deep_profile:deep};
  };
  const shared=await client.rpc('has_verified_outing_with',{b:subject});
  if(shared.error)fail('shared attendance query',shared.error);
  const bundle=pairEvidence(unpack(viewer),unpack(subject),shared.data===true);
  for(const source of bundle.sources){
    const row=rows.find(r=>r.user_id===(source.subject==='self'?viewer:subject)&&r.question_id===source.questionId);
    if(row?.question_version===1){source.questionVersion=1;source.provenance='recorded';}
  }
  return bundle;
}
/** Fresh authorisation/evidence must precede every call, including cache hits. */
export async function cachedRead(client:SupabaseClient,viewer:string,subject:string,bundle:EvidenceBundle,writer?:Writer,writerVersion='deterministic/8a.1'){
  // Remember wording across views without ever feeding another read to a writer.
  // Early wording is derived from the same visible baseline evidence, not a new fact.
  const early=composeRead({...bundle,level:'early',sources:bundle.sources.filter(s=>s.subject==='self'&&!s.path.startsWith('deep_profile.'))});
  const {data:history,error:historyError}=await client.from('read_phrase_history').select('phrase').eq('viewer_id',viewer).in('subject_id',[viewer,subject]).neq('level',bundle.level);
  if(historyError)fail('phrase history',historyError);
  const priorPhrases=[...early.sections.map(s=>s.text),...(history??[]).map(r=>r.phrase)];
  const phraseVersion=createHash('sha256').update(stable([...new Set(priorPhrases)].sort())).digest('hex');
  writerVersion=writerVersion+':'+phraseVersion.slice(0,12);
  const hash=evidenceHash(bundle),started=performance.now();
  const {data,error}=await client.rpc('claim_composed_read',{p_viewer:viewer,p_subject:subject,p_level:bundle.level,p_hash:hash,
    p_engine:bundle.engineVersion,p_writer:writerVersion,p_disclosure:bundle.disclosureVersion});
  if(error)fail('cache claim',error);
  if(data?.state==='hit')return {read:data.document as ComposedRead,hash,writerVersion,cache:'hit',durationMs:performance.now()-started};
  // Another request owns the lease. No duplicate external generation or long wait.
  if(data?.state==='busy')return {read:composeRead(bundle,priorPhrases),hash,writerVersion,cache:'busy-fallback',durationMs:performance.now()-started};
  if(data?.state!=='claimed'||typeof data.lease!=='string')throw new Error('Unable to claim reading');
  const read=await writeRead(bundle,writer,priorPhrases);
  const finished=await client.rpc('finish_composed_read',{p_viewer:viewer,p_subject:subject,p_level:bundle.level,p_hash:hash,p_lease:data.lease,p_document:read});
  if(finished.error)fail('cache publish',finished.error);
  if(finished.data!==true)throw new Error('Reading changed while it was being prepared. Please retry.');
  return {read,hash,writerVersion,cache:'generated',durationMs:performance.now()-started};
}
