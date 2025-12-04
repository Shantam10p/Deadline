import { useGameState } from "@/lib/stores/useGameState";

export function GameUI() {
  const phase = useGameState((state) => state.phase);
  const stress = useGameState((state) => state.stress);
  const timeRemaining = useGameState((state) => state.timeRemaining);
  const materialsCollected = useGameState((state) => state.materialsCollected);
  const totalMaterials = useGameState((state) => state.totalMaterials);
  const powerUps = useGameState((state) => state.powerUps);
  const startGame = useGameState((state) => state.startGame);
  const restartGame = useGameState((state) => state.restartGame);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  const handleStart = () => {
    startGame();
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.requestPointerLock();
    }
  };
  
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
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            textShadow: "0 0 20px rgba(255,200,100,0.5)",
            background: "linear-gradient(45deg, #f9ca24, #f0932b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Finals Week Frenzy
        </h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem", opacity: 0.8 }}>
          Collect all study materials before time runs out!
        </p>
        
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            padding: "1.5rem 2rem",
            borderRadius: "12px",
            marginBottom: "2rem",
            maxWidth: "400px",
          }}
        >
          <h3 style={{ marginBottom: "0.8rem", color: "#f9ca24" }}>How to Play:</h3>
          <ul style={{ listStyle: "none", padding: 0, lineHeight: 1.8 }}>
            <li>WASD / Arrow Keys - Move</li>
            <li>Mouse - Look around</li>
            <li>Collect 5 study materials</li>
            <li>Avoid distractions (they add stress!)</li>
            <li>Grab power-ups for help</li>
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
          background: "linear-gradient(135deg, #0a3d0a 0%, #1a5c1a 100%)",
          color: "white",
          fontFamily: "Inter, sans-serif",
          zIndex: 1000,
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            textShadow: "0 0 20px rgba(100,255,100,0.5)",
          }}
        >
          You Finished Studying!
        </h1>
        <p style={{ fontSize: "1.3rem", marginBottom: "2rem" }}>
          Time remaining: {formatTime(timeRemaining)}
        </p>
        <button
          onClick={restartGame}
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
          {stress >= 100 ? "Too much stress!" : timeRemaining <= 0 ? "Time's up!" : "The room closed in!"}
        </p>
        <p style={{ fontSize: "1rem", marginBottom: "2rem", opacity: 0.8 }}>
          Materials collected: {materialsCollected}/{totalMaterials}
        </p>
        <button
          onClick={restartGame}
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
  
  const stressColor = stress > 70 ? "#f44336" : stress > 40 ? "#ff9800" : "#4caf50";
  const timeColor = timeRemaining < 20 ? "#f44336" : timeRemaining < 40 ? "#ff9800" : "#ffffff";
  
  return (
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
          <div style={{ marginBottom: "10px" }}>
            <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>Stress</span>
            <div
              style={{
                width: "150px",
                height: "12px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "6px",
                overflow: "hidden",
                marginTop: "4px",
              }}
            >
              <div
                style={{
                  width: `${stress}%`,
                  height: "100%",
                  background: stressColor,
                  transition: "width 0.3s, background 0.3s",
                }}
              />
            </div>
          </div>
          
          <div>
            <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>Materials</span>
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
  );
}
