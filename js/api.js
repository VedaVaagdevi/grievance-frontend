// ===== Configuration =====
// Change this if your Spring Boot backend runs on a different address or has a context path.
const API_BASE = "http://localhost:8080/api";

const CATEGORIES = ["Hostel", "Classroom / Lab", "Transport", "Electricity / Water", "Cleanliness", "Maintenance", "Other"];
const DEPARTMENTS = ["Administration", "Hostel Office", "Academic Office", "Transport", "Electrical", "Housekeeping", "Maintenance"];
const STATUSES = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];
const STATUS_LABEL = { SUBMITTED: "Submitted", ASSIGNED: "Assigned", IN_PROGRESS: "In Progress", RESOLVED: "Resolved" };

// ===== Helpers =====
const $ = id => document.getElementById(id);

const LOGO = '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
  '<rect width="40" height="40" rx="10" fill="#fff"/>' +
  '<path d="M10 12h20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H18l-6 5v-5h-2a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2z" fill="#2563eb"/>' +
  '<path d="M14 19l4 4 8-8" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function fmtDate(d) {
  if (!d) return "-";
  const x = new Date(d);
  return isNaN(x) ? esc(d) : x.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function badge(status) {
  return '<span class="badge b-' + esc(status) + '">' + esc(STATUS_LABEL[status] || status) + "</span>";
}

function timelineHTML(status) {
  const idx = Math.max(0, STATUSES.indexOf(status));
  return '<div class="timeline">' + STATUSES.map((s, i) =>
    '<div class="t' + (i <= idx ? " done" : "") + '"><i>' + (i <= idx ? "&#10003;" : i + 1) + "</i><br>" + STATUS_LABEL[s] + "</div>").join("") + "</div>";
}

function fillSelect(el, items, firstLabel) {
  el.innerHTML = (firstLabel ? '<option value="">' + firstLabel + "</option>" : "") +
    items.map(i => '<option value="' + esc(i) + '">' + esc(i) + "</option>").join("");
}

// ===== API call =====
async function api(path, method = "GET", body = null, authOverride = null) {
  const headers = { "Content-Type": "application/json" };
  const auth = authOverride || sessionStorage.getItem("auth");
  if (auth) headers["Authorization"] = auth;

  const res = await fetch(API_BASE + path, { method, headers, body: body ? JSON.stringify(body) : null });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

  if (!res.ok) {
    if (res.status === 401 && !authOverride) { sessionStorage.clear(); location.href = "login.html"; }
    const msg = (data && data.message) || (data && data.error) || (typeof data === "string" && data) ||
      (res.status === 401 ? "Invalid email or password" : "Request failed (" + res.status + ")");
    throw new Error(msg);
  }
  return data;
}

// ===== Session =====
function requireLogin(role) {
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  if (!user || !sessionStorage.getItem("auth") || (role && user.role !== role)) {
    location.href = "login.html";
    return null;
  }
  return user;
}

function logout() {
  sessionStorage.clear();
  location.href = "index.html";
}