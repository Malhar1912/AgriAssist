import { useState, useEffect, useRef } from 'react';
import { Send, Volume2, VolumeX, Plus, Mic, Camera } from 'lucide-react';

export default function ChatPage({ language, sessionId, onNewChat, initialQuery }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 👈 Use a ref to ensure the initial query is only processed once.
  const initialQueryProcessed = useRef(false);

  const chatTexts = {
    english: {
      newChat: "New Chat",
      placeholder: "Type your question here...",
      sending: "Sending...",
      textToSpeech: "Text to Speech",
      stopSpeech: "Stop Speech",
      voiceInput: "Voice Input",
      imageUpload: "Upload Image"
    },
    malayalam: {
      newChat: "പുതിയ ചാറ്റ്",
      placeholder: "നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...",
      sending: "അയയ്ക്കുന്നു...",
      textToSpeech: "ടെക്സ്റ്റ് ടു സ്പീച്ച്",
      stopSpeech: "സ്പീച്ച് നിർത്തുക",
      voiceInput: "ശബ്ദ ഇൻപുട്ട്",
      imageUpload: "ചിത്രം അപ്‌ലോഡ് ചെയ്യുക"
    }
  };

  useEffect(() => {
    // 👈 Check for an initial query and if it has not been processed yet
    if (initialQuery && !initialQueryProcessed.current) {
      sendMessage(initialQuery);
      initialQueryProcessed.current = true; // Mark as processed
    }
    scrollToBottom();
  }, [initialQuery, sessionId, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (messageText = inputMessage, imageData = null) => {
    if (!messageText.trim() && !imageData) return;

    const newMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      imageData: imageData
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://agriassist-24.onrender.com/api';

      let response;
      if (imageData) {
        // Plant analysis API
        response = await fetch(`${baseURL}/analyze-plant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            image_base64: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
            language: language
          })
        });
      } else {
        // Chat API
        response = await fetch(`${baseURL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            session_id: sessionId,
            language: language
          })
        });
      }

      if (response.ok) {
        const responseText = await response.text();

        const botMessage = {
          id: Date.now() + 1,
          text: responseText,
          sender: 'bot',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          text: language === 'malayalam' ? 'ക്ഷമിക്കണം, എന്തോ തെറ്റുപറ്റി' : 'Sorry, something went wrong',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: language === 'malayalam' ? 'ക്ഷമിക്കണം, എന്തോ തെറ്റുപറ്റി' : 'Sorry, something went wrong',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'malayalam' ? 'ml-IN' : 'en-IN';
      utterance.rate = 0.8;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = language === 'malayalam' ? 'ml-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        sendMessage(`[${language === 'malayalam' ? 'ചിത്രം അപ്‌ലോഡ് ചെയ്തു' : 'Image uploaded'}: ${file.name}]`, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            {language === 'malayalam' ? 'കൃഷി ഉപദേശം' : 'Agricultural Advisor'}
          </h1>
          <button
            onClick={onNewChat}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>{chatTexts[language].newChat}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-2xl p-4 ${
                  message.sender === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                {message.imageData && (
                  <img
                    src={message.imageData}
                    alt="Uploaded"
                    className="max-w-xs rounded-lg mb-2"
                  />
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </p>
                {message.sender === 'bot' && (
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => isSpeaking ? stopSpeaking() : speakText(message.text)}
                      className="flex items-center space-x-1 text-xs text-gray-600 hover:text-green-600 transition-colors duration-200"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="h-3 w-3" />
                          <span>{chatTexts[language].stopSpeech}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3" />
                          <span>{chatTexts[language].textToSpeech}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-2">
            <div className="flex-1 bg-gray-100 rounded-2xl p-2 flex items-end space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={chatTexts[language].placeholder}
                className="flex-1 bg-transparent resize-none max-h-32 px-3 py-2 text-gray-900 placeholder-gray-500 border-none outline-none"
                rows={1}
              />

              <div className="flex items-center space-x-1">
                <button
                  onClick={startVoiceRecognition}
                  disabled={isListening}
                  title={chatTexts[language].voiceInput}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isListening
                      ? 'bg-red-100 text-red-600 animate-pulse'
                      : 'bg-gray-200 text-gray-600 hover:bg-green-100 hover:text-green-600'
                  }`}
                >
                  <Mic className="h-4 w-4" />
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  title={chatTexts[language].imageUpload}
                  className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-green-100 hover:text-green-600 transition-all duration-200"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
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
  );
}