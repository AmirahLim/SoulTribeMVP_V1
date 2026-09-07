import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicPreferenceBoost,PUBLIC_PREFERENCE_MAX_BOOST} from './publicPreferences.ts';
test('only shared explicit answers contribute, including sets and literal custom text',()=>{
 assert.equal(publicPreferenceBoost(undefined,{intent:['Close circle']}),0);
 assert.equal(publicPreferenceBoost({desiredQualities:['Reliable']},{desiredQualities:['Curious']}),0);
 assert.equal(publicPreferenceBoost({desiredQualities:['Reliable']},{desiredQualities:['Reliable']}),PUBLIC_PREFERENCE_MAX_BOOST);
 assert.equal(publicPreferenceBoost({groupChoices:['1:1','Small circle']},{groupChoices:['1:1']}),PUBLIC_PREFERENCE_MAX_BOOST/2);
 assert.equal(publicPreferenceBoost({clicks:['Other'],clicksOther:'Shared phrase'},{clicks:['Other'],clicksOther:'Different phrase'}),0);
 assert.equal(publicPreferenceBoost({clicks:['Other'],clicksOther:'Shared phrase'},{clicks:['Other'],clicksOther:'Shared phrase'}),PUBLIC_PREFERENCE_MAX_BOOST);
 assert.equal(publicPreferenceBoost({privateAnswer:'x'},{privateAnswer:'x'}),0);
});
