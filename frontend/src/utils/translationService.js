// Malayalam language detection using Unicode character ranges
const isContainsMalayalam = (text) => {
  // Malayalam Unicode range: U+0D00 to U+0D7F
  const malayalamRange = /[\u0D00-\u0D7F]/;
  return malayalamRange.test(text);
};

// Simple language detection for Malayalam vs English
export const detectLanguage = (text) => {
  // Check if text contains Malayalam characters
  if (isContainsMalayalam(text)) {
    return 'ml'; // Malayalam
  }

  // Default to English if no Malayalam characters found
  return 'en';
};

// Google Translate API (free, unofficial)
export const translateText = async (text, fromLang, toLang) => {
  // If the text is empty or just whitespace, don't call the API
  if (!text || !text.trim()) {
    return "";
  }
  try {
    // Using Google Translate unofficial API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`;

    console.log(`🔄 Google Translate: "${text}" (${fromLang} → ${toLang})`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Translate failed: ${response.status}`);
    }

    const data = await response.json();

    // Extract translated text from Google's response format
    const translatedText = data[0].map(item => item[0]).join('') || text;

    console.log(`✅ Translation result: "${translatedText}"`);
    return translatedText;

  } catch (error) {
    console.error('Google Translate error:', error);

    // Fallback to MyMemory API if Google fails
    try {
      console.log('🔄 Trying MyMemory API as fallback...');
      return await translateWithMyMemory(text, fromLang, toLang);
    } catch (fallbackError) {
      console.error('MyMemory fallback also failed:', fallbackError);
      return text; // Return original text if all translation services fail
    }
  }
};

// Fallback translation service using MyMemory API
const translateWithMyMemory = async (text, fromLang, toLang) => {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.responseStatus === 200) {
    const translatedText = data.responseData.translatedText;
    console.log(`✅ MyMemory translation: "${translatedText}"`);
    return translatedText;
  } else {
    throw new Error('MyMemory translation failed');
  }
};

// --- MODIFIED FUNCTIONS START HERE ---

// Main translation functions for your app
export const translateToEnglish = async (text) => {
  const detectedLang = detectLanguage(text);
  console.log(`🔍 Language detected: ${detectedLang} for text: "${text}"`);

  if (detectedLang === 'en') {
    console.log('📝 Text is already in English');
    return text; // Already English
  }

  console.log('🔄 Translating Malayalam to English (chunking)...');

  // 1. Split text into chunks by newline, and remove any empty lines
  const chunks = text.split('\n').filter(chunk => chunk.trim() !== '');

  // 2. Translate each chunk individually and wait for all to complete
  const translatedPromises = chunks.map(chunk => translateText(chunk, 'ml', 'en'));
  const translatedChunks = await Promise.all(translatedPromises);

  // 3. Join the translated chunks back together, preserving paragraphs
  return translatedChunks.join('\n');
};

export const translateToMalayalam = async (text) => {
  console.log('🔄 Translating English to Malayalam (chunking)...');

  // 1. Split text into chunks by newline, and remove any empty lines
  const chunks = text.split('\n').filter(chunk => chunk.trim() !== '');

  // 2. Translate each chunk individually and wait for all to complete
  const translatedPromises = chunks.map(chunk => translateText(chunk, 'en', 'ml'));
  const translatedChunks = await Promise.all(translatedPromises);

  // 3. Join the translated chunks back together, preserving paragraphs
  return translatedChunks.join('\n');
};

// --- MODIFIED FUNCTIONS END HERE ---


// Test function to verify translation is working
export const testTranslation = async () => {
  console.log('🧪 Testing Google Translate service...');

  try {
    // Test 1: English to Malayalam
    console.log('\n--- Test 1: English to Malayalam ---');
    const result1 = await translateToMalayalam("Hello, how are you?");
    console.log(`Result: "${result1}"`);

    // Test 2: Malayalam to English
    console.log('\n--- Test 2: Malayalam to English ---');
    const result2 = await translateToEnglish("കാർഷികമായ മാറ്റം കാർഷികരെ എങ്ങനെയാണ് ബാധിക്കുന്നത്?");
    console.log(`Result: "${result2}"`);

    // Test 3: Language detection
    console.log('\n--- Test 3: Language Detection ---');
    const detection1 = detectLanguage("Hello world");
    const detection2 = detectLanguage("നമസ്കാരം");
    console.log(`"Hello world" detected as: ${detection1}`);
    console.log(`"നമസ്കാരം" detected as: ${detection2}`);

    return {
      englishToMalayalam: result1,
      malayalamToEnglish: result2,
      detectionTest: {
        detection1,
        detection2
      }
    };

  } catch (error) {
    console.error('❌ Translation test failed:', error);
    return null;
  }
};

// Test function for Malayalam detection only
export const testMalayalamDetection = (text) => {
  const detected = detectLanguage(text);
  console.log(`Text: "${text}" - Detected: ${detected}`);
  return detected;
};

// Quick test function you can call from console
export const quickTest = async () => {
  console.log('🚀 Quick translation test...');
  const result = await translateToMalayalam("What is farming?");
  console.log('Quick test result:', result);
  return result;
};