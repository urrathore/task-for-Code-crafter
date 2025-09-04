// GamePage.jsx
const host = "https://96378e0765b6.ngrok-free.app"
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
  const [drawerName,setDrawerName]=useState(localStorage.getItem("drawerName"||""));
  const [gameStarted,setGameStarted]=useState(false);
  // Canvas states
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#ff00ff");
  const [brushSize, setBrushSize] = useState(4);

  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);

  const playerName = localStorage.getItem("playerName") || "Anonymous";
  const roomId = localStorage.getItem("roomId");

/* ------------------------- CONNECT TO BACKEND ------------------------- */
  useEffect(() => {
    const socket = new SockJS(`http://localhost:8080/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });

    // Track subscriptions
    const subscriptions = [];

    client.onConnect = () => {
      setConnected(true);
      console.log(`Connected as ${playerName} in room ${roomId}`);

      // ✅ Subscribe to chat messages for this room
      const roomSub = client.subscribe(`/topic/room/${roomId}`, (message) => {
        const msg = JSON.parse(message.body);
        console.log("📨 Received message:", msg);
        
        // Handle messages based on target field
        if (msg.target && msg.target !== "") {
          // This message has a specific target
          if (msg.target === playerName) {
            // This message is for the current player
            if (msg.type === "WORD") {
              // This is the word for the drawer
              setCurrentWord(msg.content);
              setIsDrawer(true);
              setShowStartRound(false);
              console.log("🎯 Received word:", msg.content);
            } else {
              // Other targeted messages (like errors)
              setChatMessages((prev) => [...prev, msg]);
            }
          }
          // If the target doesn't match, ignore the message
        } else {
          // No target - broadcast to everyone
          setChatMessages((prev) => [...prev, msg]);
          
          // Handle system messages for drawer assignment
          if (msg.type === "SYSTEM" || msg.name === "System") {
            // Check if this is a drawer announcement
            if (msg.content.includes("Drawer for this round is")) {
              const newDrawerName = msg.content.replace("Drawer for this round is ", "").trim();
              localStorage.setItem("drawerName", newDrawerName);
              setDrawerName(newDrawerName);
              
              console.log("🎨 New drawer:", newDrawerName, "Current player:", playerName);
              
              // If this player is the new drawer, show start round button
              if (newDrawerName === playerName) {
                setIsDrawer(false); // Not drawer until round starts
                setShowStartRound(true);
                console.log("🔄 This player is the new drawer, showing start round button");
              } else {
                setIsDrawer(false);
                setShowStartRound(false);
                console.log("👤 This player is not the drawer");
              }
            }
            
            // Check if game started
            if (msg.content.includes("Round started") && !msg.content.includes("Round-")) {
              setGameStarted(true);
            }
            
            // Check if round ended
            if (msg.content.includes("has ended")) {
              setIsDrawer(false);
              setCurrentWord("");
              // Clear canvas when round ends
              if (canvasRef.current) {
                canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              }
            }
            
            // Check if game ended
            if (msg.content.includes("Game Over")) {
              setGameStarted(false);
              localStorage.removeItem("drawerName");
              setDrawerName("");
              setIsDrawer(false);
              setShowStartRound(false);
            }
          }
        }
        
        // Auto-scroll to bottom of chat
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      });
      subscriptions.push(roomSub);

      // ✅ Subscribe to drawing events
      const canvasSub = client.subscribe(`/canvas/${roomId}`, (message) => {
        const draw = JSON.parse(message.body);
        drawOnCanvas(draw);
      });
      subscriptions.push(canvasSub);
    };

    client.activate();
    setStompClient(client);

    return () => {
      // Unsubscribe from all topics
      subscriptions.forEach(sub => sub.unsubscribe());
      client.deactivate();
    };
  }, [roomId, playerName]);

  /* ------------------------- CHAT FUNCTIONS ------------------------- */
  const sendMessage = () => {
    if (chatInput.trim() === "" || isDrawer) return; // Drawer cannot send messages

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
    if (!isDrawer) return; // Only drawer can draw
    setDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setDrawing(false);
    if (canvasRef.current) {
      canvasRef.current.getContext("2d").beginPath();
    }
  };

  const draw = (e) => {
    if (!drawing || !isDrawer) return; // Only drawer can draw
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // ✅ Send draw event to backend
    if (stompClient && connected) {
      const drawMessage = { x, y, color, brushSize };
      stompClient.publish({
        destination: `/app/draw/${roomId}`,
        body: JSON.stringify(drawMessage),
      });
    }
  };

  // ✅ Apply received drawing event
  const drawOnCanvas = (draw) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = draw.color;
    ctx.lineWidth = draw.brushSize;
    ctx.lineCap = "round";

    ctx.lineTo(draw.x, draw.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(draw.x, draw.y);
  };

  const clearCanvas = () => {
    if (!isDrawer) return; // Only drawer can clear
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    }
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
      showStartRound={showStartRound}
      setShowStartRound={setShowStartRound}
      setGameStarted={setGameStarted}
      drawerName={drawerName}
      setDrawerName={setDrawerName}
      gameStarted={gameStarted }
    />
  );
}

export default GamePage;