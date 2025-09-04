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
  setIsDrawer,
  currentWord,
  setCurrentWord,
  setShowStartRound,
  showStartRound,
  players,
  showGameOver,
  setShowGameOver,
  roundActive,
}) {
  const [drawerName, setDrawerName] = useState(localStorage.getItem("drawerName"));
  const [gameStarted, setGameStarted] = useState(false);
  const hostName = localStorage.getItem("hostName");


  // Add this useEffect to handle automatic round transitions
  useEffect(() => {
    // Listen for system messages about round changes
    const handleRoundMessages = () => {
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (lastMessage && lastMessage.type === "SYSTEM") {
        // Check if a new drawer is announced
        if (lastMessage.content.includes("Drawer for this round is")) {
          setGameStarted(true);
          const newDrawerName = lastMessage.content.replace("Drawer for this round is ", "");
          localStorage.setItem("drawerName", newDrawerName);
          setDrawerName(newDrawerName);
          setIsDrawer(false);
        }
        
        // Check if round started
        if (lastMessage.content.includes("Round-") && lastMessage.content.includes("started")) {
          setGameStarted(true);
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
          // Re-enable Start Game for host
          setGameStarted(false);
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
        setGameStarted(true);
        
        // The Start Round button visibility is driven by WebSocket drawer message
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
        setIsDrawer(true); // enable drawer-only actions (including chat block)
        setShowStartRound(false);
      })
      .catch((err) => {
        console.error("❌ Error starting round:", err);
        alert(err.message);
      });
  };

  // Game Over Screen
  if (showGameOver) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <GameHeader playerName={playerName} roomId={roomId} />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Game Over!</h1>
          <h2 className="text-2xl font-semibold text-yellow-400 mb-6">Final Leaderboard</h2>
        </div>

        <div className="w-full max-w-md bg-gray-800 rounded-lg p-6 mb-8">
          {players.map((player, index) => (
            <div
              key={index}
              className={`flex justify-between items-center py-3 px-4 my-2 rounded-xl text-lg font-semibold ${
                index === 0
                  ? "text-yellow-400 bg-yellow-400/20"
                  : index === 1
                  ? "text-gray-300 bg-gray-300/20"
                  : index === 2
                  ? "text-orange-400 bg-orange-400/20"
                  : "text-white bg-gray-700/50"
              }`}
            >
              <span className="flex items-center gap-2">
                {index + 1}. {player.name}
                {index === 0 && " 🥇"}
                {index === 1 && " 🥈"}
                {index === 2 && " 🥉"}
              </span>
              <span>{player.score} pts</span>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              setShowGameOver(false);
              setGameStarted(false);
            }}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white shadow-lg transition"
          >
            Play Again
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white shadow-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

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
        {playerName === hostName && !showStartRound && !isDrawer && !gameStarted && (
          <button
            onClick={handleStartGame}
            className="px-6 py-2 bg-green-500 rounded-lg text-white shadow-lg"
          >
            Start Game
          </button>
        )}

        {showStartRound && (
          <button
            onClick={handleStartRound}
            className="px-6 py-2 bg-green-500 rounded-lg text-white shadow-lg"
          >
            Start Round
          </button>
        )}

        {isDrawer && currentWord && (
          <div className="px-4 py-2 bg-purple-700/40 border border-purple-400 rounded-lg text-purple-200 font-semibold">
            Word: {currentWord}
          </div>
        )}
        
        {!isDrawer && roundActive && (
          <div className="px-4 py-2 bg-gray-700/40 border border-gray-400 rounded-lg text-gray-200 font-semibold">
            Guess the word!
          </div>
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
          roundActive={roundActive}
        />

        <ChatArea
          chatMessages={chatMessages}
          chatEndRef={chatEndRef}
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleKeyPress={handleKeyPress}
          sendMessage={sendMessage}
          isDrawer={isDrawer}
          playerName={playerName}
          currentWord={currentWord}
        />
      </div>
    </div>
  );
}

export default UI;