// Gate for the ep02 card polish: every red circle / green tick that marks a card label starts only once
// that label (or map pin) is fully on screen, and finishes drawing before its shot ends.
// Timing comes from the real layout modules (bundled with esbuild) and, for split cards that have no
// layout module, from the constants in cards.tsx itself, so nothing here restates a frame count.
// Run after: python tools/ink/ep02_full_shots.py --draft
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildSync} from 'esbuild';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');
const FULL = 'engine/ink/parts/shots_ep02full/full.json';
const LAYOUTS = 'engine/ink/parts/layouts/';
const CARDS = 'engine/ink/parts/cards.tsx';
const ELEMENTS = 'engine/ink/parts/elements.tsx';
const HOLD = 10; // contract: a finished label or mark stays fully on screen >= 1/3 s (30 fps) before the cut

// Card kind and its marks per card shot (f0), pinned from the post-plate-wire build (75a2cdd) so a fix
// retimes marks instead of dropping or moving them. One planned change: the b1 hook card at f0 46 is too
// short (45 frames) for a transform, so it becomes a split with the same two sides and the same circle.
const PINNED = {46:'split circle@1440', 390:'split circle@1440', 1599:'transform circle@1440', 1880:'split circle@1440', 2346:'transform circle@1440', 2528:'split circle@1440', 2837:'map tick@310', 4186:'transform circle@1440', 4816:'split circle@1440', 5548:'split circle@1440', 5740:'transform circle@1440', 8108:'split circle@1440', 8951:'transform circle@1440', 9616:'split circle@1440', 10186:'transform circle@1440', 11489:'transform circle@1440', 12409:'transform circle@480', 13317:'split circle@1440', 14313:'scale circle@960', 14776:'map tick@310', 14964:'split circle@480', 15773:'transform circle@1440', 16081:'split circle@1440', 18090:'transform circle@1440'};

const load = async (file) => {
  const out = buildSync({entryPoints: [fileURLToPath(new URL(LAYOUTS + file, ROOT))], bundle: true, format: 'esm',
    platform: 'node', write: false, logLevel: 'silent'});
  return import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);
};
const constIn = (src, name) => {
  const m = src.match(new RegExp(`const ${name} = (\\d+);`));
  assert.ok(m, `${name} not found as a numeric const`);
  return Number(m[1]);
};
// draw length of a mark, read from its element (progress(f, 0, N))
const drawFrames = (src, comp) => {
  const m = src.match(new RegExp(`export const ${comp}[^\\n]*progress\\(f, 0, (\\d+)\\)`));
  assert.ok(m, `${comp} draw length not found in ${ELEMENTS}`);
  return Number(m[1]);
};

test('every card finishes inside its shot; every circle/tick starts after the label it marks is fully visible, and ends inside its shot', async () => {
  const {transformLayout, A_X} = await load('transformLayout.ts');
  const {scaleLayout, CX} = await load('scaleLayout.ts');
  const {mapLayout, PIN_POP, PIN_LABEL_FADE} = await load('mapLayout.ts');
  const cards = read(CARDS), elements = read(ELEMENTS);
  const POP = constIn(cards, 'POP_FRAMES'), FADE = constIn(cards, 'LABEL_FADE');
  const DRAW = {circle: drawFrames(elements, 'CircleElement'), tick: drawFrames(elements, 'TickElement')};
  const shots = JSON.parse(read(FULL)).shots;
  const bad = [];
  let marks = 0, cardCount = 0;
  for (const sh of shots) {
    const card = sh.els.find((e) => ['split', 'transform', 'scale', 'map'].includes(e.t));
    const got = card ? [card.t, ...sh.els.filter((e) => e.t === 'circle' || e.t === 'tick').map((e) => `${e.t}@${e.x}`)].join(' ') : undefined;
    if (got !== PINNED[sh.f0]) bad.push(`f0 ${sh.f0}: card+marks ${got} (pinned ${PINNED[sh.f0]})`);
    if (card) {
      cardCount++;
      const end = card.t === 'split' ? card.at + card.step + POP + FADE
        : (card.t === 'transform' ? transformLayout : card.t === 'scale' ? scaleLayout : mapLayout)(card).end;
      if (end + HOLD > sh.f1) bad.push(`f0 ${sh.f0} ${card.t}: card finishes at ${end}, shot ends ${sh.f1} (needs ${HOLD} frames on screen)`);
    }
    for (const m of sh.els.filter((e) => e.t === 'circle' || e.t === 'tick')) {
      marks++;
      assert.ok(card, `f0 ${sh.f0}: ${m.t} with no card to mark`);
      const left = m.x < CX; // marks sit over the left (a) or right (b) half, or centred (scale caption)
      let ready;
      if (card.t === 'split') ready = card.at + (left ? 0 : 1) * card.step + POP + FADE;
      else if (card.t === 'transform') { const L = transformLayout(card); ready = (m.x === A_X ? L.aLabelAt : L.bLabelAt) + FADE; }
      else if (card.t === 'scale') { const L = scaleLayout(card); ready = m.x === CX ? L.labelEnd : (left ? L.leftLabelEnd : L.rightLabelEnd); }
      else { const L = mapLayout(card); ready = L.toPinAt + Math.max(PIN_POP, PIN_LABEL_FADE); }
      assert.ok(Number.isFinite(ready), `f0 ${sh.f0}: no ready frame for ${card.t}`);
      if (m.at < ready) bad.push(`f0 ${sh.f0} ${card.t} ${m.t}@${m.at} x=${m.x}: label fully visible only at ${ready}`);
      if (m.at + DRAW[m.t] + HOLD > sh.f1) bad.push(`f0 ${sh.f0} ${card.t} ${m.t}@${m.at}: drawn by ${m.at + DRAW[m.t]}, shot ends ${sh.f1} (needs ${HOLD} frames on screen)`);
    }
  }
  assert.equal(cardCount, Object.keys(PINNED).length, 'card shot count changed (shot f0s must stay as pinned)');
  assert.ok(marks > 0 && cardCount > 0, 'no cards or marks found in full.json');
  assert.deepEqual(bad, [], `${bad.length} early or clipped marks:\n${bad.join('\n')}`);
});
