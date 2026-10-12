function showForm(isRegister) {
  $("loginForm").classList.toggle("hidden", isRegister);
  $("regForm").classList.toggle("hidden", !isRegister);
  $("tabLogin").classList.toggle("active", !isRegister);
  $("tabReg").classList.toggle("active", isRegister);
  $("msg").textContent = "";
}

$("tabLogin").onclick = () => showForm(false);
$("tabReg").onclick = () => showForm(true);

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

$("regForm").onsubmit = async e => {
  e.preventDefault();
  try {
    await api("/auth/register", "POST", {
      name: $("rName").value,
      email: $("rEmail").value,
      password: $("rPass").value
    });
    showForm(false);
    $("msg").className = "ok";
    $("msg").textContent = "Registered! Please login.";
  } catch (err) {
    $("msg").className = "msg";
    $("msg").textContent = err.message;
  }
};