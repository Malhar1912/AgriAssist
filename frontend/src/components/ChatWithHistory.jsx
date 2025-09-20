import { useEffect } from 'react';
import HistoryPage from './HistoryPage';
import ChatPage from './ChatPage';

export default function ChatWithHistory({
  language,
  initialQuery,
  sessionId,
  onNewChat,
  onChatSelect,
  onChatDelete,
  messages,
  onMessagesChange,
  chatSessions,
  onChatSummaryUpdate,
  inputMessage,
  setInputMessage,
}) {
  const loadChatMessages = async (sessionId) => {
    // Check if messages for this session are already in state
    if (chatSessions[sessionId]?.messages) {
      return chatSessions[sessionId].messages;
    }

    // If not, fetch from API
    try {
      const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseURL}/chat-history/${sessionId}`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        console.error(`Failed to load chat messages, status: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const sortedMessages = data.messages.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      const loadedMessages = sortedMessages.flatMap((item) => {
        const msgs = [];
        if (item.message) {
          msgs.push({ id: item.id + '_user', text: item.message, sender: 'user', timestamp: new Date(item.timestamp) });
        }
        if (item.response) {
          msgs.push({ id: item.id + '_bot', text: item.response, sender: 'bot', timestamp: new Date(item.timestamp) });
        }
        return msgs;
      });
      
      const firstUserMessage = loadedMessages.find(m => m.sender === 'user');
      if (firstUserMessage) {
        onChatSummaryUpdate(sessionId, {
          firstMessage: firstUserMessage.text,
          lastMessage: loadedMessages[loadedMessages.length - 1].text,
          timestamp: firstUserMessage.timestamp,
        });
      }

      return loadedMessages;
    } catch (error) {
      console.error('Error loading chat messages:', error);
      return [];
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadChatMessages(sessionId).then(onMessagesChange);
    }
  }, [sessionId]);

  const handleOnMessagesChange = (newMessages) => {
    onMessagesChange(newMessages);
    if (newMessages.length >= 2 && newMessages[1].sender === 'bot') {
      const isNewChat = !chatSessions[sessionId]?.firstMessage;
      if (isNewChat) {
        const newChatSummary = {
          id: sessionId,
          firstMessage: newMessages[0].text,
          lastMessage: newMessages[1].text,
          timestamp: newMessages[0].timestamp,
        };
        onChatSummaryUpdate(sessionId, newChatSummary);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-80 border-r border-gray-400">
        <HistoryPage
          language={language}
          onChatSelect={onChatSelect}
          onChatDelete={onChatDelete}
          chatSummaries={Object.values(chatSessions).sort((a,b) => b.timestamp - a.timestamp)}
        />
      </aside>
      <div className="w-px bg-gray-600" />
      <main className="flex-1 flex flex-col">
        <ChatPage
          language={language}
          sessionId={sessionId}
          messages={messages}
          onMessagesChange={handleOnMessagesChange}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onNewChat={onNewChat}
          initialQuery={initialQuery}
        />
      </main>
    </div>
  );
}