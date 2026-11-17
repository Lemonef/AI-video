import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {docLayout, TYPE_STEP, DOC_OUTLINE, LINE_FADE, MARK_DRAW, BAR_DRAW, STAMP_DELAY, STAMP_POP, STAMP_TILT, DOC_PAD, TITLE_TOP, LINE_FIRST, LINE_GAP} from './docLayout';
import {progress, delay, Text, Draw, LABEL, SMALL, CHAR_WIDTH} from '../cards';
import {scribbleEllipse} from '../doodle';
import {INK, PAPER, RED, LINE} from '../../compositions/InkProof';
import {DOODLE} from '../icons';
import type {DocEl} from '../schema';

const wobbleRect = (w: number, h: number, seed = 0) => {
  const jitter = (v: number, i: number) => v + Math.sin(i * 2.7 + seed) * 1.5 + Math.cos(i * 1.3 + seed) * 1.2;
  const hw = w / 2, hh = h / 2;
  return `M${-jitter(hw, 0)} ${-jitter(hh, 1)} L${jitter(hw, 2)} ${-jitter(hh, 3)} L${jitter(hw, 4)} ${jitter(hh, 5)} L${-jitter(hw, 6)} ${jitter(hh, 7)}Z`;
};

const wobbleLine = (x1: number, y1: number, x2: number, y2: number, seed = 0) => {
  const midX = (x1 + x2) / 2 + Math.sin(seed) * 2;
  const midY = (y1 + y2) / 2 + Math.cos(seed) * 1.5;
  return `M${x1} ${y1} Q${midX} ${midY} ${x2} ${y2}`;
};

const wobbleBar = (w: number, seed = 0) => {
  const bow = Math.sin(seed) * 3;
  return `M0 0 Q${w / 2} ${bow} ${w} 0`;
};

export const DocElement: React.FC<{el: DocEl; shotF0: number; shotF1: number}> = ({el, shotF0}) => {
  const f = useCurrentFrame();
  const a = delay(el, shotF0);
  const L = docLayout(el);
  const rot = el.rot ?? 0;
  const isCert = el.kind === 'certificate';

  const paperFill = isCert ? DOODLE.cream : PAPER;

  const outlineP = progress(f, a, a + DOC_OUTLINE);
  const outlinePath = wobbleRect(el.w, el.h, 1);
  const shadowPath = wobbleRect(el.w + 4, el.h + 4, 2);

  const titleFrames = el.title.length * TYPE_STEP;
  const titleProgress = progress(f, a + DOC_OUTLINE, a + DOC_OUTLINE + titleFrames);
  const titleChars = Math.floor(titleProgress * el.title.length);
  const titleText = el.title.slice(0, titleChars);

  const lineEls = el.lines.map((line, i) => {
    const isRedacted = el.redact?.includes(i) ?? false;
    const lineA = L.lineAt[i];
    const opacity = progress(f, lineA, lineA + LINE_FADE);
    const x = -L.innerW / 2;
    const y = L.lineY[i];

    if (isRedacted) {
      const barW = line.length * SMALL * CHAR_WIDTH;
      const barPath = wobbleBar(barW, i + 10);
      const barP = progress(f, lineA, lineA + BAR_DRAW);
      return (
        <g key={i} transform={`translate(${x} ${y})`}>
          <Draw d={barPath} p={barP} ink={INK} />
        </g>
      );
    }

    return (
      <Text
        key={i}
        x={x}
        y={y}
        text={line}
        size={SMALL}
        anchor="start"
        opacity={opacity}
      />
    );
  });

  let markEl = null;
  if (el.mark && L.markAt !== null) {
    const lineIdx = el.mark.line;
    const lineY = L.lineY[lineIdx];
    const lineW = el.lines[lineIdx].length * SMALL * CHAR_WIDTH;
    const markP = progress(f, L.markAt, L.markAt + MARK_DRAW);
    if (el.mark.style === 'circle') {
      const c = scribbleEllipse(lineW / 2 + SMALL * 0.6, SMALL * 0.9);
      markEl = (
        <g key="mark" transform={`translate(0 ${lineY}) rotate(${c.tilt})`}>
          <Draw d={c.d} p={markP} ink={RED} />
        </g>
      );
    } else {
      const underPath = wobbleLine(-lineW / 2 - SMALL * 0.3, SMALL * 0.35, lineW / 2 + SMALL * 0.3, SMALL * 0.35, lineIdx + 20);
      markEl = (
        <g key="mark" transform={`translate(0 ${lineY})`}>
          <Draw d={underPath} p={markP} ink={RED} />
        </g>
      );
    }
  }

  let stampEl = null;
  if (el.stamp && L.stampAt !== null) {
    const stampP = progress(f, L.stampAt, L.stampAt + STAMP_POP);
    const popScale = 0.6 + 0.4 * stampP;
    const stampW = el.stamp.length * LABEL * CHAR_WIDTH + LABEL;
    const stampH = LABEL * 1.4;
    const outerPath = wobbleRect(stampW, stampH, 30);
    const innerPath = wobbleRect(stampW - 8, stampH - 8, 31);
    stampEl = (
      <g
        key="stamp"
        transform={`translate(${L.sealX} ${L.sealY}) rotate(${STAMP_TILT}) scale(${popScale})`}
        opacity={stampP}
      >
        <Draw d={outerPath} p={1} ink={RED} />
        <Draw d={innerPath} p={1} ink={RED} />
        <Text
          x={0}
          y={LABEL * 0.35}
          text={el.stamp}
          size={LABEL}
          anchor="middle"
          fill={RED}
        />
      </g>
    );
  }

  let kindDetail = null;
  if (el.kind === 'card') {
    const ruleY = TITLE_TOP + LABEL * 0.4;
    const rulePath = wobbleLine(-L.innerW / 2, ruleY, L.innerW / 2, ruleY, 5);
    kindDetail = <Draw key="rule" d={rulePath} p={progress(f, a + DOC_OUTLINE, a + DOC_OUTLINE + 8)} ink={INK} />;
  } else if (el.kind === 'memo') {
    const bandH = LABEL * 1.1;
    const bandPath = `M${-el.w / 2} ${-el.h / 2} L${el.w / 2} ${-el.h / 2} L${el.w / 2} ${-el.h / 2 + bandH} L${-el.w / 2} ${-el.h / 2 + bandH}Z`;
    const bandP = progress(f, a + DOC_OUTLINE, a + DOC_OUTLINE + 10);
    const memoTextP = progress(f, a + DOC_OUTLINE + 10, a + DOC_OUTLINE + 10 + LINE_FADE);
    kindDetail = (
      <g key="memo">
        <Draw d={bandPath} p={bandP} ink={INK} />
        <Text
          x={0}
          y={-el.h / 2 + bandH * 0.55}
          text="MEMO"
          size={LABEL * 0.7}
          anchor="middle"
          fill={paperFill}
          opacity={memoTextP}
        />
      </g>
    );
  } else if (el.kind === 'certificate') {
    const inset = LABEL * 0.6;
    const innerW = el.w - 2 * inset;
    const innerH = el.h - 2 * inset;
    const outerPath = wobbleRect(el.w, el.h, 6);
    const innerPath = wobbleRect(innerW, innerH, 7);
    const outerP = progress(f, a + DOC_OUTLINE, a + DOC_OUTLINE + 12);
    const innerP = progress(f, a + DOC_OUTLINE + 4, a + DOC_OUTLINE + 16);
    const sealC = scribbleEllipse(SMALL * 0.7, SMALL * 0.7);
    const sealP = progress(f, a + DOC_OUTLINE + 8, a + DOC_OUTLINE + 16);
    const ribbonPath = wobbleLine(
      innerW / 2 - SMALL * 1.2, innerH / 2 - SMALL * 0.5,
      innerW / 2 - SMALL * 0.2, innerH / 2 + SMALL * 0.8,
      50
    );
    const ribbonP = progress(f, a + DOC_OUTLINE + 10, a + DOC_OUTLINE + 18);
    const ribbonTail = wobbleLine(
      innerW / 2 - SMALL * 0.2, innerH / 2 + SMALL * 0.8,
      innerW / 2 + SMALL * 0.5, innerH / 2 + SMALL * 1.5,
      51
    );
    kindDetail = (
      <g key="cert">
        <Draw d={outerPath} p={outerP} ink={INK} />
        <Draw d={innerPath} p={innerP} ink={INK} />
        <g transform={`translate(${innerW / 2 - SMALL * 0.7} ${innerH / 2 - SMALL * 0.7}) rotate(${sealC.tilt})`}>
          <Draw d={sealC.d} p={sealP} ink={RED} />
        </g>
        <Draw d={ribbonPath} p={ribbonP} ink={RED} />
        <Draw d={ribbonTail} p={ribbonP} ink={RED} />
      </g>
    );
  }

  return (
    <g
      transform={`translate(${el.x} ${el.y}) rotate(${rot})`}
      filter="url(#ink-boil-0)"
    >
      <g opacity={0.15} transform="translate(3 3)">
        <path d={shadowPath} fill={INK} />
      </g>
      <path d={outlinePath} fill={paperFill} stroke={INK} strokeWidth={LINE} strokeLinejoin="round" />
      <Draw d={outlinePath} p={outlineP} ink={INK} />
      {kindDetail}
      <Text
        x={-L.innerW / 2}
        y={L.titleY}
        text={titleText}
        size={LABEL}
        anchor="start"
      />
      <g transform={`translate(0 0)`}>{lineEls}</g>
      {markEl}
      {stampEl}
    </g>
  );
};