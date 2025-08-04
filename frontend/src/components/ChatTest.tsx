import React, { useState } from 'react';
import ChatWindow from './Chat/ChatWindow';

const ChatTest: React.FC = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Chat Loading Test</h2>
      
      <div className="space-y-4">
        <button 
          onClick={() => setShowChat(!showChat)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mobile-touch-friendly mobile-no-hover mobile-active-feedback"
        >
          {showChat ? 'Hide Chat' : 'Show Chat'}
        </button>
        
        {showChat && (
          <div className="border border-gray-300 rounded p-2">
            <p className="text-sm text-gray-600 mb-2">
              Chat component will show loading screen when opened
            </p>
            <ChatWindow />
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Expected Behavior:</h3>
        <ul className="text-sm space-y-1">
          <li>• Initial loading screen with animated logo</li>
          <li>• Connection status updates</li>
          <li>• Error handling if connection fails</li>
          <li>• Smooth transition to chat interface</li>
          <li>• Loading indicator for additional messages</li>
        </ul>
      </div>
    </div>
  );
};

export default ChatTest; 