const me = requireRole("USER");
$("logo").innerHTML = LOGO;
if (me) { $("uname").textContent = me.name; $("uemail").textContent = me.email; }

$("cCategory").innerHTML = Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
$("cDept").innerHTML = `<option value="">Not sure - admin will decide</option>` +
  DEPARTMENTS.map(d => `<option>${esc(d)}</option>`).join("");
const suggestDept = () => { $("cDept").value = CATEGORY_DEPT[$("cCategory").value]; };
$("cCategory").onchange = suggestDept;
suggestDept();

let list = [], filter = "", tracked = "";
const SEEN_KEY = "seen_" + (me ? me.email : "");
const toasted = new Set();

/* ---------- Voice input ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, listening = false, baseText = "";

function toggleVoice() {
  if (!SR) { toast("Voice input needs Google Chrome or Microsoft Edge", "error"); return; }
  if (listening) { rec.stop(); return; }
  rec = new SR();
  rec.lang = $("voiceLang").value;
  rec.continuous = true;
  rec.interimResults = true;
  baseText = $("cDesc").value ? $("cDesc").value.trim() + " " : "";
  rec.onstart = () => { listening = true; $("micBtn").classList.add("on"); $("micText").textContent = "Listening... click to stop"; };
  rec.onresult = e => {
    let t = "";
    for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
    $("cDesc").value = baseText + t;
  };
  rec.onerror = e => toast("Voice error: " + e.error + (e.error === "not-allowed" ? " (allow microphone access)" : ""), "error");
  rec.onend = () => { listening = false; $("micBtn").classList.remove("on"); $("micText").textContent = "Speak your complaint"; };
  rec.start();
}

/* ---------- Load and render ---------- */
async function load() {
  try {
    list = await api("/complaints/my");
    renderStats();
    handleUpdates();
    renderTable();
  } catch (err) {
    $("list").innerHTML = `<tr><td colspan="7" class="msg">${esc(err.message)}</td></tr>`;
  }
}

function renderStats() {
  const n = s => list.filter(c => c.status === s).length;
  $("stTotal").textContent = list.length;
  $("stSub").textContent = n("SUBMITTED");
  $("stAsg").textContent = n("ASSIGNED");
  $("stProg").textContent = n("IN_PROGRESS");
  $("stRes").textContent = n("RESOLVED");
  $("stRej").textContent = n("REJECTED");
}

function setFilter(f) {
  filter = f;
  document.querySelectorAll(".stat[data-f]").forEach(el => el.classList.toggle("active", el.dataset.f === f));
  renderTable();
}

function renderTable() {
  const rows = filter ? list.filter(c => c.status === filter) : list;
  $("count").textContent = `(${rows.length})`;
  $("list").innerHTML = rows.map(c => `
    <tr>
      <td><b>${esc(c.code)}</b><br><span class="muted">${fmt(c.createdAt)}</span></td>
      <td><b>${esc(c.title)}</b><span class="desc">${esc(c.description)}</span></td>
      <td>${esc(CATEGORIES[c.category] || c.category)}</td>
      <td>${esc(c.department || "Awaiting assignment")}</td>
      <td>${badge(c.status)}${c.status === "RESOLVED" && c.resolvedAt ? `<br><span class="muted">on ${fmt(c.resolvedAt)}</span>` : ""}</td>
      <td>${c.adminRemark ? `<div class="remark">${esc(c.adminRemark)}</div>` : "-"}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="trackCode('${esc(c.code)}')">Track</button>
        ${c.rating ? `<div style="margin-top:6px;color:#d97706">${"★".repeat(c.rating)}${"☆".repeat(5 - c.rating)}</div><span class="muted">${esc(c.feedback || "")}</span>`
          : c.status === "RESOLVED" ? `<button class="btn btn-green btn-sm" style="margin-top:6px" onclick="giveFeedback(${c.id})">Give Feedback</button>` : ""}
      </td>
    </tr>`).join("") || `<tr><td colspan="7" class="muted">No complaints in this category.</td></tr>`;
}

/* ---------- Notifications for status changes ---------- */
function handleUpdates() {
  const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
  let changed = false;
  list.forEach(c => { if (!(c.code in seen)) { seen[c.code] = c.status; changed = true; } });
  if (changed) localStorage.setItem(SEEN_KEY, JSON.stringify(seen));

  const ups = list.filter(c => seen[c.code] !== c.status);
  ups.forEach(c => {
    const key = c.code + c.status;
    if (!toasted.has(key)) { toasted.add(key); toast(`${c.code} is now ${STATUS_LABEL[c.status]}`); }
  });

  $("updates").innerHTML = ups.length ? `<div class="card"><h2>🔔 Recent Updates
      <button class="btn btn-outline btn-sm" style="float:right" onclick="dismissUpdates()">Mark all as read</button></h2>` +
    ups.map(c => `<div class="alert alert-${ALERT[c.status]}"><b>${esc(c.code)}</b> - ${esc(c.title)}: now ${badge(c.status)}<br>
      ${esc(statusText(c))}${c.adminRemark ? `<br><i>Remarks: ${esc(c.adminRemark)}</i>` : ""}</div>`).join("") + `</div>` : "";
}

function dismissUpdates() {
  const seen = {};
  list.forEach(c => { seen[c.code] = c.status; });
  localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  handleUpdates();
}

/* ---------- Actions ---------- */
$("cForm").onsubmit = async e => {
  e.preventDefault();
  if (listening) rec.stop();
  try {
    const c = await api("/complaints", "POST", {
      title: $("cTitle").value, description: $("cDesc").value,
      category: $("cCategory").value, department: $("cDept").value });
    toast("Complaint submitted. Your ID: " + c.code);
    e.target.reset(); suggestDept();
    $("trackId").value = c.code;
    load();
  } catch (err) { toast(err.message, "error"); }
};

function trackCode(code) { $("trackId").value = code; track(); window.scrollTo({ top: 0, behavior: "smooth" }); }

async function track(silent = false) {
  const code = $("trackId").value.trim();
  if (!code) { if (!silent) toast("Enter a complaint ID", "error"); return; }
  try {
    const c = await api("/complaints/track/" + encodeURIComponent(code));
    tracked = c.code;
    $("trackResult").innerHTML = trackCard(c);
  } catch (err) { if (!silent) $("trackResult").innerHTML = `<p class="msg">${esc(err.message)}</p>`; }
}

async function giveFeedback(id) {
  const rating = parseInt(prompt("Rate the resolution (1 = poor, 5 = excellent):"), 10);
  if (!rating || rating < 1 || rating > 5) return;
  const comment = prompt("Any comments? (optional)") || "";
  try { await api(`/complaints/${id}/feedback`, "POST", { rating, comment }); toast("Thank you for your feedback"); load(); }
  catch (err) { toast(err.message, "error"); }
}

load();
setInterval(() => { load(); if (tracked) track(true); }, 15000);   // auto refresh every 15 s