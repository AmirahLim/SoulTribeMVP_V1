import {getSupabaseServerClient} from '../../../../lib/supabaseServer';

export async function GET(_request: Request, context: {params: Promise<{path: string[]}>}) {
  const headers = {'Cache-Control':'private, no-store'};
  try {
    const client = await getSupabaseServerClient();
    const {data:{user},error:authError} = await client.auth.getUser();
    if (authError || !user) return new Response('Please sign in', {status:401,headers});
    const {path} = await context.params;
    if (path.length !== 2 || !/^[0-9a-f-]{36}$/.test(path[0]) || !/^avatar-[0-9a-f-]+\.jpg$/.test(path[1]))
      return new Response('Invalid photo path', {status:400,headers});
    // The member's session and Storage RLS authorize access; no service key.
    const {data,error} = await client.storage.from('avatars').download(path.join('/'));
    if (error || !data) return new Response('Photo unavailable', {status:404,headers});
    return new Response(data, {headers:{...headers,'Content-Type':'image/jpeg','X-Content-Type-Options':'nosniff'}});
  } catch {
    return new Response('Photo could not be loaded', {status:503,headers});
  }
}
