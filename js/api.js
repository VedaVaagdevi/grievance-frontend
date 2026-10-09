const API = "http://localhost:8080/api";
const $ = id => document.getElementById(id);

const CATEGORIES = { HOSTEL: "Hostel", CLASSROOM_LAB: "Classroom / Lab", TRANSPORT: "Transport",
  ELECTRICITY_WATER: "Electricity / Water", CLEANLINESS: "Cleanliness", MAINTENANCE: "Maintenance", OTHER: "Other" };
const DEPARTMENTS = ["Hostel Office", "Academic / Lab", "Transport Dept", "Electrical & Water",
  "Housekeeping", "Maintenance", "Administration"];
const CATEGORY_DEPT = { HOSTEL: "Hostel Office", CLASSROOM_LAB: "Academic / Lab", TRANSPORT: "Transport Dept",
  ELECTRICITY_WATER: "Electrical & Water", CLEANLINESS: "Housekeeping", MAINTENANCE: "Maintenance", OTHER: "Administration" };
const STATUS_LABEL = { SUBMITTED: "Submitted", ASSIGNED: "Assigned", IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved", REJECTED: "Rejected" };

const LOGO = `<svg viewBox="0 0 64 64" fill="none"><path d="M32 4 8 14v16c0 15 10 26 24 30 14-4 24-15 24-30V14L32 4z" fill="#fff" fill-opacity=".15" stroke="#fff" stroke-width="3"/><path d="M20 30l8 8 16-16" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function getUser() { return JSON.parse(sessionStorage.getItem("user") || "null"); }
function logout() { sessionStorage.clear(); location.href = "index.html"; }
function badge(s) { return `<span class="badge ${s}">${STATUS_LABEL[s] || s}</span>`; }
function fmt(d) { return new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); }

function toast(text, type = "ok") {
  let box = $("toast");
  if (!box) { box = document.createElement("div"); box.id = "toast"; document.body.appendChild(box); }
  const t = document.createElement("div");
  t.className = "toast " + (type === "error" ? "error" : "");
  t.textContent = text;
  box.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

const ALERT = { SUBMITTED: "blue", ASSIGNED: "purple", IN_PROGRESS: "amber", RESOLVED: "green", REJECTED: "red" };

function statusText(c) {
  const d = c.department || "the concerned department";
  return {
    SUBMITTED: "Your complaint has been received and is waiting to be assigned to a department.",
    ASSIGNED: `Your complaint has been assigned to ${d}. Work will begin shortly.`,
    IN_PROGRESS: `${d} is currently working on your complaint.`,
    RESOLVED: "Your complaint has been RESOLVED. Please read the remarks and share your feedback.",
    REJECTED: "Your complaint was rejected. Please read the admin remarks."
  }[c.status];
}

function statusAlert(c) { return `<div class="alert alert-${ALERT[c.status]}">${esc(statusText(c))}</div>`; }

function timeline(c) {
  if (c.status === "REJECTED") return `<div class="alert alert-red">Rejected on ${fmt(c.updatedAt)}.</div>`;
  const steps = [["SUBMITTED", c.createdAt], ["ASSIGNED", c.assignedAt], ["IN_PROGRESS", c.inProgressAt], ["RESOLVED", c.resolvedAt]];
  const idx = steps.findIndex(s => s[0] === c.status);
  return `<div class="steps">` + steps.map(([s, d], i) => `
    <div class="step ${i <= idx ? "done" : ""} ${i === idx ? "current" : ""}">
      <span>${i <= idx ? "✓" : i + 1}</span><label>${STATUS_LABEL[s]}</label>
      <small>${i <= idx ? (d ? fmt(d) : "") : "Pending"}</small></div>`).join("") + `</div>`;
}

function trackCard(c, forAdmin = false) {
  return `<div class="track-box">
    <p><b>${esc(c.code)}</b> - ${esc(c.title)} ${badge(c.status)}</p>
    <p><b>Raised by:</b> ${esc(c.user ? c.user.name : "-")} (${esc(c.user ? c.user.email : "")})</p>
    <p><b>Category:</b> ${esc(CATEGORIES[c.category] || c.category)}</p>
    <p><b>Description:</b> ${esc(c.description)}</p>
    ${timeline(c)}
    ${forAdmin ? "" : statusAlert(c)}
    <p><b>Department:</b> ${esc(c.department || "Not assigned yet")}</p>
    <p><b>Last updated:</b> ${fmt(c.updatedAt)}</p>
    <p><b>Admin remarks:</b> ${c.adminRemark ? `<span class="remark">${esc(c.adminRemark)}</span>` : "-"}</p></div>`;
}

async function api(path, method = "GET", body = null, authOverride = null) {
  const headers = { "Content-Type": "application/json" };
  const auth = authOverride || sessionStorage.getItem("auth");
  if (auth) headers["Authorization"] = auth;
  const res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : null });
  if (res.status === 401) {
    if (authOverride) throw new Error("Invalid email or password");
    logout(); throw new Error("Session expired");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.message) || "Request failed");
  return data;
}

function requireRole(role) {
  const u = getUser();
  if (!u || u.role !== role) logout();
  return u;
}