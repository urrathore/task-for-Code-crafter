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
}) {
  return (
    <div className="w-full md:w-1/3 bg-gray-800 rounded-lg p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Chat</h2>
      
      <div className="flex-1 overflow-y-auto mb-4">
        {chatMessages.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="font-bold">{msg.name}:</span> {msg.content}
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
          placeholder={isDrawer ? "Drawer cannot chat" : "Type your guess..."}
          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-l focus:outline-none"
          disabled={isDrawer}
        />
        <button
          onClick={sendMessage}
          disabled={isDrawer}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:bg-gray-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatArea;