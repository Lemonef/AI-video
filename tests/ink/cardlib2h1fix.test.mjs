// Card library job 2h1-fix contract (brief docs/briefs/ink-card-lib-2h1fix.md): redraw the `face` and `man`
// doodles so they fill the shared 200x200 icon box like tower/hat/mask and read at a glance. Job 2h1 shipped
// them at about a third of the box (face read as a monkey, the man's hat hid his face, legs were open
// slivers). Written by the planner BEFORE the build and protected. Structural only: the planner judges the
// art from stills.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');

// Single source for the contract numbers; the brief states the same values.
const BOX = 100; // icon art lives in -BOX..BOX on both axes
const SPAN = {face: {x: 150, y: 160}, man: {x: 90, y: 175}}; // minimum art extent per icon (box is 200)
const HEAD_H = {face: 120, man: 40}; // minimum height of the skin-coloured head shape
const MIN_PATHS = {face: 7, man: 9}; // separate <path> parts
const ICONS = 'engine/ink/parts/icons.tsx';
const iconCase = (src, name) => {
  const m = src.match(new RegExp(String.raw`case '${name}':([\s\S]*?)(?=case '|default:)`));
  assert.ok(m, `icons.tsx has no case '${name}'`);
  return m[1];
};
// Absolute command points only (M L Q C T); relative lowercase segments are skipped.
const points = (d) => {
  const out = [];
  for (const seg of d.match(/[A-Za-z][^A-Za-z]*/g) || []) {
    const cmd = seg[0];
    if (!'MLQCT'.includes(cmd)) continue;
    const n = (seg.slice(1).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i], n[i + 1]]);
  }
  return out;
};
const span = (pts) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return {x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys)};
};
const pathsOf = (body) => [...body.matchAll(/<path\b([^>]*?)\/>/g)].map((m) => {
  const attrs = m[1];
  const d = (attrs.match(/\bd="([^"]*)"/) || [])[1] || '';
  const fill = (attrs.match(/\bfill=(\{[^}]*\}\}?|"[^"]*")/) || [])[1] || '';
  return {attrs, d, fill};
});

test('2h1fix: face and man fill the icon box and stay inside it', () => {
  const src = read(ICONS);
  for (const n of Object.keys(SPAN)) {
    const ps = pathsOf(iconCase(src, n));
    const pts = ps.flatMap((p) => points(p.d));
    assert.ok(pts.length > 0, `${n} has no drawable points`);
    const s = span(pts);
    assert.ok(s.x0 >= -BOX && s.x1 <= BOX && s.y0 >= -BOX && s.y1 <= BOX, `${n} leaves the box: ${JSON.stringify(s)}`);
    assert.ok(s.x1 - s.x0 >= SPAN[n].x, `${n} too narrow: ${s.x1 - s.x0} < ${SPAN[n].x}`);
    assert.ok(s.y1 - s.y0 >= SPAN[n].y, `${n} too short: ${s.y1 - s.y0} < ${SPAN[n].y}`);
    assert.ok(ps.length >= MIN_PATHS[n], `${n} too crude: ${ps.length} paths`);
  }
});

test('2h1fix: every filled shape is closed; lines use fill none', () => {
  const src = read(ICONS);
  for (const n of Object.keys(SPAN)) {
    for (const p of pathsOf(iconCase(src, n))) {
      if (p.fill === '"none"') continue;
      assert.match(p.d.trim(), /[Zz]$/, `${n}: filled path is open (sliver), close it with Z or use fill="none": ${p.d.slice(0, 40)}`);
    }
  }
});

test('2h1fix: the skin head is big enough to read', () => {
  const src = read(ICONS);
  for (const n of Object.keys(HEAD_H)) {
    const heads = pathsOf(iconCase(src, n)).filter((p) => /DOODLE\.skin/.test(p.fill));
    assert.ok(heads.length >= 1, `${n} has no skin shape`);
    const tallest = Math.max(...heads.map((p) => { const s = span(points(p.d)); return s.y1 - s.y0; }));
    assert.ok(tallest >= HEAD_H[n], `${n} head too small: ${tallest} < ${HEAD_H[n]}`);
  }
});

test('2h1fix: house rules kept: base() main fill, one paper highlight, paths only, ASCII', () => {
  const src = read(ICONS);
  for (const n of Object.keys(SPAN)) {
    const body = iconCase(src, n);
    assert.match(body, /fill=\{base\(/, `${n} main fill through base()`);
    const hl = body.match(/highlight\s*=\s*'([^']*)'/);
    assert.ok(hl && hl[1].trim().length > 0, `${n} needs the shared paper highlight`);
    assert.doesNotMatch(body, /<rect\b|<circle\b|<ellipse\b|strokeWidth/, `${n}: paths only, shared outline`);
  }
  assert.match(src, /'crown' \| 'face' \| 'man'/, 'IconName unchanged');
  const bad = [...src].find((ch) => ch.charCodeAt(0) > 127);
  assert.equal(bad, undefined, 'icons.tsx ASCII-only');
});
