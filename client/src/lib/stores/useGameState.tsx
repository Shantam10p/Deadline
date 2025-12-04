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

interface Task {
  id: string;
  name: string;
  description: string;
  type: "notebook" | "calculator" | "textbook" | "memory" | "notes";
  completed: boolean;
  active: boolean;
}

interface GameState {
  phase: GamePhase;
  hearts: number;
  maxHearts: number;
  isHit: boolean;
  timeRemaining: number;
  materialsCollected: number;
  totalMaterials: number;
  roomShrinkFactor: number;
  powerUps: PowerUpState;
  collectedMaterialIds: Set<string>;
  collectedPowerUpIds: Set<string>;
  playerPosition: [number, number, number];
  tasks: Task[];
  activeMiniGame: string | null;
  miniGameData: any;

  startGame: () => void;
  endGame: (won: boolean) => void;
  restartGame: () => void;

  takeDamage: () => void;
  updateTime: (delta: number) => void;
  collectMaterial: (id: string) => void;
  collectPowerUp: (type: "coffee", id: string) => void;
  updatePowerUps: () => void;
  updateRoomShrink: () => void;
  setPlayerPosition: (pos: [number, number, number]) => void;

  getSpeedMultiplier: () => number;
  areEnemiesFrozen: () => boolean;
  getTimeScale: () => number;

  startTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  cancelTask: () => void;
  setMiniGameData: (data: any) => void;
}

const GAME_DURATION = 180;
const TOTAL_MATERIALS = 5;

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "menu",
    hearts: 5,
    maxHearts: 5,
    isHit: false,
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
    tasks: [
      { id: "notebook", name: "Write Essay", description: "Type the essay prompt", type: "notebook", completed: false, active: false },
      { id: "calculator", name: "Solve Math", description: "Calculate: 24 × 17", type: "calculator", completed: false, active: false },
      { id: "textbook", name: "Read Chapter", description: "Read and answer question", type: "textbook", completed: false, active: false },
      { id: "memory", name: "Memory Match", description: "Match the pairs", type: "memory", completed: false, active: false },
      { id: "notes", name: "Review Notes", description: "Memorize key terms", type: "notes", completed: false, active: false },
    ],
    activeMiniGame: null,
    miniGameData: null,

    startGame: () => {
      set({
        phase: "playing",
        hearts: 5,
        isHit: false,
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
        tasks: [
          { id: "notebook", name: "Write Essay", description: "Type the essay prompt", type: "notebook", completed: false, active: false },
          { id: "calculator", name: "Solve Math", description: "Calculate: 24 × 17", type: "calculator", completed: false, active: false },
          { id: "textbook", name: "Read Chapter", description: "Read and answer question", type: "textbook", completed: false, active: false },
          { id: "memory", name: "Memory Match", description: "Match the pairs", type: "memory", completed: false, active: false },
          { id: "notes", name: "Review Notes", description: "Memorize key terms", type: "notes", completed: false, active: false },
        ],
        activeMiniGame: null,
        miniGameData: null,
      });
    },

    endGame: (won: boolean) => {
      set({ phase: won ? "won" : "lost" });
    },

    restartGame: () => {
      set({
        phase: "playing",
        hearts: 5,
        isHit: false,
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
        tasks: [
          { id: "notebook", name: "Write Essay", description: "Type the essay prompt", type: "notebook", completed: false, active: false },
          { id: "calculator", name: "Solve Math", description: "Calculate: 24 × 17", type: "calculator", completed: false, active: false },
          { id: "textbook", name: "Read Chapter", description: "Read and answer question", type: "textbook", completed: false, active: false },
          { id: "memory", name: "Memory Match", description: "Match the pairs", type: "memory", completed: false, active: false },
          { id: "notes", name: "Review Notes", description: "Memorize key terms", type: "notes", completed: false, active: false },
        ],
        activeMiniGame: null,
        miniGameData: null,
      });
    },

    takeDamage: () => {
      const state = get();
      if (state.phase !== "playing") return;

      const newHearts = state.hearts - 1;
      set({ hearts: newHearts, isHit: true });

      // Clear hit flash after 200ms
      setTimeout(() => {
        set({ isHit: false });
      }, 200);

      if (newHearts <= 0) {
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
      set((state) => {
        if (state.collectedMaterialIds.has(id)) return state;

        const newCollectedIds = new Set(state.collectedMaterialIds);
        newCollectedIds.add(id);

        return {
          materialsCollected: state.materialsCollected + 1,
          collectedMaterialIds: newCollectedIds,
        };
      });
    },

    collectPowerUp: (type: "coffee", id: string) => {
      const state = get();
      if (state.phase !== "playing") return;
      if (state.collectedPowerUpIds.has(id)) return;

      const newCollected = new Set(state.collectedPowerUpIds);
      newCollected.add(id);
      
      const now = Date.now();
      const newPowerUps = { ...state.powerUps };
      
      // Coffee gives speed boost for 5 seconds
      newPowerUps.speedBoost = true;
      newPowerUps.speedBoostEndTime = now + 5000;
      
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
    
    startTask: (taskId: string) => {
      set((state) => ({
        activeMiniGame: taskId,
        tasks: state.tasks.map(t => 
          t.id === taskId ? { ...t, active: true } : t
        ),
      }));
    },
    
    completeTask: (taskId: string) => {
      const state = get();
      const completedTask = state.tasks.find(t => t.id === taskId);
      if (!completedTask) return;
      
      if (completedTask.completed) {
        // Still close the mini-game even if task was already completed
        set({ activeMiniGame: null, miniGameData: null });
        return;
      }
      
      const newTasks = state.tasks.map(t => 
        t.id === taskId ? { ...t, completed: true, active: false } : t
      );
      
      const completedCount = newTasks.filter(t => t.completed).length;
      
      set({
        tasks: newTasks,
        activeMiniGame: null,
        miniGameData: null,
        materialsCollected: completedCount,
        totalMaterials: state.tasks.length,
      });
    },
    
    cancelTask: () => {
      set((state) => ({
        activeMiniGame: null,
        tasks: state.tasks.map(t => ({ ...t, active: false })),
        miniGameData: null,
      }));
    },
    
    setMiniGameData: (data: any) => {
      set({ miniGameData: data });
    },
  })
)
);
