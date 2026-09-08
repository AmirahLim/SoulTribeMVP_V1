import React from 'react';
import { act, create } from 'react-test-renderer';
import { afterEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { StagingHomePreview } from '../../components/StagingHomePreview';

vi.mock('next/link', () => ({ default: (props: any) => React.createElement('a', props) }));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetModules(); });

it('opens a layout-only Home and switches tabs without auth or data requests', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const fetch = vi.fn(() => { throw new Error('Preview must not fetch member data'); });
  vi.stubGlobal('fetch', fetch);
  let tree: ReturnType<typeof create>;
  await act(async () => { tree = create(React.createElement(StagingHomePreview)); });
  expect(JSON.stringify(tree!.toJSON())).toContain('no sign-in needed');
  for (const tab of tree!.root.findAllByProps({ role: 'tab' })) {
    await act(async () => { tab.props.onClick(); });
    expect(tree!.root.findByProps({ role: 'tabpanel' }).findByType('h2').children).toEqual(tab.children);
  }
  expect(fetch).not.toHaveBeenCalled();
  expect(tree!.root.findAllByType('input')).toHaveLength(0);
  expect(tree!.root.findByProps({ title: 'Account action unavailable in layout preview' }).props.disabled).toBe(true);
  await act(async () => tree!.unmount());
});

it('keeps member Home behind AuthGuard and mounts a separate preview component', () => {
  const source = readFileSync(new URL('../../app/home/page.tsx', import.meta.url), 'utf8');
  expect(source).toContain("if (process.env.NEXT_PUBLIC_STAGING_HOME_PREVIEW === 'true') return <StagingHomePreview />;");
  expect(source).toMatch(/<AuthGuard>\s*<HomeContent \/>\s*<\/AuthGuard>/);
  const preview = readFileSync(new URL('../../components/StagingHomePreview.tsx', import.meta.url), 'utf8');
  expect(preview).not.toMatch(/useAuth|getUserProfile|fetch\(|supabase|localStorage/);
});

it.each([
  ['preview', 'codex/8a-staging', 'https://imiblxqkfxijccndqytm.supabase.co', 'true'],
  ['production', 'codex/8a-staging', 'https://imiblxqkfxijccndqytm.supabase.co', 'false'],
  ['preview', 'main', 'https://imiblxqkfxijccndqytm.supabase.co', 'false'],
  ['preview', 'codex/8a-staging', 'https://hmmiqomkapoevnmdhkra.supabase.co', 'false'],
])('preview isolation: %s %s %s', async (environment, branch, url, expected) => {
  vi.stubEnv('VERCEL_ENV', environment);
  vi.stubEnv('VERCEL_GIT_COMMIT_REF', branch);
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', url);
  const { default: config } = await import('../../next.config.mjs');
  expect(config.env?.NEXT_PUBLIC_STAGING_HOME_PREVIEW).toBe(expected);
});
