function cerrarSesion() {
  localStorage.removeItem("usuario");
  window.location.href = "/";
}

const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario || usuario.rol !== "abogado") {
  alert("Acceso no autorizado");
  window.location.href = "/login";
}

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', cerrarSesion);
  }
});
