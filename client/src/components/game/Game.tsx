import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useGameState } from "@/lib/stores/useGameState";
import { DormRoom } from "./DormRoom";
import { Player } from "./Player";
import { StudyMaterials } from "./StudyMaterials";
import { Distractions } from "./Distractions";
import { PowerUps } from "./PowerUps";
import { DynamicLighting } from "./DynamicLighting";
import { DoorTrigger } from "./DoorTrigger";
import { GameUI } from "./GameUI";
import { MiniGames } from "./MiniGames";

function GameLoop() {
  const phase = useGameState((state) => state.phase);
  const activeMiniGame = useGameState((state) => state.activeMiniGame);
  const updateTime = useGameState((state) => state.updateTime);
  const updatePowerUps = useGameState((state) => state.updatePowerUps);
  const updateRoomShrink = useGameState((state) => state.updateRoomShrink);
  
  useFrame((_, delta) => {
    if (phase !== "playing") return;
    
    // Timer always runs
    updateTime(delta);
    
    // Only update power-ups and room shrink when not in a task
    if (!activeMiniGame) {
      updatePowerUps();
      updateRoomShrink();
    }
  });
  
  return null;
}

function GameScene() {
  const phase = useGameState((state) => state.phase);
  
  return (
    <>
      <DynamicLighting />
      <GameLoop />
      
      <DormRoom />
      
      <Player />
      
      {phase === "playing" && (
        <>
          <StudyMaterials />
          <Distractions />
          <PowerUps />
          <DoorTrigger />
        </>
      )}
      
      <fog attach="fog" args={["#1a1a2e", 12, 40]} />
    </>
  );
}

export function Game() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas
        dpr={[1, 1.5]}
        shadows
        camera={{
          position: [0, 1.6, 3],
          fov: 75,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: false,
          powerPreference: "default",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <color attach="background" args={["#0a0a15"]} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.3} luminanceThreshold={0.4} luminanceSmoothing={0.05} />
        </EffectComposer>
        
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>
      
      <GameUI />
      <MiniGames />
    </div>
  );
}
