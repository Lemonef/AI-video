// Smoke test for the jaab3d engine: one lit box on a floor, rendered through @remotion/three.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <color attach="background" args={["#9cc4e8"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 8, 3]} intensity={2.2} />
      <mesh rotation={[0, f * 0.03, 0]} position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial color="#e8a54b" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial color="#8a8f7a" />
      </mesh>
    </>
  );
};

export const Smoke: React.FC = () => (
  <AbsoluteFill>
    <ThreeCanvas width={1080} height={1920} camera={{ fov: 40, position: [3, 2.2, 4] }} onCreated={({ camera }) => camera.lookAt(0, 0.5, 0)}>
      <Scene />
    </ThreeCanvas>
  </AbsoluteFill>
);
