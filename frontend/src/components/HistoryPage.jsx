import { useState, useEffect } from 'react';
import { MessageCircle, Calendar, Trash2, Loader } from 'lucide-react';

export default function HistoryPage({ language, onChatSelect }) {
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
      loading: "ചരിത്രം ലോഡുചെയ്യുന്നു...",
      continue: "ചാറ്റ് തുടരുക",
      delete: "ഇല്ലാതാക്കുക",
      today: "ഇന്ന്",
      yesterday: "ഇന്നലെ",
      thisWeek: "ഈ ആഴ്ച",
      older: "പഴയത്"
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      // Mock chat history - in a real app, you'd fetch from your backend
      const mockHistory = [
        {
          id: 'chat_1735477200000',
          firstMessage: language === 'english' ? 'What are the best fertilizers for rice crops?' : 'നെല്ലിന് ഏറ്റവും നല്ല വളങ്ങൾ ഏവയാണ്?',
          lastMessage: language === 'english' ? 'Thank you for the advice!' : 'ഉപദേശത്തിന് നന്ദി!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          messageCount: 8
        },
        {
          id: 'chat_1735390800000',
          firstMessage: language === 'english' ? 'How to identify pest diseases in tomatoes?' : 'തക്കാളിയിലെ കീട രോഗങ്ങൾ എങ്ങനെ തിരിച്ചറിയാം?',
          lastMessage: language === 'english' ? 'The images helped a lot!' : 'ചിത്രങ്ങൾ വളരെയധികം സഹായിച്ചു!',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          messageCount: 12
        },
        {
          id: 'chat_1735304400000',
          firstMessage: language === 'english' ? 'Need loan calculation for buying new equipment' : 'പുതിയ ഉപകരണങ്ങൾ വാങ്ങുന്നതിനുള്ള വായ്പ കണക്കുകൂട്ടൽ ആവശ്യം',
          lastMessage: language === 'english' ? 'The EMI looks manageable' : 'ഇഎംഐ കൈകാര്യം ചെയ്യാവുന്നതാണ് എന്ന് തോന്നുന്നു',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          messageCount: 6
        },
        {
          id: 'chat_1735045200000',
          firstMessage: language === 'english' ? 'Weather forecast for next week?' : 'അടുത്ത ആഴ്ചത്തെ കാലാവസ്ഥാ പ്രവചനം?',
          lastMessage: language === 'english' ? 'Will prepare accordingly' : 'അനുസരിച്ച് തയ്യാറാകും',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          messageCount: 4
        }
      ];
      
      setChatHistory(mockHistory);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diffTime = Math.abs(now - timestamp);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return historyTexts[language].today;
    } else if (diffDays === 2) {
      return historyTexts[language].yesterday;
    } else if (diffDays <= 7) {
      return historyTexts[language].thisWeek;
    } else {
      return historyTexts[language].older;
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString(language === 'malayalam' ? 'ml-IN' : 'en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const deleteChatHistory = (chatId) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
  };

  const groupChatsByTime = (chats) => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    chats.forEach(chat => {
      const now = new Date();
      const diffTime = Math.abs(now - chat.timestamp);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        groups.today.push(chat);
      } else if (diffDays === 2) {
        groups.yesterday.push(chat);
      } else if (diffDays <= 7) {
        groups.thisWeek.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  };

  const renderChatGroup = (groupName, chats) => {
    if (chats.length === 0) return null;

    return (
      <div key={groupName} className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {historyTexts[language][groupName]}
        </h3>
        <div className="space-y-3">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-500">
                      {chat.messageCount} {language === 'malayalam' ? 'സന്ദേശങ്ങൾ' : 'messages'}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                    {chat.firstMessage}
                  </h4>
                  
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {chat.lastMessage}
                  </p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatTime(chat.timestamp)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onChatSelect(chat.id)}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
                    >
                      {historyTexts[language].continue}
                    </button>
                    
                    <button
                      onClick={() => deleteChatHistory(chat.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {historyTexts[language].title}
          </h1>
          <p className="text-lg text-gray-600">
            {historyTexts[language].subtitle}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex items-center space-x-2">
              <Loader className="h-6 w-6 animate-spin text-green-600" />
              <span className="text-gray-600">{historyTexts[language].loading}</span>
            </div>
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{historyTexts[language].noHistory}</p>
          </div>
        ) : (
          <div>
            {Object.entries(groupChatsByTime(chatHistory)).map(([groupName, chats]) =>
              renderChatGroup(groupName, chats)
            )}
          </div>
        )}
      </div>
    </div>
  );
}