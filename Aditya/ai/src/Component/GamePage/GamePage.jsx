// GamePage.jsx
import React, { useRef, useState, useEffect } from "react";
import GameHeader from "../GameHeader.jsx";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import UI from "./UI.jsx";

function GamePage() {
  const canvasRef = useRef(null);
  const chatEndRef = useRef(null);

  const [isDrawer, setIsDrawer] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [showStartRound, setShowStartRound] = useState(false);
  // Canvas states
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#ff00ff");
  const [brushSize, setBrushSize] = useState(4);
  const lastPointRef = useRef(null);

  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const gameActiveRef = useRef(false);
  useEffect(() => { gameActiveRef.current = gameActive; }, [gameActive]);
  // name -> { until: number, contents: Set<string> }
  const suppressGuessesRef = useRef(new Map());
  
  // Scoreboard state
  const [players, setPlayers] = useState([]);
  const [showGameOver, setShowGameOver] = useState(false);

  const playerName = localStorage.getItem("playerName") || "Anonymous";
  const roomId = localStorage.getItem("roomId");
/* ------------------------- CONNECT TO BACKEND ------------------------- */
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      setConnected(true);
      console.log(`✅ Connected as ${playerName} in room ${roomId}`);

      // ✅ Subscribe to chat/system messages for this room
      client.subscribe(`/topic/room/${roomId}`, (message) => {
        const msg = JSON.parse(message.body);
        
        // Handle private messages (targeted to this player)
        if (msg.target && msg.target === playerName) {
          if (typeof msg.content === "string" && msg.content.trim().length > 0) {
            // Word for drawer or private notice
            setCurrentWord(msg.content);
            setIsDrawer(true);
            setShowStartRound(false);
          } else if (msg.content) {
            alert(String(msg.content));
          }
          // Do not append private word to public chat
          return;
        }

        // If message has a different target, ignore it entirely
        if (msg.target && msg.target !== playerName) {
          return;
        }

        // Public/system messages
        if (msg.type === "SYSTEM") {
          const content = msg.content || "";

          if (content.includes("Drawer for this round is")) {
            const match = content.match(/Drawer for this round is\s+(.*)\s*$/i);
            const newDrawerName = (match ? match[1] : content.replace("Drawer for this round is ", "")).trim();
            localStorage.setItem("drawerName", newDrawerName);
            // Don't set isDrawer to false here - wait for round to start
            setCurrentWord("");
            // Show start round button only for the new drawer
            const isNewDrawer = newDrawerName.toLowerCase() === (playerName || "").toLowerCase();
            setShowStartRound(isNewDrawer);
            console.log(`🎨 New drawer: ${newDrawerName}, Current player: ${playerName}, Show button: ${isNewDrawer}`);
            setGameActive(true);
            // Keep suppression; it will expire automatically
          }

          if (content.includes("Round-") && content.includes("started")) {
            // Round started; set drawer state correctly
            const currentDrawer = localStorage.getItem("drawerName");
            const isCurrentDrawer = currentDrawer && currentDrawer.toLowerCase() === (playerName || "").toLowerCase();
            
            if (isCurrentDrawer) {
              // This player is the drawer
              setIsDrawer(true);
              setShowStartRound(false);
            } else {
              // This player is not the drawer
              setIsDrawer(false);
              setCurrentWord("");
              setShowStartRound(false);
            }
            setRoundActive(true);
            console.log(`🎯 Round started - Player: ${playerName}, Drawer: ${currentDrawer}, IsDrawer: ${isCurrentDrawer}`);
            // Do not clear suppression here; only exact content is suppressed and will expire
          }

          if (content.includes("Round-") && content.includes("ended")) {
            // Clear canvas at end of round
            const canvas = canvasRef.current;
            if (canvas) {
              canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            }
            setIsDrawer(false);
            setCurrentWord("");
            // Don't hide start round button here - let the "Drawer for this round is" message handle it
            // setShowStartRound(false);
            setRoundActive(false);
            // Keep suppression shortly to catch late echoes; entries auto-expire
          }

          if (content.includes("Game Over")) {
            // Show Game Over screen with final scoreboard
            setRoundActive(false);
            setGameActive(false);
            setIsDrawer(false);
            setCurrentWord("");
            setShowStartRound(false);
            suppressGuessesRef.current = new Map();
            setShowGameOver(true);
            
            // Fetch final leaderboard
            fetch(`http://localhost:8080/game/leaderboard/${roomId}`)
              .then(res => res.json())
              .then(leaderboard => {
                setPlayers(leaderboard);
              })
              .catch(err => console.error("Error getting leaderboard:", err));
          }
          
          // Update leaderboard when someone guesses correctly
          if (content.includes("guessed correctly!") || content.includes("Guessed the word correctly!")) {
            fetch(`http://localhost:8080/game/leaderboard/${roomId}`)
              .then(res => res.json())
              .then(leaderboard => {
                setPlayers(leaderboard);
              })
              .catch(err => console.error("Error getting leaderboard:", err));
          }
        }

        // Drop noisy duplicates and correct word guesses before appending
        if (msg.type === "CHAT" && typeof msg.content === "string") {
          // Hide any message that contains the correct word guess
          if (msg.content.startsWith("Guessed the word ") || 
              msg.content.includes("Guessed the word ") ||
              msg.content.includes("guessed the word ")) {
            return;
          }
        }
        
        // Allow correct guess messages to show
        // if (typeof msg.content === "string") {
        //   const content = msg.content.toLowerCase();
        //   // Check if message contains player name followed by "guessed"
        //   if (content.includes("guessed") && (content.includes("correctly") || content.includes("right") || content.includes("word"))) {
        //     console.log("🚫 Filtering out potential correct guess:", msg.content);
        //     return;
        //   }
        //   // Also filter any message that contains "guessed correctly" pattern
        //   if (content.includes("guessed correctly")) {
        //     console.log("🚫 Filtering out 'guessed correctly' message:", msg.content);
        //     return;
        //   }
        // }
        
        // Allow SYSTEM messages with correct guesses to show
        // if (msg.type === "SYSTEM" && typeof msg.content === "string") {
        //   const content = msg.content.toLowerCase();
        //   if (content.includes("guessed the word correctly!") ||
        //       content.includes("guessed correctly!") ||
        //       content.includes("correctly guessed") ||
        //       content.includes("word correctly") ||
        //       content.includes("guessed the word") ||
        //       content.includes("correct guess") ||
        //       content.includes("got it right") ||
        //       content.includes("found the word")) {
        //     console.log("🚫 Filtering out correct guess message:", msg.content);
        //     return;
        //   }
        // }
        let toAppend = msg;
        if (msg.type === "SYSTEM" && typeof msg.content === "string") {
          if (msg.content.startsWith("Round ") && msg.content.includes("started!")) {
            return; // prefer the dashed variant "Round-n started!"
          }
          if (msg.content.includes("Player{id")) {
            const nameMatch = msg.content.match(/name='([^']+)'/);
            const name = nameMatch ? nameMatch[1] : "drawer";
            toAppend = { ...msg, content: msg.content.replace(/Drawer: .+$/, `Drawer: ${name}`) };
          }
          // If a correct guess was announced, prune the latest chat from that player to hide the word
          const correctMatch = msg.content.match(/^(.*?)\s+Guessed the word correctly!/);
          if (correctMatch && correctMatch[1]) {
            const guessedBy = correctMatch[1];
            // Drop the most recent few CHAT lines from this player
            setChatMessages((prev) => {
              const next = [...prev];
              let removed = 0;
              for (let i = next.length - 1; i >= 0 && removed < 3; i--) {
                const m = next[i];
                if (m && m.type === "CHAT" && m.name === guessedBy) {
                  // Track suppressed content to avoid late echo
                  if (typeof m.content === 'string') {
                    const entry = suppressGuessesRef.current.get(guessedBy) || { until: 0, contents: new Set() };
                    entry.contents.add(m.content);
                    entry.until = Date.now() + 15000;
                    suppressGuessesRef.current.set(guessedBy, entry);
                  }
                  next.splice(i, 1);
                  removed++;
                }
              }
              return next;
            });
            // Brief blanket suppression to catch immediate echo from this player
            const existing = suppressGuessesRef.current.get(guessedBy) || { until: 0, contents: new Set() };
            existing.until = Math.max(existing.until, Date.now() + 7000);
            suppressGuessesRef.current.set(guessedBy, existing);
          }
        }

        // Allow CHAT lines through (so incorrect guesses show). Correct guesses are removed above.
        if (toAppend.type === "CHAT" && typeof toAppend.content === "string") {
          const entry = suppressGuessesRef.current.get(toAppend.name);
          if (entry && Date.now() < entry.until && entry.contents && entry.contents.has(toAppend.content)) {
            return; // suppress correct word echo arriving slightly later
          }
        }

        // Append to chat feed
        setChatMessages((prev) => [...prev, toAppend]);
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });

      // ✅ Subscribe to drawing events
      client.subscribe(`/canvas/${roomId}`, (message) => {
        const draw = JSON.parse(message.body);
        drawOnCanvas(draw);
      });
      client.subscribe(`/topic/canvas/${roomId}`, (message) => {
        const draw = JSON.parse(message.body);
        drawOnCanvas(draw);
      });

      // Note: Private word is delivered on the room topic with target set to playerName
    };

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [roomId]);

  /* ------------------------- CHAT FUNCTIONS ------------------------- */
  const sendMessage = () => {
    if (chatInput.trim() === "") return;
    
    // Check if current player is the drawer
    const currentDrawer = localStorage.getItem("drawerName");
    const isCurrentPlayerDrawer = currentDrawer && currentDrawer.toLowerCase() === (playerName || "").toLowerCase();
    
    // Drawer cannot send messages (check multiple conditions)
    if (isDrawer || currentWord || isCurrentPlayerDrawer) {
      alert("Drawer cannot guess the word!");
      setChatInput(""); // Clear input to prevent confusion
      return;
    }

    const chatMessage = {
      name: playerName,
      content: chatInput,
      type: "CHAT",
    };

    if (stompClient && connected) {
      stompClient.publish({
        destination: `/app/sendMessage/${roomId}`,
        body: JSON.stringify(chatMessage),
      });
    }

    setChatInput(""); // clear input after sending
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  /* ------------------------- CANVAS FUNCTIONS ------------------------- */
  const startDrawing = (e) => {
    if (!isDrawer) {
      alert("Wait for your turn to draw!");
      return; // Only drawer can draw
    }
    setDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastPointRef.current = { x, y };
  };

  const stopDrawing = () => {
    setDrawing(false);
    canvasRef.current.getContext("2d").beginPath();
    lastPointRef.current = null;
  };

  const draw = (e) => {
    if (!drawing || !isDrawer) {
      if (!isDrawer) {
        alert("Wait for your turn to draw!");
      }
      return; // Only drawer can draw
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Draw segment from last point to current
    const last = lastPointRef.current || { x, y };
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPointRef.current = { x, y };

    // Send draw segment to backend (with backward-compatible fields)
    if (stompClient && connected) {
      const drawMessage = {
        startX: last.x,
        startY: last.y,
        endX: x,
        endY: y,
        color,
        thickness: brushSize,
        x,
        y,
        brushSize,
      };
      stompClient.publish({
        destination: `/app/canvas/${roomId}`,
        body: JSON.stringify(drawMessage),
      });
    }
  };

  // ✅ Apply received drawing event
  const drawOnCanvas = (draw) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const { startX, startY, endX, endY, color: c, thickness } = draw;
    ctx.strokeStyle = c || draw.color;
    ctx.lineWidth = thickness || draw.brushSize || 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX ?? draw.x, startY ?? draw.y);
    ctx.lineTo(endX ?? draw.x, endY ?? draw.y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    if (!isDrawer) return; // Only drawer can clear
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    // Optionally inform others to clear (if backend supports). Otherwise, each client clears on round end system message
  };

  /* ------------------------- UI ------------------------- */
  return (
    <UI
      playerName={playerName}
      roomId={roomId}
      canvasRef={canvasRef}
      chatEndRef={chatEndRef}
      chatMessages={chatMessages}
      chatInput={chatInput}
      setChatInput={setChatInput}
      handleKeyPress={handleKeyPress}
      sendMessage={sendMessage}
      startDrawing={startDrawing}
      stopDrawing={stopDrawing}
      draw={draw}
      clearCanvas={clearCanvas}
      color={color}
      setColor={setColor}
      brushSize={brushSize}
      setBrushSize={setBrushSize}
      isDrawer={isDrawer}
      setIsDrawer={setIsDrawer}
      currentWord={currentWord}
      setCurrentWord={setCurrentWord}
      setShowStartRound={setShowStartRound}
      showStartRound={showStartRound}
      players={players}
      showGameOver={showGameOver}
      setShowGameOver={setShowGameOver}
      roundActive={roundActive}
    />
  );
}

export default GamePage;