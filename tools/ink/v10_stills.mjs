// Bundle once, render one still near the end of every Nth shot of shots_v10 (where all elements are in).
// Usage: node tools/ink/v10_stills.mjs <outDir> [everyNth=1] [onlyStarts=comma list of shot start frames]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [outDir, nthArg, onlyArg] = process.argv.slice(2);
const nth = Number(nthArg || 1);
const only = onlyArg ? new Set(onlyArg.split(',').map(Number)) : null;
const TAIL = 8; // frames before shot end: after every element's entry (generator bounds entries to end-6)
fs.mkdirSync(outDir, {recursive: true});
const frames = [];
for (let i = 3; i <= 24; i++) {
  const p = JSON.parse(fs.readFileSync(`engine/ink/parts/shots_v10/p${String(i).padStart(2, '0')}.json`, 'utf8'));
  p.shots.forEach((s, k) => { if (k % nth === 0 && (!only || only.has(s.f0))) frames.push([`p${String(i).padStart(2, '0')}_${k}`, s.f1 - TAIL]); });
}
const serveUrl = await bundle({entryPoint: path.resolve('engine/ink/index.ts'), publicDir: path.resolve('videos/pastly-life/01-eiffel-ink/assets')});
const composition = await selectComposition({serveUrl, id: 'InkEp01Full'});
for (const [name, frame] of frames) {
  await renderStill({serveUrl, composition, frame, output: path.join(outDir, `${name}_${frame}.jpg`), imageFormat: 'jpeg', jpegQuality: 70, scale: 0.5});
  process.stdout.write(`${name}@${frame} `);
}
console.log(`\n${frames.length} stills`);
