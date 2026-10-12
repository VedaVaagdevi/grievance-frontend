$("logo").innerHTML = LOGO;

$("regForm").onsubmit = async e => {
  e.preventDefault();
  try {
    await api("/auth/register", "POST", {
      name: $("rName").value, email: $("rEmail").value, password: $("rPass").value });
    location.href = "login.html?registered=1";
  } catch (err) {
    $("msg").className = "msg";
    $("msg").textContent = err.message === "Failed to fetch"
      ? "Cannot reach the server. Is the backend running?" : err.message;
  }
};