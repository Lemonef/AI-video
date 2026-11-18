import React from 'react';
import {useCurrentFrame} from 'remotion';
import {IconElement, Text, Draw, progress} from '../cards';
import {gridLayout, LABEL_FADE} from './gridLayout';
import {LABEL} from './tokens';
import {scribbleEllipse} from '../doodle';
import {INK, RED} from '../../compositions/InkProof';
import type {GridEl} from '../schema';
import type {IconName} from '../icons';

type Props<T> = {el: T; shotF0: number; shotF1: number};

export const GridElement: React.FC<Props<GridEl>> = ({el, shotF0, shotF1}) => {
  const f = useCurrentFrame() + shotF0;
  const L = gridLayout(el);
  const circle = scribbleEllipse(L.circleRx, L.circleRy);

  return (
    <g>
      {L.cells.map((cell, i) => (
        <IconElement
          key={i}
          shotF0={shotF0}
          shotF1={shotF1}
          el={{
            t: 'icon',
            x: cell.x,
            y: cell.y,
            size: cell.size,
            name: cell.icon as IconName,
            at: cell.at,
          }}
        />
      ))}
      <g transform={`translate(${L.circleX} ${L.circleY})`}>
        <Draw d={circle.d} p={progress(f, L.circleAt, L.circleEnd)} ink={RED} />
      </g>
      {el.label && L.labelAt !== null && L.labelX !== null && L.labelY !== null && (
        <Text
          x={L.labelX}
          y={L.labelY}
          text={el.label}
          size={LABEL}
          opacity={progress(f, L.labelAt, L.labelAt + LABEL_FADE)}
        />
      )}
    </g>
  );
};