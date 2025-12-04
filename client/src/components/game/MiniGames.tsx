import { useState, useEffect, useCallback } from "react";
import { useGameState } from "@/lib/stores/useGameState";

export function MiniGames() {
  const activeMiniGame = useGameState((state) => state.activeMiniGame);
  const tasks = useGameState((state) => state.tasks);
  const completeTask = useGameState((state) => state.completeTask);
  const cancelTask = useGameState((state) => state.cancelTask);

  const activeTask = tasks.find((t) => t.id === activeMiniGame);

  // Force cursor visibility and prevent pointer lock when modal is open
  useEffect(() => {
    if (activeMiniGame) {
      document.body.style.cursor = 'auto';
      document.exitPointerLock();
      
      // Prevent any pointer lock attempts
      const preventPointerLock = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        document.exitPointerLock();
      };
      
      document.addEventListener('pointerlockchange', preventPointerLock);
      document.addEventListener('pointerlockerror', preventPointerLock);
      
      return () => {
        document.body.style.cursor = 'none';
        document.removeEventListener('pointerlockchange', preventPointerLock);
        document.removeEventListener('pointerlockerror', preventPointerLock);
        
        // Re-request pointer lock immediately and with retries
        const requestLock = () => {
          const canvas = document.querySelector('canvas');
          if (canvas) {
            canvas.requestPointerLock().catch(() => {
              // Retry after a short delay if it fails
              setTimeout(requestLock, 50);
            });
          }
        };
        
        // Try immediately
        requestLock();
        
        // Also try after a delay as backup
        setTimeout(requestLock, 100);
      };
    }
  }, [activeMiniGame]);

  if (!activeMiniGame || !activeTask) return null;

  const stopBackgroundClick = (e: any) => {
    // Only stop if clicking the background overlay, not the content
    if (e.target === e.currentTarget) {
      e.stopPropagation();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        cursor: "default",
        userSelect: "none",
      }}
      onClick={stopBackgroundClick}
    >
      <div
        style={{
          backgroundColor: "#1a1a2e",
          padding: "40px",
          borderRadius: "20px",
          maxWidth: "600px",
          width: "90%",
          border: "3px solid #4a9eff",
          boxShadow: "0 0 30px rgba(74, 158, 255, 0.5)",
          cursor: "default",
          userSelect: "none",
        }}
      >
        {activeTask.type === "notebook" && (
          <NotebookTask task={activeTask} onComplete={() => completeTask(activeTask.id)} onCancel={cancelTask} />
        )}
        {activeTask.type === "calculator" && (
          <CalculatorTask task={activeTask} onComplete={() => completeTask(activeTask.id)} onCancel={cancelTask} />
        )}
        {activeTask.type === "textbook" && (
          <TextbookTask task={activeTask} onComplete={() => {
            console.log("📝 TextbookTask onComplete called for:", activeTask.id);
            completeTask(activeTask.id);
          }} onCancel={cancelTask} />
        )}
        {activeTask.type === "memory" && (
          <MemoryMatchTask task={activeTask} onComplete={() => completeTask(activeTask.id)} onCancel={cancelTask} />
        )}
        {activeTask.type === "notes" && (
          <NotesTask task={activeTask} onComplete={() => completeTask(activeTask.id)} onCancel={cancelTask} />
        )}
      </div>
    </div>
  );
}

function NotebookTask({ task, onComplete, onCancel }: any) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const phrases = [
    "I will focus on my studies",
    "Stay focused and work hard",
    "Complete tasks before deadline",
    "Avoid all distractions today",
    "Success requires dedication",
  ];
  const [targetText] = useState(() => phrases[Math.floor(Math.random() * phrases.length)]);

  const handleSubmit = () => {
    const isCorrect = input.toLowerCase().trim() === targetText.toLowerCase();
    setFeedback(isCorrect ? "Task Completed!" : "Incorrect Answer!");
    
    setTimeout(() => {
      if (isCorrect) {
        onComplete();
      } else {
        onCancel();
      }
      // Request pointer lock after closing
      setTimeout(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) canvas.requestPointerLock();
      }, 50);
    }, 1000);
  };

  if (feedback) {
    return (
      <div style={{ color: "#fff", textAlign: "center" }}>
        <h2 style={{ 
          fontSize: "32px", 
          color: feedback === "Task Completed!" ? "#4caf50" : "#ff4444",
          marginBottom: "20px"
        }}>
          {feedback}
        </h2>
      </div>
    );
  }

  return (
    <div style={{ color: "#fff", cursor: "default" }}>
      <h2 style={{ marginBottom: "20px", color: "#4a9eff", userSelect: "none" }}>{task.name}</h2>
      <p style={{ marginBottom: "20px", fontSize: "18px", userSelect: "none" }}>Type this simple note:</p>
      <p style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "bold", color: "#ffd700", userSelect: "none" }}>
        "{targetText}"
      </p>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type here..."
        style={{
          width: "100%",
          padding: "15px",
          fontSize: "18px",
          borderRadius: "10px",
          border: "2px solid #4a9eff",
          backgroundColor: "#0f0f1e",
          color: "#fff",
          marginBottom: "20px",
          textAlign: "center",
          cursor: "text",
        }}
        autoFocus
      />
      <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
        <button
          onClick={onCancel}
          style={{
            padding: "12px 30px",
            fontSize: "16px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#666",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={{
            padding: "12px 30px",
            fontSize: "16px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#4caf50",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function CalculatorTask({ task, onComplete, onCancel }: any) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const problems = [
    { question: "7 × 8", answer: "56" },
    { question: "9 × 6", answer: "54" },
    { question: "12 × 5", answer: "60" },
    { question: "8 × 9", answer: "72" },
    { question: "11 × 7", answer: "77" },
    { question: "6 × 13", answer: "78" },
  ];
  const [problem] = useState(() => problems[Math.floor(Math.random() * problems.length)]);
  const correctAnswer = problem.answer;

  const handleSubmit = () => {
    const isCorrect = answer === correctAnswer;
    setFeedback(isCorrect ? "Task Completed!" : "Incorrect Answer!");
    
    setTimeout(() => {
      if (isCorrect) {
        onComplete();
      } else {
        onCancel();
      }
      // Request pointer lock after closing
      setTimeout(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) canvas.requestPointerLock();
      }, 50);
    }, 1000);
  };

  if (feedback) {
    return (
      <div style={{ color: "#fff", textAlign: "center" }}>
        <h2 style={{ 
          fontSize: "32px", 
          color: feedback === "Task Completed!" ? "#4caf50" : "#ff4444",
          marginBottom: "20px"
        }}>
          {feedback}
        </h2>
      </div>
    );
  }

  return (
    <div style={{ color: "#fff", cursor: "default" }}>
      <h2 style={{ marginBottom: "20px", color: "#4a9eff", userSelect: "none" }}>{task.name}</h2>
      <p style={{ marginBottom: "30px", fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>
        Calculate: {problem.question} = ?
      </p>
      <input
        type="number"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Enter answer..."
        style={{
          width: "100%",
          padding: "15px",
          fontSize: "24px",
          borderRadius: "10px",
          border: "2px solid #4a9eff",
          backgroundColor: "#0f0f1e",
          color: "#fff",
          marginBottom: "20px",
          textAlign: "center",
          cursor: "text",
        }}
        autoFocus
      />
      <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
        <button
          onClick={onCancel}
          style={{
            padding: "12px 30px",
            fontSize: "16px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#666",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={{
            padding: "12px 30px",
            fontSize: "16px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#4caf50",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function TextbookTask({ task, onComplete, onCancel }: any) {
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const questions = [
    {
      question: "What is the capital of France?",
      options: [
        { id: "A", text: "London" },
        { id: "B", text: "Berlin" },
        { id: "C", text: "Paris" },
        { id: "D", text: "Madrid" },
      ],
      correct: "C"
    },
    {
      question: "What is 2 + 2?",
      options: [
        { id: "A", text: "3" },
        { id: "B", text: "4" },
        { id: "C", text: "5" },
        { id: "D", text: "6" },
      ],
      correct: "B"
    },
    {
      question: "Which planet is closest to the Sun?",
      options: [
        { id: "A", text: "Venus" },
        { id: "B", text: "Earth" },
        { id: "C", text: "Mercury" },
        { id: "D", text: "Mars" },
      ],
      correct: "C"
    },
    {
      question: "How many days are in a week?",
      options: [
        { id: "A", text: "5" },
        { id: "B", text: "6" },
        { id: "C", text: "7" },
        { id: "D", text: "8" },
      ],
      correct: "C"
    },
  ];
  const [quiz] = useState(() => questions[Math.floor(Math.random() * questions.length)]);
  const correctAnswer = quiz.correct;

  const handleSubmit = () => {
    const isCorrect = selected === correctAnswer;
    setFeedback(isCorrect ? "Task Completed!" : "Incorrect Answer!");
    
    setTimeout(() => {
      if (isCorrect) {
        onComplete();
      } else {
        onCancel();
      }
      // Request pointer lock after closing
      setTimeout(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) canvas.requestPointerLock();
      }, 50);
    }, 1000);
  };

  if (feedback) {
    return (
      <div style={{ color: "#fff", textAlign: "center" }}>
        <h2 style={{ 
          fontSize: "32px", 
          color: feedback === "Task Completed!" ? "#4caf50" : "#ff4444",
          marginBottom: "20px"
        }}>
          {feedback}
        </h2>
      </div>
    );
  }

  return (
    <div style={{ color: "#fff", cursor: "default" }}>
      <h2 style={{ marginBottom: "20px", color: "#4a9eff", userSelect: "none" }}>{task.name}</h2>
      <p style={{ marginBottom: "20px", fontSize: "18px" }}>
        Question: {quiz.question}
      </p>
      <div style={{ marginBottom: "20px" }}>
        {quiz.options.map((option) => (
          <div
            key={option.id}
            onClick={() => setSelected(option.id)}
            style={{
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "10px",
              border: `2px solid ${selected === option.id ? "#4a9eff" : "#333"}`,
              backgroundColor: selected === option.id ? "#1a3a5a" : "#0f0f1e",
              cursor: "pointer",
              transition: "all 0.2s",
              userSelect: "none",
            }}
          >
            <strong>{option.id}.</strong> {option.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
        <button
          onClick={onCancel}
          style={{
            padding: "12px 30px",
            fontSize: "16px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#666",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={{
            padding: "12px 30px",
            fontSize: "16px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#4caf50",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function MemoryMatchTask({ task, onComplete, onCancel }: any) {
  const [cards, setCards] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Initialize cards on mount
  useEffect(() => {
    const symbols = ["📚", "✏️", "🎓", "📝"];
    const pairs = [...symbols, ...symbols];
    const shuffled = pairs
      .map((symbol, index) => ({ id: index, symbol, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, []);

  // Check for matches
  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [first, second] = flippedIndices;
      if (cards[first].symbol === cards[second].symbol) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map((card, idx) => 
            idx === first || idx === second ? { ...card, matched: true, flipped: false } : card
          ));
          setFlippedIndices([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map((card, idx) => 
            idx === first || idx === second ? { ...card, flipped: false } : card
          ));
          setFlippedIndices([]);
        }, 1000);
      }
    }
  }, [flippedIndices, cards]);

  // Check if all matched
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.matched)) {
      setFeedback("Task Completed!");
      setTimeout(() => {
        onComplete();
        // Request pointer lock after closing
        setTimeout(() => {
          const canvas = document.querySelector('canvas');
          if (canvas) canvas.requestPointerLock();
        }, 50);
      }, 1000);
    }
  }, [cards]);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].flipped || cards[index].matched) return;
    
    setCards(prev => prev.map((card, idx) => 
      idx === index ? { ...card, flipped: true } : card
    ));
    setFlippedIndices(prev => [...prev, index]);
  };

  if (feedback) {
    return (
      <div style={{ color: "#fff", textAlign: "center" }}>
        <h2 style={{ 
          fontSize: "32px", 
          color: "#4caf50",
          marginBottom: "20px"
        }}>
          {feedback}
        </h2>
      </div>
    );
  }

  return (
    <div style={{ color: "#fff", cursor: "default" }}>
      <h2 style={{ marginBottom: "20px", color: "#4a9eff", userSelect: "none" }}>{task.name}</h2>
      <p style={{ marginBottom: "20px", fontSize: "18px", textAlign: "center", userSelect: "none" }}>Match all the pairs!</p>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(4, 1fr)", 
        gap: "10px", 
        marginBottom: "20px",
        cursor: "default"
      }}>
        {cards.map((card, index) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(index)}
            style={{
              width: "100%",
              aspectRatio: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              borderRadius: "10px",
              border: "2px solid #4a9eff",
              backgroundColor: card.matched ? "#1a4a2a" : card.flipped ? "#1a3a5a" : "#0f0f1e",
              cursor: card.matched || card.flipped ? "default" : "pointer",
              transition: "all 0.3s",
              userSelect: "none",
            }}
          >
            {card.flipped || card.matched ? card.symbol : "?"}
          </div>
        ))}
      </div>
      <button
        onClick={onCancel}
        style={{
          width: "100%",
          padding: "12px 30px",
          fontSize: "16px",
          borderRadius: "10px",
          border: "none",
          backgroundColor: "#666",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Cancel (ESC)
      </button>
    </div>
  );
}

function NotesTask({ task, onComplete, onCancel }: any) {
  const [memorized, setMemorized] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const termSets = [
    ["Focus", "Study", "Learn", "Practice"],
    ["Read", "Write", "Review", "Prepare"],
    ["Plan", "Execute", "Complete", "Succeed"],
    ["Think", "Analyze", "Solve", "Achieve"],
  ];
  const [terms] = useState(() => termSets[Math.floor(Math.random() * termSets.length)]);

  useEffect(() => {
    if (memorized.length === terms.length && !feedback) {
      setFeedback("Task Completed!");
      setTimeout(() => {
        onComplete();
        // Request pointer lock after closing
        setTimeout(() => {
          const canvas = document.querySelector('canvas');
          if (canvas) canvas.requestPointerLock();
        }, 50);
      }, 1000);
    }
  }, [memorized.length, terms.length, feedback]);

  if (feedback) {
    return (
      <div style={{ color: "#fff", textAlign: "center" }}>
        <h2 style={{ 
          fontSize: "32px", 
          color: "#4caf50",
          marginBottom: "20px"
        }}>
          {feedback}
        </h2>
      </div>
    );
  }

  return (
    <div style={{ color: "#fff", cursor: "default" }}>
      <h2 style={{ marginBottom: "20px", color: "#4a9eff", userSelect: "none" }}>{task.name}</h2>
      <p style={{ marginBottom: "20px", fontSize: "18px", userSelect: "none" }}>Click each word to memorize it:</p>
      <div style={{ marginBottom: "20px", cursor: "default" }}>
        {terms.map((term) => (
          <div
            key={term}
            onClick={() => !memorized.includes(term) && setMemorized([...memorized, term])}
            style={{
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "10px",
              border: `2px solid ${memorized.includes(term) ? "#4caf50" : "#4a9eff"}`,
              backgroundColor: memorized.includes(term) ? "#1a4a2a" : "#0f0f1e",
              cursor: memorized.includes(term) ? "default" : "pointer",
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "bold",
              transition: "all 0.3s",
              userSelect: "none",
            }}
          >
            {memorized.includes(term) ? "✓ " : ""}
            {term}
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", color: "#4a9eff", userSelect: "none" }}>
        {memorized.length} / {terms.length} memorized
      </p>
      <button
        onClick={onCancel}
        style={{
          width: "100%",
          padding: "12px 30px",
          fontSize: "16px",
          borderRadius: "10px",
          border: "none",
          backgroundColor: "#666",
          color: "#fff",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Cancel (ESC)
      </button>
    </div>
  );
}
