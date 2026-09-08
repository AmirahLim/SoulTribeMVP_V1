import {describe, it, expect} from 'vitest';
import {buildSavedAnswerRead, suppliedTraitFields} from '../savedAnswerRead';
import {selfSocialPages} from '../socialScrapbook';

describe('saved categorical answers feed owner pages without invented traits', () => {
  it('renders actual form keys even when numeric traits have no answers', () => {
    // Isolated form-contract fixture; never inserted into a database.
    const evidence = buildSavedAnswerRead({deep_profile: {
      groupSize: 'Depends', messagingStyle: 'Random thoughts',
      coreValues: 'Family · Stability', idealSaturday: 'Hobbies · Home',
    }, onboarding: {baselineV2: {connectionChoice: 'About once a week'}}});
    const pages = selfSocialPages({threads: [], interests: [], values: [], savedAnswerRead: evidence});
    expect(pages.find(p => p.key === 'connect')!.notes.join(' ')).toContain('Random thoughts');
    expect(pages.find(p => p.key === 'connect')!.notes.join(' ')).toContain('About once a week');
    expect(pages.find(p => p.key === 'bring')!.notes.join(' ')).toContain('Family · Stability');
    expect(pages.find(p => p.key === 'best')!.notes.join(' ')).toContain('Hobbies · Home');
    expect(evidence.notes.personality).toEqual(['Your current group-size preference: Depends.']);
    expect(JSON.stringify(evidence)).not.toMatch(/reply speed|agreeableness|0\.5/);
  });
  it('does not read arbitrary text, MBTI, astrology, declined or unknown choices', () => {
    const result = buildSavedAnswerRead({deep_profile: {mbti: 'INTJ', sunSign: 'Aries',
      messagingStyleOpen: 'PRIVATE TEXT', groupSize: 'Prefer not to say',
      coreValues: 'UNRECOGNISED', budgetPref: 'Prefer not to say'},
      onboarding: {baselineV2: {outings: ['Other'], outingOther: 'CUSTOM TEXT'}}});
    expect(result.facts).toEqual([]);
    expect(result.hasDeeperAnswers).toBe(false);
  });
  it('desired qualities never become the owner\'s measured values or openness', () => {
    const result = buildSavedAnswerRead({onboarding: {baselineV2: {desiredQualities: ['Emotionally open', 'Reliable']}}});
    expect(result.notes.desiredQualities).toHaveLength(1);
    expect(result.notes.values).toBeUndefined();
    expect(result.notes.emotional).toBeUndefined();
  });
  it('does not reconstruct question versions or inflate independent sources', () => {
    const result = buildSavedAnswerRead({deep_profile: {coreValues: 'Family · Family · Stability'}});
    expect(result.facts).toEqual([{source:'deep_profile.coreValues', selections:['Family','Stability'], note:'Your life priorities: Family · Stability.'}]);
  });
  it('omits absent numeric fields, retains explicit withdrawals and zero', () => {
    expect(suppliedTraitFields({trait_personality:{novelty_seeking:undefined, serious_playful:null},
      trait_communication:{response_speed_self:0, initiation_self:1, initiation_expect:NaN}}))
      .toEqual({trait_personality:{serious_playful:null},trait_communication:{response_speed_self:0, initiation_self:1}});
  });
});
