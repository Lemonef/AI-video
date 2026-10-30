import test from 'node:test';
import assert from 'node:assert/strict';
import {STUDY_SHOTS,STUDY_FRAMES,shotAt} from '../src/compositions/ReferenceStudy/shots.ts';

test('private-study cuts cover every output frame exactly once',()=>{
 assert.equal(STUDY_SHOTS.length,35);
 assert.equal(STUDY_SHOTS[0].start,0);
 assert.equal(STUDY_SHOTS.at(-1).end,STUDY_FRAMES);
 for(let i=0;i<STUDY_SHOTS.length;i++){
  const s=STUDY_SHOTS[i];
  assert.ok(Number.isInteger(s.start)&&Number.isInteger(s.end));
  assert.ok(s.end>s.start);
  if(i)assert.equal(STUDY_SHOTS[i-1].end,s.start);
  assert.equal(shotAt(s.start).id,s.id);
  assert.equal(shotAt(s.end-1).id,s.id);
 }
 for(let frame=0;frame<STUDY_FRAMES;frame++)assert.equal(STUDY_SHOTS.filter(s=>frame>=s.start&&frame<s.end).length,1);
});
