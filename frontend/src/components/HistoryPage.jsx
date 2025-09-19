import { useState, useEffect } from 'react';
import { MessageCircle, Calendar, Trash2, Loader } from 'lucide-react';

export default function HistoryPage({ language, onChatSelect, sessionId }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const historyTexts = {
    english: {
      title: "Chat History",
      subtitle: "View and continue your previous conversations",
      noHistory: "No chat history found",
      loading: "Loading history...",
      continue: "Continue Chat",
      delete: "Delete",
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This Week",
      older: "Older"
    },
    malayalam: {
      title: "ചാറ്റ് ചരിത്രം",
      subtitle: "നിങ്ങളുടെ മുൻ സംഭാഷണങ്ങൾ കാണുകയും തുടരുകയും ചെയ്യുക",
      noHistory: "ചാറ്റ് ചരിത്രം കണ്ടെത്തിയില്ല",
      loading: "ചരിത്രം ലോഡുചെയ്യുന്നു",
      continue: "ചാറ്റ് തുടരുക",
      delete: "ഇല്ലാതാക്കുക",
      today: "ഇന്ന്",
      yesterday: "ഇന്നലെ",
      thisWeek: "ഈ ആഴ്ച",
      older: "പഴയത്"
    },
  };

  useEffect(() => {
    if (sessionId) {
      loadChatHistory(sessionId);
    } else {
      setChatHistory([]);
      setLoading(false);
    }
  }, [language, sessionId]);

  const loadChatHistory = async (sessionId) => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseURL}/chat-history/${sessionId}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error(`Failed to load history, status: ${response.status}`);

      const data = await response.json();

      if (data.messages && data.messages.length > 0) {
        const sortedMessages = data.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        // Find first user message for timestamp and display text
        const firstUserMessage = sortedMessages.find(m => m.sender === 'user') || sortedMessages[0];
        const summary = {
          id: sessionId,
          firstMessage: firstUserMessage.text,
          lastMessage: sortedMessages[sortedMessages.length - 1].text,
          timestamp: new Date(firstUserMessage.timestamp),
          messageCount: sortedMessages.length,
        };
        setChatHistory([summary]);
      } else {
        setChatHistory([]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setChatHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeGroup = (timestamp) => {
    const now = new Date();
    const diffDays = Math.floor((now - new Date(timestamp)) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays === 1) return 'today';
    if (diffDays === 2) return 'yesterday';
    if (diffDays <= 7) return 'thisWeek';
    return 'older';
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString(language === 'malayalam' ? 'ml-IN' : 'en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const deleteChat = (id) => setChatHistory((prev) => prev.filter((c) => c.id !== id));

  const groupChatsByTime = (chats) => {
    const groups = { today: [], yesterday: [], thisWeek: [], older: [] };
    chats.forEach((chat) => {
      groups[getTimeGroup(chat.timestamp)].push(chat);
    });
    return groups;
  };

  const renderGroup = (name, chats) => {
    if (!chats.length) return null;
    return (
      <section key={name} className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{historyTexts[language][name]}</h2>
        <div className="space-y-3">
          {chats.map(({ id, firstMessage, lastMessage, timestamp }) => (
            <div
              key={id}
              className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition duration-200 flex justify-between items-start"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageCircle className="text-green-600 w-4 h-4 flex-shrink-0" />
                  <span className="text-gray-500 text-sm line-clamp-1">{firstMessage}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-1">{lastMessage}</p>
              </div>
              <div className="ml-4 flex flex-col items-end space-y-2">
                <div className="text-gray-500 text-xs flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <time>{formatTime(timestamp)}</time>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onChatSelect(id)}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs hover:bg-green-200 transition"
                  >
                    {historyTexts[language].continue}
                  </button>
                  <button
                    onClick={() => deleteChat(id)}
                    aria-label={historyTexts[language].delete}
                    className="text-gray-400 hover:text-red-500 p-1"
                    title={historyTexts[language].delete}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{historyTexts[language].title}</h1>
          <p className="text-lg text-gray-600">{historyTexts[language].subtitle}</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader className="animate-spin text-green-600 w-6 h-6 mr-2" />
            <span className="text-gray-600">{historyTexts[language].loading}</span>
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">{historyTexts[language].noHistory}</p>
          </div>
        ) : (
          Object.entries(groupChatsByTime(chatHistory)).map(([group, chats]) => renderGroup(group, chats))
        )}
      </div>
    </main>
  );
}
