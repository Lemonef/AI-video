import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile,interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

// Ink Explainer vocabulary rebuilt in code (study: brain research/channels/2026-11-14-ink-explainer-look-study.md).
// Three card kinds cut every ~3 s: SCENE (painted-flat + stickman), TITLE (white hand-lettered), DIAGRAM (X/check, labelled arrows).
export const FPS = 30;
const SLIDE = 90; // 3 s, same cut rhythm as the reference (3.0 s)

const INK = '#1b1b1f';
const PAPER = '#fbfaf6';
const TEAL = '#1f8a8a';
const ORANGE = '#e8862b';
const GREEN = '#2f9e5b';
const RED = '#d6453d';
const FONT = "'Ink Free','Segoe Print','Comic Sans MS',cursive";
const LINE = 9;

// ---------- primitives ----------
const useIn = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping}});
};

const Words: React.FC<{text: string; size: number; color?: string; delay?: number; step?: number}> = ({text, size, color = INK, delay = 0, step = 4}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{fontFamily: FONT, fontSize: size, fontWeight: 700, color, textAlign: 'center', lineHeight: 1.12, letterSpacing: 2, textTransform: 'uppercase'}}>
      {text.split(' ').map((w, i) => {
        const p = spring({frame: frame - delay - i * step, fps, config: {damping: 12}});
        return (
          <span key={i} style={{display: 'inline-block', marginRight: size * 0.28, opacity: p, transform: `translateY(${(1 - p) * 26}px) rotate(${(1 - p) * -3}deg)`}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

// hand-drawn underline that draws on
const Underline: React.FC<{w: number; delay: number; color?: string}> = ({w, delay, color = ORANGE}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg width={w} height={34} viewBox={`0 0 ${w} 34`}>
      <path d={`M6 20 Q ${w * 0.25} 4 ${w * 0.5} 18 T ${w - 6} 14`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} />
    </svg>
  );
};

// ---------- stickman (host: teal scarf, orange bag, white gloves) ----------
type Mood = 'smirk' | 'worry' | 'think';
const Stick: React.FC<{x: number; y: number; s?: number; mood?: Mood; armL?: number; armR?: number; prop?: 'tower' | 'case' | 'paper' | 'none'; flip?: boolean; bob?: number; scarf?: boolean; bag?: boolean; vest?: boolean; coat?: string; hat?: 'cap' | 'bowler' | 'none'; scarfColor?: string; idle?: boolean}> = ({
  x, y, s = 1, mood = 'smirk', armL = 40, armR = -40, prop = 'none', flip, bob = 0, scarf = true, bag = true, vest = false, coat, hat = 'none', scarfColor = TEAL, idle = true,
}) => {
  const frame = useCurrentFrame();
  const breathe = idle ? Math.sin(frame / 9) * 4 : 0; // slow idle bob so a held pose is not frozen
  const rad = (d: number) => (d * Math.PI) / 180;
  const arm = (len: number, deg: number, sx: number, sy: number) => ({x: sx + Math.sin(rad(deg)) * len, y: sy + Math.cos(rad(deg)) * len});
  const sh = {x: 0, y: -30};
  const L = arm(95, armL + 90, sh.x, sh.y);
  const R = arm(95, armR - 90, sh.x, sh.y);
  const mouth = mood === 'smirk' ? 'M-18 28 Q 6 40 28 22' : mood === 'worry' ? 'M-20 36 Q 0 22 20 36' : 'M-14 32 L 14 32';
  return (
    <g transform={`translate(${x} ${y + bob + breathe}) scale(${flip ? -s : s} ${s})`} stroke={INK} strokeWidth={LINE} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* floor shadow (stays on the ground while the body bobs) */}
      <ellipse cx={0} cy={198 - breathe} rx={92} ry={14} fill="#00000030" stroke="none" />
      {/* coat colour differs per figure so a crowd never reads as clones */}
      {coat && <path d="M-30 -30 L30 -30 L44 90 L-44 90 Z" fill={coat} />}
      {/* legs */}
      <path d="M0 70 L-38 190 M0 70 L38 190" />
      <path d="M-38 190 L-62 192 M38 190 L62 192" />
      {/* torso */}
      <path d="M0 -30 L0 70" />
      {vest && <path d="M-26 -10 L0 70 L26 -10" fill="#7a5a3a" stroke={INK} />}
      {bag && <rect x={-4} y={20} width={44} height={34} rx={6} fill={ORANGE} />}
      {/* arms + gloves */}
      <path d={`M${sh.x} ${sh.y} L${L.x} ${L.y}`} />
      <path d={`M${sh.x} ${sh.y} L${R.x} ${R.y}`} />
      <circle cx={L.x} cy={L.y} r={13} fill="#fff" />
      <circle cx={R.x} cy={R.y} r={13} fill="#fff" />
      {prop === 'tower' && <Tower x={L.x} y={L.y - 4} k={0.28} />}
      {prop === 'case' && <rect x={R.x - 40} y={R.y - 4} width={80} height={52} rx={8} fill="#8a5a2b" />}
      {prop === 'paper' && <rect x={L.x - 30} y={L.y - 70} width={60} height={80} fill="#fff" />}
      {/* head */}
      <circle cx={0} cy={-100} r={64} fill="#fff" />
      <circle cx={-22} cy={-108} r={5} fill={INK} stroke="none" />
      <circle cx={22} cy={-108} r={5} fill={INK} stroke="none" />
      <path d={mood === 'worry' ? 'M-34 -128 L-12 -120 M34 -128 L12 -120' : 'M-34 -122 L-12 -126 M34 -122 L12 -126'} strokeWidth={6} />
      <g transform="translate(0 -100)">
        <path d={mouth} strokeWidth={6} />
      </g>
      {hat === 'cap' && <path d="M-52 -138 Q0 -190 52 -138 L70 -132 L-52 -126 Z" fill="#5a4a3a" />}
      {hat === 'bowler' && <g fill="#2b2b2b"><path d="M-40 -150 Q0 -215 40 -150 Z" /><path d="M-66 -148 L66 -148" strokeWidth={10} /></g>}
      {/* scarf */}
      {scarf && (
        <g stroke={INK}>
          <path d="M-42 -42 Q 0 -22 42 -42 L 36 -22 Q 0 -4 -36 -22 Z" fill={scarfColor} />
          <path d="M30 -24 L 52 24 L 34 28 L 20 -10" fill={scarfColor} />
        </g>
      )}
    </g>
  );
};

const Tower: React.FC<{x: number; y: number; k: number; fill?: string; lattice?: boolean}> = ({x, y, k, fill = INK, lattice = false}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} stroke={INK} strokeWidth={Math.min(LINE / k, 14)} fill={fill} strokeLinejoin="round">
    <path d="M0 -430 L-26 -260 L-70 -120 L-130 0 L-80 0 L-40 -90 L40 -90 L80 0 L130 0 L70 -120 L26 -260 Z" />
    {lattice && <path d="M-26 -260 L26 -260 M-70 -120 L70 -120 M-40 -90 L40 -90" stroke={PAPER} strokeWidth={14} fill="none" />}
  </g>
);

// ---------- scene backdrop (muted flat colour per chapter) ----------
const Dust: React.FC<{n?: number; color?: string}> = ({n = 26, color = '#fff'}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({length: n}).map((_, i) => {
        const seed = (i * 9301 + 49297) % 233280;
        const px = (seed / 233280) * 1920;
        const py = ((frame * (0.4 + (i % 5) * 0.15) + (seed % 1080)) % 1080);
        const r = 2 + (i % 3);
        return <circle key={i} cx={(px + Math.sin(frame / 30 + i) * 20) % 1920} cy={py} r={r} fill={color} opacity={0.45} />;
      })}
    </>
  );
};

const SceneBG: React.FC<{sky: [string, string]; ground: string; tower?: boolean; tint?: string}> = ({sky, ground, tower, tint}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    <defs>
      <linearGradient id={`sky${sky[0]}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={sky[0]} />
        <stop offset="1" stopColor={sky[1]} />
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill={`url(#sky${sky[0]})`} />
    <circle cx={1500} cy={300} r={120} fill="#fff" opacity={0.35} />
    {tower && <Tower x={1360} y={820} k={1.5} fill="#5b5148" lattice />}
    {/* building silhouettes */}
    <g fill="#00000022">
      <rect x={60} y={560} width={220} height={300} />
      <rect x={300} y={620} width={180} height={240} />
      <rect x={520} y={520} width={150} height={340} />
    </g>
    <rect y={820} width={1920} height={260} fill={ground} />
    <g stroke="#00000018" strokeWidth={4}>
      {Array.from({length: 14}).map((_, i) => (
        <path key={i} d={`M${i * 150 - 40} 1080 L${i * 120 + 300} 820`} />
      ))}
    </g>
    {tint && <rect width={1920} height={1080} fill={tint} />}
  </svg>
);

const Scene: React.FC<{sky: [string, string]; ground: string; tower?: boolean; tint?: string; zoom?: [number, number]; children?: React.ReactNode; dust?: boolean; len?: number; chip?: string; caption?: string; plate?: string}> = ({sky, ground, tower, tint, zoom = [1.0, 1.1], children, dust = true, len = SLIDE, chip, caption, plate}) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, len], zoom, {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 60%'}}>
        {plate ? <Img src={staticFile(plate)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} /> : <SceneBG sky={sky} ground={ground} tower={tower} tint={tint} />}
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>{children}</svg>
        {dust && (
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <Dust />
          </svg>
        )}
      </AbsoluteFill>
      <Vignette />
      {chip && <Chip text={chip} />}
      {caption && <CaptionPill text={caption} />}
      <Watermark />
    </AbsoluteFill>
  );
};

// Ref lessons (research/channels/2026-11-14-beanie-gly2-ink-lessons.md): edge vignette, corner HUD chip, bottom-centre caption pill.
const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 58%, #0000003d 100%)', pointerEvents: 'none'}} />
);

const Chip: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 48, top: 40, padding: '10px 26px', background: PAPER, border: `${LINE}px solid ${INK}`, borderRadius: 14, color: INK, fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 44, letterSpacing: 2}}>{text}</div>
);

const CaptionPill: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 20, display: 'flex', justifyContent: 'center'}}>
    <div style={{padding: '8px 34px', background: '#000000b8', borderRadius: 40, color: '#fff', fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 56}}>{text}</div>
  </div>
);

// Channel mark (Zen 2026-11-16 picked GPT logo #10). PNG built by
// videos/pastly-life/brand/logo/watermark/make_wm_rewind.py into the public dir.
// Size/opacity match the approved corner mockup (WM_HEIGHT=72, opacity 0.8 there); change together.
const WM_SIZE = 72;
const WM_OPACITY = 0.8;
const Watermark: React.FC = () => (
  <Img
    src={staticFile('brand/wm_rewind.png')}
    style={{position: 'absolute', right: 36, bottom: 30, width: WM_SIZE, height: WM_SIZE, opacity: WM_OPACITY}}
  />
);

// ---------- white cards ----------
const Card: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: PAPER, alignItems: 'center', justifyContent: 'center'}}>
    {children}
    <Watermark />
  </AbsoluteFill>
);

const TitleCard: React.FC<{lines: string[]; accent?: string; icon?: 'tower' | 'flame' | 'coin'}> = ({lines, accent, icon}) => {
  const p = useIn(2);
  return (
    <Card>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, maxWidth: 1500}}>
        {lines.map((l, i) => (
          <Words key={i} text={l} size={i === 0 ? 150 : 120} color={accent && i === lines.length - 1 ? ORANGE : INK} delay={i * 14} />
        ))}
        <Underline w={560} delay={lines.length * 14} />
        {icon && (
          <svg width={150} height={150} viewBox="-75 -75 150 150" style={{opacity: p, transform: `scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -12}deg)`}}>
            {icon === 'tower' && <Tower x={0} y={64} k={0.3} fill={TEAL} />}
            {icon === 'coin' && (
              <g stroke={INK} strokeWidth={7} fill="#e8b92b">
                <circle r={52} />
                <circle r={32} fill="none" />
              </g>
            )}
            {icon === 'flame' && <path d="M0 -60 Q 40 -10 30 30 Q 0 66 -30 30 Q -40 -10 0 -60" fill={ORANGE} stroke={INK} strokeWidth={7} />}
          </svg>
        )}
      </div>
    </Card>
  );
};

const CompareCard: React.FC<{left: string; right: string; head: string}> = ({left, right, head}) => {
  const a = useIn(8);
  const b = useIn(24);
  const dash = interpolate(useCurrentFrame(), [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <Card>
      <div style={{position: 'absolute', top: 70, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Words text={head} size={112} />
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d="M960 230 L960 980" stroke={INK} strokeWidth={6} strokeDasharray="22 18" strokeLinecap="round" pathLength={1} opacity={dash} />
        {/* X */}
        <g transform={`translate(480 400) scale(${a})`} stroke={RED} strokeWidth={26} strokeLinecap="round">
          <path d="M-70 -70 L70 70 M70 -70 L-70 70" />
        </g>
        {/* check */}
        <g transform={`translate(1440 400) scale(${b})`} stroke={GREEN} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M-80 0 L-24 60 L84 -70" />
        </g>
      </svg>
      <div style={{position: 'absolute', top: 560, left: 120, width: 720, opacity: a}}>
        <Words text={left} size={96} color={RED} delay={10} />
      </div>
      <div style={{position: 'absolute', top: 560, left: 1080, width: 720, opacity: b}}>
        <Words text={right} size={96} color={GREEN} delay={26} />
      </div>
    </Card>
  );
};

// arrow that draws on
const Arrow: React.FC<{d: string; delay: number; head: [number, number, number]}> = ({d, delay, head}) => {
  const t = interpolate(useCurrentFrame() - delay, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} />
      <g opacity={t > 0.95 ? 1 : 0} transform={`translate(${head[0]} ${head[1]}) rotate(${head[2]})`}>
        <path d="M-22 -16 L0 0 L-22 16" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
};

const LabelCard: React.FC<{title: string; a: string; b: string}> = ({title, a, b}) => {
  const frame = useCurrentFrame();
  const glow = 0.5 + 0.5 * Math.sin(frame / 6);
  const pop = useIn(4);
  return (
    <Card>
      <div style={{position: 'absolute', top: 60, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Words text={title} size={120} />
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g transform={`scale(${pop})`} style={{transformOrigin: '960px 700px'}}>
          <circle cx={960} cy={600} r={170 + glow * 14} fill="none" stroke={ORANGE} strokeWidth={6} opacity={0.55} />
          <Tower x={960} y={900} k={1.4} fill={TEAL} lattice />
        </g>
        <Arrow d="M520 440 Q 700 440 860 560" delay={22} head={[868, 566, 35]} />
        <Arrow d="M1400 760 Q 1220 760 1060 700" delay={36} head={[1052, 696, 200]} />
      </svg>
      <div style={{position: 'absolute', left: 120, top: 380, width: 420, opacity: frame > 18 ? 1 : 0}}>
        <Words text={a} size={78} delay={18} />
      </div>
      <div style={{position: 'absolute', right: 110, top: 740, width: 420, opacity: frame > 32 ? 1 : 0}}>
        <Words text={b} size={78} delay={32} />
      </div>
    </Card>
  );
};

// ---------- slides ----------
const Shout: React.FC<{text: string}> = ({text}) => {
  const p = useIn(10, 10);
  return (
    <div style={{position: 'absolute', top: 90, width: '100%', display: 'flex', justifyContent: 'center', opacity: p, transform: `scale(${0.85 + 0.15 * p})`}}>
      <div style={{background: PAPER, border: `8px solid ${INK}`, borderRadius: 24, padding: '10px 36px'}}>
        <Words text={text} size={70} delay={10} />
      </div>
    </div>
  );
};

const S1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene sky={['#f6d9a8', '#e8a96b']} ground="#b88c5a" tower zoom={[1.0, 1.12]}>
      <Stick x={560} y={660} s={2.1} mood="smirk" armL={20} armR={75} prop="tower" bob={Math.sin(f / 9) * 5} />
    </Scene>
  );
};
const S2: React.FC = () => <TitleCard lines={['Paris,', '1925.']} icon="tower" />;
const S3: React.FC = () => <TitleCard lines={['One man sold', 'the Eiffel Tower.', 'Twice.']} accent="x" />;
const S4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene sky={['#cfdbe2', '#9fb3bf']} ground="#6b7c86" zoom={[1.15, 1.0]}>
      <Stick x={960} y={620} s={2.4} mood="smirk" armL={30} armR={-25} bob={Math.sin(f / 10) * 4} />
      <g transform="translate(1250 560)"><rect width={120} height={260} rx={10} fill="#8d6d4b" stroke={INK} strokeWidth={LINE} /><path d="M20 70 L100 70 M20 140 L100 140" stroke={INK} strokeWidth={6} /></g>
    </Scene>
  );
};
const S5: React.FC = () => <CompareCard head="Who owned it?" left="Not him." right="Paper said so." />;
const S6: React.FC = () => <LabelCard title="Repairs cost a fortune" a="Rust + repairs" b="Tons of iron" />;
const S7: React.FC = () => <TitleCard lines={['Six scrap dealers.', 'One hotel room.']} icon="coin" accent="x" />;
const S8: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene sky={['#2a3550', '#16203a']} ground="#1d2640" tint="#0b132a33" zoom={[1.0, 1.1]}>
      <Stick x={640} y={640} s={2.1} mood="smirk" armL={0} armR={60} />
      <Stick x={1280} y={660} s={1.8} mood="worry" armL={-20} armR={70} prop="case" scarf={false} bag={false} vest flip bob={Math.sin(f / 8) * 5} />
    </Scene>
  );
};
const S9: React.FC = () => <CompareCard head="The tower?" left="Never moved." right="He got paid." />;

// engine exports (src/ink/ep1.tsx builds the data-driven episode from these)
// AI-drawn cast sprite (Codex GPT-image, magenta-keyed by tools/cut_sprites.py). Replaces code-drawn Stick for Route A:
// Zen 2026-11-15 "stickman look ass" - characters must be image-model quality like the host sheet.
// Lives inside Scene's <svg>; x = horizontal centre, y = feet line. Box width only caps wide poses (suitcase, arms out); aspect is kept.
const SPRITE_BOX_W = 900;
const Sprite: React.FC<{src: string; x: number; y: number; h: number; flip?: boolean; bob?: number}> = ({src, x, y, h, flip, bob = 0}) => {
  const frame = useCurrentFrame();
  const dy = Math.sin(frame / 14 + bob) * 3; // idle breathe, not a walk cycle (Route A rule)
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={6} rx={h * 0.26} ry={h * 0.03} fill="#00000040" />
      <g transform={`translate(0 ${dy}) scale(${flip ? -1 : 1} 1)`}>
        <image href={staticFile(src)} x={-SPRITE_BOX_W / 2} y={-h} width={SPRITE_BOX_W} height={h} preserveAspectRatio="xMidYMax meet" />
      </g>
    </g>
  );
};

export {Sprite, Stick, Scene, TitleCard, CompareCard, LabelCard, INK, PAPER, TEAL, ORANGE, LINE};
// scene building blocks for compositions that need their own camera layer (src/ink/ep_directed.tsx); export only, behaviour unchanged
export {Tower, Dust, Vignette, Chip, CaptionPill, Watermark, FONT};

const SLIDES: React.FC[] = [S1, S2, S3, S4, S5, S6, S7, S8, S9];
export const INK_PROOF_FRAMES = SLIDES.length * SLIDE;

// 10 s fully produced excerpt: title -> hook line -> host scene, cut to the voice (public/ink10/master.wav = VO + SFX + music)
export const INK10_FRAMES = 300;
export const Ink10: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    <Sequence from={0} durationInFrames={SLIDE}><S2 /></Sequence>
    <Sequence from={SLIDE} durationInFrames={SLIDE}><S3 /></Sequence>
    <Sequence from={2 * SLIDE} durationInFrames={INK10_FRAMES - 2 * SLIDE}><S4 /></Sequence>
    <Audio src={staticFile('ink10/master.wav')} />
  </AbsoluteFill>
);

export const InkProof: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    {SLIDES.map((C, i) => (
      <Sequence key={i} from={i * SLIDE} durationInFrames={SLIDE}>
        <C />
      </Sequence>
    ))}
  </AbsoluteFill>
);
export {Words, Underline, Card, useIn, GREEN, RED};
