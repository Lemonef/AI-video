// Single source of truth for the rig's look. Everything else derives from here.
export const TOKENS = {
  // Output frame of the Remotion composition (full HD, 16:9).
  frame: {w: 1920, h: 1080},
  character: {
    // 0.42 of frame height: big enough to read gestures, small enough to leave room for set dressing.
    heightFrac: 0.42,
    // Head DIAMETER as a fraction of total height: 0.16 gives a friendly, slightly large round head (~6 heads tall).
    headFrac: 0.16,
  },
  line: {
    // Line width as a fraction of character height: 0.022 keeps limbs bold enough to read at video scale yet clearly line art.
    weightFrac: 0.022,
  },
  // Muted warm sepia / teal / slate family; no red or yellow hues so they never clash.
  palette: {
    ink: '#2b3138', // dark slate: strokes, high contrast on paper
    paper: '#efe6d6', // warm off-white background
    sepia: '#8a6a4a', // warm mid-tone for props
    teal: '#4f7f80', // cool accent
    slate: '#5d6b78', // neutral secondary
  },
};

// Character height in pixels, derived from the frame token (never hard-coded).
export function characterHeightPx() {
  return Math.round(TOKENS.frame.h * TOKENS.character.heightFrac);
}
