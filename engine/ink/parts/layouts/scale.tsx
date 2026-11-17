import React from 'react';
import {useCurrentFrame} from 'remotion';
import {IconElement, Text, Draw, progress, SMALL} from '../cards';
import {scaleLayout} from './scaleLayout';
import type {ScaleEl} from '../schema';
import {INK, RED} from '../../compositions/InkProof';
import {DOODLE} from '../icons';

type Props<T> = {el: T; shotF0: number; shotF1: number};

export const ScaleElement: React.FC<Props<ScaleEl>> = ({el, shotF0, shotF1}) => {
  const f = useCurrentFrame() + shotF0;
  const L = scaleLayout(el);

  const drawP = progress(f, L.drawAt, L.drawEnd);
  const angle = L.angleAt(f);
  const arm = L.arms(angle);

  const leftLabelP = progress(f, L.leftLabelAt, L.leftLabelEnd);
  const rightLabelP = progress(f, L.rightLabelAt, L.rightLabelEnd);
  const labelP = L.labelAt !== null && L.labelEnd !== null ? progress(f, L.labelAt, L.labelEnd) : 0;

  return (
    <g>
      <path d={L.baseD} fill={DOODLE.brown} fillOpacity={drawP} />
      <Draw d={L.baseD} p={drawP} ink={INK} />

      <path d={L.postD} fill={DOODLE.brown} fillOpacity={drawP} />
      <Draw d={L.postD} p={drawP} ink={INK} />

      <g transform={`rotate(${angle} ${L.pivot.x} ${L.pivot.y})`}>
        <path d={L.beamD} fill={DOODLE.brown} fillOpacity={drawP} />
        <Draw d={L.beamD} p={drawP} ink={INK} />
      </g>

      <path d={L.pivotDotD} fill={INK} opacity={drawP} />

      <Draw d={arm.leftChainD} p={drawP} ink={INK} />
      <Draw d={arm.rightChainD} p={drawP} ink={INK} />

      <path d={arm.leftPanD} fill={DOODLE.grey} fillOpacity={drawP} />
      <Draw d={arm.leftPanD} p={drawP} ink={INK} />

      <path d={arm.rightPanD} fill={DOODLE.grey} fillOpacity={drawP} />
      <Draw d={arm.rightPanD} p={drawP} ink={INK} />

      <IconElement
        shotF0={shotF0}
        shotF1={shotF1}
        el={{
          t: 'icon',
          x: arm.leftIcon.x,
          y: arm.leftIcon.y,
          size: arm.leftIcon.size,
          name: el.left.icon,
          color: el.left.color,
          at: L.leftAt,
        }}
      />
      <IconElement
        shotF0={shotF0}
        shotF1={shotF1}
        el={{
          t: 'icon',
          x: arm.rightIcon.x,
          y: arm.rightIcon.y,
          size: arm.rightIcon.size,
          name: el.right.icon,
          color: el.right.color,
          at: L.rightAt,
        }}
      />

      {el.left.label && (
        <Text
          x={arm.leftLabel.x}
          y={arm.leftLabel.y}
          text={el.left.label}
          size={SMALL}
          opacity={leftLabelP}
        />
      )}
      {el.right.label && (
        <Text
          x={arm.rightLabel.x}
          y={arm.rightLabel.y}
          text={el.right.label}
          size={SMALL}
          opacity={rightLabelP}
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
