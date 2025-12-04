import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGameState } from "@/lib/stores/useGameState";

interface PowerUpProps {
  id: string;
  position: [number, number, number];
  type: "coffee" | "headphones" | "pill";
  color: string;
}

function PowerUp({ id, position, type, color }: PowerUpProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [collected, setCollected] = useState(false);
  
  const phase = useGameState((state) => state.phase);
  const playerPosition = useGameState((state) => state.playerPosition);
  const collectPowerUp = useGameState((state) => state.collectPowerUp);
  const collectedIds = useGameState((state) => state.collectedPowerUpIds);
  
  useFrame((_, delta) => {
    if (meshRef.current && !collected && !collectedIds.has(id)) {
      meshRef.current.rotation.y += delta * 3;
      
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.15;
      meshRef.current.scale.setScalar(scale);
    }
    
    if (phase === "playing" && !collected && !collectedIds.has(id)) {
      const dist = Math.sqrt(
        Math.pow(playerPosition[0] - position[0], 2) +
        Math.pow(playerPosition[1] - position[1], 2) +
        Math.pow(playerPosition[2] - position[2], 2)
      );
      
      if (dist < 1.2) {
        collectPowerUp(type, id);
        setCollected(true);
      }
    }
  });
  
  if (collected || collectedIds.has(id)) return null;
  
  const renderPowerUp = () => {
    switch (type) {
      case "coffee":
        return (
          <group>
            <mesh castShadow>
              <cylinderGeometry args={[0.1, 0.08, 0.25, 16]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0.12, 0.05, 0]} castShadow>
              <torusGeometry args={[0.05, 0.015, 8, 16, Math.PI]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      case "headphones":
        return (
          <group>
            <mesh castShadow>
              <torusGeometry args={[0.15, 0.03, 8, 32, Math.PI]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[-0.15, -0.05, 0]} castShadow>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0.15, -0.05, 0]} castShadow>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
            </mesh>
          </group>
        );
      case "pill":
        return (
          <group rotation={[0, 0, Math.PI / 4]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.05, 0.15, 8, 16]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
          </group>
        );
      default:
        return (
          <mesh castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
    }
  };
  
  return (
    <group ref={meshRef} position={position}>
      {renderPowerUp()}
      <pointLight color={color} intensity={0.5} distance={2} />
    </group>
  );
}

export function PowerUps() {
  const powerUps: PowerUpProps[] = [
    { id: "coffee1", position: [3.5, 0.8, -3.5], type: "coffee", color: "#795548" },
    { id: "headphones1", position: [-3.5, 1.2, 0], type: "headphones", color: "#607d8b" },
    { id: "pill1", position: [0, 0.6, 3.5], type: "pill", color: "#00bcd4" },
  ];
  
  return (
    <group>
      {powerUps.map((p) => (
        <PowerUp key={p.id} {...p} />
      ))}
    </group>
  );
}
