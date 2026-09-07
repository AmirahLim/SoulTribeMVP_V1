import {describe,it,expect,vi,beforeEach} from 'vitest';
const mock=vi.hoisted(()=>({getUser:vi.fn(),download:vi.fn()}));
vi.mock('../supabaseServer',()=>({getSupabaseServerClient:async()=>({auth:{getUser:mock.getUser},storage:{from:()=>({download:mock.download})}})}));
import {GET} from '../../app/api/avatar/[...path]/route';
const context={params:Promise.resolve({path:['11111111-1111-1111-1111-111111111111','avatar-abc.jpg']})};
describe('Private avatar delivery',()=>{
 beforeEach(()=>vi.resetAllMocks());
 it('rejects signed-out requests without reading storage',async()=>{
  mock.getUser.mockResolvedValue({data:{user:null}});
  expect((await GET(new Request('https://example.test'),context)).status).toBe(401);
  expect(mock.download).not.toHaveBeenCalled();
 });
 it('returns the image only through the authenticated storage client',async()=>{
  mock.getUser.mockResolvedValue({data:{user:{id:'viewer'}}});
  mock.download.mockResolvedValue({data:new Blob(['image']),error:null});
  const response=await GET(new Request('https://example.test'),context);
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(mock.download).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111/avatar-abc.jpg');
 });
 it('reports denied or missing objects as unavailable',async()=>{
  mock.getUser.mockResolvedValue({data:{user:{id:'viewer'}}});
  mock.download.mockResolvedValue({data:null,error:{message:'denied'}});
  expect((await GET(new Request('https://example.test'),context)).status).toBe(404);
 });
});
