import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { generateMatchExplanation, type ProfileVector } from '@soul-tribe/core';

// Bump whenever explanation composition, vocabulary or disclosed inputs change.
export const EXPLANATION_ENGINE_VERSION = 'match-explanation/2026-09-08.1';
export type ExplanationProfile = { id: string; profile_version: number; explanation_revision: number };
export type ExplanationText = { click_text: string; friction_text: string };
type Input = { row: ExplanationProfile; vector: ProfileVector };
function publicVector(vector: ProfileVector): ProfileVector {
  return { ...vector, values: vector.values?.filter(value => value.visibility === 'public') };
}
function stable(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.entries(value).filter(([,v])=>v!==undefined)
    .sort(([a],[b])=>a.localeCompare(b)).map(([key,v])=>JSON.stringify(key)+':'+stable(v)).join(',') + '}';
  return JSON.stringify(value) ?? 'null';
}
export function explanationInputHash(viewer: ProfileVector, candidate: ProfileVector): string {
  return createHash('sha256').update(stable([publicVector(viewer),publicVector(candidate)])).digest('hex');
}
function failure(operation: string, error: { code?: string; message: string }): never {
  console.error('[SoulTribe] explanation cache '+operation, {code:error.code,message:error.message});
  throw new Error(error.message);
}
/** Called only after authentication and fresh safety/eligibility checks. Never import into client code. */
export async function getMatchExplanations(client: SupabaseClient, viewer: Input, candidates: Input[]) {
  const metrics = { cache_hits:0, generated:0, cache_read_ms:0, explanation_ms:0, cache_write_ms:0 };
  const explanations = new Map<string,ExplanationText>();
  if (!candidates.length) return { explanations, metrics };
  for (const {row} of [viewer,...candidates]) {
    if (!Number.isSafeInteger(row.profile_version) || !Number.isSafeInteger(row.explanation_revision))
      throw new Error('Matching profile version is unavailable. Please retry.');
  }
  const readStart = performance.now();
  const {data, error} = await client.from('match_explanations')
    .select('user_b,click_text,friction_text,version_a,version_b,revision_a,revision_b,generated_by,input_hash')
    .eq('user_a',viewer.row.id).in('user_b',candidates.map(c=>c.row.id));
  metrics.cache_read_ms = performance.now()-readStart;
  if (error) failure('read',error);
  const cache = new Map((data??[]).map(row=>[row.user_b,row]));
  const writes = [];
  const generationStart = performance.now();
  for (const candidate of candidates) {
    const input_hash = explanationInputHash(viewer.vector,candidate.vector);
    const hit = cache.get(candidate.row.id);
    if (hit && hit.version_a===viewer.row.profile_version && hit.version_b===candidate.row.profile_version
      && hit.revision_a===viewer.row.explanation_revision && hit.revision_b===candidate.row.explanation_revision
      && hit.generated_by===EXPLANATION_ENGINE_VERSION && hit.input_hash===input_hash) {
      explanations.set(candidate.row.id,hit);
      metrics.cache_hits++;
    } else {
      const generated = generateMatchExplanation(publicVector(viewer.vector),publicVector(candidate.vector));
      const text = {click_text:generated.click_text,friction_text:generated.friction_text};
      explanations.set(candidate.row.id,text);
      writes.push({...text,user_a:viewer.row.id,user_b:candidate.row.id,
        version_a:viewer.row.profile_version,version_b:candidate.row.profile_version,
        revision_a:viewer.row.explanation_revision,revision_b:candidate.row.explanation_revision,
        generated_by:EXPLANATION_ENGINE_VERSION,input_hash,created_at:new Date().toISOString()});
      metrics.generated++;
    }
  }
  metrics.explanation_ms=performance.now()-generationStart;
  if (writes.length) {
    const writeStart=performance.now();
    const {error:writeError}=await client.from('match_explanations').upsert(writes,{onConflict:'user_a,user_b'});
    metrics.cache_write_ms=performance.now()-writeStart;
    if(writeError)failure('write',writeError);
  }
  return {explanations,metrics};
}
