// UI.jsx
import React, { useState, useEffect } from "react";
import GameHeader from "../GameHeader.jsx";
import CanvasArea from "./CanvasArea.jsx";
import ChatArea from "./ChatArea.jsx";

function UI({
  playerName,
  roomId,
  canvasRef,
  chatEndRef,
  chatMessages,
  chatInput,
  setChatInput,
  handleKeyPress,
  sendMessage,
  startDrawing,
  stopDrawing,
  draw,
  clearCanvas,
  color,
  setColor,
  brushSize,
  setBrushSize,
  isDrawer,
  currentWord,
  gameStarted

}) {
  const [drawerName, setDrawerName] = useState(localStorage.getItem("drawerName"));
  const [showStartRound, setShowStartRound] = useState(false);
  const hostName = localStorage.getItem("hostName");

  useEffect(() => {
    const storedDrawerName = localStorage.getItem("drawerName");
    setDrawerName(storedDrawerName);
    
    // If this player is the drawer, show start round button
    if (storedDrawerName === playerName) {
      setShowStartRound(true);
    }
  }, [playerName]);

  useEffect(() => {
    const storedDrawerName = localStorage.getItem("drawerName");
    setDrawerName(storedDrawerName);
    
    // If this player is the drawer, show start round button
    if (storedDrawerName === playerName) {
      setShowStartRound(true);
    }
  }, [playerName]);

  // Add this useEffect to handle automatic round transitions
  useEffect(() => {
    // Listen for system messages about round changes
    const handleRoundMessages = () => {
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (lastMessage && lastMessage.type === "SYSTEM") {
        // Check if a new drawer is announced
        if (lastMessage.content.includes("Drawer for this round is")) {
          const newDrawerName = lastMessage.content.replace("Drawer for this round is ", "");
          localStorage.setItem("drawerName", newDrawerName);
          setDrawerName(newDrawerName);
          
          // If this player is the new drawer, show start round button
          if (newDrawerName === playerName) {
            setShowStartRound(true);
            setIsDrawer(false);
          } else {
            setIsDrawer(false);
            setShowStartRound(false);
          }
        }
        
        // Check if round ended
        if (lastMessage.content.includes("Round-") && lastMessage.content.includes("ended")) {
          // Reset canvas for all players
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
          }
          
          // Reset drawer state
          setIsDrawer(false);
          setCurrentWord("");
        }
        
        // Check if game ended
        if (lastMessage.content.includes("Game Over")) {
          // Fetch and display leaderboard
          fetch(`http:localhost:8080/game/leaderboard/${roomId}`)
            .then(res => res.json())
            .then(leaderboard => {
              alert("Game Over! Leaderboard: " + 
                leaderboard.map(p => `${p.name}: ${p.score}`).join(", "));
            })
            .catch(err => console.error("Error getting leaderboard:", err));
        }
      }
    };

    handleRoundMessages();
  }, [chatMessages, playerName, roomId, canvasRef, setIsDrawer, setCurrentWord]);



  const handleStartGame = () => {
    fetch(`http://localhost:8080/game/startGame/${roomId}/${playerName}`, {
      method: "POST",
    })
      .then((res) => res.text())
      .then((data) => {
        console.log("✅ Game started:", data);
        localStorage.setItem("drawerName", data);
        setDrawerName(data);
        
        // If this player is the new drawer, show start round button
        if (data === playerName) {
          setShowStartRound(true);
        }
      })
      .catch((err) => console.error("❌ Error starting game:", err));
  };

  const handleStartRound = () => {
    fetch(`http://localhost:8080/game/startRound/${roomId}/${playerName}`, {
      method: "POST",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Only drawer can start the round");
        }
        return res.text();
      })
      .then((data) => {
        console.log("✅ Round started:", data);
        // The word will be received via private message
        setCurrentWord(data);
        setIsDrawer(true);
        setShowStartRound(false);
      })
      .catch((err) => {
        console.error("❌ Error starting round:", err);
        alert(err.message);
      });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Header */}
      <GameHeader playerName={playerName} roomId={roomId} />

      {/* Room ID display */}
      <div className="my-6 mx-auto w-max bg-yellow-400 text-black font-bold text-xl px-6 py-3 rounded-full shadow-lg text-center">
        Room ID: {roomId}
      </div>

     {/* Buttons */}
      <div className="flex justify-center gap-4 mb-4">
        {/* Show Start Game button only to host and only if game hasn't started */}
        {playerName === hostName && !gameStarted && (
          <button
            onClick={handleStartGame}
            className="px-6 py-2 bg-green-500 rounded-lg text-white shadow-lg"
          >
            Start Game
          </button>
        )}

        {/* Show Start Round button only to the current drawer */}
        {showStartRound && playerName === drawerName && (
          <button
            onClick={handleStartRound}
            className="px-6 py-2 bg-green-500 rounded-lg text-white shadow-lg"
          >
            Start Round
          </button>
        )}

        {/* Show the word only to the drawer */}
        {isDrawer && (
          <p className="text-xl font-bold text-purple-600">Word: {currentWord}</p>
        )}
      </div>

      {/* Layout */}
      <div className="container mx-auto flex flex-col md:flex-row gap-6 px-4 py-6">
        <CanvasArea
          canvasRef={canvasRef}
          startDrawing={startDrawing}
          stopDrawing={stopDrawing}
          draw={draw}
          clearCanvas={clearCanvas}
          color={color}
          setColor={setColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          isDrawer={isDrawer}
        />

        <ChatArea
          chatMessages={chatMessages}
          chatEndRef={chatEndRef}
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleKeyPress={handleKeyPress}
          sendMessage={sendMessage}
          isDrawer={isDrawer}
        />
      </div>
    </div>
  );
}

export default UI;