import React from 'react';
import {useCurrentFrame} from 'remotion';
import {
  docLayout,
  paperPath,
  barPath,
  bandPath,
  wobbleLine,
  sealRibbons,
  stampBoxes,
  TYPE_STEP,
  DOC_OUTLINE,
  LINE_FADE,
  MARK_DRAW,
  BAR_DRAW,
  STAMP_POP,
  STAMP_TILT,
  MEMO_DRAW,
  MEMO_TEXT_DELAY,
  MEMO_TEXT_SIZE,
  RULE_DRAW,
  CERT_DELAY,
  CERT_DRAW,
  SEAL_R,
  SEAL_DELAY,
  SEAL_DRAW,
  RIBBON_LEN,
  RIBBON_DELAY,
  RIBBON_DRAW,
  BAR_H,
  SHADOW_OFFSET,
  SHADOW_OPACITY,
} from './docLayout';
import {progress, delay, Text, Draw, pop, LABEL, SMALL} from '../cards';
import {scribbleEllipse} from '../doodle';
import {INK, PAPER, RED} from '../../compositions/InkProof';
import {DOODLE} from '../icons';
import type {DocEl} from '../schema';

// Path seeds: named by role so the wobble is stable for a given shape.
const SEED_SHADOW = 0, SEED_PAPER = 1, SEED_INNER = 2, SEED_RIBBON = 2;
const SEED_RULE = 1, SEED_BAND = 1, SEED_STAMP = 1;

export const DocElement: React.FC<{el: DocEl; shotF0: number; shotF1: number}> = ({el, shotF0}) => {
  const f = useCurrentFrame();
  const a = delay(el, shotF0);
  const L = docLayout(el);
  const rot = el.rot ?? 0;
  const paperFill = el.kind === 'certificate' ? DOODLE.cream : PAPER;

  const outlineP = progress(f, a, a + DOC_OUTLINE);
  const paper = paperPath(el.w, el.h, SEED_PAPER);
  const shadow = paperPath(el.w, el.h, SEED_SHADOW);

  const titleChars = Math.floor(progress(f, a + DOC_OUTLINE, a + DOC_OUTLINE + el.title.length * TYPE_STEP) * el.title.length);

  const lines = el.lines.map((line, i) => {
    // docLayout returns composition-global frames; useCurrentFrame is local to this shot's Sequence.
    const lineA = L.lineAt[i] - shotF0;
    if (el.redact?.includes(i)) {
      const barP = progress(f, lineA, lineA + BAR_DRAW);
      return barP > 0 ? (
        <g key={i} transform={`translate(${L.lineX} ${L.barY[i]})`}>
          <path d={barPath(L.lineW[i] * barP, BAR_H, i)} fill={INK} />
        </g>
      ) : null;
    }
    return (
      <Text
        key={i}
        x={L.lineX}
        y={L.lineY[i]}
        text={line}
        size={SMALL}
        anchor="start"
        opacity={progress(f, lineA, lineA + LINE_FADE)}
      />
    );
  });

  let mark = null;
  if (el.mark && L.markAt !== null && L.markX !== null && L.markY !== null && L.markRx !== null && L.markRy !== null) {
    const markA = L.markAt - shotF0;
    const markP = progress(f, markA, markA + MARK_DRAW);
    if (el.mark.style === 'circle') {
      const c = scribbleEllipse(L.markRx, L.markRy);
      mark = (
        <g key="mark" transform={`translate(${L.markX} ${L.markY}) rotate(${c.tilt})`}>
          <Draw d={c.d} p={markP} ink={RED} />
        </g>
      );
    } else if (L.underlineX1 !== null && L.underlineX2 !== null && L.underlineY !== null) {
      const under = wobbleLine(L.underlineX1, L.underlineY, L.underlineX2, L.underlineY, el.mark.line);
      mark = <g key="mark"><Draw d={under} p={markP} ink={RED} /></g>;
    }
  }

  let stamp = null;
  if (el.stamp && L.stampAt !== null) {
    const boxes = stampBoxes(L.stampW, L.stampH, SEED_STAMP);
    const stampA = L.stampAt - shotF0;
    const stampP = progress(f, stampA, stampA + STAMP_POP);
    stamp = (
      <g
        key="stamp"
        transform={`translate(${L.stampX} ${L.stampY}) rotate(${STAMP_TILT}) scale(${pop(f, stampA)})`}
        opacity={stampP}
      >
        <Draw d={boxes.outer} p={1} ink={RED} />
        <Draw d={boxes.inner} p={1} ink={RED} />
        <Text x={0} y={L.stampTextY} text={el.stamp} size={LABEL} anchor="middle" fill={RED} />
      </g>
    );
  }

  let detail = null;
  if (el.kind === 'card') {
    const ruleP = progress(f, a + DOC_OUTLINE, a + DOC_OUTLINE + RULE_DRAW);
    detail = <Draw key="rule" d={wobbleLine(L.lineX, L.ruleY, L.lineX + L.innerW, L.ruleY, SEED_RULE)} p={ruleP} ink={INK} />;
  } else if (el.kind === 'memo') {
    const bandP = progress(f, a + DOC_OUTLINE, a + DOC_OUTLINE + MEMO_DRAW);
    const memoP = progress(f, a + DOC_OUTLINE + MEMO_TEXT_DELAY, a + DOC_OUTLINE + MEMO_TEXT_DELAY + LINE_FADE);
    detail = (
      <g key="memo" opacity={bandP} transform={`translate(0 ${L.bandTop})`}>
        <path d={bandPath(L.bandW, L.bandH, SEED_BAND)} fill={INK} />
        <Text x={0} y={L.memoY - L.bandTop} text="MEMO" size={MEMO_TEXT_SIZE} anchor="middle" fill={PAPER} opacity={memoP} />
      </g>
    );
  } else if (el.kind === 'certificate') {
    const innerP = progress(f, a + DOC_OUTLINE + CERT_DELAY, a + DOC_OUTLINE + CERT_DELAY + CERT_DRAW);
    const sealP = progress(f, a + DOC_OUTLINE + SEAL_DELAY, a + DOC_OUTLINE + SEAL_DELAY + SEAL_DRAW);
    const ribbonP = progress(f, a + DOC_OUTLINE + RIBBON_DELAY, a + DOC_OUTLINE + RIBBON_DELAY + RIBBON_DRAW);
    const seal = scribbleEllipse(SEAL_R, SEAL_R);
    const ribbons = sealRibbons(L.sealX, L.sealY, SEAL_R, RIBBON_LEN, SEED_RIBBON);
    detail = (
      <g key="cert">
        <Draw d={paperPath(L.certW, L.certH, SEED_INNER)} p={innerP} ink={INK} />
        <Draw d={ribbons.left} p={ribbonP} ink={RED} />
        <Draw d={ribbons.right} p={ribbonP} ink={RED} />
        <g transform={`translate(${L.sealX} ${L.sealY}) rotate(${seal.tilt})`}>
          <Draw d={seal.d} p={sealP} ink={RED} />
        </g>
      </g>
    );
  }

  return (
    <g transform={`translate(${el.x} ${el.y}) rotate(${rot})`}>
      <g opacity={SHADOW_OPACITY * outlineP} transform={`translate(${SHADOW_OFFSET} ${SHADOW_OFFSET})`}>
        <path d={shadow} fill={INK} />
      </g>
      <path d={paper} fill={paperFill} fillOpacity={outlineP} />
      <Draw d={paper} p={outlineP} ink={INK} />
      {detail}
      <Text x={L.titleX} y={L.titleY} text={el.title.slice(0, titleChars)} size={LABEL} anchor="start" />
      <g>{lines}</g>
      {mark}
      {stamp}
    </g>
  );
};
