import {beforeEach,expect,it,vi} from 'vitest';
import {checkHandleAvailability} from '../supabaseAuth';
const rpc=vi.hoisted(()=>vi.fn());
vi.mock('../supabase',()=>({getSupabaseBrowserClient:()=>({rpc})}));
beforeEach(()=>{rpc.mockReset();});
it('normalizes usernames and does not allow callers to exclude arbitrary accounts',async()=>{
 rpc.mockResolvedValue({data:true,error:null});
 expect((await checkHandleAvailability(' Member_One ','someone-else')).available).toBe(true);
 expect(rpc).toHaveBeenCalledWith('username_available',{p_username:'member_one'});
});
it('distinguishes a taken username from a failed check',async()=>{
 rpc.mockResolvedValue({data:false,error:null});
 expect(await checkHandleAvailability('member_one')).toEqual({available:false,message:'@member_one is already taken.'});
 for(const result of [{data:null,error:{code:'42501',message:'Denied'}},{data:null,error:null}]) {
  rpc.mockResolvedValue(result);
  expect(await checkHandleAvailability('member_one')).toMatchObject({available:false,failed:true});
 }
 rpc.mockRejectedValue(new Error('Offline'));
 expect(await checkHandleAvailability('member_one')).toMatchObject({available:false,failed:true});
});
it('rejects malformed handles without a database request',async()=>{
 for(const value of ['ab','mail@example.com','%', 'a'.repeat(21)])expect((await checkHandleAvailability(value)).available).toBe(false);
 expect(rpc).not.toHaveBeenCalled();
});
