import { useState, useEffect } from "react";
import { ExternalLink, FileText, Loader } from "lucide-react";

export default function TopSchemes({ language, onViewAll }) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  const schemeTexts = {
    english: {
      title: "Top Government Schemes & Subsidies",
      subtitle: "Explore the latest agricultural schemes available for farmers",
      loading: "Loading schemes...",
      error: "Failed to load schemes",
      viewAll: "View All Schemes",
      learnMore: "Learn More",
    },
    malayalam: {
      title: "പ്രധാन സർക്കാർ പദ്ധതികളും സബ്സിഡികളും",
      subtitle: "കർഷകർക്കായി ലഭ്യമായ ഏറ്റവും പുതിയ കാർഷിക പദ്ധതികൾ അन്വേषിക്കുക",
      loading: "പദ്ധതികൾ ലോഡുചെയ്യുन്നു...",
      error: "പദ്ധതികൾ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല",
      viewAll: "എല�ാ പദ്ധതികളും കാണുക",
      learnMore: "കൂटുതൽ അറിയുക",
    },
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const baseURL =
        import.meta.env.VITE_API_BASE_URL ||
        "https://agriassist-24.onrender.com/api";
      const response = await fetch(`${baseURL}/government-schemes`);

      if (response.ok) {
        const schemesText = await response.text();
        // Parse the schemes text into structured data
        // This is a mock implementation - adjust based on actual API response
        const mockSchemes = [
          {
            title:
              language === "english" ? "PM-KISAN Scheme" : "പിഎം-കിസാൻ പദ്ധതി",
            description:
              language === "english"
                ? "Financial assistance of ₹6000 per year to all farmer families"
                : "എല�ാ കർഷക കുടുംബങ്ങൾک്കും വർഷത്തിൽ ₹6000 സാമ്പത്തിക സহായം",
            link: "https://pmkisan.gov.in/",
          },
          {
            title:
              language === "english"
                ? "Soil Health Card Scheme"
                : "മണ്ണിन്റെ ആരോഗ്യ കാർഡ് പദ്ധതി",
            description:
              language === "english"
                ? "Free soil testing and nutrient management recommendations"
                : "സൗജന്യ മണ്ണ് പരിശോധनയും പോषക പരിപാലन ശുപാർശകളും",
            link: "https://soilhealth.dac.gov.in/",
          },
          {
            title:
              language === "english"
                ? "Pradhan Mantri Fasal Bima Yojana"
                : "പ്രധാनമन்த्रি ഫസൽ ബീമ യോജन",
            description:
              language === "english"
                ? "Crop insurance scheme for farmers against natural calamities"
                : "പ്രകൃതി ദുരनन्तങ्ङൾک്കെതിരെ കർषകർक്കുള्ळ വിള ഇൻषുറൻസ് പद്ധതി",
            link: "https://pmfby.gov.in/",
          },
          {
            title:
              language === "english" ? "Kisan Credit Card" : "കിസാൻ ക്രെഡിറ്റ് കാർഡ്",
            description:
              language === "english"
                ? "Easy access to credit for farming activities"
                : "കാർषിക പ്രवർത്തनങ्ङൾک്കായി എളുप्पത्तിൽ വായ्प ലഭിക്കുन्नതിन്",
            link: "https://www.india.gov.in/spotlight/kisan-credit-card-farmers",
          },
        ];
        setSchemes(mockSchemes);
      }
    } catch (error) {
      console.error("Error fetching schemes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {schemeTexts[language].title}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {schemeTexts[language].subtitle}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex items-center space-x-2">
              <Loader className="h-6 w-6 animate-spin text-green-600" />
              <span className="text-gray-600">
                {schemeTexts[language].loading}
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Schemes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {schemes.map((scheme, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
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
                    <span>{schemeTexts[language].learnMore}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <button
                onClick={onViewAll}
                className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
              >
                {schemeTexts[language].viewAll}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
