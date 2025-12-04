import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGameState } from "@/lib/stores/useGameState";
import { DormRoom } from "./DormRoom";
import { Player } from "./Player";
import { StudyMaterials } from "./StudyMaterials";
import { Distractions } from "./Distractions";
import { PowerUps } from "./PowerUps";
import { DynamicLighting } from "./DynamicLighting";
import { DoorTrigger } from "./DoorTrigger";
import { GameUI } from "./GameUI";

function GameLoop() {
  const phase = useGameState((state) => state.phase);
  const updateTime = useGameState((state) => state.updateTime);
  const updatePowerUps = useGameState((state) => state.updatePowerUps);
  const updateRoomShrink = useGameState((state) => state.updateRoomShrink);
  
  useFrame((_, delta) => {
    if (phase !== "playing") return;
    
    updateTime(delta);
    updatePowerUps();
    updateRoomShrink();
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
      
      <fog attach="fog" args={["#1a1a2e", 8, 20]} />
    </>
  );
}

export function Game() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas
        shadows
        camera={{
          position: [0, 1.6, 3],
          fov: 75,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          powerPreference: "default",
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
        
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>
      
      <GameUI />
    </div>
  );
}
