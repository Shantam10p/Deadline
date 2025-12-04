import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import { useGameState } from "@/lib/stores/useGameState";
import { WallPaintings } from "./WallPaintings";

const ROOM_SIZE = 40;
const WALL_HEIGHT = 4;

export function DormRoom() {
  const shrinkFactor = useGameState((state) => state.roomShrinkFactor);
  const timeRemaining = useGameState((state) => state.timeRemaining);
  const phase = useGameState((state) => state.phase);
  
  const currentSize = ROOM_SIZE * shrinkFactor;
  const halfSize = currentSize / 2;
  
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[currentSize, currentSize]} />
        <meshStandardMaterial color="#6e4b3a" roughness={0.85} metalness={0.05} />
      </mesh>
      <Grid
        position={[0, 0.001, 0]}
        args={[currentSize, currentSize]}
        cellSize={0.5}
        cellThickness={0.3}
        sectionSize={2}
        sectionThickness={1}
        cellColor="#2b2b2b"
        sectionColor="#3f3f3f"
        fadeDistance={currentSize}
        fadeStrength={1}
        infiniteGrid={false}
      />
      
      <mesh position={[0, WALL_HEIGHT / 2, -halfSize]} receiveShadow>
        <boxGeometry args={[currentSize, WALL_HEIGHT, 0.2]} />
        <meshStandardMaterial color="#e6e1d8" roughness={0.95} metalness={0.0} />
      </mesh>
      
      <mesh position={[0, WALL_HEIGHT / 2, halfSize]} receiveShadow>
        <boxGeometry args={[currentSize, WALL_HEIGHT, 0.2]} />
        <meshStandardMaterial color="#e6e1d8" roughness={0.95} metalness={0.0} />
      </mesh>
      
      <mesh position={[-halfSize, WALL_HEIGHT / 2, 0]} receiveShadow>
        <boxGeometry args={[0.2, WALL_HEIGHT, currentSize]} />
        <meshStandardMaterial color="#e6e1d8" roughness={0.95} metalness={0.0} />
      </mesh>
      
      <mesh position={[halfSize, WALL_HEIGHT / 2, 0]} receiveShadow>
        <boxGeometry args={[0.2, WALL_HEIGHT, currentSize]} />
        <meshStandardMaterial color="#e6e1d8" roughness={0.95} metalness={0.0} />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WALL_HEIGHT, 0]}>
        <planeGeometry args={[currentSize, currentSize]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.9} metalness={0.0} side={THREE.BackSide} />
      </mesh>
      
      <Furniture />
      
      <WallPaintings />
      
      <Door z={halfSize - 0.1} />
    </group>
  );
}

function Furniture() {
  const shrinkFactor = useGameState((state) => state.roomShrinkFactor);
  const currentSize = ROOM_SIZE * shrinkFactor;
  const halfSize = currentSize / 2;
  
  return (
    <group>
      {/* Realistic Desk with detailed construction - SCALED UP 1.5x */}
      <group position={[14, 0, -17]} scale={1.5}>
        {/* Desk top */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.08, 1.2]} />
          <meshStandardMaterial 
            color="#5a3a1a" 
            roughness={0.6} 
            metalness={0.1}
          />
        </mesh>
        {/* Desk legs */}
        <mesh position={[-0.95, 0.375, -0.5]} castShadow>
          <boxGeometry args={[0.08, 0.75, 0.08]} />
          <meshStandardMaterial color="#4a2a0a" roughness={0.7} />
        </mesh>
        <mesh position={[0.95, 0.375, -0.5]} castShadow>
          <boxGeometry args={[0.08, 0.75, 0.08]} />
          <meshStandardMaterial color="#4a2a0a" roughness={0.7} />
        </mesh>
        <mesh position={[-0.95, 0.375, 0.5]} castShadow>
          <boxGeometry args={[0.08, 0.75, 0.08]} />
          <meshStandardMaterial color="#4a2a0a" roughness={0.7} />
        </mesh>
        <mesh position={[0.95, 0.375, 0.5]} castShadow>
          <boxGeometry args={[0.08, 0.75, 0.08]} />
          <meshStandardMaterial color="#4a2a0a" roughness={0.7} />
        </mesh>
        {/* Drawer */}
        <mesh position={[0, 0.5, -0.55]} castShadow>
          <boxGeometry args={[1.8, 0.2, 0.05]} />
          <meshStandardMaterial color="#6a4a2a" roughness={0.65} />
        </mesh>
        {/* Drawer handle */}
        <mesh position={[0, 0.5, -0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
          <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Laptop on desk */}
        <group position={[0.3, 0.8, 0.1]}>
          <mesh castShadow>
            <boxGeometry args={[0.35, 0.02, 0.25]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.12, -0.1]} rotation={[-0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.35, 0.25, 0.02]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.12, -0.1]} rotation={[-0.3, 0, 0]}>
            <planeGeometry args={[0.32, 0.2]} />
            <meshStandardMaterial color="#4a7c9e" emissive="#1a3c5e" emissiveIntensity={0.3} />
          </mesh>
        </group>
      </group>

      {/* Office Chair for Desk - SCALED UP 1.5x */}
      <group position={[14, 0, -14.5]} rotation={[0, Math.PI, 0]} scale={1.5}>
        {/* Chair seat */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.28, 0.08, 16]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.2} />
        </mesh>
        {/* Seat cushion padding */}
        <mesh position={[0, 0.54, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.26, 0.04, 16]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
        </mesh>
        
        {/* Backrest */}
        <mesh position={[0, 0.85, -0.22]} castShadow>
          <boxGeometry args={[0.45, 0.6, 0.08]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.2} />
        </mesh>
        {/* Backrest padding */}
        <mesh position={[0, 0.85, -0.18]} castShadow>
          <boxGeometry args={[0.42, 0.55, 0.05]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
        </mesh>
        
        {/* Support pole */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.7} />
        </mesh>
        
        {/* Base star */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * Math.PI * 2) / 5;
          const x = Math.cos(angle) * 0.3;
          const z = Math.sin(angle) * 0.3;
          return (
            <group key={`base-${i}`} position={[x, 0.05, z]} rotation={[0, angle, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.08, 0.04, 0.35]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.7} />
              </mesh>
              {/* Wheel */}
              <mesh position={[0, -0.02, 0.16]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.3} />
              </mesh>
            </group>
          );
        })}
        
        {/* Armrests */}
        <mesh position={[0.22, 0.65, -0.05]} castShadow>
          <boxGeometry args={[0.06, 0.06, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} />
        </mesh>
        <mesh position={[-0.22, 0.65, -0.05]} castShadow>
          <boxGeometry args={[0.06, 0.06, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} />
        </mesh>
      </group>

      {/* Realistic Bed with mattress, pillows, and frame - SCALED UP 1.5x */}
      <group position={[-13, 0, -14]} scale={1.5}>
        {/* Bed frame */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.15, 2.2]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.75} />
        </mesh>
        {/* Mattress */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.3, 2.0]} />
          <meshStandardMaterial color="#e8e8f0" roughness={0.9} />
        </mesh>
        {/* Bed sheet with slight wrinkles */}
        <mesh position={[0, 0.66, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.05, 1.8]} />
          <meshStandardMaterial color="#4a6fa5" roughness={0.85} />
        </mesh>
        {/* Pillow 1 */}
        <mesh position={[-0.5, 0.75, -0.7]} rotation={[0, 0, 0.1]} castShadow>
          <boxGeometry args={[0.6, 0.15, 0.4]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
        </mesh>
        {/* Pillow 2 */}
        <mesh position={[0.5, 0.75, -0.7]} rotation={[0, 0, -0.1]} castShadow>
          <boxGeometry args={[0.6, 0.15, 0.4]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
        </mesh>
        {/* Headboard */}
        <mesh position={[0, 0.8, -1.15]} castShadow>
          <boxGeometry args={[2.8, 0.8, 0.1]} />
          <meshStandardMaterial color="#4a3a2a" roughness={0.7} />
        </mesh>
        {/* Bed legs */}
        {[-1.2, 1.2].map((x, i) => 
          [-0.9, 0.9].map((z, j) => (
            <mesh key={`leg-${i}-${j}`} position={[x, 0.15, z]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
              <meshStandardMaterial color="#2a1a0a" roughness={0.8} />
            </mesh>
          ))
        )}
      </group>

      {/* Bookshelf with books */}
      <group position={[-18.5, 0, 0]}>
        {/* Main frame */}
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 2.4, 1.2]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.7} />
        </mesh>
        {/* Shelves */}
        {[0.3, 0.9, 1.5, 2.1].map((y, i) => (
          <mesh key={`shelf-${i}`} position={[0, y, 0]} castShadow>
            <boxGeometry args={[0.28, 0.03, 1.15]} />
            <meshStandardMaterial color="#6a5a4a" roughness={0.65} />
          </mesh>
        ))}
        {/* Books on shelves */}
        {[
          { pos: [-0.05, 0.4, -0.3] as [number, number, number], size: [0.15, 0.2, 0.05] as [number, number, number], color: "#8b4513" },
          { pos: [-0.05, 0.4, -0.15] as [number, number, number], size: [0.15, 0.25, 0.05] as [number, number, number], color: "#2e5c8a" },
          { pos: [-0.05, 0.4, 0] as [number, number, number], size: [0.15, 0.18, 0.05] as [number, number, number], color: "#6b8e23" },
          { pos: [-0.05, 0.4, 0.2] as [number, number, number], size: [0.15, 0.22, 0.05] as [number, number, number], color: "#8b0000" },
          { pos: [-0.05, 1.0, -0.35] as [number, number, number], size: [0.15, 0.24, 0.05] as [number, number, number], color: "#4a4a4a" },
          { pos: [-0.05, 1.0, -0.1] as [number, number, number], size: [0.15, 0.2, 0.05] as [number, number, number], color: "#9370db" },
          { pos: [-0.05, 1.0, 0.15] as [number, number, number], size: [0.15, 0.26, 0.05] as [number, number, number], color: "#cd853f" },
        ].map((book, i) => (
          <mesh key={`book-${i}`} position={book.pos} castShadow>
            <boxGeometry args={book.size} />
            <meshStandardMaterial color={book.color} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Nightstand with lamp */}
      <group position={[-8, 0, -17.5]}>
        {/* Nightstand body */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.6, 0.4]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.65} />
        </mesh>
        {/* Drawer */}
        <mesh position={[0.24, 0.35, 0]} castShadow>
          <boxGeometry args={[0.03, 0.15, 0.35]} />
          <meshStandardMaterial color="#6a4a2a" roughness={0.7} />
        </mesh>
        {/* Knob */}
        <mesh position={[0.27, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Lamp base */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.1, 16]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Lamp pole */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.5} metalness={0.7} />
        </mesh>
        {/* Lamp shade */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <coneGeometry args={[0.15, 0.25, 16, 1, true]} />
          <meshStandardMaterial 
            color="#f5e6d3" 
            roughness={0.9} 
            side={THREE.DoubleSide}
            emissive="#fff5e6"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Lamp light */}
        <pointLight position={[0, 1.0, 0]} color="#fff5e6" intensity={0.8} distance={4} decay={2} />
      </group>

      {/* Potted Plant */}
      <group position={[18, 0, 10]}>
        {/* Pot */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.15, 0.3, 16]} />
          <meshStandardMaterial color="#8b4513" roughness={0.8} />
        </mesh>
        {/* Soil */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 0.05, 16]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.95} />
        </mesh>
        {/* Plant leaves */}
        {[
          { pos: [0, 0.5, 0] as [number, number, number], rot: [0, 0, 0.3] as [number, number, number], scale: 1 },
          { pos: [0.15, 0.6, 0.1] as [number, number, number], rot: [0.2, 0.5, -0.2] as [number, number, number], scale: 0.8 },
          { pos: [-0.15, 0.55, -0.1] as [number, number, number], rot: [-0.2, -0.5, 0.4] as [number, number, number], scale: 0.9 },
          { pos: [0.1, 0.7, -0.15] as [number, number, number], rot: [0.3, -0.3, -0.3] as [number, number, number], scale: 0.7 },
          { pos: [-0.1, 0.65, 0.15] as [number, number, number], rot: [-0.3, 0.3, 0.2] as [number, number, number], scale: 0.75 },
        ].map((leaf, i) => (
          <mesh key={`leaf-${i}`} position={leaf.pos} rotation={leaf.rot} scale={leaf.scale} castShadow>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#2d5016" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Rug */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial 
          color="#8b4789" 
          roughness={0.95}
        />
      </mesh>

      {/* Mini Fridge */}
      <group position={[18.5, 0, -8]}>
        {/* Fridge body */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 1.0, 0.6]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Freezer door */}
        <mesh position={[0.31, 0.75, 0]} castShadow>
          <boxGeometry args={[0.02, 0.4, 0.55]} />
          <meshStandardMaterial color="#d0d0d0" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Main door */}
        <mesh position={[0.31, 0.25, 0]} castShadow>
          <boxGeometry args={[0.02, 0.5, 0.55]} />
          <meshStandardMaterial color="#d0d0d0" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Handles */}
        <mesh position={[0.33, 0.75, 0.15]} castShadow>
          <boxGeometry args={[0.02, 0.08, 0.03]} />
          <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0.33, 0.25, 0.15]} castShadow>
          <boxGeometry args={[0.02, 0.08, 0.03]} />
          <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* Trash Bin */}
      <group position={[16.5, 0, -13]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 0.4, 16]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <torusGeometry args={[0.22, 0.02, 8, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
        </mesh>
      </group>

      {/* Wall Clock */}
      <group position={[0, 3, -19.9]}>
        {/* Clock face */}
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.08, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>
        {/* Clock rim */}
        <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.03, 8, 32]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Hour hand */}
        <mesh position={[0, 0, 0.05]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.02, 0.2, 0.01]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Minute hand */}
        <mesh position={[0, 0, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.015, 0.3, 0.01]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Center dot */}
        <mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
          <meshStandardMaterial color="#c41e3a" />
        </mesh>
      </group>

      {/* Desk Organizer */}
      <group position={[13, 1.2, -16.5]}>
        {/* Base */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.3, 0.1, 0.15]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.6} />
        </mesh>
        {/* Pen holder */}
        <mesh position={[-0.08, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.15, 12]} />
          <meshStandardMaterial color="#5a5a5a" roughness={0.5} />
        </mesh>
        {/* Pens */}
        {[-0.02, 0, 0.02].map((offset, i) => (
          <mesh key={i} position={[-0.08 + offset, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />
            <meshStandardMaterial color={["#1a5c9e", "#c41e3a", "#2d5016"][i]} />
          </mesh>
        ))}
        {/* Paper tray */}
        <mesh position={[0.08, 0.08, 0]} castShadow>
          <boxGeometry args={[0.12, 0.02, 0.14]} />
          <meshStandardMaterial color="#6a6a6a" roughness={0.5} />
        </mesh>
      </group>

    </group>
  );
}

function Door({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
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
