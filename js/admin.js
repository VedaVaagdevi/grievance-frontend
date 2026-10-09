requireRole("ADMIN");
$("logo").innerHTML = LOGO;

const STATUSES = Object.keys(STATUS_LABEL);
const COLORS = { SUBMITTED: "#64748b", ASSIGNED: "#7c3aed", IN_PROGRESS: "#d97706", RESOLVED: "#16a34a", REJECTED: "#dc2626" };
let all = [], shown = [], known = null, dirty = false;

$("fCat").innerHTML = `<option value="">All</option>` +
  Object.entries(CATEGORIES).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
$("fDept").innerHTML = `<option value="">All</option>` + DEPARTMENTS.map(d => `<option>${esc(d)}</option>`).join("") +
  `<option value="__NONE__">Unassigned</option>`;

const statusOptions = sel => STATUSES.map(s => `<option value="${s}" ${s === sel ? "selected" : ""}>${STATUS_LABEL[s]}</option>`).join("");
const deptOptions = sel => `<option value="">-- Assign department --</option>` +
  DEPARTMENTS.map(d => `<option ${d === sel ? "selected" : ""}>${esc(d)}</option>`).join("");

/* ---------- Load ---------- */
async function refresh(auto = false) {
  try {
    all = await api("/admin/complaints");
    detectNew();
    renderBanner();
    renderDepts();
    if (!(auto && dirty)) renderTable();   // do not wipe what the admin is typing
    report();
  } catch (err) {
    $("list").innerHTML = `<tr><td colspan="7" class="msg">${esc(err.message)}</td></tr>`;
  }
}

function detectNew() {
  if (known) {
    all.filter(c => !known.has(c.code)).forEach(c =>
      toast(`New complaint ${c.code} received (${c.department || "Unassigned"})`));
  }
  known = new Set(all.map(c => c.code));
}

function renderBanner() {
  const n = all.filter(c => c.status === "SUBMITTED").length;
  $("banner").innerHTML = n
    ? `<div class="alert alert-amber">🔔 <b>${n}</b> new complaint${n > 1 ? "s" : ""} awaiting action. Assign a department and start work.</div>`
    : `<div class="alert alert-green">All complaints have been attended to.</div>`;
}

function renderDepts() {
  $("deptGrid").innerHTML = [...DEPARTMENTS, "__NONE__"].map(n => {
    const rows = all.filter(c => n === "__NONE__" ? !c.department : c.department === n);
    const nw = rows.filter(c => c.status === "SUBMITTED").length;
    const work = rows.filter(c => c.status === "ASSIGNED" || c.status === "IN_PROGRESS").length;
    const done = rows.filter(c => c.status === "RESOLVED").length;
    return `<div class="dept" onclick="filterDept('${esc(n)}')">
      <h4>${n === "__NONE__" ? "Unassigned" : esc(n)}${nw ? `<span class="pill">${nw} new</span>` : ""}</h4>
      <div class="nums"><div><b>${rows.length}</b>Total</div><div><b>${work}</b>Working</div><div><b>${done}</b>Resolved</div></div></div>`;
  }).join("");
}

function filterDept(n) {
  $("fDept").value = n;
  renderTable();
  $("list").scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ---------- Table ---------- */
function filtered() {
  const q = $("fQuery").value.trim().toLowerCase();
  const st = $("fStatus").value, cat = $("fCat").value, dep = $("fDept").value;
  return all.filter(c =>
    (!st || c.status === st) && (!cat || c.category === cat) &&
    (!dep || (dep === "__NONE__" ? !c.department : c.department === dep)) &&
    (!q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) ||
      (c.user && c.user.name.toLowerCase().includes(q))));
}

function renderTable() {
  shown = filtered();
  $("count").textContent = `(${shown.length} of ${all.length})`;
  $("list").innerHTML = shown.map(c => `
    <tr>
      <td><b>${esc(c.code)}</b>${c.status === "SUBMITTED" ? `<span class="tag-new">NEW</span>` : ""}<br><span class="muted">${fmt(c.createdAt)}</span></td>
      <td><b>${esc(c.title)}</b><span class="desc">${esc(c.description)}</span>
          <span class="muted">${esc(CATEGORIES[c.category] || c.category)}</span>
          ${c.rating ? `<br><span style="color:#d97706">${"★".repeat(c.rating)}</span> <span class="muted">${esc(c.feedback || "")}</span>` : ""}</td>
      <td><b>${esc(c.user ? c.user.name : "-")}</b><br><span class="muted">${esc(c.user ? c.user.email : "")}</span></td>
      <td><select id="d${c.id}">${deptOptions(c.department)}</select></td>
      <td><select id="s${c.id}">${statusOptions(c.status)}</select>
          ${c.resolvedAt ? `<br><span class="muted">Resolved ${fmt(c.resolvedAt)}</span>` : ""}</td>
      <td><input id="r${c.id}" value="${esc(c.adminRemark || "")}" placeholder="Remarks for the user"></td>
      <td class="no-print"><div class="btn-col">
        <button class="btn btn-sm" onclick="save(${c.id})">Save</button>
        <button class="btn btn-sm btn-outline" onclick="quick(${c.id},'IN_PROGRESS')">Start Work</button>
        <button class="btn btn-sm btn-green" onclick="quick(${c.id},'RESOLVED')">Resolve</button></div></td>
    </tr>`).join("") || `<tr><td colspan="7" class="muted">No complaints found.</td></tr>`;
  dirty = false;
}

["fStatus", "fCat", "fDept"].forEach(id => $(id).onchange = renderTable);
$("fQuery").oninput = renderTable;
$("list").addEventListener("input", () => dirty = true);
$("list").addEventListener("change", () => dirty = true);

/* ---------- Actions ---------- */
async function save(id) {
  try {
    await api("/admin/complaints/" + id, "PUT", {
      status: $("s" + id).value, department: $("d" + id).value, remark: $("r" + id).value });
    toast("Complaint updated. The user will see it on their dashboard.");
    dirty = false;
    refresh();
  } catch (err) { toast(err.message, "error"); }
}

function quick(id, status) {
  if (!$("d" + id).value) { toast("Assign a department first", "error"); return; }
  $("s" + id).value = status;
  if (status === "RESOLVED" && !$("r" + id).value.trim()) {
    const m = prompt("Resolution remarks for the user:");
    if (m === null) return;
    $("r" + id).value = m;
  }
  save(id);
}

async function trackAdmin() {
  const code = $("aTrack").value.trim();
  if (!code) { toast("Enter a complaint ID", "error"); return; }
  try {
    const c = await api("/complaints/track/" + encodeURIComponent(code));
    $("aTrackResult").innerHTML = trackCard(c, true);
  } catch (err) { $("aTrackResult").innerHTML = `<p class="msg">${esc(err.message)}</p>`; }
}

/* ---------- Reports ---------- */
async function report() {
  try {
    const r = await api("/admin/reports");
    const bs = r.byStatus || {}, total = r.total || 0;

    $("stats").innerHTML = `
      <div class="stat"><b>${total}</b><span>Total</span></div>
      <div class="stat s-sub"><b>${bs.SUBMITTED || 0}</b><span>Submitted</span></div>
      <div class="stat s-asg"><b>${bs.ASSIGNED || 0}</b><span>Assigned</span></div>
      <div class="stat s-prog"><b>${bs.IN_PROGRESS || 0}</b><span>In Progress</span></div>
      <div class="stat s-res"><b>${bs.RESOLVED || 0}</b><span>Resolved</span></div>
      <div class="stat s-rej"><b>${bs.REJECTED || 0}</b><span>Rejected</span></div>`;

    let acc = 0; const parts = [];
    Object.entries(bs).forEach(([k, v]) => {
      const pct = total ? (v / total) * 100 : 0;
      parts.push(`${COLORS[k]} ${acc}% ${acc + pct}%`); acc += pct;
    });
    $("repStatus").innerHTML = `<div class="donut-wrap">
      <div class="donut" data-total="${total}" style="background:${parts.length ? `conic-gradient(${parts.join(",")})` : "#e2e8f0"}"></div>
      <div class="legend">${Object.entries(bs).map(([k, v]) =>
        `<div><span class="dot" style="background:${COLORS[k]}"></span>${STATUS_LABEL[k]}: <b>${v}</b></div>`).join("") || "<span class='muted'>No data yet</span>"}</div></div>`;

    const bc = r.byCategory || {};
    const max = Math.max(1, ...Object.values(bc));
    $("repCat").innerHTML = Object.entries(bc).map(([k, v]) =>
      `<div class="hbar">${esc(CATEGORIES[k] || k)} <b>(${v})</b><div class="track"><div class="fill" style="width:${(v / max) * 100}%"></div></div></div>`
    ).join("") || "<span class='muted'>No data yet</span>";
  } catch (err) { $("stats").innerHTML = `<span class="msg">${esc(err.message)}</span>`; }
}

function exportCSV() {
  const rows = [["Complaint ID", "Title", "Description", "Category", "Department", "Status", "Remarks", "Raised By", "Email", "Created", "Resolved"]];
  shown.forEach(c => rows.push([c.code, c.title, c.description, CATEGORIES[c.category] || c.category,
    c.department || "", STATUS_LABEL[c.status], c.adminRemark || "", c.user ? c.user.name : "", c.user ? c.user.email : "",
    fmt(c.createdAt), c.resolvedAt ? fmt(c.resolvedAt) : ""]));
  const csv = rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "complaints_report.csv";
  a.click();
}

refresh();
setInterval(() => refresh(true), 20000);   // auto refresh every 20 s