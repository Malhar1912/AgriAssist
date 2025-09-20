import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import InfoCards from "../components/InfoCards";
import TopSchemes from "../components/TopSchemes";
import ChatWithHistory from "../components/ChatWithHistory";
import CalculatorPage from "../components/CalculatorPage";
import InformationPage from "../components/InformationPage";

export default function HomePage() {
  const [language, setLanguage] = useState("english");
  const [currentPage, setCurrentPage] = useState("home");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [initialQuery, setInitialQuery] = useState(null);

  useEffect(() => {
    // Check on mount for existing session ID in localStorage
    const storedSessionId = localStorage.getItem("session_id");
    if (storedSessionId) {
      setCurrentChatId(storedSessionId);
    } else {
      const newSessionId = `chat_${Date.now()}`;
      setCurrentChatId(newSessionId);
      localStorage.setItem("session_id", newSessionId);
    }
  }, []);

  // Update localStorage whenever currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem("session_id", currentChatId);
    }
  }, [currentChatId]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "english" ? "malayalam" : "english"));
  };

  // When starting a new chat from search, reset messages/input too
  const handleSearch = (query, imageData = null) => {
    const sessionId = `chat_${Date.now()}`;
    setCurrentChatId(sessionId);
    setInitialQuery(query);
    setCurrentPage("chat");
  };

  const handleViewAllSchemes = () => {
    setCurrentPage("information");
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
        // Pass initialQuery to ChatWithHistory
        return (
          <ChatWithHistory language={language} initialQuery={initialQuery} />
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
      {/* Added pt-16 to create space below the navbar. Adjust if needed. */}
      <div className="flex-1 overflow-hidden">
        {renderCurrentPage()}
      </div>
    </div>
  );
}