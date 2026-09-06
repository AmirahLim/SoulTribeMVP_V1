import { it, expect, vi } from 'vitest';
import { runSilentDeeperPassBackfill } from '../silentBackfill';
import * as saving from '../supabaseOnboarding';
it('never uploads legacy local answers with unverifiable provenance', async () => {
  const save = vi.spyOn(saving, 'saveDeeperPassToSupabase');
  await runSilentDeeperPassBackfill('member');
  expect(save).not.toHaveBeenCalled();
});
