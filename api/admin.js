const crypto = require("crypto");
const { ObjectId } = require("mongodb");
const { getDashboardAnalysesCollection, getDashboardUploadsCollection, getFarmersCollection, publicProfile } = require("./auth/_mongo");
const { handleOptions, readJson, requirePost, sendJson } = require("./_utils");

function adminSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.CLOUDINARY_API_SECRET || "krishigyaan-admin-session-v1";
}

function safeEqual(value, expected) {
  const left = Buffer.from(String(value || ""));
  const right = Buffer.from(String(expected || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function createToken() {
  const secret = adminSecret();
  if (!secret) throw new Error("Admin authentication is not configured.");
  const payload = Buffer.from(JSON.stringify({ role: "admin", exp: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyToken(req) {
  const token = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "");
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !adminSecret()) return false;
  const expected = crypto.createHmac("sha256", adminSecret()).update(payload).digest("base64url");
  if (!safeEqual(signature, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.role === "admin" && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

async function listFarmers() {
  const farmers = await (await getFarmersCollection()).find({}, { projection: { passwordHash: 0, passwordSalt: 0 } }).sort({ createdAt: -1 }).toArray();
  const ids = farmers.map((farmer) => farmer._id.toString());
  const [analyses, uploadCounts] = await Promise.all([
    (await getDashboardAnalysesCollection()).find({ farmerId: { $in: ids } }, { projection: { farmerId: 1, updatedAt: 1 } }).toArray(),
    (await getDashboardUploadsCollection()).aggregate([{ $match: { farmerId: { $in: ids } } }, { $group: { _id: "$farmerId", count: { $sum: 1 } } }]).toArray()
  ]);
  const analysisMap = new Map(analyses.map((item) => [item.farmerId, item.updatedAt]));
  const uploadMap = new Map(uploadCounts.map((item) => [item._id, item.count]));
  return farmers.map((farmer) => ({
    ...publicProfile(farmer),
    analysisUpdatedAt: analysisMap.get(farmer._id.toString()) || null,
    uploadCount: uploadMap.get(farmer._id.toString()) || 0
  }));
}

async function farmerDetails(farmerId) {
  if (!ObjectId.isValid(farmerId)) return null;
  const [farmer, analysis, uploads] = await Promise.all([
    (await getFarmersCollection()).findOne({ _id: new ObjectId(farmerId) }, { projection: { passwordHash: 0, passwordSalt: 0 } }),
    (await getDashboardAnalysesCollection()).findOne({ farmerId }, { projection: { _id: 0, farmerMobile: 0 } }),
    (await getDashboardUploadsCollection()).find({ farmerId }, { projection: { _id: 0, farmerId: 0, farmerMobile: 0, assetId: 0 } }).sort({ createdAt: -1 }).limit(100).toArray()
  ]);
  return farmer ? { profile: publicProfile(farmer), analysis: analysis || null, uploads } : null;
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res) || !requirePost(req, res)) return;
  try {
    const body = await readJson(req);
    if (body.action === "login") {
      const valid = safeEqual(body.username, process.env.ADMIN_USERNAME || "admin") && safeEqual(body.password, process.env.ADMIN_PASSWORD || "admin");
      if (!valid) return sendJson(res, 401, { error: "Admin username or password is incorrect." });
      return sendJson(res, 200, { ok: true, token: createToken() });
    }
    if (!verifyToken(req)) return sendJson(res, 401, { error: "Admin session expired. Please login again." });
    if (body.action === "users") return sendJson(res, 200, { ok: true, users: await listFarmers() });
    if (body.action === "farmer") {
      const result = await farmerDetails(String(body.farmerId || ""));
      return result ? sendJson(res, 200, { ok: true, ...result }) : sendJson(res, 404, { error: "Farmer record not found." });
    }
    return sendJson(res, 400, { error: "Invalid admin action." });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message });
  }
};
