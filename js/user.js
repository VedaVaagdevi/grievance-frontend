
const me = requireLogin("USER");
$("logo").innerHTML = LOGO;
if (me) { $("uname").textContent = me.name; }
if (me) $("welcomeName").textContent = "Welcome, " + me.name;
$("logoutBtn").onclick = logout;

let complaints = [];

fillSelect($("cCategory"), CATEGORIES, "Select category");
fillSelect($("cDept"), DEPARTMENTS, "Select department");
$("fStatus").innerHTML = '<option value="">All statuses</option>' +
  STATUSES.map(s => '<option value="' + s + '">' + STATUS_LABEL[s] + "</option>").join("");

// ---------- Load and render ----------
async function load() {
  try {
    complaints = await api("/complaints/my") || [];
    render();
  } catch (err) {
    $("rows").innerHTML = '<tr><td colspan="7" class="empty">' + esc(err.message === "Failed to fetch"
      ? "Cannot reach the server. Is the backend running?" : err.message) + "</td></tr>";
  }
}

function render() {
  const total = complaints.length;
  const count = s => complaints.filter(c => c.status === s).length;
  $("stats").innerHTML =
    '<div class="stat"><b>' + total + "</b><span>Total complaints</span></div>" +
    '<div class="stat"><b>' + count("SUBMITTED") + "</b><span>Submitted</span></div>" +
    '<div class="stat"><b>' + (count("ASSIGNED") + count("IN_PROGRESS")) + "</b><span>In progress</span></div>" +
    '<div class="stat"><b>' + count("RESOLVED") + "</b><span>Resolved</span></div>";

  const q = $("q").value.trim().toLowerCase();
  const fs = $("fStatus").value;
  const list = complaints.filter(c =>
    (!fs || c.status === fs) &&
    (!q || String(c.id).includes(q) || (c.title || "").toLowerCase().includes(q)));

  $("rows").innerHTML = list.length ? list.map(c =>
    "<tr><td>#" + esc(c.id) + "</td><td>" + esc(c.title) + "</td><td>" + esc(c.category) + "</td><td>" +
    esc(c.department || "-") + "</td><td>" + badge(c.status) + "</td><td>" + fmtDate(c.createdAt) +
    '</td><td><button class="btn btn-light btn-sm" onclick="openDetail(' + Number(c.id) + ')">View</button></td></tr>'
  ).join("") : '<tr><td colspan="7" class="empty">No complaints found.</td></tr>';
}

$("q").oninput = render;
$("fStatus").onchange = render;

// ---------- Submit complaint ----------
$("cForm").onsubmit = async e => {
  e.preventDefault();
  $("cMsg").className = "msg";
  $("cMsg").textContent = "";

  try {
    const categoryMap = {
      "Hostel": "HOSTEL",
      "Classroom / Lab": "CLASSROOM_LAB",
      "Transport": "TRANSPORT",
      "Electricity / Water": "ELECTRICITY_WATER",
      "Cleanliness": "CLEANLINESS",
      "Maintenance": "MAINTENANCE",
      "Other": "OTHER"
    };

    const c = await api("/complaints", "POST", {
      title: $("cTitle").value.trim(),
      category: categoryMap[$("cCategory").value],
      department: $("cDept").value,
      description: $("cDesc").value.trim()
    });

    $("cForm").reset();
    $("cMsg").className = "ok";
    $("cMsg").textContent = "Complaint submitted." +
      (c && c.id ? " Your Complaint ID is #" + c.id + "." : "");
    load();
  } catch (err) {
    $("cMsg").textContent = err.message;
  }
};

// ---------- Voice input ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SR) {
  $("micBtn").style.display = "none";
} else {
  const rec = new SR();
  rec.lang = "en-IN";
  rec.interimResults = false;
  let listening = false;

  rec.onresult = e => {
    const said = e.results[0][0].transcript;
    $("cDesc").value = ($("cDesc").value ? $("cDesc").value + " " : "") + said;
  };

  rec.onend = () => {
    listening = false;
    $("micBtn").innerHTML = "&#127908; Speak";
  };

  rec.onerror = () => {
    listening = false;
    $("micBtn").innerHTML = "&#127908; Speak";
  };

  $("micBtn").onclick = () => {
    if (listening) {
      rec.stop();
      return;
    }
    listening = true;
    $("micBtn").innerHTML = "&#9209; Listening... (click to stop)";
    rec.start();
  };
}

// ---------- Detail, timeline and feedback ----------
function detailHTML(c) {
  let html = '<div class="detail"><h3>Complaint #' + esc(c.id) + " - " + esc(c.title) + "</h3>" +
    timelineHTML(c.status) +
    "<dl><dt>Status</dt><dd>" + badge(c.status) + "</dd>" +
    "<dt>Category</dt><dd>" + esc(c.category) + "</dd>" +
    "<dt>Department</dt><dd>" + esc(c.department || "Not assigned yet") + "</dd>" +
    "<dt>Submitted</dt><dd>" + fmtDate(c.createdAt) + "</dd>" +
    "<dt>Description</dt><dd>" + esc(c.description) + "</dd>" +
    "<dt>Admin remark</dt><dd>" + esc(c.remark || "No remarks yet") + "</dd>";

  if (c.feedbackRating) {
    html += "<dt>Your feedback</dt><dd>" +
      "&#9733;".repeat(c.feedbackRating) + " " + esc(c.feedbackComment || "") + "</dd>";
  }

  html += "</dl></div>";

  if (c.status === "RESOLVED" && !c.feedbackRating) {
    html += '<hr style="border:none;border-top:1px solid var(--line);margin:18px 0">' +
      "<h4>Rate the resolution</h4>" +
      '<select id="fbRating"><option value="5">5 - Excellent</option><option value="4">4 - Good</option>' +
      '<option value="3">3 - Average</option><option value="2">2 - Poor</option><option value="1">1 - Very poor</option></select>' +
      '<textarea id="fbComment" placeholder="Any comments? (optional)" style="margin-top:10px;min-height:70px"></textarea>' +
      '<button class="btn" onclick="sendFeedback(' + Number(c.id) + ')">Submit feedback</button>' +
      '<p id="fbMsg" class="msg"></p>';
  }

  return html;
}

function openDetail(id) {
  const c = complaints.find(x => x.id === id);
  if (!c) return;
  $("detailBody").innerHTML = detailHTML(c);
  $("detailModal").classList.remove("hidden");
}

function closeDetail() {
  $("detailModal").classList.add("hidden");
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeDetail();
});

async function sendFeedback(id) {
  try {
    await api("/complaints/" + id + "/feedback", "POST", {
      rating: Number($("fbRating").value),
      comment: $("fbComment").value.trim()
    });
    closeDetail();
    load();
  } catch (err) {
    $("fbMsg").textContent = err.message;
  }
}

// ---------- Track by ID ----------
$("trackBtn").onclick = async () => {
  const id = $("trackId").value;
  if (!id) return;

  try {
    const c = await api("/complaints/" + encodeURIComponent(id));
    $("trackOut").innerHTML = detailHTML(c).replace(/<hr[\s\S]*$/, "");
  } catch (err) {
    $("trackOut").innerHTML = '<p class="msg">' + esc(err.message) + "</p>";
  }
};

load();
