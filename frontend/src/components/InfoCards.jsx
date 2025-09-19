import { useState, useEffect } from 'react';
import { TrendingUp, CloudRain, Lightbulb, Loader, AlertTriangle } from 'lucide-react';

// --- Custom Display Components for each card type ---
// 1. Market Price Display Component
const MarketPriceDisplay = ({ data }) => {
  if (!data || !Array.isArray(data.prices)) return null;
  
  return (
    <div className="space-y-4">
      {data.prices.map((item, index) => (
        <div key={index} className="flex justify-between items-center pb-4 border-b border-blue-100 last:border-b-0">
          <div>
            <p className="font-semibold text-gray-800">{item.crop}</p>
            <p className="text-sm text-gray-500">{item.market}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-800">₹{item.price_per_kg}/kg</p>
            <p className={`text-sm font-medium ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {item.change >= 0 ? `+₹${item.change}` : `-₹${Math.abs(item.change)}`} today
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// 2. Weather Alerts Display Component
const WeatherAlertsDisplay = ({ data }) => {
  if (!data || !Array.isArray(data.alerts)) return null;
  
  return (
    <div className="space-y-3">
      {data.alerts.map((item, index) => {
        const isWarning = item.type && item.type.toLowerCase() === 'warning';
        return (
          <div key={index} className={`flex items-start space-x-3 p-4 rounded-lg ${isWarning ? 'bg-orange-100/70' : 'bg-sky-50'}`}>
            <AlertTriangle className={`h-5 w-5 mt-0.5 ${isWarning ? 'text-orange-500' : 'text-sky-500'}`} />
            <div>
              <p className={`font-semibold ${isWarning ? 'text-orange-800' : 'text-sky-800'}`}>
                {item.title || item.message}
              </p>
              {item.message && item.title && (
                <p className={`text-sm ${isWarning ? 'text-orange-700' : 'text-sky-700'}`}>{item.message}</p>
              )}
              <p className={`text-sm font-medium ${isWarning ? 'text-orange-700' : 'text-sky-700'}`}>
                {item.action}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 3. Crop Advisory Display Component
const CropAdvisoryDisplay = ({ data }) => {
  if (!data || !Array.isArray(data.advisory)) return null;
  
  return (
    <div className="space-y-5">
      {data.advisory.map((item, index) => (
        <div key={index}>
          <p className="font-semibold text-gray-800 mb-1">{item.title}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Crops:</span> {Array.isArray(item.crops) ? item.crops.join(', ') : item.crops}
          </p>
          <p className="text-sm text-green-600">
            <span className="font-medium">Reason:</span> {item.reason}
          </p>
        </div>
      ))}
    </div>
  );
};

export default function InfoCards({ language }) {
  const [marketData, setMarketData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [cropAdvisory, setCropAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardTexts = {
    english: {
      marketPrices: "Market Prices",
      weatherAlerts: "Weather Alerts", 
      cropAdvisory: "Crop Advisory",
      loading: "Loading...",
      error: "Failed to load data"
    },
    malayalam: {
      marketPrices: "വിപണി വിലകൾ",
      weatherAlerts: "കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ",
      cropAdvisory: "വിള ഉപദേശം",
      loading: "ലോഡുചെയ്യുന്നു...",
      error: "ഡാറ്റ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല"
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://agriassist-24.onrender.com/api';
      
      const [marketResponse, weatherResponse, cropResponse] = await Promise.all([
        fetch(`${baseURL}/market-prices`),
        fetch(`${baseURL}/weather-alerts`),
        fetch(`${baseURL}/crop-advisory`)
      ]);

      if (marketResponse.ok) {
        const marketJson = await marketResponse.json();
        setMarketData(marketJson);
      }
      
      if (weatherResponse.ok) {
        const weatherJson = await weatherResponse.json();
        setWeatherData(weatherJson);
      }
      
      if (cropResponse.ok) {
        const cropJson = await cropResponse.json();
        setCropAdvisory(cropJson);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      type: 'market',
      title: cardTexts[language].marketPrices,
      icon: TrendingUp,
      data: marketData,
      bgColor: 'bg-blue-50',
      headerColor: 'text-blue-700',
      iconBg: 'bg-blue-500'
    },
    {
      type: 'weather',
      title: cardTexts[language].weatherAlerts,
      icon: CloudRain,
      data: weatherData,
      bgColor: 'bg-orange-50',
      headerColor: 'text-orange-700',
      iconBg: 'bg-orange-500'
    },
    {
      type: 'advisory',
      title: cardTexts[language].cropAdvisory,
      icon: Lightbulb,
      data: cropAdvisory,
      bgColor: 'bg-green-50',
      headerColor: 'text-green-700',
      iconBg: 'bg-green-500'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div key={card.type} className={`${card.bgColor} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300`}>
              <div className="flex items-center space-x-4 mb-5">
                <div className={`${card.iconBg} p-3 rounded-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className={`text-xl font-semibold ${card.headerColor}`}>{card.title}</h3>
              </div>
              <div className="min-h-[250px]">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                     <Loader className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                ) : card.data ? (
                  <>
                    {card.type === 'market' && <MarketPriceDisplay data={card.data} />}
                    {card.type === 'weather' && <WeatherAlertsDisplay data={card.data} />}
                    {card.type === 'advisory' && <CropAdvisoryDisplay data={card.data} />}
                  </>
                ) : (
                  <p className="text-center text-gray-500 pt-16">{cardTexts[language].error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
