import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGameState } from "@/lib/stores/useGameState";

export function DoorTrigger() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const phase = useGameState((state) => state.phase);
  const playerPosition = useGameState((state) => state.playerPosition);
  const materialsCollected = useGameState((state) => state.materialsCollected);
  const totalMaterials = useGameState((state) => state.totalMaterials);
  const endGame = useGameState((state) => state.endGame);
  const shrinkFactor = useGameState((state) => state.roomShrinkFactor);
  
  const doorZ = (40 * shrinkFactor) / 2 - 0.3;
  const doorPosition: [number, number, number] = [0, 1.2, doorZ];
  
  useFrame(() => {
    if (phase !== "playing") return;
    if (materialsCollected < totalMaterials) return;
    
    const dist = Math.sqrt(
      Math.pow(playerPosition[0] - doorPosition[0], 2) +
      Math.pow(playerPosition[1] - doorPosition[1], 2) +
      Math.pow(playerPosition[2] - doorPosition[2], 2)
    );
    
    if (dist < 1.5) {
      endGame(true);
    }
    
    if (meshRef.current) {
      const emissive = meshRef.current.material as THREE.MeshStandardMaterial;
      const pulse = 0.3 + Math.sin(Date.now() * 0.005) * 0.3;
      emissive.emissiveIntensity = pulse;
    }
  });
  
  if (materialsCollected < totalMaterials) return null;
  
  return (
    <mesh ref={meshRef} position={doorPosition}>
      <boxGeometry args={[1.5, 2.5, 0.3]} />
      <meshStandardMaterial
        color="#4caf50"
        emissive="#4caf50"
        emissiveIntensity={0.3}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}
