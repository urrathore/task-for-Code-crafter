import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import picture from "../assets/picture.jpg";
import { useNavigate } from "react-router-dom";

/* ------------------- PANDA FACE COMPONENT ------------------- */
/* Cute Panda face animation that follows mouse movement */
function PandaFace() {
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);

  useEffect(() => {
    const moveEyes = (e) => {
      const eyes = [
        { eye: document.getElementById("leftEye"), pupil: leftPupilRef.current },
        { eye: document.getElementById("rightEye"), pupil: rightPupilRef.current },
      ];

      eyes.forEach(({ eye, pupil }) => {
        if (!eye || !pupil) return;
        const rect = eye.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const angle = Math.atan2(dy, dx);
        const radius = rect.width / 4;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        pupil.style.transform =`translate(${x}px, ${y}px)`;
      });
    };

    window.addEventListener("mousemove", moveEyes);
    return () => window.removeEventListener("mousemove", moveEyes);
  }, []);

  return (
    <div className="flex justify-center mb-4">
      <div className="relative w-64 h-64 bg-white rounded-full border-4 border-black flex items-center justify-center shadow-lg">
        {/* Ears */}
        <div className="absolute -top-6 -left-6 w-16 h-16 bg-black rounded-full"></div>
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-black rounded-full"></div>

        {/* Eyes */}
        <div
          id="leftEye"
          className="absolute left-1/5 top-1/3 w-16 h-16 bg-white rounded-full flex justify-center items-center border-2 border-black overflow-hidden"
        >
          <div ref={leftPupilRef} className="w-6 h-6 bg-black rounded-full transition-transform"></div>
        </div>
        <div
          id="rightEye"
          className="absolute right-1/5 top-1/3 w-16 h-16 bg-white rounded-full flex justify-center items-center border-2 border-black overflow-hidden"
        >
          <div ref={rightPupilRef} className="w-6 h-6 bg-black rounded-full transition-transform"></div>
        </div>

        {/* Nose */}
        <div className="absolute bottom-1/3 w-5 h-5 bg-black rounded-full"></div>

        {/* Smile */}
        <svg className="absolute bottom-12" width="60" height="30" viewBox="0 0 60 30">
          <path
            d="M5 5 C 30 30, 30 30, 55 5"
            stroke="black"
            strokeWidth="3"
            fill="transparent"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

/* ------------------- MODAL COMPONENT ------------------- */
/* Reusable modal for both Create Room and Join Room */
function Modal({ show, onClose, title, actionLabel, onAction, showRoomInput, defaultRoomId }) {
  const [playerName, setPlayerName] = useState(""); // Player name input
  const [roomId, setRoomId] = useState(""); // Room ID input

  // Auto-fill roomId whenever defaultRoomId changes
  useEffect(() => {
    if (defaultRoomId) setRoomId(defaultRoomId);
  }, [defaultRoomId]);

  if (!show) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gradient-to-br from-purple-800 via-blue-800 to-indigo-900 border-2 border-pink-500/70 shadow-[0_0_20px_rgba(255,0,255,0.5)] rounded-2xl p-6 w-80 text-center backdrop-blur-md"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Panda face */}
          <PandaFace />

          {/* Modal title */}
          <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-pulse">
            {title}
          </h3>

          {/* Player name input (only for join room) */}
          {showRoomInput && (
            <>
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-black bg-opacity-20 text-white placeholder-gray-300"
              />
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black bg-opacity-20 text-white placeholder-gray-300"
              />
            </>
          )}

          {/* Action buttons */}
          <div className="flex justify-between gap-3">
            <button
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(255,0,255,0.7)] transition-all w-full animate-pulse"
              onClick={() => {
                if (showRoomInput) {
                  onAction(playerName, roomId);
                } else {
                  onAction(); // just close for create room popup
                }
              }}
            >
              {actionLabel}
            </button>

            <button
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg w-full transition"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

/* ------------------- HOME BUTTONS COMPONENT ------------------- */
/* Main landing page buttons for Create and Join Room */
/* ------------------- HOME BUTTONS COMPONENT ------------------- */
function HomeButtons() {
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState("");
  const navigate =useNavigate();
  /* ---------- CREATE ROOM FUNCTION ---------- */
  const handleCreateRoom = async () => {
    try {
      const res = await fetch("http://localhost:8080/rooms/create", { method: "POST" });
      const newRoomId = await res.text();
      setCreatedRoomId(newRoomId);
      setShowCreate(true);
    } catch (err) {
      console.error(err);
      alert("Failed to create room");
    }
  };

  /* ---------- JOIN ROOM FUNCTION ---------- */
  const handleJoinRoom = async (playerName, roomId) => {
    if (!playerName || !roomId) {
      alert("Please enter both Player Name and Room ID");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, roomId }),
      });

      const responseText = await res.text();

      if (responseText.includes(`Player: ${playerName} added successfully!`)) {
        localStorage.setItem("playerName", playerName);
        localStorage.setItem("roomId", roomId);
        navigate("/game");
      } else {
        alert(responseText || "Invalid Room ID or error occurred");
      }
    } catch (err) {
      console.error(err);
      alert("Error while joining room");
    }
  };
  return (
    <section className="text-center py-10 relative z-10">
      <h2 className="text-2xl font-semibold mb-6 text-white">
        🧑🏻‍🎨 Get-Set • Draw • Win 🏆
      </h2>

      <div className="flex flex-col items-center gap-5">
        <img src={picture} alt="game" className="w-60 rounded-xl shadow-lg" />

        {/* Create Room Button */}
        <button
          onClick={handleCreateRoom}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition"
        >
          Create Room
        </button>

        {/* Join Room Button */}
        <button
          onClick={() => setShowJoin(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md transition"
        >
          Join Room
        </button>
      </div>

      {/* ------------------- CREATE ROOM MODAL ------------------- */}
      <Modal
        show={showCreate}
        onClose={() => setShowCreate(false)}
        title="Room Created!"
        actionLabel="OK"
        defaultRoomId={createdRoomId} // Display room ID
        onAction={() => {
          // 🔹 Close "Create Room" popup and immediately open "Join Room"
          setShowCreate(false);
          setShowJoin(true);
        }}
      />

      {/* ------------------- JOIN ROOM MODAL ------------------- */}
<Modal
  show={showJoin}
  onClose={() => setShowJoin(false)}
  title="Join Room"
  actionLabel="Join"
  showRoomInput={true}
  defaultRoomId={createdRoomId}
  onAction={async (playerName, roomId) => {
    if (!playerName || !roomId) {
      alert("Enter both Player Name and Room ID");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/players/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, roomId }),
      });

      const responseText = await res.text();
      const trimmedResponse = responseText.trim();

      if (trimmedResponse.includes(`${playerName} joined successfully!`)) {
        localStorage.setItem("playerName", playerName);
        localStorage.setItem("roomId", roomId);

        // ✅ Navigate to Game Page
        navigate("/game");
      }
      else if(trimmedResponse.includes(`${playerName} joined as HOST!`))
      {
        localStorage.setItem("hostName", playerName);
        localStorage.setItem("playerName", playerName);
        localStorage.setItem("roomId", roomId);
        navigate("/game");
      } 
      else  {
        alert(responseText || "Invalid Room ID");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to join room");
    }
  }}
/>
    </section>
  );
}

export default HomeButtons;