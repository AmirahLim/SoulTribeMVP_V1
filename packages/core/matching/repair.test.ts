import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scoreRepair} from './repair.ts';
import type {ProfileVector} from '../domain/types.ts';
const vector=(answers?:Record<string,string[]>)=>({repair:answers?{answers,answered:Object.keys(answers).length}:undefined}) as ProfileVector;
test('unanswered and incomparable repair preferences remain unknown',()=>{
 assert.equal(scoreRepair(vector(),vector()),null);
 assert.equal(scoreRepair(vector({'repair.first':['Ask how they saw it']}),vector({'repair.need':['A clear apology']})),null);
});
test('repair compares categorical agreement without an ordinal healthy-unhealthy scale',()=>{
 const a=vector({'repair.first':['Ask how they saw it'],'repair.need':['A clear apology','They understand what bothered me']});
 const b=vector({'repair.first':['Ask how they saw it'],'repair.need':['A clear apology']});
 assert.equal(scoreRepair(a,b),.75);assert.equal(scoreRepair(b,a),.75);
 assert.equal(scoreRepair(a,a),1);
 assert.equal(scoreRepair(vector({'repair.first':['Name what feels off']}),vector({'repair.first':['Wait a little before saying anything']})),0);
});
