import { useState, useRef } from 'react';
import { Search, Mic, Camera, Send } from 'lucide-react';
import bgimage from '../assets/bg.jpg';

export default function HeroSection({ language, texts, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);

  const heroTexts = {
    english: {
      title: "AgriAssist - Your Smart Farming Companion",
      subtitle: "Get expert agricultural advice, financial planning, and real-time market insights",
      searchPlaceholder: "Ask anything about farming, crops...",
      voiceTooltip: "Voice input",
      imageTooltip: "Upload image",
      searchButton: "Search"
    },
    malayalam: {
      title: "കൃഷിസഹായി - നിങ്ങളുടെ ബുദ്ധിമാനായ കൃഷി സഹായി",
      subtitle: "വിദഗ്ധ കാർഷിക ഉപദേശം, സാമ്പത്തിക ആസൂത്രണം, തത്സമയ വിപണി വിവരങ്ങൾ എന്നിവ നേടുക",
      searchPlaceholder: "കൃഷി, വിളകൾ അല്ലെങ്കിൽ കൃഷിയെക്കുറിച്ച് എന്തും ചോദിക്കുക...",
      voiceTooltip: "ശബ്ദ ഇൻപുട്ട്",
      imageTooltip: "ചിത്രം അപ്‌ലോഡ് ചെയ്യുക",
      searchButton: "തിരയുക"
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = language === 'malayalam' ? 'ml-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert(language === 'malayalam' ? 'ശബ്ദ തിരിച്ചറിയൽ പിന്തുണയില്ല' : 'Voice recognition not supported');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Handle image upload - this would trigger plant analysis
        if (onSearch) {
          onSearch(`[Image uploaded: ${file.name}]`, e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${bgimage})`
      }}
    >
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {heroTexts[language].title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto">
          {heroTexts[language].subtitle}
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center space-x-2">
            <div className="flex-1 flex items-center">
              <Search className="h-6 w-6 text-gray-400 ml-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={heroTexts[language].searchPlaceholder}
                className="flex-1 px-4 py-4 text-lg text-gray-900 placeholder-gray-500 bg-transparent border-none outline-none"
              />
            </div>

            {/* Voice Input Button */}
            <button
              onClick={startVoiceRecognition}
              disabled={isListening}
              title={heroTexts[language].voiceTooltip}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isListening 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
              }`}
            >
              <Mic className="h-5 w-5" />
            </button>

            {/* Image Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title={heroTexts[language].imageTooltip}
              className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600 transition-all duration-200"
            >
              <Camera className="h-5 w-5" />
            </button>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              <Send className="h-5 w-5" />
              <span className="hidden sm:inline">{heroTexts[language].searchButton}</span>
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </section>
  );
}