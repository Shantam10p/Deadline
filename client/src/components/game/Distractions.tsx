import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGameState } from "@/lib/stores/useGameState";
import { useTexture } from "@react-three/drei";

interface DistractionProps {
  id: string;
  initialPosition: [number, number, number];
  type: "discord" | "iphone" | "youtube" | "tiktok" | "instagram";
  imagePath: string;
  speed?: number;
}

function Distraction({ id, initialPosition, type, imagePath, speed = 1.5 }: DistractionProps) {
  const texture = useTexture(imagePath);
  
  // Set texture to use sharp filtering for crisp images
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  const meshRef = useRef<THREE.Group>(null);
  const positionRef = useRef(new THREE.Vector3(...initialPosition));
  const [lastHitTime, setLastHitTime] = useState(0);
  const wanderAngle = useRef(Math.random() * Math.PI * 2);
  
  const phase = useGameState((state) => state.phase);
  const activeMiniGame = useGameState((state) => state.activeMiniGame);
  const playerPosition = useGameState((state) => state.playerPosition);
  const setPlayerPosition = useGameState((state) => state.setPlayerPosition);
  const takeDamage = useGameState((state) => state.takeDamage);
  const areEnemiesFrozen = useGameState((state) => state.areEnemiesFrozen);
  const shrinkFactor = useGameState((state) => state.roomShrinkFactor);
  const getTimeScale = useGameState((state) => state.getTimeScale);
  
  useFrame((_, delta) => {
    if (phase !== "playing" || !meshRef.current) return;
    if (activeMiniGame) return; // PAUSE AI when task is active
    
    const frozen = areEnemiesFrozen();
    const timeScale = getTimeScale();
    
    if (!frozen) {
      const targetPos = new THREE.Vector3(
        playerPosition[0],
        playerPosition[1] - 0.5,
        playerPosition[2]
      );
      
      const distanceToPlayer = positionRef.current.distanceTo(targetPos);
      
      // Add wandering behavior when far from player
      let direction: THREE.Vector3;
      if (distanceToPlayer > 15) {
        // Wander randomly when far
        wanderAngle.current += (Math.random() - 0.5) * 0.5;
        direction = new THREE.Vector3(
          Math.cos(wanderAngle.current),
          0,
          Math.sin(wanderAngle.current)
        );
      } else {
        // Chase player when close
        direction = targetPos.clone().sub(positionRef.current).normalize();
        
        // Minimal randomness for more direct chase
        const randomOffset = new THREE.Vector3(
          (Math.random() - 0.5) * 0.08,
          0,
          (Math.random() - 0.5) * 0.08
        );
        direction.add(randomOffset).normalize();
      }
      
      // Vary speed based on distance (faster when closer)
      const speedMultiplier = distanceToPlayer < 10 ? 1.5 : 1.2;
      const moveSpeed = speed * speedMultiplier * delta * timeScale;
      
      positionRef.current.add(direction.multiplyScalar(moveSpeed));
      
      const roomBound = (40 * shrinkFactor) / 2 - 0.5;
      positionRef.current.x = Math.max(-roomBound, Math.min(roomBound, positionRef.current.x));
      positionRef.current.z = Math.max(-roomBound, Math.min(roomBound, positionRef.current.z));
      positionRef.current.y = Math.max(0.5, Math.min(2.5, positionRef.current.y));
      
      meshRef.current.position.copy(positionRef.current);
      // Keep facing player for billboard effect
      meshRef.current.lookAt(new THREE.Vector3(playerPosition[0], positionRef.current.y, playerPosition[2]));
    }
    
    const dist = positionRef.current.distanceTo(new THREE.Vector3(...playerPosition));
    
    if (dist < 1.0) {
      const now = Date.now();
      if (now - lastHitTime > 1000) {
        takeDamage();
        setLastHitTime(now);
        
        // Push player forward (away from enemy)
        const pushDir = new THREE.Vector3(...playerPosition)
          .sub(positionRef.current)
          .normalize()
          .multiplyScalar(3);
        
        const newPlayerPos: [number, number, number] = [
          playerPosition[0] + pushDir.x,
          playerPosition[1],
          playerPosition[2] + pushDir.z
        ];
        setPlayerPosition(newPlayerPos);
        
        // Push enemy back
        const enemyPushDir = positionRef.current.clone()
          .sub(new THREE.Vector3(...playerPosition))
          .normalize()
          .multiplyScalar(2);
        positionRef.current.add(enemyPushDir);
      }
    }
  });
  
  const renderDistraction = () => {
    // All distractions now use image textures
    return (
      <group>
        {/* Front face with image */}
        <mesh castShadow receiveShadow>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial 
            map={texture} 
            transparent={true}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </group>
    );
  };
  
  return (
    <group ref={meshRef} position={initialPosition}>
      {renderDistraction()}
    </group>
  );
}

export function Distractions() {
  const distractions: DistractionProps[] = useMemo(() => [
    { id: "discord", initialPosition: [-16, 1.0, 16], type: "discord", imagePath: "/Discord.png", speed: 2.0 },
    { id: "iphone", initialPosition: [16, 1.0, -16], type: "iphone", imagePath: "/iphone.jpg", speed: 1.9 },
    { id: "youtube", initialPosition: [-14, 1.0, -14], type: "youtube", imagePath: "/Youtube.png", speed: 1.7 },
    { id: "tiktok", initialPosition: [14, 1.0, 14], type: "tiktok", imagePath: "/Tiktok.jpg", speed: 1.9 },
    { id: "instagram", initialPosition: [-12, 1.0, 12], type: "instagram", imagePath: "/Instagram.jpg", speed: 1.8 },
  ], []);
  
  return (
    <group>
      {distractions.map((d) => (
        <Distraction key={d.id} {...d} />
      ))}
    </group>
  );
}
