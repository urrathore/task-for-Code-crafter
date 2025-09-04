import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function GameHeader() {
  const [activePopup, setActivePopup] = useState(null); // "guide" | "leaderboard" | null

  const togglePopup = (popupName) => {
    setActivePopup((prev) => (prev === popupName ? null : popupName));
  };

  const popupAnimation = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <header className="bg-gradient-to-r from-indigo-900 via-blue-900 to-purple-900 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex flex-col items-center py-4 px-6">
        {/* Logo */}
        <h1 className="text-3xl font-bold text-white tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-pulse mb-3">
          Doodle <span className="text-pink-400">Rush</span>
        </h1>

        {/* Navbar centered */}
        <nav>
          <ul className="flex gap-8 font-semibold text-white justify-center">
            {/* Home */}
            <li>
              <Link
                to="/"
                className="hover:text-pink-400 transition-all duration-200"
              >
                Home
              </Link>
            </li>

            {/* Guide Popup */}
            <li className="relative">
                <button
                    onClick={() => togglePopup("guide")}
                    className="hover:text-pink-400 transition-all duration-200"
                >
                    Guide
                </button>
                <AnimatePresence>
                    {activePopup === "guide" && (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={popupAnimation}
                            className="absolute top-10 left-1/2 -translate-x-1/2 w-64 bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-800 text-white rounded-lg shadow-[0_0_20px_rgba(255,0,255,0.5)] p-4 z-50"
                        >
                            <h3 className="font-bold mb-2 text-pink-400">How to Play</h3>
                            <ol className="list-decimal list-inside text-sm space-y-1">
                                <li>Guess the word based on drawings.</li>
                                <li>Each correct guess earns points.</li>
                                <li>Multiplayer battles with friends!</li>
                            </ol>
                            <button
                                className="mt-2 text-sm text-pink-400 underline hover:text-pink-600"
                                onClick={() => setActivePopup(null)}
                            >
                                Close
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </li>

            {/* Leaderboard Popup */}
            <li className="relative">
              <button
                onClick={() => togglePopup("leaderboard")}
                className="hover:text-pink-400 transition-all duration-200"
              >
                Leaderboard
              </button>
              <AnimatePresence>
                {activePopup === "leaderboard" && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={popupAnimation}
                    className="absolute top-10 left-1/2 -translate-x-1/2 w-64 bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-800 text-white rounded-lg shadow-[0_0_20px_rgba(255,0,255,0.5)] p-4 z-50"
                  >
                    <h3 className="font-bold mb-2 text-pink-400">Leaderboard</h3>
                    <ol className="list-decimal list-inside text-sm">
                      <li>Player1 - 100 pts</li>
                      <li>Player2 - 90 pts</li>
                      <li>Player3 - 80 pts</li>
                    </ol>
                    <button
                      className="mt-2 text-sm text-pink-400 underline hover:text-pink-600"
                      onClick={() => setActivePopup(null)}
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default GameHeader;
