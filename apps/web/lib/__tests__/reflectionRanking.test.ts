import {it,expect} from 'vitest';
import {reflectionBoost,MAX_REFLECTION_BOOST} from '../reflectionRanking';
it('uses only the viewer’s opted-in preference for that peer, with a bounded boost',()=>{
  const checks=[{about_id:'peer',would_meet_again:5}];
  expect(reflectionBoost(false,'peer',checks)).toBe(0);
  expect(reflectionBoost(true,'other',checks)).toBe(0);
  expect(reflectionBoost(true,'peer',checks)).toBe(MAX_REFLECTION_BOOST);
  expect(reflectionBoost(true,'peer',[{about_id:'peer',would_meet_again:1}])).toBe(0);
});
