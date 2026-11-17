import {LABEL, SMALL, CHAR_WIDTH} from './tokens';
import type {ScaleEl} from '../schema';

export const CARD_W = 1920; // card stage width in px
export const CARD_H = 1080; // card stage height in px
export const CX = CARD_W / 2; // card horizontal centre in px
export const ICON_SIZE = 220; // pan icon size in px

export const SCALE_TILT = 12; // final beam tilt in degrees
export const POP_FRAMES = 8; // mirrors cards.tsx, change together
export const LABEL_FADE = 6; // label fade duration in frames, mirrors cards.tsx

export const DRAW_FRAMES = 10; // scale frame draw-in duration in frames
export const LEFT_POP = 10; // left icon entrance offset from at
export const RIGHT_POP = 18; // right icon entrance offset from at
export const TILT_START = 30; // beam tilt start offset from at

export const PIVOT_Y = 280; // beam pivot vertical position in px
export const BEAM_HALF = 420; // distance from pivot to beam end in px
export const PAN_DROP = 240; // vertical drop from beam end to pan rim in px
export const PAN_HALF = 140; // pan half width in px, wider than ICON_SIZE / 2
export const PAN_DEPTH = 36; // shallow bowl depth in px
export const BASE_Y = 800; // foot of the upright post in px
export const BASE_HALF = 180; // base mound half width in px
export const LABEL_GAP = 30; // clearance below base for caption in px

export const DEG_IN_HALF_CIRCLE = 180; // degrees in half a circle
export const DEG_TO_RAD = Math.PI / DEG_IN_HALF_CIRCLE; // conversion factor from degrees to radians

export const POST_WIDTH = 22; // upright post thickness in px
export const POST_HALF = POST_WIDTH / 2; // half thickness of the post in px
export const BEAM_THICKNESS = 18; // beam bar thickness in px
export const BEAM_HALF_THICK = BEAM_THICKNESS / 2; // half thickness of the beam bar in px
export const PIVOT_RADIUS = 12; // central pivot circle radius in px
export const BASE_HEIGHT = 44; // base mound height in px
export const BASE_TOP_HALF = 34; // half width of base mound at post junction in px
export const WOBBLE_AMP = 4; // hand wobble amplitude in px

export const scaleLayout = (el: ScaleEl) => {
  if (!Number.isInteger(el.dur) || el.dur <= 0) {
    throw new Error('dur must be a positive integer');
  }
  if (el.heavy !== 'left' && el.heavy !== 'right') {
    throw new Error("heavy must be 'left' or 'right'");
  }
  if (el.left.icon === el.right.icon) {
    throw new Error('left and right must have different icons');
  }
  if (el.label !== undefined && el.label.length * LABEL * CHAR_WIDTH > CARD_W) {
    throw new Error('label wider than the card');
  }

  const at = el.at;
  const drawAt = at;
  const drawEnd = at + DRAW_FRAMES;
  const leftAt = at + LEFT_POP;
  const rightAt = at + RIGHT_POP;
  const tiltAt = at + TILT_START;
  const tiltEnd = tiltAt + el.dur;
  const leftLabelAt = leftAt + POP_FRAMES;
  const rightLabelAt = rightAt + POP_FRAMES;
  const labelAt = el.label !== undefined ? tiltEnd : null;
  const end = Math.max(tiltEnd, (labelAt ?? rightLabelAt) + LABEL_FADE);
  const leftLabelEnd = leftLabelAt + LABEL_FADE;
  const rightLabelEnd = rightLabelAt + LABEL_FADE;
  const labelEnd = labelAt !== null ? labelAt + LABEL_FADE : null;

  const sign = el.heavy === 'right' ? 1 : -1;

  const angleAt = (frame: number): number => {
    if (frame <= tiltAt) return 0;
    if (frame >= tiltEnd) return sign * SCALE_TILT;
    const t = (frame - tiltAt) / el.dur;
    const ease = (1 - Math.cos(Math.PI * t)) / 2;
    return sign * SCALE_TILT * ease;
  };

  const arms = (deg: number) => {
    const rad = deg * DEG_TO_RAD;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const pivot = {x: CX, y: PIVOT_Y};
    const left = {
      x: CX - BEAM_HALF * cos,
      y: PIVOT_Y - BEAM_HALF * sin,
    };
    const right = {
      x: CX + BEAM_HALF * cos,
      y: PIVOT_Y + BEAM_HALF * sin,
    };

    const leftPan = {x: left.x, y: left.y + PAN_DROP};
    const rightPan = {x: right.x, y: right.y + PAN_DROP};

    const leftChainD = `M${left.x} ${left.y} L${leftPan.x - PAN_HALF} ${leftPan.y} M${left.x} ${left.y} L${leftPan.x + PAN_HALF} ${leftPan.y}`;
    const rightChainD = `M${right.x} ${right.y} L${rightPan.x - PAN_HALF} ${rightPan.y} M${right.x} ${right.y} L${rightPan.x + PAN_HALF} ${rightPan.y}`;

    const leftPanD = `M${leftPan.x - PAN_HALF} ${leftPan.y} Q${leftPan.x} ${leftPan.y + PAN_DEPTH * 2} ${leftPan.x + PAN_HALF} ${leftPan.y} Z`;
    const rightPanD = `M${rightPan.x - PAN_HALF} ${rightPan.y} Q${rightPan.x} ${rightPan.y + PAN_DEPTH * 2} ${rightPan.x + PAN_HALF} ${rightPan.y} Z`;

    const leftIcon = {x: leftPan.x, y: leftPan.y - ICON_SIZE / 2, size: ICON_SIZE};
    const rightIcon = {x: rightPan.x, y: rightPan.y - ICON_SIZE / 2, size: ICON_SIZE};

    const leftLabel = {x: leftPan.x, y: leftPan.y + PAN_DEPTH + SMALL};
    const rightLabel = {x: rightPan.x, y: rightPan.y + PAN_DEPTH + SMALL};

    return {
      pivot,
      left,
      right,
      leftPan,
      rightPan,
      leftChainD,
      rightChainD,
      leftPanD,
      rightPanD,
      leftIcon,
      rightIcon,
      leftLabel,
      rightLabel,
    };
  };

  const baseD = `M${CX - BASE_HALF} ${BASE_Y} ` +
    `Q${CX - BASE_HALF / 2} ${BASE_Y - BASE_HEIGHT / 2} ${CX - BASE_TOP_HALF} ${BASE_Y - BASE_HEIGHT} ` +
    `L${CX + BASE_TOP_HALF} ${BASE_Y - BASE_HEIGHT} ` +
    `Q${CX + BASE_HALF / 2} ${BASE_Y - BASE_HEIGHT / 2} ${CX + BASE_HALF} ${BASE_Y} ` +
    `Q${CX} ${BASE_Y + WOBBLE_AMP} ${CX - BASE_HALF} ${BASE_Y} Z`;

  const postD = `M${CX - POST_HALF} ${BASE_Y} ` +
    `Q${CX - POST_HALF - WOBBLE_AMP} ${(BASE_Y + PIVOT_Y) / 2} ${CX - POST_HALF} ${PIVOT_Y} ` +
    `L${CX + POST_HALF} ${PIVOT_Y} ` +
    `Q${CX + POST_HALF + WOBBLE_AMP} ${(BASE_Y + PIVOT_Y) / 2} ${CX + POST_HALF} ${BASE_Y} Z`;

  const beamD = `M${CX - BEAM_HALF} ${PIVOT_Y - BEAM_HALF_THICK} ` +
    `Q${CX} ${PIVOT_Y - BEAM_HALF_THICK - WOBBLE_AMP} ${CX + BEAM_HALF} ${PIVOT_Y - BEAM_HALF_THICK} ` +
    `L${CX + BEAM_HALF} ${PIVOT_Y + BEAM_HALF_THICK} ` +
    `Q${CX} ${PIVOT_Y + BEAM_HALF_THICK + WOBBLE_AMP} ${CX - BEAM_HALF} ${PIVOT_Y + BEAM_HALF_THICK} Z`;

  const pivotDotD = `M${CX - PIVOT_RADIUS} ${PIVOT_Y} ` +
    `A${PIVOT_RADIUS} ${PIVOT_RADIUS} 0 1 0 ${CX + PIVOT_RADIUS} ${PIVOT_Y} ` +
    `A${PIVOT_RADIUS} ${PIVOT_RADIUS} 0 1 0 ${CX - PIVOT_RADIUS} ${PIVOT_Y} Z`;

  const labelX = CARD_W / 2;
  const labelY = BASE_Y + LABEL_GAP + LABEL;
  const pivot = {x: CX, y: PIVOT_Y};

  return {
    at,
    drawAt,
    drawEnd,
    leftAt,
    rightAt,
    tiltAt,
    tiltEnd,
    leftLabelAt,
    rightLabelAt,
    labelAt,
    end,
    leftLabelEnd,
    rightLabelEnd,
    labelEnd,
    angleAt,
    arms,
    baseD,
    postD,
    beamD,
    pivotDotD,
    labelX,
    labelY,
    pivot,
  };
};
