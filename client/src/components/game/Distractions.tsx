import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGameState } from "@/lib/stores/useGameState";
import { Text } from "@react-three/drei";

interface DistractionProps {
  id: string;
  initialPosition: [number, number, number];
  type: "smartphone" | "netflix" | "discord" | "pizza" | "textbubble" | "music";
  color: string;
}

function Distraction({ id, initialPosition, type, color }: DistractionProps) {
  const meshRef = useRef<THREE.Group>(null);
  const positionRef = useRef(new THREE.Vector3(...initialPosition));
  const [lastHitTime, setLastHitTime] = useState(0);
  
  const phase = useGameState((state) => state.phase);
  const playerPosition = useGameState((state) => state.playerPosition);
  const addStress = useGameState((state) => state.addStress);
  const areEnemiesFrozen = useGameState((state) => state.areEnemiesFrozen);
  const shrinkFactor = useGameState((state) => state.roomShrinkFactor);
  const getTimeScale = useGameState((state) => state.getTimeScale);
  
  useFrame((_, delta) => {
    if (phase !== "playing" || !meshRef.current) return;
    
    const frozen = areEnemiesFrozen();
    const timeScale = getTimeScale();
    
    if (!frozen) {
      const targetPos = new THREE.Vector3(
        playerPosition[0],
        playerPosition[1] - 0.5,
        playerPosition[2]
      );
      
      const direction = targetPos.clone().sub(positionRef.current).normalize();
      const speed = 1.5 * delta * timeScale;
      
      positionRef.current.add(direction.multiplyScalar(speed));
      
      const roomBound = (10 * shrinkFactor) / 2 - 0.5;
      positionRef.current.x = Math.max(-roomBound, Math.min(roomBound, positionRef.current.x));
      positionRef.current.z = Math.max(-roomBound, Math.min(roomBound, positionRef.current.z));
      positionRef.current.y = Math.max(0.5, Math.min(2.5, positionRef.current.y));
      
      meshRef.current.position.copy(positionRef.current);
      meshRef.current.rotation.y += delta;
    }
    
    const dist = positionRef.current.distanceTo(new THREE.Vector3(...playerPosition));
    
    if (dist < 1.0) {
      const now = Date.now();
      if (now - lastHitTime > 1000) {
        addStress(10);
        setLastHitTime(now);
        
        const pushDir = positionRef.current.clone()
          .sub(new THREE.Vector3(...playerPosition))
          .normalize()
          .multiplyScalar(2);
        positionRef.current.add(pushDir);
      }
    }
  });
  
  const renderDistraction = () => {
    switch (type) {
      case "smartphone":
        return (
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.3, 0.02]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
          </mesh>
        );
      case "netflix":
        return (
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#e50914" emissive="#e50914" emissiveIntensity={0.4} />
          </mesh>
        );
      case "discord":
        return (
          <mesh castShadow>
            <planeGeometry args={[0.4, 0.4]} />
            <meshStandardMaterial color="#5865f2" emissive="#5865f2" emissiveIntensity={0.3} side={THREE.DoubleSide} />
          </mesh>
        );
      case "pizza":
        return (
          <mesh castShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#ff9800" emissive="#ff9800" emissiveIntensity={0.3} />
          </mesh>
        );
      case "textbubble":
        return (
          <group>
            <mesh castShadow>
              <planeGeometry args={[0.8, 0.4]} />
              <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.1}
              color="#333333"
              anchorX="center"
              anchorY="middle"
            >
              wanna hang?
            </Text>
          </group>
        );
      case "music":
        return (
          <group>
            <mesh position={[0, 0, 0]} castShadow>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshStandardMaterial color="#e91e63" emissive="#e91e63" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0.15, 0.1, 0]} castShadow>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color="#e91e63" emissive="#e91e63" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[-0.1, 0.12, 0]} castShadow>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshStandardMaterial color="#e91e63" emissive="#e91e63" emissiveIntensity={0.4} />
            </mesh>
          </group>
        );
      default:
        return (
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
    }
  };
  
  return (
    <group ref={meshRef} position={initialPosition}>
      {renderDistraction()}
    </group>
  );
}

export function Distractions() {
  const distractions: DistractionProps[] = useMemo(() => [
    { id: "phone", initialPosition: [-4, 1.5, 4], type: "smartphone", color: "#333333" },
    { id: "netflix", initialPosition: [4, 1.2, -4], type: "netflix", color: "#e50914" },
    { id: "discord", initialPosition: [-3, 2.0, -3], type: "discord", color: "#5865f2" },
    { id: "pizza", initialPosition: [3, 1.0, 3], type: "pizza", color: "#ff9800" },
    { id: "text", initialPosition: [-2, 1.8, 2], type: "textbubble", color: "#ffffff" },
    { id: "music", initialPosition: [2, 1.5, -1], type: "music", color: "#e91e63" },
  ], []);
  
  return (
    <group>
      {distractions.map((d) => (
        <Distraction key={d.id} {...d} />
      ))}
    </group>
  );
}
