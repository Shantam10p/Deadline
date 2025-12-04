import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGameState } from "@/lib/stores/useGameState";
import { useTexture } from "@react-three/drei";

const ROOM_SIZE = 10;
const WALL_HEIGHT = 4;

export function DormRoom() {
  const shrinkFactor = useGameState((state) => state.roomShrinkFactor);
  const timeRemaining = useGameState((state) => state.timeRemaining);
  const phase = useGameState((state) => state.phase);
  
  const windowRef = useRef<THREE.Mesh>(null);
  
  const woodTexture = useTexture("/textures/wood.jpg");
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(4, 4);
  
  useFrame(() => {
    if (windowRef.current && phase === "playing") {
      const progress = 1 - timeRemaining / 90;
      const r = 0.1 + progress * 0.6;
      const g = 0.1 + progress * 0.3;
      const b = 0.2 - progress * 0.1;
      (windowRef.current.material as THREE.MeshBasicMaterial).color.setRGB(r, g, b);
    }
  });
  
  const currentSize = ROOM_SIZE * shrinkFactor;
  const halfSize = currentSize / 2;
  
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[currentSize, currentSize]} />
        <meshStandardMaterial map={woodTexture} />
      </mesh>
      
      <mesh position={[0, WALL_HEIGHT / 2, -halfSize]} receiveShadow>
        <boxGeometry args={[currentSize, WALL_HEIGHT, 0.2]} />
        <meshStandardMaterial color="#e8e0d5" />
      </mesh>
      
      <mesh position={[0, WALL_HEIGHT / 2, halfSize]} receiveShadow>
        <boxGeometry args={[currentSize, WALL_HEIGHT, 0.2]} />
        <meshStandardMaterial color="#e8e0d5" />
      </mesh>
      
      <mesh position={[-halfSize, WALL_HEIGHT / 2, 0]} receiveShadow>
        <boxGeometry args={[0.2, WALL_HEIGHT, currentSize]} />
        <meshStandardMaterial color="#e8e0d5" />
      </mesh>
      
      <mesh position={[halfSize, WALL_HEIGHT / 2, 0]} receiveShadow>
        <boxGeometry args={[0.2, WALL_HEIGHT, currentSize]} />
        <meshStandardMaterial color="#e8e0d5" />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WALL_HEIGHT, 0]}>
        <planeGeometry args={[currentSize, currentSize]} />
        <meshStandardMaterial color="#f5f0e8" side={THREE.BackSide} />
      </mesh>
      
      <Furniture />
      
      <mesh 
        ref={windowRef}
        position={[4.9, 2.5, -2]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[2, 1.5]} />
        <meshBasicMaterial color={new THREE.Color(0.1, 0.1, 0.2)} />
      </mesh>
      <mesh position={[4.9, 2.5, -2]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[2.1, 0.08, 0.08]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      <mesh position={[4.9, 2.5, -2]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[0.08, 1.6, 0.08]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      
      <Door />
    </group>
  );
}

function Furniture() {
  return (
    <group>
      <group position={[3, 0.4, -4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 0.8, 1.5]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[2.1, 0.1, 1.6]} />
          <meshStandardMaterial color="#2d1810" />
        </mesh>
        <mesh position={[0, 0.45, 0.3]}>
          <boxGeometry args={[1.8, 0.3, 0.05]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
        <mesh position={[-0.7, 0.1, -0.5]} castShadow>
          <boxGeometry args={[0.5, 0.6, 0.4]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      </group>
      
      <group position={[-3, 0.3, -3.5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.6, 1.8]} />
          <meshStandardMaterial color="#4169E1" />
        </mesh>
        <mesh position={[0.8, 0.35, 0]} castShadow>
          <boxGeometry args={[0.6, 0.1, 1.8]} />
          <meshStandardMaterial color="#f5f5dc" />
        </mesh>
        <mesh position={[-0.8, 0.35, 0]} castShadow>
          <boxGeometry args={[0.6, 0.1, 1.8]} />
          <meshStandardMaterial color="#f5f5dc" />
        </mesh>
      </group>
      
      <group position={[4.2, 0.6, 2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.8, 1.2, 0.8]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        <mesh position={[0, 0, 0.41]}>
          <boxGeometry args={[0.7, 1.0, 0.02]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
      </group>
      
      <group position={[-2, 1.5, -4.85]}>
        <mesh>
          <planeGeometry args={[1.2, 0.8]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
      </group>
      <group position={[0, 2, -4.85]}>
        <mesh>
          <planeGeometry args={[1, 1.4]} />
          <meshStandardMaterial color="#4ecdc4" />
        </mesh>
      </group>
      
      <group position={[-4, 0, 2]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#556b2f" />
        </mesh>
        <mesh position={[0.2, 0.5, 0.1]} castShadow>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#6b8e23" />
        </mesh>
        <mesh position={[-0.1, 0.6, -0.1]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#808000" />
        </mesh>
      </group>
      
      <group position={[2, 0, 3]}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.5, 0.1, 0.5]} />
          <meshStandardMaterial color="#d2691e" />
        </mesh>
        <mesh position={[0.3, 0.1, 0.2]} castShadow>
          <boxGeometry args={[0.45, 0.1, 0.45]} />
          <meshStandardMaterial color="#cd853f" />
        </mesh>
        <mesh position={[0.1, 0.04, 0.4]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
          <meshStandardMaterial color="#c0c0c0" />
        </mesh>
        <mesh position={[0.3, 0.04, 0.5]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      </group>
    </group>
  );
}

function Door() {
  return (
    <group position={[0, 0, 4.9]}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[1.2, 2.4, 0.1]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      <mesh position={[0.4, 1.2, 0.06]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}
