import { useState, useEffect } from 'react';
import HistoryPage from './HistoryPage';
import ChatPage from './ChatPage';

// Helper function to generate a new session ID
const generateNewSessionId = () => `session_${Date.now()}`;

export default function ChatWithHistory({ language }) {
  const [selectedSessionId, setSelectedSessionId] = useState(generateNewSessionId());
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatSummaries, setChatSummaries] = useState([]);

  useEffect(() => {
    if (selectedSessionId) {
      loadChatMessages(selectedSessionId);
    } else {
      setMessages([]);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    if (messages.length === 2 && messages[1].sender === 'bot') {
      const isNewChat = !chatSummaries.find(summary => summary.id === selectedSessionId);
      if (isNewChat) {
        const newChatSummary = {
          id: selectedSessionId,
          firstMessage: messages[0].text,
          lastMessage: messages[1].text,
          timestamp: messages[0].timestamp,
        };
        setChatSummaries(prevSummaries => [newChatSummary, ...prevSummaries]);
      }
    }
  }, [messages, selectedSessionId, chatSummaries]);

  const loadChatMessages = async (sessionId) => {
    try {
      setLoadingMessages(true);
      const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseURL}/chat-history/${sessionId}`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to load chat messages, status: ${response.status}`);

      const data = await response.json();

      if (data.messages && data.messages.length > 0) {
        const sortedMessages = data.messages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        const loadedMessages = [];
        sortedMessages.forEach((item) => {
          if (item.message) {
            loadedMessages.push({
              id: item.id + '_user',
              text: item.message,
              sender: 'user',
              timestamp: new Date(item.timestamp),
            });
          }
          if (item.response) {
            loadedMessages.push({
              id: item.id + '_bot',
              text: item.response,
              sender: 'bot',
              timestamp: new Date(item.timestamp),
            });
          }
        });

        setMessages(loadedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleChatSelect = (sessionId) => {
    setSelectedSessionId(sessionId);
  };

  const handleNewChat = () => {
    setSelectedSessionId(generateNewSessionId());
    setMessages([]);
    setInputMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-80 border-r border-gray-400">
        <HistoryPage
          language={language}
          onChatSelect={handleChatSelect}
          sessionId={selectedSessionId}
          chatSummaries={chatSummaries}
        />
      </aside>
      <div className="w-px bg-gray-600" />
      <main className="flex-1 flex flex-col">
        <ChatPage
          language={language}
          sessionId={selectedSessionId}
          messages={messages}
          setMessages={setMessages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onNewChat={handleNewChat}
          loadingMessages={loadingMessages}
          setLoadingMessages={setLoadingMessages} // Pass the state updater
        />
      </main>
    </div>
  );
}