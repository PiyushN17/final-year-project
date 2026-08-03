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
const dashboardSignals = {
  profileScore: 0,
  schemeMatches: 0,
  weather: null,
  diseaseScore: null,
  soilScore: null
};

const schemes = [
  {
    title: "Agriculture Infrastructure Fund",
    link: "http://agriinfra.dac.gov.in/",
    summary: "Credit support for post-harvest management, storage, processing, value addition, and community farming assets.",
    benefit: "Interest subvention and credit guarantee support for eligible infrastructure projects.",
    check: (p) => hasLand(p) && (isLargeEnough(p, 1) || isHorticultureCrop(p) || hasIrrigation(p)),
    reason: "Best fit when the farmer has land and wants storage, processing, value-addition, or infrastructure support."
  },
  {
    title: "PM-Kisan Samman Nidhi",
    link: "https://pmkisan.gov.in/",
    summary: "Income support for eligible landholding farmer families, subject to exclusions.",
    benefit: "Direct income support of Rs 6,000 per year in installments for eligible farmer families.",
    check: (p) => hasLand(p) && p.bank !== "No" && p.pmkisan !== "Registered",
    reason: "Profile suggests landholding and bank access. Final eligibility depends on land records and exclusion criteria."
  },
  {
    title: "ATMA",
    link: "https://extensionreforms.da.gov.in/DashBoard_Statusatma.aspx",
    summary: "Training, extension, demonstrations, exposure visits, farmer groups, and advisory support.",
    benefit: "Access to training, demonstrations, exposure visits, and local extension guidance.",
    check: (p) => Boolean(p.primaryCrop || p.state || p.district),
    reason: "Useful for almost every registered farmer seeking training, extension, and field-level advisory."
  },
  {
    title: "AGMARKNET",
    link: "http://agmarknet.gov.in/PriceAndArrivals/arrivals1.aspx",
    summary: "Market arrivals and price information to help farmers compare mandis before selling.",
    benefit: "Better price discovery before selling produce.",
    check: (p) => Boolean(p.primaryCrop || p.harvest),
    reason: "Useful when the farmer has a crop and wants market price or arrival information."
  },
  {
    title: "Horticulture",
    link: "http://midh.gov.in/nhmapplication/feedback/midhKPI.aspx",
    summary: "Support for fruits, vegetables, flowers, spices, plantation crops, protected cultivation, nurseries, and post-harvest management.",
    benefit: "Possible subsidy/support for horticulture cultivation, protected farming, nurseries, and post-harvest assets.",
    check: (p) => isHorticultureCrop(p),
    reason: "Best fit when the registered crop is horticulture-related."
  },
  {
    title: "Plant Quarantine Clearance",
    link: "https://pqms.cgg.gov.in/pqms-angular/home",
    summary: "Clearance support for import/export movement of plants, seeds, planting material, and regulated agricultural items.",
    benefit: "Clearance pathway for regulated plant, seed, and planting material movement.",
    check: (p) => /export|import|nursery|seed|planting/i.test(JSON.stringify(p)),
    reason: "Mostly relevant when the farmer handles seeds, nursery material, import, or export."
  },
  {
    title: "DBT in Agriculture",
    link: "https://www.dbtdacfw.gov.in/",
    summary: "Direct benefit transfer platform for agriculture-related subsidies and assistance.",
    benefit: "Direct subsidy/benefit transfer tracking for eligible agriculture schemes.",
    check: (p) => p.bank !== "No" && Boolean(p.mobile || p.state),
    reason: "Profile has basic contact/bank readiness for subsidy benefit tracking."
  },
  {
    title: "Pradhanmantri Krishi Sinchayee Yojana",
    link: "https://pmksy.gov.in/mis/frmDashboard.aspx",
    summary: "Irrigation, water-use efficiency, watershed, and micro-irrigation support.",
    benefit: "Support for irrigation access, water-use efficiency, drip/sprinkler, and watershed-related interventions.",
    check: (p) => p.irrigation === "Rainfed" || p.irrigation === "Drip" || p.irrigation === "Borewell" || hasLand(p),
    reason: "Relevant when the farmer needs irrigation support, water efficiency, drip/sprinkler, or better water access."
  },
  {
    title: "Kisan Call Center",
    link: "https://pmksy.gov.in/mis/frmDashboard.aspx",
    summary: "Phone-based farming guidance and advisory support.",
    benefit: "Free or low-cost expert advisory through phone support.",
    check: (p) => Boolean(p.mobile),
    reason: "Any farmer with a mobile number can use call-based advisory."
  },
  {
    title: "mKisan",
    link: "https://mkisan.gov.in/",
    summary: "Mobile-based agricultural advisories and farmer messages.",
    benefit: "Mobile advisories for crops, weather, pests, and government updates.",
    check: (p) => Boolean(p.mobile),
    reason: "Profile has a mobile number for advisory messages."
  },
  {
    title: "Jaivik Kheti",
    link: "https://pgsindia-ncof.gov.in/home.aspx",
    summary: "Organic farming and PGS certification ecosystem.",
    benefit: "Support pathway for organic farming groups, certification, and organic market trust.",
    check: (p) => /organic|compost|natural|jaivik|bio/i.test(JSON.stringify(p)),
    reason: "Best fit when the farmer is using or interested in organic/natural inputs."
  },
  {
    title: "e-Nam",
    link: "https://enam.gov.in/",
    summary: "Online agricultural market platform for better market access and price discovery.",
    benefit: "Market linkage and transparent online trading support.",
    check: (p) => Boolean(p.primaryCrop || p.harvest),
    reason: "Useful for farmers preparing to sell produce or compare markets."
  },
  {
    title: "Soil Health Card",
    link: "https://soilhealth.dac.gov.in/",
    summary: "Soil testing and crop-wise nutrient recommendation support.",
    benefit: "Soil testing report with fertilizer and nutrient recommendations.",
    check: (p) => hasLand(p) || Boolean(p.soilType),
    reason: "Profile has land or soil details. This scheme helps confirm pH, NPK, organic carbon, and micronutrients."
  },
  {
    title: "Pradhan Mantri Fasal Bima Yojana",
    link: "https://pmfby.gov.in/ext/rpt/ssfr_17",
    summary: "Crop insurance support against notified risks and crop loss.",
    benefit: "Insurance protection against notified crop losses with farmer premium support.",
    check: (p) => Boolean(p.primaryCrop && (p.season || p.sowingDate)),
    reason: "Profile has crop and season/sowing details needed for crop insurance consideration."
  }
];

function hasLand(p) {
  return Boolean(p.landSize || p.ownership === "Owned" || p.ownership === "Leased" || p.ownership === "Shared");
}

function isLargeEnough(p, acres) {
  const match = String(p.landSize || "").match(/[\d.]+/);
  return match ? Number(match[0]) >= acres : false;
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
          <span class="scheme-status">${uiText(eligible ? "Eligible match" : "Not matched yet")}</span>
          <h3>${uiText(scheme.title)}</h3>
          <p>${uiText(scheme.summary)}</p>
          <p><b>${uiText("Estimated benefit:")}</b> ${uiText(scheme.benefit)}</p>
          <small>${uiText(scheme.reason)}</small>
        </div>
        <a class="btn ${eligible ? "btn-primary" : "btn-disabled"}" ${eligible ? `href="${scheme.link}" target="_blank" rel="noopener"` : 'aria-disabled="true"'}>${uiText(eligible ? "Apply" : "Not Eligible")}</a>
      </article>
    `;
  }).join("");

  schemeMatcher.innerHTML = `<div class="scheme-summary"><strong>${eligibleCount}</strong><span>${uiText("eligible matches from your registration profile")}</span></div><div class="scheme-grid">${rows}</div>`;
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
    schemeDraftLanguage.innerHTML = Object.entries(KG_LANGUAGES).map(([code, meta]) => `<option value="${code}">${meta.label}</option>`).join("");
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
  if (element?.innerHTML) kgSaveOfflineSnapshot(`dashboard:${key}`, element.innerHTML);
}

function showDashboardSnapshot(key, element, label, error) {
  return kgRenderOfflineSnapshot(element, `dashboard:${key}`, label, error);
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
Do not use any other language in headings or body.
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
Selected scheme JSON: ${JSON.stringify(scheme)}`, { language: draftLanguage, maxTokens: 1200 });
    const cleanDraft = cleanDraftText(draft);
    schemeAssistantResult.innerHTML = `<div class="diagnosis-row printable-application colorful-response" id="printableApplication"><strong>${type} - ${scheme.title} (${draftLanguageLabel})</strong><pre>${cleanDraft}</pre></div>`;
    saveDashboardSnapshot("scheme-draft", schemeAssistantResult);
    printDraftBtn.classList.remove("hidden");
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

function initSidebarScrollSpy() {
  const links = [...document.querySelectorAll("[data-section-link]")];
  const sections = links.map((link) => document.getElementById(link.dataset.sectionLink)).filter(Boolean);
  if (!links.length || !sections.length) return;

  const setActive = (id) => {
    links.forEach((link) => link.classList.toggle("active", link.dataset.sectionLink === id));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActive(visible.target.id);
    },
    { root: null, rootMargin: "-18% 0px -62% 0px", threshold: [0.12, 0.25, 0.45, 0.65] }
  );

  sections.forEach((section) => observer.observe(section));
  window.addEventListener("hashchange", () => {
    const id = window.location.hash.replace("#", "");
    if (id) setActive(id);
  });
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

async function localizeLongTermIntro() {
  if (!longTermResult) return;
  const label = kgCurrentLanguageLabel();
  const sourceTitle = "30 दिन की फसल वृद्धि दिशा";
  const sourceCopy = "Long-term guidance uses seasonal trend data where available and falls back to the 16-day trend for practical planning.";
  longTermResult.classList.add("ai-loading");
  try {
    const text = await kgAiText(`Translate and adapt this dashboard microcopy only in ${label} (${kgActiveLanguage}). Return only valid JSON with keys "title" and "copy". Keep it short, farmer-friendly, and do not include markdown.\nTitle: ${sourceTitle}\nCopy: ${sourceCopy}`);
    const jsonText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const data = JSON.parse(jsonText);
    if (data.title && data.copy) {
      longTermResult.innerHTML = `<h3>${data.title}</h3><p>${data.copy}</p>`;
    }
  } catch (error) {
    console.warn("Long-term guidance localization failed:", error);
  } finally {
    longTermResult.classList.remove("ai-loading");
  }
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
  cropAdvice.innerHTML = advice.map((item) => `<div class="diagnosis-row"><strong>Farmer advisory</strong><p>${item}</p></div>`).join("");

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
    const aiAdvice = await kgAiText(`You are KrishiBaba, a farmer assistant. Give practical, low-cost, farmer-friendly guidance in the selected website language for the next 10 days based on this weather data and farmer profile. Maximum 100 words only. Include what to sow or avoid, irrigation, spraying, harvest timing, disease risk, and one long-term crop growth note. Do not use long introduction.\nLocation: ${place}\nFarmer profile: ${JSON.stringify(profile)}\nWeather days: ${JSON.stringify(days)}`);
    document.getElementById("krishiBabaWeatherAdvice").innerHTML = `<strong>KrishiBaba farmer guidance</strong><p>${renderAiText(aiAdvice)}</p>`;
    cropAdvice.insertAdjacentHTML("beforeend", `<div class="diagnosis-row"><strong>KrishiBaba recommendation</strong><p>${renderAiText(aiAdvice)}</p></div>`);
    kgSpeak(aiAdvice, kgActiveLanguage);
  } catch (error) {
    document.getElementById("krishiBabaWeatherAdvice").innerHTML = `<strong>KrishiBaba farmer guidance</strong><p>${error.message}</p><p>Use the local advisory shown above until KrishiBaba is available.</p>`;
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
initSidebarScrollSpy();
initSpeechToText();
localizeLongTermIntro();
window.addEventListener("kg-language-change", localizeLongTermIntro);
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

chatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  chatAnswer.innerHTML = `<span class="empty-state">KrishiBaba is preparing farmer guidance...</span>`;
  answerQuestion(chatQuestion.value || "").then((answer) => {
    chatAnswer.innerHTML = `<div class="diagnosis-row"><strong>KrishiGyaan advisory</strong><p>${renderAiText(answer)}</p></div>`;
    saveDashboardSnapshot("chat-answer", chatAnswer);
    kgSpeak(answer, kgActiveLanguage);
  }).catch((error) => {
    if (!isOfflineLikeError(error) || !showDashboardSnapshot("chat-answer", chatAnswer, "chatbot reply", error)) {
      chatAnswer.innerHTML = `<div class="diagnosis-row"><strong>KrishiBaba unavailable</strong><p>${error.message}</p></div>`;
    }
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
  askSchemeAssistant(schemeQuestion.value || "Which schemes am I eligible for?");
});

schemeDraftBtn?.addEventListener("click", generateSchemeDraft);
printDraftBtn?.addEventListener("click", printApplicationDraft);
