import {describe,it,expect,vi,beforeEach} from 'vitest';
import {NextRequest} from 'next/server';
import {privateAvatarUrl,validAvatarPath} from '../privateAvatar';
const mocks=vi.hoisted(()=>({getUser:vi.fn(),download:vi.fn()}));
vi.mock('../supabaseServer',()=>({getSupabaseServerClient:async()=>({auth:{getUser:mocks.getUser},storage:{from:()=>({download:mocks.download})}})}));
import {GET} from '../../app/api/avatar/route';
const path='12345678-1234-1234-1234-123456789abc/avatar-123.jpg';
const request=()=>new NextRequest('https://example.com'+privateAvatarUrl(path));
beforeEach(()=>{vi.clearAllMocks();mocks.getUser.mockResolvedValue({data:{user:{id:'member'}},error:null});mocks.download.mockResolvedValue({data:new Blob(['photo'],{type:'image/jpeg'}),error:null});});
describe('Private avatar delivery',()=>{
 it('keeps a stable URL and rejects arbitrary paths',()=>{
  expect(privateAvatarUrl(path)).toContain('/api/avatar?path=');
  expect(validAvatarPath(path)).toBe(true);
  for(const p of ['../secret','https://example.com/a.jpg',path+'/../x',path.replace('.jpg','.svg')])expect(validAvatarPath(p)).toBe(false);
 });
 it('does not read storage for signed-out requests',async()=>{
  mocks.getUser.mockResolvedValue({data:{user:null},error:null});
  expect((await GET(request())).status).toBe(401);expect(mocks.download).not.toHaveBeenCalled();
 });
 it('serves an allowed private image without caching it publicly',async()=>{
  const r=await GET(request());expect(r.status).toBe(200);expect(await r.text()).toBe('photo');
  expect(r.headers.get('cache-control')).toBe('private, no-store');expect(r.headers.get('vary')).toBe('Cookie');
 });
 it('honours storage denial and rejects active content',async()=>{
  mocks.download.mockResolvedValue({data:null,error:{message:'denied'}});
  expect((await GET(request())).status).toBe(404);
  mocks.download.mockResolvedValue({data:new Blob(['<svg/>'],{type:'image/svg+xml'}),error:null});
  expect((await GET(request())).status).toBe(415);
 });
 it('returns a retryable error when storage fails',async()=>{
  mocks.download.mockRejectedValue(new Error('offline'));
  expect((await GET(request())).status).toBe(503);
 });
});
