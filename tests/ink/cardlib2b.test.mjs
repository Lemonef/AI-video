// Card library job 2b contract (brief docs/briefs/ink-card-lib-2b.md): the `doc` layout, in its own files.
// Written by the planner BEFORE the build and protected. The pure layout module is bundled with esbuild and
// called for real, so the throws and timings are checked by behaviour, not by reading source text.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildSync} from 'esbuild';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');

// Single source for the contract numbers; the brief states the same values.
const SHOT = 90; // demo shot length
const ENTRY = 6; // doc enters at shot.f0 + ENTRY
const TAIL = 6; // every doc animation ends at least TAIL frames before its shot ends
const LABEL = 70, CHAR_WIDTH = 0.55; // mirror of layouts/tokens.ts (test 1 pins them); change together
const DOC_KINDS = ['card', 'certificate', 'memo'];
const LAYOUT = 'engine/ink/parts/layouts/docLayout.ts';
const DOC = 'engine/ink/parts/layouts/doc.tsx';
const TOKENS = 'engine/ink/parts/layouts/tokens.ts';
const TOUCHED = [TOKENS, LAYOUT, DOC, 'engine/ink/parts/cards.tsx', 'engine/ink/parts/schema.ts',
  'engine/ink/parts/elements.tsx', 'engine/ink/compositions/CardLibrary2.tsx', 'engine/ink/Root.tsx'];

let mod;
const load = async () => {
  if (mod) return mod;
  assert.ok(existsSync(new URL(LAYOUT, ROOT)), `${LAYOUT} missing`);
  const out = buildSync({entryPoints: [fileURLToPath(new URL(LAYOUT, ROOT))], bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent'});
  mod = await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);
  return mod;
};
const base = (o = {}) => ({t: 'doc', x: 960, y: 540, w: 900, h: 500, kind: 'card', title: 'PASS', lines: ['ONE', 'TWO', 'THREE'], at: 6, step: 6, ...o});
const mainLayout = (s) => s.els.find((e) => e.t !== 'words');

test('2b: type tokens live once, in layouts/tokens.ts', () => {
  const tokens = read(TOKENS);
  assert.match(tokens, /export const LABEL\s*=\s*70\b/);
  assert.match(tokens, /export const SMALL\s*=\s*LABEL \* 0\.7\b/);
  assert.match(tokens, /export const CHAR_WIDTH\s*=\s*0\.55\b/);
  for (const f of ['engine/ink/parts/cards.tsx', LAYOUT, DOC]) {
    assert.doesNotMatch(read(f), /(?:^|[,\s])(?:LABEL|SMALL|CHAR_WIDTH)\s*=(?!=)/m, `${f} redeclares a type token`);
  }
  assert.match(read('engine/ink/parts/cards.tsx'), /from '\.\/layouts\/tokens'/);
});

test('2b: docLayout throws on bad input, lets a long title overflow', async () => {
  const {docLayout} = await load();
  assert.equal(typeof docLayout, 'function', 'docLayout export missing');
  const bad = {
    'empty lines': {lines: []},
    'zero w': {w: 0},
    'NaN h': {h: NaN},
    'infinite w': {w: Infinity},
    'line too wide': {w: 300, lines: ['THIS LINE IS FAR TOO LONG FOR THE PAPER']},
    'redact out of range': {redact: [3]},
    'redact negative': {redact: [-1]},
    'redact duplicate': {redact: [1, 1]},
    'mark out of range': {mark: {line: 5, style: 'circle'}},
    'mark on a redacted line': {redact: [0], mark: {line: 0, style: 'underline'}},
  };
  for (const [why, o] of Object.entries(bad)) assert.throws(() => docLayout(base(o)), Error, why);
  assert.doesNotThrow(() => docLayout(base({title: 'DEPUTY DIRECTOR GENERAL OF POSTS AND TELEGRAPHS', w: 600})), 'a long title overflows, it never throws');
});

test('2b: docLayout timing: outline, title types on, lines, mark, stamp last', async () => {
  const {docLayout, TYPE_STEP, DOC_OUTLINE} = await load();
  assert.equal(TYPE_STEP, 1);
  assert.equal(DOC_OUTLINE, 10);
  const el = base({title: 'DEATH CERTIFICATE', mark: {line: 1, style: 'circle'}, stamp: 'VOID'});
  const L = docLayout(el);
  assert.equal(L.outlineEnd, el.at + DOC_OUTLINE);
  assert.equal(L.titleEnd, L.outlineEnd + el.title.length * TYPE_STEP);
  assert.deepEqual(L.lineAt, el.lines.map((_, i) => L.titleEnd + i * el.step));
  assert.ok(L.markAt > L.lineAt[1], 'mark draws after its line has appeared');
  assert.ok(L.stampAt > L.markAt && L.stampAt > L.lineAt.at(-1), 'stamp comes after everything else');
  assert.ok(L.end > L.stampAt, 'end covers the stamp pop');
  assert.ok(L.innerW > 0 && L.innerW < el.w, 'innerW = paper minus its padding');
  const plain = docLayout(base());
  assert.equal(plain.markAt, null);
  assert.equal(plain.stampAt, null);
  assert.ok(plain.end > plain.lineAt.at(-1), 'end covers the last line fade');
  const redacted = docLayout(base({redact: [2]}));
  assert.ok(redacted.end > redacted.lineAt[2], 'end covers the last redact bar draw');
});

test('2b: doc wired as its own layout file, out of cards.tsx', () => {
  const schema = read('engine/ink/parts/schema.ts');
  assert.match(schema, /export type DocEl\b/);
  assert.match(schema, /t:\s*'doc'/);
  assert.match(schema.match(/export type El\s*=([^;]+);/)[1], /\bDocEl\b/);
  const elements = read('engine/ink/parts/elements.tsx');
  assert.match(elements, /case 'doc': return <DocElement\b/);
  assert.match(elements, /from '\.\/layouts\/doc'/);
  const doc = read(DOC);
  assert.match(doc, /export const DocElement\b/);
  assert.match(doc, /\bdocLayout\(/);
  assert.match(doc, /\bscribbleEllipse\(/);
  assert.doesNotMatch(doc, /<rect\b/, 'paper, band, bars and stamp box are hand-drawn paths, not rects');
  assert.doesNotMatch(read('engine/ink/parts/cards.tsx'), /\bDocEl\b|\bdocLayout\b/, 'doc stays out of cards.tsx');
});

test('2b: demo2 shows the three doc kinds, never two same layouts back to back', async () => {
  const {docLayout} = await load();
  const p = JSON.parse(read('engine/ink/parts/cardlib/demo2.json'));
  assert.equal(p.part, 'cardlib2');
  assert.equal(p.f0, 0);
  assert.equal(p.f1, p.shots.length * SHOT);
  const kinds = {};
  p.shots.forEach((s, i) => {
    assert.equal(s.f0, i * SHOT, `shot ${i} f0`);
    assert.equal(s.f1, (i + 1) * SHOT, `shot ${i} f1`);
    assert.deepEqual(s.bg, {card: true}, `shot ${i} bg`);
    assert.ok(mainLayout(s), `shot ${i} has no layout`);
    if (i > 0) assert.notEqual(mainLayout(s).t, mainLayout(p.shots[i - 1]).t, `shots ${i - 1} and ${i} repeat a layout`);
    for (const el of s.els.filter((e) => e.t === 'doc')) {
      assert.ok(!kinds[el.kind], `doc kind ${el.kind} shown twice`);
      kinds[el.kind] = el;
      assert.equal(el.at, s.f0 + ENTRY, `shot ${i} doc.at`);
      assert.ok(docLayout(el).end <= s.f1 - TAIL, `shot ${i} doc still animating at local ${docLayout(el).end - s.f0}`);
    }
  });
  assert.deepEqual(Object.keys(kinds).sort(), DOC_KINDS);
  const {card, memo, certificate} = kinds;
  assert.equal(card.title, 'DEPUTY DIRECTOR GENERAL OF POSTS AND TELEGRAPHS');
  assert.ok(card.title.length * LABEL * CHAR_WIDTH > card.w, 'card title must overflow its paper (beat b25 joke)');
  assert.equal(card.rot, -3);
  assert.equal(memo.lines.length, 4);
  assert.deepEqual(memo.redact, [1, 2]);
  assert.equal(memo.stamp, 'CONFIDENTIAL');
  assert.equal(certificate.title, 'DEATH CERTIFICATE');
  const k = certificate.lines.indexOf('APPRENTICE SALESMAN');
  assert.ok(k >= 0, 'certificate needs the APPRENTICE SALESMAN line');
  assert.deepEqual(certificate.mark, {line: k, style: 'circle'});
});

test('2b: CardLibrary2 registered in Root with the demo2 length', () => {
  const root = read('engine/ink/Root.tsx');
  assert.match(root, /id="CardLibrary2"/);
  assert.match(root, /CARD_LIBRARY2_FRAMES/);
  assert.match(read('engine/ink/compositions/CardLibrary2.tsx'), /export const CARD_LIBRARY2_FRAMES/);
});

test('2b: touched sources are ASCII-only', () => {
  for (const f of TOUCHED) {
    const bad = [...read(f)].find((ch) => ch.charCodeAt(0) > 127);
    assert.equal(bad, undefined, `${f} has non-ASCII ${JSON.stringify(bad)}`);
  }
});
