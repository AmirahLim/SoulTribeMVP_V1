import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {loadPairEvidence,cachedRead,evidenceHash} from '../../../../lib/readEngine/server';
export const runtime='nodejs';
export async function GET(req:NextRequest){
  const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'').trim();
  if(!token)return NextResponse.json({error:'Unauthorized'},{status:401});
  const subject=req.nextUrl.searchParams.get('id');
  if(!subject||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subject))return NextResponse.json({error:'Valid profile id required'},{status:400});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key||!secret)return NextResponse.json({error:'Read service is not configured'},{status:503});
  const client=createClient(url,key,{auth:{persistSession:false},global:{headers:{Authorization:`Bearer ${token}`}}});
  const auth=await client.auth.getUser(token);
  if(auth.error||!auth.data.user)return NextResponse.json({error:'Unauthorized'},{status:401});
  const profile=await client.from('profiles').select('id').eq('id',subject).maybeSingle();
  if(profile.error)return NextResponse.json({error:profile.error.message},{status:503});
  if(!profile.data)return NextResponse.json({error:'Profile unavailable'},{status:404});
  try{
    const pair=await loadPairEvidence(client,auth.data.user.id,subject);
    const sources=pair.sources.filter(s=>s.subject==='other').map(s=>({...s,subject:'self' as const,id:s.id.replace(/^other:/,'self:')}));
    const bundle={...pair,level:'profile' as const,sources,knownThreads:[...new Set(sources.map(s=>s.thread))]};
    const result=await cachedRead(createClient(url,secret,{auth:{persistSession:false}}),auth.data.user.id,subject,bundle);
    const fresh=await loadPairEvidence(client,auth.data.user.id,subject);
    const freshSources=fresh.sources.filter(s=>s.subject==='other').map(s=>({...s,subject:'self' as const,id:s.id.replace(/^other:/,'self:')}));
    if(evidenceHash({...fresh,level:'profile',sources:freshSources,knownThreads:[...new Set(freshSources.map(s=>s.thread))]})!==result.hash)
      return NextResponse.json({error:'Reading access or evidence changed. Please retry.'},{status:409});
    // Recheck access after generation before returning a previously-authorised cache.
    const allowed=await client.from('profiles').select('id').eq('id',subject).maybeSingle();
    if(allowed.error||!allowed.data)return NextResponse.json({error:'Profile unavailable'},{status:404});
    return NextResponse.json({composedRead:result.read},{headers:{'Cache-Control':'private, no-store'}});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Unable to read this profile'},{status:503});}
}
