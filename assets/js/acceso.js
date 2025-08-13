const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
  alert("Debes iniciar sesión para acceder a esta sección.");
  window.location.href = "/login";
}
