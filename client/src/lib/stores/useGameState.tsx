import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "playing" | "won" | "lost";

interface PowerUpState {
  speedBoost: boolean;
  speedBoostEndTime: number;
  freezeEnemies: boolean;
  freezeEnemiesEndTime: number;
  slowMotion: boolean;
  slowMotionEndTime: number;
}

interface GameState {
  phase: GamePhase;
  stress: number;
  timeRemaining: number;
  materialsCollected: number;
  totalMaterials: number;
  roomShrinkFactor: number;
  powerUps: PowerUpState;
  collectedMaterialIds: Set<string>;
  collectedPowerUpIds: Set<string>;
  playerPosition: [number, number, number];
  
  startGame: () => void;
  endGame: (won: boolean) => void;
  restartGame: () => void;
  
  addStress: (amount: number) => void;
  updateTime: (delta: number) => void;
  collectMaterial: (id: string) => void;
  collectPowerUp: (type: "coffee" | "headphones" | "pill", id: string) => void;
  updatePowerUps: () => void;
  updateRoomShrink: () => void;
  setPlayerPosition: (pos: [number, number, number]) => void;
  
  getSpeedMultiplier: () => number;
  areEnemiesFrozen: () => boolean;
  getTimeScale: () => number;
}

const GAME_DURATION = 90;
const TOTAL_MATERIALS = 5;

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "menu",
    stress: 0,
    timeRemaining: GAME_DURATION,
    materialsCollected: 0,
    totalMaterials: TOTAL_MATERIALS,
    roomShrinkFactor: 1,
    collectedMaterialIds: new Set(),
    collectedPowerUpIds: new Set(),
    playerPosition: [0, 1.6, 0],
    powerUps: {
      speedBoost: false,
      speedBoostEndTime: 0,
      freezeEnemies: false,
      freezeEnemiesEndTime: 0,
      slowMotion: false,
      slowMotionEndTime: 0,
    },
    
    startGame: () => {
      set({
        phase: "playing",
        stress: 0,
        timeRemaining: GAME_DURATION,
        materialsCollected: 0,
        roomShrinkFactor: 1,
        collectedMaterialIds: new Set(),
        collectedPowerUpIds: new Set(),
        playerPosition: [0, 1.6, 0],
        powerUps: {
          speedBoost: false,
          speedBoostEndTime: 0,
          freezeEnemies: false,
          freezeEnemiesEndTime: 0,
          slowMotion: false,
          slowMotionEndTime: 0,
        },
      });
    },
    
    endGame: (won: boolean) => {
      set({ phase: won ? "won" : "lost" });
    },
    
    restartGame: () => {
      set({
        phase: "menu",
        stress: 0,
        timeRemaining: GAME_DURATION,
        materialsCollected: 0,
        roomShrinkFactor: 1,
        collectedMaterialIds: new Set(),
        collectedPowerUpIds: new Set(),
        playerPosition: [0, 1.6, 0],
        powerUps: {
          speedBoost: false,
          speedBoostEndTime: 0,
          freezeEnemies: false,
          freezeEnemiesEndTime: 0,
          slowMotion: false,
          slowMotionEndTime: 0,
        },
      });
    },
    
    addStress: (amount: number) => {
      const state = get();
      if (state.phase !== "playing") return;
      
      const newStress = Math.min(100, state.stress + amount);
      set({ stress: newStress });
      
      if (newStress >= 100) {
        set({ phase: "lost" });
      }
    },
    
    updateTime: (delta: number) => {
      const state = get();
      if (state.phase !== "playing") return;
      
      const timeScale = state.getTimeScale();
      const newTime = Math.max(0, state.timeRemaining - delta * timeScale);
      set({ timeRemaining: newTime });
      
      if (newTime <= 0) {
        set({ phase: "lost" });
      }
    },
    
    collectMaterial: (id: string) => {
      const state = get();
      if (state.phase !== "playing") return;
      if (state.collectedMaterialIds.has(id)) return;
      
      const newCollected = new Set(state.collectedMaterialIds);
      newCollected.add(id);
      
      set({
        materialsCollected: state.materialsCollected + 1,
        collectedMaterialIds: newCollected,
      });
    },
    
    collectPowerUp: (type: "coffee" | "headphones" | "pill", id: string) => {
      const state = get();
      if (state.phase !== "playing") return;
      if (state.collectedPowerUpIds.has(id)) return;
      
      const newCollected = new Set(state.collectedPowerUpIds);
      newCollected.add(id);
      
      const now = Date.now();
      const newPowerUps = { ...state.powerUps };
      
      if (type === "coffee") {
        newPowerUps.speedBoost = true;
        newPowerUps.speedBoostEndTime = now + 5000;
      } else if (type === "headphones") {
        newPowerUps.freezeEnemies = true;
        newPowerUps.freezeEnemiesEndTime = now + 3000;
      } else if (type === "pill") {
        newPowerUps.slowMotion = true;
        newPowerUps.slowMotionEndTime = now + 3000;
      }
      
      set({
        powerUps: newPowerUps,
        collectedPowerUpIds: newCollected,
      });
    },
    
    updatePowerUps: () => {
      const state = get();
      const now = Date.now();
      const newPowerUps = { ...state.powerUps };
      let changed = false;
      
      if (newPowerUps.speedBoost && now >= newPowerUps.speedBoostEndTime) {
        newPowerUps.speedBoost = false;
        changed = true;
      }
      if (newPowerUps.freezeEnemies && now >= newPowerUps.freezeEnemiesEndTime) {
        newPowerUps.freezeEnemies = false;
        changed = true;
      }
      if (newPowerUps.slowMotion && now >= newPowerUps.slowMotionEndTime) {
        newPowerUps.slowMotion = false;
        changed = true;
      }
      
      if (changed) {
        set({ powerUps: newPowerUps });
      }
    },
    
    updateRoomShrink: () => {
      const state = get();
      if (state.phase !== "playing") return;
      
      const elapsed = GAME_DURATION - state.timeRemaining;
      const shrinkFactor = 1 - (elapsed / GAME_DURATION) * 0.3;
      set({ roomShrinkFactor: Math.max(0.7, shrinkFactor) });
      
      if (shrinkFactor <= 0.72) {
        set({ phase: "lost" });
      }
    },
    
    setPlayerPosition: (pos: [number, number, number]) => {
      set({ playerPosition: pos });
    },
    
    getSpeedMultiplier: () => {
      const state = get();
      return state.powerUps.speedBoost ? 2 : 1;
    },
    
    areEnemiesFrozen: () => {
      const state = get();
      return state.powerUps.freezeEnemies;
    },
    
    getTimeScale: () => {
      const state = get();
      return state.powerUps.slowMotion ? 0.3 : 1;
    },
  }))
);
