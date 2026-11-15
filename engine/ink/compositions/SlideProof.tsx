import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';

// Ink-Explainer-style slideshow proof: stills + slow Ken Burns + ~3 s cuts + captions + voice.
const FPS = 30;
const SLIDE = 90; // 3 s per slide (matches measured Ink Explainer cut rate)
type Slide = {bg: string; fg?: string; fgFrom?: number; zoom: [number, number]; pan: [number, number]; cap: string};
const SLIDES: Slide[] = [
  {bg: 'test10/plate_street.png', zoom: [1.0, 1.18], pan: [0, -30], cap: 'Paris, nineteen twenty-five.'},
  {bg: 'test10/plate_street.png', fg: 'test10/con_full_cut.png', zoom: [1.1, 1.0], pan: [30, 0], cap: 'One man sold the Eiffel Tower.'},
  {bg: 'test10/plate_street.png', fg: 'test10/con_close_cut.png', zoom: [1.0, 1.12], pan: [0, 0], cap: 'Twice.'},
  {bg: 'test10/plate_street.png', fg: 'test10/con_full_cut.png', zoom: [1.0, 1.2], pan: [-20, 10], cap: 'His name was Victor Lustig.'},
];

const SlideView = ({s}: {s: Slide}) => {
  const f = useCurrentFrame();
  const t = f / SLIDE;
  const z = interpolate(t, [0, 1], s.zoom);
  const px = interpolate(t, [0, 1], [0, s.pan[0]]);
  const py = interpolate(t, [0, 1], [0, s.pan[1]]);
  const fade = interpolate(f, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000', opacity: fade}}>
      <AbsoluteFill style={{transform: `translate(${px}px,${py}px) scale(${z})`}}>
        <Img src={staticFile(s.bg)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        {s.fg && <Img src={staticFile(s.fg)} style={{position: 'absolute', left: 700, bottom: -40, height: 900}} />}
      </AbsoluteFill>
      <div style={{position: 'absolute', bottom: 70, width: '100%', textAlign: 'center', color: '#fff', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 78, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>{s.cap}</div>
    </AbsoluteFill>
  );
};

export const SlideProof = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('test10/vo.wav')} />
    {SLIDES.map((s, i) => (
      <Sequence key={i} from={i * SLIDE} durationInFrames={SLIDE}><SlideView s={s} /></Sequence>
    ))}
  </AbsoluteFill>
);
export const SLIDE_PROOF_FRAMES = SLIDES.length * SLIDE;
export {FPS};
