import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";

export default function Navbar({
  language,
  toggleLanguage,
  texts,
  currentPage,
  setCurrentPage,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navTexts = {
    english: {
      home: "Home",
      calculator: "Financial Calculator",
      information: "Information",
      chat: "Chat",
      language: "മലയാളം",
    },
    malayalam: {
      home: "ഹോം",
      calculator: "സാമ്പത്തിക കാൽക്കുലേറ്റർ",
      information: "വിവരങ്ങൾ",
      chat: "ചാറ്റ്",
      language: "English",
    },
  };

  const navItems = [
    { name: navTexts[language].home, page: "home", key: "home" },
    { name: navTexts[language].chat, page: "chat", key: "chat" }, // Single Chat button only
    {
      name: navTexts[language].calculator,
      page: "calculator",
      key: "calculator",
    },
    {
      name: navTexts[language].information,
      page: "information",
      key: "information",
    },
  ];

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  const isActive = (page) => {
    return currentPage === page;
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌾</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">
                {language === "english" ? "AgriAssist" : "കൃഷിസഹായി"}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.page)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(item.page)
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Language Toggle & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors duration-200"
            >
              <Globe className="h-4 w-4" />
              <span>{navTexts[language].language}</span>
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors duration-200"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.page)}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200 ${
                  isActive(item.page)
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
