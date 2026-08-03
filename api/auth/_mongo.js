const crypto = require("crypto");
const { MongoClient } = require("mongodb");

let client;
let farmersCollection;
let dashboardAnalysesCollection;
let dashboardUploadsCollection;

function sendJson(res, status, data) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(status).json(data);
}

function handleOptions(req, res) {
  if (req.method !== "OPTIONS") return false;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(204).end();
  return true;
}

function requirePost(req, res) {
  if (req.method === "POST") return true;
  sendJson(res, 405, { error: "Method not allowed" });
  return false;
}

async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

async function getFarmersCollection() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing");
  if (farmersCollection) return farmersCollection;
  client = client || new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "krishigyaan");
  farmersCollection = db.collection("farmers");
  await farmersCollection.createIndex({ mobile: 1 }, { unique: true });
  return farmersCollection;
}

async function getDashboardAnalysesCollection() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing");
  if (dashboardAnalysesCollection) return dashboardAnalysesCollection;
  client = client || new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "krishigyaan");
  dashboardAnalysesCollection = db.collection("dashboard_analyses");
  await dashboardAnalysesCollection.createIndex({ farmerId: 1 }, { unique: true });
  return dashboardAnalysesCollection;
}

async function getDashboardUploadsCollection() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing");
  if (dashboardUploadsCollection) return dashboardUploadsCollection;
  client = client || new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "krishigyaan");
  dashboardUploadsCollection = db.collection("dashboard_uploads");
  await dashboardUploadsCollection.createIndex({ farmerId: 1, createdAt: -1 });
  await dashboardUploadsCollection.createIndex({ publicId: 1 }, { unique: true });
  return dashboardUploadsCollection;
}

function normalizeMobile(value = "") {
  return String(value).replace(/\D/g, "").slice(-10);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function passwordMatches(password, stored = {}) {
  if (!password || !stored.salt || !stored.hash) return false;
  const incoming = hashPassword(password, stored.salt).hash;
  return crypto.timingSafeEqual(Buffer.from(incoming, "hex"), Buffer.from(stored.hash, "hex"));
}

function publicProfile(farmer = {}) {
  const { passwordHash, passwordSalt, _id, ...profile } = farmer;
  return { ...profile, id: _id?.toString?.() };
}

function cleanProfile(profile = {}) {
  const blocked = new Set(["password", "confirmPassword", "_id", "passwordHash", "passwordSalt"]);
  return Object.fromEntries(Object.entries(profile).filter(([key]) => !blocked.has(key)));
}

module.exports = {
  cleanProfile,
  getDashboardAnalysesCollection,
  getDashboardUploadsCollection,
  getFarmersCollection,
  handleOptions,
  hashPassword,
  normalizeMobile,
  passwordMatches,
  publicProfile,
  readJson,
  requirePost,
  sendJson
};
