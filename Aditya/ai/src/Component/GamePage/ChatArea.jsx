// ChatArea.jsx (updated to disable input for drawer)
import React from "react";

function ChatArea({
  chatMessages,
  chatEndRef,
  chatInput,
  setChatInput,
  handleKeyPress,
  sendMessage,
  isDrawer,
  playerName,
  currentWord,
}) {
  // Check if current player is the drawer
  const currentDrawer = localStorage.getItem("drawerName");
  const isCurrentPlayerDrawer = currentDrawer && currentDrawer.toLowerCase() === (playerName || "").toLowerCase();
  const shouldDisableChat = isDrawer || currentWord || isCurrentPlayerDrawer;
  return (
    <div className="w-full md:w-1/3 bg-gray-800 rounded-lg p-4 flex flex-col max-h-[70vh]">
      <h2 className="text-xl font-bold mb-4">Chat</h2>
      
      <div className="flex-1 overflow-y-auto mb-4 min-h-[200px]">
        {chatMessages
          .filter((msg) => !msg.target || msg.target === playerName)
          // drop consecutive duplicates (same author and content)
          .filter((msg, idx, arr) => {
            if (idx === 0) return true;
            const prev = arr[idx - 1];
            return !(prev.name === msg.name && prev.content === msg.content && prev.type === msg.type);
          })
          .filter((msg) => {
            // Hide duplicated or noisy lines and correct word guesses
            if (msg.type === 'CHAT' && typeof msg.content === 'string') {
              // Hide any message that contains correct word guess (case insensitive)
              if (msg.content.toLowerCase().includes('guessed the word ')) return false;
            }
            if (msg.type === 'SYSTEM' && typeof msg.content === 'string') {
              // Allow correct guess announcements to show
              // const content = msg.content.toLowerCase();
              // // Hide correct guess announcements
              // if (content.includes('guessed the word correctly!') ||
              //     content.includes('guessed correctly!') ||
              //     content.includes('correctly guessed') ||
              //     content.includes('word correctly') ||
              //     content.includes('guessed the word') ||
              //     content.includes('correct guess') ||
              //     content.includes('got it right') ||
              //     content.includes('found the word') ||
              //     content.includes('guessed correctly')) return false;
              // Prefer the dashed Round-n message; hide generic duplicate
              if (msg.content.startsWith('Round ') && msg.content.includes('started!')) return false;
            }
            return true;
          })
          .map((msg, index) => {
            let displayContent = msg.content;
            const isJoin = msg.type === 'JOIN' || (typeof msg.content === 'string' && msg.content.toLowerCase().includes('joined the room'));
            let className = (msg.type === 'SYSTEM' || isJoin) ? 'text-yellow-300 italic' : '';
            if (msg.type === 'SYSTEM' && typeof msg.content === 'string') {
              // Normalize drawer message containing Player{...}
              if (msg.content.includes("Player{id")) {
                const nameMatch = msg.content.match(/name='([^']+)'/);
                const name = nameMatch ? nameMatch[1] : 'drawer';
                displayContent = msg.content.replace(/Drawer: .+$/, `Drawer: ${name}`);
              }
              // Drop the redundant drawer announce if needed
              if (msg.content.startsWith('Drawer for this round is')) {
                // Keep it but toned down
                className = 'text-yellow-200 italic';
              }
            }
            // Do not mask here; GamePage now masks only during active rounds
            return (
              <div key={index} className={`mb-2 ${className}`}>
                {(msg.type === 'SYSTEM' || isJoin) ? (
                  <span>{displayContent}</span>
                ) : (
                  <>
                    <span className="font-bold">{msg.name}:</span> {displayContent}
                  </>
                )}
              </div>
            );
          })}
        <div ref={chatEndRef} />
      </div>
      
      <div className="flex">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isDrawer || currentWord ? "Drawer cannot guess the word!" : "Type your guess..."}
          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-l focus:outline-none"
          disabled={isDrawer || currentWord}
        />
        <button
          onClick={sendMessage}
          disabled={isDrawer || currentWord}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:bg-gray-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatArea;