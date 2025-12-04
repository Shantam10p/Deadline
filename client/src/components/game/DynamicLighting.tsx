import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGameState } from "@/lib/stores/useGameState";

export function DynamicLighting() {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const pointRef = useRef<THREE.PointLight>(null);
  
  const timeRemaining = useGameState((state) => state.timeRemaining);
  const phase = useGameState((state) => state.phase);
  
  useFrame(() => {
    if (phase !== "playing") return;
    
    const progress = 1 - timeRemaining / 90;
    
    const r = 1.0 - progress * 0.3;
    const g = 0.95 - progress * 0.5;
    const b = 0.9 - progress * 0.7;
    
    if (ambientRef.current) {
      ambientRef.current.color.setRGB(r, g, b);
      ambientRef.current.intensity = 0.4 - progress * 0.15;
    }
    
    if (directionalRef.current) {
      directionalRef.current.color.setRGB(r, g, b);
      directionalRef.current.intensity = 0.8 - progress * 0.3;
    }
    
    if (pointRef.current) {
      const warmR = 1.0;
      const warmG = 0.8 - progress * 0.4;
      const warmB = 0.6 - progress * 0.5;
      pointRef.current.color.setRGB(warmR, warmG, warmB);
      pointRef.current.intensity = 0.5 + progress * 0.3;
    }
  });
  
  return (
    <>
      <ambientLight ref={ambientRef} color="#fff5e6" intensity={0.4} />
      
      <directionalLight
        ref={directionalRef}
        position={[5, 10, 5]}
        intensity={0.8}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      <pointLight
        ref={pointRef}
        position={[0, 3.5, 0]}
        intensity={0.5}
        color="#ffcc88"
        distance={15}
        decay={2}
      />
      
      <pointLight
        position={[3, 1.5, -4]}
        intensity={0.2}
        color="#4488ff"
        distance={5}
      />
    </>
  );
}
