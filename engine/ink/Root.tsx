import {InkShortEp01S01, INK_SHORT_EP01_S01_FRAMES, InkShortEp01S02, INK_SHORT_EP01_S02_FRAMES} from './compositions/InkShort';
import {Composition} from 'remotion';
import {CardLibrary, CARD_LIBRARY_FRAMES} from './compositions/CardLibrary';
import {CardLibrary2, CARD_LIBRARY2_FRAMES} from './compositions/CardLibrary2';
import {InkFirstMin, INK_FIRSTMIN_FRAMES, InkFirstMinV2, INK_FIRSTMIN_V2_FRAMES, InkFirstMinV3, INK_FIRSTMIN_V3_FRAMES, InkFirstMinV5, INK_FIRSTMIN_V5_FRAMES, InkFirstMinV6, INK_FIRSTMIN_V6_FRAMES, InkBuilt, INK_BUILT_FRAMES, InkEp01Full, INK_EP01_FULL_FRAMES, InkEp01V11B, INK_EP01_V11B_FRAMES, InkEp02Min1Hybrid, INK_EP02_MIN1_HYBRID_FRAMES, InkEp02Min1Straight, INK_EP02_MIN1_STRAIGHT_FRAMES, InkEp02Full, INK_EP02_FULL_FRAMES} from './compositions/InkParts';
import {Test10} from './compositions/Test10';
import {SlideProof, SLIDE_PROOF_FRAMES} from './compositions/SlideProof';
import {InkProof, INK_PROOF_FRAMES, Ink10, INK10_FRAMES} from './compositions/InkProof';
import {InkFull, INKFULL_FRAMES} from './ink/ep_full';
import {InkDirected, INKDIRECTED_FRAMES, calcInkDirected, DIRECTED_DEFAULT} from './ink/ep_directed';
import {Ink60, INK60_FRAMES, INK15_FRAMES} from './ink/ep1';
export const Root = () => (
  <>
    <Composition id="InkShortEp01S01" component={InkShortEp01S01} width={1080} height={1920} fps={30} durationInFrames={INK_SHORT_EP01_S01_FRAMES}/>
    <Composition id="InkShortEp01S02" component={InkShortEp01S02} width={1080} height={1920} fps={30} durationInFrames={INK_SHORT_EP01_S02_FRAMES}/>
    <Composition id="CardLibrary" component={CardLibrary} width={1920} height={1080} fps={30} durationInFrames={CARD_LIBRARY_FRAMES}/>
    <Composition id="CardLibrary2" component={CardLibrary2} width={1920} height={1080} fps={30} durationInFrames={CARD_LIBRARY2_FRAMES}/>
    <Composition id="InkFirstMin" component={InkFirstMin} width={1920} height={1080} fps={30} durationInFrames={INK_FIRSTMIN_FRAMES}/>
    <Composition id="InkFirstMinV2" component={InkFirstMinV2} width={1920} height={1080} fps={30} durationInFrames={INK_FIRSTMIN_V2_FRAMES}/>
    <Composition id="InkFirstMinV3" component={InkFirstMinV3} width={1920} height={1080} fps={30} durationInFrames={INK_FIRSTMIN_V3_FRAMES}/>
    <Composition id="InkFirstMinV5" component={InkFirstMinV5} width={1920} height={1080} fps={30} durationInFrames={INK_FIRSTMIN_V5_FRAMES}/>
    <Composition id="InkFirstMinV6" component={InkFirstMinV6} width={1920} height={1080} fps={30} durationInFrames={INK_FIRSTMIN_V6_FRAMES}/>
    <Composition id="InkBuilt"component={InkBuilt} width={1920} height={1080} fps={30} durationInFrames={INK_BUILT_FRAMES}/>
    <Composition id="InkEp01Full" component={InkEp01Full} width={1920} height={1080} fps={30} durationInFrames={INK_EP01_FULL_FRAMES}/>
    <Composition id="InkEp01V11B" component={InkEp01V11B} width={1920} height={1080} fps={30} durationInFrames={INK_EP01_V11B_FRAMES}/>
    <Composition id="InkEp02Min1Hybrid" component={InkEp02Min1Hybrid} width={1920} height={1080} fps={30} durationInFrames={INK_EP02_MIN1_HYBRID_FRAMES}/>
    <Composition id="InkEp02Min1Straight" component={InkEp02Min1Straight} width={1920} height={1080} fps={30} durationInFrames={INK_EP02_MIN1_STRAIGHT_FRAMES}/>
    <Composition id="InkEp02Full" component={InkEp02Full} width={1920} height={1080} fps={30} durationInFrames={INK_EP02_FULL_FRAMES}/>
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
