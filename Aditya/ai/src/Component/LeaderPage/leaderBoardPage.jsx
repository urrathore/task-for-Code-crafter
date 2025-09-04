import React, { useEffect, useState } from "react";

const LeaderBoardPage = () => {
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState([]);

  // Fetch and animate leaderboard
  useEffect(() => {
    const roomId = localStorage.getItem("roomId");
    fetch(`http://localhost:8080/game/leaderboard/${roomId}`)
      .then((r) => r.json())
      .then((data) => {
        setPlayers(data);
        setScores(data.map(() => 0));
        const interval = setInterval(() => {
          setScores((prev) =>
            prev.map((s, i) => (s < data[i].score ? s + Math.ceil(data[i].score / 50) : s))
          );
        }, 40);
        return () => clearInterval(interval);
      })
      .catch(() => {
        setPlayers([]);
        setScores([]);
      });
  }, []);

  // Emojis for top 3 positions
  const getEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start p-4">
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-6 sm:mb-8 text-center relative neon-title">
        ⚡ Leaderboard ⚡
      </h1>

      {/* Leaderboard Box */}
      <div className="w-full max-w-lg bg-gray-900/70 p-4 sm:p-6 rounded-2xl shadow-xl border border-cyan-400 neon-border">
        {players.map((player, index) => (
          <div
            key={index}
            className={`flex justify-between items-center py-3 px-4 my-2 rounded-xl text-base sm:text-lg md:text-xl font-semibold 
              ${
                index === 0
                  ? "text-yellow-400"
                  : index === 1
                  ? "text-gray-300"
                  : index === 2
                  ? "text-orange-400"
                  : "text-white"
              } bg-gray-800/70`}
          >
            {/* Player Name + Rank + Emoji */}
            <span className="flex items-center gap-2">
              {index + 1}. {player.name} {getEmoji(index)}
              {/* ----------------- BACKEND -----------------
                  Replace player.name with actual data from backend
                  Example: player.name = socket or API value
              ------------------------------------------- */}
            </span>

            {/* Animated Score */}
            <span>{scores[index] ?? player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderBoardPage;
