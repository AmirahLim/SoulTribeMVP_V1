import {NextRequest} from 'next/server';
import {getSupabaseServerClient} from '../../../lib/supabaseServer';
import {validAvatarPath} from '../../../lib/privateAvatar';

export const dynamic = 'force-dynamic';
const headers = {'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Cookie'};
export async function GET(request:NextRequest) {
 const path=request.nextUrl.searchParams.get('path')??'';
 if(!validAvatarPath(path))return new Response(null,{status:400,headers});
 try {
  const client=await getSupabaseServerClient();
  const {data:{user},error:authError}=await client.auth.getUser();
  if(authError||!user)return new Response(null,{status:401,headers});
  // Use the member's session: private Storage policies remain in force.
  const {data,error}=await client.storage.from('avatars').download(path);
  if(error||!data)return new Response(null,{status:404,headers});
  if(data.size>4*1024*1024||!['image/jpeg','image/png','image/webp'].includes(data.type))return new Response(null,{status:415,headers});
  return new Response(data,{headers:{...headers,'Content-Type':data.type}});
 } catch {return new Response(null,{status:503,headers});}
}
