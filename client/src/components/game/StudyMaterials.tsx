import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGameState } from "@/lib/stores/useGameState";

interface MaterialProps {
  id: string;
  position: [number, number, number];
  color: string;
  type: "notes" | "textbook" | "calculator" | "studyguide" | "pen";
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
  const meshRef = useRef<THREE.Mesh>(null);
  const [collected, setCollected] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  
  const phase = useGameState((state) => state.phase);
  const playerPosition = useGameState((state) => state.playerPosition);
  const collectMaterial = useGameState((state) => state.collectMaterial);
  const collectedIds = useGameState((state) => state.collectedMaterialIds);
  
  useFrame((_, delta) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.1;
      
      const emissiveMat = meshRef.current.material as THREE.MeshStandardMaterial;
      const pulse = 0.3 + Math.sin(Date.now() * 0.005) * 0.2;
      emissiveMat.emissiveIntensity = pulse;
    }
    
    if (phase === "playing" && !collected && !collectedIds.has(id)) {
      const dist = Math.sqrt(
        Math.pow(playerPosition[0] - position[0], 2) +
        Math.pow(playerPosition[1] - position[1], 2) +
        Math.pow(playerPosition[2] - position[2], 2)
      );
      
      if (dist < 1.5) {
        collectMaterial(id);
        setCollected(true);
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 1000);
      }
    }
  });
  
  if (collected || collectedIds.has(id)) {
    return showParticles ? <ParticleEffect position={position} color={color} /> : null;
  }
  
  const geometry = useMemo(() => {
    switch (type) {
      case "notes":
        return <planeGeometry args={[0.4, 0.5]} />;
      case "textbook":
        return <boxGeometry args={[0.3, 0.4, 0.1]} />;
      case "calculator":
        return <boxGeometry args={[0.15, 0.25, 0.05]} />;
      case "studyguide":
        return <boxGeometry args={[0.35, 0.5, 0.02]} />;
      case "pen":
        return <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />;
      default:
        return <boxGeometry args={[0.2, 0.2, 0.2]} />;
    }
  }, [type]);
  
  return (
    <mesh ref={meshRef} position={position} castShadow>
      {geometry}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

export function StudyMaterials() {
  const materials: MaterialProps[] = [
    { id: "notes", position: [-3, 1.2, -3], color: "#ffeb3b", type: "notes" },
    { id: "textbook", position: [3, 1.0, 2], color: "#2196f3", type: "textbook" },
    { id: "calculator", position: [-2, 0.8, 3], color: "#9c27b0", type: "calculator" },
    { id: "studyguide", position: [2, 1.5, -2], color: "#4caf50", type: "studyguide" },
    { id: "pen", position: [0, 1.0, -4], color: "#ff5722", type: "pen" },
  ];
  
  return (
    <group>
      {materials.map((mat) => (
        <StudyMaterial key={mat.id} {...mat} />
      ))}
    </group>
  );
}
