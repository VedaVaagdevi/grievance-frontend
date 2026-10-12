const me = requireLogin("ADMIN");
$("logo").innerHTML = LOGO;
if (me) { $("uname").textContent = me.name; }
$("logoutBtn").onclick = logout;

let complaints = [];
let editing = null;

$("fStatus").innerHTML = '<option value="">All statuses</option>' +
  STATUSES.map(s => '<option value="' + s + '">' + STATUS_LABEL[s] + "</option>").join("");
fillSelect($("fDept"), DEPARTMENTS, "All departments");
fillSelect($("uDept"), DEPARTMENTS, "Select department");
$("uStatus").innerHTML = STATUSES.map(s => '<option value="' + s + '">' + STATUS_LABEL[s] + "</option>").join("");

// ---------- Load ----------
async function load() {
  try {
    complaints = await api("/admin/complaints") || [];
    render();
  } catch (err) {
    $("rows").innerHTML = '<tr><td colspan="8" class="empty">' + esc(err.message === "Failed to fetch"
      ? "Cannot reach the server. Is the backend running?" : err.message) + "</td></tr>";
  }
}

function filtered() {
  const q = $("q").value.trim().toLowerCase();
  const fs = $("fStatus").value, fd = $("fDept").value;
  return complaints.filter(c =>
    (!fs || c.status === fs) &&
    (!fd || c.department === fd) &&
    (!q || String(c.id).includes(q) || (c.title || "").toLowerCase().includes(q) ||
      ((c.userName || c.user || "") + "").toLowerCase().includes(q)));
}

function render() {
  const count = s => complaints.filter(c => c.status === s).length;
  $("stats").innerHTML =
    '<div class="stat"><b>' + complaints.length + "</b><span>Total</span></div>" +
    '<div class="stat"><b>' + count("SUBMITTED") + "</b><span>New (submitted)</span></div>" +
    '<div class="stat"><b>' + (count("ASSIGNED") + count("IN_PROGRESS")) + "</b><span>In progress</span></div>" +
    '<div class="stat"><b>' + count("RESOLVED") + "</b><span>Resolved</span></div>";

  const list = filtered();
  $("rows").innerHTML = list.length ? list.map(c =>
    "<tr><td>#" + esc(c.id) + "</td><td>" + esc(c.title) + "</td><td>" + esc(c.userName || c.user || "-") + "</td><td>" +
    esc(c.category) + "</td><td>" + esc(c.department || "-") + "</td><td>" + badge(c.status) + "</td><td>" +
    fmtDate(c.createdAt) + '</td><td class="no-print"><button class="btn btn-light btn-sm" onclick="openUpd(' +
    Number(c.id) + ')">Update</button></td></tr>'
  ).join("") : '<tr><td colspan="8" class="empty">No complaints found.</td></tr>';

  bars("chartStatus", STATUSES.map(s => [STATUS_LABEL[s], count(s)]));
  bars("chartCategory", CATEGORIES.map(k => [k, complaints.filter(c => c.category === k).length]));
  bars("chartDept", DEPARTMENTS.map(d => [d, complaints.filter(c => c.department === d).length]));
}

function bars(id, pairs) {
  const max = Math.max(1, ...pairs.map(p => p[1]));
  $(id).innerHTML = pairs.map(p =>
    '<div class="bar-row"><span>' + esc(p[0]) + '</span><div class="bar"><div style="width:' +
    Math.round(p[1] / max * 100) + '%"></div></div><b>' + p[1] + "</b></div>").join("");
}

["q"].forEach(id => $(id).oninput = render);
["fStatus", "fDept"].forEach(id => $(id).onchange = render);

// ---------- Update a complaint ----------
function openUpd(id) {
  editing = complaints.find(c => c.id === id);
  if (!editing) return;
  $("updTitle").textContent = "Update Complaint #" + editing.id;
  $("updInfo").innerHTML = "<dl><dt>Title</dt><dd>" + esc(editing.title) + "</dd><dt>User</dt><dd>" +
    esc(editing.userName || editing.user || "-") + "</dd><dt>Description</dt><dd>" + esc(editing.description) + "</dd></dl>";
  $("uDept").value = editing.department || "";
  $("uStatus").value = editing.status || "SUBMITTED";
  $("uRemark").value = editing.remark || "";
  $("uMsg").textContent = "";
  $("updModal").classList.remove("hidden");
}
function closeUpd() { $("updModal").classList.add("hidden"); editing = null; }
document.addEventListener("keydown", e => { if (e.key === "Escape") closeUpd(); });

$("updForm").onsubmit = async e => {
  e.preventDefault();
  if (!editing) return;
  try {
    await api("/admin/complaints/" + editing.id, "PUT", {
      department: $("uDept").value, status: $("uStatus").value, remark: $("uRemark").value.trim() });
    closeUpd();
    load();
  } catch (err) {
    $("uMsg").textContent = err.message;
  }
};

// ---------- CSV export and print ----------
$("csvBtn").onclick = () => {
  const cell = v => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  const head = ["ID", "Title", "User", "Category", "Department", "Status", "Remark", "Created"];
  const lines = [head.map(cell).join(",")].concat(filtered().map(c =>
    [c.id, c.title, c.userName || c.user, c.category, c.department, c.status, c.remark, c.createdAt].map(cell).join(",")));
  const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "complaints.csv";
  a.click();
  URL.revokeObjectURL(a.href);
};
$("printBtn").onclick = () => window.print();

load();