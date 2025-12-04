# Finals Week Frenzy

A 3D browser-based survival game where you play as a university student collecting study materials the night before finals while avoiding distractions in a shrinking dorm room.

## Overview

- **Goal**: Collect all 5 study materials and reach the door before time runs out
- **Avoid**: Distractions that increase your stress meter
- **Power-ups**: Coffee (speed boost), Headphones (freeze enemies), Focus Pill (slow motion)
- **Challenge**: The room shrinks over 90 seconds, making it harder to avoid distractions

## Project Architecture

### Frontend (client/)
- **React + Three.js** via @react-three/fiber for 3D rendering
- **Zustand** for state management
- **@react-three/drei** for utilities like PointerLockControls and Text

### Key Components
- `client/src/components/game/Game.tsx` - Main game component integrating all systems
- `client/src/components/game/DormRoom.tsx` - 3D dorm room environment with furniture
- `client/src/components/game/Player.tsx` - First-person controls with PointerLockControls
- `client/src/components/game/StudyMaterials.tsx` - 5 collectible items with glowing effects
- `client/src/components/game/Distractions.tsx` - 6 enemy types that follow player
- `client/src/components/game/PowerUps.tsx` - 3 power-up types with visual effects
- `client/src/components/game/DynamicLighting.tsx` - Lighting that shifts as time decreases
- `client/src/components/game/DoorTrigger.tsx` - Win condition trigger
- `client/src/components/game/GameUI.tsx` - HUD and game screens

### State Management
- `client/src/lib/stores/useGameState.tsx` - Central game state with:
  - Game phase (menu, playing, won, lost)
  - Stress meter (0-100)
  - Timer (90 seconds)
  - Materials collected counter
  - Power-up states and timers
  - Room shrink factor

### Backend (server/)
- Express server serving the Vite-built frontend
- Standard REST API structure (unused for this game)

## Game Mechanics

### Win Conditions
- Collect all 5 study materials
- Reach the door (glows green when ready)

### Lose Conditions
- Stress reaches 100
- Timer reaches 0
- Room shrinks too much (walls close in)

### Controls
- WASD / Arrow Keys - Movement
- Mouse - Look around
- Click to lock pointer (enables mouse look)

## Running the Game

```bash
npm run dev
```

The game will be available at http://localhost:5000

## Recent Changes

- December 2024: Initial implementation of Finals Week Frenzy
  - Complete 3D dorm room environment
  - First-person player controls
  - 5 collectible study materials with particle effects
  - 6 distraction enemies with AI following
  - 3 power-up types
  - Dynamic lighting system
  - Room shrinking mechanics
  - Full UI with stress bar, timer, and game screens
