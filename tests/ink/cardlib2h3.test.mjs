// Card library job 2h3 contract (brief docs/briefs/ink-card-lib-2h3.md): two new doodle icons, `arrow`
// and `bentarrow`, shown inside a real layout in demo2 (both sides of a split). Written by the planner
// BEFORE the build and protected. Structural only: the planner judges the art from stills.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');

// Single source for the contract numbers; the brief states the same values.
const SHOT = 90; // demo shot length
const ENTRY = 6; // layout enters at shot.f0 + ENTRY
const NEW_ICONS = ['arrow', 'bentarrow'];
const PREV_ICONS = 23; // IconName size after job 2h2
const PREV_SHOTS = 14; // demo2 shots owned by jobs 2b..2h2; 2h3 appends after them
const PREV_SHOTS_SHA = '075cf64407f8249210d0280e148851a429473039cb72f8750ccc4c127016c207'; // sha256(JSON.stringify(shots 0..13)) on main before 2h3
const ICONS_MAIN_SHA = 'b2716ccf20ad8fdce62a326b9bd508b6200bd127fb06042a262e6e9bc6790a51'; // sha256 of icons.tsx (LF) on main before 2h3 (incl. merged 2h1fix2 man)
const SHOT_IDX = PREV_SHOTS; // the split shot 2h3 appends
const MIN_SUB = {arrow: 3, bentarrow: 3}; // the one filled body + at least two fill-none strokes (speed lines / ticks)
const MAX_STROKES = {arrow: 2, bentarrow: 2}; // exactly this many fill-none sub-paths (targets: 2 speed lines, 2 ticks)
const MAX_STROKE_LEN = 45; // per fill-none sub-path; target strokes are about 35 (arrow) and 22 (bentarrow)
// The wrapper outlines every shape with LINE (9 px at any size) = 9*200/160 icon units at the 160 px card size.
// Mirrors LINE in engine/ink/compositions/InkProof.tsx and the 2h1fix2 contract; change together.
const LINE = 9, CARD_PX = 160;
const STROKE = (LINE * 200) / CARD_PX; // 11.25
const CLEAR = STROKE / 2; // visible paper between an extra stroke and the body outline
const BOX = 100; // icon art lives in -BOX..BOX on both axes
// Minimum art extent (box is 200). The straight arrow is long and flat; the bent arrow fills the box.
const SPAN = {arrow: {x: 170, y: 70}, bentarrow: {x: 150, y: 150}};
const MAX_Y_SPAN = {arrow: 130}; // a straight arrow taller than this reads as a blob, not an arrow
const MIN_TURNS = {bentarrow: 2}; // direction changes along the bent body (a zigzag, not a curve)
const MIN_LEG = 30; // every zigzag leg of the bentarrow highlight moves at least this far in y (a real bend, not a wiggle)
const MAX_FILL = 0.45; // bentarrow body area / its bbox area: a zigzag band, not a block (target body is about 0.39)
const MIN_FILL = 0.2; // each body area / its bbox area at least this: a real filled shape, not a zero-area retrace (targets ~0.41 arrow, ~0.39 bent)
// Arrowhead taper, measured as the body's vertical thickness (outline-free) on vertical slices x = tip - k:
const TAPER = [[10, 0.3], [30, 0.65]]; // at tip-10 at most 0.3 of the widest head slice, at tip-30 at most 0.65 (target 0.16 / 0.48)
const HEAD_REACH = 70; // the head's widest slice is searched in tip-HEAD_REACH..tip
const HEAD_OVER_SHAFT = 1.5; // widest head slice at least this times the shaft slice at the body's x middle (target 88 vs 35)
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
// Flatten absolute M L Q C Z into sampled points per sub-path (for containment checks).
const FLAT = 12; // samples per segment
const flatten = (d) => {
  const subs = [];
  let cur = null, at = null, start = null;
  for (const seg of d.match(/[A-Za-z][^A-Za-z]*/g) || []) {
    const n = (seg.slice(1).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    const c = seg[0];
    if (c === 'M') { cur = [[n[0], n[1]]]; subs.push(cur); at = [n[0], n[1]]; start = at; continue; }
    if (!cur) continue;
    // Z draws a straight closing edge back to the sub-path start (stroked even when fill is none), then
    // the current point returns there: sample it like an L so closing strokes are measured too.
    if (c === 'Z') {
      for (let k = 1; k <= FLAT; k++) { const t = k / FLAT; cur.push([at[0] + (start[0] - at[0]) * t, at[1] + (start[1] - at[1]) * t]); }
      at = start; continue;
    }
    const step = c === 'L' ? 2 : c === 'Q' ? 4 : 6;
    for (let i = 0; i + step - 1 < n.length; i += step) {
      const q = n.slice(i, i + step);
      for (let k = 1; k <= FLAT; k++) {
        const t = k / FLAT, u = 1 - t;
        let x, y;
        if (c === 'L') { x = at[0] + (q[0] - at[0]) * t; y = at[1] + (q[1] - at[1]) * t; }
        else if (c === 'Q') { x = u * u * at[0] + 2 * u * t * q[0] + t * t * q[2]; y = u * u * at[1] + 2 * u * t * q[1] + t * t * q[3]; }
        else { x = u ** 3 * at[0] + 3 * u * u * t * q[0] + 3 * u * t * t * q[2] + t ** 3 * q[4]; y = u ** 3 * at[1] + 3 * u * u * t * q[1] + 3 * u * t * t * q[3] + t ** 3 * q[5]; }
        cur.push([x, y]);
      }
      at = [q[step - 2], q[step - 1]];
    }
  }
  return subs;
};
const segDist = ([px, py], [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
  const t = L2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L2)) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
// Distance to a filled polygon's contour, closing edge included (SVG closes every filled sub-path).
const contourDist = (pt, poly) => Math.min(...poly.map((b, i) => segDist(pt, poly[i ? i - 1 : poly.length - 1], b)));
// Painted = SVG's default nonzero fill rule (winding number), not even-odd: a body traced twice is fully painted.
// Vertical thickness of a filled polygon on the line x = X: span of its edge crossings (0 if it misses).
const thickAt = (poly, X) => {
  const ys = [];
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i], [bx, by] = poly[(i + 1) % poly.length];
    if ((ax - X) * (bx - X) <= 0 && ax !== bx) ys.push(ay + ((X - ax) * (by - ay)) / (bx - ax));
  }
  return ys.length ? Math.max(...ys) - Math.min(...ys) : 0;
};
// Simple closed contour: no two non-adjacent edges touch, cross or overlap (a retraced branch shares its
// edges, gets the shared outline and draws a frame while adding zero fill). Consecutive duplicate points
// (and the Z sample landing back on the start) are dropped first.
const EPS = 1e-9;
const orient = (a, b, c) => { const v = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); return Math.abs(v) < EPS ? 0 : Math.sign(v); };
const onSeg = (a, b, p) => Math.min(a[0], b[0]) - EPS <= p[0] && p[0] <= Math.max(a[0], b[0]) + EPS && Math.min(a[1], b[1]) - EPS <= p[1] && p[1] <= Math.max(a[1], b[1]) + EPS;
const segsTouch = (a, b, c, d) => {
  const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
  if (o1 !== o2 && o3 !== o4 && o1 * o2 <= 0 && o3 * o4 <= 0) return true;
  return (o1 === 0 && onSeg(a, b, c)) || (o2 === 0 && onSeg(a, b, d)) || (o3 === 0 && onSeg(c, d, a)) || (o4 === 0 && onSeg(c, d, b));
};
const simpleClosed = (poly) => {
  const p = poly.filter((q, i) => i === 0 || Math.hypot(q[0] - poly[i - 1][0], q[1] - poly[i - 1][1]) > EPS);
  while (p.length > 1 && Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]) <= EPS) p.pop();
  const n = p.length;
  if (n < 3) return false;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    if (j === i + 1 || (i === 0 && j === n - 1)) continue; // neighbours share one endpoint
    if (segsTouch(p[i], p[(i + 1) % n], p[j], p[(j + 1) % n])) return false;
  }
  return true;
};
const insidePoly = ([x, y], poly) => {
  let w = 0;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i], [bx, by] = poly[(i + 1) % poly.length];
    const side = (bx - ax) * (y - ay) - (x - ax) * (by - ay);
    if (ay <= y && by > y && side > 0) w++;
    else if (ay > y && by <= y && side < 0) w--;
  }
  return w !== 0;
};

// Every number must be a plain decimal (-12, 3.5) separated by spaces only: the parsers read only that form,
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

test('2h3: IconName gains arrow and bentarrow, keeps every earlier name', () => {
  const src = read(ICONS);
  const m = src.match(/export type IconName\s*=([^;]+);/);
  assert.ok(m, 'export type IconName missing');
  const names = [...m[1].matchAll(/'([a-z]+)'/g)].map((x) => x[1]);
  assert.equal(new Set(names).size, names.length, 'duplicate IconName');
  for (const n of NEW_ICONS) assert.ok(names.includes(n), `IconName has no ${n}`);
  assert.ok(names.length >= PREV_ICONS + NEW_ICONS.length, `IconName lost names (${names.length})`);
});

test('2h3: each arrow is a real doodle: base() fill, enough parts, one paper highlight, paths only', () => {
  const src = read(ICONS);
  for (const n of NEW_ICONS) {
    const body = iconCase(src, n);
    assert.match(body, /fill=\{base\(/, `${n} main fill must go through base() so colour overrides work`);
    // Exactly ONE filled shape (the body, a DOODLE colour through base()); every extra part is a fill-none stroke.
    // A second fill (INK band, PAPER cover) could paint over the body or the glint unmeasured.
    const fills = pathsOf(body).map((p) => p.fill);
    assert.equal(fills.filter((f) => f !== '"none"').length, 1, `${n} must have exactly one filled path: ${fills}`);
    for (const f of fills) assert.match(f, /^(?:\{base\(DOODLE\.[a-z]+\)\}|"none")$/, `${n} fill must be {base(DOODLE.x)} or "none": ${f}`);
    const parts = (body.match(/<path\b/g) || []).length;
    const subpaths = (body.match(/\bd="[^"]*"/g) || []).join(' ').match(/M-?\d/g) || [];
    assert.ok(parts >= 2 && subpaths.length >= MIN_SUB[n], `${n} too crude: ${parts} paths, ${subpaths.length} sub-paths`);
    const hl = body.match(/highlight\s*=\s*'([^']*)'/);
    assert.ok(hl && hl[1].trim().length > 0, `${n} needs the shared paper highlight`);
    assert.doesNotMatch(body, /<rect\b|<circle\b|<ellipse\b/, `${n}: hand-drawn paths only`);
    assert.doesNotMatch(body, /strokeWidth/, `${n}: the wrapper owns the outline`);
  }
  assert.match(src, /default:[\s\S]*throw/, 'unknown names still throw');
});

test('2h3: arrows fill the icon box, stay inside it, every filled shape closed', () => {
  const src = read(ICONS);
  for (const n of NEW_ICONS) {
    const body = iconCase(src, n);
    const ps = pathsOf(body);
    // The highlight string is drawn by the wrapper as a fill-none path; measure it with the art.
    const hl = (body.match(/highlight\s*=\s*'([^']*)'/) || [])[1];
    if (hl) ps.push({d: hl, fill: '"none"'});
    const pts = ps.flatMap((p) => points(p.d));
    assert.ok(pts.length > 0, `${n} has no drawable points`);
    const all = (k) => pts.map((p) => p[k]);
    assert.ok(Math.min(...all(0)) >= -BOX && Math.max(...all(0)) <= BOX && Math.min(...all(1)) >= -BOX && Math.max(...all(1)) <= BOX,
      `${n} leaves the box`);
    // Size is the filled BODY's drawn extent (flattened curves), so stray strokes or control points cannot pad it.
    const bodyPath = ps.find((p) => p.fill.includes('base('));
    assert.ok(bodyPath, `${n} has no base() body`);
    // ONE closed sub-path: SVG sums winding across sub-paths, so a second (e.g. reversed) copy in the same d
    // could cancel the colour while every per-sub-path containment check still passed.
    assert.equal((bodyPath.d.match(/M/g) || []).length, 1, `${n}: body must be exactly one sub-path (one M): ${bodyPath.d.slice(0, 40)}`);
    assert.equal((bodyPath.d.match(/Z/g) || []).length, 1, `${n}: body must close exactly once (one Z, at the end)`);
    const bp = flatten(bodyPath.d).flat();
    const xs = bp.map((p) => p[0]), ys = bp.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    assert.ok(x1 - x0 >= SPAN[n].x, `${n} too narrow: ${x1 - x0} < ${SPAN[n].x}`);
    assert.ok(y1 - y0 >= SPAN[n].y, `${n} too short: ${y1 - y0} < ${SPAN[n].y}`);
    if (MAX_Y_SPAN[n]) assert.ok(y1 - y0 <= MAX_Y_SPAN[n], `${n} too tall for a straight arrow: ${y1 - y0}`);
    for (const p of ps) {
      // Only absolute M L Q C Z, so the measured points ARE the drawn geometry (no relative/H/V/arc/T drift).
      assert.doesNotMatch(p.d, /[^MLQCZ\d\s.,-]/, `${n}: path uses a command the contract cannot measure: ${p.d.slice(0, 40)}`);
      assert.ok(strictNums(p.d), `${n}: path is not well-formed (one explicit M/L/Q/C/Z per segment with exactly 2/2/4/6/0 plain numbers like -12 or 3.5, space-separated, no commas): ${p.d.slice(0, 40)}`);
      if (p.fill === '"none"') continue;
      for (const sub of p.d.match(/M[^M]*/g) || []) {
        assert.match(sub.trim(), /Z$/, `${n}: filled sub-path is open (sliver): ${sub.slice(0, 40)}`);
      }
    }
    assert.doesNotMatch(body, /\btransform\s*=/, `${n}: no transforms, the box check measures raw coordinates`);
  }
});

test('2h3: the straight arrow points right; the bent arrow zigzags', () => {
  const src = read(ICONS);
  // Straight: the main base() shape's rightmost point (the tip) sits near the vertical middle of that shape.
  const main = (n) => pathsOf(iconCase(src, n)).find((p) => p.fill.includes('base('));
  const a = points(main('arrow').d);
  const ax = a.map((p) => p[0]), ay = a.map((p) => p[1]);
  const tip = a[ax.indexOf(Math.max(...ax))];
  const mid = (Math.min(...ay) + Math.max(...ay)) / 2;
  assert.ok(Math.abs(tip[1] - mid) <= (Math.max(...ay) - Math.min(...ay)) / 4, `arrow tip ${tip} is not a centred point (mid y ${mid})`);
  // A real arrowhead tapers to the tip (a blunt mallet head with a one-unit point fails at 160 px).
  const apoly = flatten(main('arrow').d)[0];
  let head = 0;
  for (let k = 1; k <= HEAD_REACH; k++) head = Math.max(head, thickAt(apoly, tip[0] - k));
  for (const [k, r] of TAPER) {
    const t = thickAt(apoly, tip[0] - k);
    assert.ok(t <= r * head, `arrow is ${t.toFixed(1)} thick at tip-${k}, > ${r} of its widest head slice ${head.toFixed(1)}: not a tapered arrowhead`);
  }
  const shaft = thickAt(apoly, (Math.min(...ax) + tip[0]) / 2);
  assert.ok(head >= HEAD_OVER_SHAFT * shaft, `arrow head ${head.toFixed(1)} is not ${HEAD_OVER_SHAFT}x wider than its shaft ${shaft.toFixed(1)}`);
  // Both bodies are real filled shapes: a forward+reverse retrace has ~zero area and paints nothing.
  for (const n of NEW_ICONS) for (const poly of flatten(main(n).d)) {
    assert.ok(simpleClosed(poly), `${n} body is not a simple closed contour (edges cross, touch or retrace each other)`);
    let ar = 0;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) ar += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
    const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
    const bx = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    assert.ok(Math.abs(ar) / 2 >= MIN_FILL * bx, `${n} body covers only ${(Math.abs(ar) / 2 / bx).toFixed(2)} of its box < ${MIN_FILL}: retraced or degenerate`);
  }
  // Bent: the paper highlight runs along the body's centre line (a fill-none ink spine would draw a thick
  // black line through the body); its y direction must flip at least MIN_TURNS times.
  const hl = (iconCase(src, 'bentarrow').match(/highlight\s*=\s*'([^']*)'/) || [])[1] || '';
  const sp = points(hl);
  assert.ok(sp.length >= 4, 'bentarrow highlight must follow the zigzag body with at least 4 points (see brief)');
  let turns = 0, dir = 0;
  for (let i = 1; i < sp.length; i++) {
    const d = Math.sign(sp[i][1] - sp[i - 1][1]);
    if (d && dir && d !== dir) turns++;
    if (d) dir = d;
  }
  assert.ok(turns >= MIN_TURNS.bentarrow, `bentarrow highlight turns ${turns} < ${MIN_TURNS.bentarrow}`);
  for (let i = 1; i < sp.length; i++) {
    assert.ok(Math.abs(sp[i][1] - sp[i - 1][1]) >= MIN_LEG, `bentarrow highlight leg ${i} moves ${Math.abs(sp[i][1] - sp[i - 1][1])} < ${MIN_LEG} in y`);
  }
  // The glint must ride INSIDE the main base() body, so the body itself bends (a zigzag glint on a straight bar fails).
  const body = flatten(main('bentarrow').d);
  // The body is a bent band, not a block: its area is a small share of its own bounding box.
  for (const poly of body) {
    let area = 0;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) area += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
    const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
    const box = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    assert.ok(Math.abs(area) / 2 <= MAX_FILL * box, `bentarrow body fills ${(Math.abs(area) / 2 / box).toFixed(2)} of its box > ${MAX_FILL}: a block, not a bent band`);
  }
  for (const pt of flatten(hl).flat()) {
    assert.ok(body.some((poly) => insidePoly(pt, poly)), `bentarrow highlight point ${pt.map((v) => v.toFixed(1))} is outside the main body`);
  }
  // It ends in a real arrowhead: rotate the body into the frame of the glint's LAST leg (x' along it), then
  // apply the straight arrow's slice rules: the tip is the point furthest along that leg, the head tapers
  // to it (TAPER[0]) and its widest slice in tip-HEAD_REACH..tip is HEAD_OVER_SHAFT x the band slice at
  // tip-HEAD_REACH (target 66 vs 34; a band that just ends in a point has no shoulders and fails).
  const [la, lb] = sp.slice(-2), ll = Math.hypot(lb[0] - la[0], lb[1] - la[1]);
  const ux = (lb[0] - la[0]) / ll, uy = (lb[1] - la[1]) / ll;
  const rpoly = body[0].map(([x, y]) => [x * ux + y * uy, -x * uy + y * ux]);
  const rtip = Math.max(...rpoly.map((q) => q[0]));
  let bhead = 0;
  for (let k = 1; k < HEAD_REACH; k++) bhead = Math.max(bhead, thickAt(rpoly, rtip - k));
  const neck = thickAt(rpoly, rtip - HEAD_REACH);
  assert.ok(bhead >= HEAD_OVER_SHAFT * neck, `bentarrow head ${bhead.toFixed(1)} is not ${HEAD_OVER_SHAFT}x its band ${neck.toFixed(1)}: no arrowhead shoulders`);
  assert.ok(thickAt(rpoly, rtip - TAPER[0][0]) <= TAPER[0][1] * bhead, 'bentarrow head does not taper to its tip');
});

test('2h3: extra strokes stay off the body; the bent glint is straight segments', () => {
  const src = read(ICONS);
  for (const n of NEW_ICONS) {
    const ps = pathsOf(iconCase(src, n));
    const body = flatten(ps.find((p) => p.fill.includes('base(')).d);
    // Bounded decoration: exactly MAX_STROKES fill-none sub-paths, each at most MAX_STROKE_LEN long, and
    // separate strokes keep CLEAR paper between their outlines (no stack of strokes merging into a patch).
    const subs = ps.filter((q) => q.fill === '"none"').flatMap((p) => flatten(p.d));
    assert.equal(subs.length, MAX_STROKES[n], `${n}: needs exactly ${MAX_STROKES[n]} fill-none strokes, has ${subs.length}`);
    for (const s of subs) {
      let len = 0;
      for (let i = 1; i < s.length; i++) len += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
      assert.ok(len > 0 && len <= MAX_STROKE_LEN, `${n}: stroke length ${len.toFixed(1)} not in (0, ${MAX_STROKE_LEN}]`);
    }
    for (let i = 0; i < subs.length; i++) for (let j = i + 1; j < subs.length; j++) {
      const d = Math.min(...subs[i].flatMap((a) => subs[j].map((b) => Math.hypot(a[0] - b[0], a[1] - b[1]))));
      assert.ok(d - STROKE >= CLEAR, `${n}: strokes ${i} and ${j} merge: visible gap ${(d - STROKE).toFixed(1)} < ${CLEAR}`);
    }
    for (const p of ps.filter((q) => q.fill === '"none"')) {
      for (const pt of flatten(p.d).flat()) {
        assert.ok(!body.some((poly) => insidePoly(pt, poly)), `${n}: stroke point ${pt.map((v) => v.toFixed(1))} lies on the body`);
        // Both outlines spill STROKE/2 each side: centre-line gap minus STROKE must leave CLEAR paper.
        const gap = Math.min(...body.map((poly) => contourDist(pt, poly))) - STROKE;
        assert.ok(gap >= CLEAR, `${n}: stroke crowds the body: visible gap ${gap.toFixed(1)} < ${CLEAR}: ${p.d.slice(0, 40)}`);
      }
    }
  }
  // The zigzag glint is a spine of straight legs: curves could bulge outside between their sampled ends.
  const hl = (iconCase(src, 'bentarrow').match(/highlight\s*=\s*'([^']*)'/) || [])[1] || '';
  assert.match(hl, /^M[\d\s.-]+(?:L[\d\s.-]+)+$/, `bentarrow highlight must be M then L segments only: ${hl}`);
});

// The highlight is a PAPER stroke (width STROKE) painted over the body by the wrapper. Bounded so it stays
// a glint: ONE sub-path, limited drawn length, every sampled point inside the body (nonzero) and at least
// HL_CLEAR from the body contour, so the paper never eats the ink outline or spills onto the background.
const HL_CLEAR = STROKE / 2; // paper half-width: its edge stops at the outline centre at worst
const MAX_HL_LEN = {arrow: 90, bentarrow: 200}; // target glints are about 60 and 180 long
test('2h3: each highlight is one short glint inside the body, clear of its outline', () => {
  const src = read(ICONS);
  for (const n of NEW_ICONS) {
    const body = iconCase(src, n);
    const hl = (body.match(/highlight\s*=\s*'([^']*)'/) || [])[1] || '';
    assert.ok(strictNums(hl), `${n}: highlight is not well-formed: ${hl.slice(0, 40)}`);
    assert.equal((hl.match(/M/g) || []).length, 1, `${n}: highlight must be exactly one sub-path: ${hl.slice(0, 40)}`);
    assert.doesNotMatch(hl, /Z/, `${n}: highlight is an open glint stroke, no Z`);
    const main = flatten(pathsOf(body).find((p) => p.fill.includes('base(')).d);
    const line = flatten(hl)[0] || [];
    let len = 0;
    for (let i = 1; i < line.length; i++) len += Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
    assert.ok(len > 0 && len <= MAX_HL_LEN[n], `${n}: highlight length ${len.toFixed(1)} not in (0, ${MAX_HL_LEN[n]}]`);
    for (const pt of line) {
      assert.ok(main.some((poly) => insidePoly(pt, poly)), `${n}: highlight point ${pt.map((v) => v.toFixed(1))} is outside the body`);
      const gap = Math.min(...main.map((poly) => contourDist(pt, poly)));
      assert.ok(gap >= HL_CLEAR, `${n}: highlight ${gap.toFixed(1)} from the body outline < ${HL_CLEAR}`);
    }
  }
});

test('2h3: demo2 appends one split shot arrow vs bentarrow; contiguous, no back-to-back', () => {
  const p = JSON.parse(read('engine/ink/parts/cardlib/demo2.json'));
  assert.ok(p.shots.length >= PREV_SHOTS + 1, 'split shot appended');
  assert.equal(p.f1, p.shots.length * SHOT);
  p.shots.forEach((s, i) => {
    assert.equal(s.f0, i * SHOT, `shot ${i} f0`);
    assert.equal(s.f1, (i + 1) * SHOT, `shot ${i} f1`);
    assert.deepEqual(s.bg, {card: true}, `shot ${i} bg`);
    if (i > 0) assert.notEqual(mainLayout(s).t, mainLayout(p.shots[i - 1]).t, `shots ${i - 1} and ${i} repeat a layout`);
  });
  assert.equal(mainLayout(p.shots[13]).b.icon, 'chair', '2h2 transform shot untouched');
  const s = p.shots[SHOT_IDX];
  const sp = mainLayout(s);
  assert.equal(sp.t, 'split');
  assert.equal(sp.left.icon, 'arrow');
  assert.equal(sp.right.icon, 'bentarrow');
  assert.equal(sp.left.label, 'HONEST');
  assert.equal(sp.right.label, 'CROOKED');
  assert.equal(sp.at, s.f0 + ENTRY);
  // Exact timing and shape: a large step (e.g. 900) would push the CROOKED side past the shot end, so the
  // review stills at 1300/1340 would show one icon. Only the brief's keys, with the brief's values.
  assert.equal(sp.step, 12, 'split step must be 12 (both sides entered well before frame 1300)');
  assert.equal(sp.vs, 'VS');
  assert.deepEqual(Object.keys(sp).sort(), ['at', 'left', 'right', 'step', 't', 'vs'], 'split keys');
  assert.deepEqual(Object.keys(sp.left).sort(), ['icon', 'label'], 'left keys');
  assert.deepEqual(Object.keys(sp.right).sort(), ['icon', 'label'], 'right keys');
  assert.deepEqual(s.els.length, 1, 'shot 14 has exactly one element');
  // The WHOLE shot equals the brief's literal (no extra shot keys such as cam that zoom the card offscreen),
  // the file's top level keeps exactly its keys, and shots 0..13 are unchanged (sha256 of their JSON on main
  // before 2h3, so nothing earlier can be re-cammed or retimed either).
  assert.deepEqual(s, {f0: 1260, f1: 1350, bg: {card: true}, els: [{t: 'split', step: 12, left: {icon: 'arrow', label: 'HONEST'}, right: {icon: 'bentarrow', label: 'CROOKED'}, vs: 'VS', at: 1266}]}, 'shot 14 is exactly the brief literal');
  assert.deepEqual(Object.keys(p).sort(), ['f0', 'f1', 'part', 'shots'], 'demo2 top-level keys');
  assert.equal(p.part, 'cardlib2');
  assert.equal(p.f0, 0);
  assert.equal(p.shots.length, PREV_SHOTS + 1, 'exactly one shot appended');
  assert.equal(createHash('sha256').update(JSON.stringify(p.shots.slice(0, PREV_SHOTS))).digest('hex'), PREV_SHOTS_SHA, 'shots 0-13 changed');
  assert.ok(sp.at + 2 * sp.step + 4 < 1300, 'every split part finished entering before the first review frame');
});

test('2h3: icons.tsx changes ONLY by the IconName addition and the two new cases before default:', () => {
  // Remove exactly the permitted additions; what is left must be byte-identical to main (line endings
  // normalised), so the shared wrapper <g>, base(), other cases and the switch stay untouched (no
  // opacity/transform/conditional on the wrapper that could hide the new icons).
  const src = read('engine/ink/parts/icons.tsx').replace(/\r\n/g, '\n');
  const add = "| 'chair' | 'arrow' | 'bentarrow';";
  assert.equal(src.split(add).length, 2, 'IconName gains exactly arrow then bentarrow right after chair');
  const a = src.indexOf("    case 'arrow':"), b = src.indexOf("    case 'bentarrow':"), d = src.indexOf('    default:');
  assert.ok(a > 0 && a < b && b < d, "case 'arrow' then case 'bentarrow' sit directly before default:");
  const restAll = src.slice(0, a).replace(add, "| 'chair';") + src.slice(d);
  assert.equal(createHash('sha256').update(restAll).digest('hex'), ICONS_MAIN_SHA, 'icons.tsx changed outside the two new cases and the IconName addition');
});

test('2h3: arrow cases are bare paths only: no render overrides that could hide the art', () => {
  // Whitelist: each path carries exactly d + fill (either order; house style is fill first). Strip those; only the art/highlight/break scaffold may remain.
  for (const n of NEW_ICONS) {
    const rest = iconCase(read(ICONS), n)
      .replace(/<path (?:d="[^"]*" fill=(?:\{[A-Za-z.()]+\}|"none")|fill=(?:\{[A-Za-z.()]+\}|"none") d="[^"]*")\/>/g, '')
      .replace(/highlight = '[^']*';/, '')
      .replace(/\s+/g, '');
    assert.equal(rest, 'art=<></>;break;', `${n} case has extra markup or attributes: ${rest.slice(0, 80)}`);
  }
});

test('2h3: icons.tsx stays ASCII-only', () => {
  const bad = [...read(ICONS)].find((ch) => ch.charCodeAt(0) > 127);
  assert.equal(bad, undefined, `icons.tsx has non-ASCII ${JSON.stringify(bad)}`);
});
