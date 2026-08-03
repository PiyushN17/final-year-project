const adminPage = document.body?.dataset.page || "";
const adminTokenKey = "krishigyaanAdminToken";

function adminApiUrl(path) {
  if (window.location.protocol === "http:" || window.location.protocol === "https:") return path;
  return `http://127.0.0.1:5173${path}`;
}

function escapeAdminHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function adminRequest(payload, token = sessionStorage.getItem(adminTokenKey) || "") {
  const response = await fetch(adminApiUrl("/api/admin"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && payload.action !== "login") {
      sessionStorage.removeItem(adminTokenKey);
      window.location.replace("admin-login.html");
    }
    throw new Error(data.error || "Admin request failed.");
  }
  return data;
}

function sanitizeSavedHtml(html = "") {
  const template = document.createElement("template");
  template.innerHTML = String(html);
  template.content.querySelectorAll("script, style, iframe, object, embed, form, meta, link").forEach((node) => node.remove());
  template.content.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith("on") || name === "srcdoc" || ((name === "href" || name === "src") && value.startsWith("javascript:"))) node.removeAttribute(attribute.name);
    });
  });
  return template.innerHTML;
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString("en-IN");
}

const adminSections = [
  { title: "10-day field action plan", keys: ["cropAdvice"] },
  { title: "10-day weather and sowing guidance", keys: ["weatherResult", "longTermResult"] },
  { title: "Crop and Plant Disease Detection", keys: ["cropResult"] },
  { title: "Sahayata Scheme Support", keys: ["schemeMatcher"] },
  { title: "Scheme doubts and application drafts", keys: ["schemeAssistantResult"] },
  { title: "Soil Health Check", keys: ["soilResult"] },
  { title: "KrishiBaba", keys: ["chatAnswer"] }
];

function renderProfile(profile = {}) {
  const fields = [
    ["Name", profile.fullName], ["Mobile", profile.mobile], ["Age", profile.age], ["Gender", profile.gender],
    ["Village", profile.village], ["District", profile.district], ["State", profile.state], ["Language", profile.language],
    ["Land", profile.landSize], ["Ownership", profile.ownership], ["Soil", profile.soilType], ["Irrigation", profile.irrigation],
    ["Crop", profile.primaryCrop], ["Season", profile.season], ["Bank linked", profile.bank], ["PM-KISAN", profile.pmkisan],
    ["Registered", formatDate(profile.createdAt)], ["Last login", formatDate(profile.lastLoginAt)]
  ];
  return `<dl class="admin-profile-grid">${fields.map(([label, value]) => `<div><dt>${escapeAdminHtml(label)}</dt><dd>${escapeAdminHtml(value || "Not provided")}</dd></div>`).join("")}</dl>`;
}

function renderUploads(uploads = []) {
  if (!uploads.length) return `<p class="admin-empty-row">No crop or soil images have been uploaded.</p>`;
  return `<div class="admin-upload-grid">${uploads.map((upload) => {
    const safeUrl = /^https:\/\/res\.cloudinary\.com\//i.test(upload.secureUrl || "") ? upload.secureUrl : "";
    return `<article class="admin-upload-card">${safeUrl ? `<img src="${escapeAdminHtml(safeUrl)}" alt="${escapeAdminHtml(upload.kind || "farm")} upload" loading="lazy" />` : ""}<div><strong>${escapeAdminHtml(upload.kind || "Image")}</strong><span>${escapeAdminHtml(upload.originalName || "Image")}</span><span>${escapeAdminHtml(formatDate(upload.createdAt))}</span>${safeUrl ? `<a href="${escapeAdminHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">Open Cloudinary image</a>` : ""}</div></article>`;
  }).join("")}</div>`;
}

function renderFarmerDetail(data) {
  const detail = document.getElementById("adminFarmerDetail");
  const sections = data.analysis?.sections || {};
  detail.innerHTML = `<div class="admin-detail-head"><div><p>Farmer data center</p><h2>${escapeAdminHtml(data.profile.fullName || "Farmer")}</h2><span>Last dashboard update: ${escapeAdminHtml(formatDate(data.analysis?.updatedAt))}</span></div></div>
    <section class="admin-data-section"><h3>Registered profile</h3>${renderProfile(data.profile)}</section>
    <section class="admin-data-section"><h3>Uploaded images</h3>${renderUploads(data.uploads)}</section>
    ${adminSections.map((section, index) => {
      const content = section.keys.map((key) => sections[key] || "").filter(Boolean).join("<hr>");
      return `<section class="admin-data-section"><h3>${index + 1}. ${escapeAdminHtml(section.title)}</h3><div class="admin-saved-result">${content ? sanitizeSavedHtml(content) : `<p class="admin-empty-row">No saved result yet.</p>`}</div></section>`;
    }).join("")}`;
}

if (adminPage === "admin-login") {
  if (sessionStorage.getItem(adminTokenKey)) window.location.replace("admin-dashboard.html");
  const form = document.getElementById("adminLoginForm");
  const note = document.getElementById("adminLoginNote");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const values = Object.fromEntries(new FormData(form).entries());
    button.disabled = true;
    note.textContent = "Checking login...";
    try {
      const data = await adminRequest({ action: "login", username: values.username, password: values.password }, "");
      sessionStorage.setItem(adminTokenKey, data.token);
      window.location.href = "admin-dashboard.html";
    } catch (error) {
      note.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
}

if (adminPage === "admin-dashboard") {
  if (!sessionStorage.getItem(adminTokenKey)) window.location.replace("admin-login.html");
  const userList = document.getElementById("adminUserList");
  const userCount = document.getElementById("adminUserCount");
  const search = document.getElementById("adminUserSearch");
  let users = [];

  async function openFarmer(farmerId, button) {
    document.querySelectorAll(".admin-user-button").forEach((item) => item.classList.toggle("active", item === button));
    document.getElementById("adminFarmerDetail").innerHTML = `<div class="admin-empty">Loading farmer data...</div>`;
    try {
      renderFarmerDetail(await adminRequest({ action: "farmer", farmerId }));
    } catch (error) {
      document.getElementById("adminFarmerDetail").innerHTML = `<div class="admin-empty">${escapeAdminHtml(error.message)}</div>`;
    }
  }

  function renderUsers(query = "") {
    const value = query.trim().toLowerCase();
    const filtered = users.filter((user) => `${user.fullName || ""} ${user.mobile || ""} ${user.village || ""} ${user.district || ""}`.toLowerCase().includes(value));
    userList.innerHTML = filtered.length ? filtered.map((user) => `<button class="admin-user-button" data-farmer-id="${escapeAdminHtml(user.id)}"><strong>${escapeAdminHtml(user.fullName || "Farmer")}</strong><span>${escapeAdminHtml(user.mobile || "No mobile")}</span><small>${Number(user.uploadCount) || 0} images · ${user.analysisUpdatedAt ? "data saved" : "no saved data"}</small></button>`).join("") : `<p class="admin-empty-row">No farmers found.</p>`;
    userList.querySelectorAll("[data-farmer-id]").forEach((button) => button.addEventListener("click", () => openFarmer(button.dataset.farmerId, button)));
  }

  adminRequest({ action: "users" }).then((data) => {
    users = data.users || [];
    userCount.textContent = `${users.length} registered farmer${users.length === 1 ? "" : "s"}`;
    renderUsers();
    userList.querySelector("[data-farmer-id]")?.click();
  }).catch((error) => {
    userCount.textContent = error.message;
  });
  search?.addEventListener("input", () => renderUsers(search.value));
  document.getElementById("adminLogoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem(adminTokenKey);
    window.location.href = "admin-login.html";
  });
}
