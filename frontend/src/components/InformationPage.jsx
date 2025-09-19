import { useState, useEffect } from "react";
import {
  TrendingUp,
  CloudRain,
  Lightbulb,
  FileText,
  ExternalLink,
  Loader,
  AlertTriangle, // Added for weather alerts
} from "lucide-react";

// --- Custom Display Components for each card type ---
// 1. Market Price Display Component
const MarketPriceDisplay = ({ data }) => {
  let parsedData;
  try {
    // The data might be stringified twice, so we parse it carefully.
    parsedData = JSON.parse(data);
    if (typeof parsedData === 'string') {
        parsedData = JSON.parse(parsedData);
    }
  } catch (e) {
    return <p className="text-sm text-gray-500">Could not load market data.</p>;
  }
  // Assuming the final parsed data has a 'prices' array
  if (!parsedData || !Array.isArray(parsedData.prices)) return null;
  return (
    <div className="space-y-4">
      {parsedData.prices.map((item, index) => (
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

// 2. Crop Advisory Display Component
const CropAdvisoryDisplay = ({ data }) => {
  let parsedData;
  try {
    parsedData = JSON.parse(data);
    if (typeof parsedData === 'string') {
        parsedData = JSON.parse(parsedData);
    }
  } catch (e) {
    return <p className="text-sm text-gray-500">Could not load advisory data.</p>;
  }
  if (!parsedData || !Array.isArray(parsedData.advisory)) return null;
  return (
    <div className="space-y-5">
      {parsedData.advisory.map((item, index) => (
        <div key={index}>
          <p className="font-semibold text-gray-800 mb-1">{item.title}</p>
          <p className="text-sm text-gray-600">{item.crops}</p>
          <p className="text-sm text-green-600">{item.reason}</p>
        </div>
      ))}
    </div>
  );
};

// 3. Weather Alerts Display Component
const WeatherAlertsDisplay = ({ data }) => {
  let parsedData;
  try {
    parsedData = JSON.parse(data);
    if (typeof parsedData === 'string') {
        parsedData = JSON.parse(parsedData);
    }
  } catch (e) {
    return <p className="text-sm text-gray-500">Could not load weather data.</p>;
  }
  if (!parsedData || !Array.isArray(parsedData.alerts)) return null;
  return (
    <div className="space-y-3">
      {parsedData.alerts.map((item, index) => {
        const isWarning = item.type.toLowerCase() === 'warning';
        return (
          <div key={index} className={`flex items-start space-x-3 p-4 rounded-lg ${isWarning ? 'bg-orange-100/70' : 'bg-sky-50'}`}>
            <AlertTriangle className={`h-5 w-5 mt-0.5 ${isWarning ? 'text-orange-500' : 'text-sky-500'}`} />
            <div>
              <p className={`font-semibold ${isWarning ? 'text-orange-800' : 'text-sky-800'}`}>{item.message}</p>
              <p className={`text-sm ${isWarning ? 'text-orange-700' : 'text-sky-700'}`}>{item.action}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function InformationPage({ language }) {
  const [marketData, setMarketData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [cropAdvisory, setCropAdvisory] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const infoTexts = {
    english: {
      title: "Agricultural Information Hub",
      subtitle:
        "Stay updated with market prices, weather alerts, crop advisory, and government schemes",
      marketPrices: "Market Prices",
      weatherAlerts: "Weather Alerts",
      cropAdvisory: "Crop Advisory",
      governmentSchemes: "Government Schemes & Subsidies",
      schemesSubtitle: "Explore available schemes and subsidies for you",
      loading: "Loading...",
      error: "Failed to load data",
      learnMore: "Learn More",
      viewDetails: "View Details",
    },
    malayalam: {
      title: "കാർഷിക വിവര കേന്ദ്രം",
      subtitle:
        "വിപണി വിലകൾ, കാലാവസ്ഥാ അലേർട്ടുകൾ, വിള ഉപദേശം, സർക്കാർ പദ്ധതികൾ എന്നിവയിൽ അപ്ഡേറ്റ് ചെയ്യുക",
      marketPrices: "വിപണി വിലകൾ",
      weatherAlerts: "കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ",
      cropAdvisory: "വിള ഉപദേശം",
      governmentSchemes: "സർക്കാർ പദ്ധതികളും സബ്സിഡികളും",
      schemesSubtitle:
        "നിങ്ങൾക്ക് കിട്ടുന്ന പദ്ധതികളും സബ്സിഡികളും നോക്കാം",
      loading: "ലോഡുചെയ്യുന്നു...",
      error: "ഡാറ്റ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല",
      learnMore: "കൂടുതൽ അറിയുക",
      viewDetails: "വിശദാംശങ്ങൾ കാണുക",
    },
  };

  useEffect(() => {
    fetchAllData();
  }, [language]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const baseURL =
        import.meta.env.VITE_API_BASE_URL ||
        "https://agriassist-24.onrender.com/api";

      const [marketResponse, weatherResponse, cropResponse, schemesResponse] =
        await Promise.all([
          fetch(`${baseURL}/market-prices`),
          fetch(`${baseURL}/weather-alerts`),
          fetch(`${baseURL}/crop-advisory`),
          fetch(`${baseURL}/government-schemes`),
        ]);

      if (marketResponse.ok) {
        const marketText = await marketResponse.text();
        setMarketData(marketText);
      }

      if (weatherResponse.ok) {
        const weatherText = await weatherResponse.text();
        setWeatherData(weatherText);
      }

      if (cropResponse.ok) {
        const cropText = await cropResponse.text();
        setCropAdvisory(cropText);
      }

      if (schemesResponse.ok) {
        const schemesText = await schemesResponse.text();
        // Mock schemes data - in real app, parse the actual response
        const mockSchemes = [
          {
            title:
              language === "english" ? "PM-KISAN Scheme" : "പിഎം-കിസാൻ പദ്ധതി",
            description:
              language === "english"
                ? "Financial assistance of ₹6000 per year to all farmer families"
                : "എല്ലാ കർഷക കുടുംബങ്ങൾക്കും വർഷത്തിൽ ₹6000 സാമ്പത്തിക സഹായം",
            link: "https://pmkisan.gov.in/",
            category:
              language === "english"
                ? "Financial Assistance"
                : "സാമ്പത്തിക സഹായം",
          },
          {
            title:
              language === "english"
                ? "Soil Health Card Scheme"
                : "മണ്ണിന്റെ ആരോഗ്യ കാർഡ് പദ്ധതി",
            description:
              language === "english"
                ? "Free soil testing and nutrient management recommendations"
                : "സൗജന്യ മണ്ണ് പരിശോധനയും പോഷക പരിപാലന ശുപാർശകളും",
            link: "https://soilhealth.dac.gov.in/",
            category:
              language === "english" ? "Soil Management" : "മണ്ണ് പരിപാലനം",
          },
          {
            title:
              language === "english"
                ? "Pradhan Mantri Fasal Bima Yojana"
                : "പ്രധാനമന്ത്രി ഫസൽ ബീമ യോജന",
            description:
              language === "english"
                ? "Crop insurance scheme for farmers against natural calamities"
                : "പ്രകൃതി ദുരന്തങ്ങൾക്കെതിരെ കർഷകർക്കുള്ള വിള ഇൻഷുറൻസ് പദ്ധതി",
            link: "https://pmfby.gov.in/",
            category: language === "english" ? "Insurance" : "ഇൻഷുറൻസ്",
          },
          {
            title:
              language === "english"
                ? "Kisan Credit Card"
                : "കിസാൻ ക്രെഡിറ്റ് കാർഡ്",
            description:
              language === "english"
                ? "Easy access to credit for farming activities"
                : "കാർഷിക പ്രവർത്തനങ്ങൾക്കായി എളുപ്പത്തിൽ വായ്പ ലഭിക്കുന്നതിന്",
            link: "https://www.india.gov.in/spotlight/kisan-credit-card-farmers",
            category: language === "english" ? "Credit & Loans" : "വായ്പകൾ",
          },
          {
            title:
              language === "english"
                ? "National Agriculture Market (e-NAM)"
                : "ദേശീയ കാർഷിക വിപണി (ഇ-നാം)",
            description:
              language === "english"
                ? "Online trading platform for agricultural commodities"
                : "കാർഷിക ഉൽപ്പന്നങ്ങൾക്കുള്ള ഓൺലൈൻ ട്രേഡിംഗ് പ്ലാറ്റ്ഫോം",
            link: "https://enam.gov.in/",
            category: language === "english" ? "Marketing" : "വിപണനം",
          },
          {
            title:
              language === "english"
                ? "Organic Farming Scheme"
                : "ജൈവ കൃഷി പദ്ധതി",
            description:
              language === "english"
                ? "Support for organic farming practices and certification"
                : "ജൈവ കൃഷി രീതികൾക്കും സർട്ടിഫിക്കേഷനുമുള്ള പിന്തുണ",
            link: "https://organic.gov.in/",
            category: language === "english" ? "Organic Farming" : "ജൈവ കൃഷി",
          },
        ];
        setSchemes(mockSchemes);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const infoCards = [
    { type: 'market', title: infoTexts[language].marketPrices, icon: TrendingUp, data: marketData, bgColor: 'bg-blue-50', headerColor: 'text-blue-700', iconBg: 'bg-blue-500' },
    { type: 'weather', title: infoTexts[language].weatherAlerts, icon: CloudRain, data: weatherData, bgColor: 'bg-orange-50', headerColor: 'text-orange-700', iconBg: 'bg-orange-500' },
    { type: 'crop', title: infoTexts[language].cropAdvisory, icon: Lightbulb, data: cropAdvisory, bgColor: 'bg-green-50', headerColor: 'text-green-700', iconBg: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {infoTexts[language].title}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {infoTexts[language].subtitle}
          </p>
        </div>

        {/* Information Cards - UPDATED SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {infoCards.map((card) => (
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
                    {card.type === 'crop' && <CropAdvisoryDisplay data={card.data} />}
                  </>
                ) : (
                  <p className="text-center text-gray-500 pt-16">{infoTexts[language].error}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Government Schemes Section - UNCHANGED */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {infoTexts[language].governmentSchemes}
            </h2>
            <p className="text-lg text-gray-600">
              {infoTexts[language].schemesSubtitle}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="flex items-center space-x-2">
                <Loader className="h-6 w-6 animate-spin text-green-600" />
                <span className="text-gray-600">
                  {infoTexts[language].loading}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schemes.map((scheme, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 border border-gray-100"
                >
                  {/* Category Tag */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      {scheme.category}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {scheme.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {scheme.description}
                  </p>

                  {/* Link */}
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium text-sm transition-colors duration-200"
                  >
                    <span>{infoTexts[language].learnMore}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
