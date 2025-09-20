import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import InfoCards from "../components/InfoCards";
import TopSchemes from "../components/TopSchemes";
import ChatWithHistory from "../components/ChatWithHistory";
import CalculatorPage from "../components/CalculatorPage";
import InformationPage from "../components/InformationPage";

// Helper function to generate a new session ID
const generateNewSessionId = () => `session_${Date.now()}`;

export default function HomePage() {
  const [language, setLanguage] = useState("english");
  const [currentPage, setCurrentPage] = useState("home");
  const [initialQuery, setInitialQuery] = useState(null);

  // Central state for all chat sessions
  const [chatSessions, setChatSessions] = useState({});
  const [selectedSessionId, setSelectedSessionId] = useState(generateNewSessionId());
  const [inputMessage, setInputMessage] = useState('');

  // Update localStorage whenever selectedSessionId changes
  useEffect(() => {
    if (selectedSessionId) {
      localStorage.setItem("session_id", selectedSessionId);
    }
  }, [selectedSessionId]);

  // Load chat session from local storage on first render
  useEffect(() => {
    const storedSessionId = localStorage.getItem("session_id");
    if (storedSessionId) {
      setSelectedSessionId(storedSessionId);
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "english" ? "malayalam" : "english"));
  };

  const handleSearch = (query, imageData = null) => {
    const sessionId = generateNewSessionId();
    setSelectedSessionId(sessionId);
    setInitialQuery(query);
    setCurrentPage("chat");
  };

  const handleViewAllSchemes = () => {
    setCurrentPage("information");
  };

  const handleNewChat = () => {
    setSelectedSessionId(generateNewSessionId());
    setInitialQuery(null);
    setInputMessage('');
  };

  const handleChatSelect = (sessionId) => {
    setSelectedSessionId(sessionId);
    setCurrentPage("chat");
  };

  const handleMessagesChange = (newMessages) => {
    setChatSessions(prevSessions => ({
      ...prevSessions,
      [selectedSessionId]: {
        ...prevSessions[selectedSessionId],
        messages: newMessages,
      }
    }));
  };

  const handleChatSummaryUpdate = (sessionId, summary) => {
    setChatSessions(prevSessions => ({
      ...prevSessions,
      [sessionId]: {
        ...prevSessions[sessionId],
        ...summary,
      },
    }));
  };
  
  const handleChatDelete = (id) => {
    setChatSessions(prevSessions => {
      const newSessions = { ...prevSessions };
      delete newSessions[id];
      return newSessions;
    });
  };

  const texts = {
    english: {
      title: "AgriAssist - Your Smart Farming Companion",
      subtitle:
        "Get expert agricultural advice, financial planning, and real-time market insights",
      searchPlaceholder: "Ask anything about farming, crops, or agriculture...",
    },
    malayalam: {
      title: "കൃഷിസഹായി - നിങ്ങളുടെ ബുദ്ധിമാനായ കൃഷി സഹായി",
      subtitle:
        "വിദഗ്ധ കാർഷിക ഉപദേശം, സാമ്പത്തിക ആസൂത്രണം, തത്സമയ വിപണി വിവരങ്ങൾ എന്നിവ നേടുക",
      searchPlaceholder: "കൃഷി, വിളകൾ അല്ലെങ്കിൽ കൃഷിയെക്കുറിച്ച് എന്തും ചോദിക്കുക...",
    },
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <>
            <HeroSection
              language={language}
              texts={texts}
              onSearch={handleSearch}
            />
            <InfoCards language={language} />
            <TopSchemes language={language} onViewAll={handleViewAllSchemes} />
          </>
        );
      case "chat":
      case "history":
        const messagesForCurrentChat = chatSessions[selectedSessionId]?.messages || [];
        return (
          <ChatWithHistory
            language={language}
            initialQuery={initialQuery}
            sessionId={selectedSessionId}
            onNewChat={handleNewChat}
            onChatSelect={handleChatSelect}
            onChatDelete={handleChatDelete}
            messages={messagesForCurrentChat}
            onMessagesChange={handleMessagesChange}
            chatSessions={chatSessions}
            onChatSummaryUpdate={handleChatSummaryUpdate}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
          />
        );
      case "calculator":
        return <CalculatorPage language={language} />;
      case "information":
        return <InformationPage language={language} />;
      default:
        return (
          <>
            <HeroSection
              language={language}
              texts={texts}
              onSearch={handleSearch}
            />
            <InfoCards language={language} />
            <TopSchemes language={language} onViewAll={handleViewAllSchemes} />
          </>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar
        language={language}
        toggleLanguage={toggleLanguage}
        texts={texts}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <div className="flex-1 overflow-hidden">
        {renderCurrentPage()}
      </div>
    </div>
  );
}