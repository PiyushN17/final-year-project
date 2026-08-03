const crypto = require("crypto");
const { ObjectId } = require("mongodb");
const {
  cleanProfile,
  getDashboardAnalysesCollection,
  getDashboardUploadsCollection,
  getFarmersCollection,
  hashPassword,
  normalizeMobile,
  publicProfile
} = require("./auth/_mongo");
const { handleOptions, readJson, requirePost, sendJson } = require("./_utils");

const PROFILE_FIELDS = [
  "fullName", "mobile", "age", "gender", "village", "district", "state", "language",
  "landSize", "ownership", "soilType", "irrigation", "primaryCrop", "season", "sowingDate",
  "fertilizer", "problem", "harvest", "aadhaar", "bank", "pmkisan", "internet", "consent"
];
const ANALYSIS_SECTIONS = [
  "cropAdvice", "weatherResult", "longTermResult", "cropResult", "soilResult",
  "schemeMatcher", "schemeAssistantResult", "modernResult", "chatAnswer"
];

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

function farmerObjectId(value) {
  return ObjectId.isValid(String(value || "")) ? new ObjectId(String(value)) : null;
}

function profileChanges(profile = {}) {
  const changes = {};
  for (const key of PROFILE_FIELDS) {
    if (profile[key] !== undefined) changes[key] = typeof profile[key] === "string" ? profile[key].trim().slice(0, 500) : profile[key];
  }
  if (changes.mobile !== undefined) changes.mobile = normalizeMobile(changes.mobile);
  return cleanProfile(changes);
}

async function createFarmer(body) {
  const profile = profileChanges(body.profile);
  if (!profile.fullName) throw Object.assign(new Error("Farmer name is required."), { status: 400 });
  if (!/^[6-9]\d{9}$/.test(profile.mobile || "")) throw Object.assign(new Error("Enter a valid 10 digit Indian mobile number."), { status: 400 });
  if (!/^(?=.*[A-Za-z])(?=.*\d).{8,32}$/.test(body.password || "")) {
    throw Object.assign(new Error("Password must be 8-32 characters and include at least one letter and one number."), { status: 400 });
  }
  const collection = await getFarmersCollection();
  if (await collection.findOne({ mobile: profile.mobile })) throw Object.assign(new Error("This mobile number is already registered."), { status: 409 });
  const password = hashPassword(body.password);
  const now = new Date();
  const farmer = { ...profile, passwordSalt: password.salt, passwordHash: password.hash, createdAt: now, updatedAt: now };
  const result = await collection.insertOne(farmer);
  return publicProfile({ ...farmer, _id: result.insertedId });
}

async function updateFarmer(body) {
  const _id = farmerObjectId(body.farmerId);
  if (!_id) throw Object.assign(new Error("Farmer record not found."), { status: 404 });
  const changes = profileChanges(body.profile);
  if (changes.mobile !== undefined && !/^[6-9]\d{9}$/.test(changes.mobile)) {
    throw Object.assign(new Error("Enter a valid 10 digit Indian mobile number."), { status: 400 });
  }
  if (body.password) {
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,32}$/.test(body.password)) {
      throw Object.assign(new Error("Password must be 8-32 characters and include at least one letter and one number."), { status: 400 });
    }
    const password = hashPassword(body.password);
    changes.passwordSalt = password.salt;
    changes.passwordHash = password.hash;
  }
  changes.updatedAt = new Date();
  const result = await (await getFarmersCollection()).findOneAndUpdate({ _id }, { $set: changes }, { returnDocument: "after", projection: { passwordHash: 0, passwordSalt: 0 } });
  if (!result) throw Object.assign(new Error("Farmer record not found."), { status: 404 });
  return publicProfile(result);
}

function cloudinaryConfig() {
  const cloudinaryUrl = String(process.env.CLOUDINARY_URL || "").match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || cloudinaryUrl?.[3];
  const apiKey = process.env.CLOUDINARY_API_KEY || cloudinaryUrl?.[1];
  const apiSecret = process.env.CLOUDINARY_API_SECRET || cloudinaryUrl?.[2];
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

async function destroyCloudinaryAsset(publicId) {
  const config = cloudinaryConfig();
  if (!publicId) return false;
  if (!config) throw new Error("Cloud image storage is not configured.");
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHash("sha1").update(`public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`).digest("hex");
  const form = new URLSearchParams({ public_id: publicId, timestamp: String(timestamp), api_key: config.apiKey, signature });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/destroy`, { method: "POST", body: form });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || "Cloudinary image could not be deleted.");
  return data.result === "ok" || data.result === "not found";
}

async function deleteFarmer(farmerId) {
  const _id = farmerObjectId(farmerId);
  if (!_id) throw Object.assign(new Error("Farmer record not found."), { status: 404 });
  const uploadsCollection = await getDashboardUploadsCollection();
  const uploads = await uploadsCollection.find({ farmerId: _id.toString() }, { projection: { publicId: 1 } }).toArray();
  const cloudResults = await Promise.allSettled(uploads.map((upload) => destroyCloudinaryAsset(upload.publicId)));
  const [farmerResult] = await Promise.all([
    (await getFarmersCollection()).deleteOne({ _id }),
    (await getDashboardAnalysesCollection()).deleteMany({ farmerId: _id.toString() }),
    uploadsCollection.deleteMany({ farmerId: _id.toString() })
  ]);
  if (!farmerResult.deletedCount) throw Object.assign(new Error("Farmer record not found."), { status: 404 });
  return { cloudDeleteFailures: cloudResults.filter((result) => result.status === "rejected").length };
}

async function updateAnalysis(body) {
  const farmerId = String(body.farmerId || "");
  if (!farmerObjectId(farmerId)) throw Object.assign(new Error("Farmer record not found."), { status: 404 });
  const sections = {};
  for (const key of ANALYSIS_SECTIONS) {
    if (typeof body.sections?.[key] === "string") sections[key] = body.sections[key].slice(0, 180000);
  }
  const now = new Date();
  await (await getDashboardAnalysesCollection()).updateOne(
    { farmerId },
    { $set: { sections, updatedAt: now }, $setOnInsert: { farmerId, createdAt: now } },
    { upsert: true }
  );
  return now;
}

async function updateUpload(body) {
  const farmerId = String(body.farmerId || "");
  const publicId = String(body.publicId || "");
  const kind = ["crop", "plant", "soil"].includes(body.kind) ? body.kind : "crop";
  const originalName = String(body.originalName || "image").trim().slice(0, 120);
  const result = await (await getDashboardUploadsCollection()).updateOne({ farmerId, publicId }, { $set: { kind, originalName } });
  if (!result.matchedCount) throw Object.assign(new Error("Uploaded image record not found."), { status: 404 });
}

async function deleteUpload(body) {
  const farmerId = String(body.farmerId || "");
  const publicId = String(body.publicId || "");
  const collection = await getDashboardUploadsCollection();
  const upload = await collection.findOne({ farmerId, publicId });
  if (!upload) throw Object.assign(new Error("Uploaded image record not found."), { status: 404 });
  await destroyCloudinaryAsset(publicId);
  await collection.deleteOne({ _id: upload._id });
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
    if (body.action === "create-farmer") return sendJson(res, 201, { ok: true, profile: await createFarmer(body) });
    if (body.action === "update-farmer") return sendJson(res, 200, { ok: true, profile: await updateFarmer(body) });
    if (body.action === "delete-farmer") return sendJson(res, 200, { ok: true, ...(await deleteFarmer(body.farmerId)) });
    if (body.action === "update-analysis") return sendJson(res, 200, { ok: true, updatedAt: (await updateAnalysis(body)).toISOString() });
    if (body.action === "delete-analysis") {
      await (await getDashboardAnalysesCollection()).deleteMany({ farmerId: String(body.farmerId || "") });
      return sendJson(res, 200, { ok: true });
    }
    if (body.action === "update-upload") {
      await updateUpload(body);
      return sendJson(res, 200, { ok: true });
    }
    if (body.action === "delete-upload") {
      await deleteUpload(body);
      return sendJson(res, 200, { ok: true });
    }
    return sendJson(res, 400, { error: "Invalid admin action." });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message });
  }
};
