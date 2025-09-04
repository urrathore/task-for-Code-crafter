import React from "react";

function ChatArea({
  chatMessages,
  chatEndRef,
  chatInput,
  setChatInput,
  handleKeyPress,
  sendMessage,
  isDrawer,
  gameState,
  playerName
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col h-96">
      <h2 className="text-xl font-semibold mb-4">Chat</h2>
      
      <div className="flex-1 overflow-y-auto mb-4">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg mb-2 ${
              msg.type === "SYSTEM"
                ? "bg-blue-900 text-blue-200"
                : msg.name === playerName
                ? "bg-green-900 text-green-200 ml-8"
                : "bg-gray-700 text-gray-200 mr-8"
            }`}
          >
            {msg.type === "SYSTEM" ? (
              <span className="font-medium">{"⚡ " + msg.content}</span>
            ) : (
              <>
                <span className="font-medium">{msg.name}: </span>
                <span>{msg.content}</span>
              </>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      
      <div className="flex">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your guess..."
          disabled={isDrawer && gameState === "DRAWING"}
          className="flex-1 bg-gray-700 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <button
          onClick={sendMessage}
          disabled={isDrawer && gameState === "DRAWING"}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 px-4 py-2 rounded-r-lg font-medium transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatArea;