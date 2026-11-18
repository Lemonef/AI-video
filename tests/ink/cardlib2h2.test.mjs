// Card library job 2h2 contract (brief docs/briefs/ink-card-lib-2h2.md): one new doodle icon, `chair`,
// shown inside a real layout in demo2 (the B side of a transform). Written by the planner BEFORE the build
// and protected. Structural only: the planner judges the art from stills.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');

// Single source for the contract numbers; the brief states the same values.
const SHOT = 90; // demo shot length
const ENTRY = 6; // layout enters at shot.f0 + ENTRY
const NEW_ICONS = ['chair'];
const PREV_ICONS = 22; // IconName size after job 2h1
const PREV_SHOTS = 13; // demo2 shots owned by jobs 2b..2h1; 2h2 appends after them
const SHOT_IDX = PREV_SHOTS; // the transform shot 2h2 appends
const MIN_PARTS = {chair: 7}; // seat, backrest, 2 slats, 4 legs (back legs shorter), grain stroke
const BOX = 100; // icon art lives in -BOX..BOX on both axes
const SPAN = {chair: {x: 120, y: 170}}; // minimum art extent (box is 200); job 2h1 shipped icons at a third of the box
const ICONS = 'engine/ink/parts/icons.tsx';
const iconCase = (src, name) => {
  const m = src.match(new RegExp(String.raw`case '${name}':([\s\S]*?)(?=case '|default:)`));
  assert.ok(m, `icons.tsx has no case '${name}'`);
  return m[1];
};
// Absolute command points only (M L Q C); T is forbidden (its reflected control point is implicit).
const points = (d) => {
  const out = [];
  for (const seg of d.match(/[A-Za-z][^A-Za-z]*/g) || []) {
    if (!'MLQC'.includes(seg[0])) continue;
    const n = (seg.slice(1).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i], n[i + 1]]);
  }
  return out;
};
const pathsOf = (body) => [...body.matchAll(/<path\b([^>]*?)\/>/g)].map((m) => ({
  d: (m[1].match(/\bd="([^"]*)"/) || [])[1] || '',
  fill: (m[1].match(/\bfill=(\{[^}]*\}\}?|"[^"]*")/) || [])[1] || '',
}));
const mainLayout = (s) => s.els.find((e) => e.t !== 'words');

test('2h2: IconName gains chair, keeps every earlier name', () => {
  const src = read(ICONS);
  const m = src.match(/export type IconName\s*=([^;]+);/);
  assert.ok(m, 'export type IconName missing');
  const names = [...m[1].matchAll(/'([a-z]+)'/g)].map((x) => x[1]);
  assert.equal(new Set(names).size, names.length, 'duplicate IconName');
  for (const n of NEW_ICONS) assert.ok(names.includes(n), `IconName has no ${n}`);
  assert.ok(names.length >= PREV_ICONS + NEW_ICONS.length, `IconName lost names (${names.length})`);
});

test('2h2: chair is a real doodle: base() fill, enough parts, one paper highlight, paths only', () => {
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

test('2h2: chair fills the icon box, stays inside it, every filled shape closed', () => {
  const src = read(ICONS);
  for (const n of NEW_ICONS) {
    const body = iconCase(src, n);
    const ps = pathsOf(body);
    // The highlight string is drawn by the wrapper as a fill-none path; measure it with the art.
    const hl = (body.match(/highlight\s*=\s*'([^']*)'/) || [])[1];
    if (hl) ps.push({d: hl, fill: '"none"'});
    const pts = ps.flatMap((p) => points(p.d));
    assert.ok(pts.length > 0, `${n} has no drawable points`);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    assert.ok(x0 >= -BOX && x1 <= BOX && y0 >= -BOX && y1 <= BOX, `${n} leaves the box: ${[x0, x1, y0, y1]}`);
    assert.ok(x1 - x0 >= SPAN[n].x, `${n} too narrow: ${x1 - x0} < ${SPAN[n].x}`);
    assert.ok(y1 - y0 >= SPAN[n].y, `${n} too short: ${y1 - y0} < ${SPAN[n].y}`);
    for (const p of ps) {
      // Only absolute M L Q C Z, so the measured points ARE the drawn geometry (no relative/H/V/arc/T drift).
      assert.doesNotMatch(p.d, /[^MLQCZ\d\s.,-]/, `${n}: path uses a command the contract cannot measure: ${p.d.slice(0, 40)}`);
      if (p.fill === '"none"') continue;
      for (const sub of p.d.match(/M[^M]*/g) || []) {
        assert.match(sub.trim(), /Z$/, `${n}: filled sub-path is open (sliver): ${sub.slice(0, 40)}`);
      }
    }
    assert.doesNotMatch(iconCase(src, n), /\btransform\s*=/, `${n}: no transforms, the box check measures raw coordinates`);
  }
});

test('2h2: demo2 appends one transform shot tower -> chair; contiguous, no back-to-back', () => {
  const p = JSON.parse(read('engine/ink/parts/cardlib/demo2.json'));
  assert.ok(p.shots.length >= PREV_SHOTS + 1, 'transform shot appended');
  assert.equal(p.f1, p.shots.length * SHOT);
  p.shots.forEach((s, i) => {
    assert.equal(s.f0, i * SHOT, `shot ${i} f0`);
    assert.equal(s.f1, (i + 1) * SHOT, `shot ${i} f1`);
    assert.deepEqual(s.bg, {card: true}, `shot ${i} bg`);
    if (i > 0) assert.notEqual(mainLayout(s).t, mainLayout(p.shots[i - 1]).t, `shots ${i - 1} and ${i} repeat a layout`);
  });
  assert.equal(mainLayout(p.shots[11]).odd.icon, 'face', '2h1 grid shot untouched');
  assert.equal(mainLayout(p.shots[12]).right.icon, 'man', '2h1 scale shot untouched');
  const s = p.shots[SHOT_IDX];
  const tr = mainLayout(s);
  assert.equal(tr.t, 'transform');
  assert.equal(tr.a.icon, 'tower');
  assert.equal(tr.b.icon, 'chair');
  assert.equal(tr.label, 'A SEAT');
  assert.equal(tr.at, s.f0 + ENTRY);
});

test('2h2: icons.tsx stays ASCII-only', () => {
  const bad = [...read(ICONS)].find((ch) => ch.charCodeAt(0) > 127);
  assert.equal(bad, undefined, `icons.tsx has non-ASCII ${JSON.stringify(bad)}`);
});
