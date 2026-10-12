$("logo").innerHTML = LOGO;

// Show a success note after coming from the register page
if (new URLSearchParams(location.search).get("registered")) {
  $("msg").className = "ok";
  $("msg").textContent = "Registered successfully! Please login.";
}

$("loginForm").onsubmit = async e => {
  e.preventDefault();
  const auth = "Basic " + btoa($("lEmail").value + ":" + $("lPass").value);
  try {
    const user = await api("/auth/me", "GET", null, auth);
    sessionStorage.setItem("auth", auth);
    sessionStorage.setItem("user", JSON.stringify(user));
    location.href = user.role === "ADMIN" ? "admin-dashboard.html" : "user-dashboard.html";
  } catch (err) {
    $("msg").className = "msg";
    $("msg").textContent = err.message === "Failed to fetch"
      ? "Cannot reach the server. Is the backend running?" : err.message;
  }
};