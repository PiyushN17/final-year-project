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

const editableProfileFields = [
  ["fullName", "Name"], ["mobile", "Mobile"], ["age", "Age"], ["gender", "Gender"],
  ["village", "Village"], ["district", "District"], ["state", "State"], ["language", "Language"],
  ["landSize", "Land"], ["ownership", "Ownership"], ["soilType", "Soil"], ["irrigation", "Irrigation"],
  ["primaryCrop", "Crop"], ["season", "Season"], ["sowingDate", "Sowing date"],
  ["fertilizer", "Fertilizer"], ["problem", "Recent problem"], ["harvest", "Expected harvest"],
  ["aadhaar", "Aadhaar last 4"], ["bank", "Bank linked"], ["pmkisan", "PM-KISAN"], ["internet", "Internet access"]
];

function renderProfile(profile = {}) {
  return `<div class="admin-profile-grid">${editableProfileFields.map(([key, label]) => `<label><span>${escapeAdminHtml(label)}</span><input data-profile-field="${key}" value="${escapeAdminHtml(profile[key] ?? "")}" /></label>`).join("")}
    <label><span>New password (optional)</span><input data-profile-password type="password" minlength="8" maxlength="32" autocomplete="new-password" /></label>
    <div class="admin-readonly"><span>Registered</span><strong>${escapeAdminHtml(formatDate(profile.createdAt))}</strong></div>
    <div class="admin-readonly"><span>Last login</span><strong>${escapeAdminHtml(formatDate(profile.lastLoginAt))}</strong></div></div>`;
}

function renderUploads(uploads = []) {
  if (!uploads.length) return `<p class="admin-empty-row">No crop or soil images have been uploaded.</p>`;
  return `<div class="admin-upload-grid">${uploads.map((upload) => {
    const safeUrl = /^https:\/\/res\.cloudinary\.com\//i.test(upload.secureUrl || "") ? upload.secureUrl : "";
    return `<article class="admin-upload-card" data-upload-public-id="${escapeAdminHtml(upload.publicId || "")}">${safeUrl ? `<img src="${escapeAdminHtml(safeUrl)}" alt="${escapeAdminHtml(upload.kind || "farm")} upload" loading="lazy" />` : ""}<div><label>Name<input data-upload-name value="${escapeAdminHtml(upload.originalName || "Image")}" /></label><label>Type<select data-upload-kind><option value="crop"${upload.kind === "crop" ? " selected" : ""}>Crop</option><option value="plant"${upload.kind === "plant" ? " selected" : ""}>Plant</option><option value="soil"${upload.kind === "soil" ? " selected" : ""}>Soil</option></select></label><span>${escapeAdminHtml(formatDate(upload.createdAt))}</span>${safeUrl ? `<a href="${escapeAdminHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">Open Cloudinary image</a>` : ""}<div class="admin-inline-actions"><button type="button" data-save-upload>Save</button><button class="danger" type="button" data-delete-upload>Delete</button></div></div></article>`;
  }).join("")}</div>`;
}

function renderFarmerDetail(data) {
  const detail = document.getElementById("adminFarmerDetail");
  const sections = data.analysis?.sections || {};
  detail.dataset.farmerId = data.profile.id;
  detail.innerHTML = `<div class="admin-detail-head"><div><p>Farmer data center</p><h2>${escapeAdminHtml(data.profile.fullName || "Farmer")}</h2><span>Last dashboard update: ${escapeAdminHtml(formatDate(data.analysis?.updatedAt))}</span></div><button class="danger" type="button" data-delete-farmer>Delete farmer</button></div>
    <p class="admin-action-note" id="adminActionNote" role="status"></p>
    <section class="admin-data-section"><div class="admin-section-heading"><h3>Registered profile</h3><button type="button" data-save-profile>Save profile</button></div>${renderProfile(data.profile)}</section>
    <section class="admin-data-section"><h3>Uploaded images</h3>${renderUploads(data.uploads)}</section>
    ${adminSections.map((section, index) => {
      const content = section.keys.map((key) => sections[key] || "").filter(Boolean).join("<hr>");
      return `<section class="admin-data-section"><h3>${index + 1}. ${escapeAdminHtml(section.title)}</h3><div class="admin-saved-result">${content ? sanitizeSavedHtml(content) : `<p class="admin-empty-row">No saved result yet.</p>`}</div>${section.keys.map((key) => `<label class="admin-analysis-editor"><span>Edit ${escapeAdminHtml(key)}</span><textarea data-analysis-field="${key}">${escapeAdminHtml(sections[key] || "")}</textarea></label>`).join("")}</section>`;
    }).join("")}<div class="admin-bottom-actions"><button type="button" data-save-analysis>Save dashboard data</button><button class="danger" type="button" data-delete-analysis>Delete saved dashboard data</button></div>`;
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
  let activeFarmerId = "";

  function showActionNote(message, isError = false) {
    const note = document.getElementById("adminActionNote");
    if (!note) return;
    note.textContent = message;
    note.classList.toggle("error", isError);
  }

  async function loadUsers(preferredFarmerId = activeFarmerId) {
    const data = await adminRequest({ action: "users" });
    users = data.users || [];
    userCount.textContent = `${users.length} registered farmer${users.length === 1 ? "" : "s"}`;
    renderUsers(search?.value || "");
    const preferred = preferredFarmerId && userList.querySelector(`[data-farmer-id="${CSS.escape(preferredFarmerId)}"]`);
    (preferred || userList.querySelector("[data-farmer-id]"))?.click();
  }

  async function openFarmer(farmerId, button) {
    activeFarmerId = farmerId;
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

  loadUsers().catch((error) => {
    userCount.textContent = error.message;
  });

  document.getElementById("adminFarmerDetail")?.addEventListener("click", async (event) => {
    const button = event.target.closest("button");
    if (!button || !activeFarmerId) return;
    try {
      if (button.matches("[data-save-profile]")) {
        const profile = Object.fromEntries([...document.querySelectorAll("[data-profile-field]")].map((input) => [input.dataset.profileField, input.value]));
        const password = document.querySelector("[data-profile-password]")?.value || "";
        await adminRequest({ action: "update-farmer", farmerId: activeFarmerId, profile, password });
        showActionNote("Profile saved.");
        await loadUsers(activeFarmerId);
      }
      if (button.matches("[data-delete-farmer]") && confirm("Delete this farmer, all saved analysis, and all uploaded images? This cannot be undone.")) {
        const result = await adminRequest({ action: "delete-farmer", farmerId: activeFarmerId });
        activeFarmerId = "";
        await loadUsers();
        if (result.cloudDeleteFailures) alert(`${result.cloudDeleteFailures} cloud image could not be removed, but the user data was deleted.`);
      }
      if (button.matches("[data-save-analysis]")) {
        const sections = Object.fromEntries([...document.querySelectorAll("[data-analysis-field]")].map((input) => [input.dataset.analysisField, input.value]));
        await adminRequest({ action: "update-analysis", farmerId: activeFarmerId, sections });
        showActionNote("Dashboard data saved.");
      }
      if (button.matches("[data-delete-analysis]") && confirm("Delete all saved dashboard analysis for this farmer?")) {
        await adminRequest({ action: "delete-analysis", farmerId: activeFarmerId });
        await openFarmer(activeFarmerId, document.querySelector(`[data-farmer-id="${CSS.escape(activeFarmerId)}"]`));
      }
      const card = button.closest("[data-upload-public-id]");
      if (card && button.matches("[data-save-upload]")) {
        await adminRequest({ action: "update-upload", farmerId: activeFarmerId, publicId: card.dataset.uploadPublicId, originalName: card.querySelector("[data-upload-name]").value, kind: card.querySelector("[data-upload-kind]").value });
        showActionNote("Image details saved.");
      }
      if (card && button.matches("[data-delete-upload]") && confirm("Delete this image from Cloudinary and the dashboard record?")) {
        await adminRequest({ action: "delete-upload", farmerId: activeFarmerId, publicId: card.dataset.uploadPublicId });
        await openFarmer(activeFarmerId, document.querySelector(`[data-farmer-id="${CSS.escape(activeFarmerId)}"]`));
      }
    } catch (error) {
      showActionNote(error.message, true);
    }
  });

  document.getElementById("adminCreateUserBtn")?.addEventListener("click", () => {
    activeFarmerId = "";
    document.querySelectorAll(".admin-user-button").forEach((item) => item.classList.remove("active"));
    document.getElementById("adminFarmerDetail").innerHTML = `<form class="admin-create-form" id="adminCreateForm"><h2>Add farmer</h2><label>Name<input name="fullName" required maxlength="60" /></label><label>Mobile<input name="mobile" required inputmode="numeric" maxlength="10" /></label><label>Temporary password<input name="password" required type="password" minlength="8" maxlength="32" /></label><button type="submit">Create farmer</button><p class="admin-action-note" role="status"></p></form>`;
    document.getElementById("adminCreateForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      const note = event.currentTarget.querySelector("[role=status]");
      try {
        const result = await adminRequest({ action: "create-farmer", profile: { fullName: values.fullName, mobile: values.mobile }, password: values.password });
        activeFarmerId = result.profile.id;
        await loadUsers(activeFarmerId);
      } catch (error) {
        note.textContent = error.message;
        note.classList.add("error");
      }
    });
  });
  search?.addEventListener("input", () => renderUsers(search.value));
  document.getElementById("adminLogoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem(adminTokenKey);
    window.location.href = "admin-login.html";
  });
}
