// Card library job 2h1 contract (brief docs/briefs/ink-card-lib-2h1.md): two new doodle icons, `face` and
// `man`, each shown inside a real layout in demo2 (the grid's odd cell and a scale pan). Written by the
// planner BEFORE the build and protected. Structural only: the planner judges the art from stills.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');

// Single source for the contract numbers; the brief states the same values.
const SHOT = 90; // demo shot length
const ENTRY = 6; // layout enters at shot.f0 + ENTRY
const NEW_ICONS = ['face', 'man'];
const GRID_SHOT = 11; // job 2g's grid shot; its odd cell becomes `face`
const SCALE_SHOT = 12; // 2h1 appends this shot
const MIN_PARTS = {face: 6, man: 6}; // face: head, 2 ears, hair, eyes, nose, smile; man: head, body, legs, hat, tie, buttons
const ICONS = 'engine/ink/parts/icons.tsx';
const iconCase = (src, name) => {
  const m = src.match(new RegExp(`case '${name}':([\s\S]*?)(?=case '|default:)`));
  assert.ok(m, `icons.tsx has no case '${name}'`);
  return m[1];
};
const mainLayout = (s) => s.els.find((e) => e.t !== 'words');

test('2h1: IconName gains face and man, keeps every earlier name', () => {
  const src = read(ICONS);
  const m = src.match(/export type IconName\s*=([^;]+);/);
  assert.ok(m, 'export type IconName missing');
  const names = [...m[1].matchAll(/'([a-z]+)'/g)].map((x) => x[1]);
  assert.equal(new Set(names).size, names.length, 'duplicate IconName');
  for (const n of NEW_ICONS) assert.ok(names.includes(n), `IconName has no ${n}`);
  assert.ok(names.length >= 20 + NEW_ICONS.length, `IconName lost names (${names.length})`);
});

test('2h1: face and man are real doodles: base() fill, enough parts, one paper highlight, paths only', () => {
  const src = read(ICONS);
  for (const n of NEW_ICONS) {
    const body = iconCase(src, n);
    assert.match(body, /fill=\{base\(/, `${n} main fill must go through base() so colour overrides work`);
    const parts = (body.match(/<path\b/g) || []).length;
    const subpaths = (body.match(/\bd="[^"]*"/g) || []).join(' ').match(/M-?\d/g) || [];
    assert.ok(parts >= 3 && subpaths.length >= MIN_PARTS[n], `${n} too crude: ${parts} paths, ${subpaths.length} sub-paths`);
    const hl = body.match(/highlight\s*=\s*'([^']*)'/);
    assert.ok(hl && hl[1].trim().length > 0, `${n} needs the shared paper highlight`);
    assert.doesNotMatch(body, /<rect\b|<circle\b|<ellipse\b/, `${n}: hand-drawn paths only`);
  }
  assert.match(src, /default:[\s\S]*throw/, 'unknown names still throw');
});

test('2h1: demo2 grid odd cell is the face; scale shot appended weighs the man; contiguous, no back-to-back', () => {
  const p = JSON.parse(read('engine/ink/parts/cardlib/demo2.json'));
  assert.ok(p.shots.length >= SCALE_SHOT + 1, 'scale shot appended');
  assert.equal(p.f1, p.shots.length * SHOT);
  p.shots.forEach((s, i) => {
    assert.equal(s.f0, i * SHOT, `shot ${i} f0`);
    assert.equal(s.f1, (i + 1) * SHOT, `shot ${i} f1`);
    assert.deepEqual(s.bg, {card: true}, `shot ${i} bg`);
    if (i > 0) assert.notEqual(mainLayout(s).t, mainLayout(p.shots[i - 1]).t, `shots ${i - 1} and ${i} repeat a layout`);
  });
  const grid = mainLayout(p.shots[GRID_SHOT]);
  assert.equal(grid.t, 'grid');
  assert.equal(grid.odd.icon, 'face');
  const s = p.shots[SCALE_SHOT];
  const sc = mainLayout(s);
  assert.equal(sc.t, 'scale');
  assert.equal(sc.left.icon, 'hotel');
  assert.equal(sc.right.icon, 'man');
  assert.equal(sc.heavy, 'right');
  assert.equal(sc.at, s.f0 + ENTRY);
});

test('2h1: icons.tsx stays ASCII-only', () => {
  const bad = [...read(ICONS)].find((ch) => ch.charCodeAt(0) > 127);
  assert.equal(bad, undefined, `icons.tsx has non-ASCII ${JSON.stringify(bad)}`);
});
