import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGameState } from "@/lib/stores/useGameState";
import { Text } from "@react-three/drei";

interface PowerUpProps {
  id: string;
  position: [number, number, number];
  type: "coffee";
  color: string;
}

function PowerUp({ id, position, type, color }: PowerUpProps) {
  const meshRef = useRef<THREE.Group>(null);
  const coffeeRef = useRef<THREE.Group>(null);
  const [collected, setCollected] = useState(false);
  
  const phase = useGameState((state) => state.phase);
  const playerPosition = useGameState((state) => state.playerPosition);
  const collectPowerUp = useGameState((state) => state.collectPowerUp);
  const collectedIds = useGameState((state) => state.collectedPowerUpIds);
  
  useFrame((_, delta) => {
    if (coffeeRef.current && !collected && !collectedIds.has(id)) {
      coffeeRef.current.rotation.y += delta * 3;
      
      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.15;
      coffeeRef.current.scale.setScalar(scale);
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
  };
  
  return (
    <group ref={meshRef} position={position}>
      {/* Enhanced glow effect */}
      <pointLight color={color} intensity={1.5} distance={3} />
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      
      {/* Coffee mug that rotates */}
      <group ref={coffeeRef}>
        {renderPowerUp()}
      </group>
      
      {/* Label that doesn't rotate */}
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
        fontWeight="bold"
      >
        Coffee (Speed Boost)
      </Text>
    </group>
  );
}

export function PowerUps() {
  const powerUps: PowerUpProps[] = [
    { id: "coffee1", position: [12, 0.5, -12], type: "coffee", color: "#8b4513" },
    { id: "coffee2", position: [-12, 0.5, 12], type: "coffee", color: "#8b4513" },
    { id: "coffee3", position: [15, 0.5, 8], type: "coffee", color: "#8b4513" },
    { id: "coffee4", position: [-8, 0.5, -15], type: "coffee", color: "#8b4513" },
    { id: "coffee5", position: [6, 0.5, 6], type: "coffee", color: "#8b4513" },
    { id: "coffee6", position: [-15, 0.5, -8], type: "coffee", color: "#8b4513" },
  ];
  
  return (
    <group>
      {powerUps.map((p) => (
        <PowerUp key={p.id} {...p} />
      ))}
    </group>
  );
}
