import { useEffect, useState } from "react";
import { useGameState } from "@/lib/stores/useGameState";

interface LeaderboardEntry {
  username: string;
  time: number;
  date: string;
}

// Simple shared leaderboard using a free pastebin-style service
// For production, create your own bin at jsonbin.io and replace the ID
const LEADERBOARD_URL = 'https://api.jsonstorage.net/v1/json/deadline-game-leaderboard/6750a2e1acd3cb34a8b8e3a5';

const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const response = await fetch(LEADERBOARD_URL);
    if (response.ok) {
      const data = await response.json();
      return data || [];
    }
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
  }
  
  // Fallback to localStorage
  const stored = localStorage.getItem('gameLeaderboard');
  return stored ? JSON.parse(stored) : [];
};

const addToLeaderboard = async (username: string, time: number) => {
  const leaderboard = await getLeaderboard();
  
  // Check if user already has a score
  const existingIndex = leaderboard.findIndex(entry => entry.username === username);
  
  if (existingIndex !== -1) {
    // Only update if new score is better (more time remaining)
    if (time > leaderboard[existingIndex].time) {
      leaderboard[existingIndex] = {
        username,
        time,
        date: new Date().toISOString(),
      };
    }
  } else {
    // Add new entry
    leaderboard.push({
      username,
      time,
      date: new Date().toISOString(),
    });
  }
  
  leaderboard.sort((a, b) => b.time - a.time); // Sort by time descending (more time = better)
  leaderboard.splice(10); // Keep top 10
  
  // Save to localStorage as backup
  localStorage.setItem('gameLeaderboard', JSON.stringify(leaderboard));
  
  // Save to shared leaderboard
  try {
    await fetch(LEADERBOARD_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leaderboard),
    });
  } catch (error) {
    console.error('Failed to update leaderboard:', error);
  }
  
  return leaderboard;
};

export function GameUI() {
  const phase = useGameState((state) => state.phase);
  const hearts = useGameState((state) => state.hearts);
  const maxHearts = useGameState((state) => state.maxHearts);
  const isHit = useGameState((state) => state.isHit);
  const timeRemaining = useGameState((state) => state.timeRemaining);
  const materialsCollected = useGameState((state) => state.materialsCollected);
  const totalMaterials = useGameState((state) => state.totalMaterials);
  const powerUps = useGameState((state) => state.powerUps);
  const startGame = useGameState((state) => state.startGame);
  const restartGame = useGameState((state) => state.restartGame);
  
  const [username, setUsername] = useState(localStorage.getItem('playerUsername') || '');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  
  // Load leaderboard on mount and when phase changes to won
  useEffect(() => {
    if (phase === 'won' || phase === 'menu') {
      getLeaderboard().then(setLeaderboard);
    }
  }, [phase]);
  
  // Ensure cursor is visible on win/loss screens
  useEffect(() => {
    if (phase === "won" || phase === "lost") {
      document.body.style.cursor = "auto";
      document.exitPointerLock();
    }
  }, [phase]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  const handleStart = () => {
    if (!username.trim()) {
      setUsernameError(true);
      return;
    }
    setUsernameError(false);
    localStorage.setItem('playerUsername', username.trim());
    setHasSubmittedScore(false);
    startGame();
    try {
      const canvas = document.querySelector("canvas");
      (canvas || document.body)?.requestPointerLock?.();
    } catch {}
    window.dispatchEvent(new CustomEvent("game:request-pointer-lock"));
  };

  const handleRestart = () => {
    setHasSubmittedScore(false);
    restartGame();
    try {
      const canvas = document.querySelector("canvas");
      (canvas || document.body)?.requestPointerLock?.();
    } catch {}
    window.dispatchEvent(new CustomEvent("game:request-pointer-lock"));
  };
  
  // Submit score when game is won
  useEffect(() => {
    if (phase === 'won' && !hasSubmittedScore && materialsCollected === totalMaterials) {
      const playerName = localStorage.getItem('playerUsername') || 'Anonymous';
      addToLeaderboard(playerName, timeRemaining).then((updatedLeaderboard) => {
        setLeaderboard(updatedLeaderboard);
        setHasSubmittedScore(true);
      });
    }
  }, [phase, hasSubmittedScore, materialsCollected, totalMaterials, timeRemaining]);
  
  if (phase === "menu") {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          color: "white",
          fontFamily: "Inter, sans-serif",
          zIndex: 1000,
          cursor: "auto",
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
            textShadow: "0 0 20px rgba(255,200,100,0.5)",
            background: "linear-gradient(45deg, #f9ca24, #f0932b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          DEADLINE
        </h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "2.5rem", opacity: 0.8 }}>
          Complete all tasks before time runs out!
        </p>
        
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (e.target.value.trim()) setUsernameError(false);
          }}
          placeholder="Enter your username"
          maxLength={20}
          style={{
            padding: "0.8rem 1.5rem",
            fontSize: "1.1rem",
            borderRadius: "8px",
            border: usernameError ? "2px solid #f44336" : "2px solid #f9ca24",
            backgroundColor: "rgba(255,255,255,0.1)",
            color: "white",
            marginBottom: usernameError ? "0.5rem" : "2rem",
            width: "300px",
            textAlign: "center",
          }}
          autoFocus
        />
        {usernameError && (
          <p style={{ color: "#f44336", fontSize: "0.9rem", marginBottom: "2rem" }}>
            ⚠️ Please enter your username first!
          </p>
        )}
        
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            padding: "1.5rem 2rem",
            borderRadius: "12px",
            marginBottom: "2.5rem",
            maxWidth: "400px",
          }}
        >
          <h3 style={{ marginBottom: "0.8rem", color: "#f9ca24" }}>How to Play:</h3>
          <ul style={{ listStyle: "none", padding: 0, lineHeight: 1.8 }}>
            <li>WASD / Arrow Keys - Move</li>
            <li>Mouse - Look around</li>
            <li>Complete 5 tasks</li>
            <li>Avoid distractions (they add stress!)</li>
            <li>Grab coffee for speed boost</li>
            <li>Reach the door when ready</li>
          </ul>
        </div>
        
        <button
          onClick={handleStart}
          style={{
            padding: "1rem 3rem",
            fontSize: "1.3rem",
            fontWeight: "bold",
            background: "linear-gradient(45deg, #f9ca24, #f0932b)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            color: "#1a1a2e",
            transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: "0 4px 15px rgba(249,202,36,0.4)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(249,202,36,0.6)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(249,202,36,0.4)";
          }}
        >
          Start Game
        </button>
      </div>
    );
  }
  
  if (phase === "won") {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a1a0a 0%, #0f2a0f 100%)",
          color: "white",
          fontFamily: "Inter, sans-serif",
          zIndex: 1000,
          cursor: "auto",
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            textShadow: "0 0 30px rgba(100,255,100,0.8)",
            background: "linear-gradient(45deg, #4caf50, #8bc34a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🎉 Congratulations! You Won! 🎉
        </h1>
        <p style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
          All tasks completed successfully!
        </p>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem", opacity: 0.9 }}>
          Time remaining: {formatTime(timeRemaining)}
        </p>
        
        {/* Leaderboard */}
        <div style={{
          background: "linear-gradient(135deg, rgba(76,175,80,0.15) 0%, rgba(56,142,60,0.15) 100%)",
          padding: "1.5rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          maxWidth: "500px",
          width: "100%",
          border: "2px solid rgba(76,175,80,0.3)",
        }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#66bb6a" }}>🏆 Leaderboard (Best Scores)</h2>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {leaderboard.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No scores yet. Be the first!</p>
            ) : (
              leaderboard.map((entry, index) => (
                <div key={index} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.8rem",
                  marginBottom: "0.5rem",
                  background: index === 0 ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  border: entry.username === username ? "2px solid #4caf50" : "none",
                }}>
                  <span style={{ fontWeight: "bold" }}>
                    {index + 1}. {entry.username}
                    {entry.username === username && " (You)"}
                  </span>
                  <span style={{ color: "#4caf50" }}>{formatTime(entry.time)}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <button
          onClick={handleRestart}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.2rem",
            background: "#4caf50",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            color: "white",
          }}
        >
          Play Again
        </button>
      </div>
    );
  }
  
  if (phase === "lost") {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3d0a0a 0%, #5c1a1a 100%)",
          color: "white",
          fontFamily: "Inter, sans-serif",
          zIndex: 1000,
          cursor: "auto",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            textShadow: "0 0 20px rgba(255,100,100,0.5)",
          }}
        >
          You Panicked!
        </h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
          {hearts <= 0 ? "You ran out of hearts!" : timeRemaining <= 0 ? "Time's up!" : "The room closed in!"}
        </p>
        <p style={{ fontSize: "1rem", marginBottom: "2rem", opacity: 0.8 }}>
          Tasks completed: {materialsCollected}/{totalMaterials}
        </p>
        <button
          onClick={handleRestart}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.2rem",
            background: "#f44336",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            color: "white",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  const timeColor = timeRemaining < 20 ? "#f44336" : timeRemaining < 40 ? "#ff9800" : "#ffffff";
  
  return (
    <>
      {/* Red screen flash when hit */}
      {isHit && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255, 0, 0, 0.4)",
            pointerEvents: "none",
            zIndex: 999,
            animation: "fadeOut 0.2s",
          }}
        />
      )}
      
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          padding: "20px",
          pointerEvents: "none",
          fontFamily: "Inter, sans-serif",
          zIndex: 100,
        }}
      >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.7)",
            padding: "15px 20px",
            borderRadius: "10px",
            color: "white",
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "#ccc" }}>Health</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "5px",
            }}
          >
            {Array.from({ length: maxHearts }).map((_, i) => (
              <div
                key={i}
                style={{
                  fontSize: "2rem",
                  filter: i < hearts ? "none" : "grayscale(100%) brightness(0.3)",
                  opacity: i < hearts ? 1 : 0.3,
                  textShadow: i < hearts ? "0 0 10px rgba(255,68,68,0.8)" : "none",
                  transition: "all 0.3s",
                  transform: i < hearts ? "scale(1)" : "scale(0.8)",
                }}
              >
                ❤️
              </div>
            ))}
          </div>
          <div>
            <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>Tasks</span>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {materialsCollected} / {totalMaterials}
            </div>
          </div>
        </div>
        
        <div
          style={{
            background: "rgba(0,0,0,0.7)",
            padding: "15px 25px",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.9rem", opacity: 0.8, color: "white" }}>Time</div>
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: timeColor,
              transition: "color 0.3s",
            }}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
      
      {(powerUps.speedBoost || powerUps.freezeEnemies || powerUps.slowMotion) && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "15px",
          }}
        >
          {powerUps.speedBoost && (
            <div
              style={{
                background: "rgba(121,85,72,0.9)",
                padding: "10px 20px",
                borderRadius: "8px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Speed Boost Active!
            </div>
          )}
          {powerUps.freezeEnemies && (
            <div
              style={{
                background: "rgba(96,125,139,0.9)",
                padding: "10px 20px",
                borderRadius: "8px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Enemies Frozen!
            </div>
          )}
          {powerUps.slowMotion && (
            <div
              style={{
                background: "rgba(0,188,212,0.9)",
                padding: "10px 20px",
                borderRadius: "8px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Slow Motion!
            </div>
          )}
        </div>
      )}
      
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "4px",
          height: "4px",
          background: "white",
          borderRadius: "50%",
          boxShadow: "0 0 4px rgba(0,0,0,0.5)",
        }}
      />
      </div>
    </>
  );
}
