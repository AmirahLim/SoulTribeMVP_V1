import {describe, expect, it, vi} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {publicSocialPages, selfSocialPages, sharedChoices} from '../socialScrapbook';
import {SocialScrapbook} from '../../components/profile/SocialScrapbook';
vi.mock('next/font/google', () => ({Caveat: () => ({className: 'handwriting'})}));
describe('Social scrapbook', () => {
  it('does not invent a read for unanswered threads or expose unsupported synthesis', () => {
    const pages = selfSocialPages({threads: [{key: 'personality', status: 'unknown', note: 'Private placeholder'}], values: [], interests: [],
      tribalRead: {headline: '', summary: '', sections: [{title: 'What you bring', content: 'Unsupported certainty', markerCount: 1}]}});
    expect(pages).toHaveLength(7);
    expect(JSON.stringify(pages)).not.toContain('Private placeholder');
    expect(JSON.stringify(pages)).not.toContain('Unsupported certainty');
    expect(pages.find(p => p.key === 'bring')?.notes).toEqual([]);
  });
  it('keeps strengths distinct from qualities wanted in friends', () => {
    const pages = publicSocialPages({desiredQualities: ['Curious', 'Kind'], profile_answers: {secret: 'hidden'}}, [], 'other-id');
    expect(pages.find(p => p.key === 'bring')?.notes).toEqual([]);
    expect(pages.find(p => p.key === 'best')?.notes).toEqual(['Qualities they look for in friends: Curious · Kind']);
    expect(JSON.stringify(pages)).not.toContain('hidden');
  });
  it('handles partial, malformed and custom public answers without private fallbacks', () => {
    expect(sharedChoices({intent: ['Other', 9, null], intentOther: 'Coffee friends'}, 'intent', 'intentOther')).toEqual(['Coffee friends']);
    expect(sharedChoices({group: 'One on one'}, 'groupChoices')).toEqual(['One on one']);
    expect(sharedChoices(undefined, 'clicks')).toEqual([]);
    expect(publicSocialPages(undefined, [], 'id').filter(p => p.key !== 'between').every(p => p.notes.length === 0)).toBe(true);
  });
  it('shows identity first, owner-only deeper questions and honest standing', () => {
    const props = {name: 'Alex', pages: publicSocialPages(undefined, [], 'alex')};
    const own = renderToStaticMarkup(React.createElement(SocialScrapbook, {...props, own: true}));
    const other = renderToStaticMarkup(React.createElement(SocialScrapbook, props));
    expect(own).toContain('You’re more than six answers');
    expect(other).not.toContain('/you/deeper');
    expect(other).toContain('Not available yet');
    expect(other).not.toContain('Trusted');
    expect(other.indexOf('<h1>Alex')).toBeLessThan(other.indexOf('Little pages of'));
    expect(other).toContain('aria-haspopup="dialog"');
  });
});
