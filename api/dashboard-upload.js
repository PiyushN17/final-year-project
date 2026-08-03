const crypto = require("crypto");
const { ObjectId } = require("mongodb");
const { getDashboardUploadsCollection, getFarmersCollection, normalizeMobile } = require("./auth/_mongo");
const { handleOptions, readJson, requirePost, sendJson } = require("./_utils");

async function resolveFarmer(body = {}) {
  const farmerId = String(body.farmerId || "").trim();
  const mobile = normalizeMobile(body.mobile);
  const query = ObjectId.isValid(farmerId) ? { _id: new ObjectId(farmerId) } : { mobile };
  if (!query._id && !/^[6-9]\d{9}$/.test(mobile)) return null;
  const farmer = await (await getFarmersCollection()).findOne(query, { projection: { mobile: 1 } });
  if (!farmer || (mobile && farmer.mobile !== mobile)) return null;
  return { id: farmer._id.toString(), mobile: farmer.mobile };
}

function cloudinaryConfig() {
  const cloudinaryUrl = String(process.env.CLOUDINARY_URL || "").match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  const config = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || cloudinaryUrl?.[3],
    apiKey: process.env.CLOUDINARY_API_KEY || cloudinaryUrl?.[1],
    apiSecret: process.env.CLOUDINARY_API_SECRET || cloudinaryUrl?.[2]
  };
  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    throw new Error("Cloud image storage is not configured. Add CLOUDINARY_URL or all three CLOUDINARY_* variables in Vercel.");
  }
  return config;
}

function parseImage(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("Upload a JPEG, PNG, or WebP image.");
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > 3_000_000) throw new Error("The saved image must be smaller than 3 MB.");
  return { buffer, mimeType: match[1] };
}

async function uploadToCloudinary(dataUrl, farmerId, kind, originalName) {
  const config = cloudinaryConfig();
  const { buffer, mimeType } = parseImage(dataUrl);
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `krishigyaan/${farmerId}/${kind}`;
  const signature = crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${config.apiSecret}`).digest("hex");
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mimeType }), String(originalName || `${kind}.jpg`).slice(0, 120));
  form.append("api_key", config.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`, { method: "POST", body: form });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.secure_url || !data.public_id) throw new Error(data?.error?.message || "Image could not be saved to cloud storage.");
  return data;
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res) || !requirePost(req, res)) return;
  try {
    const body = await readJson(req);
    const farmer = await resolveFarmer(body);
    if (!farmer) return sendJson(res, 401, { error: "Please login again before uploading an image." });
    const kind = body.kind === "soil" ? "soil" : body.kind === "plant" ? "plant" : "crop";
    const uploaded = await uploadToCloudinary(body.image, farmer.id, kind, body.fileName);
    const record = {
      farmerId: farmer.id,
      farmerMobile: farmer.mobile,
      kind,
      originalName: String(body.fileName || "image").slice(0, 120),
      publicId: uploaded.public_id,
      assetId: uploaded.asset_id || "",
      secureUrl: uploaded.secure_url,
      format: uploaded.format || "",
      width: Number(uploaded.width) || 0,
      height: Number(uploaded.height) || 0,
      bytes: Number(uploaded.bytes) || 0,
      createdAt: new Date()
    };
    await (await getDashboardUploadsCollection()).updateOne({ publicId: record.publicId }, { $setOnInsert: record }, { upsert: true });
    return sendJson(res, 201, { ok: true, upload: { kind, url: record.secureUrl, publicId: record.publicId, createdAt: record.createdAt.toISOString() } });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message });
  }
};
