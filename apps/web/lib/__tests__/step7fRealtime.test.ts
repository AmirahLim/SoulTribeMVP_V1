import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { subscribeOutingChanges, uniqueMessages } from '../realtime';

const outingId = '11111111-1111-4111-8111-111111111111';
function mockClient() {
  let status: (status: string) => void = () => {};
  const handlers: (() => void)[] = [];
  const channel = {
    on: vi.fn((_event, _filter, callback) => { handlers.push(callback); return channel; }),
    subscribe: vi.fn(callback => { status = callback; return channel; }),
  };
  const client = { channel: vi.fn(() => channel), removeChannel: vi.fn().mockResolvedValue('ok') };
  return { client, channel, status: (value: string) => status(value), handlers };
}
afterEach(() => vi.useRealTimers());
describe('outing Realtime', () => {
  it('publishes only the four outing tables, with no delete events or policy changes', () => {
    const sql = readFileSync('../../supabase/migrations/20260928000000_outing_realtime.sql','utf8');
    const tables = [...sql.matchAll(/'(outing_messages|outing_members|outings|outing_logistics)'/g)].map(m => m[1]);
    expect([...new Set(tables)].sort()).toEqual(['outing_logistics','outing_members','outing_messages','outings']);
    expect(sql).toContain("publish='insert, update'");
    expect(sql).not.toMatch(/profiles|trait_personality|profile_answers|rhythm_checks|create policy|alter policy/i);
    expect(sql).toContain('if not exists');
  });
  it('scopes events, refetches after reconnect and removes its channel', async () => {
    const mock = mockClient(); const fetch = vi.fn();
    const stop = subscribeOutingChanges({ table: 'outing_messages', outingId }, fetch, (() => mock.client) as any);
    expect(mock.channel.on).toHaveBeenCalledWith('postgres_changes',expect.objectContaining({ table:'outing_messages',filter:`outing_id=eq.${outingId}`,event:'INSERT' }),expect.any(Function));
    mock.status('SUBSCRIBED'); await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(1);
    mock.status('CHANNEL_ERROR'); mock.status('SUBSCRIBED'); await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(2);
    stop(); expect(mock.client.removeChannel).toHaveBeenCalledWith(mock.channel);
    mock.handlers[0](); expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('retries unavailable connections without throwing or leaking a retry after cleanup', () => {
    vi.useFakeTimers(); const factory = vi.fn(() => { throw new Error('offline'); });
    const stop = subscribeOutingChanges({table:'outings',outingId},vi.fn(),factory);
    vi.advanceTimersByTime(5000); expect(factory).toHaveBeenCalledTimes(2);
    stop(); vi.advanceTimersByTime(10000); expect(factory).toHaveBeenCalledTimes(2);
  });
  it('uses the signed-in member filter for invitations', () => {
    const mock=mockClient(); const stop=subscribeOutingChanges({table:'outing_members',userId:outingId},vi.fn(),(()=>mock.client) as any);
    expect(mock.channel.on).toHaveBeenCalledWith('postgres_changes',expect.objectContaining({filter:`user_id=eq.${outingId}`}),expect.any(Function)); stop();
  });
  it('does not duplicate a message echo', () => {
    const existing={id:1}; expect(uniqueMessages([existing,{id:2},existing])).toEqual([existing,{id:2}]);
  });
  it('all surfaces use the shared helper without opening their own channels', () => {
    for (const file of ['components/Nav.tsx','components/outings/OutingContext.tsx','app/outings/[id]/page.tsx']) {
      const source=readFileSync(file,'utf8');
      expect(source).toContain('import { subscribeOutingChanges');
      expect(source).not.toContain('.channel(');
    }
  });
});
