const usuarios = [
  { usuario: "cliente01", contrasena: "1234", rol: "cliente" },
  { usuario: "admin01", contrasena: "admin123", rol: "admin" },
  { usuario: "abogado01", contrasena: "lex456", rol: "abogado" }
];

function login(event) {
  event.preventDefault();
  const u = document.getElementById("user").value.trim();
  const p = document.getElementById("pass").value.trim();

  const match = usuarios.find(x => x.usuario === u && x.contrasena === p);

  if (match) {
    localStorage.setItem("usuario", JSON.stringify(match));

    switch (match.rol) {
      case "admin":
        window.location.href = "dashboard-admin.html";
        break;
      case "abogado":
        window.location.href = "dashboard-abogado.html";
        break;
      default:
        window.location.href = "index.html";
    }
  } else {
    alert("Credenciales incorrectas.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', login);
  }
});
