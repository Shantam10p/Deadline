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
  const activeMiniGame = useGameState((state) => state.activeMiniGame);
  const getSpeedMultiplier = useGameState((state) => state.getSpeedMultiplier);
  const setPlayerPosition = useGameState((state) => state.setPlayerPosition);
  const shrinkFactor = useGameState((state) => state.roomShrinkFactor);
  
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const isJumping = useRef(false);
  const jumpVelocity = useRef(0);
  const JUMP_FORCE = 8;
  const GRAVITY = 20;
  const GROUND_HEIGHT = 1.6;
  
  useEffect(() => {
    camera.position.set(0, 1.6, 3);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
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
        case "Space":
          // Jump only if on ground
          if (!isJumping.current && camera.position.y <= GROUND_HEIGHT + 0.1) {
            isJumping.current = true;
            jumpVelocity.current = JUMP_FORCE;
          }
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

  useEffect(() => {
    if (phase === "playing") {
      // Only reset movement keys, not camera position
      moveForward.current = false;
      moveBackward.current = false;
      moveLeft.current = false;
      moveRight.current = false;
    } else if (phase === "menu") {
      // Only reset camera when going back to menu
      camera.position.set(0, 1.6, 3);
      velocity.current.set(0, 0, 0);
    }
  }, [phase, camera]);

  // Unlock pointer when mini-game opens, re-lock when it closes
  useEffect(() => {
    if (activeMiniGame) {
      // Force exit pointer lock
      if (document.pointerLockElement) {
        try {
          document.exitPointerLock();
        } catch (e) {
          // Ignore errors
        }
      }
    } else if (phase === "playing" && controlsRef.current) {
      // Re-lock pointer when task closes
      setTimeout(() => {
        try {
          if (controlsRef.current && !controlsRef.current.isLocked) {
            controlsRef.current.lock();
          }
        } catch (e) {
          // Ignore errors
        }
      }, 100);
    }
  }, [activeMiniGame, phase]);
  
  useFrame((_, delta) => {
    if (phase !== "playing") return;
    if (activeMiniGame) return; // Stop movement when task is active
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
    
    // Apply jump physics
    if (isJumping.current) {
      jumpVelocity.current -= GRAVITY * delta;
      camera.position.y += jumpVelocity.current * delta;
      
      // Check if landed
      if (camera.position.y <= GROUND_HEIGHT) {
        camera.position.y = GROUND_HEIGHT;
        isJumping.current = false;
        jumpVelocity.current = 0;
      }
    }
    
    const roomBound = (40 * shrinkFactor) / 2 - 0.5;
    camera.position.x = Math.max(-roomBound, Math.min(roomBound, camera.position.x));
    camera.position.z = Math.max(-roomBound, Math.min(roomBound, camera.position.z));
    
    setPlayerPosition([camera.position.x, camera.position.y, camera.position.z]);
  });
  
  return (
    <PointerLockControls ref={controlsRef} enabled={!activeMiniGame} />
  );
}
