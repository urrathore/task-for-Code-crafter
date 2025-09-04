import React, { useState, useEffect } from "react";
import GameHeader from "./GameHeader.jsx";
import CanvasArea from "./CanvasArea.jsx";
import ChatArea from "./ChatArea.jsx";
import Scoreboard from "./Scoreboard.jsx";
import GameControls from "./GameControls.jsx";

function UI({
  playerName,
  roomId,
  isHost,
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
  showStartRound,
  gameState,
  players,
  timeLeft,
  roundNumber,
  stompClient,
  connected,
}) {
  const [drawerName, setDrawerName] = useState(localStorage.getItem("drawerName"));
  const [activeTool, setActiveTool] = useState("brush");

  const handleStartGame = () => {
    if (!stompClient || !connected) return;
    
    stompClient.publish({
      destination: `/app/startGame/${roomId}`,
      body: JSON.stringify({ hostName: playerName }),
    });
  };

  const handleStartRound = () => {
    if (!stompClient || !connected) return;
    
    stompClient.publish({
      destination: `/app/startRound/${roomId}`,
      body: JSON.stringify({ drawerName: playerName }),
    });
  };

  const getGameStatusMessage = () => {
    switch(gameState) {
      case "WAITING":
        return "Waiting for host to start the game";
      case "DRAWING":
        return isDrawer ? "You're drawing!" : `${drawerName} is drawing...`;
      case "GUESSING":
        return "Guess what's being drawn!";
      case "BETWEEN_ROUNDS":
        return "Round over! Preparing next round...";
      case "ENDED":
        return "Game Over!";
      default:
        return "Waiting for game to start";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      <GameHeader playerName={playerName} roomId={roomId} />
      
      <div className="container mx-auto px-4 py-4">
        {/* Game info bar */}
        <div className="flex flex-wrap items-center justify-between mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 px-3 py-1 rounded-md">
              Room: {roomId}
            </div>
            
            <div className={`px-3 py-1 rounded-md ${
              gameState === "DRAWING" ? "bg-purple-500" : 
              gameState === "GUESSING" ? "bg-green-500" : 
              gameState === "ENDED" ? "bg-red-500" : "bg-yellow-500"
            }`}>
              {getGameStatusMessage()}
            </div>
            
            {timeLeft > 0 && (
              <div className="bg-red-500 px-3 py-1 rounded-md">
                Time: {timeLeft}s
              </div>
            )}
            
            {roundNumber > 0 && (
              <div className="bg-indigo-500 px-3 py-1 rounded-md">
                Round {roundNumber}
              </div>
            )}
          </div>
          
          <Scoreboard players={players} currentPlayer={playerName} />
        </div>
        
        {/* Game controls */}
        <GameControls 
          isHost={isHost}
          isDrawer={isDrawer}
          gameState={gameState}
          showStartRound={showStartRound}
          onStartGame={handleStartGame}
          onStartRound={handleStartRound}
          currentWord={currentWord}
        />
        
        {/* Main content area */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-7/12">
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
              gameState={gameState}
              activeTool={activeTool}
              setActiveTool={setActiveTool}
            />
          </div>
          
          <div className="w-full lg:w-5/12">
            <ChatArea
              chatMessages={chatMessages}
              chatEndRef={chatEndRef}
              chatInput={chatInput}
              setChatInput={setChatInput}
              handleKeyPress={handleKeyPress}
              sendMessage={sendMessage}
              isDrawer={isDrawer}
              gameState={gameState}
              playerName={playerName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UI;