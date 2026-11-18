// Card library job 2h1-fix2 contract (brief docs/briefs/ink-card-lib-2h1fix2.md): the `man` face reads as a
// black beard at card size. Root cause: his skin head is ~49x45 units but carries the shared icon outline,
// which is LINE px at any size, i.e. LINE*200/size units (~11 units at 160 px). His 6-unit eyes, nose and
// mouth packed into 20 units therefore merge into one ink blob. Fix = bigger head, two tiny eye fills that
// the outline turns into dots, one smile, every gap measured AFTER the outline is added.
// Written by the planner BEFORE the build and protected. Structural only: the planner judges the art from stills.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');

// Single source for the contract numbers; the brief states the same values.
const LINE = 9; // px, mirrors LINE in engine/ink (icons.tsx outline: strokeWidth = LINE * 200 / size)
const MIN_SIZE = 160; // smallest icon size the art must read at
const STROKE = LINE * 200 / MIN_SIZE; // outline width in icon units at MIN_SIZE (11.25)
const CLEAR = STROKE / 2; // minimum visible skin between two inked features, after both outlines
const BOX = 100; // icon art lives in -BOX..BOX on both axes
const SPAN = {x: 90, y: 175}; // man's minimum art extent, unchanged from 2h1-fix
const HEAD = {w: 60, h: 70}; // minimum skin head size (was ~49 x 45)
const EYE = {min: 2, max: 6}; // eye fill width and height in units; the outline makes the visible dot
const SMILE_W = 16; // minimum smile width so it reads as a mouth
const SMILE_DEPTH = {min: 2, max: 12}; // control-point drop below the corners: a curve, not a line or a grin
const ICONS = 'engine/ink/parts/icons.tsx';
const iconCase = (src, name) => {
  const m = src.match(new RegExp(String.raw`case '${name}':([\s\S]*?)(?=case '|default:)`));
  assert.ok(m, `icons.tsx has no case '${name}'`);
  return m[1];
};
// Absolute command points only (M L Q C); the man case is required to use only these (see last test).
// T is excluded: its reflected control point is implicit, so the listed numbers would not bound the curve.
const points = (d) => {
  const out = [];
  for (const seg of d.match(/[A-Za-z][^A-Za-z]*/g) || []) {
    const cmd = seg[0];
    if (!'MLQC'.includes(cmd)) continue;
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
// Each M starts a sub-path; eyes are often two sub-paths in one <path>.
const subRecs = (d) => (d.match(/M[^M]*/g) || []).filter((raw) => points(raw).length).map((raw) => ({raw, ...span(points(raw))}));
const subPaths = subRecs;
const inside = (s, b) => s.x0 >= b.x0 && s.x1 <= b.x1 && s.y0 >= b.y0 && s.y1 <= b.y1;
// The drawn geometry: each sub-path flattened to a polyline (curves sampled), so clearance is measured
// against the real contour, not a bounding box.
const STEPS = 16; // samples per segment; fine enough that a 4-unit eye is ringed by points
const flatten = (d) => {
  const polys = [];
  let cur = null, p = [0, 0], start = [0, 0];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const at = (ctl, t) => { // de Casteljau over [p, ...controls, end]
    let pts = ctl;
    while (pts.length > 1) pts = pts.slice(1).map((q, i) => lerp(pts[i], q, t));
    return pts[0];
  };
  for (const seg of d.match(/[A-Za-z][^A-Za-z]*/g) || []) {
    const c = seg[0];
    const n = (seg.slice(1).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    if (c === 'Z') { if (cur) cur.push(start); p = start; continue; }
    let i = 0;
    if (c === 'M') { p = start = [n[0], n[1]]; cur = [p]; polys.push(cur); i = 2; }
    const k = c === 'Q' ? 4 : c === 'C' ? 6 : 2; // M's extra pairs and L are lines
    for (; i + k - 1 < n.length; i += k) {
      const ctl = [p];
      for (let j = 0; j < k; j += 2) ctl.push([n[i + j], n[i + j + 1]]);
      for (let s = 1; s <= STEPS; s++) cur.push(at(ctl, s / STEPS));
      p = ctl[ctl.length - 1];
    }
  }
  return polys;
};
const segDist = ([px, py], [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
  const t = L2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L2)) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
const distTo = (pt, polys) => Math.min(...polys.flatMap((q) => q.slice(1).map((b, i) => segDist(pt, q[i], b))));
const within = ([x, y], polys) => { // even-odd ray cast against closed polylines
  let odd = false;
  for (const q of polys) for (let i = 1; i < q.length; i++) {
    const [ax, ay] = q[i - 1], [bx, by] = q[i];
    if ((ay > y) !== (by > y) && x < ax + (y - ay) * (bx - ax) / (by - ay)) odd = !odd;
  }
  return odd;
};
// SVG fills with the nonzero rule (default fill-rule), so coverage must use winding numbers: a square traced twice
// is even under even-odd yet fully painted. Edge last -> first is added so open sub-paths close as SVG closes them.
const winding = ([x, y], polys) => {
  let w = 0;
  for (const q of polys) for (let i = 0; i < q.length; i++) {
    const [ax, ay] = q[i], [bx, by] = q[(i + 1) % q.length];
    const side = (bx - ax) * (y - ay) - (x - ax) * (by - ay);
    if (ay <= y && by > y && side > 0) w++;
    else if (ay > y && by <= y && side < 0) w--;
  }
  return w;
};

const face = () => {
  const ps = pathsOf(iconCase(read(ICONS), 'man'));
  const heads = ps.filter((p) => p.fill === '{base(DOODLE.skin)}').map((p) => ({p, ...span(points(p.d))}));
  assert.ok(heads.length, 'man has no skin shape');
  const head = heads.sort((a, b) => (b.y1 - b.y0) - (a.y1 - a.y0))[0];
  // Each sub-path record carries its path index + sub-path index, so a feature is known by identity, not by text.
  const recs = (p) => subRecs(p.d).map((s, si) => ({...s, key: `${ps.indexOf(p)}:${si}`}));
  const ink = ps.filter((p) => p.fill === '{INK}' || p.fill === '{base(INK)}').flatMap(recs);
  const eyes = ink.filter((s) => inside(s, head)).sort((a, b) => a.x0 - b.x0);
  const hat = ink.filter((s) => !inside(s, head));
  const smiles = ps.filter((p) => p.fill === '"none"').flatMap(recs).filter((s) => inside(s, head));
  return {ps, head, eyes, hat, smiles};
};

// Every number must be a plain decimal (-12, 3.5) separated by space/comma: the parsers read only that form,
// so '.5', '1e2', '1.2.3' or '-10-30' run-ons are rejected instead of silently mis-measured.
// Full grammar: every segment is ONE explicit command letter followed by exactly its arity of plain
// decimal numbers (M/L 2, Q 4, C 6, Z 0); path starts with M; no implicit repeats, no malformed tails.
const ARITY = { M: 2, L: 2, Q: 4, C: 6, Z: 0 };
const strictNums = (d) => {
  if (/[^MLQCZ\d\s.-]/.test(d)) return false; // whitespace-only separators: no commas at all
  const toks = d.replace(/([MLQCZ])/g, ' $1 ').split(/\s+/).filter(Boolean);
  if (toks[0] !== 'M') return false;
  for (let i = 0; i < toks.length;) {
    const n = ARITY[toks[i]];
    if (n === undefined) return false;
    for (let k = 1; k <= n; k++) if (!/^-?\d+(?:\.\d+)?$/.test(toks[i + k] || '')) return false;
    i += n + 1;
  }
  return true;
};

test('2h1fix2: man keeps his size inside the box, every filled shape closed', () => {
  const {ps} = face();
  const s = span(ps.flatMap((p) => points(p.d)));
  assert.ok(s.x0 >= -BOX && s.x1 <= BOX && s.y0 >= -BOX && s.y1 <= BOX, `man leaves the box: ${JSON.stringify(s)}`);
  assert.ok(s.x1 - s.x0 >= SPAN.x && s.y1 - s.y0 >= SPAN.y, `man shrank: ${JSON.stringify(s)}`);
  // SVG fills every sub-path as if closed, so EVERY filled sub-path (not only the last) must end with Z,
  // otherwise its implied closing edge is never measured by the contour checks.
  for (const p of ps) if (p.fill !== '"none"') for (const sp of p.d.trim().split(/(?=M)/)) {
    assert.match(sp.trim(), /Z$/, `open filled sub-path: ${sp.slice(0, 40)}`);
  }
  // The man has no paper part: a PAPER fill could only paint over the face, so it is banned outright.
  for (const p of ps) assert.doesNotMatch(p.fill, /PAPER/, `man path uses a PAPER fill: ${p.d.slice(0, 40)}`);
  // Fills are plain palette references only: any other expression (method calls, conditionals) could
  // compute a different colour at render time than the one the test reads.
  for (const p of ps) assert.match(p.fill, /^(?:\{INK\}|\{base\(INK\)\}|\{DOODLE\.[a-z]+\}|\{base\(DOODLE\.[a-z]+\)\}|"none")$/,
    `man fill must be {INK}, {DOODLE.x}, {base(DOODLE.x)} or "none": ${p.fill}`);
});

test('2h1fix2: the head is big enough to carry a face', () => {
  const {head: h} = face();
  assert.ok(h.x1 - h.x0 >= HEAD.w, `head too narrow: ${h.x1 - h.x0} < ${HEAD.w}`);
  assert.ok(h.y1 - h.y0 >= HEAD.h, `head too short: ${h.y1 - h.y0} < ${HEAD.h}`);
});

test('2h1fix2: exactly two small eye fills with clear skin between them', () => {
  const {eyes} = face();
  assert.equal(eyes.length, 2, `expected exactly 2 ink eye fills inside the head, got ${eyes.length}`);
  for (const e of eyes) {
    for (const [k, v] of [['width', e.x1 - e.x0], ['height', e.y1 - e.y0]]) {
      assert.ok(v >= EYE.min && v <= EYE.max, `eye ${k} ${v} outside ${EYE.min}..${EYE.max} (the outline makes the dot)`);
    }
  }
  const {head} = face();
  for (const e of eyes) {
    // Outline-aware clearance from the head's sides and top, so an eye never merges into the head outline.
    const side = Math.min(e.x0 - head.x0, head.x1 - e.x1) - STROKE, top = e.y0 - head.y0 - STROKE;
    assert.ok(side >= CLEAR && top >= CLEAR, `eye touches the head outline: side ${side.toFixed(1)}, top ${top.toFixed(1)} < ${CLEAR}`);
  }
  const [l, r] = eyes;
  const gap = r.x0 - l.x1 - STROKE;
  assert.ok(gap >= STROKE, `eyes merge: visible gap ${gap.toFixed(1)} < ${STROKE}`);
  assert.ok(Math.abs((l.y0 + l.y1) - (r.y0 + r.y1)) / 2 <= EYE.max, 'eyes on one level');
});

test('2h1fix2: no ink outside the head crowds the eye band (hat above, suit below)', () => {
  const {eyes, hat} = face();
  const eyeTop = Math.min(...eyes.map((e) => e.y0)), eyeBottom = Math.max(...eyes.map((e) => e.y1));
  const eyeX0 = Math.min(...eyes.map((e) => e.x0)), eyeX1 = Math.max(...eyes.map((e) => e.x1));
  // Any INK shape whose outlined x-range overlaps the eyes must leave CLEAR skin above or below the eye band,
  // whatever its own extent: a brim that dips across the eyes fails here.
  for (const s of hat.filter((s) => s.x1 + STROKE > eyeX0 && s.x0 - STROKE < eyeX1)) {
    const gap = s.y0 < eyeBottom ? eyeTop - s.y1 - STROKE : s.y0 - eyeBottom - STROKE;
    assert.ok(gap >= CLEAR, `ink shape crowds the eyes: visible gap ${gap.toFixed(1)} < ${CLEAR} (${JSON.stringify(s)})`);
  }
});

test('2h1fix2: exactly one smile, clear of the eyes and the chin', () => {
  const {head, eyes, smiles} = face();
  assert.equal(smiles.length, 1, `expected exactly 1 fill-none smile inside the head, got ${smiles.length}`);
  const [m] = smiles;
  assert.ok(m.x1 - m.x0 >= SMILE_W, `smile too small: ${m.x1 - m.x0} < ${SMILE_W}`);
  const eyeBottom = Math.max(...eyes.map((e) => e.y1));
  const above = m.y0 - eyeBottom - STROKE, below = head.y1 - m.y1 - STROKE;
  assert.ok(above >= CLEAR, `smile crowds the eyes: visible gap ${above.toFixed(1)} < ${CLEAR}`);
  assert.ok(below >= CLEAR, `smile merges with the chin: visible gap ${below.toFixed(1)} < ${CLEAR}`);
  // Shape: one open quadratic curve that bends down (SVG y grows downward), so lines and zigzags fail.
  const N = String.raw`(-?\d+(?:\.\d+)?)`, S = String.raw`[\s,]+`;
  const q = m.raw.trim().match(new RegExp(String.raw`^M\s*${N}${S}${N}\s*Q\s*${N}${S}${N}${S}${N}${S}${N}$`));
  assert.ok(q, `smile must be exactly "M x y Q cx cy x y": ${m.raw.trim()}`);
  const [ax, , cx, , bx] = [1, 2, 3, 4, 5].map((i) => Number(q[i]));
  // Endpoints themselves are SMILE_W apart with the control between them, so a retraced line fails.
  assert.ok(Math.abs(bx - ax) >= SMILE_W, `smile endpoints only ${Math.abs(bx - ax)} apart (< ${SMILE_W})`);
  assert.ok(cx > Math.min(ax, bx) && cx < Math.max(ax, bx), 'smile control point must sit between its endpoints');
  const depth = Number(q[4]) - Math.max(Number(q[2]), Number(q[6]));
  assert.ok(depth >= SMILE_DEPTH.min && depth <= SMILE_DEPTH.max, `smile depth ${depth} outside ${SMILE_DEPTH.min}..${SMILE_DEPTH.max} (must bend down)`);
  const left = m.x0 - head.x0 - STROKE, right = head.x1 - m.x1 - STROKE;
  assert.ok(left >= CLEAR && right >= CLEAR, `smile touches the head outline: side gaps ${left.toFixed(1)}/${right.toFixed(1)} < ${CLEAR}`);
});

test('2h1fix2: eyes and smile sit inside the real head contour, clear of its outline', () => {
  const {head, eyes, smiles} = face();
  const contour = flatten(head.p.d);
  for (const f of [...eyes, ...smiles]) {
    for (const pt of flatten(f.raw).flat()) {
      assert.ok(within(pt, contour), `face feature point ${pt.map((v) => v.toFixed(1))} lies outside the head contour`);
      const gap = distTo(pt, contour) - STROKE;
      assert.ok(gap >= CLEAR, `face feature touches the head outline: visible gap ${gap.toFixed(1)} < ${CLEAR} at ${pt.map((v) => v.toFixed(1))}`);
    }
  }
});

test('2h1fix2: no other shape (any fill, highlight included) covers or crowds the eyes and smile', () => {
  const src = iconCase(read(ICONS), 'man');
  const {ps, head, eyes, smiles} = face();
  const feats = [...eyes, ...smiles];
  // Exclude only the feature records themselves (by path/sub-path identity): a duplicate of an eye in another
  // fill (e.g. a PAPER copy painted over it) is a different record and must be checked.
  const own = new Set(feats.map((f) => f.key));
  const hl = (src.match(/highlight\s*=\s*'([^']*)'/) || [])[1] || '';
  const others = ps.filter((p) => p !== head.p).flatMap((p) => subRecs(p.d).map((s, si) => ({...s, key: `${ps.indexOf(p)}:${si}`, filled: p.fill !== '"none"'})))
    .concat(subRecs(hl).map((s) => ({...s, key: 'highlight', filled: false}))).filter((s) => !own.has(s.key));
  for (const o of others) {
    const poly = flatten(o.raw);
    for (const pt of feats.flatMap((f) => flatten(f.raw).flat())) {
      assert.ok(!(o.filled && winding(pt, poly) !== 0), `a filled shape covers the face at ${pt.map((v) => v.toFixed(1))}: ${o.raw.slice(0, 40)}`);
      const gap = distTo(pt, poly) - STROKE;
      assert.ok(gap >= CLEAR, `shape crowds the face: visible gap ${gap.toFixed(1)} < ${CLEAR}: ${o.raw.slice(0, 40)}`);
    }
  }
});

test('2h1fix2: man uses absolute M L Q C Z only; face case untouched; ASCII-only', () => {
  const src = read(ICONS);
  for (const p of pathsOf(iconCase(src, 'man'))) {
    assert.doesNotMatch(p.d, /[^MLQCZ\d\s.,-]/, `man path uses a command the contract cannot measure: ${p.d.slice(0, 40)}`);
  }
  // The highlight is a drawn PAPER stroke too: same absolute-command whitelist, and it must parse into real geometry.
  const hl = (iconCase(src, 'man').match(/highlight\s*=\s*'([^']*)'/) || [])[1];
  assert.ok(hl && /^\s*M/.test(hl), 'man highlight is a single-quoted string starting with absolute M');
  assert.doesNotMatch(hl, /[^MLQCZ\d\s.,-]/, `man highlight uses a command the contract cannot measure: ${hl}`);
  assert.ok(subRecs(hl).length >= 1, 'man highlight parses into at least one measured sub-path');
  for (const d of [...pathsOf(iconCase(src, 'man')).map((p) => p.d), hl]) {
    assert.ok(strictNums(d), `man path is not well-formed (one explicit M/L/Q/C/Z per segment with exactly 2/2/4/6/0 plain numbers like -12 or 3.5, space-separated, no commas): ${d.slice(0, 40)}`);
  }
  assert.match(iconCase(src, 'face'), /M-61 -37 Q-65 -79 -5 -81/, 'face art is from 2h1-fix and stays');
  const bad = [...src].find((ch) => ch.charCodeAt(0) > 127);
  assert.equal(bad, undefined, 'icons.tsx ASCII-only');
});

test('2h1fix2: the head is painted before the eyes and smile (nothing paints over the face)', () => {
  // SVG paints in source order: a head path after the features would cover them completely.
  const {ps, head} = face();
  const hi = ps.indexOf(head.p);
  ps.forEach((p, i) => {
    const isInk = p.fill === '{INK}' || p.fill === '{base(INK)}';
    const feature = (isInk ? subPaths(p.d) : p.fill === '"none"' ? subRecs(p.d) : []).some((s) => inside(s, head));
    if (feature) assert.ok(i > hi, `face path ${i} is painted before the head (${hi}): ${p.d.slice(0, 40)}`);
  });
});

test('2h1fix2: man case is bare paths only: no render overrides that could hide the face', () => {
  // Whitelist: each path carries exactly d + fill. Strip those; only the art/highlight/break scaffold may remain.
  // This bans opacity, visibility, style, transform, clip/mask/filter, wrapping groups and conditionals.
  const body = iconCase(read(ICONS), 'man');
  const rest = body
    .replace(/<path d="[^"]*" fill=(?:\{[A-Za-z.()]+\}|"none")\/>/g, '')
    .replace(/highlight = '[^']*';/, '')
    .replace(/\s+/g, '');
  assert.equal(rest, 'art=<></>;break;', `man case has extra markup or attributes: ${rest.slice(0, 80)}`);
});
