import React from "react";

function GameControls({
  isHost,
  isDrawer,
  gameState,
  showStartRound,
  onStartGame,
  onStartRound,
  currentWord
}) {
  return (
    <div className="flex flex-wrap gap-4 mb-6 justify-center">
      {isHost && gameState === "WAITING" && (
        <button
          onClick={onStartGame}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium shadow-lg transition-colors"
        >
          Start Game
        </button>
      )}
      
      {showStartRound && (
        <button
          onClick={onStartRound}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium shadow-lg transition-colors"
        >
          Start Round
        </button>
      )}
      
      {isDrawer && currentWord && (
        <div className="px-6 py-3 bg-blue-600 rounded-lg text-white font-medium">
          Word: {currentWord}
        </div>
      )}
    </div>
  );
}

export default GameControls;