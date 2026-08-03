const profile = JSON.parse(localStorage.getItem("krishigyaanFarmerProfile") || "{}");
const savedLocation = JSON.parse(localStorage.getItem("krishigyaanLocation") || "null");
const weatherBtn = document.getElementById("weatherBtn");
const weatherResult = document.getElementById("weatherResult");
const longTermResult = document.getElementById("longTermResult");
const cropAdvice = document.getElementById("cropAdvice");
const cropImageInput = document.getElementById("cropImageInput");
const cropResult = document.getElementById("cropResult");
const detectBtn = document.getElementById("detectBtn");
const chatForm = document.getElementById("chatForm");
const chatQuestion = document.getElementById("chatQuestion");
const chatSubmitBtn = document.getElementById("chatSubmitBtn");
const chatValidation = document.getElementById("chatValidation");
const chatAnswer = document.getElementById("chatAnswer");
const modernBtn = document.getElementById("modernBtn");
const modernResult = document.getElementById("modernResult");
const speechToTextBtn = document.getElementById("speechToTextBtn");
const speechStatus = document.getElementById("speechStatus");
const soilImageInput = document.getElementById("soilImageInput");
const soilBtn = document.getElementById("soilBtn");
const soilResult = document.getElementById("soilResult");
const schemeMatcher = document.getElementById("schemeMatcher");
const schemeChatForm = document.getElementById("schemeChatForm");
const schemeQuestion = document.getElementById("schemeQuestion");
const schemeChatSubmitBtn = document.getElementById("schemeChatSubmitBtn");
const schemeChatValidation = document.getElementById("schemeChatValidation");
const schemeDraftSelect = document.getElementById("schemeDraftSelect");
const schemeDraftType = document.getElementById("schemeDraftType");
const schemeDraftLanguage = document.getElementById("schemeDraftLanguage");
const schemeDraftBtn = document.getElementById("schemeDraftBtn");
const schemeAssistantResult = document.getElementById("schemeAssistantResult");
const draftPhone = document.getElementById("draftPhone");
const draftAge = document.getElementById("draftAge");
const printDraftBtn = document.getElementById("printDraftBtn");
const schemeSpeechBtn = document.getElementById("schemeSpeechBtn");
const schemeSpeechStatus = document.getElementById("schemeSpeechStatus");
const cropScoreMetric = document.getElementById("cropScore");
const moistureMetric = document.getElementById("moistureStatus");
const weatherRiskMetric = document.getElementById("weatherRisk");
const schemeMatchesMetric = document.getElementById("schemeMatches");
let speechMicStream = null;
let schemeChatBusy = false;
const dashboardSignals = {
  profileScore: 0,
  schemeMatches: 0,
  weather: null,
  diseaseScore: null,
  soilScore: null
};

const SCHEME_DRAFT_LANGUAGE_CODES = ["hi-IN", "en-IN", "gu-IN", "mr-IN", "kn-IN", "ta-IN", "te-IN"];

const schemes = [
  {
    title: "PM-Kisan Samman Nidhi",
    link: "https://pmkisan.gov.in/",
    summary: "Income support for eligible cultivable landholding farmer families, subject to the scheme's exclusion rules and verification.",
    benefit: "Rs 6,000 per year in three DBT installments to an Aadhaar-seeded bank account after land record and e-KYC checks.",
    check: (p) => hasLand(p) && p.bank !== "No",
    reason: "Your profile shows land access and bank readiness. The official portal must verify land records, Aadhaar linking, e-KYC, and exclusions."
  },
  {
    title: "Pradhan Mantri Fasal Bima Yojana",
    link: "https://pmfby.gov.in/",
    summary: "Voluntary crop insurance for notified crops and seasons in participating States and Union Territories.",
    benefit: "Insurance protection against notified crop risks with subsidized farmer premiums and claim support.",
    check: (p) => Boolean(p.primaryCrop && (p.season || p.sowingDate)),
    reason: "Your crop and season details can be checked against current state notifications on the official PMFBY portal."
  },
  {
    title: "Kisan Credit Card",
    link: "https://fasalrin.gov.in/",
    summary: "Institutional credit for crop production, post-harvest expenses, farm maintenance, and allied agricultural activities.",
    benefit: "Flexible short-term farm credit; the sanctioned limit, interest support, security, and documents depend on the lending bank.",
    check: (p) => hasLand(p) || Boolean(p.primaryCrop),
    reason: "Your farm or crop profile indicates that KCC information may be useful. Applications are submitted through participating banks."
  },
  {
    title: "Pradhan Mantri Kisan Maan Dhan Yojana",
    link: "https://rules.myscheme.gov.in/en/check-eligibility/pmkmy?source=myscheme",
    summary: "A voluntary contributory pension scheme for eligible small and marginal landholding farmers aged 18 to 40.",
    benefit: "Minimum assured pension of Rs 3,000 per month after age 60, subject to enrollment, contributions, and scheme conditions.",
    check: (p) => hasLand(p) && Number(p.age) >= 18 && Number(p.age) <= 40 && (!landAcres(p) || landAcres(p) <= 4.94),
    reason: "Your age and land profile indicate a possible match. Use the official eligibility check for exclusions and contribution details."
  },
  {
    title: "Agriculture Infrastructure Fund",
    link: "https://agriinfra.dac.gov.in/",
    summary: "Financing support for eligible post-harvest infrastructure and community farming assets.",
    benefit: "Interest subvention of 3% per year and credit-guarantee support for eligible loans up to Rs 2 crore, subject to scheme rules.",
    check: (p) => hasLand(p) && (isLargeEnough(p, 1) || isHorticultureCrop(p) || hasIrrigation(p)),
    reason: "Potentially relevant for storage, primary processing, value addition, or community farming infrastructure projects."
  },
  {
    title: "Per Drop More Crop",
    link: "https://bhuvan-app1.nrsc.gov.in/pdmc/",
    summary: "Micro-irrigation support for efficient farm-water use through drip, sprinkler, and related water-management systems.",
    benefit: "State-implemented financial assistance for approved micro-irrigation components; rates and application windows vary by state.",
    check: (p) => hasLand(p) && Boolean(p.irrigation),
    reason: "Your land and irrigation details make this worth checking with your State Agriculture or Horticulture Department."
  },
  {
    title: "Mission for Integrated Development of Horticulture",
    link: "https://midh.gov.in/",
    summary: "Support for fruits, vegetables, spices, flowers, plantation crops, nurseries, protected cultivation, and post-harvest management.",
    benefit: "Assistance is delivered through state horticulture missions for approved activities, costs, and beneficiary categories.",
    check: (p) => isHorticultureCrop(p),
    reason: "Your registered crop appears horticulture-related. Check the official portal and your State Horticulture Department."
  },
  {
    title: "National Mission on Natural Farming",
    link: "https://www.india.gov.in/category/agriculture-rural-environment/subcategory/agriculture-ecosystem/details/website-of-national-mission-on-natural-farming",
    summary: "A national mission supporting chemical-free, livestock-integrated, location-specific natural farming practices and farmer training.",
    benefit: "Capacity building, local support systems, demonstrations, and handholding through state-led implementation.",
    check: (p) => hasLand(p) && (/organic|compost|natural|bio/i.test(JSON.stringify(p)) || Boolean(p.primaryCrop)),
    reason: "Your crop and land profile can be used to ask the local agriculture department about current natural-farming enrollment."
  },
  {
    title: "RKVY Soil Health and Fertility - Soil Health Card",
    link: "https://soilhealth.dac.gov.in/",
    summary: "Soil testing and soil-health records covering key nutrient indicators with crop-wise fertilizer recommendations.",
    benefit: "A soil health report and nutrient guidance through the official programme and participating soil-testing facilities.",
    check: (p) => hasLand(p) || Boolean(p.soilType),
    reason: "Your land or soil profile makes a laboratory-backed Soil Health Card relevant."
  },
  {
    title: "e-NAM Farmer Market Access",
    link: "https://enam.gov.in/web/",
    summary: "The national electronic agriculture market connects participating mandis for price discovery and online agricultural trade.",
    benefit: "Market information, transparent bidding, and access to participating e-NAM mandis after required farmer registration.",
    check: (p) => Boolean(p.primaryCrop || p.harvest),
    reason: "Your crop or harvest information makes the official e-NAM market portal useful before selling produce."
  }
];

function hasLand(p) {
  return Boolean(p.landSize || p.ownership === "Owned" || p.ownership === "Leased" || p.ownership === "Shared");
}

function isLargeEnough(p, acres) {
  return landAcres(p) >= acres;
}

function landAcres(p) {
  const match = String(p.landSize || "").match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

function hasIrrigation(p) {
  return Boolean(p.irrigation && p.irrigation !== "Rainfed");
}

function isHorticultureCrop(p) {
  return /vegetable|fruit|flower|spice|mango|banana|orange|grape|tomato|onion|potato|chilli|pepper|turmeric|ginger|coconut|cashew|horticulture/i.test(`${p.primaryCrop || ""} ${p.problem || ""}`);
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function calculateProfileScore() {
  const fields = ["fullName", "mobile", "age", "state", "district", "village", "landSize", "ownership", "soilType", "irrigation", "primaryCrop", "season", "sowingDate", "bank", "pmkisan"];
  const filled = fields.filter((field) => String(profile[field] || "").trim()).length;
  return clampScore((filled / fields.length) * 100);
}

function weatherPenalty(weather) {
  if (!weather) return 8;
  if (weather.risk === "Storm") return 35;
  if (weather.risk === "Heat" || weather.risk === "Rain") return 25;
  if (weather.risk === "Wind" || weather.risk === "Moderate") return 16;
  return 6;
}

function updateDashboardMetrics() {
  dashboardSignals.profileScore = calculateProfileScore();
  if (schemeMatchesMetric) schemeMatchesMetric.textContent = String(dashboardSignals.schemeMatches);
  if (weatherRiskMetric) weatherRiskMetric.textContent = dashboardSignals.weather?.risk || "Check";
  if (moistureMetric) moistureMetric.textContent = dashboardSignals.weather?.moisture || (dashboardSignals.soilScore ? soilMoistureFromScore(dashboardSignals.soilScore) : "Check");

  const weighted = [];
  if (dashboardSignals.diseaseScore !== null) weighted.push({ value: dashboardSignals.diseaseScore, weight: 0.42 });
  if (dashboardSignals.soilScore !== null) weighted.push({ value: dashboardSignals.soilScore, weight: 0.28 });
  if (dashboardSignals.weather) weighted.push({ value: 100 - weatherPenalty(dashboardSignals.weather), weight: 0.2 });
  if (!weighted.length) {
    if (cropScoreMetric) cropScoreMetric.textContent = "Check";
    return;
  }
  weighted.push({ value: dashboardSignals.profileScore, weight: 0.1 });

  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  const score = clampScore(weighted.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight);
  if (cropScoreMetric) cropScoreMetric.textContent = `${score}%`;
}

function soilMoistureFromScore(score) {
  if (score < 40) return "Low";
  if (score < 60) return "Moderate";
  return "Good";
}

function calculateDiseaseScore(data) {
  const health = getHealthPayload(data);
  const diseases = getDiseaseSuggestions(data);
  const isPlant = data?.result?.is_plant || data?.result?.is_plant_probability ? data.result.is_plant : null;
  const isHealthy = health?.is_healthy;
  const topDiseaseProbability = diseases.length ? Math.max(...diseases.map((item) => Number(item.probability || 0))) : 0;
  let score = 88 - topDiseaseProbability * 72;

  if (isHealthy?.binary === true) score = Math.max(score, 72 + Number(isHealthy.probability || 0) * 24);
  if (isHealthy?.binary === false) score = Math.min(score, 58 - Number(isHealthy.probability || 0) * 18);
  if (isPlant?.binary === false) score = Math.min(score, 20);
  if (!diseases.length && isHealthy?.binary !== false) score = Math.max(score, 82);

  return clampScore(score);
}

function hasActionableDisease(data) {
  const health = getHealthPayload(data);
  const diseases = getDiseaseSuggestions(data);
  return diseases.length > 0 || health?.is_healthy?.binary === false;
}

function calculateWeatherMetrics(days, longTerm = null) {
  const rainTotal = days.reduce((sum, day) => sum + day.rain, 0);
  const rainyDays = days.filter((day) => day.rain > 4).length;
  const avgMax = days.reduce((sum, day) => sum + day.max, 0) / days.length;
  const maxWind = Math.max(...days.map((day) => day.wind || 0));
  const stormDays = days.filter((day) => [95, 96, 99].includes(day.code)).length;
  const avgSoilMoisture = longTerm?.daily?.soil_moisture_0_to_7cm_mean?.length
    ? longTerm.daily.soil_moisture_0_to_7cm_mean.reduce((sum, value) => sum + (value || 0), 0) / longTerm.daily.soil_moisture_0_to_7cm_mean.length
    : null;
  let risk = "Low";
  if (stormDays > 0) risk = "Storm";
  else if (rainTotal > 55 || rainyDays >= 4) risk = "Rain";
  else if (avgMax > 36 && rainTotal < 20) risk = "Heat";
  else if (maxWind > 32) risk = "Wind";
  else if (rainyDays >= 2 || avgMax > 34) risk = "Moderate";

  let moisture = "Good";
  if (avgSoilMoisture !== null) {
    if (avgSoilMoisture < 0.18) moisture = "Low";
    else if (avgSoilMoisture > 0.36) moisture = "High";
  } else if (rainTotal > 55 || rainyDays >= 4) {
    moisture = "High";
  } else if (avgMax > 36 && rainTotal < 20) {
    moisture = "Low";
  } else if (rainTotal < 12) {
    moisture = "Moderate";
  }

  return { risk, moisture, rainTotal, rainyDays, avgMax, maxWind, stormDays, avgSoilMoisture };
}

function guardDashboard() {
  if (localStorage.getItem("krishigyaanLoggedIn") !== "true") {
    window.location.href = "login.html";
  }
}

function summarizeProfile() {
  const name = profile.fullName || "Farmer";
  const crop = profile.primaryCrop || "your crop";
  const state = profile.state || savedLocation?.state || "your region";
  const land = profile.landSize || "registered land";
  const profileSummary = document.getElementById("profileSummary");
  if (profileSummary) profileSummary.textContent = `${name}, KrishiGyaan is preparing advice for ${crop} on ${land} in ${state}. Use weather advisory first for crop-stage decisions.`;
}

function uiText(text) {
  return kgTranslatePhrase(text, kgActiveLanguage);
}

function renderSchemes() {
  if (!schemeMatcher) return;
  const eligibleCount = schemes.filter((scheme) => scheme.check(profile)).length;
  dashboardSignals.schemeMatches = eligibleCount;
  updateDashboardMetrics();
  const rows = schemes.map((scheme) => {
    const eligible = Boolean(scheme.check(profile));
    return `
      <article class="scheme-card ${eligible ? "eligible" : "not-eligible"} speakable">
        <div>
          <span class="scheme-status">${eligible ? "Potential match" : "Check eligibility"}</span>
          <h3>${uiText(scheme.title)}</h3>
          <p>${uiText(scheme.summary)}</p>
          <p><b>${uiText("Scheme support:")}</b> ${uiText(scheme.benefit)}</p>
          <small>${uiText(scheme.reason)}</small>
        </div>
        <a class="btn ${eligible ? "btn-primary" : "btn-ghost"}" href="${scheme.link}" target="_blank" rel="noopener noreferrer">Official portal</a>
      </article>
    `;
  }).join("");

  schemeMatcher.innerHTML = `<div class="scheme-summary"><strong>${eligibleCount}</strong><span>potential matches from your profile <small>Official links reviewed August 2026</small></span></div><div class="scheme-grid">${rows}</div>`;
  renderSchemeDraftOptions();
}

function eligibleSchemes() {
  return schemes.filter((scheme) => scheme.check(profile));
}

function renderSchemeDraftOptions() {
  if (!schemeDraftSelect) return;
  const eligible = eligibleSchemes();
  schemeDraftSelect.innerHTML = eligible.length
    ? eligible.map((scheme) => `<option value="${scheme.title}">${uiText(scheme.title)}</option>`).join("")
    : `<option value="">${uiText("No eligible scheme yet")}</option>`;
  if (schemeDraftLanguage) {
    schemeDraftLanguage.innerHTML = SCHEME_DRAFT_LANGUAGE_CODES
      .map((code) => `<option value="${code}">${KG_LANGUAGES[code].label}</option>`)
      .join("");
    schemeDraftLanguage.value = "en-IN";
  }
  schemeDraftBtn.disabled = !eligible.length;
  if (draftPhone) draftPhone.value = profile.mobile || "";
  if (draftAge) draftAge.value = profile.age || "";
}

function draftFormatGuide(type) {
  const guides = {
    "Application letter": [
      "Use this exact structure:",
      "Date: __________",
      "To,",
      "The Officer / Manager,",
      "Relevant Department / Bank / Institution",
      "Address: __________",
      "Subject: Application for [scheme name without brackets]",
      "Respected Sir/Madam,",
      "Body paragraphs using farmer details and scheme purpose.",
      "Farmer Details: Name, mobile, age, village, district, state, land size, crop, bank status.",
      "Required Documents: list scheme-specific documents.",
      "Declaration paragraph.",
      "Yours faithfully,",
      "Name and signature line."
    ].join("\n"),
    "Simple application form": [
      "Create a clean fillable form with labeled rows.",
      "Include scheme name, applicant name, mobile, age, address, village, district, state, land size, ownership, crop, season, bank linked, PM-KISAN status, purpose, required documents, declaration, signature.",
      "Use one field per line in this pattern: Field Name: value or __________."
    ].join("\n"),
    "Affidavit format": [
      "Create a simple affidavit format.",
      "Include title, applicant identity, address, land/crop details, scheme purpose, declarations in numbered points, verification statement, place, date, signature, witness lines.",
      "Use formal affidavit wording but keep it farmer-friendly."
    ].join("\n"),
    "Document checklist": [
      "Create a scheme-specific checklist grouped by Applicant Details, Land/Farm Proof, Bank/Identity Proof, Crop/Scheme Proof, Submission Notes.",
      "Use dash bullets only. Do not use checkbox brackets.",
      "Mark unknown details with __________."
    ].join("\n"),
    "Grievance letter": [
      "Use formal grievance letter format with date, recipient, subject, reference details, issue description, requested action, farmer details, enclosure list, closing, signature.",
      "Keep the complaint specific to the selected scheme."
    ].join("\n"),
    "Follow-up letter": [
      "Use formal follow-up letter format with date, recipient, subject, previous application/reference line, current request, farmer details, enclosure list, closing, signature.",
      "Mention blanks for reference number/date if unavailable."
    ].join("\n")
  };
  return guides[type] || guides["Application letter"];
}

function cleanDraftText(text) {
  return text
    .replace(/\*/g, "")
    .replace(/\[([^\]]+)\]/g, "__________")
    .replace(/\(([A-Za-z][A-Za-z\s/.-]{2,})\)/g, "__________")
    .replace(/\{[^}]+\}/g, "__________")
    .replace(/<[^>]+>/g, "__________")
    .replace(/Current Date/gi, "__________")
    .replace(/Bank Name\/Financial Institution Name/gi, "__________")
    .replace(/Branch Address/gi, "__________")
    .replace(/City, State, Pin Code/gi, "__________")
    .trim();
}

function renderAiText(text = "") {
  return kgCleanAiText(text).replace(/\n/g, "<br>");
}

function isOfflineLikeError(error) {
  return !navigator.onLine || /failed to fetch|network|offline|load failed/i.test(error?.message || "");
}

function saveDashboardSnapshot(key, element) {
  if (element?.innerHTML) kgSaveOfflineSnapshot(`dashboard:v3:${key}`, element.innerHTML);
}

function showDashboardSnapshot(key, element, label, error) {
  return kgRenderOfflineSnapshot(element, `dashboard:v3:${key}`, label, error);
}

function saveWeatherSnapshots() {
  saveDashboardSnapshot("weather", weatherResult);
  saveDashboardSnapshot("crop-advice", cropAdvice);
  saveDashboardSnapshot("long-term", longTermResult);
}

async function askSchemeAssistant(question) {
  schemeAssistantResult.innerHTML = `<span class="empty-state">KrishiBaba is checking scheme guidance...</span>`;
  try {
    const answer = await kgAiText(`You are KrishiBaba, a government scheme assistant for Indian farmers. Explain simply in the selected website language and avoid dates. Farmer profile: ${JSON.stringify(profile)}. Available schemes: ${JSON.stringify(schemes.map(({ title, summary, benefit, reason }) => ({ title, summary, benefit, reason })))}. Farmer question: ${question}`);
    schemeAssistantResult.innerHTML = `<div class="diagnosis-row"><strong>KrishiBaba scheme guidance</strong><p>${renderAiText(answer)}</p></div>`;
    saveDashboardSnapshot("scheme-guidance", schemeAssistantResult);
    kgSpeak(answer, kgActiveLanguage);
  } catch (error) {
    if (!isOfflineLikeError(error) || !showDashboardSnapshot("scheme-guidance", schemeAssistantResult, "scheme guidance", error)) {
      schemeAssistantResult.innerHTML = `<div class="diagnosis-row"><strong>Scheme guidance unavailable</strong><p>${error.message}</p></div>`;
    }
  }
}

async function generateSchemeDraft() {
  const title = schemeDraftSelect.value;
  const type = schemeDraftType.value;
  const draftLanguage = schemeDraftLanguage?.value || "en-IN";
  const draftLanguageLabel = KG_LANGUAGES[draftLanguage]?.label || "English";
  const scheme = schemes.find((item) => item.title === title);
  if (!scheme) return;
  const updatedProfile = {
    ...profile,
    mobile: draftPhone.value || profile.mobile,
    age: draftAge.value || profile.age
  };
  schemeAssistantResult.innerHTML = `<span class="empty-state">Generating ${type.toLowerCase()} in ${draftLanguageLabel}...</span>`;
  try {
    const draft = await kgAiText(`Generate a complete, ready-to-print ${type} only in ${draftLanguageLabel} (${draftLanguage}) for this selected scheme: "${scheme.title}".
Every heading, field label, salutation, instruction, paragraph, declaration, closing, signature label, and enclosure line must be in ${draftLanguageLabel}.
For a non-English selection, use its native script throughout and translate or naturally transliterate headings, recipient titles, and scheme names. Keep only unavoidable official abbreviations and numbers unchanged.
Do not include an English translation, bilingual text, language note, explanation, or any text in another language.
Before returning, silently check the entire draft and rewrite any accidental English structural text into ${draftLanguageLabel}.
Do not stop after Subject. Generate the full draft from beginning to signature.
Keep each paragraph short so the full document fits in one response.
Use the selected scheme details to decide the correct content, documents, purpose, recipient type, and benefit language.
Use farmer information wherever available. Put the farmer's actual name, mobile, age, village, district, state, crop, land, bank, PM-KISAN, and other known profile details directly in the relevant fields.
If any specific field value is missing, write only this blank line: __________
Never use square brackets, round brackets, curly brackets, angle brackets, placeholder labels like "Current Date", or text like "[Bank Name]".
Do not ask the user for more data. Do not invent Aadhaar, bank account, address, application number, dates, or land record numbers.
Do not use asterisks or markdown.
Never end midway. Include the closing, applicant name, mobile number, place, date, signature, and enclosure/document list when suitable.
Format guide for this draft type:
${draftFormatGuide(type)}
Farmer profile JSON: ${JSON.stringify(updatedProfile)}
Selected scheme JSON: ${JSON.stringify(scheme)}`, { language: draftLanguage, maxTokens: 1400 });
    const cleanDraft = cleanDraftText(draft);
    schemeAssistantResult.innerHTML = `<div class="diagnosis-row printable-application colorful-response" id="printableApplication"><pre>${cleanDraft}</pre></div>`;
    saveDashboardSnapshot("scheme-draft", schemeAssistantResult);
    printDraftBtn.classList.remove("hidden");
    if ("speechSynthesis" in window && window.speechSynthesis.paused) window.speechSynthesis.resume();
    kgSpeak(cleanDraft, draftLanguage);
  } catch (error) {
    if (!isOfflineLikeError(error) || !showDashboardSnapshot("scheme-draft", schemeAssistantResult, "application draft", error)) {
      schemeAssistantResult.innerHTML = `<div class="diagnosis-row"><strong>Draft unavailable</strong><p>${error.message}</p></div>`;
    }
  }
}

function printApplicationDraft() {
  const printable = document.getElementById("printableApplication");
  if (!printable) return;
  const printWindow = window.open("", "_blank", "width=900,height=700");
  printWindow.document.write(`
    <html>
      <head>
        <title>KrishiGyaan Application Draft</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.6; color: #111827; }
          h1 { font-size: 22px; }
          pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>${printable.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function initDashboardScrollSpy() {
  const links = [...document.querySelectorAll("[data-section-link]")];
  const linkedIds = new Set(links.map((link) => link.dataset.sectionLink));
  const sections = [...document.querySelectorAll(".dashboard-main section[id]")].filter((section) => linkedIds.has(section.id));
  if (!links.length || !sections.length) return;

  let activeId = "";
  let updateQueued = false;

  const setActive = (id) => {
    if (!linkedIds.has(id) || activeId === id) return;
    activeId = id;
    links.forEach((link) => link.classList.toggle("active", link.dataset.sectionLink === id));
  };

  const updateActiveSection = () => {
    updateQueued = false;
    const navBottom = document.querySelector(".dashboard-nav")?.getBoundingClientRect().bottom || 0;
    const activationLine = navBottom + Math.min(140, window.innerHeight * 0.18);
    let currentSection = sections[0];

    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      currentSection = sections[sections.length - 1];
    } else {
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= activationLine) currentSection = section;
        else break;
      }
    }

    setActive(currentSection.id);
  };

  const queueUpdate = () => {
    if (updateQueued) return;
    updateQueued = true;
    window.requestAnimationFrame(updateActiveSection);
  };

  links.forEach((link) => link.addEventListener("click", () => setActive(link.dataset.sectionLink)));
  window.addEventListener("scroll", queueUpdate, { passive: true });
  window.addEventListener("resize", queueUpdate);
  window.addEventListener("hashchange", () => {
    const id = window.location.hash.replace("#", "");
    if (id) setActive(id);
    queueUpdate();
  });
  updateActiveSection();
}

function initSpeechToTextControl({ button, textarea, status }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!button || !textarea) return;
  if (!SpeechRecognition) {
    button.disabled = true;
    if (status) status.textContent = "Speech input is not supported in this browser.";
    return;
  }

  const recognition = new SpeechRecognition();
  let active = false;
  let finalTranscript = "";
  let restartTimer = null;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    button.classList.add("listening");
    if (status) status.textContent = "Listening... tap mic again to stop.";
  };

  recognition.onresult = (event) => {
    let interimTranscript = "";
    for (let index = event.resultIndex; index < event.results.length; index++) {
      const transcript = event.results[index][0].transcript;
      if (event.results[index].isFinal) {
        finalTranscript += `${transcript} `;
      } else {
        interimTranscript += transcript;
      }
    }
    textarea.value = `${finalTranscript}${interimTranscript}`.trim();
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  };

  recognition.onerror = (event) => {
    button.classList.remove("listening");
    if (event.error === "no-speech" && active) {
      if (status) status.textContent = "Still listening... please speak closer to the mic.";
      return;
    }
    active = false;
    if (status) status.textContent = "Could not hear clearly. Tap mic and try again.";
  };

  recognition.onend = () => {
    if (textarea.value.trim()) {
      finalTranscript = `${textarea.value.trim()} `;
    }
    if (active) {
      clearTimeout(restartTimer);
      restartTimer = setTimeout(() => {
        if (!active) return;
        try {
          recognition.start();
        } catch (error) {
          if (status) status.textContent = "Still listening... speak when ready.";
        }
      }, 450);
      return;
    }
    button.classList.remove("listening");
    if (status) status.textContent = textarea.value ? "Voice question captured." : "";
  };

  async function ensureMicSession() {
    if (speechMicStream?.active) return true;
    if (!navigator.mediaDevices?.getUserMedia) return true;
    speechMicStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  }

  button.addEventListener("click", async () => {
    if (active) {
      active = false;
      clearTimeout(restartTimer);
      finalTranscript = textarea.value.trim() ? `${textarea.value.trim()} ` : finalTranscript;
      recognition.stop();
      if (status) status.textContent = textarea.value ? "Voice question captured." : "Mic stopped.";
      return;
    }
    finalTranscript = textarea.value ? `${textarea.value.trim()} ` : "";
    recognition.lang = KG_LANGUAGES[kgActiveLanguage]?.speech || "en-IN";
    try {
      if (status) status.textContent = "Opening microphone...";
      await ensureMicSession();
      active = true;
      recognition.start();
    } catch (error) {
      active = false;
      button.classList.remove("listening");
      if (status) status.textContent = "Microphone permission was not available. Please check browser site settings.";
    }
  });
}

function initSpeechToText() {
  initSpeechToTextControl({ button: speechToTextBtn, textarea: chatQuestion, status: speechStatus });
  initSpeechToTextControl({ button: schemeSpeechBtn, textarea: schemeQuestion, status: schemeSpeechStatus });

  window.addEventListener("beforeunload", () => {
    speechMicStream?.getTracks().forEach((track) => track.stop());
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function readImageMeta(file) {
  if (!file) return null;
  const dataUrl = await fileToBase64(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 96;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size, size);
      const pixels = ctx.getImageData(0, 0, size, size).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < pixels.length; i += 16) {
        r += pixels[i];
        g += pixels[i + 1];
        b += pixels[i + 2];
        count++;
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      const brightness = Math.round((r + g + b) / 3);
      const colorHint = brightness < 85 ? "dark organic or moist soil" : r > g && r > b ? "reddish or lateritic soil" : brightness > 165 ? "sandy or dry light soil" : "loamy or mixed soil";
      resolve({ name: file.name, averageColor: `rgb(${r}, ${g}, ${b})`, brightness, colorHint, dataUrlPreview: dataUrl.slice(0, 80) });
    };
    img.onerror = () => resolve({ name: file.name, colorHint: "soil image uploaded but color could not be read" });
    img.src = dataUrl;
  });
}

async function detectDisease(base64Image) {
  const latitude = Number(profile.latitude || savedLocation?.latitude || 25.6);
  const longitude = Number(profile.longitude || savedLocation?.longitude || 85.1);
  const res = await fetch(kgApiUrl("/api/crop-health"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images: [base64Image], latitude, longitude })
  });
  if (!res.ok) throw new Error(`Crop health API failed with status ${res.status}`);
  return res.json();
}

async function detectPlantDisease(base64Image) {
  const res = await fetch(kgApiUrl("/api/plant-health"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      images: [base64Image],
      latitude: Number(profile.latitude || savedLocation?.latitude || 25.6),
      longitude: Number(profile.longitude || savedLocation?.longitude || 85.1),
      health: "all",
      similar_images: true
    })
  });
  if (!res.ok) throw new Error(`Plant.id API failed with status ${res.status}`);
  return res.json();
}

function diseaseMode() {
  return document.querySelector('input[name="diseaseMode"]:checked')?.value || "crop";
}

function normalizeSuggestion(item = {}) {
  return {
    name: item.name || item.plant_name || item.common_name || "Unknown",
    probability: Number(item.probability ?? item.score ?? 0),
    scientific_name: item.scientific_name || item.details?.scientific_name || item.details?.entity_id || ""
  };
}

function getHealthPayload(data) {
  return data?.result?.health || data?.result || {};
}

function getDiseaseSuggestions(data) {
  const health = getHealthPayload(data);
  return (data?.result?.disease?.suggestions || health?.disease?.suggestions || data?.disease?.suggestions || []).map(normalizeSuggestion);
}

function getPlantSuggestions(data) {
  return (data?.result?.crop?.suggestions || data?.result?.classification?.suggestions || data?.result?.plant?.suggestions || data?.classification?.suggestions || []).map(normalizeSuggestion);
}

function renderCropResult(data, mode = diseaseMode()) {
  const health = data?.result?.health || {};
  const resultHealth = getHealthPayload(data);
  const diseases = getDiseaseSuggestions(data);
  const crops = getPlantSuggestions(data);
  const isPlant = data?.result?.is_plant || data?.result?.is_plant_probability ? data.result.is_plant : null;
  const isHealthy = health?.is_healthy || resultHealth?.is_healthy;
  const row = (item, label) => `<div class="diagnosis-row"><strong>${item.name}</strong><p>${label}: ${(item.probability * 100).toFixed(2)}%</p><p>Scientific name: ${item.scientific_name || "Not available"}</p></div>`;
  const suggestionBlock = mode === "plant" && !crops.length
    ? ""
    : `<h3>${mode === "plant" ? "Plant suggestions" : "Crop / plant suggestions"}</h3>${crops.map((item) => row(item, "Probability")).join("") || "<p>No crop or plant suggestions returned.</p>"}`;
  const diseaseBlock = diseases.length
    ? diseases.map((item) => row(item, "Confidence")).join("")
    : `<p>${isHealthy?.binary ? "No disease detected. Plant appears healthy from the API response." : "No disease suggestions returned by the API."}</p>`;
  dashboardSignals.diseaseScore = calculateDiseaseScore(data);
  updateDashboardMetrics();
  cropResult.innerHTML = `<div class="diagnosis"><div class="diagnosis-row"><strong>Status: ${data.status || "Completed"}</strong><p>Model: ${data.model_version || (mode === "plant" ? "Plant.id health assessment" : "crop health")}</p>${isPlant ? `<p>Plant detected: ${isPlant?.binary ? "Yes" : "No"} (${(((isPlant?.probability || 0) * 100)).toFixed(2)}%)</p>` : ""}${isHealthy ? `<p>Healthy: ${isHealthy.binary ? "Yes" : "No"} (${(((isHealthy.probability || 0) * 100)).toFixed(2)}%)</p>` : ""}</div><h3>Disease / health suggestions</h3>${diseaseBlock}${suggestionBlock}<details><summary>Raw API data</summary><pre>${JSON.stringify(data, null, 2)}</pre></details></div>`;
}

function nextTechniqueWindowKey(date = new Date()) {
  const shifted = new Date(date);
  if (shifted.getHours() < 4) shifted.setDate(shifted.getDate() - 1);
  return shifted.toISOString().slice(0, 10);
}

function weatherCodeText(code) {
  if ([0, 1].includes(code)) return "Clear";
  if ([2, 3].includes(code)) return "Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rain";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Mixed";
}

function buildCropAdvice(days, weatherMetrics = calculateWeatherMetrics(days)) {
  const { rainTotal, avgMax, rainyDays } = weatherMetrics;
  const avgMin = days.reduce((sum, day) => sum + day.min, 0) / days.length;
  const crop = (profile.primaryCrop || "").toLowerCase();
  const suggestions = [];

  if (rainTotal > 55 || rainyDays >= 4) {
    suggestions.push("Rainfall is strong in the next 10 days. Prefer paddy, maize, soybean, pulses, or fodder crops if your soil drains well. Avoid pesticide spray before rain and prepare drainage channels.");
  } else if (avgMax > 36 && rainTotal < 20) {
    suggestions.push("The forecast is hot and relatively dry. Delay water-hungry sowing unless irrigation is available. Prefer millet, sorghum, pulses, sesame, groundnut, or short-duration vegetables.");
  } else {
    suggestions.push("Weather looks balanced for careful sowing. Choose region-suitable cereals, pulses, vegetables, or oilseeds and keep seed treatment ready before sowing.");
  }

  if (crop.includes("wheat")) suggestions.push("For wheat, avoid waterlogging and plan irrigation around cooler morning or evening windows.");
  if (crop.includes("rice") || crop.includes("paddy")) suggestions.push("For rice, maintain nursery drainage and monitor for fungal pressure after continuous rain.");
  if (crop.includes("potato")) suggestions.push("For potato, avoid excessive soil moisture and inspect leaves for early blight after humid days.");
  suggestions.push(`Temperature range is around ${avgMin.toFixed(1)}°C to ${avgMax.toFixed(1)}°C, with about ${rainTotal.toFixed(1)} mm rain expected over 10 days.`);

  return suggestions;
}

async function getWeatherCoordinates() {
  if (profile.latitude && profile.longitude) return { latitude: Number(profile.latitude), longitude: Number(profile.longitude) };
  if (savedLocation?.latitude && savedLocation?.longitude) return savedLocation;
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject(new Error("Location is not available in this browser."));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => reject(new Error("Location permission is needed for weather advisory.")),
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 3600000 }
    );
  });
}

async function fetchWeather() {
  const { latitude, longitude } = await getWeatherCoordinates();
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&forecast_days=10&timezone=auto`;
  const longUrl = `https://seasonal-api.open-meteo.com/v1/seasonal?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_mean,precipitation_sum,soil_moisture_0_to_7cm_mean&forecast_days=30&models=ecmwf_ec46&timezone=auto`;
  const reverseUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`;
  const [forecastRes, longRes, reverseRes] = await Promise.allSettled([fetch(forecastUrl), fetch(longUrl), fetch(reverseUrl)]);
  if (forecastRes.status !== "fulfilled" || !forecastRes.value.ok) throw new Error("10-day forecast could not be loaded.");
  const forecast = await forecastRes.value.json();
  let longTerm = null;
  let place = `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
  if (longRes.status === "fulfilled" && longRes.value.ok) longTerm = await longRes.value.json();
  if (reverseRes.status === "fulfilled" && reverseRes.value.ok) {
    const reverse = await reverseRes.value.json();
    const first = reverse?.results?.[0];
    if (first) place = [first.name, first.admin1, first.country].filter(Boolean).join(", ");
  }
  return { forecast, longTerm, latitude, longitude, place };
}

async function renderWeather({ forecast, longTerm, latitude, longitude, place }) {
  const daily = forecast.daily;
  const days = daily.time.map((date, index) => ({
    date,
    max: daily.temperature_2m_max[index],
    min: daily.temperature_2m_min[index],
    rain: daily.precipitation_sum[index] || 0,
    probability: daily.precipitation_probability_max[index] || 0,
    wind: daily.wind_speed_10m_max[index] || 0,
    code: daily.weather_code[index]
  }));
  const weatherMetrics = calculateWeatherMetrics(days, longTerm);
  dashboardSignals.weather = weatherMetrics;
  updateDashboardMetrics();
  const advice = buildCropAdvice(days, weatherMetrics);
  const temperatureFloor = Math.floor(Math.min(...days.map((day) => day.min))) - 2;
  const temperatureCeiling = Math.ceil(Math.max(...days.map((day) => day.max))) + 2;
  const temperatureSpan = Math.max(temperatureCeiling - temperatureFloor, 1);
  const maximumRain = Math.max(...days.map((day) => day.rain), 1);
  const totalRain = days.reduce((sum, day) => sum + day.rain, 0);
  const averageWind = days.reduce((sum, day) => sum + day.wind, 0) / Math.max(days.length, 1);
  const rainyDays = days.filter((day) => day.probability >= 50 || day.rain >= 2).length;
  const forecastColumns = days.map((day) => {
    const temperatureStart = ((day.min - temperatureFloor) / temperatureSpan) * 100;
    const temperatureWidth = Math.max(((day.max - day.min) / temperatureSpan) * 100, 8);
    const rainHeight = Math.max((day.rain / maximumRain) * 100, day.rain > 0 ? 6 : 2);
    const dayLabel = new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
    return `<div class="forecast-day" role="listitem"><div class="forecast-day-head"><strong>${dayLabel}</strong><span>${weatherCodeText(day.code)}</span></div><div class="rain-plot" title="${day.rain.toFixed(1)} mm rain"><span style="--rain-height:${rainHeight.toFixed(1)}%"></span><b>${day.rain.toFixed(1)}</b><small>mm</small></div><div class="temperature-track" aria-label="Temperature ${day.min.toFixed(0)} to ${day.max.toFixed(0)} degrees Celsius"><span style="--temp-start:${temperatureStart.toFixed(1)}%;--temp-width:${temperatureWidth.toFixed(1)}%"></span></div><div class="temperature-labels"><b>${day.min.toFixed(0)}°</b><b>${day.max.toFixed(0)}°</b></div><div class="forecast-wind">Wind ${day.wind.toFixed(0)} km/h</div></div>`;
  }).join("");
  weatherResult.innerHTML = `<div class="forecast-board"><div class="forecast-summary"><div><span class="eyebrow">Your location</span><h3>${place}</h3></div><div class="forecast-summary-metrics"><span><b>${totalRain.toFixed(1)} mm</b>10-day rain</span><span><b>${rainyDays}</b>rain-likely days</span><span><b>${averageWind.toFixed(0)} km/h</b>average wind</span></div></div><div class="forecast-legend"><span><i class="legend-rain"></i>Rainfall</span><span><i class="legend-temp"></i>Temperature range</span><small>${temperatureFloor}°C to ${temperatureCeiling}°C scale</small></div><div class="forecast-scroll"><div class="forecast-days" role="list" aria-label="10-day weather forecast">${forecastColumns}</div></div><div class="weather-advice" id="krishiBabaWeatherAdvice"><strong>KrishiBaba farmer guidance</strong><p>Preparing a short field recommendation...</p></div></div>`;
  cropAdvice.innerHTML = `<article class="crop-action-card"><div class="crop-action-heading"><span class="eyebrow">Based on the live forecast</span><h3>10-day field action plan</h3></div><ul>${advice.map((item) => `<li>${item}</li>`).join("")}</ul><div class="crop-ai-note" id="krishiBabaCropAdvice"><strong>KrishiBaba recommendation</strong><p>Preparing one profile-aware recommendation...</p></div></article>`;

  if (longTerm?.daily?.time?.length) {
    const rain = longTerm.daily.precipitation_sum || [];
    const temp = longTerm.daily.temperature_2m_mean || [];
    const soil = longTerm.daily.soil_moisture_0_to_7cm_mean || [];
    const longTermRain = rain.reduce((sum, value) => sum + (value || 0), 0);
    const avgTemp = temp.reduce((sum, value) => sum + (value || 0), 0) / Math.max(temp.length, 1);
    const avgSoil = soil.reduce((sum, value) => sum + (value || 0), 0) / Math.max(soil.length, 1);
    const weeklyRain = Array.from({ length: Math.ceil(rain.length / 7) }, (_, weekIndex) => rain.slice(weekIndex * 7, weekIndex * 7 + 7).reduce((sum, value) => sum + (value || 0), 0));
    const maximumWeeklyRain = Math.max(...weeklyRain, 1);
    const weeklyBars = weeklyRain.map((value, index) => `<div><span style="--week-height:${Math.max((value / maximumWeeklyRain) * 100, 3).toFixed(1)}%"></span><b>${value.toFixed(0)} mm</b><small>Week ${index + 1}</small></div>`).join("");
    longTermResult.innerHTML = `<div class="outlook-heading"><span class="eyebrow">Planning trend</span><h3>30-day crop growth direction</h3></div><div class="outlook-metrics"><span><b>${longTermRain.toFixed(0)} mm</b>Total rain</span><span><b>${avgTemp.toFixed(1)}°C</b>Average temp.</span><span><b>${avgSoil.toFixed(2)}</b>Soil moisture</span></div><div class="weekly-rain"><div class="weekly-rain-title"><strong>Weekly rainfall direction</strong><small>Forecast, not a guarantee</small></div><div class="weekly-bars">${weeklyBars}</div></div><p class="growth-note">Keep drainage and irrigation flexible. For short-duration vegetables, stagger sowing so one weather event does not affect the whole crop.</p>`;
  } else {
    const rain16 = days.reduce((sum, day) => sum + day.rain, 0);
    const avgTemp = days.reduce((sum, day) => sum + ((day.min + day.max) / 2), 0) / Math.max(days.length, 1);
    longTermResult.innerHTML = `<div class="outlook-heading"><span class="eyebrow">Short-term fallback</span><h3>Crop growth direction</h3></div><div class="outlook-metrics"><span><b>${rain16.toFixed(1)} mm</b>10-day rain</span><span><b>${avgTemp.toFixed(1)}°C</b>Average temp.</span><span><b>Weekly</b>Re-check</span></div><p class="growth-note">The 30-day source is unavailable, so this direction uses the current 10-day forecast. Re-check before sowing a long-duration crop.</p>`;
  }

  const soilStatus = document.getElementById("soilStatus");
  if (soilStatus) soilStatus.textContent = days.some((day) => day.rain > 10) ? "Moisture risk is high. Keep drainage clear and avoid over-irrigation." : "Moisture appears manageable. Irrigate based on soil feel and crop stage.";
  try {
    const aiAdvice = await kgAiText(`You are KrishiBaba, a careful farmer assistant. Give one consistent, practical, low-cost recommendation in the selected website language for the next 10 days. Maximum 110 words.
Use the actual registered crop and supplied forecast. Do not recommend harvesting unless the profile's sowing date, expected harvest, or crop stage supports it. Do not recommend a new crop merely because rain is expected. Never contradict yourself about irrigation, sunlight, sowing, or crop duration.
Prioritize immediate actions under four short labels: Field work, Water, Disease watch, Next check. If rainfall is heavy, prioritize drainage, avoid spraying before rain, and advise checking the field before any sowing or transplanting decision.
Location: ${place}
Farmer profile: ${JSON.stringify(profile)}
Weather days: ${JSON.stringify(days)}`);
    document.getElementById("krishiBabaWeatherAdvice").innerHTML = `<strong>KrishiBaba farmer guidance</strong><p>${renderAiText(aiAdvice)}</p>`;
    document.getElementById("krishiBabaCropAdvice").innerHTML = `<strong>KrishiBaba recommendation</strong><p>${renderAiText(aiAdvice)}</p>`;
    kgSpeak(aiAdvice, kgActiveLanguage);
  } catch (error) {
    document.getElementById("krishiBabaWeatherAdvice").innerHTML = `<strong>KrishiBaba farmer guidance</strong><p>${error.message}</p><p>Use the local advisory shown above until KrishiBaba is available.</p>`;
    document.getElementById("krishiBabaCropAdvice").innerHTML = `<strong>Local recommendation</strong><p>Use the forecast-based action list above and check the field before irrigation, spraying, sowing, or harvest work.</p>`;
    kgSpeak(advice.join(" "), kgActiveLanguage);
  }
  saveWeatherSnapshots();
}

async function answerQuestion(question) {
  const q = question.toLowerCase();
  const crop = profile.primaryCrop || "your crop";
  try {
    return await kgAiText(`You are KrishiBaba, a farmer helper. Give safe, practical, low-cost farming advice in the selected website language. Farmer profile: ${JSON.stringify(profile)}. Farmer question: ${question}`);
  } catch (error) {
    console.warn("KrishiBaba chat failed:", error);
    if (isOfflineLikeError(error)) throw error;
    if (q.includes("krishibaba") || q.includes("grok") || q.trim().length > 0) {
      return `${error.message} Meanwhile, based on your profile, check weather, soil moisture, disease symptoms, and crop stage before taking action.`;
    }
  }
  if (q.includes("weather") || q.includes("rain")) return "Use the weather advisory panel first. If rain is heavy, delay spraying and improve drainage. If heat is high, irrigate early morning or after sunset.";
  if (q.includes("fertilizer")) return `For ${crop}, avoid heavy fertilizer before rainfall. Split nitrogen doses and combine organic matter with soil test guidance.`;
  if (q.includes("scheme") || q.includes("subsidy")) return "Check PM-KISAN, Fasal Bima, Soil Health Card, irrigation subsidy, and state horticulture support based on your crop and land profile.";
  if (q.includes("disease") || q.includes("pest")) return "Upload a clear leaf or stem image in the crop health scanner. Until then, isolate affected plants, avoid unnecessary spray, and monitor humidity.";
  return `For ${crop}, KrishiGyaan recommends checking weather, soil moisture, and crop stage together before making a sowing, irrigation, fertilizer, or harvest decision.`;
}

async function renderDiseaseTreatment(data) {
  try {
    const treatment = await kgAiText(`You are KrishiBaba, a farmer crop disease advisor. Maximum 100 words only. Based on this crop disease API response, explain the easiest low-cost treatment in the selected website language. Include likely disease, low-cost government-supported options if available, medicine or active ingredient names, simple application method, safety precautions, and when to contact an agriculture officer. Do not invent a guaranteed cure.\nAPI response: ${JSON.stringify(data)}`);
    cropResult.insertAdjacentHTML("beforeend", `<div class="diagnosis-row"><strong>KrishiBaba low-cost treatment plan</strong><p>${renderAiText(treatment)}</p></div>`);
    saveDashboardSnapshot("crop-health", cropResult);
    kgSpeak(treatment, kgActiveLanguage);
  } catch (error) {
    cropResult.insertAdjacentHTML("beforeend", `<div class="diagnosis-row"><strong>Treatment plan unavailable</strong><p>${error.message}</p><p>KrishiBaba treatment guidance could not be loaded. Please consult a local agriculture officer with this diagnosis.</p></div>`);
    saveDashboardSnapshot("crop-health", cropResult);
  }
}

async function generateModernTechniquePlan() {
  const location = profile.state || savedLocation?.state || "the farmer's local region";
  const crop = profile.primaryCrop || "main crop";
  const dayKey = nextTechniqueWindowKey();
  const cacheKey = `krishigyaanModernTechnique:${dayKey}:${kgActiveLanguage}:${location}:${crop}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    modernResult.innerHTML = `<div class="diagnosis-row"><strong>Modern Farming Technique of the Day</strong><p>${renderAiText(cached)}</p><small>Saved for today. A new learning unlocks after 4 AM tomorrow.</small></div>`;
    saveDashboardSnapshot("modern-technique", modernResult);
    kgSpeak(cached, kgActiveLanguage);
    return;
  }

  modernResult.innerHTML = `<span class="empty-state">Preparing today's modern farming technique...</span>`;
  try {
    const plan = await kgAiText(`You are KrishiBaba. Create the "Modern Farming Technique of the Day" in the selected website language for ${location}. Maximum 100 words only. Pick one common traditional technique for ${crop} or local crops, explain the modern improved technique, why it is profitable with less investment and more output, and 3 simple adoption steps. Farmer-friendly and practical.`);
    localStorage.setItem(cacheKey, plan);
    modernResult.innerHTML = `<div class="diagnosis-row"><strong>Modern Farming Technique of the Day</strong><p>${renderAiText(plan)}</p><small>Saved for today. A new learning unlocks after 4 AM tomorrow.</small></div>`;
    saveDashboardSnapshot("modern-technique", modernResult);
    kgSpeak(plan, kgActiveLanguage);
  } catch (error) {
    if (!isOfflineLikeError(error) || !showDashboardSnapshot("modern-technique", modernResult, "modern technique", error)) {
      modernResult.innerHTML = `<div class="diagnosis-row"><strong>Plan unavailable</strong><p>${error.message}</p><p>KrishiBaba could not generate the modern farming technique plan. Please try again after some time.</p></div>`;
    }
  }
}

async function analyzeSoilHealth() {
  const file = soilImageInput?.files?.[0];
  if (!file) {
    soilResult.innerHTML = `<span class="empty-state">${uiText("Please choose a soil photo first.")}</span>`;
    return;
  }
  soilResult.innerHTML = `<span class="empty-state">Checking soil profile and preparing crop growth path...</span>`;
  const imageMeta = await readImageMeta(file);
  const localSoil = {
    registeredSoilType: profile.soilType || "not provided",
    irrigation: profile.irrigation || "not provided",
    crop: profile.primaryCrop || "not provided",
    season: profile.season || "not provided",
    landSize: profile.landSize || "not provided",
    location: profile.state || savedLocation?.state || "not provided",
    soilImageHeuristic: imageMeta
  };

  try {
    const score = calculateSoilScore(localSoil, imageMeta);
    const band = soilScoreBand(score);
    dashboardSignals.soilScore = score;
    updateDashboardMetrics();
    const advice = await kgAiText(`You are KrishiBaba. Maximum 120 words. Give soil health analysis in the selected website language from this profile and soil photo heuristic. Include likely soil condition, what crop is suitable, what crop to avoid, low-cost improvement path for 30-60 days, compost/organic matter advice, irrigation caution, and mention Soil Health Card lab test for exact NPK/pH. Farmer-friendly.\n${JSON.stringify(localSoil)}`);
    soilResult.innerHTML = `<div class="soil-score-card"><div class="score-ring" style="--score:${score}"><strong>${score}</strong><span>/100</span></div><div><h3>${band.label}</h3><p>${band.description}</p></div></div><div class="soil-scale"><span>0-40 Low</span><span>40-60 Moderate</span><span>60-80 Good</span><span>80-100 Very good</span></div><div class="diagnosis-row"><strong>Soil health and crop growth path</strong><p>${renderAiText(advice)}</p></div><div class="diagnosis-row"><strong>Photo/profile signals</strong><p>Soil type: ${localSoil.registeredSoilType}. Irrigation: ${localSoil.irrigation}. Image hint: ${imageMeta?.colorHint || "No photo uploaded"}.</p></div>`;
    saveDashboardSnapshot("soil-health", soilResult);
    kgSpeak(advice, kgActiveLanguage);
  } catch (error) {
    if (isOfflineLikeError(error) && showDashboardSnapshot("soil-health", soilResult, "soil health result", error)) return;
    const fallback = `Use your Soil Health Card or local lab for exact pH, NPK, EC and organic carbon. Based on profile, add compost/FYM, avoid over-irrigation, keep drainage clear, and choose locally suitable crops after weather check.`;
    soilResult.innerHTML = `<div class="diagnosis-row"><strong>Soil health and crop growth path</strong><p>${fallback}</p><p>${error.message}</p></div>`;
  }
}

function calculateSoilScore(soil, imageMeta) {
  let score = 45;
  const soilType = String(soil.registeredSoilType || "").toLowerCase();
  const irrigation = String(soil.irrigation || "").toLowerCase();
  const hint = String(imageMeta?.colorHint || "").toLowerCase();

  if (soilType.includes("alluvial") || soilType.includes("black") || soilType.includes("loamy")) score += 18;
  if (soilType.includes("red") || soilType.includes("laterite")) score += 8;
  if (soilType.includes("sandy")) score -= 8;
  if (irrigation.includes("drip")) score += 12;
  if (irrigation.includes("canal") || irrigation.includes("borewell")) score += 6;
  if (irrigation.includes("rainfed")) score -= 4;
  if (hint.includes("dark") || hint.includes("organic")) score += 18;
  if (hint.includes("loamy")) score += 12;
  if (hint.includes("sandy") || hint.includes("dry")) score -= 10;
  if (hint.includes("reddish") || hint.includes("lateritic")) score += 4;
  if (profile.fertilizer && /organic|compost|fym|bio/i.test(profile.fertilizer)) score += 8;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function soilScoreBand(score) {
  if (score < 40) return { label: "Low soil health", description: "Degraded soil. Focus on organic matter, soil testing, drainage, and careful crop choice." };
  if (score < 60) return { label: "Moderate soil health", description: "Usable soil with improvement needed. Add compost, reduce stress, and follow soil test guidance." };
  if (score < 80) return { label: "Good soil health", description: "Good growing condition. Maintain fertility, moisture balance, and crop rotation." };
  return { label: "Very good soil health", description: "Healthy soil condition. Maintain organic matter and avoid overuse of inputs." };
}

guardDashboard();
kgInitShared({ askLocation: true });
summarizeProfile();
renderSchemes();
initDashboardScrollSpy();
initSpeechToText();
window.addEventListener("kg-language-change", renderSchemes);

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.setItem("krishigyaanLoggedIn", "false");
  window.location.href = "login.html";
});

weatherBtn?.addEventListener("click", async () => {
  try {
    weatherBtn.disabled = true;
    weatherResult.innerHTML = `<span class="empty-state">${(KG_TRANSLATIONS[kgActiveLanguage] || KG_EN).weatherLoading}</span>`;
    const data = await fetchWeather();
    await renderWeather(data);
  } catch (error) {
    if (isOfflineLikeError(error)) {
      const weatherShown = showDashboardSnapshot("weather", weatherResult, "weather advisory", error);
      showDashboardSnapshot("crop-advice", cropAdvice, "crop advisory", error);
      showDashboardSnapshot("long-term", longTermResult, "growth outlook", error);
      if (!weatherShown) weatherResult.innerHTML = `<div class="diagnosis-row"><strong>Weather unavailable</strong><p>${error.message}</p><p>No saved weather advisory is available yet. Open this panel once online to store it for offline use.</p></div>`;
    } else {
      weatherResult.innerHTML = `<div class="diagnosis-row"><strong>Weather unavailable</strong><p>${error.message}</p><p>Please allow location or add latitude and longitude in your profile.</p></div>`;
    }
  } finally {
    weatherBtn.disabled = false;
  }
});

cropImageInput?.addEventListener("change", () => {
    const file = cropImageInput.files?.[0];
  const label = document.querySelector(".upload-box span");
  if (file && label) label.textContent = file.name;
});

detectBtn?.addEventListener("click", async () => {
  const file = cropImageInput.files?.[0];
  if (!file) {
    cropResult.innerHTML = `<span class="empty-state">Please choose a crop image first.</span>`;
    return;
  }
  try {
    detectBtn.disabled = true;
    const mode = diseaseMode();
    cropResult.innerHTML = `<span class="empty-state">Converting image to base64 and sending it to ${mode === "plant" ? "Plant.id" : "crop health"} AI...</span>`;
    const base64 = await fileToBase64(file);
    const data = mode === "plant" ? await detectPlantDisease(base64) : await detectDisease(base64);
    renderCropResult(data, mode);
    if (hasActionableDisease(data)) {
      await renderDiseaseTreatment(data);
    }
    saveDashboardSnapshot("crop-health", cropResult);
  } catch (error) {
    if (!isOfflineLikeError(error) || !showDashboardSnapshot("crop-health", cropResult, "crop health analysis", error)) {
      cropResult.innerHTML = `<div class="diagnosis-row"><strong>Analysis failed</strong><p>${error.message}</p><p>Please check internet access, image size, or API availability.</p></div>`;
    }
  } finally {
    detectBtn.disabled = false;
  }
});

function updateChatSubmitState() {
  if (!chatQuestion || !chatSubmitBtn) return;
  const hasQuestion = chatQuestion.value.trim().length >= 1;
  chatSubmitBtn.disabled = !hasQuestion;
  if (chatValidation) chatValidation.textContent = hasQuestion ? "Ready to ask." : "Enter a question to continue.";
}

chatQuestion?.addEventListener("input", updateChatSubmitState);
updateChatSubmitState();

function updateSchemeChatSubmitState() {
  if (!schemeQuestion || !schemeChatSubmitBtn) return;
  const hasQuestion = schemeQuestion.value.trim().length >= 1;
  schemeChatSubmitBtn.disabled = !hasQuestion || schemeChatBusy;
  if (schemeChatValidation) schemeChatValidation.textContent = schemeChatBusy ? "KrishiBaba is checking..." : hasQuestion ? "Ready to ask." : "Enter a question to continue.";
}

schemeQuestion?.addEventListener("input", updateSchemeChatSubmitState);
updateSchemeChatSubmitState();

chatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = chatQuestion.value.trim();
  if (question.length < 1) {
    updateChatSubmitState();
    chatQuestion.focus();
    return;
  }
  chatSubmitBtn.disabled = true;
  chatAnswer.innerHTML = `<span class="empty-state">KrishiBaba is preparing farmer guidance...</span>`;
  answerQuestion(question).then((answer) => {
    chatAnswer.innerHTML = `<div class="diagnosis-row"><strong>KrishiGyaan advisory</strong><p>${renderAiText(answer)}</p></div>`;
    saveDashboardSnapshot("chat-answer", chatAnswer);
    kgSpeak(answer, kgActiveLanguage);
  }).catch((error) => {
    if (!isOfflineLikeError(error) || !showDashboardSnapshot("chat-answer", chatAnswer, "chatbot reply", error)) {
      chatAnswer.innerHTML = `<div class="diagnosis-row"><strong>KrishiBaba unavailable</strong><p>${error.message}</p></div>`;
    }
  }).finally(() => {
    updateChatSubmitState();
  });
});

modernBtn?.addEventListener("click", generateModernTechniquePlan);
soilBtn?.addEventListener("click", analyzeSoilHealth);
soilImageInput?.addEventListener("change", () => {
  const file = soilImageInput.files?.[0];
  const label = soilImageInput.closest(".upload-box")?.querySelector("span");
  if (file && label) label.textContent = file.name;
});
schemeChatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = schemeQuestion.value.trim();
  if (!question) {
    updateSchemeChatSubmitState();
    schemeQuestion.focus();
    return;
  }
  schemeChatBusy = true;
  updateSchemeChatSubmitState();
  askSchemeAssistant(question).finally(() => {
    schemeChatBusy = false;
    updateSchemeChatSubmitState();
  });
});

schemeDraftBtn?.addEventListener("click", generateSchemeDraft);
printDraftBtn?.addEventListener("click", printApplicationDraft);
