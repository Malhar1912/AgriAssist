import { useState } from "react";
import { Calculator, DollarSign, MessageSquare } from "lucide-react";
import { translateToMalayalam } from "../utils/translationService"; // Adjust path

export default function CalculatorPage({ language }) {
  const [activeTab, setActiveTab] = useState("loan");
  const [loanData, setLoanData] = useState({
    principal: "",
    interestRate: "",
    tenureYears: "",
  });
  const [budgetData, setBudgetData] = useState({
    crop: "",
    areaAcres: "",
    expectedYieldTons: "",
  });
  const [loanResults, setLoanResults] = useState(null);
  const [budgetResults, setBudgetResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const calculatorTexts = {
    english: {
      title: "Financial Calculator",
      subtitle:
        "Calculate loans and budget planning for your agricultural needs",
      loanCalculator: "Loan Calculator",
      budgetCalculator: "Budget Calculator",
      principal: "Principal Amount (₹)",
      interestRate: "Interest Rate (%)",
      tenure: "Tenure (Years)",
      crop: "Crop Type",
      area: "Area (Acres)",
      expectedYield: "Expected Yield (Tons)",
      calculate: "Calculate",
      calculating: "Calculating...",
      monthlyEMI: "Monthly EMI",
      totalAmount: "Total Amount",
      totalInterest: "Total Interest",
      totalCost: "Total Cost",
      expectedRevenue: "Expected Revenue",
      profit: "Profit",
      suggestions: "AI Suggestions",
      noResults: "Enter values and click calculate to see results",
    },
    malayalam: {
      title: "സാമ്പത്തിക കാൽക്കുലേറ്റർ",
      subtitle: "നിങ്ങളുടെ കാർഷിക ആവശ്യങ്ങൾക്കായി വായ്പകളും ബജറ്റ് ആസൂത്രണവും കണക്കാക്കുക",
      loanCalculator: "വായ്പ കാൽക്കുലേറ്റർ",
      budgetCalculator: "ബജറ്റ് കാൽക്കുലേറ്റർ",
      principal: "പ്രിൻസിപ്പൽ തുക (₹)",
      interestRate: "പലിശ നിരക്ക് (%)",
      tenure: "കാലാവധി (വർഷങ്ങൾ)",
      crop: "വിള തരം",
      area: "വിസ്തീർണ്ണം (ഏക്കർ)",
      expectedYield: "പ്രതീക്ഷിക്കുന്ന വിളവ് (ടൺ)",
      calculate: "കണക്കാക്കുക",
      calculating: "കണക്കാക്കുന്നു...",
      monthlyEMI: "പ്രതിമാസ ഇഎംഐ",
      totalAmount: "മൊത്തം തുക",
      totalInterest: "മൊത്തം പലിശ",
      totalCost: "മൊത്തം ചിലവ്",
      expectedRevenue: "പ്രതീക്ഷിക്കുന്ന വരുമാനം",
      profit: "ലാഭം",
      suggestions: "എഐ നിർദ്ദേശങ്ങൾ",
      noResults: "ഫലങ്ങൾ കാണാൻ മൂല്യങ്ങൾ നൽകിയ്ക്കുക ക്ലിക്കുചെയ്യുക",
    },
  };

  const cleanEscapedChars = (text) => {
    return text
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, "\\")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "\r");
  };

  const translateAndSetSuggestions = async (text) => {
    let finalText = text;
    if (language === "malayalam") {
      try {
        finalText = await translateToMalayalam(text);
      } catch (error) {
        console.error("Translation failed:", error);
      }
    }
    setSuggestions([finalText]);
  };

  const calculateLoan = async () => {
    if (!loanData.principal || !loanData.interestRate || !loanData.tenureYears)
      return;

    setLoading(true);
    setLoanResults(null);
    setSuggestions([]);

    try {
      const baseURL =
        import.meta.env.VITE_API_BASE_URL ||
        "https://agriassist-24.onrender.com/api";

      const response = await fetch(`${baseURL}/calculate-loan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principal: parseFloat(loanData.principal),
          interest_rate: parseFloat(loanData.interestRate),
          tenure_years: parseInt(loanData.tenureYears),
          session_id: `loan_${Date.now()}`,
        }),
      });

      if (response.ok) {
        const responseText = await response.text();

        let finalResponseText = "";

        try {
          const parsedResponse = JSON.parse(responseText);
          finalResponseText =
            parsedResponse.financial_advice ||
            parsedResponse.suggestion ||
            parsedResponse.response ||
            parsedResponse.text ||
            "";
        } catch {
          finalResponseText = responseText;
        }

        if (typeof finalResponseText === "string") {
          finalResponseText = cleanEscapedChars(finalResponseText);
        }

        await translateAndSetSuggestions(finalResponseText);

        // EMI calculations
        const p = parseFloat(loanData.principal);
        const r = parseFloat(loanData.interestRate) / 100 / 12;
        const n = parseInt(loanData.tenureYears) * 12;
        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalAmount = emi * n;
        const totalInterest = totalAmount - p;

        setLoanResults({ monthlyEMI: emi, totalAmount, totalInterest });
      }
    } catch (error) {
      console.error("Error calculating loan:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBudget = async () => {
    if (
      !budgetData.crop ||
      !budgetData.areaAcres ||
      !budgetData.expectedYieldTons
    )
      return;

    setLoading(true);
    setBudgetResults(null);
    setSuggestions([]);

    try {
      const baseURL =
        import.meta.env.VITE_API_BASE_URL ||
        "https://agriassist-24.onrender.com/api";

      const response = await fetch(`${baseURL}/calculate-budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: budgetData.crop,
          area_acres: parseFloat(budgetData.areaAcres),
          expected_yield_tons: parseFloat(budgetData.expectedYieldTons),
          session_id: `budget_${Date.now()}`,
        }),
      });

      if (response.ok) {
        const responseText = await response.text();

        let finalResponseText = "";

        try {
          const parsedResponse = JSON.parse(responseText);
          finalResponseText =
            parsedResponse.financial_advice ||
            parsedResponse.suggestion ||
            parsedResponse.response ||
            parsedResponse.text ||
            "";
        } catch {
          finalResponseText = responseText;
        }

        if (typeof finalResponseText === "string") {
          finalResponseText = cleanEscapedChars(finalResponseText);
        }

        await translateAndSetSuggestions(finalResponseText);

        // Budget calculations
        const area = parseFloat(budgetData.areaAcres);
        const yieldTons = parseFloat(budgetData.expectedYieldTons);
        const costPerAcre = 25000;
        const pricePerTon = 20000;
        const totalCost = area * costPerAcre;
        const expectedRevenue = yieldTons * pricePerTon;
        const profit = expectedRevenue - totalCost;

        setBudgetResults({ totalCost, expectedRevenue, profit });
      }
    } catch (error) {
      console.error("Error calculating budget:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {calculatorTexts[language].title}
          </h1>
          <p className="text-lg text-gray-600">
            {calculatorTexts[language].subtitle}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab("loan")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === "loan"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-green-50"
            }`}
          >
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>{calculatorTexts[language].loanCalculator}</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("budget")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === "budget"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-green-50"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>{calculatorTexts[language].budgetCalculator}</span>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            {activeTab === "loan" ? (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {calculatorTexts[language].loanCalculator}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {calculatorTexts[language].principal}
                  </label>
                  <input
                    type="number"
                    value={loanData.principal}
                    onChange={(e) =>
                      setLoanData({ ...loanData, principal: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="100000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {calculatorTexts[language].interestRate}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={loanData.interestRate}
                    onChange={(e) =>
                      setLoanData({ ...loanData, interestRate: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="8.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {calculatorTexts[language].tenure}
                  </label>
                  <input
                    type="number"
                    value={loanData.tenureYears}
                    onChange={(e) =>
                      setLoanData({ ...loanData, tenureYears: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="5"
                  />
                </div>

                <button
                  onClick={calculateLoan}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors duration-200"
                >
                  {loading
                    ? calculatorTexts[language].calculating
                    : calculatorTexts[language].calculate}
                </button>

                {/* Loan Results */}
                {loanResults && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">
                        {calculatorTexts[language].monthlyEMI}
                      </h4>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(loanResults.monthlyEMI)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800">
                          {calculatorTexts[language].totalAmount}
                        </h4>
                        <p className="text-lg font-bold text-blue-900">
                          {formatCurrency(loanResults.totalAmount)}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-orange-800">
                          {calculatorTexts[language].totalInterest}
                        </h4>
                        <p className="text-lg font-bold text-orange-900">
                          {formatCurrency(loanResults.totalInterest)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {calculatorTexts[language].budgetCalculator}
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {calculatorTexts[language].crop}
                  </label>
                  <input
                    type="text"
                    value={budgetData.crop}
                    onChange={(e) =>
                      setBudgetData({ ...budgetData, crop: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Rice"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {calculatorTexts[language].area}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={budgetData.areaAcres}
                    onChange={(e) =>
                      setBudgetData({
                        ...budgetData,
                        areaAcres: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {calculatorTexts[language].expectedYield}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={budgetData.expectedYieldTons}
                    onChange={(e) =>
                      setBudgetData({
                        ...budgetData,
                        expectedYieldTons: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="15"
                  />
                </div>
                <button
                  onClick={calculateBudget}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors duration-200"
                >
                  {loading
                    ? calculatorTexts[language].calculating
                    : calculatorTexts[language].calculate}
                </button>
                {budgetResults && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-800">
                          {calculatorTexts[language].totalCost}
                        </h4>
                        <p className="text-lg font-bold text-red-900">
                          {formatCurrency(budgetResults.totalCost)}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800">
                          {calculatorTexts[language].expectedRevenue}
                        </h4>
                        <p className="text-lg font-bold text-blue-900">
                          {formatCurrency(budgetResults.expectedRevenue)}
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg ${
                          budgetResults.profit >= 0 ? "bg-green-50" : "bg-red-50"
                        }`}
                      >
                        <h4
                          className={`font-semibold ${
                            budgetResults.profit >= 0
                              ? "text-green-800"
                              : "text-red-800"
                          }`}
                        >
                          {calculatorTexts[language].profit}
                        </h4>
                        <p
                          className={`text-2xl font-bold ${
                            budgetResults.profit >= 0
                              ? "text-green-900"
                              : "text-red-900"
                          }`}
                        >
                          {formatCurrency(budgetResults.profit)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                {calculatorTexts[language].suggestions}
              </h3>
            </div>
            <div className="min-h-[400px]">
              {suggestions.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>{calculatorTexts[language].noResults}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
