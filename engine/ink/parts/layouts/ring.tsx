import React from 'react';
import {useCurrentFrame} from 'remotion';
import {IconElement, Text, Draw, progress} from '../cards';
import {ringLayout, LABEL_FADE} from './ringLayout';
import {LABEL, SMALL} from './tokens';
import {scribbleEllipse} from '../doodle';
import {INK, RED} from '../../compositions/InkProof';
import type {RingEl} from '../schema';

type Props<T> = {el: T; shotF0: number; shotF1: number};

export const RingElement: React.FC<Props<RingEl>> = ({el, shotF0, shotF1}) => {
  const f = useCurrentFrame() + shotF0;
  const L = ringLayout(el);

  const ringP = progress(f, L.drawAt, L.drawEnd);
  const circleP = progress(f, L.circleAt, L.circleEnd);
  const oddLabelP = progress(f, L.oddLabelAt, L.oddLabelAt + LABEL_FADE);
  const labelP = L.labelAt !== null ? progress(f, L.labelAt, L.labelAt + LABEL_FADE) : 0;

  const ring = scribbleEllipse(L.ringR, L.ringR);
  const circle = scribbleEllipse(L.circleRx, L.circleRy);

  return (
    <g>
      <g transform={`translate(${L.ringX} ${L.ringY})`}>
        <Draw d={ring.d} p={ringP} ink={INK} />
      </g>
      {L.icons.map((ic, i) => (
        <IconElement
          key={i}
          shotF0={shotF0}
          shotF1={shotF1}
          el={{
            t: 'icon',
            x: ic.x,
            y: ic.y,
            size: ic.size,
            name: el.icon,
            at: ic.at,
          }}
        />
      ))}
      <IconElement
        shotF0={shotF0}
        shotF1={shotF1}
        el={{
          t: 'icon',
          x: L.odd.x,
          y: L.odd.y,
          size: L.odd.size,
          name: L.odd.icon,
          at: L.odd.at,
        }}
      />
      <g transform={`translate(${L.odd.x} ${L.odd.y}) rotate(${circle.tilt})`}>
        <Draw d={circle.d} p={circleP} ink={RED} />
      </g>
      {el.odd.label && (
        <Text
          x={L.odd.x}
          y={L.oddLabelY}
          text={el.odd.label}
          size={SMALL}
          opacity={oddLabelP}
        />
      )}
      {el.label && L.labelAt !== null && (
        <Text
          x={L.labelX}
          y={L.labelY}
          text={el.label}
          size={LABEL}
          opacity={labelP}
        />
      )}
    </g>
  );
};
