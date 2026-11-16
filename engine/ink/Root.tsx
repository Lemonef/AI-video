import {Composition} from 'remotion';
import {InkFirstMin, INK_FIRSTMIN_FRAMES, InkFirstMinV2, INK_FIRSTMIN_V2_FRAMES, InkFirstMinV3, INK_FIRSTMIN_V3_FRAMES, InkFirstMinV5, INK_FIRSTMIN_V5_FRAMES, InkBuilt, INK_BUILT_FRAMES} from './compositions/InkParts';
import {Test10} from './compositions/Test10';
import {SlideProof, SLIDE_PROOF_FRAMES} from './compositions/SlideProof';
import {InkProof, INK_PROOF_FRAMES, Ink10, INK10_FRAMES} from './compositions/InkProof';
import {InkFull, INKFULL_FRAMES} from './ink/ep_full';
import {InkDirected, INKDIRECTED_FRAMES, calcInkDirected, DIRECTED_DEFAULT} from './ink/ep_directed';
import {Ink60, INK60_FRAMES, INK15_FRAMES} from './ink/ep1';
export const Root = () => (
  <>
    <Composition id="InkFirstMin" component={InkFirstMin} width={1920} height={1080} fps={30} durationInFrames={INK_FIRSTMIN_FRAMES}/>
    <Composition id="InkFirstMinV2" component={InkFirstMinV2} width={1920} height={1080} fps={30} durationInFrames={INK_FIRSTMIN_V2_FRAMES}/>
    <Composition id="InkFirstMinV3" component={InkFirstMinV3} width={1920} height={1080} fps={30} durationInFrames={INK_FIRSTMIN_V3_FRAMES}/>
    <Composition id="InkFirstMinV5" component={InkFirstMinV5} width={1920} height={1080} fps={30} durationInFrames={INK_FIRSTMIN_V5_FRAMES}/>
    <Composition id="InkBuilt"component={InkBuilt} width={1920} height={1080} fps={30} durationInFrames={INK_BUILT_FRAMES}/>
    <Composition id="Test10" component={Test10} width={1920} height={1080} fps={30} durationInFrames={330}/>
    <Composition id="SlideProof" component={SlideProof} width={1920} height={1080} fps={30} durationInFrames={SLIDE_PROOF_FRAMES}/>
    <Composition id="InkProof" component={InkProof} width={1920} height={1080} fps={30} durationInFrames={INK_PROOF_FRAMES}/>
    <Composition id="Ink60" component={Ink60} width={1920} height={1080} fps={30} durationInFrames={INK60_FRAMES}/>
    <Composition id="Ink15" component={Ink60} width={1920} height={1080} fps={30} durationInFrames={INK15_FRAMES}/>
    <Composition id="Ink10"component={Ink10} width={1920} height={1080} fps={30} durationInFrames={INK10_FRAMES}/>
    <Composition id="InkFull" component={InkFull} width={1920} height={1080} fps={30} durationInFrames={INKFULL_FRAMES}/>
    <Composition id="InkDirected" component={InkDirected} width={1920} height={1080} fps={30} durationInFrames={INKDIRECTED_FRAMES} defaultProps={{directed: DIRECTED_DEFAULT, resolved: null}} calculateMetadata={calcInkDirected}/>
  </>
);
