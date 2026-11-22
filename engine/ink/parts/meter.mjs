// HUD survival-odds meter math, pure and shared by the renderer and its tests.
export const METER_MAX = 100;
export const METER_DANGER = 25; // at or below this the bar inks red
// 0.6 s at the 30 fps composition rate (FPS in InkProof.tsx); change together.
export const METER_TWEEN = 18;

/**
 * @typedef {{value: number, from?: number}} Meter
 */

/**
 * Eased meter reading for a shot-local frame: cubic in-out from `from` to `value` over METER_TWEEN frames.
 * A missing `from` means no motion. Inputs and the result clamp to 0..METER_MAX; negative frames act like 0.
 * @param {Meter} meter
 * @param {number} frame
 * @returns {number}
 */
export const meterAt = (meter, frame) => {
  const clamp = (n) => Math.min(METER_MAX, Math.max(0, n));
  const value = clamp(meter.value);
  const from = clamp(meter.from ?? meter.value);
  const t = Math.min(1, Math.max(0, frame / METER_TWEEN));
  const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  return clamp(from + (value - from) * eased);
};

/**
 * @param {number} v
 * @returns {'red' | 'ink'}
 */
export const meterTone = (v) => v <= METER_DANGER ? 'red' : 'ink';
