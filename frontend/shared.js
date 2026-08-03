const KG_LANGUAGES = {
  "en-IN": { label: "English", speech: "en-IN" },
  "hi-IN": { label: "Hindi", speech: "hi-IN" },
  "bho-IN": { label: "Bhojpuri", speech: "hi-IN" },
  "gu-IN": { label: "Gujarati", speech: "gu-IN" },
  "mr-IN": { label: "Marathi", speech: "mr-IN" },
  "kn-IN": { label: "Kannada", speech: "kn-IN" },
  "ta-IN": { label: "Tamil", speech: "ta-IN" },
  "te-IN": { label: "Telugu", speech: "te-IN" },
  "pa-IN": { label: "Punjabi", speech: "pa-IN" },
  "har-IN": { label: "Haryanvi", speech: "hi-IN" }
};

let kgAvailableVoices = [];

function kgRefreshVoiceList() {
  if (!("speechSynthesis" in window)) return;
  kgAvailableVoices = window.speechSynthesis.getVoices() || [];
}

function kgSpeechLang(lang = kgActiveLanguage) {
  return KG_LANGUAGES[lang]?.speech || "en-IN";
}

function kgBestVoice(lang = kgActiveLanguage) {
  kgRefreshVoiceList();
  const speechLang = kgSpeechLang(lang).toLowerCase();
  const baseLang = speechLang.split("-")[0];
  const preferredNames = {
    "hi": ["Google हिन्दी", "Microsoft Kalpana", "Microsoft Hemant", "Hindi"],
    "gu": ["Google ગુજરાતી", "Gujarati"],
    "mr": ["Google मराठी", "Marathi"],
    "kn": ["Google ಕನ್ನಡ", "Kannada"],
    "ta": ["Google தமிழ்", "Tamil"],
    "te": ["Google తెలుగు", "Telugu"],
    "pa": ["Punjabi", "Gurmukhi"]
  }[baseLang] || [];

  return kgAvailableVoices.find((voice) => voice.lang?.toLowerCase() === speechLang)
    || kgAvailableVoices.find((voice) => preferredNames.some((name) => voice.name?.toLowerCase().includes(name.toLowerCase())))
    || kgAvailableVoices.find((voice) => voice.lang?.toLowerCase().startsWith(`${baseLang}-`))
    || kgAvailableVoices.find((voice) => voice.lang?.toLowerCase().startsWith(baseLang))
    || null;
}

const KG_EN = {
  navHome: "Home", navFeatures: "Features", navSolutions: "Solutions", navAbout: "About", navContact: "Contact", navLogin: "Login", navStarted: "Get Started",
  heroEyebrow: "Future agriculture for modern India", heroTitle: "Empowering Farmers with AI-Driven Intelligence", heroSubtitle: "KrishiGyaan helps farmers make smarter crop decisions, access government schemes, detect crop diseases, analyze soil health, and receive guidance in their local language.",
  getStarted: "Get Started", watchDemo: "Watch Demo", metricServices: "Services", metricMulti: "Multi-language", metricSupport: "Support", metricAi: "Smart AI", metricAdvisory: "Advisory",
  cropHealth: "Crop Health", overlayAdvice: "Irrigate after sunset. Pest risk is low today.", floatLang: "Local Voice AI", floatScheme: "Scheme Match", floatScan: "Disease Scan",
  trustText: "Helping bridge the gap between agriculture and technology for modern India.", badgeSchemes: "Govt Schemes", badgeCrop: "Crop Intelligence", badgeWeather: "Weather Aware", badgeVoice: "Voice First",
  featuresEyebrow: "10+ intelligent farming services", featuresTitle: "Everything a farmer needs, unified in one trusted platform.", featuresCopy: "From crop planning to subsidy awareness, KrishiGyaan turns scattered agricultural information into simple, timely, local guidance that farmers can act on immediately. These features unlock after registration and login.",
  featureCropTitle: "Smart Crop Advisory", featureCropText: "Real-time sowing, irrigation, pest and fertilizer guidance.", featureSchemeTitle: "Sahayata Scheme Support", featureSchemeText: "Discover eligible subsidies and welfare benefits instantly.", featureDiseaseTitle: "Crop Disease Detection", featureDiseaseText: "Upload crop images for AI diagnosis.", featureSoilTitle: "Soil Health Analysis", featureSoilText: "Upload soil images for nutrient and moisture insights.", featureChatTitle: "AI Chat Assistant", featureChatText: "Ask farming questions anytime.", featureVoiceTitle: "Voice + Local Language Support", featureVoiceText: "Accessible for every farmer.", featureLocked: "Login required",
  howEyebrow: "Simple workflow", howTitle: "How KrishiGyaan works", howCopy: "The platform creates a farmer profile, understands land and crop context, then gives AI-backed recommendations across the season.", stepOne: "Register your profile", stepTwo: "Add crop and land details", stepThree: "Login to dashboard", stepFour: "Scan crop / soil images", stepFive: "Check schemes and weather", stepSix: "Grow smarter with AI",
  whyEyebrow: "Why KrishiGyaan", whyTitle: "Built for yield, resilience, and rural digital inclusion.", whyCopy: "KrishiGyaan reduces crop loss, improves yield decisions, saves time, increases awareness of benefits, and supports rural digital inclusion through multilingual voice-first guidance.", whyOne: "Reduces crop loss", whyTwo: "Improves yield decisions", whyThree: "Saves time", whyFour: "Increases benefits awareness", whyFive: "Supports rural digital inclusion",
  statFarmers: "Farmers Assisted", statSchemes: "Schemes Supported", statLanguages: "Languages Available", statReports: "AI Reports Generated", testEyebrow: "Farmer stories", testTitle: "Trusted guidance that feels personal.", testOne: "\"KrishiGyaan helped me identify leaf disease early and saved my tomato crop from spreading damage.\"", testTwo: "\"I found subsidy information in my language without visiting multiple offices. It made the process clear.\"", testThree: "\"The voice guidance is simple. My father can listen to irrigation advice directly on the phone.\"",
  teamEyebrow: "Team KrishiYoddha", teamTitle: "The builders behind KrishiGyaan.", registerEyebrow: "Advanced farmer profile", registerTitle: "Register once. Get guidance for your land, crops, and schemes.", regStepPersonal: "Personal", regStepFarm: "Farm", regStepCrop: "Crop", regStepAccess: "Access",
  personalTitle: "Personal details", farmTitle: "Farm and land details", cropTitle: "Crop and season details", accessTitle: "Benefits and access details", fieldName: "Full Name", fieldMobile: "Mobile Number", fieldAge: "Age", fieldGender: "Gender", fieldState: "State", fieldDistrict: "District", fieldVillage: "Village", fieldLanguage: "Preferred Language", fieldLand: "Land Size", fieldOwnership: "Land Ownership", fieldSoil: "Soil Type", fieldIrrigation: "Irrigation Source", fieldCrop: "Primary Crop", fieldSeason: "Season", fieldSowing: "Sowing Date", fieldFertilizer: "Fertilizer Used", fieldProblem: "Recent Problem", fieldHarvest: "Expected Harvest", fieldAadhaar: "Aadhaar Last 4 Digits", fieldBank: "Bank Linked", fieldPm: "PM-KISAN Status", fieldInternet: "Internet Access", fieldConsent: "I agree to receive AI advisory and scheme alerts.", backButton: "Back", nextButton: "Next", completeButton: "Complete Registration",
  loginEyebrow: "Secure farmer access", loginTitle: "Login to unlock every KrishiGyaan feature.", loginCopy: "Crop health scans, weather advisory, schemes, AI chat, soil reports, and voice support are available inside the dashboard after registration and login.", accessCrop: "Crop scanner", accessWeather: "Weather advisory", accessSchemes: "Scheme support", loginFormTitle: "Farmer login", loginButton: "Login to Dashboard",
  ctaTitle: "Join the future of smart farming today.", ctaCopy: "Bring AI crop intelligence, local language support, and scheme discovery to every field.", registerNow: "Register Now", exploreFeatures: "Explore Features",
  footerCopy: "AI-driven rural empowerment for smarter, more resilient agriculture. Built for farmers, advisors, rural teams, and institutions working to modernize Indian agriculture.", footerAbout: "About", footerFeatures: "Features", footerRegister: "Register", footerLogin: "Login", footerPrivacy: "Privacy", footerTerms: "Terms", footerContact: "Contact", footerLocation: "India-first multilingual agriculture intelligence",
  dashEyebrow: "Protected farmer dashboard", dashTitle: "Your field intelligence center", dashSubtitle: "All KrishiGyaan services are now in one secure place after login.", dashWelcome: "Welcome back", dashLogout: "Logout", dashRead: "Read dashboard", dashCropScore: "Crop Score", dashMoisture: "Moisture", dashWeatherRisk: "Weather Risk", dashSchemeMatches: "Scheme Matches",
  dashAdvisoryTitle: "Smart Crop Advisory", dashAdvisoryCopy: "Personal recommendations are generated from your crop, land, language, and local weather profile.", weatherTitle: "10-day weather and sowing guidance", weatherCopy: "See temperature, rain, and wind together before planning irrigation, spraying, sowing, or harvest work.", weatherButton: "Get Weather Advisory", weatherLoading: "Checking your location and weather forecast...", longTermTitle: "30-day crop growth direction", longTermCopy: "Temperature, rainfall, and soil-moisture direction for practical crop planning.",
  scanTitle: "Crop and Plant Disease Detection", scanCopy: "Choose crop disease or plant disease mode, upload an image, and get AI diagnosis with KrishiBaba treatment guidance.", chooseImage: "Choose image", analyzeCrop: "Analyze Health", scanEmpty: "Upload an image to print crop or plant disease data here.", cropDiseaseMode: "Crop disease", plantDiseaseMode: "Plant disease", soilTitle: "Soil Health Check", soilCopy: "Check soil health from farm profile, soil photo, color, texture, drainage, irrigation source, and weather risk. Then get smart crop advice and a growth path.", soilButton: "Analyze Soil Health", soilEmpty: "Upload a soil photo or use your registered soil profile to generate soil health guidance.", schemesTitle: "Sahayata Scheme Support", schemesCopy: "Discover subsidies, PM-KISAN status, irrigation support, crop insurance, and welfare benefits.", chatTitle: "KrishiBaba", chatCopy: "Ask KrishiBaba about crop selection, pest control, fertilizer, irrigation, schemes, weather, or market readiness.", chatPlaceholder: "Ask KrishiBaba your farming question...", chatButton: "Ask KrishiBaba", voiceTitle: "Voice + Local Language Support", voiceCopy: "Click any card, section, or button and KrishiGyaan will dictate that content in your selected local language.",
  modernTitle: "Modern Farming Technique of the Day", modernCopy: "KrishiGyaan gives one daily AI-generated lesson that compares a local traditional practice with a modern low-investment technique for better profit.", modernButton: "Show Today's Technique", modernEmpty: "Generate today's region-specific modern farming technique. A new lesson unlocks after 4 AM tomorrow.",
  smsTitle: "Daily SMS Advisory", smsCopy: "Generate separate daily SMS updates for crop, weather, and modern technique. Connect an SMS provider API to send them every day.", smsButton: "Generate Today's SMS", smsSendButton: "Send SMS", smsEmpty: "Daily SMS messages will appear here. Sending requires provider API settings.", smsProviderMissing: "SMS provider is not configured. Add Twilio or another SMS gateway credentials before sending.",
  lockedMessage: "Please register and login first. All farming tools open inside the protected dashboard.", registerSuccess: "Registration completed. Please login to open your dashboard.", loginSuccess: "Login successful. Opening your dashboard.", loginMissing: "Please complete registration before login.", locationDetected: "Location detected and language updated.", locationDenied: "Location permission was not granted. You can still choose a language manually."
};

function pack(overrides) {
  return { ...KG_EN, ...overrides };
}

const KG_TRANSLATIONS = {
  "en-IN": KG_EN,
  "hi-IN": pack({
    navHome: "होम", navFeatures: "सुविधाएं", navSolutions: "समाधान", navAbout: "परिचय", navContact: "संपर्क", navLogin: "लॉगिन", navStarted: "शुरू करें",
    heroEyebrow: "आधुनिक भारत के लिए भविष्य की खेती", heroTitle: "AI आधारित बुद्धिमत्ता से किसानों को सशक्त बनाना", heroSubtitle: "कृषिज्ञान किसानों को बेहतर फसल निर्णय लेने, सरकारी योजनाएं पाने, फसल रोग पहचानने, मिट्टी स्वास्थ्य समझने और अपनी भाषा में सलाह प्राप्त करने में मदद करता है।",
    getStarted: "शुरू करें", watchDemo: "डेमो देखें", metricServices: "सेवाएं", metricMulti: "बहुभाषी", metricSupport: "सहायता", metricAi: "स्मार्ट AI", metricAdvisory: "सलाह",
    cropHealth: "फसल स्वास्थ्य", overlayAdvice: "सूर्यास्त के बाद सिंचाई करें। आज कीट जोखिम कम है।", floatLang: "स्थानीय वॉइस AI", floatScheme: "योजना मिलान", floatScan: "रोग स्कैन",
    trustText: "आधुनिक भारत के लिए कृषि और तकनीक के बीच की दूरी कम करना।", badgeSchemes: "सरकारी योजनाएं", badgeCrop: "फसल बुद्धिमत्ता", badgeWeather: "मौसम आधारित", badgeVoice: "वॉइस पहले",
    featuresTitle: "किसान की हर जरूरत, एक भरोसेमंद प्लेटफॉर्म में।", featuresCopy: "फसल योजना से सब्सिडी तक, कृषिज्ञान जानकारी को सरल, समय पर और स्थानीय सलाह में बदलता है। ये सुविधाएं पंजीकरण और लॉगिन के बाद खुलेंगी।",
    featureCropTitle: "स्मार्ट फसल सलाह", featureSchemeTitle: "सहायता योजना समर्थन", featureDiseaseTitle: "फसल रोग पहचान", featureSoilTitle: "मिट्टी स्वास्थ्य विश्लेषण", featureChatTitle: "AI चैट सहायक", featureVoiceTitle: "वॉइस और स्थानीय भाषा समर्थन", featureLocked: "लॉगिन जरूरी",
    howTitle: "कृषिज्ञान कैसे काम करता है", stepOne: "अपना प्रोफाइल पंजीकृत करें", stepTwo: "फसल और जमीन की जानकारी जोड़ें", stepThree: "डैशबोर्ड में लॉगिन करें", stepFour: "फसल / मिट्टी की तस्वीर स्कैन करें", stepFive: "योजनाएं और मौसम देखें", stepSix: "AI के साथ बेहतर खेती करें",
    whyTitle: "उपज, मजबूती और ग्रामीण डिजिटल समावेशन के लिए बनाया गया।", statFarmers: "सहायता प्राप्त किसान", statSchemes: "समर्थित योजनाएं", statLanguages: "उपलब्ध भाषाएं", statReports: "AI रिपोर्ट",
    registerTitle: "एक बार पंजीकरण करें। अपनी जमीन, फसल और योजनाओं के लिए सलाह पाएं।", personalTitle: "व्यक्तिगत जानकारी", farmTitle: "खेत और जमीन की जानकारी", cropTitle: "फसल और मौसम जानकारी", accessTitle: "लाभ और पहुंच जानकारी",
    fieldName: "पूरा नाम", fieldMobile: "मोबाइल नंबर", fieldAge: "उम्र", fieldGender: "लिंग", fieldState: "राज्य", fieldDistrict: "जिला", fieldVillage: "गांव", fieldLanguage: "पसंदीदा भाषा", fieldLand: "जमीन का आकार", fieldCrop: "मुख्य फसल", fieldConsent: "मैं AI सलाह और योजना अलर्ट प्राप्त करने के लिए सहमत हूं।",
    loginTitle: "हर कृषिज्ञान सुविधा खोलने के लिए लॉगिन करें।", loginButton: "डैशबोर्ड में लॉगिन करें", ctaTitle: "आज ही स्मार्ट खेती के भविष्य से जुड़ें।",
    dashTitle: "आपका फील्ड इंटेलिजेंस सेंटर", dashSubtitle: "लॉगिन के बाद सभी कृषिज्ञान सेवाएं एक सुरक्षित जगह पर हैं।", weatherTitle: "10 दिन का मौसम और बुवाई सलाह", weatherButton: "मौसम सलाह पाएं", longTermTitle: "30 दिन की फसल वृद्धि दिशा", scanTitle: "AI फसल स्वास्थ्य स्कैनर", schemesTitle: "सहायता योजना समर्थन", chatTitle: "AI चैट सहायक", voiceTitle: "वॉइस और स्थानीय भाषा समर्थन",
    lockedMessage: "कृपया पहले पंजीकरण और लॉगिन करें। सभी कृषि टूल सुरक्षित डैशबोर्ड में खुलेंगे।", registerSuccess: "पंजीकरण पूरा हुआ। अब डैशबोर्ड खोलने के लिए लॉगिन करें।", loginSuccess: "लॉगिन सफल। डैशबोर्ड खुल रहा है।"
  }),
  "bho-IN": pack({
    navHome: "होम", navFeatures: "सुविधा", navSolutions: "समाधान", navAbout: "हमनी के बारे में", navContact: "संपर्क", navLogin: "लॉगिन", navStarted: "शुरू करीं",
    heroEyebrow: "नया जमाना के खेती", heroTitle: "AI के बुद्धि से किसान भाई-बहिन के ताकत देहल", heroSubtitle: "कृषिज्ञान फसल के फैसला, सरकारी योजना, रोग पहचान, माटी स्वास्थ्य आ अपनी बोली में सलाह देवे में मदद करे ला।",
    getStarted: "शुरू करीं", watchDemo: "डेमो देखीं", featureLocked: "लॉगिन जरूरी", loginButton: "डैशबोर्ड में जाईं", weatherButton: "मौसम सलाह लीं", lockedMessage: "पहिले रजिस्टर आ लॉगिन करीं, तब सब सेवा डैशबोर्ड में खुली।"
  }),
  "gu-IN": pack({
    navHome: "હોમ", navFeatures: "સુવિધાઓ", navSolutions: "ઉકેલ", navAbout: "વિશે", navContact: "સંપર્ક", navLogin: "લોગિન", navStarted: "શરૂ કરો",
    heroEyebrow: "આધુનિક ભારત માટે ભવિષ્યની ખેતી", heroTitle: "AI આધારિત બુદ્ધિથી ખેડૂતોને સશક્ત બનાવવું", heroSubtitle: "કૃષિગ્યાન ખેડૂતોને પાકના નિર્ણયો, સરકારી યોજનાઓ, પાક રોગ ઓળખ, જમીન આરોગ્ય અને સ્થાનિક ભાષામાં માર્ગદર્શન આપે છે.",
    getStarted: "શરૂ કરો", watchDemo: "ડેમો જુઓ", featuresTitle: "ખેડૂતની દરેક જરૂરિયાત એક વિશ્વસનીય પ્લેટફોર્મમાં.", featureLocked: "લોગિન જરૂરી", loginTitle: "દરેક સુવિધા ખોલવા માટે લોગિન કરો.", loginButton: "ડેશબોર્ડમાં લોગિન", dashTitle: "તમારું ખેતર બુદ્ધિ કેન્દ્ર", weatherTitle: "10 દિવસનું હવામાન અને વાવણી માર્ગદર્શન", weatherButton: "હવામાન સલાહ મેળવો", ctaTitle: "સ્માર્ટ ખેતીના ભવિષ્યમાં આજે જોડાઓ."
  }),
  "mr-IN": pack({
    navHome: "मुख्यपृष्ठ", navFeatures: "वैशिष्ट्ये", navSolutions: "उपाय", navAbout: "माहिती", navContact: "संपर्क", navLogin: "लॉगिन", navStarted: "सुरू करा",
    heroEyebrow: "आधुनिक भारतासाठी भविष्यातील शेती", heroTitle: "AI आधारित बुद्धिमत्तेने शेतकऱ्यांना सक्षम करणे", heroSubtitle: "कृषिज्ञान शेतकऱ्यांना पिकांचे निर्णय, सरकारी योजना, रोग ओळख, माती आरोग्य आणि स्थानिक भाषेतील मार्गदर्शन देते.",
    getStarted: "सुरू करा", watchDemo: "डेमो पहा", featuresTitle: "शेतकऱ्यांच्या सर्व गरजा एका विश्वासू प्लॅटफॉर्मवर.", featureLocked: "लॉगिन आवश्यक", loginTitle: "सर्व सुविधा उघडण्यासाठी लॉगिन करा.", loginButton: "डॅशबोर्डमध्ये लॉगिन", dashTitle: "तुमचे फील्ड इंटेलिजन्स सेंटर", weatherTitle: "10 दिवसांचे हवामान आणि पेरणी मार्गदर्शन", weatherButton: "हवामान सल्ला मिळवा", ctaTitle: "स्मार्ट शेतीच्या भविष्याशी आजच जोडा."
  }),
  "kn-IN": pack({
    navHome: "ಮುಖಪುಟ", navFeatures: "ವೈಶಿಷ್ಟ್ಯಗಳು", navSolutions: "ಪರಿಹಾರಗಳು", navAbout: "ಬಗ್ಗೆ", navContact: "ಸಂಪರ್ಕ", navLogin: "ಲಾಗಿನ್", navStarted: "ಪ್ರಾರಂಭಿಸಿ",
    heroEyebrow: "ಆಧುನಿಕ ಭಾರತದ ಭವಿಷ್ಯದ ಕೃಷಿ", heroTitle: "AI ಬುದ್ಧಿಮತ್ತೆಯಿಂದ ರೈತರನ್ನು ಶಕ್ತಿಮಂತರಾಗಿಸುವುದು", heroSubtitle: "ಕೃಷಿಜ್ಞಾನ ರೈತರಿಗೆ ಬೆಳೆ ನಿರ್ಧಾರ, ಸರ್ಕಾರಿ ಯೋಜನೆ, ರೋಗ ಪತ್ತೆ, ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಮತ್ತು ಸ್ಥಳೀಯ ಭಾಷೆಯ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ.",
    getStarted: "ಪ್ರಾರಂಭಿಸಿ", watchDemo: "ಡೆಮೊ ನೋಡಿ", featuresTitle: "ರೈತನ ಎಲ್ಲ ಅಗತ್ಯಗಳು ಒಂದೇ ವಿಶ್ವಾಸಾರ್ಹ ವೇದಿಕೆಯಲ್ಲಿ.", featureLocked: "ಲಾಗಿನ್ ಅಗತ್ಯ", loginTitle: "ಎಲ್ಲಾ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ತೆರೆಯಲು ಲಾಗಿನ್ ಮಾಡಿ.", loginButton: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಲಾಗಿನ್", dashTitle: "ನಿಮ್ಮ ಕ್ಷೇತ್ರ ಬುದ್ಧಿಮತ್ತೆ ಕೇಂದ್ರ", weatherTitle: "10 ದಿನಗಳ ಹವಾಮಾನ ಮತ್ತು ಬಿತ್ತನೆ ಸಲಹೆ", weatherButton: "ಹವಾಮಾನ ಸಲಹೆ ಪಡೆಯಿರಿ", ctaTitle: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿಯ ಭವಿಷ್ಯಕ್ಕೆ ಇಂದು ಸೇರಿ."
  }),
  "ta-IN": pack({
    navHome: "முகப்பு", navFeatures: "அம்சங்கள்", navSolutions: "தீர்வுகள்", navAbout: "பற்றி", navContact: "தொடர்பு", navLogin: "உள்நுழை", navStarted: "தொடங்குங்கள்",
    heroEyebrow: "நவீன இந்தியாவிற்கான எதிர்கால விவசாயம்", heroTitle: "AI அறிவால் விவசாயிகளை வலுப்படுத்துதல்", heroSubtitle: "கிரிஷிக்யான் பயிர் முடிவுகள், அரசு திட்டங்கள், நோய் கண்டறிதல், மண் ஆரோக்கியம் மற்றும் உள்ளூர் மொழி வழிகாட்டுதலை வழங்குகிறது.",
    getStarted: "தொடங்குங்கள்", watchDemo: "டெமோ பார்க்க", featuresTitle: "விவசாயியின் அனைத்து தேவைகளும் ஒரே நம்பகமான தளத்தில்.", featureLocked: "உள்நுழைவு தேவை", loginTitle: "அனைத்து அம்சங்களையும் திறக்க உள்நுழைக.", loginButton: "டாஷ்போர்டில் உள்நுழை", dashTitle: "உங்கள் வயல் அறிவு மையம்", weatherTitle: "10 நாள் வானிலை மற்றும் விதைப்பு வழிகாட்டல்", weatherButton: "வானிலை ஆலோசனை பெற", ctaTitle: "ஸ்மார்ட் விவசாயத்தின் எதிர்காலத்தில் இன்று சேருங்கள்."
  }),
  "te-IN": pack({
    navHome: "హోమ్", navFeatures: "ఫీచర్లు", navSolutions: "పరిష్కారాలు", navAbout: "గురించి", navContact: "సంప్రదించండి", navLogin: "లాగిన్", navStarted: "ప్రారంభించండి",
    heroEyebrow: "ఆధునిక భారతానికి భవిష్యత్ వ్యవసాయం", heroTitle: "AI ఆధారిత తెలివితో రైతులను శక్తివంతం చేయడం", heroSubtitle: "కృషిజ్ఞాన్ రైతులకు పంట నిర్ణయాలు, ప్రభుత్వ పథకాలు, పంట వ్యాధి గుర్తింపు, మట్టి ఆరోగ్యం మరియు స్థానిక భాషలో మార్గదర్శనం అందిస్తుంది.",
    getStarted: "ప్రారంభించండి", watchDemo: "డెమో చూడండి", featuresTitle: "రైతుకు కావాల్సిన ప్రతిదీ ఒకే నమ్మకమైన వేదికలో.", featureLocked: "లాగిన్ అవసరం", loginTitle: "అన్ని ఫీచర్లను తెరవడానికి లాగిన్ చేయండి.", loginButton: "డ్యాష్‌బోర్డ్‌కి లాగిన్", dashTitle: "మీ పొలం ఇంటెలిజెన్స్ కేంద్రం", weatherTitle: "10 రోజుల వాతావరణం మరియు విత్తన సూచన", weatherButton: "వాతావరణ సలహా పొందండి", ctaTitle: "స్మార్ట్ వ్యవసాయ భవిష్యత్తులో ఈరోజే చేరండి."
  }),
  "pa-IN": pack({
    navHome: "ਘਰ", navFeatures: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ", navSolutions: "ਹੱਲ", navAbout: "ਬਾਰੇ", navContact: "ਸੰਪਰਕ", navLogin: "ਲਾਗਿਨ", navStarted: "ਸ਼ੁਰੂ ਕਰੋ",
    heroEyebrow: "ਆਧੁਨਿਕ ਭਾਰਤ ਲਈ ਭਵਿੱਖੀ ਖੇਤੀ", heroTitle: "AI ਚਲਿਤ ਸਮਝ ਨਾਲ ਕਿਸਾਨਾਂ ਨੂੰ ਸਮਰੱਥ ਬਣਾਉਣਾ", heroSubtitle: "ਕ੍ਰਿਸ਼ਿਗਿਆਨ ਕਿਸਾਨਾਂ ਨੂੰ ਫਸਲ ਫੈਸਲੇ, ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ, ਰੋਗ ਪਛਾਣ, ਮਿੱਟੀ ਸਿਹਤ ਅਤੇ ਸਥਾਨਕ ਭਾਸ਼ਾ ਵਿੱਚ ਸਲਾਹ ਦਿੰਦਾ ਹੈ।",
    getStarted: "ਸ਼ੁਰੂ ਕਰੋ", watchDemo: "ਡੇਮੋ ਵੇਖੋ", featuresTitle: "ਕਿਸਾਨ ਲਈ ਹਰ ਲੋੜ ਇੱਕ ਭਰੋਸੇਯੋਗ ਪਲੇਟਫਾਰਮ ਵਿੱਚ।", featureLocked: "ਲਾਗਿਨ ਲੋੜੀਂਦਾ", loginTitle: "ਸਾਰੀਆਂ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ ਖੋਲ੍ਹਣ ਲਈ ਲਾਗਿਨ ਕਰੋ।", loginButton: "ਡੈਸ਼ਬੋਰਡ ਵਿੱਚ ਲਾਗਿਨ", dashTitle: "ਤੁਹਾਡਾ ਖੇਤ ਇੰਟੈਲੀਜੈਂਸ ਕੇਂਦਰ", weatherTitle: "10 ਦਿਨਾਂ ਦਾ ਮੌਸਮ ਅਤੇ ਬਿਜਾਈ ਸਲਾਹ", weatherButton: "ਮੌਸਮ ਸਲਾਹ ਲਵੋ", ctaTitle: "ਅੱਜ ਹੀ ਸਮਾਰਟ ਖੇਤੀ ਦੇ ਭਵਿੱਖ ਨਾਲ ਜੁੜੋ।"
  }),
  "har-IN": pack({
    navHome: "होम", navFeatures: "सुविधा", navSolutions: "हल", navAbout: "बारे में", navContact: "संपर्क", navLogin: "लॉगिन", navStarted: "चालू करो",
    heroEyebrow: "नए जमाने की खेती", heroTitle: "AI की समझ तै किसानां नै मजबूत बनाणा", heroSubtitle: "कृषिज्ञान किसानां नै फसल फैसले, सरकारी योजना, रोग पहचान, मिट्टी सेहत अर अपनी बोली में सलाह देवे सै।",
    getStarted: "चालू करो", watchDemo: "डेमो देखो", featureLocked: "लॉगिन जरूरी", loginButton: "डैशबोर्ड खोलो", weatherButton: "मौसम सलाह लो", lockedMessage: "पहले रजिस्टर और लॉगिन करो, फेर सारे टूल डैशबोर्ड में खुलेंगे।"
  })
};

let kgActiveLanguage = localStorage.getItem("krishigyaanLanguage") || "en-IN";
let kgAudioMuted = localStorage.getItem("krishigyaanAudioMuted") === "true";
let kgManualLanguageLocked = localStorage.getItem("krishigyaanManualLanguage") === "true";
const kgBaseTexts = new Map();
const kgOriginalTextNodes = new WeakMap();
const kgOriginalAttrs = new WeakMap();
let kgOriginalTitle = document.title;
let kgLocalizationObserver;
let kgLocalizationQueued = false;
let kgWasOffline = !navigator.onLine;
const kgTranslationCache = JSON.parse(localStorage.getItem("krishigyaanTranslationCache") || "{}");
const kgAiCache = JSON.parse(localStorage.getItem("krishigyaanAiCache") || "{}");
const KG_OFFLINE_PREFIX = "krishigyaanOffline:";

function kgApiUrl(path) {
  if (window.location.protocol === "http:" || window.location.protocol === "https:") return path;
  return `http://127.0.0.1:5173${path}`;
}

function kgHashText(text) {
  let hash = 0;
  for (let index = 0; index < text.length; index++) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return String(hash);
}

function kgCurrentLanguageLabel(lang = kgActiveLanguage) {
  return KG_LANGUAGES[lang]?.label || "English";
}

function kgAiLanguageGuard(lang = kgActiveLanguage) {
  const label = kgCurrentLanguageLabel(lang);
  return [
    `Required response language: ${label} (${lang}).`,
    `You must answer only in ${label}.`,
    "Do not switch to English, Hindi, or any other language unless that exact language is selected.",
    "For Bhojpuri or Haryanvi, use simple Devanagari in that local dialect.",
    "Keep brand names, government scheme names, crop names, medicine names, numbers, and official abbreviations unchanged when needed."
  ].join(" ");
}

async function kgAiText(prompt, options = {}) {
  const responseLanguage = options.language || kgActiveLanguage;
  const guardedPrompt = `${kgAiLanguageGuard(responseLanguage)}\nDo not use markdown. Do not use asterisks or double asterisks anywhere.\n\n${prompt}`;
  const cacheKey = `ai:${responseLanguage}:${kgHashText(guardedPrompt)}`;
  if (kgAiCache[cacheKey]) return kgAiCache[cacheKey];

  const response = await fetch(kgApiUrl("/api/ai"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: guardedPrompt, maxTokens: options.maxTokens })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `AI request failed with status ${response.status}`);
  }

  const data = await response.json();
  const text = kgCleanAiText(data?.text || "");
  if (text) {
    kgAiCache[cacheKey] = text;
    localStorage.setItem("krishigyaanAiCache", JSON.stringify(kgAiCache));
  }
  return text;
}

function kgCleanAiText(text = "") {
  return String(text)
    .replace(/\*/g, "")
    .replace(/\u2022/g, "-")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function kgOfflineMessage(label = "this feature") {
  return `You are offline. Showing the last saved ${label} from this browser.`;
}

function kgSaveOfflineSnapshot(key, html) {
  if (!key || !html) return;
  try {
    localStorage.setItem(`${KG_OFFLINE_PREFIX}${key}`, JSON.stringify({
      html,
      savedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.warn("Offline snapshot could not be saved:", error);
  }
}

function kgGetOfflineSnapshot(key) {
  try {
    return JSON.parse(localStorage.getItem(`${KG_OFFLINE_PREFIX}${key}`) || "null");
  } catch {
    return null;
  }
}

function kgRenderOfflineSnapshot(target, key, label = "result", error) {
  const snapshot = kgGetOfflineSnapshot(key);
  if (!target || !snapshot?.html) return false;
  const savedAt = snapshot.savedAt ? new Date(snapshot.savedAt).toLocaleString("en-IN") : "earlier";
  target.innerHTML = `<div class="offline-banner"><strong>${kgOfflineMessage(label)}</strong><span>Saved: ${savedAt}</span>${error?.message ? `<small>${error.message}</small>` : ""}</div>${snapshot.html}`;
  return true;
}

function kgRegisterServiceWorker() {
  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") return;
  navigator.serviceWorker.register("/sw.js").catch((error) => {
    console.warn("Offline support could not be registered:", error);
  });
}

function kgShowReconnectPrompt() {
  if (document.getElementById("reconnectPrompt")) return;
  const overlay = document.createElement("div");
  overlay.id = "reconnectPrompt";
  overlay.className = "reconnect-prompt";
  overlay.innerHTML = `
    <div class="reconnect-card" role="dialog" aria-modal="true" aria-labelledby="reconnectTitle">
      <strong id="reconnectTitle">${kgTranslatePhrase("Internet connection detected")}</strong>
      <p>${kgTranslatePhrase("Reload page to use live AI, weather, crop health, and API features again.")}</p>
      <div>
        <button type="button" class="btn btn-primary" id="reloadOnlinePage">${kgTranslatePhrase("Reload page")}</button>
        <button type="button" class="btn btn-ghost" id="cancelOnlineReload">${kgTranslatePhrase("Cancel")}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById("reloadOnlinePage")?.addEventListener("click", () => window.location.reload());
  document.getElementById("cancelOnlineReload")?.addEventListener("click", () => overlay.remove());
}

function kgInitConnectionRecoveryPrompt() {
  window.addEventListener("offline", () => {
    kgWasOffline = true;
  });
  window.addEventListener("online", () => {
    if (!kgWasOffline) return;
    kgWasOffline = false;
    kgShowReconnectPrompt();
  });
}

function kgRefreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function kgPopulateLanguageSelects() {
  document.querySelectorAll("#voiceLanguage, #languageSelect, #loginLanguage").forEach((select) => {
    if (!select) return;
    select.innerHTML = Object.entries(KG_LANGUAGES).map(([code, meta]) => `<option value="${code}">${meta.label}</option>`).join("");
    select.value = kgActiveLanguage;
  });
}

function kgPredefinedPhrases(lang = kgActiveLanguage) {
  return window.KG_PREDEFINED_LOCALES?.phrases?.[lang] || {};
}

function kgTranslatePhrase(text, lang = kgActiveLanguage) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean || lang === "en-IN") return text;
  return kgPredefinedPhrases(lang)[clean] || text;
}

function kgWithOriginalSpacing(current, translated) {
  const prefix = String(current).match(/^\s*/)?.[0] || "";
  const suffix = String(current).match(/\s*$/)?.[0] || "";
  return `${prefix}${translated}${suffix}`;
}

function kgApplyPredefinedLocale(root = document.body) {
  const lang = kgActiveLanguage;
  const ignored = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG"]);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      const text = node.textContent.replace(/\s+/g, " ").trim();
      if (!text || !parent || ignored.has(parent.tagName) || parent.closest("[data-i18n], .voice-panel, .audio-mute-button, .go-top-button, pre")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    if (!kgOriginalTextNodes.has(node)) kgOriginalTextNodes.set(node, node.textContent);
    const original = kgOriginalTextNodes.get(node);
    const translated = lang === "en-IN" ? original : kgTranslatePhrase(original, lang);
    node.textContent = kgWithOriginalSpacing(original, translated);
  });

  const attrRoot = root.nodeType === Node.ELEMENT_NODE ? root : document;
  attrRoot.querySelectorAll?.("[placeholder], [title], [aria-label]").forEach((node) => {
    if (node.hasAttribute("data-i18n-placeholder")) return;
    let originals = kgOriginalAttrs.get(node);
    if (!originals) {
      originals = {};
      kgOriginalAttrs.set(node, originals);
    }
    ["placeholder", "title", "aria-label"].forEach((attr) => {
      if (!node.hasAttribute(attr)) return;
      if (!originals[attr]) originals[attr] = node.getAttribute(attr);
      const original = originals[attr];
      node.setAttribute(attr, lang === "en-IN" ? original : kgTranslatePhrase(original, lang));
    });
  });

  document.title = lang === "en-IN" ? kgOriginalTitle : kgTranslatePhrase(kgOriginalTitle, lang);
}

function kgQueuePredefinedLocale() {
  if (kgLocalizationQueued) return;
  kgLocalizationQueued = true;
  window.requestAnimationFrame(() => {
    kgLocalizationQueued = false;
    kgApplyPredefinedLocale();
  });
}

function kgStartLocaleObserver() {
  if (kgLocalizationObserver) return;
  kgLocalizationObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.addedNodes.length || mutation.type === "childList")) kgQueuePredefinedLocale();
  });
  kgLocalizationObserver.observe(document.body, { childList: true, subtree: true });
}

function kgApplyLanguage(lang) {
  kgActiveLanguage = KG_TRANSLATIONS[lang] ? lang : "en-IN";
  localStorage.setItem("krishigyaanLanguage", kgActiveLanguage);
  const dictionary = KG_TRANSLATIONS[kgActiveLanguage] || KG_EN;
  document.documentElement.lang = kgActiveLanguage.split("-")[0];
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    const english = KG_EN[key] || kgBaseTexts.get(key) || node.textContent;
    node.textContent = kgActiveLanguage === "en-IN" ? english : kgTranslatePhrase(english, kgActiveLanguage) || dictionary[key] || english;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.dataset.i18nPlaceholder;
    const english = KG_EN[key] || node.getAttribute("placeholder") || "";
    node.setAttribute("placeholder", kgActiveLanguage === "en-IN" ? english : kgTranslatePhrase(english, kgActiveLanguage) || dictionary[key] || english);
  });
  kgPopulateLanguageSelects();
  kgUpdateDetectLanguageButton();
  kgApplyPredefinedLocale();
  window.dispatchEvent(new CustomEvent("kg-language-change", { detail: { language: kgActiveLanguage } }));
}

function kgApplyManualLanguage(lang) {
  kgManualLanguageLocked = true;
  localStorage.setItem("krishigyaanManualLanguage", "true");
  kgApplyLanguage(lang);
}

function kgUpdateDetectLanguageButton() {
  const button = document.getElementById("detectLanguageButton");
  if (!button) return;
  const label = kgTranslatePhrase("Detect language");
  button.textContent = label;
  button.setAttribute("aria-label", label);
  button.setAttribute("title", label);
}

function kgEnsureLanguageDetectControl() {
  const panel = document.querySelector(".voice-panel");
  if (!panel || document.getElementById("detectLanguageButton")) {
    kgUpdateDetectLanguageButton();
    return;
  }
  const button = document.createElement("button");
  button.type = "button";
  button.id = "detectLanguageButton";
  button.className = "detect-language-button";
  button.addEventListener("click", () => kgUseDetectedLanguage());
  panel.appendChild(button);
  kgUpdateDetectLanguageButton();
}

async function kgTranslateMissingPageText(lang) {
  if (lang === "en-IN") return;
  const label = KG_LANGUAGES[lang]?.label || "Hindi";
  const dictionary = KG_TRANSLATIONS[lang] || KG_EN;
  const keys = [...new Set([...document.querySelectorAll("[data-i18n]")].map((node) => node.dataset.i18n))];
  const missing = keys.filter((key) => KG_EN[key] && (!dictionary[key] || dictionary[key] === KG_EN[key]));
  const cacheKey = `${lang}:static`;
  const cached = kgTranslationCache[cacheKey] || {};

  Object.entries(cached).forEach(([key, value]) => {
    document.querySelectorAll(`[data-i18n="${key}"]`).forEach((node) => {
      node.textContent = value;
    });
  });

  const toTranslate = missing.filter((key) => !cached[key]).slice(0, 140);
  if (!toTranslate.length) return;

  try {
    const payload = Object.fromEntries(toTranslate.map((key) => [key, KG_EN[key]]));
    const prompt = `Translate every value in this JSON into ${label}. Keep the same JSON keys. Return only valid JSON. Use farmer-friendly, simple local language. Do not leave any value in English unless it is a brand name or technical abbreviation.\n${JSON.stringify(payload)}`;
    const text = await kgAiText(prompt);
    const jsonText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const translated = JSON.parse(jsonText);
    kgTranslationCache[cacheKey] = { ...cached, ...translated };
    localStorage.setItem("krishigyaanTranslationCache", JSON.stringify(kgTranslationCache));
    Object.entries(translated).forEach(([key, value]) => {
      document.querySelectorAll(`[data-i18n="${key}"]`).forEach((node) => {
        node.textContent = value;
      });
    });
  } catch (error) {
    console.warn("KrishiBaba translation fallback failed:", error);
  }
}

async function kgTranslateLooseUiText(lang) {
  if (lang === "en-IN") return;
  const label = KG_LANGUAGES[lang]?.label || "Hindi";
  const optionNodes = [...document.querySelectorAll("option")].filter((node) => !Object.values(KG_LANGUAGES).some((meta) => meta.label === node.textContent.trim()));
  const placeholderNodes = [...document.querySelectorAll("input[placeholder], textarea[placeholder]")];
  const phrases = [
    ...optionNodes.map((node) => node.textContent.trim()),
    ...placeholderNodes.map((node) => node.getAttribute("placeholder") || "")
  ].filter(Boolean);
  const unique = [...new Set(phrases)].filter((phrase) => !/^(KrishiGyaan|Piyush|Abhay|Bhagyalakshmi|Preeti)$/i.test(phrase));
  if (!unique.length) return;

  const cacheKey = `${lang}:loose`;
  const cached = kgTranslationCache[cacheKey] || {};
  const applyLoose = (map) => {
    optionNodes.forEach((node) => {
      const original = node.textContent.trim();
      if (map[original]) node.textContent = map[original];
    });
    placeholderNodes.forEach((node) => {
      const original = node.getAttribute("placeholder") || "";
      if (map[original]) node.setAttribute("placeholder", map[original]);
    });
  };
  applyLoose(cached);

  const toTranslate = unique.filter((phrase) => !cached[phrase]).slice(0, 120);
  if (!toTranslate.length) return;

  try {
    const prompt = `Translate these UI phrases into ${label}. Return only valid JSON where each original phrase is the key and the translated phrase is the value. Preserve brand names, person names, phone formats, crop names when appropriate, and technical abbreviations.\n${JSON.stringify(toTranslate)}`;
    const text = await kgAiText(prompt);
    const jsonText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const translated = JSON.parse(jsonText);
    kgTranslationCache[cacheKey] = { ...cached, ...translated };
    localStorage.setItem("krishigyaanTranslationCache", JSON.stringify(kgTranslationCache));
    applyLoose(translated);
  } catch (error) {
    console.warn("KrishiBaba loose UI translation failed:", error);
  }
}

function kgSplitSpeechText(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 220) return [clean];
  const parts = clean.match(/[^.!?।]+[.!?।]?/g) || [clean];
  const chunks = [];
  let current = "";
  for (const part of parts) {
    const next = `${current} ${part}`.trim();
    if (next.length > 220 && current) {
      chunks.push(current);
      current = part.trim();
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function kgSpeak(text, lang = kgActiveLanguage) {
  if (kgAudioMuted || !text || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  kgRefreshVoiceList();
  const speechLang = kgSpeechLang(lang);
  const voice = kgBestVoice(lang);
  const chunks = kgSplitSpeechText(text);
  const button = document.getElementById("audioMuteButton");
  button?.classList.add("speaking");
  const speakChunk = (index = 0) => {
    if (index >= chunks.length) {
      button?.classList.remove("speaking");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.lang = speechLang;
    utterance.voice = voice;
    utterance.rate = speechLang.startsWith("en") ? 0.9 : 0.82;
    utterance.pitch = 1;
    utterance.onend = () => speakChunk(index + 1);
    utterance.onerror = () => button?.classList.remove("speaking");
    window.speechSynthesis.speak(utterance);
  };
  speakChunk();
}

function kgUpdateMuteButton() {
  const button = document.getElementById("audioMuteButton");
  if (!button) return;
  const ariaLabel = kgAudioMuted ? kgTranslatePhrase("Unmute audio") : kgTranslatePhrase("Mute audio");
  button.innerHTML = kgAudioMuted ? '<i data-lucide="volume-x"></i>' : '<i data-lucide="volume-2"></i>';
  button.setAttribute("aria-label", ariaLabel);
  button.setAttribute("title", ariaLabel);
  button.classList.toggle("muted", kgAudioMuted);
  kgRefreshIcons();
}

function kgToggleAudioMute() {
  kgAudioMuted = !kgAudioMuted;
  localStorage.setItem("krishigyaanAudioMuted", String(kgAudioMuted));
  if (kgAudioMuted && "speechSynthesis" in window) window.speechSynthesis.cancel();
  kgUpdateMuteButton();
}

function kgEnsureAudioControls() {
  if (!document.getElementById("audioMuteButton")) {
    const button = document.createElement("button");
    button.type = "button";
    button.id = "audioMuteButton";
    button.className = "audio-mute-button";
    button.addEventListener("click", kgToggleAudioMute);
    document.body.appendChild(button);
  }
  kgUpdateMuteButton();
}

function kgEnsureHomeTopButton() {
  if (document.body.dataset.page !== "landing" || document.getElementById("goTopButton")) return;
  const button = document.createElement("button");
  button.type = "button";
  button.id = "goTopButton";
  button.className = "go-top-button";
  button.setAttribute("aria-label", kgTranslatePhrase("Go to top"));
  button.innerHTML = `<i data-lucide="arrow-up"></i><span>${kgTranslatePhrase("Top")}</span>`;
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => button.classList.toggle("visible", window.scrollY > 500), { passive: true });
  document.body.appendChild(button);
}

function kgCollectReadableText(scope = document.body) {
  const ignored = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "INPUT", "SELECT", "TEXTAREA"]);
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.textContent.replace(/\s+/g, " ").trim();
      const parent = node.parentElement;
      if (!text || !parent || ignored.has(parent.tagName) || parent.closest(".voice-panel")) return NodeFilter.FILTER_REJECT;
      const style = window.getComputedStyle(parent);
      if (style.display === "none" || style.visibility === "hidden") return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const parts = [];
  while (walker.nextNode()) parts.push(walker.currentNode.textContent.replace(/\s+/g, " ").trim());
  return [...new Set(parts)].join(". ");
}

function kgCollectClickedText(target) {
  const ignored = "input, textarea, select, option, svg, path, .voice-panel";
  if (!target || target.closest(ignored)) return "";
  const readable = target.closest("h1, h2, h3, h4, h5, h6, p, span, strong, small, label, button, a, li, summary, td, th, .diagnosis-row, .scheme-card, .analytics-card, .feature-card, .step-card, .stat-card");
  if (!readable || readable.closest(".voice-panel")) return "";
  const text = readable.textContent.replace(/\s+/g, " ").trim();
  return text.length > 420 ? `${text.slice(0, 420).trim()}...` : text;
}

function kgLanguageForState(state = "") {
  const s = state.toLowerCase();
  if (s.includes("bihar")) return "bho-IN";
  if (s.includes("gujarat")) return "gu-IN";
  if (s.includes("maharashtra")) return "mr-IN";
  if (s.includes("karnataka")) return "kn-IN";
  if (s.includes("tamil")) return "ta-IN";
  if (s.includes("telangana") || s.includes("andhra")) return "te-IN";
  if (s.includes("haryana")) return "har-IN";
  if (s.includes("punjab")) return "pa-IN";
  if (s.includes("uttar pradesh") || s.includes("madhya pradesh") || s.includes("rajasthan") || s.includes("delhi") || s.includes("uttarakhand") || s.includes("jharkhand") || s.includes("chhattisgarh") || s.includes("himachal")) return "hi-IN";
  return "hi-IN";
}

function kgLanguageForCoords(lat, lon) {
  if (lat >= 24 && lat <= 27.8 && lon >= 83 && lon <= 88.6) return { lang: "bho-IN", state: "Bihar" };
  if (lat >= 20 && lat <= 24.9 && lon >= 68 && lon <= 74.8) return { lang: "gu-IN", state: "Gujarat" };
  if (lat >= 15.5 && lat <= 22.2 && lon >= 72.5 && lon <= 81) return { lang: "mr-IN", state: "Maharashtra" };
  if (lat >= 11.5 && lat <= 18.8 && lon >= 74 && lon <= 78.8) return { lang: "kn-IN", state: "Karnataka" };
  if (lat >= 8 && lat <= 13.8 && lon >= 76 && lon <= 80.5) return { lang: "ta-IN", state: "Tamil Nadu" };
  if (lat >= 12.5 && lat <= 19.9 && lon >= 77 && lon <= 85.5) return { lang: "te-IN", state: "Telugu region" };
  if (lat >= 27 && lat <= 30.9 && lon >= 74.2 && lon <= 77.7) return { lang: "har-IN", state: "Haryana" };
  if (lat >= 29 && lat <= 32.7 && lon >= 73.5 && lon <= 77.2) return { lang: "pa-IN", state: "Punjab" };
  return { lang: "hi-IN", state: "India" };
}

async function kgReverseGeocodeState(latitude, longitude) {
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`);
    if (!response.ok) throw new Error("Reverse geocoding failed");
    const data = await response.json();
    const first = data?.results?.[0];
    if (first?.admin1) return { state: first.admin1, place: [first.name, first.admin1, first.country].filter(Boolean).join(", ") };
  } catch (error) {
    console.warn("Reverse geocoding failed, using coordinate mapping:", error);
  }
  const locale = kgLanguageForCoords(latitude, longitude);
  return { state: locale.state, place: locale.state };
}

async function kgApplyLocationLanguage(latitude, longitude) {
  if (kgManualLanguageLocked) return;
  const geo = await kgReverseGeocodeState(latitude, longitude);
  const lang = kgLanguageForState(geo.state);
  localStorage.setItem("krishigyaanLocation", JSON.stringify({ latitude, longitude, state: geo.state, place: geo.place, language: lang }));
  kgApplyLanguage(lang);
  const stateInput = document.getElementById("stateInput");
  const latInput = document.getElementById("latitudeInput");
  const lonInput = document.getElementById("longitudeInput");
  if (stateInput && !stateInput.value) stateInput.value = geo.state;
  if (latInput && !latInput.value) latInput.value = latitude.toFixed(4);
  if (lonInput && !lonInput.value) lonInput.value = longitude.toFixed(4);
  document.body.dataset.detectedLanguage = lang;
  document.body.dataset.detectedState = geo.state;
  kgSpeak(`${(KG_TRANSLATIONS[kgActiveLanguage] || KG_EN).locationDetected} ${geo.place}.`, kgActiveLanguage);
}

function kgAskLocationAndLocalize({ force = false } = {}) {
  if (kgManualLanguageLocked && !force) return;
  const saved = JSON.parse(localStorage.getItem("krishigyaanLocation") || "null");
  if (saved?.language) {
    kgApplyLanguage(saved.language);
    return;
  }
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      kgApplyLocationLanguage(latitude, longitude);
    },
    () => kgSpeak((KG_TRANSLATIONS[kgActiveLanguage] || KG_EN).locationDenied, kgActiveLanguage),
    { enableHighAccuracy: false, timeout: 12000, maximumAge: 3600000 }
  );
}

function kgUseDetectedLanguage() {
  kgManualLanguageLocked = false;
  localStorage.removeItem("krishigyaanManualLanguage");
  kgAskLocationAndLocalize({ force: true });
}

function kgInitShared({ askLocation = true } = {}) {
  kgRegisterServiceWorker();
  kgInitConnectionRecoveryPrompt();
  kgRefreshVoiceList();
  if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = kgRefreshVoiceList;
  document.querySelectorAll("[data-i18n]").forEach((node) => kgBaseTexts.set(node.dataset.i18n, node.textContent.trim()));
  kgPopulateLanguageSelects();
  kgApplyLanguage(kgActiveLanguage);
  kgEnsureLanguageDetectControl();
  kgEnsureAudioControls();
  kgEnsureHomeTopButton();
  kgStartLocaleObserver();
  kgRefreshIcons();
  document.querySelectorAll("#voiceLanguage, #languageSelect, #loginLanguage").forEach((select) => {
    select?.addEventListener("change", (event) => kgApplyManualLanguage(event.target.value));
  });
  navigator.permissions?.query?.({ name: "geolocation" }).then((permission) => {
    if (permission.state === "granted") kgAskLocationAndLocalize();
    permission.onchange = () => {
      if (permission.state === "granted") kgAskLocationAndLocalize();
    };
  }).catch(() => {});
  document.addEventListener("click", (event) => {
    const target = event.target.closest(".speakable, [data-i18n], h1, h2, h3, h4, p, span, strong, small, label, button, a, li, summary, .diagnosis-row, .scheme-card, .analytics-card, .feature-card");
    const text = kgCollectClickedText(target);
    if (text) kgSpeak(text, kgActiveLanguage);
  });
  if (askLocation) kgAskLocationAndLocalize();
}
