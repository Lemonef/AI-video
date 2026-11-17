import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {mapLayout, COAST_DRAW, PIN_SIZE, PIN_FADE, PIN_LABEL_FADE, LABEL_FADE} from './mapLayout';
import {progress, delay, pop, Text, Draw, LABEL, SMALL} from '../cards';
import {DoodleIcon, DOODLE} from '../icons';
import {INK, RED, LINE} from '../../compositions/InkProof';
import type {MapEl} from '../schema';

const WAVE_STROKE = LINE * 0.4; // thin sea strokes
const ROUTE_STROKE = LINE * 1.1; // red route weight
const ROUTE_DASH = `${LINE * 1.7} ${LINE * 1.3}`; // fixed red dashes, the reveal never slides them
const MASK_STROKE = LINE * 4; // wide enough to reveal the whole dash band
const MASK_SHOW = '#ffffff'; // mask luminance: white reveals, black hides

export const MapElement: React.FC<{el: MapEl; shotF0: number; shotF1: number}> = ({el, shotF0}) => {
  const f = useCurrentFrame();
  const a = delay(el, shotF0);
  const L = mapLayout(el);
  const maskId = `route-${useId().replace(/:/g, '')}`;

  const landP = progress(f, a, a + COAST_DRAW);
  const routeP = progress(f, L.routeAt - shotF0, L.routeEnd - shotF0);
  const fromPinAt = L.fromPinAt - shotF0;
  const toPinAt = L.toPinAt - shotF0;
  const fromLabelP = progress(f, fromPinAt, fromPinAt + PIN_LABEL_FADE);
  const toLabelP = progress(f, toPinAt, toPinAt + PIN_LABEL_FADE);
  const labelP = L.labelAt === null ? 0 : progress(f, L.labelAt - shotF0, L.labelAt - shotF0 + LABEL_FADE);

  return (
    <g>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width="100%" height="100%">
          <path
            d={L.routeD}
            fill="none"
            stroke={MASK_SHOW}
            strokeWidth={MASK_STROKE}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - routeP}
          />
        </mask>
      </defs>

      {L.coast.map((d, i) => (
        <g key={`coast-${i}`}>
          <path d={d} fill={DOODLE.cream} opacity={landP} />
          <Draw d={d} p={landP} ink={INK} />
        </g>
      ))}

      {L.waves.map((d, i) => (
        <path
          key={`wave-${i}`}
          d={d}
          fill="none"
          stroke={INK}
          strokeWidth={WAVE_STROKE}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - landP}
          opacity={landP > 0 ? 1 : 0}
        />
      ))}

      <g mask={`url(#${maskId})`}>
        <path
          d={L.routeD}
          fill="none"
          stroke={RED}
          strokeWidth={ROUTE_STROKE}
          strokeLinecap="round"
          strokeDasharray={ROUTE_DASH}
        />
      </g>

      <g
        transform={`translate(${L.fromPin.x} ${L.fromPin.y}) scale(${pop(f, fromPinAt)})`}
        opacity={progress(f, fromPinAt, fromPinAt + PIN_FADE)}
      >
        <DoodleIcon name="pin" size={PIN_SIZE} />
      </g>
      <Text
        x={L.fromLabel.x}
        y={L.fromLabel.y}
        text={el.from.label}
        size={SMALL}
        anchor={L.fromLabel.anchor}
        opacity={fromLabelP}
      />

      <g
        transform={`translate(${L.toPin.x} ${L.toPin.y}) scale(${pop(f, toPinAt)})`}
        opacity={progress(f, toPinAt, toPinAt + PIN_FADE)}
      >
        <DoodleIcon name="pin" size={PIN_SIZE} />
      </g>
      <Text
        x={L.toLabel.x}
        y={L.toLabel.y}
        text={el.to.label}
        size={SMALL}
        anchor={L.toLabel.anchor}
        opacity={toLabelP}
      />

      {el.label && (
        <Text
          x={L.bandLabel.x}
          y={L.bandLabel.y}
          text={el.label}
          size={LABEL}
          anchor="middle"
          opacity={labelP}
        />
      )}
    </g>
  );
};
