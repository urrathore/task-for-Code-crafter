// GamePage.jsx
import React, { useRef, useState, useEffect } from "react";
import GameHeader from "../GameHeader.jsx";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import UI from "./Ui.jsx";

function GamePage() {
  const canvasRef = useRef(null);
  const chatEndRef = useRef(null);

  const [isDrawer, setIsDrawer] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [showStartRound, setShowStartRound] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState("WAITING"); // WAITING, DRAWING, GUESSING, ENDED
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundNumber, setRoundNumber] = useState(0);
  
  const lastPointRef = useRef(null);
  const gameActiveRef = useRef(false);
  const suppressGuessesRef = useRef(new Map());
  const timerRef = useRef(null);

  const playerName = localStorage.getItem("playerName") || "Anonymous";
  const roomId = localStorage.getItem("roomId");
  const isHost = playerName === localStorage.getItem("hostName");

  useEffect(() => { 
    gameActiveRef.current = gameActive; 
  }, [gameActive]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

      // Subscribe to chat/system messages
      client.subscribe(`/topic/room/${roomId}`, (message) => {
        const msg = JSON.parse(message.body);
        
        // Handle private messages
        if (msg.target && msg.target === playerName) {
          if (typeof msg.content === "string" && msg.content.trim().length > 0) {
            setCurrentWord(msg.content);
            setIsDrawer(true);
            setShowStartRound(false);
            setGameState("DRAWING");
          } else if (msg.content) {
            alert(String(msg.content));
          }
          return;
        }

        if (msg.target && msg.target !== playerName) {
          return;
        }

        // Handle different message types
        switch(msg.type) {
          case "SYSTEM":
            handleSystemMessage(msg);
            break;
          case "GAME_STATE":
            handleGameStateMessage(msg);
            break;
          case "PLAYER_UPDATE":
            setPlayers(msg.players || []);
            break;
          case "TIMER_UPDATE":
            setTimeLeft(msg.timeLeft || 0);
            break;
          default:
            // Regular chat messages
            if (msg.type === "CHAT" && typeof msg.content === "string" && 
                !msg.content.startsWith("Guessed the word ")) {
              setChatMessages(prev => [...prev, msg]);
            }
        }
        
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });

      // Subscribe to drawing events
      client.subscribe(`/canvas/${roomId}`, (message) => {
        const draw = JSON.parse(message.body);
        drawOnCanvas(draw);
      });

      // Request initial game state
      if (client && connected) {
        client.publish({
          destination: `/app/getGameState/${roomId}`,
          body: JSON.stringify({ playerName }),
        });
      }
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [roomId, playerName]);

  const handleSystemMessage = (msg) => {
    const content = msg.content || "";
    
    if (content.includes("Drawer for this round is")) {
      const match = content.match(/Drawer for this round is\s+(.*)\s*$/i);
      const newDrawerName = (match ? match[1] : content.replace("Drawer for this round is ", "")).trim();
      localStorage.setItem("drawerName", newDrawerName);
      setIsDrawer(newDrawerName.toLowerCase() === playerName.toLowerCase());
      setCurrentWord("");
      setShowStartRound(newDrawerName.toLowerCase() === playerName.toLowerCase());
      setGameActive(true);
      setGameState("DRAWING");
    }
    else if (content.includes("Round-") && content.includes("started")) {
      const currentDrawer = localStorage.getItem("drawerName");
      if (currentDrawer !== playerName) {
        setIsDrawer(false);
        setCurrentWord("");
        setShowStartRound(false);
        setGameState("GUESSING");
      }
      setRoundActive(true);
      
      // Extract round number if available
      const roundMatch = content.match(/Round-(\d+)/);
      if (roundMatch) {
        setRoundNumber(parseInt(roundMatch[1]));
      }
    }
    else if (content.includes("Round-") && content.includes("ended")) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      }
      setIsDrawer(false);
      setCurrentWord("");
      setShowStartRound(false);
      setRoundActive(false);
      setGameState("BETWEEN_ROUNDS");
    }
    else if (content.includes("Game Over")) {
      setRoundActive(false);
      setGameActive(false);
      setIsDrawer(false);
      setCurrentWord("");
      setShowStartRound(false);
      setGameState("ENDED");
      suppressGuessesRef.current = new Map();
    }
    else if (content.includes("guessed correctly")) {
      // Handle correct guess announcement
      const correctMatch = content.match(/^(.*?)\s+guessed correctly!/);
      if (correctMatch && correctMatch[1]) {
        const guessedBy = correctMatch[1];
        setChatMessages((prev) => {
          const next = [...prev];
          let removed = 0;
          for (let i = next.length - 1; i >= 0 && removed < 3; i--) {
            const m = next[i];
            if (m && m.type === "CHAT" && m.name === guessedBy) {
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
        
        const existing = suppressGuessesRef.current.get(guessedBy) || { until: 0, contents: new Set() };
        existing.until = Math.max(existing.until, Date.now() + 7000);
        suppressGuessesRef.current.set(guessedBy, existing);
      }
    }
    
    // Add to chat messages
    setChatMessages(prev => [...prev, msg]);
  };

  const handleGameStateMessage = (msg) => {
    if (msg.gameState) {
      setGameState(msg.gameState);
    }
    if (msg.roundNumber) {
      setRoundNumber(msg.roundNumber);
    }
    if (msg.timeLeft) {
      setTimeLeft(msg.timeLeft);
    }
    if (msg.players) {
      setPlayers(msg.players);
    }
    if (msg.drawer) {
      const isUserDrawer = msg.drawer.toLowerCase() === playerName.toLowerCase();
      setIsDrawer(isUserDrawer);
      localStorage.setItem("drawerName", msg.drawer);
      setShowStartRound(isUserDrawer && !msg.roundActive);
    }
    setGameActive(msg.gameActive || false);
    setRoundActive(msg.roundActive || false);
  };

  /* ------------------------- CHAT FUNCTIONS ------------------------- */
  const sendMessage = () => {
    if (chatInput.trim() === "" || (isDrawer && gameState === "DRAWING")) return;

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

    setChatInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  /* ------------------------- CANVAS FUNCTIONS ------------------------- */
  const startDrawing = (e) => {
    if (!isDrawer || gameState !== "DRAWING") return;
    
    setDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    lastPointRef.current = { x, y };
  };

  const stopDrawing = () => {
    if (!drawing) return;
    
    setDrawing(false);
    lastPointRef.current = null;
  };

  const draw = (e) => {
    if (!drawing || !isDrawer || gameState !== "DRAWING") return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const last = lastPointRef.current || { x, y };
    
    // Draw locally
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    lastPointRef.current = { x, y };

    // Send drawing data to server
    if (stompClient && connected) {
      const drawMessage = {
        startX: last.x,
        startY: last.y,
        endX: x,
        endY: y,
        color,
        thickness: brushSize,
      };
      
      stompClient.publish({
        destination: `/app/draw/${roomId}`,
        body: JSON.stringify(drawMessage),
      });
    }
  };

  const drawOnCanvas = (draw) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const { startX, startY, endX, endY, color: c, thickness } = draw;

    ctx.strokeStyle = c || "#000000";
    ctx.lineWidth = thickness || 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  };

  const clearCanvas = () => {
    if (!isDrawer || gameState !== "DRAWING") return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Notify other players to clear canvas
    if (stompClient && connected) {
      stompClient.publish({
        destination: `/app/clearCanvas/${roomId}`,
        body: JSON.stringify({ clearedBy: playerName }),
      });
    }
  };

  const handleClearCanvas = () => {
    clearCanvas();
  };

  // Handle canvas responsiveness
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = window.innerHeight * 0.6; // 60% of viewport height
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <UI
      playerName={playerName}
      roomId={roomId}
      isHost={isHost}
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
      clearCanvas={handleClearCanvas}
      color={color}
      setColor={setColor}
      brushSize={brushSize}
      setBrushSize={setBrushSize}
      isDrawer={isDrawer}
      currentWord={currentWord}
      showStartRound={showStartRound}
      gameState={gameState}
      players={players}
      timeLeft={timeLeft}
      roundNumber={roundNumber}
      stompClient={stompClient}
      connected={connected}
    />
  );
}

export default GamePage;