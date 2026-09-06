import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TribalRead } from '../../components/profile/TribalRead';
import { ProfileHero } from '../../components/profile/ProfileHero';
import { saveProfileIdentity } from '../saveProfileIdentity';
const db = vi.hoisted(() => ({ from: vi.fn(), update: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn() }));
vi.mock('../supabase', () => ({ getSupabaseBrowserClient: () => db }));
beforeEach(() => {
  vi.clearAllMocks();
  for (const method of ['from', 'update', 'eq', 'select'] as const) db[method].mockReturnValue(db);
});
const identity = { display_name: ' Alex ', home_area: ' East ', bio: ' Hello ', avatar_url: '' };
describe('Profile editing acknowledgement', () => {
  it('does not report a save when the database denies it', async () => {
    db.single.mockResolvedValue({ data: null, error: { message: 'denied' } });
    await expect(saveProfileIdentity('user-id', identity)).rejects.toThrow('could not be saved');
  });
  it('rejects a zero-row update even without a database error', async () => {
    db.single.mockResolvedValue({ data: null, error: null });
    await expect(saveProfileIdentity('user-id', identity)).rejects.toThrow('could not be saved');
  });
  it('returns normalized identity only after an acknowledged save', async () => {
    db.single.mockResolvedValue({ data: { id: 'user-id' }, error: null });
    expect(await saveProfileIdentity('user-id', identity)).toEqual({ ...identity, display_name: 'Alex', home_area: 'East', bio: 'Hello' });
    expect(db.eq).toHaveBeenCalledWith('id', 'user-id');
  });
  it('does not write a blank name', async () => {
    await expect(saveProfileIdentity('user-id', { ...identity, display_name: ' ' })).rejects.toThrow('enter your name');
    expect(db.from).not.toHaveBeenCalled();
  });
});
describe('Evidence-aware Social Signature', () => {
  it('does not invent a summary for missing evidence', () => {
    expect(renderToStaticMarkup(React.createElement(TribalRead))).toBe('');
  });
  it('offers native disclosure and excludes unsupported synthesis sections', () => {
    const html = renderToStaticMarkup(React.createElement(TribalRead, { data: {
      headline: 'A quieter pace', summary: 'You prefer small groups.', pills: [], topThreads: ['personality', 'communication'],
      sections: [{ title: 'Supported', content: 'Shared activities give conversation a starting point.', markerCount: 2 }, { title: 'Unsupported', content: 'Invented certainty', markerCount: 1 }],
    } }));
    expect(html).toContain('<summary'); expect(html).toContain('Supported'); expect(html).not.toContain('Invented certainty');
  });
  it('does not present an instinct or participation count as a personal role', () => {
    const html = renderToStaticMarkup(React.createElement(ProfileHero, { displayName: 'Alex', handle: '', homeArea: '', instinctType: 'Connector', standingText: 'Trusted' }));
    expect(html).not.toContain('Connector'); expect(html).not.toContain('Trusted'); expect(html).not.toContain('@ ·');
  });
});
