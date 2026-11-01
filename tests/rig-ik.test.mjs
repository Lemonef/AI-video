import test from 'node:test';
import assert from 'node:assert/strict';
import {solveTwoBone,boneLengths,bendSide} from '../src/lib/rig/ik.ts';

const d=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const close=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<eps,`${a} != ${b}`);

test('reachable target: end lands on it and bone lengths are kept',()=>{
 const root=[10,20],target=[40,55],{joint,end,reached}=solveTwoBone(root,target,30,25,1);
 assert.ok(reached);
 close(end[0],40);close(end[1],55);
 close(d(root,joint),30);close(d(joint,end),25);
});

test('bend sign picks the side of the joint and round-trips through bendSide',()=>{
 const root=[0,0],target=[0,40];
 for(const bend of [1,-1]){
  const {joint,end}=solveTwoBone(root,target,25,25,bend);
  assert.equal(bendSide(root,joint,end),bend);
 }
 assert.ok(solveTwoBone(root,target,25,25,1).joint[0]!==solveTwoBone(root,target,25,25,-1).joint[0]);
});

test('out of reach: chain straightens toward the target, lengths kept',()=>{
 const root=[0,0],{joint,end,reached}=solveTwoBone(root,[100,0],30,20,1);
 assert.ok(!reached);
 close(end[0],50);close(end[1],0);close(joint[0],30);close(joint[1],0);
});

test('too close and degenerate targets never produce NaN',()=>{
 for(const target of [[0,0],[1,0]]){
  const {joint,end}=solveTwoBone([0,0],target,30,10,1);
  assert.ok([...joint,...end].every(Number.isFinite));
  close(d([0,0],joint),30);close(d(joint,end),10);
 }
});

test('a measured pose re-solves to itself from its own lengths and bend',()=>{
 const hip=[49,390],knee=[42,415],ankle=[34,435];
 const {upper,lower}=boneLengths(hip,knee,ankle);
 const {joint}=solveTwoBone(hip,ankle,upper,lower,bendSide(hip,knee,ankle));
 close(joint[0],knee[0],1e-6);close(joint[1],knee[1],1e-6);
});
