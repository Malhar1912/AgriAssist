import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { Separator } from './components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { toast } from 'sonner';
import { 
  Mic, 
  Camera, 
  Calculator, 
  TrendingUp, 
  Cloud, 
  Leaf, 
  DollarSign, 
  FileText,
  Send,
  Upload,
  Volume2,
  Sun,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [activeAgent, setActiveAgent] = useState('chat');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Plant analysis state
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // Budget calculator state
  const [budgetData, setBudgetData] = useState({
    crop: '',
    area: '',
    expectedYield: ''
  });
  const [budgetResult, setBudgetResult] = useState(null);
  
  // Loan calculator state
  const [loanData, setLoanData] = useState({
    principal: '',
    interestRate: '',
    tenure: ''
  });
  const [loanResult, setLoanResult] = useState(null);
  
  // Market data state
  const [marketPrices, setMarketPrices] = useState([]);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [cropAdvisory, setCropAdvisory] = useState([]);
  const [governmentSchemes, setGovernmentSchemes] = useState([]);
  
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchMarketData();
    fetchWeatherAlerts();
    fetchCropAdvisory();
    fetchGovernmentSchemes();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMarketData = async () => {
    try {
      const response = await axios.get(`${API}/market-prices`);
      setMarketPrices(response.data.prices);
    } catch (error) {
      console.error('Error fetching market prices:', error);
    }
  };

  const fetchWeatherAlerts = async () => {
    try {
      const response = await axios.get(`${API}/weather-alerts`);
      setWeatherAlerts(response.data.alerts);
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
    }
  };

  const fetchCropAdvisory = async () => {
    try {
      const response = await axios.get(`${API}/crop-advisory`);
      setCropAdvisory(response.data.advisory);
    } catch (error) {
      console.error('Error fetching crop advisory:', error);
    }
  };

  const fetchGovernmentSchemes = async () => {
    try {
      const response = await axios.get(`${API}/government-schemes`);
      setGovernmentSchemes(response.data.schemes);
    } catch (error) {
      console.error('Error fetching government schemes:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: currentMessage,
        session_id: sessionId,
        language: currentLanguage
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response,
        agent_type: response.data.agent_type,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePlantImage = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setIsLoading(true);
    try {
      const base64Data = selectedImage.split(',')[1];
      const response = await axios.post(`${API}/analyze-plant`, {
        session_id: sessionId,
        image_base64: base64Data,
        language: currentLanguage
      });

      setAnalysisResult(response.data);
      toast.success('Plant analysis completed');
    } catch (error) {
      console.error('Error analyzing plant:', error);
      toast.error('Failed to analyze plant image');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateBudget = async () => {
    if (!budgetData.crop || !budgetData.area || !budgetData.expectedYield) {
      toast.error('Please fill all budget fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/calculate-budget`, {
        crop: budgetData.crop,
        area_acres: parseFloat(budgetData.area),
        expected_yield_tons: parseFloat(budgetData.expectedYield),
        session_id: sessionId
      });

      setBudgetResult(response.data);
      toast.success('Budget calculated successfully');
    } catch (error) {
      console.error('Error calculating budget:', error);
      toast.error('Failed to calculate budget');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateLoan = async () => {
    if (!loanData.principal || !loanData.interestRate || !loanData.tenure) {
      toast.error('Please fill all loan fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/calculate-loan`, {
        principal: parseFloat(loanData.principal),
        interest_rate: parseFloat(loanData.interestRate),
        tenure_years: parseInt(loanData.tenure),
        session_id: sessionId
      });

      setLoanResult(response.data);
      toast.success('Loan EMI calculated successfully');
    } catch (error) {
      console.error('Error calculating loan:', error);
      toast.error('Failed to calculate loan EMI');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage === 'malayalam' ? 'ml-IN' : 'en-IN';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-green-800">AgriAssist</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="malayalam">മലയാളം</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-green-600 hover:bg-green-100"
              >
                <Sun className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeAgent} onValueChange={setActiveAgent} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
                <TabsTrigger value="chat" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>AI Advisory Chat</span>
                </TabsTrigger>
                <TabsTrigger value="plant" className="flex items-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Disease Analysis</span>
                </TabsTrigger>
                <TabsTrigger value="budget" className="flex items-center space-x-2">
                  <Calculator className="w-4 h-4" />
                  <span>Crop Budget</span>
                </TabsTrigger>
                <TabsTrigger value="financial" className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Loan Calculator</span>
                </TabsTrigger>
              </TabsList>

              {/* AI Advisory Chat */}
              <TabsContent value="chat">
                <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>AI Advisory Chat</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-green-800 font-medium">Hello! I'm your AI farming assistant. How can I help you today? You can ask about crops, diseases, weather, or market prices.</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio("Hello! I'm your AI farming assistant. How can I help you today?")}
                        className="mt-2 text-green-600 hover:bg-green-100 p-1"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="h-96 overflow-y-auto mb-4 space-y-4">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.type === 'user'
                                ? 'bg-green-500 text-white'
                                : 'bg-white border border-green-200 text-gray-800'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            {message.type === 'ai' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => playAudio(message.content)}
                                className="mt-1 p-1 h-6 text-green-600 hover:bg-green-100"
                              >
                                <Volume2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-green-200 px-4 py-2 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                              <span>AI is thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="flex space-x-2">
                      <Textarea
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder="Ask about crops, diseases, weather, or farming advice..."
                        className="flex-1 resize-none"
                        rows={2}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendChatMessage();
                          }
                        }}
                      />
                      <div className="flex flex-col space-y-2">
                        <Button
                          onClick={sendChatMessage}
                          disabled={isLoading || !currentMessage.trim()}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-green-300 text-green-600 hover:bg-green-50"
                        >
                          <Mic className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Plant Disease Analysis */}
              <TabsContent value="plant">
                <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                  <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center space-x-2">
                      <Camera className="w-5 h-5" />
                      <span>Disease Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Plant Image
                        </label>
                        <div className="flex items-center space-x-4">
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="border-green-300 text-green-600 hover:bg-green-50"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Image
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {selectedImage && (
                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-green-300 rounded-lg p-4">
                            <img
                              src={selectedImage}
                              alt="Selected plant"
                              className="max-w-full h-48 object-contain mx-auto rounded-lg"
                            />
                          </div>
                          <Button
                            onClick={analyzePlantImage}
                            disabled={isLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600"
                          >
                            {isLoading ? 'Analyzing...' : 'Analyze Plant'}
                          </Button>
                        </div>
                      )}

                      {analysisResult && (
                        <div className="space-y-4">
                          <Alert className={`border-2 ${analysisResult.confidence >= 70 ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'}`}>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">Analysis Complete</span>
                                  <Badge variant={analysisResult.confidence >= 70 ? 'default' : 'secondary'}>
                                    {analysisResult.confidence}% Confidence
                                  </Badge>
                                </div>
                                {analysisResult.escalate_to_officer && (
                                  <div className="text-orange-600 font-medium">
                                    ⚠️ Low confidence - Contact agricultural officer
                                  </div>
                                )}
                              </div>
                            </AlertDescription>
                          </Alert>

                          <Card className="border-green-200">
                            <CardContent className="p-4">
                              <div className="whitespace-pre-wrap text-sm">
                                {analysisResult.response}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => playAudio(analysisResult.response)}
                                className="mt-2 text-green-600 hover:bg-green-100"
                              >
                                <Volume2 className="w-4 h-4 mr-2" />
                                Play Audio
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Crop Budget Calculator */}
              <TabsContent value="budget">
                <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center space-x-2">
                      <Calculator className="w-5 h-5" />
                      <span>Crop Budget Calculator</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Crop
                        </label>
                        <Select
                          value={budgetData.crop}
                          onValueChange={(value) => setBudgetData(prev => ({ ...prev, crop: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose crop" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tomato">Tomato</SelectItem>
                            <SelectItem value="onion">Onion</SelectItem>
                            <SelectItem value="rice">Rice</SelectItem>
                            <SelectItem value="wheat">Wheat</SelectItem>
                            <SelectItem value="sugarcane">Sugarcane</SelectItem>
                            <SelectItem value="cotton">Cotton</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Area (Acres)
                        </label>
                        <Input
                          type="number"
                          value={budgetData.area}
                          onChange={(e) => setBudgetData(prev => ({ ...prev, area: e.target.value }))}
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expected Yield (Tons)
                        </label>
                        <Input
                          type="number"
                          value={budgetData.expectedYield}
                          onChange={(e) => setBudgetData(prev => ({ ...prev, expectedYield: e.target.value }))}
                          placeholder="15"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={calculateBudget}
                      disabled={isLoading}
                      className="w-full mb-6 bg-blue-500 hover:bg-blue-600"
                    >
                      {isLoading ? 'Calculating...' : 'Calculate Budget'}
                    </Button>

                    {budgetResult && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="border-red-200 bg-red-50">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-red-600">
                                ₹{budgetResult.total_cost.toLocaleString()}
                              </div>
                              <div className="text-sm text-red-800">Total Cost</div>
                            </CardContent>
                          </Card>
                          <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                ₹{budgetResult.expected_revenue.toLocaleString()}
                              </div>
                              <div className="text-sm text-blue-800">Expected Revenue</div>
                            </CardContent>
                          </Card>
                          <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-green-600">
                                ₹{budgetResult.profit.toLocaleString()}
                              </div>
                              <div className="text-sm text-green-800">Profit</div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card className="border-green-200">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">AI Analysis</h4>
                            <div className="whitespace-pre-wrap text-sm">
                              {budgetResult.analysis}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financial Advisor */}
              <TabsContent value="financial">
                <div className="space-y-6">
                  {/* Loan Calculator */}
                  <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5" />
                        <span>Loan Calculator</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loan Amount (₹)
                          </label>
                          <Input
                            type="number"
                            value={loanData.principal}
                            onChange={(e) => setLoanData(prev => ({ ...prev, principal: e.target.value }))}
                            placeholder="100000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Interest Rate (%)
                          </label>
                          <Input
                            type="number"
                            value={loanData.interestRate}
                            onChange={(e) => setLoanData(prev => ({ ...prev, interestRate: e.target.value }))}
                            placeholder="7"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tenure (Years)
                          </label>
                          <Input
                            type="number"
                            value={loanData.tenure}
                            onChange={(e) => setLoanData(prev => ({ ...prev, tenure: e.target.value }))}
                            placeholder="3"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={calculateLoan}
                        disabled={isLoading}
                        className="w-full mb-6 bg-purple-500 hover:bg-purple-600"
                      >
                        {isLoading ? 'Calculating...' : 'Calculate EMI'}
                      </Button>

                      {loanResult && (
                        <Card className="border-purple-200 bg-purple-50">
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-purple-600 mb-2">
                                ₹{loanResult.monthly_emi.toLocaleString()}
                              </div>
                              <div className="text-sm text-purple-800 mb-4">Monthly EMI</div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="font-medium">Total Amount</div>
                                  <div>₹{loanResult.total_amount.toLocaleString()}</div>
                                </div>
                                <div>
                                  <div className="font-medium">Total Interest</div>
                                  <div>₹{loanResult.total_interest.toLocaleString()}</div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>

                  {/* Government Schemes */}
                  <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                    <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-lg">
                      <CardTitle>Available Schemes & Subsidies</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {governmentSchemes.map((scheme, index) => (
                          <Card key={index} className="border-teal-200">
                            <CardContent className="p-4">
                              <h4 className="font-medium text-teal-800 mb-2">{scheme.name}</h4>
                              <p className="text-sm text-gray-600 mb-2">{scheme.description}</p>
                              <p className="text-xs text-gray-500 mb-3">{scheme.eligibility}</p>
                              <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                                Apply Now
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Market Prices */}
            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <TrendingUp className="w-5 h-5" />
                  <span>Market Prices</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {marketPrices.slice(0, 4).map((price, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{price.crop}</div>
                        <div className="text-xs text-gray-500">{price.market}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{price.price_per_kg}/kg</div>
                        <div className={`text-xs ${price.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {price.change >= 0 ? '+' : ''}₹{price.change} today
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Crop Advisory */}
            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <Leaf className="w-5 h-5" />
                  <span>Crop Advisory</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {cropAdvisory.map((advisory, index) => (
                    <div key={index}>
                      <div className="font-medium text-sm mb-1">{advisory.title}</div>
                      <div className="text-xs text-gray-600 mb-2">{advisory.crops.join(', ')}</div>
                      <div className="text-xs text-green-600">{advisory.reason}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weather Alerts */}
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <Cloud className="w-5 h-5" />
                  <span>Weather Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {weatherAlerts.map((alert, index) => (
                    <Alert key={index} className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium text-sm">{alert.message}</div>
                        <div className="text-xs text-orange-600">{alert.action}</div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;