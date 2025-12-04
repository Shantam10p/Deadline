import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useGameState } from "@/lib/stores/useGameState";

const MOVE_SPEED = 5;

export function Player() {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  
  const phase = useGameState((state) => state.phase);
  const getSpeedMultiplier = useGameState((state) => state.getSpeedMultiplier);
  const setPlayerPosition = useGameState((state) => state.setPlayerPosition);
  const shrinkFactor = useGameState((state) => state.roomShrinkFactor);
  
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  
  useEffect(() => {
    camera.position.set(0, 1.6, 3);
    
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          moveForward.current = true;
          break;
        case "KeyS":
        case "ArrowDown":
          moveBackward.current = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          moveLeft.current = true;
          break;
        case "KeyD":
        case "ArrowRight":
          moveRight.current = true;
          break;
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          moveForward.current = false;
          break;
        case "KeyS":
        case "ArrowDown":
          moveBackward.current = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          moveLeft.current = false;
          break;
        case "KeyD":
        case "ArrowRight":
          moveRight.current = false;
          break;
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [camera]);
  
  useFrame((_, delta) => {
    if (phase !== "playing") return;
    if (!controlsRef.current?.isLocked) return;
    
    const speedMultiplier = getSpeedMultiplier();
    const speed = MOVE_SPEED * speedMultiplier * delta;
    
    velocity.current.x = 0;
    velocity.current.z = 0;
    
    direction.current.z = Number(moveForward.current) - Number(moveBackward.current);
    direction.current.x = Number(moveRight.current) - Number(moveLeft.current);
    direction.current.normalize();
    
    if (moveForward.current || moveBackward.current) {
      velocity.current.z -= direction.current.z * speed;
    }
    if (moveLeft.current || moveRight.current) {
      velocity.current.x -= direction.current.x * speed;
    }
    
    controlsRef.current.moveRight(-velocity.current.x);
    controlsRef.current.moveForward(-velocity.current.z);
    
    const roomBound = (10 * shrinkFactor) / 2 - 0.5;
    camera.position.x = Math.max(-roomBound, Math.min(roomBound, camera.position.x));
    camera.position.z = Math.max(-roomBound, Math.min(roomBound, camera.position.z));
    
    setPlayerPosition([camera.position.x, camera.position.y, camera.position.z]);
  });
  
  return (
    <PointerLockControls ref={controlsRef} />
  );
}
