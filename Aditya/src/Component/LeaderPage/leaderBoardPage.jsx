import React, { useEffect, useState } from "react";

const LeaderBoardPage = () => {
  // ----------------- BACKEND -----------------
  // Replace this with your backend API or socket call
  // Example: fetch leaderboard from server
  const playersDataFromBackend = [
    { name: "Raj", score: 1500 },
    { name: "Aman", score: 1200 },
    { name: "Simran", score: 1000 },
    { name: "Karan", score: 800 },
    { name: "Neha", score: 600 },
  ];
  // -------------------------------------------

  const [scores, setScores] = useState(playersDataFromBackend.map(() => 0));

  // Animate scores on load
  useEffect(() => {
    const interval = setInterval(() => {
      setScores((prev) =>
        prev.map((s, i) =>
          s < playersDataFromBackend[i].score
            ? s + Math.ceil(playersDataFromBackend[i].score / 50)
            : s
        )
      );
    }, 40);

    return () => clearInterval(interval);
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
        {playersDataFromBackend.map((player, index) => (
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
            <span>
              {scores[index]}
              {/* ----------------- BACKEND -----------------
                  Replace scores[index] with actual score from backend if needed
                  Example: player.score
              ------------------------------------------- */}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderBoardPage;
