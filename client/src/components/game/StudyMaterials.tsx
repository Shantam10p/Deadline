import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGameState } from "@/lib/stores/useGameState";
import { Text } from "@react-three/drei";

interface MaterialProps {
  id: string;
  position: [number, number, number];
  color: string;
  type: "notebook" | "textbook" | "calculator" | "memory" | "notes";
}

function Particle({ position, velocity, color }: { position: THREE.Vector3; velocity: THREE.Vector3; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const [opacity, setOpacity] = useState(1);
  
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.add(velocity.clone().multiplyScalar(delta));
      velocity.y -= 5 * delta;
      setOpacity((prev) => Math.max(0, prev - delta * 2));
    }
  });
  
  if (opacity <= 0) return null;
  
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function ParticleEffect({ position, color }: { position: [number, number, number]; color: string }) {
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      position: new THREE.Vector3(...position),
      velocity: new THREE.Vector3(
        (Math.cos(i * 0.5) * 2),
        3 + Math.sin(i * 0.7),
        (Math.sin(i * 0.5) * 2)
      ),
    }));
  }, [position]);
  
  return (
    <group>
      {particles.map((p) => (
        <Particle key={p.id} position={p.position} velocity={p.velocity} color={color} />
      ))}
    </group>
  );
}

function StudyMaterial({ id, position, color, type }: MaterialProps) {
  const meshRef = useRef<THREE.Group>(null);
  const textRef = useRef<any>(null);
  const [showParticles, setShowParticles] = useState(false);
  const { camera } = useThree();
  
  const phase = useGameState((state) => state.phase);
  const playerPosition = useGameState((state) => state.playerPosition);
  const startTask = useGameState((state) => state.startTask);
  const tasks = useGameState((state) => state.tasks);
  
  const task = tasks.find(t => t.id === id);
  const collected = task?.completed || false;
  
  const renderMaterial = useMemo(() => {
    switch (type) {
      case "notebook":
        return (
          <group>
            {/* Notebook cover */}
            <mesh castShadow>
              <boxGeometry args={[0.35, 0.4, 0.05]} />
              <meshStandardMaterial color="#4caf50" roughness={0.7} />
            </mesh>
            {/* Spiral binding */}
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh key={i} position={[-0.16, 0.15 - i * 0.04, 0.026]} castShadow>
                <torusGeometry args={[0.015, 0.005, 8, 16]} />
                <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.8} />
              </mesh>
            ))}
            {/* Pages */}
            <mesh position={[0.01, 0, 0.025]} castShadow>
              <boxGeometry args={[0.33, 0.38, 0.04]} />
              <meshStandardMaterial color="#f5f5dc" roughness={0.95} />
            </mesh>
            {/* Lines on cover */}
            {[0, 0.08, 0.16].map((offset, i) => (
              <mesh key={i} position={[0.05, 0.05 - offset, 0.026]}>
                <boxGeometry args={[0.2, 0.003, 0.001]} />
                <meshStandardMaterial color="#ffffff" roughness={0.8} />
              </mesh>
            ))}
          </group>
        );
      case "textbook":
        return (
          <group>
            {/* Book cover */}
            <mesh castShadow>
              <boxGeometry args={[0.35, 0.45, 0.08]} />
              <meshStandardMaterial color="#2e5c8a" roughness={0.7} />
            </mesh>
            {/* Book spine */}
            <mesh position={[-0.175, 0, 0]} castShadow>
              <boxGeometry args={[0.01, 0.45, 0.08]} />
              <meshStandardMaterial color="#1a3a5a" roughness={0.6} />
            </mesh>
            {/* Pages */}
            <mesh position={[0.17, 0, 0]}>
              <boxGeometry args={[0.01, 0.43, 0.075]} />
              <meshStandardMaterial color="#f5f5dc" roughness={0.95} />
            </mesh>
            {/* Title on cover */}
            <mesh position={[0, 0.1, 0.041]}>
              <planeGeometry args={[0.25, 0.08]} />
              <meshStandardMaterial color="#ffffff" roughness={0.8} />
            </mesh>
          </group>
        );
      case "calculator":
        return (
          <group>
            {/* Calculator body */}
            <mesh castShadow>
              <boxGeometry args={[0.12, 0.18, 0.02]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.3} />
            </mesh>
            {/* Screen */}
            <mesh position={[0, 0.06, 0.011]} castShadow>
              <boxGeometry args={[0.1, 0.04, 0.001]} />
              <meshStandardMaterial color="#4a7c5e" emissive="#2a4c3e" emissiveIntensity={0.3} />
            </mesh>
            {/* Buttons */}
            {[-0.03, 0, 0.03].map((x, i) =>
              [-0.02, -0.05, -0.08].map((y, j) => (
                <mesh key={`btn-${i}-${j}`} position={[x, y, 0.011]} castShadow>
                  <boxGeometry args={[0.02, 0.02, 0.002]} />
                  <meshStandardMaterial color="#4a4a4a" roughness={0.6} />
                </mesh>
              ))
            )}
          </group>
        );
      case "memory":
        return (
          <group>
            {/* Card deck base */}
            <mesh castShadow>
              <boxGeometry args={[0.3, 0.4, 0.02]} />
              <meshStandardMaterial color="#ff5722" roughness={0.6} />
            </mesh>
            {/* Card stack effect */}
            <mesh position={[0.01, 0.01, 0.01]} castShadow>
              <boxGeometry args={[0.29, 0.39, 0.02]} />
              <meshStandardMaterial color="#ff6f42" roughness={0.6} />
            </mesh>
            <mesh position={[0.02, 0.02, 0.02]} castShadow>
              <boxGeometry args={[0.28, 0.38, 0.02]} />
              <meshStandardMaterial color="#ff8762" roughness={0.6} />
            </mesh>
            {/* Card symbols */}
            {[[-0.08, 0.12], [0.08, 0.12], [-0.08, -0.12], [0.08, -0.12]].map(([x, y], i) => (
              <mesh key={i} position={[x, y, 0.031]} castShadow>
                <boxGeometry args={[0.06, 0.06, 0.001]} />
                <meshStandardMaterial color="#ffffff" roughness={0.8} />
              </mesh>
            ))}
          </group>
        );
      case "notes":
        return (
          <group>
            {/* Stack of sticky notes */}
            <mesh castShadow>
              <boxGeometry args={[0.3, 0.3, 0.03]} />
              <meshStandardMaterial color="#ffeb3b" roughness={0.8} />
            </mesh>
            <mesh position={[0.01, 0.01, 0.015]} castShadow>
              <boxGeometry args={[0.29, 0.29, 0.025]} />
              <meshStandardMaterial color="#fff176" roughness={0.8} />
            </mesh>
            <mesh position={[0.02, 0.02, 0.03]} castShadow>
              <boxGeometry args={[0.28, 0.28, 0.02]} />
              <meshStandardMaterial color="#fff59d" roughness={0.8} />
            </mesh>
            {/* Text lines on top note */}
            {[0, 0.05, 0.1].map((offset, i) => (
              <mesh key={i} position={[0.02, 0.08 - offset, 0.041]}>
                <boxGeometry args={[0.2, 0.002, 0.001]} />
                <meshStandardMaterial color="#333333" roughness={0.9} />
              </mesh>
            ))}
            {/* Checkmarks */}
            <mesh position={[-0.08, 0.08, 0.041]}>
              <boxGeometry args={[0.015, 0.015, 0.001]} />
              <meshStandardMaterial color="#4caf50" roughness={0.8} />
            </mesh>
          </group>
        );
      default:
        return <boxGeometry args={[0.2, 0.2, 0.2]} />;
    }
  }, [type]);
  
  useFrame((_, delta) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y += delta * 1.5;
      meshRef.current.position.y = Math.sin(Date.now() * 0.003) * 0.15;
    }
    
    // Make text always face camera
    if (textRef.current && camera) {
      textRef.current.quaternion.copy(camera.quaternion);
    }
    
    if (phase === "playing" && !collected && !task?.active) {
      const dist = Math.sqrt(
        Math.pow(playerPosition[0] - position[0], 2) +
        Math.pow(playerPosition[1] - position[1], 2) +
        Math.pow(playerPosition[2] - position[2], 2)
      );
      
      if (dist < 1.5) {
        startTask(id);
      }
    }
  });
  
  if (collected) {
    return showParticles ? <ParticleEffect position={position} color={color} /> : null;
  }
  
  return (
    <group position={position}>
      {/* Brighter point light */}
      <pointLight color={color} intensity={2} distance={3} />
      
      {/* Task name above - always faces camera */}
      <Text
        ref={textRef}
        position={[0, 1.2, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
        fontWeight="bold"
      >
        {task?.name || "Task"}
      </Text>
      
      {/* Material object - brighter materials */}
      <group ref={meshRef} scale={2.5} rotation={[0, 0, 0]}>
        {renderMaterial}
      </group>
    </group>
  );
}

export function StudyMaterials() {
  const tasks = useGameState((state) => state.tasks);
  
  const materials: MaterialProps[] = [
    { id: "notebook", position: [8, 1.2, -8], color: "#4caf50", type: "notebook" },
    { id: "calculator", position: [-10, 1.2, 10], color: "#9c27b0", type: "calculator" },
    { id: "textbook", position: [10, 1.2, 8], color: "#2196f3", type: "textbook" },
    { id: "memory", position: [0, 1.2, 12], color: "#ff5722", type: "memory" },
    { id: "notes", position: [-8, 1.2, -10], color: "#ffeb3b", type: "notes" },
  ];
  
  return (
    <group>
      {materials.map((mat) => (
        <StudyMaterial key={mat.id} {...mat} />
      ))}
    </group>
  );
}
