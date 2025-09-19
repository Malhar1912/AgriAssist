import { useState } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import InfoCards from "../components/InfoCards";
import TopSchemes from "../components/TopSchemes";
import ChatPage from "../components/ChatPage";
import HistoryPage from "../components/HistoryPage";
import CalculatorPage from "../components/CalculatorPage";
import InformationPage from "../components/InformationPage";

export default function HomePage() {
  const [language, setLanguage] = useState("english");
  const [currentPage, setCurrentPage] = useState("home");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [initialQuery, setInitialQuery] = useState(null); // 👈 New state to store the initial query

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "english" ? "malayalam" : "english"));
  };

  const handleSearch = (query, imageData = null) => {
    // Generate new chat session ID
    const sessionId = `chat_${Date.now()}`;
    setCurrentChatId(sessionId);
    setInitialQuery(query); // 👈 Set the initial query here
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
      title: "കൃഷിസഹായി - നിങ്ങളുടെ ബുद്ധിമാनായ കൃषി സहായി",
      subtitle:
        "വിദഗ്ധ കാർഷിക ഉപദേശം, സാമ്പത്തിക ആസൂത്രണം, തത്സമയ വിപണി വിവരങ്ങൾ എn്നിവ നേटുക",
      searchPlaceholder: "കൃषി, വിളകൾ അലെങ്കിൽ കൃषിയെക്കുറിച്ച് എnതും ചോദിക്കുക...",
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
        return (
          <ChatPage
            language={language}
            sessionId={currentChatId}
            onNewChat={() => {
              const sessionId = `chat_${Date.now()}`;
              setCurrentChatId(sessionId);
              setInitialQuery(null); // 👈 Clear the query when starting a new chat
            }}
            initialQuery={initialQuery} // 👈 Pass the initial query to the ChatPage component
          />
        );
      case "history":
        return (
          <HistoryPage
            language={language}
            onChatSelect={(chatId) => {
              setCurrentChatId(chatId);
              setCurrentPage("chat");
            }}
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
    <div className="min-h-screen bg-gray-50">
      <Navbar
        language={language}
        toggleLanguage={toggleLanguage}
        texts={texts}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <div>
      {renderCurrentPage()}
      </div>
    </div>
  );
}