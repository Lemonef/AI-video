// Entry for the jaab3d 3D shorts (2D cards in a 3D world). Rendered alone with --public-dir=public3d.
import React from "react";
import { Composition, registerRoot } from "remotion";
import { Smoke } from "./Smoke";
import { Mood01, MOOD01_FRAMES, FPS } from "./Mood01";

const Root: React.FC = () => (
  <>
    <Composition id="Smoke" component={Smoke} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="Mood01" component={Mood01} durationInFrames={MOOD01_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
registerRoot(Root);
