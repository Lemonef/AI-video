import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CrossoutElement, IconElement, Text, Draw, progress} from '../cards';
import {transformLayout, ARROW_DRAW, POP_FRAMES, LABEL_FADE} from './transformLayout';
import type {TransformEl} from '../schema';
import {INK, RED} from '../../compositions/InkProof';

type Props<T> = {el: T; shotF0: number; shotF1: number};

export const TransformElement: React.FC<Props<TransformEl>> = ({el, shotF0, shotF1}) => {
  const f = useCurrentFrame();
  const L = transformLayout(el);

  const arrowP = progress(f, L.arrowAt, L.arrowEnd);
  const headStart = L.arrowEnd - ARROW_DRAW * 0.3;
  const headP = progress(f, headStart, L.arrowEnd);
  const aLabelP = progress(f, L.aLabelAt, L.aLabelAt + LABEL_FADE);
  const bLabelP = progress(f, L.bLabelAt, L.bLabelAt + LABEL_FADE);
  const labelP = L.labelAt !== null ? progress(f, L.labelAt, L.labelAt + LABEL_FADE) : 0;

  return (
    <g>
      <CrossoutElement
        shotF0={shotF0}
        shotF1={shotF1}
        el={{
          t: 'crossout',
          x: L.a.x,
          y: L.a.y,
          size: L.a.size,
          icon: el.a.icon,
          label: el.a.label,
          at: L.aAt,
          crossAt: L.crossAt,
        }}
      />
      <Draw d={L.arrowD} p={arrowP} ink={INK} />
      <Draw d={L.headD} p={headP} ink={INK} />
      <IconElement
        shotF0={shotF0}
        shotF1={shotF1}
        el={{
          t: 'icon',
          x: L.b.x,
          y: L.b.y,
          size: L.b.size,
          name: el.b.icon,
          color: el.b.color,
          at: L.bAt,
        }}
      />
      {el.a.label && (
        <Text
          x={L.a.x}
          y={L.slotLabelY}
          text={el.a.label}
          opacity={aLabelP}
        />
      )}
      {el.b.label && (
        <Text
          x={L.b.x}
          y={L.slotLabelY}
          text={el.b.label}
          opacity={bLabelP}
        />
      )}
      {el.label && (
        <Text
          x={L.labelX}
          y={L.labelY}
          text={el.label}
          fill={RED}
          opacity={labelP}
        />
      )}
    </g>
  );
};