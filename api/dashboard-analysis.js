const { ObjectId } = require("mongodb");
const {
  getDashboardAnalysesCollection,
  getFarmersCollection,
  handleOptions,
  normalizeMobile,
  readJson,
  requirePost,
  sendJson
} = require("./auth/_mongo");

const ANALYSIS_SECTIONS = [
  "cropAdvice",
  "weatherResult",
  "longTermResult",
  "cropResult",
  "soilResult",
  "schemeAssistantResult",
  "modernResult",
  "chatAnswer"
];

async function resolveFarmer(body = {}) {
  const farmerId = String(body.farmerId || "").trim();
  const mobile = normalizeMobile(body.mobile);
  const query = ObjectId.isValid(farmerId) ? { _id: new ObjectId(farmerId) } : { mobile };
  if (!query._id && !/^[6-9]\d{9}$/.test(mobile)) return null;
  const farmer = await (await getFarmersCollection()).findOne(query, { projection: { mobile: 1 } });
  if (!farmer || (mobile && farmer.mobile !== mobile)) return null;
  return { id: farmer._id.toString(), mobile: farmer.mobile };
}

function cleanAnalysis(value = {}) {
  const sections = {};
  for (const key of ANALYSIS_SECTIONS) {
    if (typeof value.sections?.[key] === "string") sections[key] = value.sections[key].slice(0, 180000);
  }
  const signals = value.signals && typeof value.signals === "object" ? {
    profileScore: Number(value.signals.profileScore) || 0,
    schemeMatches: Number(value.signals.schemeMatches) || 0,
    weather: value.signals.weather && typeof value.signals.weather === "object" ? value.signals.weather : null,
    diseaseScore: value.signals.diseaseScore == null ? null : Number.isFinite(Number(value.signals.diseaseScore)) ? Number(value.signals.diseaseScore) : null,
    soilScore: value.signals.soilScore == null ? null : Number.isFinite(Number(value.signals.soilScore)) ? Number(value.signals.soilScore) : null
  } : {};
  return { sections, signals };
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res) || !requirePost(req, res)) return;
  try {
    const body = await readJson(req);
    const farmer = await resolveFarmer(body);
    if (!farmer) return sendJson(res, 401, { error: "Please login again to access saved dashboard analysis." });
    const collection = await getDashboardAnalysesCollection();

    if (body.action === "load") {
      const record = await collection.findOne({ farmerId: farmer.id }, { projection: { _id: 0, farmerId: 0, farmerMobile: 0 } });
      return sendJson(res, 200, { ok: true, analysis: record || null });
    }

    if (body.action !== "save") return sendJson(res, 400, { error: "Invalid dashboard analysis action." });
    const analysis = cleanAnalysis(body.analysis);
    const now = new Date();
    await collection.updateOne(
      { farmerId: farmer.id },
      {
        $set: { farmerMobile: farmer.mobile, ...analysis, updatedAt: now },
        $setOnInsert: { farmerId: farmer.id, createdAt: now }
      },
      { upsert: true }
    );
    return sendJson(res, 200, { ok: true, updatedAt: now.toISOString() });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message });
  }
};
